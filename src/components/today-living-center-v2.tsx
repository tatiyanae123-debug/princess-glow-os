'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
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
};

type Panel = 'search'|'what-now'|'energy'|'routines'|'saint'|'moment'|'focus'|'profile'|'replan'|null;
type ScheduleItem = { label:string; time:string; title:string; duration:string; note:string; href:string; sourceId?:string };
type SearchResult = { kind:'Task'|'Event'|'Routine'; title:string; href:string; activeObject:string };

const fallbackTasks: TaskLite[] = [
  {id:'fallback-1',title:'Midday Reset #1',priority:'high',dueLabel:'Today'},
  {id:'fallback-2',title:'Midday Productivity Block',priority:'high',dueLabel:'60 MIN'},
  {id:'fallback-3',title:'Evening Transition Block',priority:'medium',dueLabel:'Today'},
];
const fallbackRoutines: RoutineLite[] = [
  {id:'r-1',name:'Morning Hydration',timeOfDay:'morning'},
  {id:'r-2',name:'Creativity Warm-Up',timeOfDay:'morning'},
  {id:'r-3',name:'Posture + Stretch',timeOfDay:'morning'},
];
const priorityRank: Record<string,number> = { urgent:5, high:4, medium:3, low:2 };

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
function formatDuration(ms:number){const total=Math.max(0,Math.floor(ms/60000));return `${Math.floor(total/60)}H ${String(total%60).padStart(2,'0')}M`;}
function priorityLabel(value:string){const normalized=value.toLowerCase();if(normalized==='urgent'||normalized==='high')return'High';if(normalized==='low')return'Low';return'Medium';}
function taskMeta(task:TaskLite|undefined,index:number){const raw=task?.dueLabel?.trim();if(raw)return raw.replace(/minutes?/i,'MIN').replace(/hours?/i,'HR');if(index===1)return'60 MIN';return'Today';}
function hotspot(left:number,top:number,width:number,height:number):CSSProperties{return{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`};}

function PressArea({label,style,onClick}:{label:string;style:CSSProperties;onClick:()=>void}){
  return <button type="button" aria-label={label} title={label} onClick={onClick} style={style} className="absolute z-30 rounded-[.7cqw] bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#9d7770] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"/>;
}

function InkSlot({left,top,width,height=3.1,children,className=''}:{left:number;top:number;width:number;height?:number;children:ReactNode;className?:string}){
  return <div className={`absolute z-20 flex items-center overflow-hidden bg-transparent ${className}`} style={{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`,textShadow:'0 1px 1px rgba(255,255,255,.88),0 0 8px rgba(255,255,255,.30)',WebkitFontSmoothing:'antialiased',textRendering:'geometricPrecision'}}>{children}</div>;
}

