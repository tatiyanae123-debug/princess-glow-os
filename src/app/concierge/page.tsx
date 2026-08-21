import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getAiProposals } from '@/lib/data/completion-v1';
import { buildPersonalContext } from '@/lib/intelligence/context';
import { getNotesByUser } from '@/lib/data/notes';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { createConciergeProposalAction, decideConciergeProposalAction, reverseConciergeProposalAction } from '@/app/actions/concierge';
import { BrainCircuit, CalendarDays, Check, Clock3, FileUp, NotebookPen, RotateCcw, Search, X } from 'lucide-react';
import { ImmersiveRoomChrome, ImmersiveTopControls, OpenGlowCommand, QuickAddGlow } from '@/components/immersive/immersive-room-chrome';

export const dynamic = 'force-dynamic';
const BG = 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=2200&q=92';
const PEARL = 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=700&q=88';

type Payload = Record<string, unknown> & { execution?: { entityId?: string; reversedAt?: string } };
const payloadOf = (value: unknown) => value && typeof value === 'object' ? value as Payload : {};
function when(date: Date) {
  const ms = date.getTime() - Date.now();
  const hours = Math.round(ms / 3_600_000);
  if (hours >= 0 && hours < 24) return hours === 0 ? 'Soon' : `In ${hours}h`;
  const days = Math.round(ms / 86_400_000);
  return days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
const ask = (query: string) => `/search?q=${encodeURIComponent(query)}&from=${encodeURIComponent('/concierge')}`;

export default async function ConciergePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const name = session.user.name?.split(' ')[0] ?? 'Tatiyana';
  const [proposals, context, notes, events] = await Promise.all([
    getAiProposals(userId),
    buildPersonalContext(userId).catch(() => null),
    getNotesByUser(userId),
    getCalendarEventsByUser(userId),
  ]);
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const pending = proposals.filter((proposal) => proposal.status === 'pending').slice(0, 5);
  const recent = proposals.filter((proposal) => proposal.status !== 'pending').slice(0, 4);
  const upcomingEvents = events.filter((event) => event.startAt.getTime() >= Date.now()).sort((a, b) => a.startAt.getTime() - b.startAt.getTime()).slice(0, 2);
  const suggestions: string[] = [];
  if (context?.recommendations?.[0]?.title) suggestions.push(context.recommendations[0].title);
  if (upcomingEvents[0]) suggestions.push(`${upcomingEvents[0].title} · ${when(upcomingEvents[0].startAt)}`);
  if (context?.attentionSignals?.[0]?.label) suggestions.push(context.attentionSignals[0].label);
  if (sortedNotes[0]?.title) suggestions.push(`Continue ${sortedNotes[0].title}`);
  if (!suggestions.length) suggestions.push('Glow suggestions will appear as your real data creates useful signals.');

  return (
    <AppShell>
      <div className="ir-world concierge-world">
        <Image className="ir-backdrop" src={BG} alt="Pearl floral concierge environment" width={2200} height={1500} priority sizes="100vw" data-glow-image-key="concierge-background" />
        <ImmersiveRoomChrome name={name} image={session.user.image} />
        <ImmersiveTopControls />
        <main className="concierge-main">
          <header className="concierge-title"><span>✧</span><h1>Glow Concierge</h1><p>Your intelligent assistant.</p><i /></header>
          <section className="concierge-console ir-glass">
            <div className="concierge-hello"><h2>Hello, {name}.</h2><p>How can I help you today?</p></div>
            <OpenGlowCommand label="Ask me anything..." />
            <div className="concierge-popular"><span>✧ Popular Actions</span><div><Link href={ask('Plan my day using my real tasks and calendar')}>Plan my day</Link><Link href={ask('Find a realistic time for me to work out')}>Find time to work out</Link><Link href="/work/interviews">Prep for interview</Link><Link href={ask('Build a grocery list from my real food plans and notes')}>Grocery list</Link></div></div>
            <div className="concierge-capabilities"><Link href="/brain"><span><BrainCircuit /></span><strong>Open Brain</strong><small>Get insights</small></Link><Link href="/memory"><span><Search /></span><strong>Search Memory</strong><small>Find anything</small></Link><div className="concierge-task-card"><span><NotebookPen /></span><strong>Create Task</strong><small>Add to your list</small><QuickAddGlow module="task" label="Create task" /></div><Link href="/intake"><span><FileUp /></span><strong>Import Info</strong><small>From anywhere</small></Link></div>
          </section>
          <section className="concierge-suggestions ir-glass"><div className="concierge-strip-title">✧ Glow Suggestions</div><div className="concierge-suggestion-grid">{suggestions.slice(0, 3).map((suggestion, index) => <article key={`${suggestion}-${index}`}><Image src={index % 2 ? BG : PEARL} alt="" width={700} height={700} sizes="220px" data-glow-image-key={`concierge-suggestion-${index}`} /><p>{suggestion}</p></article>)}</div></section>
          <nav className="concierge-dock ir-glass"><Link href="/search"><span><Search /></span><small>Ask Glow</small></Link><Link href="/calendar"><span><CalendarDays /></span><small>Calendar</small></Link><Link href="/search" className="center"><span>✦</span><small>Glow</small></Link><Link href="/notes"><span><NotebookPen /></span><small>Notes</small></Link><Link href="/reminders"><span><Clock3 /></span><small>Reminders</small></Link></nav>
        </main>
        <details id="concierge-history" className="concierge-history ir-glass">
          <summary aria-label="Open Concierge requests"><Clock3 size={15} /><span>Requests</span><b>{pending.length}</b></summary>
          <div>
            <form action={createConciergeProposalAction} className="concierge-new-request"><input type="hidden" name="actionType" value="advisory" /><input name="intent" required placeholder="Request title" /><textarea name="summary" required rows={2} placeholder="What should Glow help with?" /><textarea name="reason" required rows={2} placeholder="Why does this matter?" /><button>Save request</button></form>
            {pending.length ? pending.map((proposal) => <article key={proposal.id}><div><strong>{proposal.summary}</strong><small>{proposal.reason}</small></div><div><form action={decideConciergeProposalAction.bind(null, proposal.id, 'approved')}><button aria-label="Approve"><Check size={11} /></button></form><form action={decideConciergeProposalAction.bind(null, proposal.id, 'rejected')}><button aria-label="Reject"><X size={11} /></button></form></div></article>) : <p className="ir-empty">No pending requests.</p>}
            {recent.map((proposal) => { const payload = payloadOf(proposal.payload); const canReverse = proposal.status === 'approved' && proposal.reversible && payload.execution?.entityId && !payload.execution.reversedAt; return <article key={proposal.id}><div><strong>{proposal.summary}</strong><small>{proposal.status}</small></div>{canReverse ? <form action={reverseConciergeProposalAction.bind(null, proposal.id)}><button aria-label="Undo"><RotateCcw size={11} /></button></form> : null}</article>; })}
          </div>
        </details>
      </div>
    </AppShell>
  );
}
