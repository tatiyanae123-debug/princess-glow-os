'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, Sparkles, X } from 'lucide-react';
import { TODAY_LIVING_CENTER_REFERENCE } from '@/lib/design/today-living-center-reference';

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

type Panel = 'search'|'what-now'|'energy'|'priorities'|'routines'|'ask'|'saint'|'replan'|null;

type ScheduleItem = { label:string; time:string; title:string; note:string; href:string };

const fallbackTasks: TaskLite[] = [
  {id:'fallback-1',title:'Soft Power Studio Edit',priority:'high',dueLabel:'Today'},
  {id:'fallback-2',title:'Hair + Body',priority:'high',dueLabel:'60 min'},
  {id:'fallback-3',title:'Content Flow',priority:'medium',dueLabel:'Today'},
];

const fallbackRoutines: RoutineLite[] = [
  {id:'r-1',name:'Morning Hydration',timeOfDay:'morning'},
  {id:'r-2',name:'Creativity Warm-Up',timeOfDay:'morning'},
  {id:'r-3',name:'Posture + Stretch',timeOfDay:'morning'},
];

function parseTimeLabel(label:string,now:Date):Date|null{
  const match=label.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if(!match) return null;
  let hour=Number(match[1]);
  const minute=Number(match[2]??0);
  const suffix=match[3].toUpperCase();
  if(hour===12) hour=0;
  if(suffix==='PM') hour+=12;
  const date=new Date(now);
  date.setHours(hour,minute,0,0);
  return date;
}

function formatDuration(ms:number){
  const total=Math.max(0,Math.floor(ms/60000));
  return `${Math.floor(total/60)}H ${String(total%60).padStart(2,'0')}M`;
}

