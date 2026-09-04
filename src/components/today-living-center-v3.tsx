'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { TODAY_LIVING_CENTER_REFERENCE } from '@/lib/design/today-living-center-reference';

type TaskLite={id:string;title:string;priority:string;dueLabel?:string|null};
type EventLite={id:string;title:string;timeLabel:string;location?:string|null};
type RoutineLite={id:string;name:string;timeOfDay:string};
type Props={tasks:TaskLite[];events:EventLite[];routines:RoutineLite[];energy:number|null;mood:number|null;sleepHours:number|null};
type Panel='search'|'what-now'|'energy'|'routines'|'saint'|'moment'|'focus'|'profile'|'replan'|null;
type Daypart='morning'|'afternoon'|'evening'|'night';
type ScheduleItem={label:'NEXT'|'LATER'|'TONIGHT'|'TOMORROW';time:string;title:string;duration:string;note:string;href:string};
type SearchResult={kind:'Task'|'Event'|'Routine';title:string;href:string;activeObject:string};

const priorityRank:Record<string,number>={urgent:5,high:4,medium:3,low:2};
const emptyTasks:TaskLite[]=[
  {id:'empty-1',title:'Choose your next right move',priority:'medium',dueLabel:'Today'},
  {id:'empty-2',title:'Protect one restorative block',priority:'low',dueLabel:'Today'},
  {id:'empty-3',title:'Prepare tomorrow gently',priority:'low',dueLabel:'Tomorrow'},
];
const emptyRoutines:RoutineLite[]=[
  {id:'routine-empty-1',name:'Hydrate + reset',timeOfDay:'morning'},
  {id:'routine-empty-2',name:'Posture + stretch',timeOfDay:'afternoon'},
  {id:'routine-empty-3',name:'Evening wind-down',timeOfDay:'evening'},
];

