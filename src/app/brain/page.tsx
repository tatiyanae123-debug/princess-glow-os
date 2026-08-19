import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { buildPersonalContext } from '@/lib/intelligence/context';
import { buildBrainConnections, buildBrainMapDomains } from '@/lib/intelligence/brain-connections';
import { getNotesByUser } from '@/lib/data/notes';
import { ArrowRight, Search, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

function recencyLabel(date: Date | null) {
  if (!date) return 'No recent activity';
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return `${days} days ago`;
}

export default async function BrainPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const askedQuery = (await searchParams)?.q?.trim() ?? '';

  const [context, connections, domains, notes] = await Promise.all([
    buildPersonalContext(userId).catch(() => null),
    buildBrainConnections(userId),
    buildBrainMapDomains(userId),
    getNotesByUser(userId),
  ]);

  const recentNotes = [...notes].sort((a,b)=>b.updatedAt.getTime()-a.updatedAt.getTime());
  const focused = [...domains].filter(d=>d.count>0).sort((a,b)=>b.count-a.count);
  const recentConnections = connections.types.flatMap(type=>type.instances).sort((a,b)=>(b.occurredAt?.getTime()??0)-(a.occurredAt?.getTime()??0));
  const focusScore = context?.focusScore ?? 0;
  const currentContext = focused[0]?.label ?? 'What matters now';
  const question = askedQuery || (recentNotes[0]?.title ? `Keep exploring ${recentNotes[0].title}` : 'Ask Glow anything');
  const decision = focused[1]?.label ?? 'Make better choices';
  const pattern = focused.length ? `${focused[0].label} is your strongest current focus` : 'Glow will learn from your rooms';
  const observation = recentConnections[0]?.title ?? 'Key insights';
  const memory = recentNotes[0]?.title ?? 'Your knowledge';
  const recommendation = focusScore >= 70 ? 'Protect your strongest focus window' : 'Reduce competing priorities';
  const journal = recentNotes[1]?.title ?? 'Your reflections';
  const wellness = context?.wellness?.entry ?? null;
  const insights = [
    ['Your energy is highest', wellness?.energy ? `Energy: ${String(wellness.energy)}` : 'Log wellness to deepen this insight'],
    ['Your schedule is busiest', `${context?.calendar?.today?.length ?? 0} events today`],
    ['Your sleep pattern', wellness?.sleepHours != null ? `${wellness.sleepHours}h last logged` : 'Sleep data will appear here'],
    ["You haven't updated", recentNotes[0] ? `${recencyLabel(recentNotes[0].updatedAt)} · ${recentNotes[0].title}` : 'Capture a note to start'],
  ];

  return <AppShell><div className="batch2-page space-y-4">
    <header className="flex items-start justify-between gap-4">
      <div><p className="batch2-kicker">1. Brain</p><h1 className="batch2-title mt-3">Brain</h1><p className="batch2-subtitle">Your personal intelligence chamber.</p></div>
      <Link href="/search" className="batch2-btn"><Sparkles size={11}/>Ask Glow <ArrowRight size={10}/></Link>
    </header>

    {askedQuery ? <div className="batch2-card flex items-center justify-between gap-3 px-4 py-3 text-[9.5px]"><span>Glow is searching for “{askedQuery}”.</span><Link href={`/search?q=${encodeURIComponent(askedQuery)}`} className="text-[#b65369]">See all matching results →</Link></div>:null}

    <section className="batch2-brain-stage">
      <div className="batch2-brain-stack">
        <div className="batch2-row"><p className="text-[8px] font-semibold">Current Context</p><p className="batch2-mini mt-1">{currentContext}</p></div>
        <div className="batch2-row"><p className="text-[8px] font-semibold">Questions</p><p className="batch2-mini mt-1">{question}</p></div>
        <div className="batch2-row"><p className="text-[8px] font-semibold">Decisions</p><p className="batch2-mini mt-1">{decision}</p></div>
        <div className="batch2-row"><p className="text-[8px] font-semibold">Patterns</p><p className="batch2-mini mt-1">{pattern}</p></div>
      </div>
      <div className="batch2-brain-orb" aria-label="Glow intelligence visualization"/>
      <div className="batch2-brain-stack">
        <Link href="/observations" className="batch2-row block"><p className="text-[8px] font-semibold">Observations</p><p className="batch2-mini mt-1">{observation}</p></Link>
        <Link href="/memory" className="batch2-row block"><p className="text-[8px] font-semibold">Memory</p><p className="batch2-mini mt-1">{memory}</p></Link>
        <Link href="/concierge" className="batch2-row block"><p className="text-[8px] font-semibold">Recommendations</p><p className="batch2-mini mt-1">{recommendation}</p></Link>
        <Link href="/notes" className="batch2-row block"><p className="text-[8px] font-semibold">Journal</p><p className="batch2-mini mt-1">{journal}</p></Link>
      </div>
    </section>

    <form action="/brain" method="get" className="mx-auto flex max-w-[650px] items-center gap-2 rounded-full border border-[#e9dfdb] bg-white px-4 py-2.5 shadow-[0_7px_25px_rgba(73,50,42,.04)]"><Search size={13} className="text-[#9c918b]"/><input name="q" defaultValue={askedQuery} placeholder="Ask Glow anything..." className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-[#aaa09a]"/><button className="text-[#b65369]"><ArrowRight size={13}/></button></form>

    <div className="flex flex-wrap justify-center gap-2 text-[8px]">
      {['What should I focus on today?','Plan my afternoon','Why am I so tired?','Help me decide'].map(prompt=><Link key={prompt} href={`/brain?q=${encodeURIComponent(prompt)}`} className="batch2-btn py-[7px]">{prompt}</Link>)}
    </div>

    <section className="batch2-card p-4">
      <div className="flex items-center justify-between"><h2 className="font-serif text-[15px]">What Glow Knows Right Now</h2><Link href="/brain/insights" className="batch2-mini text-[#b65369]">View all insights</Link></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{insights.map(([title,meta])=><div key={title} className="rounded-[8px] border border-[#f0e7e3] bg-white p-3"><div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-[#fae9e9] text-[#b65369]"><Sparkles size={11}/></div><p className="mt-3 text-[8.5px] font-medium leading-4">{title}</p><p className="mt-1 text-[7.5px] leading-3 text-[#9d928c]">{meta}</p></div>)}</div>
    </section>

    <div className="flex justify-center gap-4 text-[8.5px]"><Link href="/brain/connections" className="text-[#b65369]">Open Mind Map →</Link><Link href="/graph" className="text-[#b65369]">Open Graph →</Link><span className="text-[#9d928c]">Clarity {focusScore}% · {connections.totalInstances} connections</span></div>
  </div></AppShell>;
}
