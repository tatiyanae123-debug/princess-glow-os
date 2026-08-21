import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { buildPersonalContext } from '@/lib/intelligence/context';
import { buildBrainConnections, buildBrainMapDomains } from '@/lib/intelligence/brain-connections';
import { getNotesByUser } from '@/lib/data/notes';
import { getAllLifeMemoriesByUser } from '@/lib/data/user-scope';
import { Camera, CircleDot, Gem, Lightbulb, Network, Sparkles } from 'lucide-react';
import { ImmersiveRoomChrome, ImmersiveTopControls, OpenGlowCommand } from '@/components/immersive/immersive-room-chrome';

export const dynamic = 'force-dynamic';
const BG = 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=2400&q=92';
const WATER = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=88';
const BLOOM = 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=800&q=88';
function recency(date: Date | null | undefined) {
  if (!date) return '';
  const days = Math.max(0, Math.floor((Date.now() - date.getTime()) / 86_400_000));
  return days <= 0 ? 'Today' : days === 1 ? 'Yesterday' : `${days} days ago`;
}

export default async function BrainPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const name = session.user.name?.split(' ')[0] ?? 'Tatiyana';
  const [context, connections, domains, notes, memories] = await Promise.all([
    buildPersonalContext(userId).catch(() => null),
    buildBrainConnections(userId),
    buildBrainMapDomains(userId),
    getNotesByUser(userId),
    getAllLifeMemoriesByUser(userId),
  ]);
  const sortedNotes = [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const focused = [...domains].filter((domain) => domain.count > 0).sort((a, b) => b.count - a.count);
  const instances = connections.types.flatMap((type) => type.instances).sort((a, b) => (b.occurredAt?.getTime() ?? 0) - (a.occurredAt?.getTime() ?? 0));
  const focusScore = context?.focusScore;
  const patternCount = context?.patterns?.length ?? 0;
  const memoryCount = memories.length;
  const insightCount = (context?.recommendations?.length ?? 0) + (context?.attentionSignals?.length ?? 0) + (context?.patterns?.length ?? 0);
  const clarity = typeof focusScore === 'number' && Number.isFinite(focusScore) ? Math.max(0, Math.min(100, Math.round(focusScore))) : null;
  const todayInsights = [context?.patterns?.[0]?.title, context?.recommendations?.[0]?.title, context?.attentionSignals?.[0]?.label].filter((value): value is string => Boolean(value));
  const revelations = [
    ...(context?.patterns ?? []).slice(0, 2).map((pattern) => ({ title: pattern.title, when: 'Pattern' })),
    ...(context?.recommendations ?? []).slice(0, 2).map((recommendation) => ({ title: recommendation.title, when: 'Recommendation' })),
    ...sortedNotes.slice(0, 2).map((note) => ({ title: note.title || 'Untitled note', when: recency(note.updatedAt) })),
  ].slice(0, 3);
  const active = instances.slice(0, 4);
  const orbActive = connections.totalInstances > 0 || memoryCount > 0 || patternCount > 0 || insightCount > 0;

  return (
    <AppShell>
      <div className="ir-world brain-world">
        <Image className="ir-backdrop" src={BG} alt="Ethereal intelligence environment" width={2400} height={1600} priority sizes="100vw" data-glow-image-key="brain-background" />
        <div className="brain-atmosphere" />
        <ImmersiveRoomChrome name={name} image={session.user.image} />
        <ImmersiveTopControls />
        <main className="brain-main">
          <header className="brain-title"><h1>BRAIN</h1><h2>Your Central Intelligence</h2><p>I connect your world, reveal patterns, and help you create with clarity.</p><span>✦ {orbActive ? 'Central Orb Active' : 'Waiting for more Glow data'}</span></header>
          <section className="brain-orb-zone" aria-label="Central intelligence visualization"><div className="brain-wing left" /><div className="brain-wing right" /><div className="brain-rings"><i /><i /><i /></div><div className="brain-orb"><b>✦</b></div></section>
          <section className="brain-insights ir-glass"><h3>✧ Today&apos;s Insights</h3>{todayInsights.length ? todayInsights.map((value, index) => <p key={`${value}-${index}`}><span>{['◇', '✦', '✿'][index] ?? '✧'}</span>{value}</p>) : <div className="ir-empty">No new insight signals yet.</div>}<Link href="/brain/insights">View All</Link></section>
          <aside className="brain-right">
            <section className="ir-glass brain-overview"><h3>✧ Brain Overview</h3><div className="brain-overview-body"><div className="brain-clarity" style={{ '--brain-score': `${clarity ?? 0}%` } as React.CSSProperties}><strong>{clarity == null ? '—' : `${clarity}%`}</strong><small>{clarity == null ? 'Not enough data' : 'Clarity'}</small></div><div className="brain-counts"><p><Network />Connections <b>{connections.totalInstances}</b></p><p><Sparkles />Patterns <b>{patternCount}</b></p><p><Gem />Memories <b>{memoryCount}</b></p><p><Lightbulb />Insights <b>{insightCount}</b></p></div></div><Link href="/brain/insights">Explore Deeper</Link></section>
            <section className="ir-glass brain-connections"><div className="brain-card-head"><h3>✧ Active Connections</h3><Link href="/brain/connections">View All</Link></div>{active.length ? active.map((item, index) => <Link href={item.href} key={`${item.id}-${index}`}><Image src={index % 2 ? WATER : BLOOM} alt="" width={800} height={800} sizes="120px" data-glow-image-key={`brain-connection-${index}`} /><div><strong>{item.title}</strong><small>{item.detail}</small></div><span>✦</span></Link>) : <div className="ir-empty">No relationship links yet. Glow will show only real stored or inferred connections.</div>}</section>
            <section className="ir-glass brain-revelations"><div className="brain-card-head"><h3>✧ Recent Revelations</h3><Link href="/observations">View All</Link></div>{revelations.length ? revelations.map((revelation, index) => <article key={`${revelation.title}-${index}`}><Image src={index % 2 ? BLOOM : WATER} alt="" width={800} height={800} sizes="120px" data-glow-image-key={`brain-revelation-${index}`} /><p>{revelation.title}</p><small>{revelation.when}</small></article>) : <div className="ir-empty">No revelations yet. Glow will surface them as patterns emerge.</div>}</section>
          </aside>
          <section className="brain-command ir-glass"><OpenGlowCommand /><div><Link href="/brain/insights">Find Patterns</Link><Link href="/planning">Plan My Day</Link><Link href="/goals">Optimize Goals</Link><Link href="/creative-studio">Creative Spark</Link></div></section>
          <section className="brain-signal ir-glass"><div className="brain-wave" aria-hidden="true">▂▃▅▆▃▇▅▂▆▃▅▇▃▆▅▂</div><strong>{focused[0]?.label ?? 'Brain Signal'}</strong><small>{focused[0] ? `${focused[0].count} records in this domain` : 'No dominant domain yet'}</small></section>
          <nav className="brain-dock ir-glass"><Link href="/brain/connections"><span><Network /></span><small>Mind Map</small></Link><Link href="/brain/insights"><span><CircleDot /></span><small>Pattern Scan</small></Link><Link href="/memory"><span><Camera /></span><small>Memory Link</small></Link><Link href="/goals"><span><Gem /></span><small>Future Vision</small></Link><Link href="/creative-studio"><span><Lightbulb /></span><small>Idea Studio</small></Link></nav>
        </main>
      </div>
    </AppShell>
  );
}
