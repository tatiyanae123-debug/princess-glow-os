import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function RecoveryPage(){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const entries=await getWellnessEntriesByUser(session.user.id);
  const latest=entries[0]??null;
  const week=entries.slice(0,7);
  const sleep=week.map(e=>e.sleepHours).filter((v):v is number=>v!=null);
  const avgSleep=sleep.length?sleep.reduce((a,b)=>a+b,0)/sleep.length:null;
  const stress=week.map(e=>e.stressLevel).filter((v):v is number=>v!=null);
  const avgStress=stress.length?stress.reduce((a,b)=>a+b,0)/stress.length:null;
  const lowEnergy=week.filter(e=>e.energy==='low'||e.energy==='exhausted').length;
  const recovery=avgSleep!=null&&avgSleep>=7&&(avgStress==null||avgStress<=3)?'Good':avgSleep==null&&avgStress==null?'Not enough data':'Needs care';
  return <AppShell><div className="batch3-recovery-reference mx-auto max-w-[1120px] space-y-4">
    <header><p className="text-[9px] uppercase tracking-[.12em] text-[#766d67]">8. Symptoms &amp; Recovery</p><h1 className="glow-display mt-1 text-[42px] leading-none">Symptoms &amp; Recovery</h1><p className="mt-2 text-[10.5px] text-[#887e77]">Track how you feel. Find what helps.</p></header>
    <div className="flex gap-6 border-b border-[#eee6e1] text-[9.5px]"><span className="border-b-2 border-[#8a8f76] pb-2 font-medium">Symptoms</span><span className="pb-2 text-[#918780]">Recovery</span><span className="pb-2 text-[#918780]">Trends</span><span className="pb-2 text-[#918780]">Insights</span></div>
    <section className="grid gap-3 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-[10px] border border-[#eee6e1] bg-white p-5 shadow-[0_9px_28px_rgba(67,48,40,.04)]"><h2 className="text-[10px] font-medium">Today</h2><div className="mt-4 divide-y divide-[#f0e9e5] text-[10px]"><Row l="Structured symptom log" v="Not yet supported"/><Row l="Energy" v={latest?.energy??'Not logged'}/><Row l="Stress" v={latest?.stressLevel!=null?`${latest.stressLevel}/5`:'Not logged'}/><Row l="Sleep" v={latest?.sleepHours!=null?`${latest.sleepHours}h`:'Not logged'}/></div><p className="mt-4 text-[9px] leading-4 text-[#9a9088]">Glow is showing only fields that are actually stored in your Wellness data. Individual symptom persistence is not faked.</p></div><div className="rounded-[10px] border border-[#eee6e1] bg-white p-5 shadow-[0_9px_28px_rgba(67,48,40,.04)]"><h2 className="text-[10px] font-medium">This Week</h2><p className="mt-4 text-[9px] text-[#8b817a]">Recovery status</p><p className="glow-display mt-1 text-[26px]">{recovery}</p><div className="mt-5 grid grid-cols-2 gap-3"><Stat l="Avg sleep" v={avgSleep==null?'—':`${avgSleep.toFixed(1)}h`}/><Stat l="Low-energy days" v={String(lowEnergy)}/><Stat l="Avg stress" v={avgStress==null?'—':avgStress.toFixed(1)}/><Stat l="Entries" v={String(week.length)}/></div></div></section>
    <section className="grid gap-3 lg:grid-cols-[1fr_.8fr]"><div className="rounded-[10px] border border-[#eee6e1] bg-white p-5"><h2 className="text-[10px] font-medium">Recent Notes</h2>{week.filter(e=>e.notes).length?<div className="mt-3 space-y-2">{week.filter(e=>e.notes).slice(0,3).map(e=><div key={e.id} className="rounded-[8px] bg-[#fbf8f5] p-3"><p className="text-[8.5px] text-[#9a9088]">{e.entryDate}</p><p className="mt-1 text-[10px] leading-4">{e.notes}</p></div>)}</div>:<p className="mt-4 text-[10px] text-[#9a9088]">No recent wellness notes.</p>}</div><div className="relative overflow-hidden rounded-[10px] border border-[#eee6e1] bg-[linear-gradient(135deg,#fff,#f1eee8)] p-5"><div className="flex items-center gap-2"><Sparkles size={13} className="text-[#819071]"/><h2 className="text-[10px] font-medium">Glow Insight</h2></div><p className="mt-4 text-[11px] leading-5 text-[#544c47]">{avgSleep!=null&&avgSleep<7?'Your recent sleep is below seven hours on average. Protecting recovery time may support steadier energy.':avgStress!=null&&avgStress>=4?'Stress has been elevated in your recent check-ins. Keep the next plan lighter where possible.':'Keep logging sleep, energy and stress to make your recovery pattern clearer.'}</p></div></section>
  </div></AppShell>;
}
function Row({l,v}:{l:string;v:string}){return <div className="flex items-center justify-between gap-4 py-3"><span>{l}</span><span className="capitalize text-[#7a876d]">{v}</span></div>}
function Stat({l,v}:{l:string;v:string}){return <div className="rounded-[8px] bg-[#fbf8f5] p-3"><p className="text-[8px] text-[#9a9088]">{l}</p><p className="glow-display mt-1 text-[16px]">{v}</p></div>}