function patchStyle(left:number,top:number,width:number,height:number):React.CSSProperties{
  return {
    left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`,
    background:'linear-gradient(135deg,rgba(255,250,247,.91),rgba(246,234,229,.79))',
    boxShadow:'inset 0 1px 0 rgba(255,255,255,.95),0 7px 26px rgba(134,102,92,.07)',
    backdropFilter:'blur(7px)',WebkitBackdropFilter:'blur(7px)',
  };
}

function Hotspot({label,style,onClick}:{label:string;style:React.CSSProperties;onClick:()=>void}){
  return <button type="button" aria-label={label} title={label} onClick={onClick} style={style}
    className="absolute z-30 rounded-[1.4cqw] bg-transparent outline-none transition focus-visible:ring-2 focus-visible:ring-[#bd8f88] focus-visible:ring-offset-2 hover:bg-white/10"/>;
}

export function TodayLivingCenter({tasks,events,routines,energy,mood,sleepHours,glowMessage}:Props){
  const router=useRouter();
  const [now,setNow]=useState(new Date());
  const [panel,setPanel]=useState<Panel>(null);
  const [travel,setTravel]=useState<string|null>(null);
  const [searchText,setSearchText]=useState('');
  const [askText,setAskText]=useState('');
  const [askReceipt,setAskReceipt]=useState('');
  const [replanned,setReplanned]=useState(false);

  useEffect(()=>{
    const timer=window.setInterval(()=>setNow(new Date()),1000);
    return ()=>window.clearInterval(timer);
  },[]);

  useEffect(()=>{
    if(!panel) return;
    const close=(event:KeyboardEvent)=>{ if(event.key==='Escape') setPanel(null); };
    window.addEventListener('keydown',close);
    return ()=>window.removeEventListener('keydown',close);
  },[panel]);

  const liveTasks=tasks.length?tasks:fallbackTasks;
  const liveRoutines=routines.length?routines:fallbackRoutines;
  const hour=now.getHours();
  const greeting=hour<12?'Good morning, Editor ♡':hour<17?'Good afternoon, Editor ♡':hour<21?'Good evening, Editor ♡':'Good night, Editor ♡';
  const dateLabel=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
  const timeLabel=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const capacity=Math.max(35,Math.min(96,energy?Math.round(energy*10):82));
  const emotional=Math.max(35,Math.min(96,mood?Math.round(mood*10):85));
  const physical=Math.max(40,Math.min(96,energy?Math.round(energy*10-8):70));
  const creative=Math.max(55,Math.min(98,capacity+13));
  const endOfDay=new Date(now); endOfDay.setHours(23,59,59,999);
  const timeRemaining=formatDuration(endOfDay.getTime()-now.getTime());
  const nextEventDate=events.map(event=>parseTimeLabel(event.timeLabel,now)).find((value):value is Date=>Boolean(value&&value>now))??null;
  const wrapAt=nextEventDate?new Date(nextEventDate.getTime()-30*60000):new Date(now.getTime()+4*60*60000+7*60000);
  const leaveReady=formatDuration(wrapAt.getTime()-now.getTime());

  const schedule:ScheduleItem[]=useMemo(()=>[
    {label:'NEXT',time:events[0]?.timeLabel??'12:00 PM',title:events[0]?.title??'Lunch + Call',note:events[0]?.location??'Nourish & connect',href:'/calendar'},
    {label:'LATER',time:events[1]?.timeLabel??'2:30 PM',title:events[1]?.title??'Creative Planning',note:events[1]?.location??'Deep work',href:'/calendar'},
    {label:'TONIGHT',time:events[2]?.timeLabel??'7:00 PM',title:events[2]?.title??'Wind Down',note:events[2]?.location??'Reset & reflect',href:'/calendar'},
    {label:'TOMORROW',time:'Preview',title:'A quiet glimpse',note:'',href:'/tomorrow'},
  ],[events]);

  function moveTo(href:string,label:string){
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced){router.push(href);return;}
    setTravel(label);
    window.setTimeout(()=>router.push(href),420);
  }

  function openAsk(){setPanel('ask');setAskReceipt('');}

  function submitAsk(event:React.FormEvent){
    event.preventDefault();
    if(!askText.trim()) return;
    setAskReceipt(glowMessage||'Glow understood the request and is holding the current Today context while you decide the next move.');
  }

  return <div className="min-h-[100dvh] overflow-hidden bg-[#eee2dc] text-[#2d2624]">
    <style>{`
      @keyframes glowWorldRipple{0%{opacity:0;transform:scale(.35)}35%{opacity:.78}100%{opacity:.05;transform:scale(2.2)}}
      @keyframes glowWorldDrift{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(-.7%,0,0) scale(1.012)}}
      .glow-world-ripple{animation:glowWorldRipple .58s cubic-bezier(.2,.8,.2,1) both}
      .glow-world-drifting{animation:glowWorldDrift .45s ease-out both}
      @media (prefers-reduced-motion:reduce){.glow-world-ripple,.glow-world-drifting{animation:none!important}}
    `}</style>

    <div className="h-[100dvh] w-full overflow-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className={`relative aspect-[4/3] min-h-[760px] min-w-[1180px] overflow-hidden lg:min-h-0 lg:min-w-0 lg:w-full ${travel?'glow-world-drifting':''}`} style={{containerType:'inline-size'}}>
        <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" className="absolute inset-0 h-full w-full select-none object-cover" draggable={false}/>

        <div aria-live="polite" className="absolute z-20 overflow-hidden rounded-[1.2cqw]" style={patchStyle(3.35,4.45,34.5,8.25)}>
          <div className="flex h-full flex-col justify-center px-[1.2cqw]">
            <div className="font-serif leading-[1.03] tracking-[-.035em]" style={{fontSize:'3.02cqw'}}>{greeting}</div>
            <div className="mt-[.72cqw] font-medium tracking-[.14em]" style={{fontSize:'.86cqw'}}>{dateLabel}</div>
          </div>
        </div>

        <div className="absolute z-20 flex items-center justify-center rounded-[.8cqw]" style={patchStyle(41.4,15.35,6.4,2.9)}>
          <span className="font-medium" style={{fontSize:'.95cqw'}}>{timeLabel}</span>
        </div>

        <button type="button" onClick={()=>moveTo('/focus','Focus')} className="absolute z-20 overflow-hidden rounded-[1.1cqw] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#bd8f88]" style={patchStyle(5.1,23.2,32.8,9.15)}>
          <div className="flex h-full flex-col justify-center px-[.7cqw]">
            <div className="font-serif leading-tight" style={{fontSize:'1.95cqw'}}>{liveTasks[0]?.title??'Soft Power Studio Edit'}</div>
            <div className="mt-[.5cqw] tracking-[.03em]" style={{fontSize:'.92cqw'}}>High focus &nbsp;·&nbsp; Creative work</div>
            <div className="mt-[.8cqw] font-serif italic text-[#9f766f]" style={{fontSize:'1.03cqw'}}>This is your moment.</div>
          </div>
        </button>

        <button type="button" onClick={()=>setPanel('what-now')} className="absolute z-20 overflow-hidden rounded-[1cqw] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#bd8f88]" style={patchStyle(4.3,35.1,21.9,18.1)}>
          <div className="h-full px-[1.15cqw] py-[1cqw]">
            <div className="font-semibold tracking-[.12em]" style={{fontSize:'.84cqw'}}>WHAT NOW? ✧</div>
            <div className="mt-[.4cqw] font-serif" style={{fontSize:'.78cqw'}}>Your next right 3.</div>
            <div className="mt-[.7cqw] space-y-[.38cqw]">
              {liveTasks.slice(0,3).map((task,index)=><div key={task.id} className="grid grid-cols-[1.3cqw_1fr_auto] items-center gap-[.45cqw] rounded-[.45cqw] border border-[#d9c8c0]/70 bg-white/25 px-[.55cqw] py-[.48cqw]" style={{fontSize:'.72cqw'}}><span className="grid aspect-square place-items-center rounded-[.25cqw] bg-[#ecd9d2]">{index+1}</span><span className="truncate font-serif">{task.title}</span><span>{task.dueLabel??(index===1?'60 MIN':'Today')}</span></div>)}
            </div>
          </div>
        </button>

        <button type="button" onClick={()=>setPanel('energy')} className="absolute z-20 overflow-hidden rounded-[1cqw] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#bd8f88]" style={patchStyle(26.8,35.1,21.4,18.1)}>
          <div className="h-full px-[1.15cqw] py-[1cqw]">
            <div className="font-semibold tracking-[.12em]" style={{fontSize:'.84cqw'}}>ENERGY & CAPACITY</div>
            <div className="mt-[1cqw] grid grid-cols-[7.3cqw_1fr] items-center gap-[.8cqw]">
              <div className="grid aspect-square place-items-center rounded-full border-[.2cqw] border-[#dcc5bc] bg-white/20 text-center"><div><div className="font-serif leading-none" style={{fontSize:'2.55cqw'}}>{capacity}</div><div className="font-serif" style={{fontSize:'.8cqw'}}>Radiant</div></div></div>
              <div className="space-y-[.72cqw]">{[['Mental',capacity],['Emotional',emotional],['Physical',physical],['Creative',creative]].map(([label,value])=><div key={String(label)} className="grid grid-cols-[4.2cqw_1fr_2.6cqw] items-center gap-[.45cqw]" style={{fontSize:'.67cqw'}}><span className="font-serif">{label}</span><div className="h-[.23cqw] rounded-full bg-[#d9cbc5]"><div className="h-full rounded-full bg-[#c99f98]" style={{width:`${value}%`}}/></div><span>{value}%</span></div>)}</div>
            </div>
          </div>
        </button>

        <div className="absolute z-20 overflow-hidden rounded-[1cqw]" style={patchStyle(4.2,55.4,19.8,9.4)}><div className="h-full px-[1.1cqw] py-[.9cqw]"><div className="font-semibold tracking-[.12em]" style={{fontSize:'.68cqw'}}>TIME REMAINING TODAY</div><div className="mt-[.65cqw] font-serif" style={{fontSize:'1.58cqw'}}>{timeRemaining}</div><div className="mt-[.22cqw]" style={{fontSize:'.61cqw'}}>until day’s end</div></div></div>
        <div className="absolute z-20 overflow-hidden rounded-[1cqw]" style={patchStyle(24.2,55.4,24.9,9.4)}><div className="h-full px-[1.1cqw] py-[.9cqw]"><div className="font-semibold tracking-[.12em]" style={{fontSize:'.68cqw'}}>LEAVE-READY COUNTDOWN</div><div className="mt-[.65cqw] font-serif" style={{fontSize:'1.58cqw'}}>{leaveReady}</div><div className="mt-[.22cqw]" style={{fontSize:'.61cqw'}}>ideal wrap before the next fixed commitment</div></div></div>

        <button type="button" onClick={()=>setPanel('replan')} className="absolute z-20 overflow-hidden rounded-[1cqw] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#bd8f88]" style={patchStyle(4.2,68.35,45.0,6.2)}>
          <div className="flex h-full items-center gap-[1.1cqw] px-[1.2cqw]"><span className="text-[#bf998f]" style={{fontSize:'1.6cqw'}}>✧</span><div><div className="font-serif" style={{fontSize:'1.15cqw'}}>Replan My Day</div><div className="mt-[.15cqw]" style={{fontSize:'.69cqw'}}>{replanned?'Your new day shape is ready to review.':'One-tap reset. Realign, reschedule, and flow.'}</div></div><span className="ml-auto grid aspect-square w-[3.2cqw] place-items-center rounded-full border border-[#d2bdb5] bg-white/20" style={{fontSize:'1.2cqw'}}>→</span></div>
        </button>

        <button type="button" onClick={()=>setPanel('priorities')} className="absolute z-20 overflow-hidden rounded-[1cqw] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#bd8f88]" style={patchStyle(3.7,75.85,45.5,13.6)}>
          <div className="h-full px-[1.25cqw] py-[.9cqw]">
            <div className="font-semibold tracking-[.12em]" style={{fontSize:'.78cqw'}}>TOP 3 PRIORITIES &nbsp;♕</div>
            <div className="mt-[.7cqw] grid grid-cols-3 divide-x divide-[#d2c3bd]">{liveTasks.slice(0,3).map((task,index)=><div key={task.id} className="px-[.9cqw] first:pl-0"><div className="tracking-[.12em]" style={{fontSize:'.58cqw'}}>{['CREATE','CARE','PLAN'][index]??'FOCUS'}</div><div className="mt-[.35cqw] truncate font-serif" style={{fontSize:'1.08cqw'}}>{task.title}</div><div className="mt-[.2cqw] truncate" style={{fontSize:'.67cqw'}}>{index===0?'Ship the highest-value edit':index===1?'Nourish the day':'Map the next move'}</div><div className="mt-[.35cqw]" style={{fontSize:'.6cqw'}}>Impact: {task.priority==='high'||task.priority==='urgent'?'High':'Medium'}</div></div>)}</div>
          </div>
        </button>

        <button type="button" onClick={()=>setPanel('routines')} className="absolute z-20 overflow-hidden rounded-[1cqw] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#bd8f88]" style={patchStyle(53.85,74.6,20.4,14.9)}>
          <div className="h-full px-[1cqw] py-[.85cqw]"><div className="text-center font-semibold tracking-[.12em]" style={{fontSize:'.68cqw'}}>ROUTINES DUE NOW</div><div className="mt-[.6cqw] divide-y divide-[#d6c8c1]">{liveRoutines.slice(0,3).map((routine,index)=><div key={routine.id} className="grid grid-cols-[1fr_auto_1.4cqw] items-center gap-[.55cqw] py-[.54cqw]" style={{fontSize:'.65cqw'}}><span className="truncate font-serif">{routine.name}</span><span>{[5,10,7][index]??10} MIN</span><span className="grid aspect-square place-items-center rounded-full border border-[#8c7770]"> </span></div>)}</div><div className="pt-[.42cqw] text-center font-serif" style={{fontSize:'.64cqw'}}>View all routines →</div></div>
        </button>

        <button type="button" onClick={openAsk} className="absolute z-20 overflow-hidden rounded-[1cqw] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#bd8f88]" style={patchStyle(75.35,74.6,20.1,14.9)}>
          <div className="relative h-full px-[1.1cqw] py-[.85cqw]"><div className="font-serif" style={{fontSize:'1.3cqw'}}>ASK GLOW ✧</div><div className="mt-[.25cqw]" style={{fontSize:'.64cqw'}}>Your oracle. Your clarity.</div><div className="mt-[.8cqw] rounded-[.6cqw] border border-white/80 bg-white/20 px-[.8cqw] py-[.75cqw] font-serif" style={{fontSize:'.78cqw'}}>What would make<br/>today iconic?</div><div className="absolute bottom-[.75cqw] right-[.8cqw] grid aspect-square w-[3.5cqw] place-items-center rounded-full border border-white/90 bg-[radial-gradient(circle,#fff_0%,#f0c8c4_32%,#d7b2b0_56%,rgba(255,255,255,.55)_72%)] shadow-[0_0_1.2cqw_rgba(255,220,214,.9)]">✦</div></div>
        </button>

        {schedule.map((item,index)=><button key={item.label} type="button" onClick={()=>moveTo(item.href,item.label==='TOMORROW'?'Tomorrow':'Plan')} className="absolute z-20 overflow-hidden text-left outline-none focus-visible:ring-2 focus-visible:ring-[#bd8f88]" style={{...patchStyle(82.25,[10.3,27.6,45.5,62.8][index],13.4,[13.2,13.9,13.4,8.0][index]),borderRadius:0,boxShadow:'none',background:'linear-gradient(90deg,rgba(250,240,235,.88),rgba(250,240,235,.64),transparent)',backdropFilter:'blur(3px)'}}><div className="flex h-full flex-col justify-center pr-[.4cqw]"><div className="font-semibold tracking-[.14em]" style={{fontSize:'1.03cqw'}}>{item.label}</div><div className="mt-[.45cqw]" style={{fontSize:'.78cqw'}}>{item.time}</div><div className="mt-[.24cqw] font-serif" style={{fontSize:'1.05cqw'}}>{item.title}</div>{item.note?<><div className="mt-[.35cqw]" style={{fontSize:'.7cqw'}}>{index===0?'1H 00M':index===1?'2H 00M':'1H 00M'}</div><div className="mt-[.25cqw] font-serif" style={{fontSize:'.72cqw'}}>{item.note}</div></>:null}</div></button>)}

        <Hotspot label="Search Glow OS" style={{left:'85.6%',top:'1.9%',width:'3.2%',height:'4.5%'}} onClick={()=>setPanel('search')}/>
        <Hotspot label="Open calendar" style={{left:'90.2%',top:'1.9%',width:'3.2%',height:'4.5%'}} onClick={()=>moveTo('/calendar','Plan')}/>
        <Hotspot label="Open notifications" style={{left:'94.4%',top:'1.9%',width:'3.2%',height:'4.5%'}} onClick={()=>moveTo('/notices','Attention')}/>
        <Hotspot label="Today" style={{left:'17.5%',top:'91.8%',width:'10.2%',height:'6.8%'}} onClick={()=>{}}/>
        <Hotspot label="Move toward Plan" style={{left:'29.5%',top:'91.8%',width:'10.2%',height:'6.8%'}} onClick={()=>moveTo('/planning','Plan')}/>
        <Hotspot label="Move toward Life" style={{left:'41.0%',top:'91.8%',width:'10.2%',height:'6.8%'}} onClick={()=>moveTo('/world','Life')}/>
        <Hotspot label="Move toward Brain" style={{left:'53.0%',top:'91.8%',width:'10.2%',height:'6.8%'}} onClick={()=>moveTo('/brain','Brain')}/>
        <Hotspot label="Move toward Create" style={{left:'64.5%',top:'91.8%',width:'10.2%',height:'6.8%'}} onClick={()=>moveTo('/create','Create')}/>
        <Hotspot label="Saint" style={{left:'84.7%',top:'92.0%',width:'12.6%',height:'6.2%'}} onClick={()=>setPanel('saint')}/>

        {travel?<div className="pointer-events-none absolute inset-0 z-50 overflow-hidden" aria-live="polite"><div className="glow-world-ripple absolute left-[54%] top-[30%] aspect-square w-[32%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,.98)_0%,rgba(255,211,201,.78)_20%,rgba(196,218,246,.58)_39%,rgba(255,255,255,.08)_68%,transparent_74%)] shadow-[0_0_8cqw_rgba(255,229,219,.9)]"/><div className="absolute bottom-[8%] left-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-white/45 px-[1.25cqw] py-[.55cqw] font-medium tracking-[.12em] backdrop-blur-xl" style={{fontSize:'.72cqw'}}>MOVING TOWARD {travel.toUpperCase()}</div></div>:null}

        <div className="pointer-events-none absolute bottom-[1.1cqw] left-[1.2cqw] z-40 hidden rounded-full border border-white/80 bg-white/60 px-[1cqw] py-[.45cqw] font-medium shadow-sm backdrop-blur-xl max-lg:block" style={{fontSize:'.7cqw'}}>Drag sideways to explore the same room →</div>
      </div>
    </div>

    {panel?<div className="fixed inset-0 z-[100] grid place-items-center bg-[#3e302b]/25 p-4 backdrop-blur-[10px]" onMouseDown={event=>{if(event.currentTarget===event.target)setPanel(null)}}>
      <section role="dialog" aria-modal="true" className="max-h-[82dvh] w-full max-w-[620px] overflow-auto rounded-[30px] border border-white/80 bg-[rgba(255,249,246,.92)] p-5 shadow-[0_30px_90px_rgba(67,46,39,.28)] sm:p-7">
        <div className="flex items-center justify-between gap-4"><div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[.18em] text-[#8f7169]"><Sparkles size={15}/>Glow · Today</div><button type="button" onClick={()=>setPanel(null)} className="grid h-10 w-10 place-items-center rounded-full border border-[#ddcbc4] bg-white/60"><X size={18}/></button></div>

        {panel==='search'?<div className="mt-5"><h2 className="font-serif text-3xl">Cast light across Glow OS.</h2><input autoFocus value={searchText} onChange={event=>setSearchText(event.target.value)} placeholder="Search a task, memory, person, routine…" className="mt-5 w-full rounded-2xl border border-[#dccbc4] bg-white/70 px-4 py-3 outline-none focus:border-[#b58e85]"/><div className="mt-4 grid gap-2 sm:grid-cols-2">{[['Tasks','/tasks'],['Calendar','/calendar'],['Routines','/routines'],['Brain','/brain']].map(([label,href])=><button key={label} type="button" onClick={()=>moveTo(href,label)} className="rounded-2xl border border-[#ddcec7] bg-white/45 px-4 py-3 text-left font-serif">{label}<ArrowRight className="float-right mt-1" size={15}/></button>)}</div>{searchText?<p className="mt-4 text-sm text-[#74645f]">Search is ready for “{searchText}”. Open the closest world above to continue without losing Today context.</p>:null}</div>:null}

        {panel==='what-now'?<div className="mt-5"><h2 className="font-serif text-3xl">Your next right three.</h2><p className="mt-2 text-sm text-[#74645f]">Glow keeps Now anchored while nearby actions remain visible.</p><div className="mt-5 space-y-2">{liveTasks.slice(0,3).map((task,index)=><button key={task.id} onClick={()=>index===0?moveTo('/focus','Focus'):moveTo('/tasks','Plan')} className="flex w-full items-center gap-3 rounded-2xl border border-[#ddcec7] bg-white/45 p-4 text-left"><span className="grid h-8 w-8 place-items-center rounded-full bg-[#ead6cf] font-serif">{index+1}</span><span className="min-w-0 flex-1"><span className="block truncate font-serif text-lg">{task.title}</span><span className="text-xs uppercase tracking-[.12em] text-[#8a746c]">{task.priority}</span></span><ArrowRight size={17}/></button>)}</div></div>:null}

        {panel==='energy'?<div className="mt-5"><h2 className="font-serif text-3xl">Energy & Capacity</h2><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-[#ddcec7] bg-white/45 p-5"><div className="font-serif text-5xl">{capacity}</div><div className="mt-1 font-serif text-lg">Radiant capacity</div></div><div className="rounded-2xl border border-[#ddcec7] bg-white/45 p-5 text-sm leading-7"><div>Mental · {capacity}%</div><div>Emotional · {emotional}%</div><div>Physical · {physical}%</div><div>Creative · {creative}%</div><div>Sleep · {sleepHours!=null?`${sleepHours.toFixed(1)}h`:'not logged'}</div></div></div><button type="button" onClick={()=>moveTo('/wellness','Life')} className="mt-4 rounded-2xl bg-[#382c28] px-4 py-3 text-sm text-white">Open Wellness</button></div>:null}

        {panel==='priorities'?<div className="mt-5"><h2 className="font-serif text-3xl">Top 3 Priorities</h2><div className="mt-5 space-y-2">{liveTasks.slice(0,3).map((task,index)=><div key={task.id} className="rounded-2xl border border-[#ddcec7] bg-white/45 p-4"><div className="text-xs uppercase tracking-[.14em] text-[#8e756d]">{['Create','Care','Plan'][index]??'Focus'}</div><div className="mt-1 font-serif text-xl">{task.title}</div><div className="mt-1 text-sm text-[#74645f]">Priority: {task.priority}</div></div>)}</div><button type="button" onClick={()=>moveTo('/tasks','Plan')} className="mt-4 rounded-2xl bg-[#382c28] px-4 py-3 text-sm text-white">Open Task Workshop</button></div>:null}

        {panel==='routines'?<div className="mt-5"><h2 className="font-serif text-3xl">Routines Due Now</h2><div className="mt-5 space-y-2">{liveRoutines.slice(0,5).map((routine,index)=><div key={routine.id} className="flex items-center gap-3 rounded-2xl border border-[#ddcec7] bg-white/45 p-4"><span className="grid h-7 w-7 place-items-center rounded-full border border-[#a98b82] text-[#9a7d75]">{index===0?<CheckCircle2 size={16}/>:null}</span><span className="flex-1 font-serif text-lg">{routine.name}</span><span className="text-xs text-[#806c65]">{[5,10,7,15,20][index]??10} min</span></div>)}</div><button type="button" onClick={()=>moveTo('/routines','Plan')} className="mt-4 rounded-2xl bg-[#382c28] px-4 py-3 text-sm text-white">Enter Routine Pathway</button></div>:null}

        {panel==='replan'?<div className="mt-5"><h2 className="font-serif text-3xl">Replan without leaving Today.</h2><p className="mt-2 text-sm leading-6 text-[#74645f]">Now stays anchored. Glow can soften flexible items, protect the highest-value block, and carry unfinished context forward.</p><div className="mt-5 grid gap-2"><button onClick={()=>setReplanned(true)} className="rounded-2xl border border-[#ddcec7] bg-white/55 p-4 text-left"><span className="font-serif text-lg">Protect the top priority</span><span className="mt-1 block text-sm text-[#74645f]">Move lower-value flexible work around it.</span></button><button onClick={()=>setReplanned(true)} className="rounded-2xl border border-[#ddcec7] bg-white/55 p-4 text-left"><span className="font-serif text-lg">Create a lower-energy version</span><span className="mt-1 block text-sm text-[#74645f]">Keep the intention while reducing load.</span></button></div>{replanned?<div className="mt-4 rounded-2xl bg-[#edf0e5] p-4 text-sm">✓ A softer day shape is staged. Nothing changes permanently until you approve it.</div>:null}<button type="button" onClick={()=>moveTo('/planning','Plan')} className="mt-4 rounded-2xl bg-[#382c28] px-4 py-3 text-sm text-white">Review in Planning Studio</button></div>:null}

        {panel==='ask'?<form onSubmit={submitAsk} className="mt-5"><h2 className="font-serif text-3xl">Ask Glow</h2><p className="mt-2 text-sm text-[#74645f]">The conversation stays attached to this moment.</p><textarea autoFocus value={askText} onChange={event=>setAskText(event.target.value)} placeholder="What would make today iconic?" rows={4} className="mt-5 w-full resize-none rounded-2xl border border-[#dccbc4] bg-white/70 px-4 py-3 outline-none focus:border-[#b58e85]"/><button className="mt-3 w-full rounded-2xl bg-[#382c28] px-4 py-3 text-sm text-white">Send through Glow Matter</button>{askReceipt?<div className="mt-4 rounded-2xl border border-[#e2d1ca] bg-[#fff8f4] p-4"><div className="font-serif text-lg">Glow understood.</div><p className="mt-2 text-sm leading-6 text-[#6f5f59]">{askReceipt}</p><button type="button" onClick={()=>moveTo('/brain','Brain')} className="mt-3 inline-flex items-center gap-2 text-sm font-medium">Continue in Brain <ArrowRight size={14}/></button></div>:null}</form>:null}

        {panel==='saint'?<div className="mt-5"><h2 className="font-serif text-3xl">Saint is with you.</h2><p className="mt-3 text-sm leading-6 text-[#74645f]">Saint remains a living context object inside Life. Walks, care, reminders, appointments, and memories can stay connected to the day instead of becoming a separate page.</p><button type="button" onClick={()=>moveTo('/world','Life')} className="mt-4 rounded-2xl bg-[#382c28] px-4 py-3 text-sm text-white">Move toward Life</button></div>:null}
      </section>
    </div>:null}
  </div>;
}
