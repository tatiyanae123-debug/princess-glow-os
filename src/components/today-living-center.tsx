'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
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

type Panel = 'search'|'what-now'|'energy'|'priorities'|'routines'|'ask'|'saint'|'moment'|null;
type ScheduleItem = { label:string; time:string; title:string; note:string; href:string };

const fallbackTasks: TaskLite[] = [
  {id:'fallback-1',title:'Soft Power Studio Edit',priority:'high',dueLabel:'Today'},
  {id:'fallback-2',title:'Hair + Body',priority:'high',dueLabel:'60 MIN'},
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

function priorityLabel(value:string){
  const normalized=value.toLowerCase();
  if(normalized==='urgent'||normalized==='high') return 'High';
  if(normalized==='low') return 'Low';
  return 'Medium';
}

function titleSize(title:string){
  if(title.length>30) return '1.32cqw';
  if(title.length>22) return '1.48cqw';
  return '1.68cqw';
}

function hotspot(left:number,top:number,width:number,height:number):CSSProperties{
  return {left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`};
}

function Hotspot({label,style,onClick}:{label:string;style:CSSProperties;onClick:()=>void}){
  return <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    style={style}
    className="absolute z-30 rounded-[1cqw] bg-transparent outline-none transition hover:bg-white/[.06] focus-visible:ring-2 focus-visible:ring-[#bd948d] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
  />;
}

function DataLine({left,top,width,height=3.1,children,className=''}:{
  left:number;top:number;width:number;height?:number;children:ReactNode;className?:string
}){
  return <div
    className={`absolute z-20 flex items-center overflow-hidden ${className}`}
    style={{
      left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`,
      background:'linear-gradient(90deg,rgba(255,248,244,.90),rgba(255,248,244,.77) 86%,rgba(255,248,244,0))',
      WebkitMaskImage:'linear-gradient(90deg,#000 0%,#000 86%,transparent 100%)',
      maskImage:'linear-gradient(90deg,#000 0%,#000 86%,transparent 100%)',
      backdropFilter:'blur(2px)',WebkitBackdropFilter:'blur(2px)',
    }}
  >{children}</div>;
}

function Modal({children,onClose}:{children:ReactNode;onClose:()=>void}){
  return <div className="absolute inset-0 z-50 grid place-items-center bg-[#6f5149]/10 p-6 backdrop-blur-[3px]" onMouseDown={onClose}>
    <section
      role="dialog"
      aria-modal="true"
      onMouseDown={event=>event.stopPropagation()}
      className="relative w-[min(92vw,560px)] overflow-hidden rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,252,249,.96),rgba(244,226,220,.91))] p-7 text-[#312522] shadow-[0_24px_90px_rgba(92,61,52,.22),inset_0_1px_0_rgba(255,255,255,.96)]"
    >
      <button type="button" onClick={onClose} aria-label="Close" className="absolute right-5 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/50 text-xl">×</button>
      {children}
    </section>
  </div>;
}