function Modal({children,onClose}:{children:ReactNode;onClose:()=>void}){
  return <div className="fixed inset-0 z-[5200] grid place-items-center bg-[#4e3d39]/10 p-4 sm:p-6" onMouseDown={onClose}><section role="dialog" aria-modal="true" onMouseDown={event=>event.stopPropagation()} className="relative max-h-[min(84dvh,760px)] w-[min(92vw,600px)] overflow-y-auto overscroll-contain rounded-[30px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,253,250,.965),rgba(244,231,226,.94))] p-6 text-[#302421] shadow-[0_24px_90px_rgba(74,50,44,.22),inset_0_1px_0_rgba(255,255,255,.98)] sm:p-7"><button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-[#d9c8c2]/70 bg-white/70 text-xl shadow-sm">×</button>{children}</section></div>;
}

function LivingTodayAura({compact=false}:{compact?:boolean}){
  return <div className={`today-aura-visual ${compact?'today-aura-compact':''}`} aria-hidden="true">
    <span className="today-aura-haze"/>
    <span className="today-aura-beam"/>
    <span className="today-aura-fan today-aura-fan-left"/>
    <span className="today-aura-fan today-aura-fan-right"/>
    <span className="today-aura-rays"/>
    <span className="today-aura-ring today-aura-ring-one"/>
    <span className="today-aura-ring today-aura-ring-two"/>
    <span className="today-aura-core"/>
  </div>;
}

function emitGlowOpen(detail:{prompt?:string;activeObject?:string;listen?:boolean}={}){window.dispatchEvent(new CustomEvent('glow:open',{detail}));}
function emitNavigate(href:string,label:string){window.dispatchEvent(new CustomEvent('glow:navigate',{detail:{href,label}}));}
function emitRipple(label:string){window.dispatchEvent(new CustomEvent('glow:ripple',{detail:{label}}));}

export function TodayLivingCenterV2({tasks,events,routines,energy,mood,sleepHours}:Props){
  const [now,setNow]=useState(new Date());
  const [panel,setPanel]=useState<Panel>(null);
  const [momentIndex,setMomentIndex]=useState(0);
  const [searchText,setSearchText]=useState('');
  const [displayTasks,setDisplayTasks]=useState<TaskLite[]>(tasks.length?tasks:fallbackTasks);
  const [selectedTaskId,setSelectedTaskId]=useState((tasks[0]??fallbackTasks[0]).id);
  const [completedRoutineIds,setCompletedRoutineIds]=useState<string[]>([]);
  const [focusSeconds,setFocusSeconds]=useState(47*60);
  const [focusRunning,setFocusRunning]=useState(false);
  const [receipt,setReceipt]=useState('');
  const [rippleKey,setRippleKey]=useState(0);
  const [replanPreview,setReplanPreview]=useState<TaskLite[]>([]);

  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),1000);return()=>window.clearInterval(timer);},[]);
  useEffect(()=>{
    const next=tasks.length?tasks:fallbackTasks;
    setDisplayTasks(next);
    setSelectedTaskId(current=>next.some(task=>task.id===current)?current:next[0].id);
  },[tasks]);
  useEffect(()=>{if(!focusRunning)return;const timer=window.setInterval(()=>setFocusSeconds(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer);},[focusRunning]);
  useEffect(()=>{if(focusSeconds===0){setFocusRunning(false);setReceipt('Focus complete. The moment released its light back into Today.');emitRipple('focus-complete');}},[focusSeconds]);
  useEffect(()=>{if(!panel)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setPanel(null);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[panel]);
  useEffect(()=>{const ripple=()=>setRippleKey(value=>value+1);window.addEventListener('glow:ripple',ripple);return()=>window.removeEventListener('glow:ripple',ripple);},[]);
  useEffect(()=>{if(!receipt)return;const timer=window.setTimeout(()=>setReceipt(''),4200);return()=>window.clearTimeout(timer);},[receipt]);

  const dateKey=now.toISOString().slice(0,10);
  useEffect(()=>{
    try{const raw=window.localStorage.getItem(`glow:today:routines:${dateKey}`);if(raw){const parsed=JSON.parse(raw) as string[];if(Array.isArray(parsed))setCompletedRoutineIds(parsed);}}catch{/* optional persistence */}
  },[dateKey]);
  useEffect(()=>{try{window.localStorage.setItem(`glow:today:routines:${dateKey}`,JSON.stringify(completedRoutineIds));}catch{/* optional persistence */}},[completedRoutineIds,dateKey]);

  const liveRoutines=routines.length?routines:fallbackRoutines;
  const hour=now.getHours();
  const greeting=hour>=5&&hour<12?'Good morning, Princess ♡':hour>=12&&hour<17?'Good afternoon, Princess ♡':hour>=17&&hour<21?'Good evening, Princess ♡':'Good night, Princess ♡';
  const dateLabel=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
  const timeLabel=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const capacity=Math.max(35,Math.min(96,energy?Math.round(energy*10):82));
  const emotional=Math.max(35,Math.min(96,mood?Math.round(mood*10):85));
  const physical=Math.max(40,Math.min(96,energy?Math.round(energy*10-8):70));
  const creative=Math.max(55,Math.min(98,capacity+13));
  const endOfDay=new Date(now);endOfDay.setHours(23,59,59,999);
  const timeRemaining=formatDuration(endOfDay.getTime()-now.getTime());

  const timedEvents=useMemo(()=>events.map(event=>({event,date:parseTimeLabel(event.timeLabel,now)})),[events,now]);
  const futureTimed=timedEvents.filter(item=>item.date&&item.date>=now).sort((a,b)=>(a.date?.getTime()??0)-(b.date?.getTime()??0));
  const allDay=events.filter(event=>/^all day$/i.test(event.timeLabel));
  const nextEventDate=futureTimed[0]?.date??null;
  const wrapAt=nextEventDate?new Date(nextEventDate.getTime()-30*60000):new Date(now.getTime()+4*60*60000+7*60000);
  const leaveReady=formatDuration(wrapAt.getTime()-now.getTime());
  const next=futureTimed[0]?.event??allDay[0];
  const later=futureTimed[1]?.event??futureTimed[0]?.event;
  const tonight=futureTimed.find(item=>(item.date?.getHours()??0)>=17)?.event;
  const schedule:ScheduleItem[]=[
    {label:'NEXT',time:next?.timeLabel??'12:00 PM',title:next?.title??'Daily Baseline',duration:'1H 00M',note:next?.location??'Nourish & connect',href:'/calendar',sourceId:next?.id},
    {label:'LATER',time:later?.timeLabel??'2:30 PM',title:later?.title??'Creative Planning',duration:'2H 00M',note:later?.location??'Deep work',href:'/calendar',sourceId:later?.id},
    {label:'TONIGHT',time:tonight?.timeLabel??'7:00 PM',title:tonight?.title??'Wind Down',duration:'1H 00M',note:tonight?.location??'Reset & reflect',href:'/calendar',sourceId:tonight?.id},
    {label:'TOMORROW',time:'Preview',title:'A quiet glimpse',duration:'',note:'',href:'/tomorrow'},
  ];

  const selectedTask=displayTasks.find(task=>task.id===selectedTaskId)??displayTasks[0]??fallbackTasks[0];
  const focusMinutes=Math.max(0,Math.ceil(focusSeconds/60));
  const topThree=[...displayTasks].sort((a,b)=>(priorityRank[b.priority]??0)-(priorityRank[a.priority]??0)).slice(0,3);
  while(topThree.length<3)topThree.push(fallbackTasks[topThree.length]);
  const searchResults:SearchResult[]=useMemo(()=>{
    const q=searchText.trim().toLowerCase();if(!q)return[];
    return[
      ...displayTasks.map(item=>({kind:'Task' as const,title:item.title,href:'/focus',activeObject:item.title})),
      ...events.map(item=>({kind:'Event' as const,title:item.title,href:'/calendar',activeObject:item.title})),
      ...liveRoutines.map(item=>({kind:'Routine' as const,title:item.name,href:'/routines',activeObject:item.name})),
    ].filter(item=>item.title.toLowerCase().includes(q)).slice(0,9);
  },[searchText,displayTasks,events,liveRoutines]);

  function chooseTask(task:TaskLite){setSelectedTaskId(task.id);setPanel('focus');setReceipt(`${task.title} moved into focus without leaving Today.`);emitRipple('focus-task');}
  function toggleRoutine(routine:RoutineLite){setCompletedRoutineIds(current=>{const done=current.includes(routine.id);setReceipt(done?`${routine.name} returned to the active pathway.`:`${routine.name} completed. Its light settled into Today.`);emitRipple(done?'routine-reopen':'routine-complete');return done?current.filter(id=>id!==routine.id):[...current,routine.id];});}
  function previewReplan(){const preview=[...displayTasks].sort((a,b)=>{const rank=(priorityRank[b.priority]??0)-(priorityRank[a.priority]??0);if(rank!==0)return rank;const aSoon=/today|overdue/i.test(a.dueLabel??'')?1:0;const bSoon=/today|overdue/i.test(b.dueLabel??'')?1:0;return bSoon-aSoon;});setReplanPreview(preview);setPanel('replan');emitRipple('replan-preview');}
  function applyReplanPreview(){if(replanPreview.length)setDisplayTasks(replanPreview);setPanel(null);setReceipt('Today reorganized around priority and capacity. External calendar changes still require approval.');emitRipple('replan-applied');}
  function openMoment(index:number){setMomentIndex(index);setPanel('moment');setReceipt(`${schedule[index].label} came into focus while Now stayed anchored.`);emitRipple('moment-focus');}
  function navigate(href:string,label:string){emitNavigate(href,label);}

  return <main className="relative h-[100dvh] w-full overflow-hidden bg-[#eee5df] text-[#2e2421]">
    <style>{`
      @keyframes todayRipple{0%{opacity:0;transform:translate(-50%,-50%) scale(.18)}24%{opacity:.72}100%{opacity:0;transform:translate(-50%,-50%) scale(3)}}
      @keyframes todayReceipt{0%{opacity:0;transform:translate(-50%,8px)}100%{opacity:1;transform:translate(-50%,0)}}
      @keyframes todayHeart{0%,31%,100%{transform:scale(.985);filter:brightness(1)}7%{transform:scale(1.045);filter:brightness(1.10)}14%{transform:scale(.992);filter:brightness(1.02)}20%{transform:scale(1.022);filter:brightness(1.075)}27%{transform:scale(.985);filter:brightness(1)}}
      @keyframes todayRayPulse{0%,31%,100%{opacity:.48;transform:translate(-50%,-50%) scale(.97)}7%{opacity:.84;transform:translate(-50%,-50%) scale(1.04)}20%{opacity:.70;transform:translate(-50%,-50%) scale(1.015)}}
      .today-ripple{animation:todayRipple .78s cubic-bezier(.15,.72,.18,1) both}.today-receipt{animation:todayReceipt .24s ease-out both}
      .today-aura-visual{position:relative;width:100%;height:100%;isolation:isolate;animation:todayHeart 1.18s cubic-bezier(.2,.68,.2,1) infinite;transform-origin:center}.today-aura-visual span{position:absolute;display:block;pointer-events:none}
      .today-aura-haze{inset:9%;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.98) 0 4%,rgba(255,236,231,.35) 17%,rgba(211,227,255,.18) 34%,rgba(229,209,247,.10) 49%,transparent 72%);filter:blur(5px)}
      .today-aura-beam{left:48.9%;top:-24%;width:2.2%;height:150%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.96),rgba(246,219,214,.45),rgba(213,231,255,.48),rgba(255,255,255,.97),transparent);filter:blur(1.2px);opacity:.82}
      .today-aura-fan{top:24%;width:45%;height:53%;opacity:.65;background:repeating-conic-gradient(from 86deg at 100% 50%,rgba(255,255,255,.92) 0deg .8deg,rgba(247,213,223,.22) 1.2deg 1.8deg,rgba(204,226,255,.18) 2.1deg 2.8deg,transparent 3.2deg 7.4deg);-webkit-mask-image:radial-gradient(ellipse at 100% 50%,#000 0 11%,rgba(0,0,0,.88) 22%,rgba(0,0,0,.42) 52%,transparent 75%);mask-image:radial-gradient(ellipse at 100% 50%,#000 0 11%,rgba(0,0,0,.88) 22%,rgba(0,0,0,.42) 52%,transparent 75%);filter:drop-shadow(0 0 5px rgba(255,255,255,.70))}.today-aura-fan-left{left:2%;transform:scaleX(-1)}.today-aura-fan-right{right:2%}
      .today-aura-rays{left:50%;top:50%;width:85%;height:85%;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.77) 0deg .28deg,transparent .48deg 5.4deg,rgba(244,206,218,.20) 5.7deg 6deg,transparent 6.3deg 10.5deg);-webkit-mask-image:radial-gradient(circle,transparent 0 18%,#000 23%,rgba(0,0,0,.74) 48%,transparent 75%);mask-image:radial-gradient(circle,transparent 0 18%,#000 23%,rgba(0,0,0,.74) 48%,transparent 75%);animation:todayRayPulse 1.18s cubic-bezier(.2,.68,.2,1) infinite}
      .today-aura-core{left:50%;top:50%;width:15%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#fff 0 24%,rgba(255,255,255,.98) 35%,rgba(255,242,237,.86) 51%,rgba(223,235,255,.42) 65%,transparent 78%);box-shadow:0 0 7px 3px #fff,0 0 24px 8px rgba(255,239,235,.78),0 0 52px 16px rgba(216,231,255,.28)}
      .today-aura-ring{left:50%;top:50%;border-radius:50%;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.72);box-shadow:0 0 7px rgba(255,255,255,.38),inset 0 0 8px rgba(255,255,255,.25)}.today-aura-ring-one{width:28%;aspect-ratio:1}.today-aura-ring-two{width:44%;aspect-ratio:1;border-color:rgba(226,214,255,.27)}
      .today-aura-compact .today-aura-fan{opacity:.45}.today-aura-compact .today-aura-beam{height:120%;top:-9%}
      .today-reference{image-rendering:auto;-webkit-font-smoothing:antialiased;filter:contrast(1.035) saturate(.94) brightness(1.012);transform:translateZ(0);backface-visibility:hidden}
      .today-ambient-reference{filter:blur(26px) saturate(.85) brightness(1.045);transform:scale(1.10);opacity:.52}
      .today-landscape{display:block}.today-portrait{display:none}
      .today-portrait-scroll{scrollbar-width:none}.today-portrait-scroll::-webkit-scrollbar{display:none}
      @media (max-aspect-ratio: 1/1){.today-landscape{display:none}.today-portrait{display:block}}
      @media (max-width:700px){.today-landscape{display:none}.today-portrait{display:block}}
      @media(prefers-reduced-motion:reduce){.today-ripple,.today-receipt,.today-aura-visual,.today-aura-rays{animation:none!important}}
    `}</style>

    <div className="today-landscape absolute inset-0">
      <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" draggable={false} className="today-ambient-reference absolute inset-0 h-full w-full select-none object-cover"/>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_43%,rgba(255,255,255,.05),rgba(238,229,223,.12)_66%,rgba(231,218,211,.24))]"/>
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="relative shrink-0 overflow-hidden shadow-[0_0_0_1px_rgba(255,255,255,.18)]" style={{width:'min(100vw, calc(100dvh * 1067 / 800))',height:'min(100dvh, calc(100vw * 800 / 1067))',containerType:'inline-size'}}>
          <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" draggable={false} className="today-reference absolute inset-0 h-full w-full select-none object-fill"/>

          <div aria-live="polite" className="absolute z-20 flex flex-col justify-center bg-transparent" style={{left:'3.9%',top:'5.4%',width:'31%',height:'8.1%',textShadow:'0 1px 1px rgba(255,255,255,.9),0 0 7px rgba(255,255,255,.32)'}}><div className="whitespace-nowrap font-serif leading-none tracking-[-.035em]" style={{fontSize:'2.47cqw'}}>{greeting}</div><div className="mt-[.75cqw] font-medium tracking-[.18em]" style={{fontSize:'.72cqw'}}>{dateLabel}</div></div>
          <InkSlot left={41.4} top={16.4} width={5.2} height={2.8} className="justify-center"><span className="font-medium" style={{fontSize:'.72cqw'}}>{timeLabel}</span></InkSlot>
          <InkSlot left={5.8} top={22.75} width={25.1} height={4.0}><span className="truncate font-serif leading-none" style={{fontSize:'1.55cqw'}}>{selectedTask.title}</span></InkSlot>
          {displayTasks.slice(0,3).map((task,index)=>{const tops=[40.95,44.95,48.95];return <InkSlot key={task.id} left={8.1} top={tops[index]} width={16.2} height={2.75}><span className="min-w-0 flex-1 truncate font-serif" style={{fontSize:'.72cqw'}}>{task.title}</span><span className="ml-[.45cqw] shrink-0" style={{fontSize:'.57cqw'}}>{taskMeta(task,index)}</span></InkSlot>;})}
          <InkSlot left={5.75} top={58.65} width={9.3} height={3.7}><span className="font-serif" style={{fontSize:'1.48cqw'}}>{timeRemaining}</span></InkSlot>
          <InkSlot left={20.4} top={58.65} width={10.2} height={3.7}><span className="font-serif" style={{fontSize:'1.48cqw'}}>{leaveReady}</span></InkSlot>
          {topThree.map((task,index)=>{const lefts=[6.5,23.2,39.1];const widths=[12.6,12.5,13.1];return <InkSlot key={`priority-${task.id}`} left={lefts[index]} top={80.55} width={widths[index]} height={3.0}><span className="truncate font-serif" style={{fontSize:'1.0cqw'}}>{task.title}</span></InkSlot>;})}
          {topThree.map((task,index)=>{const lefts=[6.5,23.2,39.1];return <InkSlot key={`impact-${task.id}`} left={lefts[index]} top={85.9} width={9.2} height={2.2}><span style={{fontSize:'.54cqw'}}>Impact: {priorityLabel(task.priority)}</span></InkSlot>;})}
          {schedule.map((item,index)=>{const topSets=[{time:14.1,title:16.45,note:21.0},{time:30.5,title:32.95,note:37.65},{time:47.0,title:49.25,note:54.0},{time:62.0,title:64.2,note:0}];const p=topSets[index];return <div key={item.label}><InkSlot left={82.15} top={p.time} width={11.1} height={2.2}><span style={{fontSize:'.59cqw'}}>{item.time}</span></InkSlot><InkSlot left={82.15} top={p.title} width={12.1} height={3.2}><span className="truncate font-serif" style={{fontSize:'1.03cqw'}}>{item.title}</span></InkSlot>{p.note>0&&<InkSlot left={82.15} top={p.note} width={12.2} height={2.2}><span className="truncate" style={{fontSize:'.56cqw'}}>{item.note}</span></InkSlot>}</div>;})}
          {liveRoutines.slice(0,3).map((routine,index)=>{const tops=[78.55,82.7,86.85];const done=completedRoutineIds.includes(routine.id);return <InkSlot key={routine.id} left={57.75} top={tops[index]} width={13.4} height={2.55}><span className={`truncate font-serif ${done?'line-through opacity-45':''}`} style={{fontSize:'.66cqw'}}>{routine.name}</span></InkSlot>;})}

          <div className="pointer-events-none absolute z-[24] -translate-x-1/2 -translate-y-1/2" style={{left:'60.3%',top:'28.0%',width:'15.2%',aspectRatio:'1'}}><LivingTodayAura/></div>
          {rippleKey>0&&<div key={rippleKey} className="today-ripple pointer-events-none absolute left-[60.3%] top-[28%] z-40 aspect-square w-[8.8cqw] rounded-full border border-white/80 shadow-[0_0_2cqw_.4cqw_rgba(255,255,255,.48),0_0_4cqw_1cqw_rgba(229,206,225,.22)]"/>}

          <PressArea label="Open current focus" style={hotspot(4.0,14.7,34.5,18.8)} onClick={()=>setPanel('focus')}/>
          <PressArea label={focusRunning?'Pause focus timer':'Start focus timer'} style={hotspot(39.2,19.8,8.2,12.2)} onClick={()=>{setFocusRunning(value=>!value);setReceipt(focusRunning?'Focus paused.':'Focus timer started.');emitRipple('focus-timer');}}/>
          <PressArea label="What Now" style={hotspot(4.9,34.2,21.0,19.0)} onClick={()=>setPanel('what-now')}/>
          <PressArea label="Energy and Capacity" style={hotspot(26.4,34.2,21.7,19.0)} onClick={()=>setPanel('energy')}/>
          <PressArea label="Living Glow Aura" style={hotspot(52.2,9.0,17.2,52.5)} onClick={()=>emitGlowOpen({activeObject:'Today · Now'})}/>
          <PressArea label="Replan My Day" style={hotspot(4.2,67.2,44.1,7.0)} onClick={previewReplan}/>
          {topThree.map((task,index)=>{const positions=[[4.1,74.7,16.4,16.2],[20.6,74.7,16.1,16.2],[36.8,74.7,16.4,16.2]] as const;const [left,top,width,height]=positions[index];return <PressArea key={`priority-hotspot-${task.id}`} label={`Focus ${task.title}`} style={hotspot(left,top,width,height)} onClick={()=>chooseTask(task)}/>;})}
          {liveRoutines.slice(0,3).map((routine,index)=>{const tops=[77.0,81.2,85.3];return <PressArea key={`routine-hotspot-${routine.id}`} label={`${completedRoutineIds.includes(routine.id)?'Reopen':'Complete'} ${routine.name}`} style={hotspot(54.4,tops[index],20.9,4.0)} onClick={()=>toggleRoutine(routine)}/>;})}
          <PressArea label="View all routines" style={hotspot(54.4,89.0,20.9,2.4)} onClick={()=>navigate('/routines','Routines')}/>
          <PressArea label="Ask Glow" style={hotspot(76.0,74.1,21.4,16.9)} onClick={()=>emitGlowOpen({activeObject:selectedTask.title})}/>
          <PressArea label="Talk to Glow" style={hotspot(91.0,82.0,5.8,7.3)} onClick={()=>emitGlowOpen({activeObject:selectedTask.title,listen:true})}/>
          <PressArea label="Saint" style={hotspot(87.1,92.3,6.7,6.8)} onClick={()=>setPanel('saint')}/>
          <PressArea label="Princess profile" style={hotspot(94.0,91.6,4.8,7.6)} onClick={()=>setPanel('profile')}/>
          {schedule.map((item,index)=>{const tops=[10.4,27.1,43.4,58.7];return <PressArea key={`moment-${item.label}`} label={item.label} style={hotspot(78.0,tops[index],18.8,14.2)} onClick={()=>openMoment(index)}/>;})}
          <PressArea label="Search Glow OS" style={hotspot(85.7,1.0,4.0,5.7)} onClick={()=>setPanel('search')}/>
          <PressArea label="Calendar" style={hotspot(90.5,1.0,4.0,5.7)} onClick={()=>navigate('/calendar','Plan · Calendar')}/>
          <PressArea label="Notifications" style={hotspot(95.0,1.0,4.0,5.7)} onClick={()=>navigate('/notices','Attention Center')}/>
          <PressArea label="Today" style={hotspot(22.5,92.5,8.0,7.2)} onClick={()=>{setReceipt('You are already in Today · The Living Center.');emitRipple('today-anchor');}}/>
          <PressArea label="Plan" style={hotspot(33.0,92.5,8.0,7.2)} onClick={()=>navigate('/planning','Plan · The Time Observatory')}/>
          <PressArea label="Life" style={hotspot(44.2,92.5,8.0,7.2)} onClick={()=>navigate('/world','Life · The Personal House')}/>
          <PressArea label="Brain" style={hotspot(54.5,92.5,8.2,7.2)} onClick={()=>navigate('/brain','Brain · The Inner Universe')}/>
          <PressArea label="Create" style={hotspot(65.0,92.5,8.4,7.2)} onClick={()=>navigate('/create','Create · The Transformation Studio')}/>
          {focusRunning&&<div className="pointer-events-none absolute z-40 grid place-items-center rounded-full border border-white/70 bg-white/66 font-serif shadow-[0_0_22px_rgba(255,226,219,.60)]" style={{left:'41.2%',top:'21.3%',width:'4.8%',aspectRatio:'1'}}><div className="text-center"><div style={{fontSize:'1.35cqw'}}>{focusMinutes}</div><div className="tracking-[.12em]" style={{fontSize:'.42cqw'}}>MIN</div></div></div>}
        </div>
      </div>
    </div>

    <div className="today-portrait absolute inset-0">
      <div className="today-portrait-scroll h-full overflow-y-auto overscroll-y-contain bg-[radial-gradient(circle_at_50%_2%,rgba(255,255,255,.98),rgba(247,237,232,.96)_34%,rgba(235,223,216,.96)_100%)] pb-[calc(96px+env(safe-area-inset-bottom))]">
        <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" draggable={false} className="pointer-events-none fixed inset-0 h-full w-full object-cover opacity-[.11] [filter:contrast(1.05)_saturate(.75)_brightness(1.08)]" style={{objectPosition:'58% 44%'}}/>
        <header className="relative z-10 px-5 pb-2 pt-[calc(18px+env(safe-area-inset-top))] sm:px-8">
          <div className="flex items-center justify-between gap-4"><p className="text-[11px] font-semibold tracking-[.22em]">GLOW OS</p><div className="flex gap-2"><button type="button" onClick={()=>setPanel('search')} className="grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-white/45 text-lg shadow-sm">⌕</button><button type="button" onClick={()=>navigate('/calendar','Plan · Calendar')} className="grid h-11 w-11 place-items-center rounded-full border border-white/80 bg-white/45 text-sm shadow-sm">CAL</button></div></div>
          <h1 className="mt-5 font-serif text-[clamp(32px,8.6vw,50px)] leading-[.98] tracking-[-.035em]">{greeting}</h1><p className="mt-3 text-[11px] font-medium tracking-[.17em] opacity-65">{dateLabel}</p>
        </header>

        <section className="relative z-10 mx-5 mt-2 min-h-[310px] sm:mx-8 sm:min-h-[360px]">
          <div className="absolute left-1/2 top-[43%] h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 sm:h-[310px] sm:w-[310px]"><LivingTodayAura/></div>
          <button type="button" onClick={()=>emitGlowOpen({activeObject:'Today · Now'})} className="absolute inset-0 z-10 w-full bg-transparent text-center"><span className="absolute bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-xl italic text-[#755c56]">The Living Glow Aura</span><span className="sr-only">Open Glow</span></button>
        </section>

        <section className="relative z-10 mx-5 sm:mx-8">
          <button type="button" onClick={()=>setPanel('focus')} className="w-full border-y border-[#bfa9a1]/55 bg-[linear-gradient(100deg,rgba(255,255,255,.68),rgba(255,255,255,.24))] px-5 py-6 text-left shadow-[0_15px_45px_rgba(102,72,63,.08)]" style={{clipPath:'polygon(0 0,96% 0,100% 18%,100% 100%,4% 100%,0 82%)'}}><div className="flex items-start justify-between gap-5"><div className="min-w-0"><p className="text-[10px] font-semibold tracking-[.18em] opacity-55">LIVE MOMENT · NOW</p><h2 className="mt-2 truncate font-serif text-[clamp(29px,8vw,42px)] leading-none">{selectedTask.title}</h2><p className="mt-3 text-sm opacity-65">High focus · Creative work</p><p className="mt-5 font-serif italic text-[#9d756c]">This is your moment.</p></div><button type="button" onClick={event=>{event.stopPropagation();setFocusRunning(value=>!value);emitRipple('focus-timer');}} className="grid h-[82px] w-[82px] shrink-0 place-items-center rounded-full border border-[#b79389]/55 bg-white/42 shadow-[inset_0_0_24px_rgba(255,255,255,.74)]"><span className="text-center"><span className="block font-serif text-3xl">{focusMinutes}</span><span className="block text-[9px] tracking-[.16em]">MIN</span></span></button></div></button>

          <div className="mt-7 grid grid-cols-[1.18fr_.82fr] gap-4">
            <section className="border-l border-[#bca49d]/60 pl-4"><button type="button" onClick={()=>setPanel('what-now')} className="w-full text-left"><p className="text-[11px] font-semibold tracking-[.16em]">WHAT NOW?</p><p className="mt-1 text-xs opacity-55">Your next right 3.</p></button><div className="mt-4 space-y-0">{displayTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" onClick={()=>chooseTask(task)} className="flex w-full items-center gap-3 border-t border-[#cbb8b1]/45 py-3 text-left"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-[#bea49c]/60 text-[10px]">{index+1}</span><span className="min-w-0 flex-1 truncate font-serif text-[15px]">{task.title}</span></button>)}</div></section>
            <section className="flex flex-col items-center justify-start border-l border-[#bca49d]/45 pl-4"><button type="button" onClick={()=>setPanel('energy')} className="w-full text-left"><p className="text-[11px] font-semibold tracking-[.14em]">CAPACITY</p></button><button type="button" onClick={()=>setPanel('energy')} className="mt-4 grid h-28 w-28 place-items-center rounded-full border border-[#b9948b]/55 bg-white/28 shadow-[inset_0_0_34px_rgba(255,255,255,.72)]"><span className="text-center"><span className="block font-serif text-4xl">{capacity}</span><span className="block font-serif text-sm">Radiant</span></span></button><p className="mt-3 text-center text-[10px] leading-5 opacity-55">Mental {capacity}%<br/>Creative {creative}%</p></section>
          </div>

          <div className="mt-8 grid grid-cols-2 border-y border-[#bda8a0]/48 py-4"><div className="pr-4"><p className="text-[10px] tracking-[.14em] opacity-55">TIME REMAINING TODAY</p><p className="mt-1 font-serif text-2xl">{timeRemaining}</p></div><div className="border-l border-[#bda8a0]/48 pl-4"><p className="text-[10px] tracking-[.14em] opacity-55">LEAVE-READY</p><p className="mt-1 font-serif text-2xl">{leaveReady}</p></div></div>

          <button type="button" onClick={previewReplan} className="mt-7 flex w-full items-center justify-between border-y border-[#b99e96]/45 bg-white/22 px-4 py-5 text-left"><span><span className="block font-serif text-2xl">Replan My Day</span><span className="mt-1 block text-xs opacity-55">One-tap reset. Realign, reschedule, and flow.</span></span><span className="grid h-11 w-11 place-items-center rounded-full border border-[#b99e96]/55 text-xl">→</span></button>

          <section className="mt-9"><p className="text-[11px] font-semibold tracking-[.18em]">NEXT · LATER · TONIGHT · TOMORROW</p><div className="relative mt-5 border-l border-[#aa8e86]/50 pl-6">{schedule.map((item,index)=><button key={item.label} type="button" onClick={()=>openMoment(index)} className="relative block w-full border-b border-[#c9b6af]/42 py-4 text-left"><span className="absolute -left-[30px] top-5 h-3 w-3 rounded-full border border-[#967a72] bg-[#f6ebe6]"/><span className="text-[10px] font-semibold tracking-[.15em] opacity-60">{item.label} · {item.time}</span><span className="mt-1 block font-serif text-[22px]">{item.title}</span>{item.note&&<span className="mt-1 block text-xs opacity-55">{item.note}</span>}</button>)}</div></section>

          <section className="mt-9"><p className="text-[11px] font-semibold tracking-[.18em]">TOP 3 PRIORITIES</p><div className="mt-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"><div className="flex min-w-max gap-0">{topThree.map((task,index)=><button key={task.id} type="button" onClick={()=>chooseTask(task)} className="w-[70vw] max-w-[330px] border-l border-[#ae9289]/50 px-4 py-3 text-left first:border-l-0 first:pl-0"><span className="text-[10px] tracking-[.16em] opacity-50">{['CREATE','CARE','PLAN'][index]}</span><span className="mt-2 block font-serif text-xl">{task.title}</span><span className="mt-2 block text-xs opacity-55">Impact: {priorityLabel(task.priority)}</span></button>)}</div></div></section>

          <section className="mt-9"><div className="flex items-end justify-between"><div><p className="text-[11px] font-semibold tracking-[.18em]">ROUTINES DUE NOW</p><p className="mt-1 text-xs opacity-55">One active pathway, not a scoreboard.</p></div><button type="button" onClick={()=>navigate('/routines','Routines')} className="text-xs underline underline-offset-4">View all</button></div><div className="mt-4 border-y border-[#baa29a]/45">{liveRoutines.slice(0,5).map((routine,index)=>{const done=completedRoutineIds.includes(routine.id);return <button key={routine.id} type="button" onClick={()=>toggleRoutine(routine)} className="flex w-full items-center gap-3 border-t border-[#cdbab3]/38 py-3 text-left first:border-t-0"><span className={`min-w-0 flex-1 font-serif ${done?'line-through opacity-40':''}`}>{routine.name}</span><span className="text-[10px] opacity-50">{[5,10,7,12,8][index]??8} MIN</span><span className={`grid h-6 w-6 place-items-center rounded-full border border-[#997c74]/60 text-[11px] ${done?'bg-[#8f9984] text-white':''}`}>{done?'✓':''}</span></button>;})}</div></section>

          <button type="button" onClick={()=>emitGlowOpen({activeObject:selectedTask.title})} className="mt-10 w-full border-y border-[#ac8f87]/48 py-7 text-left"><div className="flex items-center justify-between gap-4"><div><p className="text-[11px] font-semibold tracking-[.18em]">ASK GLOW</p><p className="mt-1 font-serif text-2xl italic">Your oracle. Your clarity.</p><p className="mt-3 text-sm opacity-60">What would make today iconic?</p></div><div className="h-20 w-20 shrink-0"><LivingTodayAura compact/></div></div></button>
          <div className="mt-7 flex items-center justify-between border-t border-[#baa49c]/40 py-4"><button type="button" onClick={()=>setPanel('saint')} className="text-sm">🐾 Saint</button><button type="button" onClick={()=>setPanel('profile')} className="text-sm">Princess · Settings</button></div>
        </section>
      </div>

      <nav className="fixed inset-x-3 bottom-[calc(8px+env(safe-area-inset-bottom))] z-40 grid grid-cols-5 rounded-[26px] border border-white/75 bg-[rgba(248,240,235,.88)] px-1 py-2 shadow-[0_12px_38px_rgba(88,62,54,.16)] backdrop-blur-xl sm:inset-x-10"><button type="button" onClick={()=>emitRipple('today-anchor')} className="min-h-12 rounded-[20px] bg-white/55 text-xs font-medium">Today</button><button type="button" onClick={()=>navigate('/planning','Plan · The Time Observatory')} className="min-h-12 text-xs">Plan</button><button type="button" onClick={()=>navigate('/world','Life · The Personal House')} className="min-h-12 text-xs">Life</button><button type="button" onClick={()=>navigate('/brain','Brain · The Inner Universe')} className="min-h-12 text-xs">Brain</button><button type="button" onClick={()=>navigate('/create','Create · The Transformation Studio')} className="min-h-12 text-xs">Create</button></nav>
    </div>

    {receipt&&<div aria-live="polite" className="today-receipt fixed bottom-[calc(92px+env(safe-area-inset-bottom))] left-1/2 z-[5100] max-w-[min(88vw,620px)] rounded-full border border-white/75 bg-white/82 px-5 py-2.5 text-center text-xs shadow-[0_10px_30px_rgba(92,64,56,.13)] backdrop-blur-lg">{receipt}</div>}

    {panel==='search'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">SEARCH GLOW OS</p><h2 className="mt-2 font-serif text-3xl">Cast light across your world.</h2><input autoFocus value={searchText} onChange={event=>setSearchText(event.target.value)} placeholder="Tasks, moments, routines…" className="mt-6 w-full rounded-2xl border border-[#d8c2bb] bg-white/62 px-4 py-3 outline-none focus:ring-2 focus:ring-[#cba6a0]"/><div className="mt-4 space-y-2">{searchText&&!searchResults.length&&<p className="text-sm opacity-70">No matching live items yet.</p>}{searchResults.map((result,index)=><button key={`${result.kind}-${index}`} type="button" onClick={()=>{setPanel(null);navigate(result.href,result.activeObject);}} className="block w-full border-b border-[#d9c8c2]/50 px-1 py-3 text-left"><span className="mr-2 text-[10px] font-semibold tracking-[.15em] opacity-60">{result.kind.toUpperCase()}</span>{result.title}</button>)}</div></Modal>}
    {panel==='focus'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">LIVE MOMENT · NOW</p><h2 className="mt-2 font-serif text-3xl">{selectedTask.title}</h2><p className="mt-2 text-sm opacity-65">High focus · Creative work</p><div className="mt-6 flex items-center gap-6"><button type="button" onClick={()=>setFocusRunning(value=>!value)} className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-2 border-[#d8bdb5] bg-white/45 shadow-[inset_0_0_30px_rgba(255,255,255,.8)]"><div><div className="font-serif text-4xl">{focusMinutes}</div><div className="text-[10px] tracking-[.18em]">MIN</div></div></button><div><p className="font-serif italic text-[#9e766e]">This is your moment.</p><p className="mt-3 text-sm leading-relaxed opacity-70">The current object stays tied to Today. Start, pause, or move deeper without losing the timeline around it.</p></div></div><div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={()=>setFocusRunning(value=>!value)} className="rounded-full bg-[#3d302c] px-5 py-2.5 text-sm text-white">{focusRunning?'Pause focus':'Start focus'}</button><button type="button" onClick={()=>navigate('/focus',selectedTask.title)} className="rounded-full border border-[#d5bdb6] bg-white/45 px-5 py-2.5 text-sm">Expand into Focus Studio</button><button type="button" onClick={()=>emitGlowOpen({prompt:`Help me focus on ${selectedTask.title}`,activeObject:selectedTask.title})} className="rounded-full border border-[#d5bdb6] bg-white/45 px-5 py-2.5 text-sm">Ask Glow</button></div></Modal>}
    {panel==='what-now'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">WHAT NOW?</p><h2 className="mt-2 font-serif text-3xl">Your next right three.</h2><div className="mt-5 divide-y divide-[#d7c6c0]">{displayTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" onClick={()=>chooseTask(task)} className="flex w-full items-center gap-3 py-3 text-left"><span className="grid h-8 w-8 place-items-center rounded-full border border-[#c9aaa1]">{index+1}</span><span className="min-w-0 flex-1"><span className="block font-serif text-lg">{task.title}</span><span className="text-xs opacity-60">{taskMeta(task,index)} · {priorityLabel(task.priority)} impact</span></span></button>)}</div><button type="button" onClick={()=>emitGlowOpen({prompt:'Show me what I need to do next.',activeObject:'What Now'})} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Glow to choose with me</button></Modal>}
    {panel==='energy'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">ENERGY & CAPACITY</p><h2 className="mt-2 font-serif text-3xl">How much can today hold?</h2><div className="mt-5 flex flex-col items-center gap-6 sm:flex-row"><div className="grid h-32 w-32 shrink-0 place-items-center rounded-full border-2 border-[#d9bdb5] bg-white/40 text-center"><div><div className="font-serif text-5xl">{capacity}</div><div className="font-serif">Radiant</div></div></div><div className="w-full flex-1 space-y-3">{[['Mental',capacity],['Emotional',emotional],['Physical',physical],['Creative',creative]].map(([label,value])=><div key={String(label)}><div className="mb-1 flex justify-between text-xs"><span>{label}</span><span>{value}%</span></div><div className="h-1 rounded-full bg-[#ddcec9]"><div className="h-full rounded-full bg-[#cda39c]" style={{width:`${value}%`}}/></div></div>)}</div></div>{sleepHours!=null&&<p className="mt-5 text-sm opacity-70">Last recorded sleep: {sleepHours} hours.</p>}<button type="button" onClick={()=>emitGlowOpen({prompt:'Replan the rest of today around my current capacity.',activeObject:'Energy & Capacity'})} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Glow to adapt the day</button></Modal>}
    {panel==='routines'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">ROUTINES DUE NOW</p><h2 className="mt-2 font-serif text-3xl">Move through the pathway.</h2><div className="mt-5 divide-y divide-[#d9c8c2]">{liveRoutines.slice(0,5).map((routine,index)=>{const done=completedRoutineIds.includes(routine.id);return <button key={routine.id} type="button" onClick={()=>toggleRoutine(routine)} className="flex w-full items-center gap-3 py-3 text-left"><span className={`min-w-0 flex-1 font-serif text-lg ${done?'line-through opacity-45':''}`}>{routine.name}</span><span className="text-xs opacity-60">{[5,10,7,12,8][index]??8} MIN</span><span className={`grid h-5 w-5 place-items-center rounded-full border border-[#a9857d] ${done?'bg-[#9fa88e] text-white':''}`}>{done?'✓':''}</span></button>;})}</div><button type="button" onClick={()=>navigate('/routines','Routines')} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Open guided Routine Studio</button></Modal>}
    {panel==='replan'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">REPLAN MY DAY</p><h2 className="mt-2 font-serif text-3xl">A reversible preview, not a silent rewrite.</h2><p className="mt-3 text-sm leading-relaxed opacity-70">Glow gathers unfinished work toward Now. External calendar changes still require approval.</p><div className="mt-5 divide-y divide-[#d7c6c0]">{replanPreview.slice(0,5).map((task,index)=><div key={task.id} className="flex items-center gap-3 py-3"><span className="grid h-7 w-7 place-items-center rounded-full border border-[#c8aaa1] text-xs">{index+1}</span><span className="min-w-0 flex-1 font-serif">{task.title}</span><span className="text-xs opacity-55">{priorityLabel(task.priority)}</span></div>)}</div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={applyReplanPreview} className="rounded-full bg-[#3d302c] px-5 py-2.5 text-sm text-white">Use this order in Today</button><button type="button" onClick={()=>emitGlowOpen({prompt:'Help me replan the rest of today and show me the changes before committing them.',activeObject:'Replan My Day'})} className="rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Plan it with Glow</button></div></Modal>}
    {panel==='saint'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">SAINT</p><h2 className="mt-2 font-serif text-3xl">Saint is with you. ♡</h2><p className="mt-4 text-sm leading-relaxed opacity-75">His Today context stays connected to walks, routines, leave-ready timing, and Life without turning the room into another dashboard.</p><button type="button" onClick={()=>emitGlowOpen({prompt:'What do I need to remember for Saint today?',activeObject:'Saint'})} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Glow about Saint</button></Modal>}
    {panel==='profile'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">PRINCESS</p><h2 className="mt-2 font-serif text-3xl">Your personal layer.</h2><p className="mt-4 text-sm leading-relaxed opacity-75">Appearance, page climates, Glow initiative, accessibility, voice, privacy, and room-specific preferences stay connected here.</p><button type="button" onClick={()=>navigate('/settings','Settings')} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Open settings</button></Modal>}
    {panel==='moment'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">{schedule[momentIndex].label}</p><h2 className="mt-2 font-serif text-3xl">{schedule[momentIndex].title}</h2><p className="mt-2 text-sm">{schedule[momentIndex].time}{schedule[momentIndex].duration?` · ${schedule[momentIndex].duration}`:''}</p>{schedule[momentIndex].note&&<p className="mt-3 text-sm opacity-70">{schedule[momentIndex].note}</p>}<p className="mt-5 text-sm leading-relaxed opacity-70">This time object expanded from Today. Now stays connected behind it.</p><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={()=>navigate(schedule[momentIndex].href,schedule[momentIndex].label)} className="rounded-full bg-[#3b2d29] px-5 py-2.5 text-sm text-white">Move into time</button><button type="button" onClick={()=>emitGlowOpen({prompt:`Help me prepare for ${schedule[momentIndex].title}`,activeObject:schedule[momentIndex].title})} className="rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Glow</button></div></Modal>}
  </main>;
}
