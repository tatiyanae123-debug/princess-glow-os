'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CalendarDays,
  Check,
  Mic,
  PawPrint,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
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

type Panel = 'search'|'notifications'|'ask'|'routines'|'what-now'|'energy'|'priorities'|'schedule'|'focus'|'saint'|null;

type ScheduleItem = {
  label:string;
  time:string;
  title:string;
  duration:string;
  note:string;
};

type WorldTarget = { label:string; href:string; climate:string };

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

const worlds: WorldTarget[] = [
  {label:'Today',href:'/today',climate:'today'},
  {label:'Plan',href:'/planning',climate:'plan'},
  {label:'Life',href:'/world',climate:'life'},
  {label:'Brain',href:'/brain',climate:'brain'},
  {label:'Create',href:'/create',climate:'create'},
];

const priorityRank: Record<string,number> = { urgent:5, high:4, medium:3, low:2 };

function box(left:number,top:number,width:number,height:number):CSSProperties{
  return {left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`};
}

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

function durationLabel(ms:number){
  const total=Math.max(0,Math.floor(ms/60000));
  const hours=Math.floor(total/60);
  const minutes=total%60;
  return `${hours}H ${String(minutes).padStart(2,'0')}M`;
}

function greetingFor(hour:number){
  if(hour>=5&&hour<12) return 'Good morning, Princess ♡';
  if(hour>=12&&hour<17) return 'Good afternoon, Princess ♡';
  if(hour>=17&&hour<21) return 'Good evening, Princess ♡';
  return 'Good night, Princess ♡';
}

function taskMeta(task:TaskLite|undefined,index:number){
  const raw=task?.dueLabel?.trim();
  if(raw&&/(today|tomorrow|minute|min|hour|hr)/i.test(raw)) return raw.replace(/minutes?/i,'MIN').replace(/hours?/i,'HR');
  if(index===1) return '60 MIN';
  return 'Today';
}

function titleSize(title:string,base:number,min:number){
  const amount=Math.max(0,title.length-20);
  return `${Math.max(min,base-amount*.018)}cqw`;
}

function Hotspot({label,style,onClick}:{label:string;style:CSSProperties;onClick:()=>void}){
  return <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    style={style}
    className="absolute z-40 rounded-[1cqw] bg-transparent outline-none transition focus-visible:ring-2 focus-visible:ring-[#b98d86] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
  />;
}

export function TodayLivingCenter({tasks,events,routines,energy,mood,sleepHours,glowMessage}:Props){
  const router=useRouter();
  const [now,setNow]=useState<Date|null>(null);
  const [panel,setPanel]=useState<Panel>(null);
  const [selectedSchedule,setSelectedSchedule]=useState(0);
  const [travel,setTravel]=useState<WorldTarget|null>(null);
  const [ripple,setRipple]=useState(0);
  const [receipt,setReceipt]=useState('');
  const [searchText,setSearchText]=useState('');
  const [askText,setAskText]=useState('');
  const [askReceipt,setAskReceipt]=useState('');
  const [focusSeconds,setFocusSeconds]=useState(47*60);
  const [focusActive,setFocusActive]=useState(false);
  const [displayTasks,setDisplayTasks]=useState<TaskLite[]>(tasks.length?tasks:fallbackTasks);
  const [replanned,setReplanned]=useState(false);

  useEffect(()=>{
    const tick=()=>setNow(new Date());
    tick();
    const id=window.setInterval(tick,1000);
    return ()=>window.clearInterval(id);
  },[]);

  useEffect(()=>{
    setDisplayTasks(tasks.length?tasks:fallbackTasks);
  },[tasks]);

  useEffect(()=>{
    if(!focusActive) return;
    const id=window.setInterval(()=>setFocusSeconds(value=>Math.max(0,value-1)),1000);
    return ()=>window.clearInterval(id);
  },[focusActive]);

  useEffect(()=>{
    if(focusSeconds===0) setFocusActive(false);
  },[focusSeconds]);

  useEffect(()=>{
    if(!panel) return;
    const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setPanel(null);};
    window.addEventListener('keydown',close);
    return ()=>window.removeEventListener('keydown',close);
  },[panel]);

  useEffect(()=>{
    if(!receipt) return;
    const id=window.setTimeout(()=>setReceipt(''),3400);
    return ()=>window.clearTimeout(id);
  },[receipt]);

  const liveRoutines=routines.length?routines:fallbackRoutines;
  const current=now;
  const hour=current?.getHours()??10;
  const greeting=greetingFor(hour);
  const dateLabel=current?.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase()??'';
  const timeLabel=current?.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})??'';
  const capacity=Math.max(35,Math.min(96,energy?Math.round(energy*10):82));
  const emotional=Math.max(35,Math.min(96,mood?Math.round(mood*10):85));
  const physical=Math.max(40,Math.min(96,energy?Math.round(energy*10-8):70));
  const creative=Math.max(55,Math.min(98,capacity+13));
  const endOfDay=current?new Date(current):null;
  if(endOfDay) endOfDay.setHours(23,59,59,999);
  const timeRemaining=current&&endOfDay?durationLabel(endOfDay.getTime()-current.getTime()):'7H 16M';

  const futureEvents=useMemo(()=>{
    if(!current) return events;
    const future=events.filter(event=>{
      const date=parseTimeLabel(event.timeLabel,current);
      return !date||date>=current;
    });
    return future.length?future:events;
  },[events,current]);

  const nextEventDate=current?futureEvents.map(event=>parseTimeLabel(event.timeLabel,current)).find((value):value is Date=>Boolean(value&&value>current))??null:null;
  const wrapAt=current?(nextEventDate?new Date(nextEventDate.getTime()-30*60000):new Date(current.getTime()+4*60*60000+7*60000)):null;
  const leaveReady=current&&wrapAt?durationLabel(wrapAt.getTime()-current.getTime()):'4H 07M';

  const schedule:ScheduleItem[]=useMemo(()=>[
    {label:'NEXT',time:futureEvents[0]?.timeLabel??'12:00 PM',title:futureEvents[0]?.title??'Lunch + Call',duration:'1H 00M',note:futureEvents[0]?.location??'Nourish & connect'},
    {label:'LATER',time:futureEvents[1]?.timeLabel??'2:30 PM',title:futureEvents[1]?.title??'Creative Planning',duration:'2H 00M',note:futureEvents[1]?.location??'Deep work'},
    {label:'TONIGHT',time:futureEvents[2]?.timeLabel??'7:00 PM',title:futureEvents[2]?.title??'Wind Down',duration:'1H 00M',note:futureEvents[2]?.location??'Reset & reflect'},
    {label:'TOMORROW',time:'Preview',title:'A quiet glimpse',duration:'',note:''},
  ],[futureEvents]);

  const currentTask=displayTasks[0]??fallbackTasks[0];
  const topThree=[...displayTasks].sort((a,b)=>(priorityRank[b.priority]??0)-(priorityRank[a.priority]??0)).slice(0,3);
  while(topThree.length<3) topThree.push(fallbackTasks[topThree.length]);
  const focusMinutes=Math.max(0,Math.ceil(focusSeconds/60));

  function triggerRipple(message:string){
    setRipple(value=>value+1);
    setReceipt(message);
  }

  function moveWorld(target:WorldTarget){
    if(target.href==='/today'){
      triggerRipple('You are already in Today · The Living Center.');
      return;
    }
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduced){router.push(target.href);return;}
    setTravel(target);
    triggerRipple(`Moving toward ${target.label}. Your Today context stays connected.`);
    window.setTimeout(()=>router.push(target.href),680);
  }

  function replanDay(){
    const reordered=[...displayTasks].sort((a,b)=>{
      const priority=(priorityRank[b.priority]??0)-(priorityRank[a.priority]??0);
      if(priority!==0)return priority;
      return a.title.length-b.title.length;
    });
    setDisplayTasks(reordered);
    setReplanned(true);
    setPanel(null);
    triggerRipple('Glow reorganized the visible day around priority and capacity.');
  }

  function submitAsk(event:FormEvent){
    event.preventDefault();
    if(!askText.trim())return;
    setAskReceipt(glowMessage||'Glow understood your request and kept the current Today context attached.');
    triggerRipple('Glow understood something and changed the world around your request.');
  }

  const climateOverlay=travel?.climate==='plan'
    ?'rgba(199,208,242,.24)'
    :travel?.climate==='brain'
      ?'rgba(77,69,116,.28)'
      :travel?.climate==='life'
        ?'rgba(244,203,193,.18)'
        :travel?.climate==='create'
          ?'rgba(255,255,255,.20)'
          :'transparent';

  return <div className="fixed inset-0 z-[1] overflow-hidden bg-[#f4ebe6] text-[#2e2725]">
    <style>{`
      @keyframes auraRipple{0%{opacity:0;transform:translate(-50%,-50%) scale(.18)}28%{opacity:.86}100%{opacity:0;transform:translate(-50%,-50%) scale(3.6)}}
      @keyframes worldMove{0%{transform:scale(1) translate3d(0,0,0);filter:saturate(1)}100%{transform:scale(1.018) translate3d(-.8%,0,0);filter:saturate(.95)}}
      @keyframes receiptIn{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
      .glow-scene-moving{animation:worldMove .68s cubic-bezier(.2,.75,.2,1) both}
      .aura-ripple{animation:auraRipple .78s cubic-bezier(.12,.7,.18,1) both}
      .glow-receipt{animation:receiptIn .24s ease-out both}
      .glow-mask{position:absolute;z-index:22;color:#2e2725;overflow:hidden}
      .glow-mask-panel{background:linear-gradient(135deg,rgba(250,241,237,.86),rgba(247,235,231,.74));backdrop-filter:blur(2px);-webkit-backdrop-filter:blur(2px);border-radius:.45cqw}
      .glow-mask-greeting{background:linear-gradient(90deg,rgba(249,241,237,.98) 0%,rgba(249,241,237,.94) 74%,rgba(249,241,237,0) 100%)}
      .glow-mask-timeline{background:linear-gradient(90deg,rgba(246,236,232,.88) 0%,rgba(246,236,232,.72) 82%,rgba(246,236,232,0) 100%);backdrop-filter:blur(1px);-webkit-backdrop-filter:blur(1px)}
      .glow-modal{background:linear-gradient(135deg,rgba(255,250,247,.94),rgba(243,230,225,.9));box-shadow:0 28px 90px rgba(91,68,60,.18),inset 0 1px 0 rgba(255,255,255,.96);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px)}
      @media (prefers-reduced-motion:reduce){.glow-scene-moving,.aura-ripple,.glow-receipt{animation:none!important}}
      @media (max-width:760px) and (orientation:portrait){
        .glow-viewport{justify-content:flex-start!important;overflow:auto!important;align-items:flex-start!important}
        .glow-scene{width:1180px!important;min-width:1180px!important;height:885px!important;min-height:885px!important}
      }
    `}</style>

    <div className="glow-viewport flex h-[100dvh] w-full items-start justify-center overflow-hidden bg-[#f4ebe6] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div
        className={`glow-scene relative aspect-[4/3] shrink-0 overflow-hidden ${travel?'glow-scene-moving':''}`}
        style={{width:'min(100vw,133.333dvh)',containerType:'inline-size'}}
      >
        <img
          src={TODAY_LIVING_CENTER_REFERENCE}
          alt="Glow OS Today · The Living Center"
          className="absolute inset-0 h-full w-full select-none object-cover"
          draggable={false}
        />

        <div className="pointer-events-none absolute inset-0 z-10 transition-colors duration-700" style={{background:climateOverlay}}/>

        {ripple>0&&<div key={ripple} className="aura-ripple pointer-events-none absolute left-[58.4%] top-[28.3%] z-30 aspect-square w-[10cqw] rounded-full border-[.12cqw] border-white/80 shadow-[0_0_2cqw_.7cqw_rgba(255,255,255,.65),0_0_5cqw_1.3cqw_rgba(228,199,205,.32)]"/>}

        <div className="glow-mask glow-mask-greeting" style={box(3.25,5.15,31.8,8.05)}>
          <div className="pt-[.2cqw] font-serif leading-[1.02] tracking-[-.035em]" style={{fontSize:'2.63cqw'}}>{greeting}</div>
          <div className="mt-[.72cqw] font-medium tracking-[.14em]" style={{fontSize:'.72cqw'}}>{dateLabel}</div>
        </div>

        <div className="glow-mask glow-mask-panel" style={box(5.35,24.15,30.8,8.6)}>
          <div className="flex h-full flex-col justify-center px-[.3cqw]">
            <div className="font-serif leading-[1.05]" style={{fontSize:titleSize(currentTask.title,1.72,1.22)}}>{currentTask.title}</div>
            <div className="mt-[.48cqw] tracking-[.01em]" style={{fontSize:'.78cqw'}}>High focus &nbsp;·&nbsp; Creative work</div>
            <div className="mt-[.7cqw] font-serif italic text-[#9d756e]" style={{fontSize:'.88cqw'}}>This is your moment.</div>
          </div>
        </div>

        <div className="glow-mask glow-mask-panel" style={box(40.45,16.05,7.2,16.6)}>
          <div className="pt-[.2cqw] text-center font-medium" style={{fontSize:'.75cqw'}}>{timeLabel}</div>
          <button
            type="button"
            aria-label={focusActive?'Pause focus timer':'Start focus timer'}
            onClick={()=>{setFocusActive(value=>!value);setPanel('focus');}}
            className="mx-auto mt-[1.18cqw] grid aspect-square w-[5.8cqw] place-items-center rounded-full border-[.24cqw] border-[#d8c1b9] bg-white/18 shadow-[inset_0_0_1.2cqw_rgba(255,255,255,.7)] outline-none focus-visible:ring-2 focus-visible:ring-[#b98d86]"
          >
            <div className="text-center"><div className="font-serif leading-none" style={{fontSize:'2.2cqw'}}>{focusMinutes}</div><div className="tracking-[.14em]" style={{fontSize:'.62cqw'}}>MIN</div></div>
          </button>
          <div className="mt-[.7cqw] text-center tracking-[.12em]" style={{fontSize:'.54cqw'}}>{focusActive?'FOCUSING':'FOCUS TIME'}</div>
        </div>

        <div className="glow-mask glow-mask-panel" style={box(5.45,41.2,19.8,11.2)}>
          <div className="px-[.5cqw] pt-[.05cqw]" style={{fontSize:'.66cqw'}}>Your next right 3.</div>
          <div className="mt-[.56cqw] space-y-[.38cqw] px-[.45cqw]">
            {displayTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" onClick={()=>setPanel('what-now')} className="grid w-full grid-cols-[1.2cqw_1fr_auto] items-center gap-[.38cqw] rounded-[.34cqw] border border-[#d8c7c0]/65 bg-white/18 px-[.42cqw] py-[.43cqw] text-left outline-none focus-visible:ring-1 focus-visible:ring-[#b98d86]" style={{fontSize:'.62cqw'}}><span className="grid aspect-square place-items-center rounded-[.22cqw] bg-[#ead7d0]">{index+1}</span><span className="min-w-0 font-serif leading-tight" style={{fontSize:titleSize(task.title,.72,.55)}}>{task.title}</span><span className="whitespace-nowrap">{taskMeta(task,index)}</span></button>)}
          </div>
        </div>

        <div className="glow-mask glow-mask-panel" style={box(28.0,40.9,18.9,12.0)}>
          <div className="grid h-full grid-cols-[7.0cqw_1fr] items-center gap-[.6cqw] px-[.15cqw]">
            <button type="button" onClick={()=>setPanel('energy')} className="grid aspect-square w-[6.5cqw] place-items-center rounded-full border-[.19cqw] border-[#dbc3bb] bg-white/14 outline-none focus-visible:ring-2 focus-visible:ring-[#b98d86]"><div className="text-center"><div className="font-serif leading-none" style={{fontSize:'2.45cqw'}}>{capacity}</div><div className="font-serif" style={{fontSize:'.72cqw'}}>Radiant</div></div></button>
            <div className="space-y-[.66cqw]">{[['Mental',capacity],['Emotional',emotional],['Physical',physical],['Creative',creative]].map(([label,value])=><div key={String(label)} className="grid grid-cols-[3.55cqw_1fr_2.15cqw] items-center gap-[.35cqw]" style={{fontSize:'.56cqw'}}><span className="font-serif">{label}</span><div className="h-[.19cqw] rounded-full bg-[#d9ccc7]"><div className="h-full rounded-full bg-[#c99e98]" style={{width:`${value}%`}}/></div><span>{value}%</span></div>)}</div>
          </div>
        </div>

        <div className="glow-mask glow-mask-panel" style={box(5.35,58.15,14.9,6.1)}>
          <div className="px-[.35cqw] pt-[.2cqw]"><div className="font-serif" style={{fontSize:'1.45cqw'}}>{timeRemaining}</div><div className="mt-[.2cqw]" style={{fontSize:'.53cqw'}}>until day’s end</div></div>
        </div>

        <div className="glow-mask glow-mask-panel" style={box(22.45,58.1,19.2,6.2)}>
          <div className="px-[.3cqw] pt-[.2cqw]"><div className="font-serif" style={{fontSize:'1.45cqw'}}>{leaveReady}</div><div className="mt-[.2cqw]" style={{fontSize:'.53cqw'}}>ideal wrap time {schedule[0]?.time??'2:30 PM'}</div></div>
        </div>

        {topThree.map((task,index)=>{
          const positions=[[5.25,80.1,12.7,9.2],[21.2,80.1,12.7,9.2],[37.25,80.1,12.0,9.2]] as const;
          const [left,top,width,height]=positions[index];
          const label=index===0?'CREATE':index===1?'CARE':'PLAN';
          const description=index===0?'Ship the highest-value edit':index===1?'Nourish the day':'Map the next move';
          return <button key={task.id} type="button" onClick={()=>setPanel('priorities')} className="glow-mask glow-mask-panel text-left outline-none focus-visible:ring-2 focus-visible:ring-[#b98d86]" style={box(left,top,width,height)}>
            <div className="px-[.25cqw] pt-[.15cqw]"><div className="tracking-[.12em]" style={{fontSize:'.48cqw'}}>{label}</div><div className="mt-[.45cqw] font-serif leading-[1.03]" style={{fontSize:titleSize(task.title,1.1,.72)}}>{task.title}</div><div className="mt-[.34cqw] leading-tight" style={{fontSize:'.55cqw'}}>{description}</div><div className="mt-[.3cqw]" style={{fontSize:'.52cqw'}}>Impact: {task.priority==='high'||task.priority==='urgent'?'High':'Medium'}</div></div>
          </button>;
        })}

        {schedule.map((item,index)=>{
          const positions=[[81.25,14.7,15.0,10.0],[81.25,30.0,15.0,11.3],[81.25,47.2,15.0,11.0],[81.25,63.5,15.0,8.7]] as const;
          const [left,top,width,height]=positions[index];
          return <button key={item.label} type="button" onClick={()=>{setSelectedSchedule(index);setPanel('schedule');triggerRipple(`${item.label} stayed connected to Today while it came into focus.`);}} className="glow-mask glow-mask-timeline text-left outline-none focus-visible:ring-2 focus-visible:ring-[#b98d86]" style={box(left,top,width,height)}>
            <div className="px-[.2cqw] pt-[.1cqw]"><div className="font-semibold tracking-[.16em]" style={{fontSize:'.82cqw'}}>{item.label}</div><div className="mt-[.55cqw]" style={{fontSize:'.62cqw'}}>{item.time}</div><div className="mt-[.3cqw] font-serif leading-tight" style={{fontSize:titleSize(item.title,1.0,.67)}}>{item.title}</div>{item.duration&&<div className="mt-[.35cqw] tracking-[.06em]" style={{fontSize:'.53cqw'}}>{item.duration}</div>}{item.note&&<div className="mt-[.38cqw] font-serif" style={{fontSize:'.56cqw'}}>{item.note}</div>}</div>
          </button>;
        })}

        <div className="glow-mask glow-mask-panel" style={box(55.25,78.7,17.2,10.5)}>
          <div className="space-y-[.58cqw] px-[.45cqw] pt-[.2cqw]">{liveRoutines.slice(0,3).map((routine,index)=><button key={routine.id} type="button" onClick={()=>setPanel('routines')} className="grid w-full grid-cols-[1fr_auto_1.2cqw] items-center gap-[.38cqw] border-b border-[#d7c8c2]/55 pb-[.45cqw] text-left outline-none focus-visible:ring-1 focus-visible:ring-[#b98d86]" style={{fontSize:'.56cqw'}}><span className="font-serif leading-tight">{routine.name}</span><span>{index===0?'5 MIN':index===1?'10 MIN':'7 MIN'}</span><span className="grid aspect-square place-items-center rounded-full border border-[#9b7d76]/70"> </span></button>)}</div>
        </div>

        <Hotspot label="Search Glow OS" style={box(86.0,2.35,3.8,5.2)} onClick={()=>setPanel('search')}/>
        <Hotspot label="Open Today timeline" style={box(90.3,2.35,3.8,5.2)} onClick={()=>{setSelectedSchedule(0);setPanel('schedule');}}/>
        <Hotspot label="Notifications" style={box(94.5,2.35,3.8,5.2)} onClick={()=>setPanel('notifications')}/>
        <Hotspot label="Current focus" style={box(3.5,14.0,46.0,19.2)} onClick={()=>setPanel('focus')}/>
        <Hotspot label="What Now" style={box(4.1,35.3,21.7,18.1)} onClick={()=>setPanel('what-now')}/>
        <Hotspot label="Energy and capacity" style={box(27.1,35.3,21.7,18.1)} onClick={()=>setPanel('energy')}/>
        <Hotspot label="Replan My Day" style={box(3.5,67.1,46.0,6.8)} onClick={()=>replanDay()}/>
        <Hotspot label="Top three priorities" style={box(3.5,74.6,46.0,15.2)} onClick={()=>setPanel('priorities')}/>
        <Hotspot label="Routines due now" style={box(53.0,74.7,20.2,15.3)} onClick={()=>setPanel('routines')}/>
        <Hotspot label="Ask Glow" style={box(73.9,74.7,22.6,15.3)} onClick={()=>{setAskReceipt('');setPanel('ask');}}/>
        <Hotspot label="Saint" style={box(85.0,91.0,7.0,5.2)} onClick={()=>setPanel('saint')}/>

        {worlds.map((target,index)=><Hotspot key={target.label} label={`Move toward ${target.label}`} style={box(22.4+index*10.3,91.0,9.3,6.1)} onClick={()=>moveWorld(target)}/>)}

        {receipt&&<div className="glow-receipt absolute left-1/2 top-[66.5%] z-50 max-w-[29cqw] -translate-x-1/2 rounded-full border border-white/75 bg-[rgba(255,248,244,.82)] px-[1.25cqw] py-[.72cqw] text-center shadow-[0_12px_40px_rgba(101,73,66,.13)] backdrop-blur-xl" style={{fontSize:'.67cqw'}}><Sparkles className="mr-[.45cqw] inline-block" size="1cqw"/>{receipt}</div>}

        {panel&&<div className="absolute inset-0 z-[70] flex items-center justify-center bg-[rgba(77,61,56,.12)] p-[3cqw] backdrop-blur-[2px]" onMouseDown={event=>{if(event.target===event.currentTarget)setPanel(null);}}>
          <section className="glow-modal relative w-[38cqw] max-w-[92vw] rounded-[2cqw] border border-white/80 p-[2.2cqw]">
            <button type="button" aria-label="Close" onClick={()=>setPanel(null)} className="absolute right-[1.2cqw] top-[1.2cqw] grid aspect-square w-[2.5cqw] place-items-center rounded-full border border-white/80 bg-white/45 outline-none focus-visible:ring-2 focus-visible:ring-[#b98d86]"><X size="1.2cqw"/></button>

            {panel==='search'&&<><div className="tracking-[.18em]" style={{fontSize:'.62cqw'}}>SEARCH · CAST LIGHT ACROSS GLOW</div><h2 className="mt-[.55cqw] font-serif" style={{fontSize:'2cqw'}}>What are you looking for?</h2><div className="relative mt-[1.6cqw]"><Search className="absolute left-[1cqw] top-1/2 -translate-y-1/2" size="1.15cqw"/><input autoFocus value={searchText} onChange={event=>setSearchText(event.target.value)} placeholder="Search tasks, people, memories, routines…" className="w-full rounded-[1cqw] border border-white/80 bg-white/52 py-[.95cqw] pl-[3cqw] pr-[1cqw] outline-none focus:ring-2 focus:ring-[#b98d86]" style={{fontSize:'.82cqw'}}/></div><div className="mt-[1.2cqw] text-[#6f5e58]" style={{fontSize:'.7cqw'}}>{searchText?`Glow is keeping “${searchText}” connected to Today while you search.`:'Results will stay grouped by meaning, not just file type.'}</div></>}

            {panel==='notifications'&&<><div className="tracking-[.18em]" style={{fontSize:'.62cqw'}}>ATTENTION CENTER</div><h2 className="mt-[.55cqw] font-serif" style={{fontSize:'2cqw'}}>Nothing urgent is pulling you away.</h2><div className="mt-[1.4cqw] grid gap-[.7cqw]" style={{fontSize:'.76cqw'}}><div className="rounded-[1cqw] border border-white/75 bg-white/35 p-[1cqw]">Needs attention now · clear</div><div className="rounded-[1cqw] border border-white/75 bg-white/35 p-[1cqw]">Soon · your next scheduled moment remains visible on the timeline</div><div className="rounded-[1cqw] border border-white/75 bg-white/35 p-[1cqw]">Safe to ignore · everything else</div></div></>}

            {panel==='focus'&&<><div className="tracking-[.18em]" style={{fontSize:'.62cqw'}}>FOCUS · CURRENT MOMENT</div><h2 className="mt-[.55cqw] font-serif" style={{fontSize:'2.15cqw'}}>{currentTask.title}</h2><div className="mt-[1.3cqw] flex items-center gap-[1.4cqw]"><button type="button" onClick={()=>setFocusActive(value=>!value)} className="grid aspect-square w-[7cqw] place-items-center rounded-full border-[.22cqw] border-[#d8c1b9] bg-white/42"><div className="text-center"><div className="font-serif" style={{fontSize:'2.6cqw'}}>{focusMinutes}</div><div style={{fontSize:'.62cqw'}}>MIN</div></div></button><div style={{fontSize:'.76cqw'}}><div>High focus · Creative work</div><div className="mt-[.5cqw] text-[#765f59]">The current moment stays tied to Today instead of opening a disconnected screen.</div><button type="button" onClick={()=>setFocusActive(value=>!value)} className="mt-[1cqw] rounded-full border border-white/80 bg-white/55 px-[1.2cqw] py-[.65cqw]">{focusActive?'Pause focus':'Start focused session'}</button></div></div></>}

            {panel==='what-now'&&<><div className="tracking-[.18em]" style={{fontSize:'.62cqw'}}>WHAT NOW?</div><h2 className="mt-[.55cqw] font-serif" style={{fontSize:'2cqw'}}>Your next right three.</h2><div className="mt-[1.2cqw] grid gap-[.65cqw]">{displayTasks.slice(0,3).map((task,index)=><div key={task.id} className="grid grid-cols-[2cqw_1fr_auto] items-center gap-[.7cqw] rounded-[1cqw] border border-white/80 bg-white/38 p-[.85cqw]" style={{fontSize:'.74cqw'}}><span className="grid aspect-square place-items-center rounded-[.55cqw] bg-[#ead7d0]">{index+1}</span><span className="font-serif" style={{fontSize:'1cqw'}}>{task.title}</span><span>{taskMeta(task,index)}</span></div>)}</div></>}

            {panel==='energy'&&<><div className="tracking-[.18em]" style={{fontSize:'.62cqw'}}>ENERGY & CAPACITY</div><h2 className="mt-[.55cqw] font-serif" style={{fontSize:'2cqw'}}>{capacity} · Radiant</h2><div className="mt-[1.2cqw] grid gap-[.8cqw]">{[['Mental',capacity],['Emotional',emotional],['Physical',physical],['Creative',creative]].map(([label,value])=><div key={String(label)} className="grid grid-cols-[7cqw_1fr_3cqw] items-center gap-[.8cqw]" style={{fontSize:'.76cqw'}}><span>{label}</span><div className="h-[.35cqw] rounded-full bg-[#d9ccc7]"><div className="h-full rounded-full bg-[#c99e98]" style={{width:`${value}%`}}/></div><span>{value}%</span></div>)}</div><div className="mt-[1.2cqw] text-[#715f59]" style={{fontSize:'.7cqw'}}>{sleepHours!=null?`${sleepHours.toFixed(1)} hours of sleep are part of this context.`:'Sleep has not been logged yet.'}</div></>}

            {panel==='priorities'&&<><div className="tracking-[.18em]" style={{fontSize:'.62cqw'}}>TOP 3 PRIORITIES</div><h2 className="mt-[.55cqw] font-serif" style={{fontSize:'2cqw'}}>The three things carrying today.</h2><div className="mt-[1.2cqw] grid grid-cols-3 gap-[.75cqw]">{topThree.map((task,index)=><div key={task.id} className="rounded-[1cqw] border border-white/80 bg-white/38 p-[.9cqw]"><div className="tracking-[.13em]" style={{fontSize:'.52cqw'}}>{index===0?'CREATE':index===1?'CARE':'PLAN'}</div><div className="mt-[.5cqw] font-serif leading-tight" style={{fontSize:'1cqw'}}>{task.title}</div><div className="mt-[.7cqw]" style={{fontSize:'.64cqw'}}>Impact: {task.priority==='high'||task.priority==='urgent'?'High':'Medium'}</div></div>)}</div></>}

            {panel==='routines'&&<><div className="tracking-[.18em]" style={{fontSize:'.62cqw'}}>ROUTINES DUE NOW</div><h2 className="mt-[.55cqw] font-serif" style={{fontSize:'2cqw'}}>Follow the pathway, one step at a time.</h2><div className="mt-[1.2cqw] grid gap-[.65cqw]">{liveRoutines.slice(0,5).map((routine,index)=><button key={routine.id} type="button" onClick={()=>triggerRipple(`${routine.name} is ready. Glow kept the rest of the routine nearby.`)} className="flex items-center gap-[.75cqw] rounded-[1cqw] border border-white/80 bg-white/38 p-[.85cqw] text-left" style={{fontSize:'.76cqw'}}><span className="grid aspect-square w-[1.4cqw] place-items-center rounded-full border border-[#9b7d76]/70"><Check size=".8cqw" className="opacity-0"/></span><span className="flex-1 font-serif" style={{fontSize:'.95cqw'}}>{routine.name}</span><span>{index===0?'5 MIN':index===1?'10 MIN':'7 MIN'}</span></button>)}</div></>}

            {panel==='schedule'&&<><div className="tracking-[.18em]" style={{fontSize:'.62cqw'}}>TIME · {schedule[selectedSchedule]?.label}</div><h2 className="mt-[.55cqw] font-serif" style={{fontSize:'2.1cqw'}}>{schedule[selectedSchedule]?.title}</h2><div className="mt-[1.0cqw]" style={{fontSize:'.78cqw'}}>{schedule[selectedSchedule]?.time}{schedule[selectedSchedule]?.duration?` · ${schedule[selectedSchedule].duration}`:''}</div>{schedule[selectedSchedule]?.note&&<div className="mt-[.55cqw] font-serif text-[#725f59]" style={{fontSize:'.82cqw'}}>{schedule[selectedSchedule].note}</div>}<div className="mt-[1.4cqw] rounded-[1cqw] border border-white/80 bg-white/36 p-[1cqw]" style={{fontSize:'.72cqw'}}>This moment expanded from its existing place on the Today timeline. Today remains visible behind it, preserving positional and context continuity.</div>{selectedSchedule<3&&<button type="button" onClick={()=>moveWorld(worlds[1])} className="mt-[1cqw] rounded-full border border-white/80 bg-white/55 px-[1.2cqw] py-[.7cqw]" style={{fontSize:'.72cqw'}}>Let this time surface become Plan</button>}</>}

            {panel==='saint'&&<><div className="flex items-center gap-[.7cqw] tracking-[.18em]" style={{fontSize:'.62cqw'}}><PawPrint size="1.1cqw"/>SAINT</div><h2 className="mt-[.55cqw] font-serif" style={{fontSize:'2cqw'}}>Saint is still part of the room.</h2><div className="mt-[1.2cqw] rounded-[1cqw] border border-white/80 bg-white/36 p-[1cqw]" style={{fontSize:'.76cqw'}}>Walks, routines, appointments, and care moments can remain attached to Today instead of becoming a separate pet dashboard.</div></>}

            {panel==='ask'&&<form onSubmit={submitAsk}><div className="flex items-center gap-[.6cqw] tracking-[.18em]" style={{fontSize:'.62cqw'}}><Sparkles size="1cqw"/>ASK GLOW</div><h2 className="mt-[.55cqw] font-serif" style={{fontSize:'2cqw'}}>Your oracle. Your clarity.</h2><div className="relative mt-[1.4cqw]"><textarea autoFocus value={askText} onChange={event=>setAskText(event.target.value)} placeholder="What would make today iconic?" rows={4} className="w-full resize-none rounded-[1.2cqw] border border-white/80 bg-white/50 p-[1cqw] pr-[4cqw] outline-none focus:ring-2 focus:ring-[#b98d86]" style={{fontSize:'.8cqw'}}/><button type="submit" aria-label="Ask Glow" className="absolute bottom-[.8cqw] right-[.8cqw] grid aspect-square w-[2.9cqw] place-items-center rounded-full border border-white/80 bg-[radial-gradient(circle_at_50%_35%,white,#efcfc8_38%,#d9bdcf_70%)] shadow-[0_0_1.5cqw_.2cqw_rgba(244,199,194,.55)]"><Mic size="1.25cqw"/></button></div>{askReceipt&&<div className="mt-[1cqw] rounded-[1cqw] border border-white/80 bg-white/38 p-[1cqw]" style={{fontSize:'.72cqw'}}>{askReceipt}</div>}</form>}
          </section>
        </div>}

        <div className="pointer-events-none absolute left-[58.2%] top-[42%] z-20 -translate-x-1/2 text-center text-[#4c403c]">
          <div className="font-serif italic leading-[1.05]" style={{fontSize:'1.35cqw'}}>The Living<br/>Glow Aura</div>
          <div className="mt-[.7cqw] font-serif" style={{fontSize:'.58cqw'}}>Your life. Your timing.<br/>Your becoming.</div>
        </div>
      </div>
    </div>
  </div>;
}
