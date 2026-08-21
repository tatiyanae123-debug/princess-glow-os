import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { Moon, Clock3, Sparkles } from 'lucide-react';

export const dynamic='force-dynamic';

export default async function SleepPage(){
  const session=await auth();
  if(!session?.user?.id) redirect('/sign-in');
  const entries=await getWellnessEntriesByUser(session.user.id);
  const week=entries.slice(0,7).reverse();
  const values=week.map(e=>e.sleepHours).filter((v):v is number=>v!=null);
  const average=values.length?values.reduce((a,b)=>a+b,0)/values.length:null;
  const latest=entries[0]??null;
  const avgLabel=average==null?'—':`${Math.floor(average)}h ${Math.round((average%1)*60)}m`;
  return <AppShell><div className="batch3-sleep-reference mx-auto max-w-[1120px] space-y-4">
    <header><p className="text-[9px] uppercase tracking-[.12em] text-[#766d67]">Sleep</p><h1 className="glow-display mt-1 text-[42px] leading-none">Sleep</h1><p className="mt-2 text-[10.5px] text-[#887e77]">A factual view of the sleep you have logged. Glow does not assume a personal sleep target unless you save one.</p></header>
    <section className="grid gap-3 lg:grid-cols-[.72fr_1.28fr]">
      <div className="rounded-[10px] border border-[#eee6e1] bg-white p-5 shadow-[0_9px_28px_rgba(67,48,40,.04)]"><p className="text-[9px] text-[#766d67]">Average of recent logged entries</p><p className="glow-display mt-3 text-[32px]">{avgLabel}</p><p className="mt-2 text-[10px] text-[#8a817a]">{values.length?`${values.length} sleep entr${values.length===1?'y':'ies'} included`:'Not enough logged data yet'}</p></div>
      <div className="rounded-[10px] border border-[#eee6e1] bg-white p-5 shadow-[0_9px_28px_rgba(67,48,40,.04)]"><div className="flex items-center justify-between"><p className="text-[10px] font-medium">Last 7 Wellness entries</p><p className="text-[9px] text-[#9a9088]">Real Glow data</p></div><div className="mt-6 flex h-36 items-end justify-between gap-3">{week.length?week.map((e,i)=>{const h=e.sleepHours??0;return <div key={e.id} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className="w-full max-w-8 rounded-t-[5px] bg-[#c9cbd1]" style={{height:`${Math.max(8,Math.min(100,(h/10)*100))}%`}}/><span className="text-[8px] text-[#918780]">{['S','M','T','W','T','F','S'][i%7]}</span></div>}) : <p className="m-auto text-[10px] text-[#9a9088]">Log sleep in Wellness to build this chart.</p>}</div></div>
    </section>
    <section className="grid gap-3 sm:grid-cols-3"><Metric icon={<Moon size={16}/>} label="Logged nights" value={String(values.length)}/><Metric icon={<Clock3 size={16}/>} label="Latest sleep" value={latest?.sleepHours!=null?`${latest.sleepHours}h`:'—'}/><Metric icon={<Sparkles size={16}/>} label="Average" value={avgLabel}/></section>
    <section className="grid gap-3 lg:grid-cols-[1.25fr_.75fr]"><div className="rounded-[10px] border border-[#eee6e1] bg-white p-5"><h2 className="text-[10px] font-medium">What Glow actually knows</h2><div className="mt-4 divide-y divide-[#f0e9e5] text-[10px]"><Row l="Sleep duration" v={values.length?'Logged':'Needs more data'}/><Row l="Bedtime / wake time" v="Not stored here"/><Row l="Screen time before bed" v="Not connected"/><Row l="Caffeine" v="Not connected"/></div></div><div className="rounded-[10px] border border-[#eee6e1] bg-white p-5"><h2 className="text-[10px] font-medium">Use this page for</h2><p className="mt-4 text-[10px] leading-5 text-[#6f6762]">Reviewing your recorded sleep duration over time. Sleep preparation behaviors remain separate from actual sleep measurements.</p></div></section>
  </div></AppShell>;
}
function Metric({icon,label,value}:{icon:React.ReactNode;label:string;value:string}){return <div className="rounded-[10px] border border-[#eee6e1] bg-white p-4"><div className="flex items-center gap-2 text-[#8d82a7]">{icon}<span className="text-[9px] text-[#766d67]">{label}</span></div><p className="glow-display mt-3 text-[18px]">{value}</p></div>}
function Row({l,v}:{l:string;v:string}){return <div className="flex justify-between gap-4 py-3"><span>{l}</span><span className="text-[#7a876d]">{v}</span></div>}
