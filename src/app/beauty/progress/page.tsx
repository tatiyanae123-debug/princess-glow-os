import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getBeautyProducts } from '@/lib/data/completion-v1';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';

export const dynamic = 'force-dynamic';

const PERIODS = [
  { days: 7, label: '7 Days' },
  { days: 30, label: '30 Days' },
  { days: 90, label: '90 Days' },
  { days: 365, label: '1 Year' },
] as const;

export default async function BeautyProgressPage({searchParams}:{searchParams?:Promise<{period?:string}>}) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const params = await searchParams;
  const requested = Number(params?.period);
  const period = PERIODS.some((item) => item.days === requested) ? requested : 30;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - period);

  const [products, routines] = await Promise.all([
    getBeautyProducts(session.user.id),
    getBeautyRoutinesByUser(session.user.id),
  ]);
  const scopedProducts = products.filter((product) => product.createdAt >= cutoff);
  const scopedRoutines = routines.filter((routine) => routine.createdAt >= cutoff || routine.updatedAt >= cutoff);

  const active = scopedProducts.filter((p) => p.repurchase !== 'no');
  const repurchase = scopedProducts.filter((p) => p.repurchase === 'yes');
  const reactions = scopedProducts.filter((p) => p.reaction?.trim());
  const routineCount = scopedRoutines.length;
  const routineConsistency = routineCount ? Math.min(100, 68 + Math.min(28, routineCount * 3)) : 0;
  const skinScore = scopedProducts.length ? Math.min(100, 72 + repurchase.length * 3 + reactions.length) : 0;
  const hydration = active.filter((p) => /hydr|moist|barrier|cream|serum/i.test(`${p.category} ${p.name}`)).length;
  const hydrationScore = active.length ? Math.min(8, Math.max(1, Math.round((hydration / active.length) * 8))) : 0;

  return <AppShell>
    <div className="b4-progress-page">
      <header className="b4-page-head">
        <div><p className="glow-eyebrow">4. Beauty Progress</p><h1 className="glow-display">Beauty Progress</h1><p>Track what’s working and see your glow grow.</p></div>
        <div className="b4-period-tabs" aria-label="Beauty progress time range">{PERIODS.map((item)=><Link key={item.days} href={`/beauty/progress?period=${item.days}`} className={period===item.days?'active':''} aria-current={period===item.days?'page':undefined}>{item.label}</Link>)}</div>
      </header>

      <section className="b4-progress-grid">
        <article className="b4-metric-card"><p>Skin Health Indicator</p><strong>{skinScore || '—'}<small>/100</small></strong><span>{scopedProducts.length ? `${reactions.length} tracked response${reactions.length===1?'':'s'} in this period` : `No product records in the last ${period} days`}</span><div className="b4-line-chart" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/></div></article>
        <article className="b4-metric-card"><p>Routine Activity</p><strong>{routineConsistency || '—'}<small>%</small></strong><span>{routineCount ? `${routineCount} routine step${routineCount===1?'':'s'} created or updated` : `No routine activity in the last ${period} days`}</span><div className="b4-bars" aria-hidden="true">{[42,58,51,68,74,64,82,88].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div></article>
        <article className="b4-metric-card"><p>Hydration Product Mix</p><strong>{hydrationScore || '—'}<small>/8</small></strong><span>{hydrationScore ? 'Hydration-supporting products in this period' : `No hydrating product records in the last ${period} days`}</span><div className="b4-area-chart" aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/></div></article>
      </section>

      <section className="b4-progress-bottom">
        <article className="b4-list-card"><h2>Tracked Responses</h2>{reactions.slice(0,3).map((p)=><div key={p.id}><span>{p.name}</span><small>{p.reaction}</small></div>)}{!reactions.length?<p className="empty">Add reactions in Beauty Lab to build progress history.</p>:null}</article>
        <article className="b4-list-card"><h2>Areas to Focus</h2><div><span>Sleep</span><small>Keep recovery consistent</small></div><div><span>Water Intake</span><small>Support hydration</small></div><div><span>Sun Protection</span><small>Protect your progress</small></div></article>
        <article className="b4-reflection-card"><h2>Glow Reflection</h2><p>How are you feeling about your glow?</p><blockquote>{repurchase.length ? `You marked ${repurchase.length} product${repurchase.length===1?'':'s'} worth repurchasing in this period. Keep tracking what feels best on your skin.` : 'Your reflection becomes more useful as you log reactions and repurchase decisions.'}</blockquote><Link href="/beauty/lab">Add Reflection</Link></article>
      </section>
      <nav className="b4-subnav"><Link href="/beauty">Beauty OS</Link><Link href="/beauty/lab">Beauty Lab</Link><Link className="active" href="/beauty/progress">Progress</Link><Link href="/beauty/calendar">Calendar</Link></nav>
    </div>
  </AppShell>;
}
