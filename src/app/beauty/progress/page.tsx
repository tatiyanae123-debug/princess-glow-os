import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';

export const dynamic = 'force-dynamic';

export default async function BeautyProgressPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const [products, routines] = await Promise.all([
    getBeautyProducts(session.user.id),
    getBeautyRoutinesByUser(session.user.id),
  ]);

  const active = products.filter((p) => p.repurchase !== 'no');
  const repurchase = products.filter((p) => p.repurchase === 'yes');
  const reactions = products.filter((p) => p.reaction?.trim());
  const routineCount = routines.length;
  const routineConsistency = routineCount ? Math.min(100, 68 + Math.min(28, routineCount * 3)) : 0;
  const skinScore = products.length ? Math.min(100, 72 + repurchase.length * 3 + reactions.length) : 0;
  const hydration = active.filter((p) => /hydr|moist|barrier|cream|serum/i.test(`${p.category} ${p.name}`)).length;
  const hydrationScore = active.length ? Math.min(8, Math.max(1, Math.round((hydration / active.length) * 8))) : 0;

  return <AppShell>
    <div className="b4-progress-page">
      <header className="b4-page-head">
        <div><p className="glow-eyebrow">4. Beauty Progress</p><h1 className="glow-display">Beauty Progress</h1><p>Track what’s working and see your glow grow.</p></div>
        <div className="b4-period-tabs"><button>7 Days</button><button className="active">30 Days</button><button>90 Days</button><button>1 Year</button></div>
      </header>

      <section className="b4-progress-grid">
        <article className="b4-metric-card"><p>Skin Health Score</p><strong>{skinScore || '—'}<small>/100</small></strong><span>{products.length ? `+${Math.max(1,reactions.length)} from tracked responses` : 'Add product responses to begin'}</span><div className="b4-line-chart"><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
        <article className="b4-metric-card"><p>Routine Consistency</p><strong>{routineConsistency || '—'}<small>%</small></strong><span>{routineCount ? `${routineCount} routine steps tracked` : 'No routine steps yet'}</span><div className="b4-bars">{[42,58,51,68,74,64,82,88].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div></article>
        <article className="b4-metric-card"><p>Hydration</p><strong>{hydrationScore || '—'}<small>/8</small></strong><span>{hydrationScore ? 'Hydration-supporting products in use' : 'Log hydrating products to measure'}</span><div className="b4-area-chart"><i/><i/><i/><i/><i/><i/><i/></div></article>
      </section>

      <section className="b4-progress-bottom">
        <article className="b4-list-card"><h2>Top Improvements</h2>{reactions.slice(0,3).map((p,i)=><div key={p.id}><span>{['Redness','Hydration','Breakouts'][i] ?? 'Skin response'}</span><small>{p.name}</small></div>)}{!reactions.length?<p className="empty">Add reactions in Beauty Lab to build improvement history.</p>:null}</article>
        <article className="b4-list-card"><h2>Areas to Focus</h2><div><span>Sleep</span><small>Keep recovery consistent</small></div><div><span>Water Intake</span><small>Support hydration</small></div><div><span>Sun Protection</span><small>Protect your progress</small></div></article>
        <article className="b4-reflection-card"><h2>Glow Reflection</h2><p>How are you feeling about your glow?</p><blockquote>{repurchase.length ? `You’ve marked ${repurchase.length} product${repurchase.length===1?'':'s'} as worth repurchasing. Keep tracking what feels best on your skin.` : 'Your reflection will become more useful as you log reactions and repurchase decisions.'}</blockquote><Link href="/beauty/lab">Add Reflection</Link></article>
      </section>
      <nav className="b4-subnav"><Link href="/beauty">Beauty OS</Link><Link href="/beauty/lab">Beauty Lab</Link><Link className="active" href="/beauty/progress">Progress</Link><Link href="/beauty/calendar">Calendar</Link></nav>
    </div>
  </AppShell>;
}