export function TodayLivingCenter({tasks,events,routines,energy,mood,sleepHours,glowMessage}:Props){
  const router=useRouter();
  const [now,setNow]=useState(new Date());
  const [panel,setPanel]=useState<Panel>(null);
  const [momentIndex,setMomentIndex]=useState(0);
  const [travel,setTravel]=useState<string|null>(null);
  const [searchText,setSearchText]=useState('');
  const [askText,setAskText]=useState('');
  const [askReceipt,setAskReceipt]=useState('');
  const [replanned,setReplanned]=useState(false);
  const [focusSeconds,setFocusSeconds]=useState(47*60);
  const [focusRunning,setFocusRunning]=useState(false);

  useEffect(()=>{
    const timer=window.setInterval(()=>setNow(new Date()),1000);
    return ()=>window.clearInterval(timer);
  },[]);

  useEffect(()=>{
    if(!focusRunning) return;
    const timer=window.setInterval(()=>setFocusSeconds(value=>Math.max(0,value-1)),1000);
    return ()=>window.clearInterval(timer);
  },[focusRunning]);

  useEffect(()=>{
    if(focusSeconds===0) setFocusRunning(false);
  },[focusSeconds]);

  useEffect(()=>{
    if(!panel) return;
    const close=(event:KeyboardEvent)=>{ if(event.key==='Escape') setPanel(null); };
    window.addEventListener('keydown',close);
    return ()=>window.removeEventListener('keydown',close);
  },[panel]);

  const liveTasks=tasks.length?tasks:fallbackTasks;
  const liveRoutines=routines.length?routines:fallbackRoutines;
  const hour=now.getHours();
  const greeting=hour>=5&&hour<12?'Good morning, Princess ♡':
    hour>=12&&hour<17?'Good afternoon, Princess ♡':
    hour>=17&&hour<21?'Good evening, Princess ♡':'Good night, Princess ♡';
  const dateLabel=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
  const timeLabel=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const capacity=Math.max(35,Math.min(96,energy?Math.round(energy*10):82));
  const emotional=Math.max(35,Math.min(96,mood?Math.round(mood*10):85));
  const physical=Math.max(40,Math.min(96,energy?Math.round(energy*10-8):70));
  const creative=Math.max(55,Math.min(98,capacity+13));
  const endOfDay=new Date(now); endOfDay.setHours(23,59,59,999);
  const timeRemaining=formatDuration(endOfDay.getTime()-now.getTime());

  let nextEventDate:Date|null=null;
  for(const event of events){
    const parsed=parseTimeLabel(event.timeLabel,now);
    if(parsed&&parsed>now){ nextEventDate=parsed; break; }
  }
  const wrapAt=nextEventDate?new Date(nextEventDate.getTime()-30*60000):new Date(now.getTime()+4*60*60000+7*60000);
  const leaveReady=formatDuration(wrapAt.getTime()-now.getTime());

  const schedule:ScheduleItem[]=useMemo(()=>[
    {label:'NEXT',time:events[0]?.timeLabel??'12:00 PM',title:events[0]?.title??'Lunch + Call',note:events[0]?.location??'Nourish & connect',href:'/calendar'},
    {label:'LATER',time:events[1]?.timeLabel??'2:30 PM',title:events[1]?.title??'Creative Planning',note:events[1]?.location??'Deep work',href:'/calendar'},
    {label:'TONIGHT',time:events[2]?.timeLabel??'7:00 PM',title:events[2]?.title??'Wind Down',note:events[2]?.location??'Reset & reflect',href:'/calendar'},
    {label:'TOMORROW',time:'Preview',title:'A quiet glimpse',note:'',href:'/tomorrow'},
  ],[events]);

  const searchResults=useMemo(()=>{
    const q=searchText.trim().toLowerCase();
    if(!q) return [];
    return [
      ...liveTasks.map(item=>({kind:'Task',title:item.title})),
      ...events.map(item=>({kind:'Event',title:item.title})),
      ...liveRoutines.map(item=>({kind:'Routine',title:item.name})),
    ].filter(item=>item.title.toLowerCase().includes(q)).slice(0,8);
  },[searchText,liveTasks,events,liveRoutines]);

  function moveTo(href:string,label:string){
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced){router.push(href);return;}
    setTravel(label);
    window.setTimeout(()=>router.push(href),430);
  }

  function openMoment(index:number){
    setMomentIndex(index);
    setPanel('moment');
  }

  function submitAsk(event:FormEvent){
    event.preventDefault();
    if(!askText.trim()) return;
    setAskReceipt(glowMessage||'Glow understood. The current Today context stays connected while the world reorganizes around your request.');
  }

  function replan(){
    setReplanned(true);
    window.setTimeout(()=>setReplanned(false),4200);
  }

  const activeTask=liveTasks[0]??fallbackTasks[0];
  const focusMinutes=Math.ceil(focusSeconds/60);

  return <main className="h-[100dvh] w-full overflow-hidden bg-[#eadfd8] text-[#312522]">
    <style>{`
      @keyframes auraRipple{0%{opacity:0;transform:translate(-50%,-50%) scale(.25)}30%{opacity:.72}100%{opacity:0;transform:translate(-50%,-50%) scale(2.35)}}
      @keyframes worldDrift{0%{transform:scale(1);filter:saturate(1)}100%{transform:scale(1.012);filter:saturate(.97) brightness(1.02)}}
      .aura-ripple{animation:auraRipple .78s cubic-bezier(.2,.8,.2,1) both}
      .world-drift{animation:worldDrift .44s ease-out both}
      .portrait-pan{overflow:hidden}
      @media (orientation:portrait){
        .portrait-pan{overflow-x:auto;overflow-y:hidden;scrollbar-width:none}
        .portrait-pan::-webkit-scrollbar{display:none}
        .glow-stage{width:133.333dvh!important;height:100dvh!important;min-width:133.333dvh}
      }
      @media (prefers-reduced-motion:reduce){
        .aura-ripple,.world-drift{animation:none!important}
      }
    `}</style>

    <div className="portrait-pan flex h-full w-full items-center justify-center bg-[#eadfd8]">
      <div
        className={`glow-stage relative shrink-0 overflow-hidden ${travel?'world-drift':''}`}
        style={{
          width:'min(100vw, calc(100dvh * 4 / 3))',
          height:'min(100dvh, calc(100vw * 3 / 4))',
          containerType:'inline-size',
        }}
      >
        <img
          src={TODAY_LIVING_CENTER_REFERENCE}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
        />

        <div
          aria-live="polite"
          className="absolute z-20 flex flex-col justify-center"
          style={{
            left:'3.9%',top:'5.4%',width:'30%',height:'8.1%',
            background:'linear-gradient(90deg,rgba(255,249,246,.94) 0%,rgba(255,249,246,.83) 72%,rgba(255,249,246,0) 100%)',
            WebkitMaskImage:'linear-gradient(90deg,#000 0%,#000 78%,transparent 100%)',
            maskImage:'linear-gradient(90deg,#000 0%,#000 78%,transparent 100%)',
            backdropFilter:'blur(2px)',WebkitBackdropFilter:'blur(2px)',
          }}
        >
          <div className="whitespace-nowrap font-serif leading-none tracking-[-.035em]" style={{fontSize:'2.47cqw'}}>{greeting}</div>
          <div className="mt-[.75cqw] font-medium tracking-[.18em]" style={{fontSize:'.72cqw'}}>{dateLabel}</div>
        </div>

        <DataLine left={41.4} top={16.4} width={5.2} height={2.8} className="justify-center">
          <span className="font-medium" style={{fontSize:'.72cqw'}}>{timeLabel}</span>
        </DataLine>

        <DataLine left={5.8} top={22.75} width={25.1} height={4.0}>
          <span className="font-serif leading-none" style={{fontSize:titleSize(activeTask.title)}}>{activeTask.title}</span>
        </DataLine>

        {liveTasks.slice(0,3).map((task,index)=>{
          const tops=[40.95,44.95,48.95];
          return <DataLine key={task.id} left={8.1} top={tops[index]} width={16.2} height={2.75}>
            <span className="min-w-0 flex-1 truncate font-serif" style={{fontSize:'.72cqw'}}>{task.title}</span>
            <span className="ml-[.45cqw] shrink-0" style={{fontSize:'.57cqw'}}>{task.dueLabel??(index===1?'60 MIN':'Today')}</span>
          </DataLine>;
        })}

        <DataLine left={5.75} top={58.65} width={9.3} height={3.7}>
          <span className="font-serif" style={{fontSize:'1.48cqw'}}>{timeRemaining}</span>
        </DataLine>
        <DataLine left={20.4} top={58.65} width={10.2} height={3.7}>
          <span className="font-serif" style={{fontSize:'1.48cqw'}}>{leaveReady}</span>
        </DataLine>

        {liveTasks.slice(0,3).map((task,index)=>{
          const lefts=[6.5,23.2,39.1];
          const widths=[12.6,12.5,13.1];
          return <DataLine key={`priority-${task.id}`} left={lefts[index]} top={80.55} width={widths[index]} height={3.0}>
            <span className="truncate font-serif" style={{fontSize:'1.05cqw'}}>{task.title}</span>
          </DataLine>;
        })}
        {liveTasks.slice(0,3).map((task,index)=>{
          const lefts=[6.5,23.2,39.1];
          return <DataLine key={`impact-${task.id}`} left={lefts[index]} top={85.9} width={9.2} height={2.2}>
            <span style={{fontSize:'.54cqw'}}>Impact: {priorityLabel(task.priority)}</span>
          </DataLine>;
        })}

        {schedule.map((item,index)=>{
          const topSets=[
            {time:14.1,title:16.45,note:21.0},
            {time:30.5,title:32.95,note:37.65},
            {time:47.0,title:49.25,note:54.0},
            {time:62.0,title:64.2,note:0},
          ];
          const p=topSets[index];
          return <div key={item.label}>
            <DataLine left={82.15} top={p.time} width={11.1} height={2.2}>
              <span style={{fontSize:'.59cqw'}}>{item.time}</span>
            </DataLine>
            <DataLine left={82.15} top={p.title} width={12.1} height={3.2}>
              <span className="truncate font-serif" style={{fontSize:'1.03cqw'}}>{item.title}</span>
            </DataLine>
            {p.note>0&&<DataLine left={82.15} top={p.note} width={12.2} height={2.2}>
              <span className="truncate" style={{fontSize:'.56cqw'}}>{item.note}</span>
            </DataLine>}
          </div>;
        })}

        {liveRoutines.slice(0,3).map((routine,index)=>{
          const tops=[78.55,82.7,86.85];
          return <DataLine key={routine.id} left={57.75} top={tops[index]} width={13.4} height={2.55}>
            <span className="truncate font-serif" style={{fontSize:'.66cqw'}}>{routine.name}</span>
          </DataLine>;
        })}

        <Hotspot label="Open current focus" style={hotspot(4.0,14.7,44.8,19.0)} onClick={()=>moveTo('/focus','Focus')} />
        <Hotspot label="What Now" style={hotspot(4.9,34.2,21.0,19.0)} onClick={()=>setPanel('what-now')} />
        <Hotspot label="Energy and Capacity" style={hotspot(26.4,34.2,21.7,19.0)} onClick={()=>setPanel('energy')} />
        <Hotspot label={focusRunning?'Pause focus timer':'Start focus timer'} style={hotspot(40.0,20.1,7.0,11.0)} onClick={()=>setFocusRunning(value=>!value)} />
        <Hotspot label="Replan My Day" style={hotspot(4.2,67.2,44.1,7.0)} onClick={replan} />
        <Hotspot label="Top 3 Priorities" style={hotspot(4.1,74.7,49.1,16.2)} onClick={()=>setPanel('priorities')} />
        <Hotspot label="Routines Due Now" style={hotspot(54.3,74.4,21.1,16.7)} onClick={()=>setPanel('routines')} />
        <Hotspot label="Ask Glow" style={hotspot(76.0,74.1,21.4,16.9)} onClick={()=>{setAskReceipt('');setPanel('ask');}} />
        <Hotspot label="Saint" style={hotspot(87.3,92.3,10.5,6.8)} onClick={()=>setPanel('saint')} />

        {schedule.map((item,index)=>{
          const tops=[10.4,27.1,43.4,58.7];
          return <Hotspot key={`moment-${item.label}`} label={item.label} style={hotspot(78.0,tops[index],18.8,14.2)} onClick={()=>openMoment(index)} />;
        })}

        <Hotspot label="Search Glow OS" style={hotspot(85.7,1.0,4.0,5.7)} onClick={()=>setPanel('search')} />
        <Hotspot label="Calendar" style={hotspot(90.5,1.0,4.0,5.7)} onClick={()=>moveTo('/calendar','Plan')} />
        <Hotspot label="Notifications" style={hotspot(95.0,1.0,4.0,5.7)} onClick={()=>moveTo('/notices','Attention')} />

        <Hotspot label="Today" style={hotspot(22.5,92.5,8.0,7.2)} onClick={()=>{}} />
        <Hotspot label="Plan" style={hotspot(33.0,92.5,8.0,7.2)} onClick={()=>moveTo('/planning','Plan')} />
        <Hotspot label="Life" style={hotspot(44.2,92.5,8.0,7.2)} onClick={()=>moveTo('/wellness','Life')} />
        <Hotspot label="Brain" style={hotspot(54.5,92.5,8.2,7.2)} onClick={()=>moveTo('/brain','Brain')} />
        <Hotspot label="Create" style={hotspot(65.0,92.5,8.4,7.2)} onClick={()=>moveTo('/world','Create')} />

        {focusRunning&&<div
          className="absolute z-40 grid place-items-center rounded-full bg-white/75 font-serif shadow-[0_0_28px_rgba(255,226,219,.78)] backdrop-blur-sm"
          style={{left:'41.5%',top:'21.55%',width:'4.4%',aspectRatio:'1'}}
        >
          <div className="text-center">
            <div style={{fontSize:'1.35cqw'}}>{focusMinutes}</div>
            <div className="tracking-[.12em]" style={{fontSize:'.42cqw'}}>MIN</div>
          </div>
        </div>}

        {replanned&&<>
          <div className="aura-ripple pointer-events-none absolute z-40 rounded-full border border-white/80 shadow-[0_0_60px_rgba(255,226,230,.8)]" style={{left:'60.4%',top:'23.4%',width:'9%',aspectRatio:'1'}}/>
          <div className="absolute z-40 rounded-full border border-white/80 bg-white/70 px-[1.1cqw] py-[.55cqw] shadow-lg backdrop-blur-md" style={{left:'18%',top:'68.7%',fontSize:'.63cqw'}}>
            Glow reorganized the day. Review before committing.
          </div>
        </>}

        {travel&&<div className="aura-ripple pointer-events-none absolute z-40 rounded-full border border-white/80 shadow-[0_0_70px_rgba(255,225,230,.8)]" style={{left:'60.4%',top:'23.4%',width:'10%',aspectRatio:'1'}}/>}

        {panel==='search'&&<Modal onClose={()=>setPanel(null)}>
          <p className="text-xs font-semibold tracking-[.2em]">SEARCH GLOW OS</p>
          <h2 className="mt-2 font-serif text-3xl">Cast light across your world.</h2>
          <input autoFocus value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Tasks, moments, routines…" className="mt-6 w-full rounded-2xl border border-[#d8c2bb] bg-white/60 px-4 py-3 outline-none focus:ring-2 focus:ring-[#cba6a0]" />
          <div className="mt-4 space-y-2">
            {searchText&&!searchResults.length&&<p className="text-sm opacity-70">No matching live items yet.</p>}
            {searchResults.map((result,index)=><div key={`${result.kind}-${index}`} className="rounded-xl bg-white/40 px-4 py-3"><span className="mr-2 text-[10px] font-semibold tracking-[.15em] opacity-60">{result.kind.toUpperCase()}</span>{result.title}</div>)}
          </div>
        </Modal>}

        {panel==='what-now'&&<Modal onClose={()=>setPanel(null)}>
          <p className="text-xs font-semibold tracking-[.2em]">WHAT NOW?</p>
          <h2 className="mt-2 font-serif text-3xl">Your next right three.</h2>
          <div className="mt-5 space-y-3">{liveTasks.slice(0,3).map((task,index)=><button key={task.id} onClick={()=>moveTo('/focus','Focus')} className="flex w-full items-center gap-3 rounded-2xl bg-white/45 px-4 py-3 text-left"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#ecd9d2]">{index+1}</span><span className="min-w-0 flex-1"><span className="block truncate font-serif text-lg">{task.title}</span><span className="text-xs opacity-60">{task.dueLabel??'Today'} · {priorityLabel(task.priority)} impact</span></span></button>)}</div>
        </Modal>}

        {panel==='energy'&&<Modal onClose={()=>setPanel(null)}>
          <p className="text-xs font-semibold tracking-[.2em]">ENERGY & CAPACITY</p>
          <div className="mt-4 flex items-center gap-8">
            <div className="grid h-32 w-32 place-items-center rounded-full border-2 border-[#d9bdb5] bg-white/40 text-center"><div><div className="font-serif text-5xl">{capacity}</div><div className="font-serif">Radiant</div></div></div>
            <div className="flex-1 space-y-3">{[['Mental',capacity],['Emotional',emotional],['Physical',physical],['Creative',creative]].map(([label,value])=><div key={String(label)}><div className="mb-1 flex justify-between text-xs"><span>{label}</span><span>{value}%</span></div><div className="h-1 rounded-full bg-[#ddcec9]"><div className="h-full rounded-full bg-[#cda39c]" style={{width:`${value}%`}}/></div></div>)}</div>
          </div>
          {sleepHours!=null&&<p className="mt-5 text-sm opacity-70">Last recorded sleep: {sleepHours} hours.</p>}
        </Modal>}

        {panel==='priorities'&&<Modal onClose={()=>setPanel(null)}>
          <p className="text-xs font-semibold tracking-[.2em]">TOP 3 PRIORITIES</p>
          <h2 className="mt-2 font-serif text-3xl">What deserves your light.</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">{liveTasks.slice(0,3).map((task,index)=><div key={task.id} className="rounded-2xl bg-white/42 p-4"><p className="text-[10px] tracking-[.15em] opacity-60">{['CREATE','CARE','PLAN'][index]}</p><p className="mt-2 font-serif text-xl">{task.title}</p><p className="mt-2 text-xs opacity-60">Impact: {priorityLabel(task.priority)}</p></div>)}</div>
        </Modal>}

        {panel==='routines'&&<Modal onClose={()=>setPanel(null)}>
          <p className="text-xs font-semibold tracking-[.2em]">ROUTINES DUE NOW</p>
          <h2 className="mt-2 font-serif text-3xl">Move through the pathway.</h2>
          <div className="mt-5 divide-y divide-[#d9c8c2]">{liveRoutines.slice(0,5).map((routine,index)=><button key={routine.id} onClick={()=>moveTo('/routines','Routine')} className="flex w-full items-center gap-3 py-3 text-left"><span className="min-w-0 flex-1 truncate font-serif text-lg">{routine.name}</span><span className="text-xs opacity-60">{[5,10,7,12,8][index]??8} MIN</span><span className="h-5 w-5 rounded-full border border-[#a9857d]"/></button>)}</div>
        </Modal>}

        {panel==='ask'&&<Modal onClose={()=>setPanel(null)}>
          <p className="text-xs font-semibold tracking-[.2em]">ASK GLOW ✧</p>
          <h2 className="mt-2 font-serif text-3xl">Your oracle. Your clarity.</h2>
          <form onSubmit={submitAsk} className="mt-5">
            <textarea autoFocus value={askText} onChange={e=>setAskText(e.target.value)} placeholder="What would make today iconic?" className="min-h-32 w-full resize-none rounded-2xl border border-[#d7c0b9] bg-white/55 p-4 outline-none focus:ring-2 focus:ring-[#cba6a0]"/>
            <button type="submit" className="mt-3 rounded-full bg-[#3b2d29] px-5 py-2.5 text-sm text-white">Ask Glow</button>
          </form>
          {askReceipt&&<div className="mt-4 rounded-2xl bg-white/45 p-4 text-sm leading-relaxed">{askReceipt}</div>}
        </Modal>}

        {panel==='saint'&&<Modal onClose={()=>setPanel(null)}>
          <p className="text-xs font-semibold tracking-[.2em]">SAINT</p>
          <h2 className="mt-2 font-serif text-3xl">Saint is with you. ♡</h2>
          <p className="mt-4 text-sm leading-relaxed opacity-75">His Today context remains connected to walks, routines, leave-ready timing, and the Life world without turning this room into another dashboard.</p>
        </Modal>}

        {panel==='moment'&&<Modal onClose={()=>setPanel(null)}>
          <p className="text-xs font-semibold tracking-[.2em]">{schedule[momentIndex].label}</p>
          <h2 className="mt-2 font-serif text-3xl">{schedule[momentIndex].title}</h2>
          <p className="mt-2 text-sm">{schedule[momentIndex].time}</p>
          {schedule[momentIndex].note&&<p className="mt-3 text-sm opacity-70">{schedule[momentIndex].note}</p>}
          <p className="mt-5 text-sm leading-relaxed opacity-70">This moment expanded from Today without losing your current position.</p>
          <button type="button" onClick={()=>moveTo(schedule[momentIndex].href,schedule[momentIndex].label)} className="mt-5 rounded-full bg-[#3b2d29] px-5 py-2.5 text-sm text-white">Move into time</button>
        </Modal>}
      </div>
    </div>
  </main>;
}
