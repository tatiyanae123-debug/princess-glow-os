'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

type TaskLite = { id:string; title:string; priority:string; dueLabel?:string|null };
type EventLite = { id:string; title:string; timeLabel:string; location?:string|null };
type RoutineLite = { id:string; name:string; timeOfDay:string };

type Props = {
  tasks: TaskLite[];
  events: EventLite[];
  routines: RoutineLite[];
  energy: number | null;
  mood: number | null;
  sleepHours: number | null;
  glowMessage: string;
};

type Panel = 'ask'|'now'|'replan'|'priorities'|'routines'|'aura'|null;

const worldRoutes: Record<string,string> = {
  Today:'/today', Plan:'/planning', Life:'/world', Brain:'/brain', Create:'/create'
};

export function TodayLivingCenter({tasks,events,routines,energy,mood,sleepHours,glowMessage}:Props){
  const router=useRouter();
  const [panel,setPanel]=useState<Panel>(null);
  const [moving,setMoving]=useState<string|null>(null);
  const [receipt,setReceipt]=useState('');

  useEffect(()=>{
    const onKey=(event:KeyboardEvent)=>{ if(event.key==='Escape') setPanel(null); };
    window.addEventListener('keydown',onKey);
    return ()=>window.removeEventListener('keydown',onKey);
  },[]);

  function moveTo(label:string,href:string){
    if(href==='/today') return;
    setMoving(label);
    window.setTimeout(()=>router.push(href),420);
  }

  function replan(){
    setReceipt('Glow reshaped the day around what matters now. Review before anything is committed.');
    setPanel('replan');
  }

  const primary=tasks[0]?.title ?? 'Soft Power Studio Edit';
  const nextEvent=events[0]?.title ?? 'Lunch + Call';
  const liveEnergy=energy==null?'not logged':`${energy}`;
  const liveMood=mood==null?'not logged':`${mood}`;
  const liveSleep=sleepHours==null?'not logged':`${sleepHours}h`;

  return <div className="min-h-screen bg-[#eadfd9] text-[#2d2725]">
    <div className="relative mx-auto min-h-screen w-full overflow-auto overscroll-contain bg-[#eadfd9]">
      <div className="relative mx-auto aspect-[4/3] min-w-[980px] max-w-[1600px] overflow-hidden bg-[#f2e7e1] shadow-[0_30px_100px_rgba(89,62,53,.16)] md:min-w-0">
        <img src="/today-living-center-reference.svg" alt="Glow OS Today, The Living Center" className="absolute inset-0 h-full w-full select-none object-cover" draggable={false}/>

        <div aria-hidden className={`pointer-events-none absolute inset-0 z-20 transition-opacity duration-500 ${moving?'opacity-100':'opacity-0'}`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_61%_24%,rgba(255,255,255,.88),rgba(247,218,211,.38)_22%,rgba(204,214,238,.24)_42%,transparent_66%)]"/>
          <div className="absolute left-[61%] top-[24%] h-[18%] w-[14%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90 shadow-[0_0_75px_35px_rgba(255,247,240,.92)] animate-pulse"/>
        </div>

        <button aria-label="Open live moment" onClick={()=>setPanel('now')} className="absolute left-[3.2%] top-[14.2%] z-10 h-[56%] w-[47%] rounded-[2.2vw] outline-none ring-0 transition hover:bg-white/[.035] focus-visible:ring-2 focus-visible:ring-white"/>
        <button aria-label="Replan my day" onClick={replan} className="absolute left-[3.4%] top-[69.8%] z-10 h-[6.2%] w-[47%] rounded-[2vw] outline-none transition hover:bg-white/[.06] focus-visible:ring-2 focus-visible:ring-white"/>
        <button aria-label="Open top priorities" onClick={()=>setPanel('priorities')} className="absolute left-[3.2%] top-[76.2%] z-10 h-[15.7%] w-[47%] rounded-[2vw] outline-none transition hover:bg-white/[.04] focus-visible:ring-2 focus-visible:ring-white"/>
        <button aria-label="Open Glow Aura context" onClick={()=>setPanel('aura')} className="absolute left-[51%] top-[10%] z-10 h-[55%] w-[22%] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white"/>
        <button aria-label="Open calendar" onClick={()=>moveTo('Plan','/calendar')} className="absolute left-[78.5%] top-[8.5%] z-10 h-[58%] w-[18%] outline-none focus-visible:ring-2 focus-visible:ring-white"/>
        <button aria-label="Open routines due now" onClick={()=>setPanel('routines')} className="absolute left-[54.2%] top-[75%] z-10 h-[16%] w-[20.7%] rounded-[2vw] outline-none transition hover:bg-white/[.04] focus-visible:ring-2 focus-visible:ring-white"/>
        <button aria-label="Ask Glow" onClick={()=>setPanel('ask')} className="absolute left-[76%] top-[75%] z-10 h-[16%] w-[20.8%] rounded-[2vw] outline-none transition hover:bg-white/[.04] focus-visible:ring-2 focus-visible:ring-white"/>
        <button aria-label="Search Glow OS" onClick={()=>moveTo('Search','/search')} className="absolute left-[87%] top-[1.4%] z-10 h-[4.6%] w-[4.6%] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white"/>
        <button aria-label="Open calendar" onClick={()=>moveTo('Plan','/calendar')} className="absolute left-[91.8%] top-[1.4%] z-10 h-[4.6%] w-[4.6%] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white"/>
        <button aria-label="Open attention center" onClick={()=>moveTo('Attention','/notices')} className="absolute left-[96.2%] top-[1.4%] z-10 h-[4.6%] w-[3.4%] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white"/>

        {Object.entries(worldRoutes).map(([label,href],i)=><button key={label} aria-label={`Move toward ${label}`} onClick={()=>moveTo(label,href)} className="absolute bottom-[1.3%] z-10 h-[6.7%] w-[9.8%] rounded-full outline-none transition hover:bg-white/[.08] focus-visible:ring-2 focus-visible:ring-white" style={{left:`${22.5+i*11}%`}}/>)}

        <button aria-label="Open Saint context" onClick={()=>{setReceipt('Saint stays connected to Today, routines, walks, appointments, and home context.');setPanel('aura')}} className="absolute bottom-[1.1%] right-[1.1%] z-10 h-[7.4%] w-[13%] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white"/>
      </div>
    </div>

    {panel?<div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#302522]/20 p-3 backdrop-blur-[2px] sm:items-center" onMouseDown={e=>{if(e.currentTarget===e.target)setPanel(null)}}>
      <div role="dialog" aria-modal="true" className="w-full max-w-[620px] rounded-[30px] border border-white/80 bg-[rgba(255,249,246,.94)] p-5 shadow-[0_30px_100px_rgba(75,48,40,.22)] backdrop-blur-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-semibold tracking-[.22em] text-[#8f6d66]">GLOW OS · LIVING CENTER</p><h2 className="mt-2 font-serif text-[28px]">{panel==='ask'?'Ask Glow':panel==='replan'?'Replan My Day':panel==='priorities'?'Top 3 Priorities':panel==='routines'?'Routines Due Now':panel==='aura'?'Living Glow Aura':'Live Moment'}</h2></div><button onClick={()=>setPanel(null)} className="grid h-10 w-10 place-items-center rounded-full border border-[#e9d9d2] bg-white/70" aria-label="Close"><X size={17}/></button></div>

        {panel==='now'?<div className="mt-5 space-y-3"><p className="font-serif text-[23px]">{primary}</p><p className="text-sm text-[#6f5d57]">The reference room stays visually fixed while this surface carries live data and actions.</p><button onClick={()=>moveTo('Focus','/focus')} className="rounded-full bg-[#3c302d] px-5 py-3 text-sm text-white">Start focused session</button></div>:null}
        {panel==='ask'?<div className="mt-5"><p className="font-serif text-[20px] leading-7">{glowMessage}</p><textarea aria-label="Ask Glow" placeholder="What would make today iconic?" className="mt-4 min-h-28 w-full rounded-[20px] border border-[#e5d2ca] bg-white/75 p-4 text-sm outline-none focus:ring-2 focus:ring-[#dfb9ad]"/><div className="mt-3 flex gap-2"><button onClick={()=>setReceipt('Glow heard you. The conversation stays attached to Today as you move through the world.')} className="rounded-full bg-[#3c302d] px-5 py-3 text-sm text-white">Ask Glow</button><button onClick={()=>moveTo('Brain','/brain')} className="rounded-full border border-[#dfcec6] px-5 py-3 text-sm">Open deeper context</button></div>{receipt?<p className="mt-4 rounded-[16px] bg-[#f5e7e2] p-3 text-sm">{receipt}</p>:null}</div>:null}
        {panel==='replan'?<div className="mt-5"><p className="text-sm leading-6 text-[#65534e]">{receipt||'Glow will draft a new flow without committing changes until you approve.'}</p><div className="mt-4 flex gap-2"><button onClick={()=>{setReceipt('Draft approved. Glow released a soft action receipt and preserved your previous plan for undo.')}} className="rounded-full bg-[#3c302d] px-5 py-3 text-sm text-white">Approve draft</button><button onClick={()=>setReceipt('Nothing changed. Your original day remains intact.')} className="rounded-full border border-[#dfcec6] px-5 py-3 text-sm">Keep original</button></div></div>:null}
        {panel==='priorities'?<div className="mt-5 grid gap-2 sm:grid-cols-3">{tasks.slice(0,3).map((task,i)=><button key={task.id} onClick={()=>moveTo('Tasks','/tasks')} className="rounded-[18px] border border-[#ead9d2] bg-white/70 p-4 text-left"><p className="text-[10px] tracking-[.16em] text-[#9a7770]">{['CREATE','CARE','PLAN'][i]||'PRIORITY'}</p><p className="mt-2 font-serif text-lg">{task.title}</p><p className="mt-2 text-xs text-[#75625d]">{task.priority}</p></button>)}</div>:null}
        {panel==='routines'?<div className="mt-5 space-y-2">{routines.slice(0,5).map(r=><button key={r.id} onClick={()=>moveTo('Routines','/routines')} className="flex w-full items-center justify-between rounded-[16px] border border-[#ead9d2] bg-white/70 px-4 py-3 text-left"><span className="font-serif">{r.name}</span><span className="text-[10px] uppercase tracking-[.12em] text-[#907770]">{r.timeOfDay}</span></button>)}</div>:null}
        {panel==='aura'?<div className="mt-5 space-y-3"><p className="font-serif text-[21px]">Your life. Your timing. Your becoming.</p><p className="text-sm leading-6 text-[#65534e]">Glow stays continuous as the world changes climate. Current context: next event is {nextEvent}. Energy: {liveEnergy}. Mood: {liveMood}. Sleep: {liveSleep}.</p>{receipt?<p className="rounded-[16px] bg-[#f5e7e2] p-3 text-sm">{receipt}</p>:null}</div>:null}
      </div>
    </div>:null}

    <div aria-live="polite" className="sr-only">{moving?`Moving toward ${moving}`:receipt}</div>
  </div>;
}