function parseTimeLabel(label:string,now:Date):Date|null{
  const match=label.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);if(!match)return null;
  let hour=Number(match[1]);const minute=Number(match[2]??0);const suffix=match[3].toUpperCase();
  if(hour===12)hour=0;if(suffix==='PM')hour+=12;const date=new Date(now);date.setHours(hour,minute,0,0);return date;
}
function formatDuration(ms:number){const total=Math.max(0,Math.floor(ms/60000));return`${Math.floor(total/60)}H ${String(total%60).padStart(2,'0')}M`;}
function priorityLabel(value:string){const v=value.toLowerCase();if(v==='urgent'||v==='high')return'High';if(v==='low')return'Low';return'Medium';}
function taskMeta(task:TaskLite|undefined,index:number){const raw=task?.dueLabel?.trim();if(raw)return raw.replace(/minutes?/i,'MIN').replace(/hours?/i,'HR');return index===1?'60 MIN':'Today';}
function daypartFor(hour:number):Daypart{if(hour>=5&&hour<12)return'morning';if(hour>=12&&hour<17)return'afternoon';if(hour>=17&&hour<20)return'evening';return'night';}
function greetingFor(daypart:Daypart){return daypart==='morning'?'Good morning, Tatiyana ♡':daypart==='afternoon'?'Good afternoon, Tatiyana ♡':daypart==='evening'?'Good evening, Tatiyana ♡':'Good night, Tatiyana ♡';}
function hotspot(left:number,top:number,width:number,height:number):CSSProperties{return{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`};}

function Wash({left,top,width,height,variant='panel'}:{left:number;top:number;width:number;height:number;variant?:'panel'|'free'|'center'}){
  return <span aria-hidden="true" className={`today-wash-v6 ${variant}`} style={{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`}}/>;
}
function PressArea({label,style,onClick}:{label:string;style:CSSProperties;onClick:()=>void}){
  return <button type="button" aria-label={label} title={label} onClick={onClick} style={style} className="absolute z-40 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#9d7770]"/>;
}
function ShaktiPresence({compact=false}:{compact?:boolean}){
  return <div className="shakti-v6" aria-hidden="true" style={compact?{transform:'scale(.88)'}:undefined}>
    <span className="ground"/><span className="haze"/><span className="beam"/><span className="fan left"/><span className="fan right"/><span className="rays"/><span className="core"/><span className="caustic"/><span className="lens"/>
  </div>;
}
function Modal({children,onClose}:{children:ReactNode;onClose:()=>void}){
  return <div className="fixed inset-0 z-[5200] grid place-items-center bg-[#3d3030]/15 p-4 sm:p-6" onMouseDown={onClose}><section role="dialog" aria-modal="true" onMouseDown={event=>event.stopPropagation()} className="relative max-h-[min(84dvh,760px)] w-[min(92vw,620px)] overflow-y-auto overscroll-contain rounded-[30px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,253,250,.97),rgba(239,231,233,.95))] p-6 text-[#302421] shadow-[0_24px_90px_rgba(74,50,44,.22),inset_0_1px_0_rgba(255,255,255,.98)] sm:p-7"><button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-[#d9c8c2]/70 bg-white/70 text-xl">×</button>{children}</section></div>;
}
function emitShaktiOpen(detail:{prompt?:string;activeObject?:string;listen?:boolean}={}){window.dispatchEvent(new CustomEvent('glow:open',{detail}));}
function emitNavigate(href:string,label:string){window.dispatchEvent(new CustomEvent('glow:navigate',{detail:{href,label}}));}
function emitRipple(label:string){window.dispatchEvent(new CustomEvent('glow:ripple',{detail:{label}}));}

export function TodayLivingCenterV3({tasks,events,routines,energy,mood,sleepHours}:Props){
  const [now,setNow]=useState(()=>new Date());
  const [panel,setPanel]=useState<Panel>(null);
  const [momentIndex,setMomentIndex]=useState(0);
  const [searchText,setSearchText]=useState('');
  const [displayTasks,setDisplayTasks]=useState<TaskLite[]>(tasks.length?tasks:emptyTasks);
  const [selectedTaskId,setSelectedTaskId]=useState((tasks[0]??emptyTasks[0]).id);
  const [completedRoutineIds,setCompletedRoutineIds]=useState<string[]>([]);
  const [focusSeconds,setFocusSeconds]=useState(47*60);
  const [focusRunning,setFocusRunning]=useState(false);
  const [receipt,setReceipt]=useState('');
  const [replanPreview,setReplanPreview]=useState<TaskLite[]>([]);

  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(timer);},[]);
  useEffect(()=>{const next=tasks.length?tasks:emptyTasks;setDisplayTasks(next);setSelectedTaskId(current=>next.some(task=>task.id===current)?current:next[0].id);},[tasks]);
  useEffect(()=>{if(!focusRunning)return;const timer=window.setInterval(()=>setFocusSeconds(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer);},[focusRunning]);
  useEffect(()=>{if(focusSeconds===0){setFocusRunning(false);setReceipt('Focus complete. The moment settled back into Today.');emitRipple('focus-complete');}},[focusSeconds]);
  useEffect(()=>{if(!panel)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setPanel(null);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[panel]);
  useEffect(()=>{if(!receipt)return;const timer=window.setTimeout(()=>setReceipt(''),4200);return()=>window.clearTimeout(timer);},[receipt]);

  const daypart=daypartFor(now.getHours());
  const greeting=greetingFor(daypart);
  const dateLabel=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
  const timeLabel=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const dateKey=now.toLocaleDateString('en-CA');

  useEffect(()=>{try{const raw=window.localStorage.getItem(`glow:today:routines:${dateKey}`);if(raw){const parsed=JSON.parse(raw) as string[];if(Array.isArray(parsed))setCompletedRoutineIds(parsed);}}catch{/* optional */}},[dateKey]);
  useEffect(()=>{try{window.localStorage.setItem(`glow:today:routines:${dateKey}`,JSON.stringify(completedRoutineIds));}catch{/* optional */}},[completedRoutineIds,dateKey]);

  const liveRoutines=routines.length?routines:emptyRoutines;
  const capacity=Math.max(35,Math.min(96,energy?Math.round(energy*10):82));
  const emotional=Math.max(35,Math.min(96,mood?Math.round(mood*10):85));
  const physical=Math.max(40,Math.min(96,energy?Math.round(energy*10-8):70));
  const creative=Math.max(55,Math.min(98,capacity+13));
  const metrics=[['Mental',capacity],['Emotional',emotional],['Physical',physical],['Creative',creative]] as const;
  const endOfDay=new Date(now);endOfDay.setHours(23,59,59,999);const timeRemaining=formatDuration(endOfDay.getTime()-now.getTime());

  const timedEvents=useMemo(()=>events.map(event=>({event,date:parseTimeLabel(event.timeLabel,now)})),[events,now]);
  const futureTimed=timedEvents.filter(item=>item.date&&item.date>=now).sort((a,b)=>(a.date?.getTime()??0)-(b.date?.getTime()??0));
  const allDay=events.filter(event=>/^all day$/i.test(event.timeLabel));
  const nextEventDate=futureTimed[0]?.date??null;
  const wrapAt=nextEventDate?new Date(nextEventDate.getTime()-30*60000):new Date(now.getTime()+4*60*60000+7*60000);
  const leaveReady=formatDuration(wrapAt.getTime()-now.getTime());
  const next=futureTimed[0]?.event??allDay[0];
  const later=futureTimed[1]?.event;
  const tonight=futureTimed.find(item=>(item.date?.getHours()??0)>=17)?.event;
  const nightFallback=daypart==='night';
  const schedule:ScheduleItem[]=[
    {label:'NEXT',time:next?.timeLabel??(nightFallback?'Now':'12:00 PM'),title:next?.title??(nightFallback?'Night reset':'Open breathing space'),duration:'',note:next?.location??(nightFallback?'Close the day gently':'Protect the next right move'),href:'/calendar'},
    {label:'LATER',time:later?.timeLabel??(nightFallback?'Tomorrow':'2:30 PM'),title:later?.title??(nightFallback?'Tomorrow preview':'Creative planning'),duration:'',note:later?.location??(nightFallback?'Only what needs preparing':'Deep work'),href:'/calendar'},
    {label:'TONIGHT',time:tonight?.timeLabel??'7:00 PM',title:tonight?.title??'Wind Down',duration:'',note:tonight?.location??'Reset & reflect',href:'/calendar'},
    {label:'TOMORROW',time:'Preview',title:'A quiet glimpse',duration:'',note:'',href:'/tomorrow'},
  ];

  const selectedTask=displayTasks.find(task=>task.id===selectedTaskId)??displayTasks[0]??emptyTasks[0];
  const focusMinutes=Math.max(0,Math.ceil(focusSeconds/60));
  const topThree=[...displayTasks].sort((a,b)=>(priorityRank[b.priority]??0)-(priorityRank[a.priority]??0)).slice(0,3);while(topThree.length<3)topThree.push(emptyTasks[topThree.length]);
  const searchResults:SearchResult[]=useMemo(()=>{const q=searchText.trim().toLowerCase();if(!q)return[];return[
    ...displayTasks.map(item=>({kind:'Task' as const,title:item.title,href:'/focus',activeObject:item.title})),
    ...events.map(item=>({kind:'Event' as const,title:item.title,href:'/calendar',activeObject:item.title})),
    ...liveRoutines.map(item=>({kind:'Routine' as const,title:item.name,href:'/routines',activeObject:item.name})),
  ].filter(item=>item.title.toLowerCase().includes(q)).slice(0,9);},[searchText,displayTasks,events,liveRoutines]);

  function chooseTask(task:TaskLite){setSelectedTaskId(task.id);setPanel('focus');setReceipt(`${task.title} moved into focus without leaving Today.`);}
  function toggleRoutine(routine:RoutineLite){setCompletedRoutineIds(current=>{const done=current.includes(routine.id);setReceipt(done?`${routine.name} returned to the active pathway.`:`${routine.name} completed and settled into Today.`);return done?current.filter(id=>id!==routine.id):[...current,routine.id];});}
  function previewReplan(){const preview=[...displayTasks].sort((a,b)=>(priorityRank[b.priority]??0)-(priorityRank[a.priority]??0));setReplanPreview(preview);setPanel('replan');}
  function applyReplan(){if(replanPreview.length)setDisplayTasks(replanPreview);setPanel(null);setReceipt('Today reorganized locally. External schedule changes still need approval.');}
  function openMoment(index:number){setMomentIndex(index);setPanel('moment');}
  function navigate(href:string,label:string){emitNavigate(href,label);}
  const currentTimelineLabel=daypart==='night'||daypart==='evening'?'TONIGHT':'NEXT';

  return <main className="today-v6 relative h-[100dvh] w-full overflow-hidden" data-daypart={daypart}>
    <div className="today-landscape absolute inset-0">
      <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" draggable={false} className="today-ambient-v6 absolute inset-0 h-full w-full select-none object-cover"/>
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="today-stage-v6 relative shrink-0 overflow-hidden" style={{width:'min(100vw, calc(100dvh * 1067 / 800))',height:'min(100dvh, calc(100vw * 800 / 1067))'}}>
          <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" draggable={false} className="today-reference-v6 absolute inset-0 h-full w-full select-none object-fill"/>
          <div className="today-climate-v6"/>

          <Wash left={3.2} top={4.9} width={34.0} height={9.7} variant="free"/>
          <Wash left={4.4} top={15.4} width={44.4} height={19.2}/>
          <Wash left={4.8} top={35.2} width={21.1} height={20.0}/>
          <Wash left={26.0} top={35.2} width={22.1} height={20.0}/>
          <Wash left={4.7} top={55.1} width={31.5} height={13.0}/>
          <Wash left={4.0} top={67.6} width={45.2} height={7.8}/>
          <Wash left={4.0} top={75.2} width={49.5} height={16.8}/>
          <Wash left={54.3} top={76.2} width={22.0} height={15.6}/>
          <Wash left={75.8} top={75.7} width={21.3} height={15.8}/>
          <Wash left={78.6} top={10.1} width={18.3} height={62.1} variant="free"/>
          <Wash left={49.0} top={5.0} width={23.0} height={62.0} variant="center"/>

          <section className="today-native-v6 today-greeting-v6" aria-live="polite">
            <div className="greeting" suppressHydrationWarning>{greeting}</div><div className="date" suppressHydrationWarning>{dateLabel}</div>
          </section>

          <section className="today-native-v6 today-now-v6">
            <div className="eyebrow muted">LIVE MOMENT</div><div className="now-word">NOW</div><div className="task">{selectedTask.title}</div><div className="context muted">High focus · Creative work</div><div className="moment">This is your moment.</div><div className="clock" suppressHydrationWarning>{timeLabel}</div>
            <button type="button" className="today-focus-ring-v6" onClick={()=>setFocusRunning(value=>!value)} aria-label={focusRunning?'Pause focus timer':'Start focus timer'}><span><strong>{focusMinutes}</strong><small>MIN</small></span></button>
            <button type="button" aria-label="Open current focus" className="absolute inset-[0_9cqw_0_0] bg-transparent" onClick={()=>setPanel('focus')}/>
          </section>

          <section className="today-native-v6 today-what-v6">
            <button type="button" onClick={()=>setPanel('what-now')} className="w-full text-left"><div className="eyebrow">WHAT NOW?</div><div className="subtitle">Your next right 3.</div></button>
            {displayTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" className="row" onClick={()=>chooseTask(task)}><span className="num">{index+1}</span><span className="title">{task.title}</span><span className="meta">{taskMeta(task,index)}</span></button>)}
          </section>

          <section className="today-native-v6 today-capacity-v6">
            <button type="button" onClick={()=>setPanel('energy')} className="w-full text-left"><div className="eyebrow">ENERGY & CAPACITY</div></button>
            <div className="capacity-body"><button type="button" onClick={()=>setPanel('energy')} className="today-capacity-orb-v6"><span><strong>{capacity}</strong><span>Radiant</span></span></button><div>{metrics.map(([label,value])=><div className="metric" key={label}><span>{label}</span><span className="bar"><i style={{width:`${value}%`}}/></span><span className="pct">{value}%</span></div>)}</div></div>
          </section>

          <section className="today-native-v6 today-counts-v6"><div className="count"><div className="label">TIME REMAINING TODAY</div><div className="value">{timeRemaining}</div><div className="note">until day’s end</div></div><div className="count"><div className="label">LEAVE-READY COUNTDOWN</div><div className="value">{leaveReady}</div><div className="note">before the next fixed commitment</div></div></section>

          <button type="button" onClick={previewReplan} className="today-native-v6 today-replan-v6 text-left"><span><span className="label">Replan My Day</span><span className="sub block">One-tap reset. Realign, reschedule, and flow.</span></span><span className="arrow">→</span></button>

          <section className="today-native-v6 today-priorities-v6"><div className="eyebrow">TOP 3 PRIORITIES ♕</div><div className="cols">{topThree.map((task,index)=><button key={task.id} type="button" onClick={()=>chooseTask(task)} className="priority"><span className="category">{['CREATE','CARE','PLAN'][index]}</span><span className="ptitle block">{task.title}</span><span className="pnote block">{index===0?'Move the highest-value work':index===1?'Nourish the day':'Map the next move'}</span><span className="impact block">Impact: {priorityLabel(task.priority)}</span></button>)}</div></section>

          <section className="today-native-v6 today-timeline-v6">{schedule.map((item,index)=><button key={item.label} type="button" onClick={()=>openMoment(index)} className={`moment ${item.label===currentTimelineLabel?'current':''}`}><span className="dot"/><span className="m-label">{item.label}</span><span className="m-time block">{item.time}</span><span className="m-title block">{item.title}</span>{item.note&&<span className="m-note block">{item.note}</span>}</button>)}</section>

          <section className="today-native-v6 today-routines-v6"><button type="button" onClick={()=>setPanel('routines')} className="w-full text-left"><div className="eyebrow">ROUTINES DUE NOW</div></button>{liveRoutines.slice(0,3).map((routine,index)=>{const done=completedRoutineIds.includes(routine.id);return <button key={routine.id} type="button" onClick={()=>toggleRoutine(routine)} className={`row ${done?'done':''}`}><span className="rname">{routine.name}</span><span className="duration">{[5,10,7][index]??8} MIN</span><span className="check">{done?'✓':''}</span></button>;})}<button type="button" onClick={()=>navigate('/routines','Routines')} className="mt-[.35cqw] w-full text-center text-[.5cqw] underline underline-offset-2">View all routines</button></section>

          <button type="button" onClick={()=>emitShaktiOpen({activeObject:selectedTask.title})} className="today-native-v6 today-ask-v6 text-left"><div className="heading">ASK SHAKTI ✧</div><div className="sub">Your oracle. Your clarity.</div><div className="prompt">What would make today iconic?</div><span className="shakti-mini"><ShaktiPresence compact/></span></button>

          <div className="today-shakti-wide-v6"><ShaktiPresence/></div>
          <button type="button" onClick={()=>emitShaktiOpen({activeObject:'Today · Now'})} className="shakti-name-v6 pointer-events-auto">Shakti<span className="shakti-sub-v6 block">Your life. Your timing.<br/>Your becoming.</span></button>

          <nav className="today-nav-v6"><button type="button" className="active" onClick={()=>setReceipt('You are in Today · The Living Center.')}>Today</button><button type="button" onClick={()=>navigate('/planning','Plan · The Time Observatory')}>Plan</button><button type="button" onClick={()=>navigate('/world','Life · The Personal House')}>Life</button><button type="button" onClick={()=>navigate('/brain','Brain · The Inner Universe')}>Brain</button><button type="button" onClick={()=>navigate('/create','Create · The Transformation Studio')}>Create</button></nav>

          <PressArea label="Search Glow OS" style={hotspot(85.7,1.0,4.0,5.7)} onClick={()=>setPanel('search')}/><PressArea label="Calendar" style={hotspot(90.5,1.0,4.0,5.7)} onClick={()=>navigate('/calendar','Plan · Calendar')}/><PressArea label="Notifications" style={hotspot(95.0,1.0,4.0,5.7)} onClick={()=>navigate('/notices','Attention Center')}/><PressArea label="Saint" style={hotspot(87.0,92.0,6.8,7.0)} onClick={()=>setPanel('saint')}/><PressArea label="Tatiyana settings" style={hotspot(94.0,91.5,5.0,8.0)} onClick={()=>setPanel('profile')}/>
        </div>
      </div>
    </div>

    <div className="today-portrait absolute inset-0">
      <div className="today-portrait-v6 h-full overflow-y-auto overscroll-y-contain pb-[calc(100px+env(safe-area-inset-bottom))]">
        <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-[.045]" style={{objectPosition:'58% 44%',filter:'var(--reference-filter)'}}/>
        <header className="relative z-10 px-5 pb-2 pt-[calc(18px+env(safe-area-inset-top))] sm:px-8"><div className="flex items-center justify-between"><p className="text-[11px] font-semibold tracking-[.22em]">GLOW OS</p><div className="flex gap-2"><button type="button" onClick={()=>setPanel('search')} className="grid h-11 w-11 place-items-center rounded-full border border-white/75 bg-white/40">⌕</button><button type="button" onClick={()=>navigate('/calendar','Plan · Calendar')} className="grid h-11 w-11 place-items-center rounded-full border border-white/75 bg-white/40 text-[10px]">CAL</button></div></div><h1 className="mt-5 font-serif text-[clamp(32px,8.6vw,50px)] leading-[.98] tracking-[-.035em]" suppressHydrationWarning>{greeting}</h1><p className="mt-3 text-[11px] font-medium tracking-[.17em] opacity-65" suppressHydrationWarning>{dateLabel}</p></header>
        <section className="relative z-10 mx-5 mt-2 min-h-[300px] sm:mx-8 sm:min-h-[350px]"><div className="absolute left-1/2 top-[43%] h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 sm:h-[310px] sm:w-[310px]"><ShaktiPresence/></div><button type="button" onClick={()=>emitShaktiOpen({activeObject:'Today · Now'})} className="absolute inset-0 z-10"><span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-serif text-xl italic">Shakti</span><span className="sr-only">Open Shakti</span></button></section>
        <section className="relative z-10 mx-5 sm:mx-8">
          <div className="border-y border-[#bfa9a1]/55 bg-white/32 px-5 py-6"><div className="flex items-start justify-between gap-5"><button type="button" onClick={()=>setPanel('focus')} className="min-w-0 flex-1 text-left"><p className="text-[10px] font-semibold tracking-[.18em] opacity-55">LIVE MOMENT · NOW</p><h2 className="mt-2 font-serif text-[clamp(28px,7.8vw,42px)] leading-none">{selectedTask.title}</h2><p className="mt-3 text-sm opacity-65">High focus · Creative work</p><p className="mt-5 font-serif italic text-[#9d756c]">This is your moment.</p></button><button type="button" onClick={()=>setFocusRunning(value=>!value)} className="grid h-[82px] w-[82px] shrink-0 place-items-center rounded-full border border-[#b79389]/55 bg-white/42"><span className="text-center"><span className="block font-serif text-3xl">{focusMinutes}</span><span className="block text-[9px] tracking-[.16em]">MIN</span></span></button></div></div>
          <div className="mt-7 grid grid-cols-[1.08fr_.92fr] gap-5"><section className="border-l border-[#bca49d]/60 pl-4"><button type="button" onClick={()=>setPanel('what-now')} className="w-full text-left"><p className="text-[11px] font-semibold tracking-[.16em]">WHAT NOW?</p><p className="mt-1 text-xs opacity-55">Your next right 3.</p></button>{displayTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" onClick={()=>chooseTask(task)} className="flex w-full items-center gap-3 border-t border-[#cbb8b1]/45 py-3 text-left"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#bea49c]/60 text-[10px]">{index+1}</span><span className="min-w-0 flex-1 font-serif text-[15px]">{task.title}</span></button>)}</section><section className="border-l border-[#bca49d]/45 pl-4"><button type="button" onClick={()=>setPanel('energy')} className="w-full text-left"><p className="text-[11px] font-semibold tracking-[.14em]">ENERGY & CAPACITY</p></button><div className="mt-4 grid h-24 w-24 place-items-center rounded-full border border-[#b9948b]/55 bg-white/28"><span className="text-center"><span className="block font-serif text-4xl">{capacity}</span><span className="block font-serif text-sm">Radiant</span></span></div><div className="mt-4 space-y-2">{metrics.map(([label,value])=><div key={label} className="text-[10px]"><div className="flex justify-between"><span>{label}</span><span>{value}%</span></div><div className="mt-1 h-px bg-[#cdbab3]"><div className="h-full bg-[#b78b83]" style={{width:`${value}%`}}/></div></div>)}</div></section></div>
          <div className="mt-8 grid grid-cols-2 border-y border-[#bda8a0]/48 py-4"><div><p className="text-[10px] tracking-[.14em] opacity-55">TIME REMAINING TODAY</p><p className="mt-1 font-serif text-2xl">{timeRemaining}</p></div><div className="border-l border-[#bda8a0]/48 pl-4"><p className="text-[10px] tracking-[.14em] opacity-55">LEAVE-READY</p><p className="mt-1 font-serif text-2xl">{leaveReady}</p></div></div>
          <button type="button" onClick={previewReplan} className="mt-7 flex w-full items-center justify-between border-y border-[#b99e96]/45 bg-white/22 px-4 py-5 text-left"><span><span className="block font-serif text-2xl">Replan My Day</span><span className="mt-1 block text-xs opacity-55">One-tap reset. Realign, reschedule, and flow.</span></span><span className="grid h-11 w-11 place-items-center rounded-full border border-[#b99e96]/55 text-xl">→</span></button>
          <section className="mt-9"><p className="text-[11px] font-semibold tracking-[.18em]">NEXT · LATER · TONIGHT · TOMORROW</p><div className="relative mt-5 border-l border-[#aa8e86]/50 pl-6">{schedule.map((item,index)=><button key={item.label} type="button" onClick={()=>openMoment(index)} className="relative block w-full border-b border-[#c9b6af]/42 py-4 text-left"><span className="absolute -left-[30px] top-5 h-3 w-3 rounded-full border border-[#967a72] bg-[#f6ebe6]"/><span className="text-[10px] font-semibold tracking-[.15em] opacity-60">{item.label} · {item.time}</span><span className="mt-1 block font-serif text-[22px]">{item.title}</span>{item.note&&<span className="mt-1 block text-xs opacity-55">{item.note}</span>}</button>)}</div></section>
          <section className="mt-9"><p className="text-[11px] font-semibold tracking-[.18em]">TOP 3 PRIORITIES</p>{topThree.map((task,index)=><button key={task.id} type="button" onClick={()=>chooseTask(task)} className="block w-full border-b border-[#ae9289]/35 py-4 text-left"><span className="text-[10px] tracking-[.16em] opacity-50">{['CREATE','CARE','PLAN'][index]}</span><span className="mt-1 block font-serif text-xl">{task.title}</span><span className="mt-1 block text-xs opacity-55">Impact: {priorityLabel(task.priority)}</span></button>)}</section>
          <section className="mt-9"><div className="flex items-end justify-between"><p className="text-[11px] font-semibold tracking-[.18em]">ROUTINES DUE NOW</p><button type="button" onClick={()=>navigate('/routines','Routines')} className="text-xs underline underline-offset-4">View all</button></div>{liveRoutines.slice(0,5).map((routine,index)=>{const done=completedRoutineIds.includes(routine.id);return <button key={routine.id} type="button" onClick={()=>toggleRoutine(routine)} className="flex w-full items-center gap-3 border-b border-[#cdbab3]/38 py-3 text-left"><span className={`min-w-0 flex-1 font-serif ${done?'line-through opacity-40':''}`}>{routine.name}</span><span className="text-[10px] opacity-50">{[5,10,7,12,8][index]??8} MIN</span><span className={`grid h-6 w-6 place-items-center rounded-full border border-[#997c74]/60 ${done?'bg-[#8f9984] text-white':''}`}>{done?'✓':''}</span></button>;})}</section>
          <button type="button" onClick={()=>emitShaktiOpen({activeObject:selectedTask.title})} className="mt-10 flex w-full items-center justify-between border-y border-[#ac8f87]/48 py-7 text-left"><div><p className="text-[11px] font-semibold tracking-[.18em]">ASK SHAKTI</p><p className="mt-1 font-serif text-2xl italic">Your oracle. Your clarity.</p><p className="mt-3 text-sm opacity-60">What would make today iconic?</p></div><div className="h-20 w-20"><ShaktiPresence compact/></div></button>
          <div className="mt-7 flex items-center justify-between border-t border-[#baa49c]/40 py-4"><button type="button" onClick={()=>setPanel('saint')} className="text-sm">🐾 Saint</button><button type="button" onClick={()=>setPanel('profile')} className="text-sm">Tatiyana · Settings</button></div>
        </section>
      </div>
      <nav className="fixed inset-x-3 bottom-[calc(8px+env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-[26px] border border-white/75 bg-[rgba(248,240,235,.90)] px-1 py-2 shadow-[0_12px_38px_rgba(88,62,54,.16)] backdrop-blur-xl sm:inset-x-10"><button type="button" className="min-h-12 rounded-[20px] bg-white/55 text-xs font-medium">Today</button><button type="button" onClick={()=>navigate('/planning','Plan · The Time Observatory')} className="min-h-12 text-xs">Plan</button><button type="button" onClick={()=>navigate('/world','Life · The Personal House')} className="min-h-12 text-xs">Life</button><button type="button" onClick={()=>navigate('/brain','Brain · The Inner Universe')} className="min-h-12 text-xs">Brain</button><button type="button" onClick={()=>navigate('/create','Create · The Transformation Studio')} className="min-h-12 text-xs">Create</button></nav>
    </div>

    {receipt&&<div aria-live="polite" className="fixed bottom-[calc(92px+env(safe-area-inset-bottom))] left-1/2 z-[5100] max-w-[min(88vw,620px)] -translate-x-1/2 rounded-full border border-white/75 bg-white/88 px-5 py-2.5 text-center text-xs shadow-[0_10px_30px_rgba(92,64,56,.13)] backdrop-blur-lg">{receipt}</div>}
    {panel==='search'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">SEARCH GLOW OS</p><h2 className="mt-2 font-serif text-3xl">Cast light across your world.</h2><input autoFocus value={searchText} onChange={event=>setSearchText(event.target.value)} placeholder="Tasks, moments, routines…" className="mt-6 w-full rounded-2xl border border-[#d8c2bb] bg-white/62 px-4 py-3 outline-none"/><div className="mt-4">{searchText&&!searchResults.length&&<p className="text-sm opacity-70">No matching live items yet.</p>}{searchResults.map((result,index)=><button key={`${result.kind}-${index}`} type="button" onClick={()=>{setPanel(null);navigate(result.href,result.activeObject);}} className="block w-full border-b border-[#d9c8c2]/50 py-3 text-left"><span className="mr-2 text-[10px] font-semibold tracking-[.15em] opacity-60">{result.kind.toUpperCase()}</span>{result.title}</button>)}</div></Modal>}
    {panel==='focus'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">LIVE MOMENT · NOW</p><h2 className="mt-2 font-serif text-3xl">{selectedTask.title}</h2><p className="mt-2 text-sm opacity-65">High focus · Creative work</p><div className="mt-6 flex items-center gap-6"><button type="button" onClick={()=>setFocusRunning(value=>!value)} className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-2 border-[#d8bdb5] bg-white/45"><div><div className="font-serif text-4xl">{focusMinutes}</div><div className="text-[10px] tracking-[.18em]">MIN</div></div></button><div><p className="font-serif italic text-[#9e766e]">This is your moment.</p><p className="mt-3 text-sm leading-relaxed opacity-70">Start, pause, or move deeper without losing Today around you.</p></div></div><button type="button" onClick={()=>emitShaktiOpen({prompt:`Help me focus on ${selectedTask.title}`,activeObject:selectedTask.title})} className="mt-5 rounded-full border border-[#d5bdb6] bg-white/45 px-5 py-2.5 text-sm">Ask Shakti</button></Modal>}
    {panel==='what-now'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">WHAT NOW?</p><h2 className="mt-2 font-serif text-3xl">Your next right three.</h2>{displayTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" onClick={()=>chooseTask(task)} className="flex w-full items-center gap-3 border-b border-[#d7c6c0] py-3 text-left"><span className="grid h-8 w-8 place-items-center rounded-full border border-[#c9aaa1]">{index+1}</span><span className="font-serif text-lg">{task.title}</span></button>)}<button type="button" onClick={()=>emitShaktiOpen({prompt:'Show me what I need to do next.',activeObject:'What Now'})} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Shakti to choose with me</button></Modal>}
    {panel==='energy'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">ENERGY & CAPACITY</p><h2 className="mt-2 font-serif text-3xl">How much can today hold?</h2><div className="mt-6 grid gap-4 sm:grid-cols-[140px_1fr]"><div className="grid h-32 w-32 place-items-center rounded-full border border-[#c8aaa1] bg-white/35"><span className="text-center"><span className="block font-serif text-5xl">{capacity}</span><span className="font-serif">Radiant</span></span></div><div className="space-y-4">{metrics.map(([label,value])=><div key={label}><div className="flex justify-between text-sm"><span>{label}</span><span>{value}%</span></div><div className="mt-2 h-1 bg-[#ddcec9]"><div className="h-full bg-[#c69c95]" style={{width:`${value}%`}}/></div></div>)}</div></div>{sleepHours!=null&&<p className="mt-5 text-sm opacity-70">Last recorded sleep: {sleepHours} hours.</p>}<button type="button" onClick={()=>emitShaktiOpen({prompt:'Replan the rest of today around my current capacity.',activeObject:'Energy & Capacity'})} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Shakti to adapt the day</button></Modal>}
    {panel==='routines'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">ROUTINES DUE NOW</p><h2 className="mt-2 font-serif text-3xl">Move through the pathway.</h2>{liveRoutines.slice(0,5).map((routine,index)=>{const done=completedRoutineIds.includes(routine.id);return <button key={routine.id} type="button" onClick={()=>toggleRoutine(routine)} className="flex w-full items-center gap-3 border-b border-[#d9c8c2] py-3 text-left"><span className={`flex-1 font-serif text-lg ${done?'line-through opacity-45':''}`}>{routine.name}</span><span className="text-xs opacity-60">{[5,10,7,12,8][index]??8} MIN</span><span className="grid h-5 w-5 place-items-center rounded-full border border-[#a9857d]">{done?'✓':''}</span></button>;})}</Modal>}
    {panel==='replan'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">REPLAN MY DAY</p><h2 className="mt-2 font-serif text-3xl">A reversible preview.</h2><p className="mt-3 text-sm opacity-70">Nothing external changes without your approval.</p>{replanPreview.slice(0,5).map((task,index)=><div key={task.id} className="flex gap-3 border-b border-[#d7c6c0] py-3"><span>{index+1}</span><span className="font-serif">{task.title}</span></div>)}<button type="button" onClick={applyReplan} className="mt-5 rounded-full bg-[#3d302c] px-5 py-2.5 text-sm text-white">Use this order in Today</button></Modal>}
    {panel==='saint'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">SAINT</p><h2 className="mt-2 font-serif text-3xl">Saint is with you. ♡</h2><button type="button" onClick={()=>emitShaktiOpen({prompt:'What do I need to remember for Saint today?',activeObject:'Saint'})} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Shakti about Saint</button></Modal>}
    {panel==='profile'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">TATIYANA</p><h2 className="mt-2 font-serif text-3xl">Your personal layer.</h2><button type="button" onClick={()=>navigate('/settings','Settings')} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Open settings</button></Modal>}
    {panel==='moment'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">{schedule[momentIndex].label}</p><h2 className="mt-2 font-serif text-3xl">{schedule[momentIndex].title}</h2><p className="mt-2 text-sm">{schedule[momentIndex].time}</p>{schedule[momentIndex].note&&<p className="mt-3 text-sm opacity-70">{schedule[momentIndex].note}</p>}<button type="button" onClick={()=>emitShaktiOpen({prompt:`Help me prepare for ${schedule[momentIndex].title}`,activeObject:schedule[momentIndex].title})} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Shakti</button></Modal>}
  </main>;
}
