import Link from 'next/link';
import { redirect } from 'next/navigation';
import { and, desc, eq, gte } from 'drizzle-orm';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { db } from '@/db';
import { beautyMaintenanceItems, beautyReadinessLogs, beautyRitualRuns, beautyStepLogs, beautyTreatmentLogs, beautyTreatmentSchedules } from '@/db/schema/advanced-beauty';

export const dynamic = 'force-dynamic';
const PERIODS=[{days:7,label:'7 Days'},{days:30,label:'30 Days'},{days:90,label:'90 Days'},{days:365,label:'1 Year'}] as const;

export default async function BeautyProgressPage({searchParams}:{searchParams?:Promise<{period?:string}>}){
  const session=await auth(); if(!session?.user?.id) redirect('/sign-in');
  const params=await searchParams; const requested=Number(params?.period); const period=PERIODS.some(x=>x.days===requested)?requested:30;
  const cutoff=new Date(Date.now()-period*86400000); const userId=session.user.id;
  const [runs,steps,treatments,schedules,maintenance,readiness]=await Promise.all([
    db.select().from(beautyRitualRuns).where(and(eq(beautyRitualRuns.userId,userId),gte(beautyRitualRuns.startedAt,cutoff))).orderBy(desc(beautyRitualRuns.startedAt)),
    db.select().from(beautyStepLogs).where(and(eq(beautyStepLogs.userId,userId),gte(beautyStepLogs.completedAt,cutoff))).orderBy(desc(beautyStepLogs.completedAt)),
    db.select().from(beautyTreatmentLogs).where(and(eq(beautyTreatmentLogs.userId,userId),gte(beautyTreatmentLogs.occurredAt,cutoff))).orderBy(desc(beautyTreatmentLogs.occurredAt)),
    db.select().from(beautyTreatmentSchedules).where(and(eq(beautyTreatmentSchedules.userId,userId),eq(beautyTreatmentSchedules.enabled,true))),
    db.select().from(beautyMaintenanceItems).where(and(eq(beautyMaintenanceItems.userId,userId),eq(beautyMaintenanceItems.archived,false))),
    db.select().from(beautyReadinessLogs).where(and(eq(beautyReadinessLogs.userId,userId),gte(beautyReadinessLogs.occurredAt,cutoff))).orderBy(desc(beautyReadinessLogs.occurredAt)),
  ]);
  const completed=runs.filter(r=>r.status==='completed'); const am=completed.filter(r=>r.ritualKey.includes('am')); const pm=completed.filter(r=>r.ritualKey.includes('pm'));
  const avgSeconds=completed.length?Math.round(completed.reduce((s,r)=>s+r.actualSeconds,0)/completed.length):0;
  const responses={comfortable:treatments.filter(t=>t.response==='comfortable').length,neutral:treatments.filter(t=>t.response==='neutral').length,irritating:treatments.filter(t=>t.response==='irritating').length};
  const skipped=steps.filter(s=>s.status==='skipped'); const skippedCounts=new Map<string,number>(); skipped.forEach(s=>skippedCounts.set(s.stepName,(skippedCounts.get(s.stepName)??0)+1));
  const friction=[...skippedCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,5);
  const maintenanceDone=maintenance.filter(m=>m.lastCompletedAt&&m.lastCompletedAt>=cutoff);
  const polishedAvg=readiness.length?Math.round(readiness.reduce((sum,r)=>sum+(r.totalCount?r.completedCount/r.totalCount:0),0)/readiness.length*100):null;
  const uniqueCompletedDays=new Set(completed.filter(r=>r.completedAt).map(r=>r.completedAt!.toLocaleDateString('en-CA'))).size;
  const adherence=Math.min(100,Math.round(uniqueCompletedDays/Math.max(1,period)*100));
  const min=Math.round(avgSeconds/60);

  return <AppShell><div className="mx-auto max-w-7xl space-y-6 pb-24 text-[#493e45]">
    <header className="rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,#fffaf5,#f1e7ea)] p-6 sm:p-8"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a47f91]">Beauty Progress</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl">Track consistency, not imaginary scores.</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-[#7f7178]">Every number below comes from saved Beauty ritual runs, treatment logs, maintenance records, or Polished Checks. Glow does not estimate “skin health.”</p><div className="mt-5 flex flex-wrap gap-2">{PERIODS.map(x=><Link key={x.days} href={`/beauty/progress?period=${x.days}`} className={`rounded-full px-4 py-2 text-xs ${period===x.days?'bg-[#4b3d46] text-white':'bg-white'}`}>{x.label}</Link>)}</div></header>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
      ['Recorded care days',`${uniqueCompletedDays}/${period}`,`${adherence}% of days have a completed Beauty ritual`],
      ['AM / PM',`${am.length} / ${pm.length}`,'Completed Morning / Night Beauty runs'],
      ['Treatments',String(treatments.length),`${schedules.length} active treatment schedule${schedules.length===1?'':'s'}`],
      ['Average ritual',completed.length?`${Math.max(1,min)} min`:'—',completed.length?`Across ${completed.length} completed run${completed.length===1?'':'s'}`:'No completed persistent runs yet'],
    ].map(([label,value,detail])=><article key={label} className="rounded-[24px] border border-[#eee2e6] bg-white p-5"><p className="text-[10px] uppercase tracking-[.14em] text-[#9c8a94]">{label}</p><p className="mt-2 font-serif text-3xl">{value}</p><p className="mt-2 text-[10px] leading-4 text-[#91848b]">{detail}</p></article>)}</section>

    <section className="grid gap-4 lg:grid-cols-2"><article className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><h2 className="font-serif text-2xl">Treatment response history</h2><p className="mt-2 text-xs text-[#8c7e85]">Your own logged experience. Glow does not diagnose the cause.</p><div className="mt-4 grid grid-cols-3 gap-2">{Object.entries(responses).map(([label,value])=><div key={label} className="rounded-2xl bg-[#faf6f4] p-4 text-center"><p className="font-serif text-2xl">{value}</p><p className="mt-1 text-[10px] capitalize text-[#91848b]">{label}</p></div>)}</div><div className="mt-4 space-y-2">{treatments.slice(0,6).map(t=><div key={t.id} className="rounded-2xl bg-[#f5f0f5] p-3"><p className="text-xs font-semibold">{t.treatmentName}</p><p className="mt-1 text-[10px] text-[#958790]">{t.occurredAt.toLocaleString()}{t.response?` · ${t.response}`:''}</p>{t.notes?<p className="mt-1 text-[10px] leading-4">{t.notes}</p>:null}</div>)}</div></article>
      <article className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><h2 className="font-serif text-2xl">Routine friction</h2><p className="mt-2 text-xs text-[#8c7e85]">Most intentionally skipped steps in this period. No skip data means Glow shows no pattern.</p><div className="mt-4 space-y-2">{friction.length?friction.map(([name,count])=><div key={name} className="flex items-center justify-between rounded-2xl bg-[#faf6f4] p-3"><span className="text-xs font-semibold">{name}</span><span className="rounded-full bg-white px-2 py-1 text-[10px]">{count} skip{count===1?'':'s'}</span></div>):<p className="text-xs text-[#91848b]">No repeated skipped Beauty steps in this period.</p>}</div></article></section>

    <section className="grid gap-4 lg:grid-cols-3"><article className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><h2 className="font-serif text-2xl">Maintenance</h2><p className="mt-3 font-serif text-3xl">{maintenanceDone.length}</p><p className="text-xs text-[#91848b]">items with a completion recorded in this period</p></article><article className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><h2 className="font-serif text-2xl">Polished Check</h2><p className="mt-3 font-serif text-3xl">{polishedAvg==null?'—':`${polishedAvg}%`}</p><p className="text-xs text-[#91848b]">average checklist completion across {readiness.length} saved check{readiness.length===1?'':'s'}</p></article><article className="rounded-[26px] border border-[#eee2e6] bg-white p-5"><h2 className="font-serif text-2xl">Beauty principle</h2><p className="mt-3 text-sm italic leading-6 text-[#7d7077]">Beauty is built through consistency, not perfection.</p></article></section>

    <nav className="flex flex-wrap gap-2"><Link className="rounded-full border px-4 py-2 text-xs" href="/beauty">Beauty OS</Link><Link className="rounded-full border px-4 py-2 text-xs" href="/beauty/lab">Beauty Lab</Link><span className="rounded-full bg-[#4b3d46] px-4 py-2 text-xs text-white">Progress</span><Link className="rounded-full border px-4 py-2 text-xs" href="/beauty/calendar">Calendar</Link></nav>
  </div></AppShell>;
}
