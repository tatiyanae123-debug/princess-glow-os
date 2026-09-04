'use client';

import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Bell, Brain, CalendarDays, ChevronRight, Heart, PawPrint, Search, Sparkles, SunMedium, WandSparkles } from 'lucide-react';
import { TODAY_LIVING_CENTER_REFERENCE } from '@/lib/design/today-living-center-reference';

type TaskLite={id:string;title:string;priority:string;dueLabel?:string|null};
type EventLite={id:string;title:string;timeLabel:string;location?:string|null;startAtISO?:string|null;allDay?:boolean};
type EventEntry={event:EventLite;date:Date};
type RoutineLite={id:string;name:string;timeOfDay:string};
type Props={tasks:TaskLite[];events:EventLite[];routines:RoutineLite[];energy:number|null;mood:number|null;sleepHours:number|null};
type Panel='search'|'what-now'|'energy'|'routines'|'saint'|'moment'|'focus'|'profile'|'replan'|null;
type Daypart='morning'|'afternoon'|'evening'|'night';
type ScheduleItem={label:'NEXT'|'LATER'|'TONIGHT'|'TOMORROW';time:string;title:string;note:string;href:string;quiet?:boolean};
type SearchResult={kind:'Task'|'Event'|'Routine';title:string;href:string;activeObject:string};

const priorityRank:Record<string,number>={urgent:5,high:4,medium:3,low:2};
const fallbackTasks:Record<Daypart,TaskLite>={
  morning:{id:'phase-morning',title:'Begin with the clearest next move',priority:'medium',dueLabel:'Now'},
  afternoon:{id:'phase-afternoon',title:'Reset the middle of the day',priority:'medium',dueLabel:'Now'},
  evening:{id:'phase-evening',title:'Transition into the evening',priority:'medium',dueLabel:'Now'},
  night:{id:'phase-night',title:'Close the day gently',priority:'medium',dueLabel:'Now'},
};
const fallbackRoutines:Record<Daypart,RoutineLite[]>={
  morning:[{id:'m1',name:'Morning hydration',timeOfDay:'morning'},{id:'m2',name:'Creativity warm-up',timeOfDay:'morning'},{id:'m3',name:'Posture + stretch',timeOfDay:'morning'}],
  afternoon:[{id:'a1',name:'Hydrate + reset',timeOfDay:'afternoon'},{id:'a2',name:'Posture + stretch',timeOfDay:'afternoon'},{id:'a3',name:'Midday reset',timeOfDay:'afternoon'}],
  evening:[{id:'e1',name:'Evening transition',timeOfDay:'evening'},{id:'e2',name:'Hydrate + move',timeOfDay:'evening'},{id:'e3',name:'Prepare tomorrow',timeOfDay:'evening'}],
  night:[{id:'n1',name:'Night hydration',timeOfDay:'night'},{id:'n2',name:'Skincare close',timeOfDay:'night'},{id:'n3',name:'Tomorrow prep',timeOfDay:'night'}],
};
const words:Record<Daypart,{yes:string[];no:string[]}>= {
  morning:{yes:['morning','wake','breakfast','sunrise'],no:['night','bedtime','evening']},
  afternoon:{yes:['midday','afternoon','lunch','noon'],no:['night','bedtime','morning']},
  evening:{yes:['evening','sunset','dinner','transition'],no:['morning','midday','lunch']},
  night:{yes:['night','shutdown','sleep','bedtime','wind down','wind-down','evening'],no:['morning','midday','afternoon','lunch']},
};

function daypartFor(hour:number):Daypart{if(hour>=5&&hour<12)return'morning';if(hour>=12&&hour<17)return'afternoon';if(hour>=17&&hour<20)return'evening';return'night';}
function greetingFor(d:Daypart){return d==='morning'?'Good morning, Tatiyana ♡':d==='afternoon'?'Good afternoon, Tatiyana ♡':d==='evening'?'Good evening, Tatiyana ♡':'Good night, Tatiyana ♡';}
function sameDay(a:Date,b:Date){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function formatDuration(ms:number){const m=Math.max(0,Math.floor(ms/60000));return`${Math.floor(m/60)}H ${String(m%60).padStart(2,'0')}M`;}
function priorityLabel(v:string){const p=v.toLowerCase();return p==='urgent'||p==='high'?'High':p==='low'?'Low':'Medium';}
function safeDueLabel(task:TaskLite){const raw=task.dueLabel?.trim()??'';if(/^(today|tomorrow|overdue|now)$/i.test(raw))return raw;if(/\b(min|minute|hour|hr)\b/i.test(raw))return raw.replace(/minutes?/i,'MIN').replace(/hours?/i,'HR');return'Flexible';}
function taskScore(task:TaskLite,d:Daypart){const value=task.title.toLowerCase();let score=(priorityRank[task.priority]??2)*16;for(const w of words[d].yes)if(value.includes(w))score+=32;for(const w of words[d].no)if(value.includes(w))score-=48;if(task.dueLabel==='Overdue')score+=20;if(task.dueLabel==='Today')score+=14;if(task.dueLabel==='Tomorrow')score-=4;return score;}
function categoryFor(title:string,index:number){const v=title.toLowerCase();if(/hair|body|skin|wellness|water|hydrate|care|beauty/.test(v))return'CARE';if(/content|write|studio|create|design|creative/.test(v))return'CREATE';if(/plan|schedule|calendar|prepare|tomorrow|organize/.test(v))return'PLAN';return['FOCUS','CARE','PLAN'][index]??'FOCUS';}
function contextFor(priority:string){return /urgent|high/i.test(priority)?'High focus · Protect what matters':/low/i.test(priority)?'Light focus · Keep momentum':'Steady focus · Move with intention';}
function momentLine(d:Daypart){return d==='morning'?'Begin here.':d==='afternoon'?'This is your moment.':d==='evening'?'Finish what matters.':'Only what still matters.';}
function replanLabel(d:Daypart){return d==='night'?'Reset the rest of tonight':d==='evening'?'Replan My Evening':'Replan My Day';}
function shaktiPrompt(d:Daypart){return d==='morning'?'What deserves your first clear yes?':d==='afternoon'?'What would make the rest of today lighter?':d==='evening'?'What still deserves your energy tonight?':'What can we close, carry, or release?';}
function hotspot(left:number,top:number,width:number,height:number):CSSProperties{return{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`};}
function eventTime(entry:EventEntry|undefined,fallback:string){return entry?entry.date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):fallback;}
function eventTitle(entry:EventEntry|undefined,fallback:string){return entry?.event.title??fallback;}

function InkLift({left,top,width,height,soft=false}:{left:number;top:number;width:number;height:number;soft?:boolean}){return <span aria-hidden="true" className={`today-inklift-v7 ${soft?'soft':''}`} style={{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`}}/>;}
function PressArea({label,style,onClick}:{label:string;style:CSSProperties;onClick:()=>void}){return <button type="button" aria-label={label} title={label} onClick={onClick} style={style} className="absolute z-50 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#9d7770]"/>;}
function ShaktiPresence({compact=false}:{compact?:boolean}){return <div className={`shakti-v7 ${compact?'compact':''}`} aria-hidden="true"><span className="depth-haze rear"/><span className="wing wing-left rear"/><span className="wing wing-right rear"/><span className="beam beam-up"/><span className="beam beam-down"/><span className="rayfield rayfield-a"/><span className="rayfield rayfield-b"/><span className="spectral spectral-left"/><span className="spectral spectral-right"/><span className="core-shell"/><span className="core-volume"/><span className="core-white"/><span className="caustic"/><span className="front-lens"/><span className="ground-light"/></div>;}
function Modal({children,onClose}:{children:ReactNode;onClose:()=>void}){return <div className="fixed inset-0 z-[5200] grid place-items-center bg-[#30272c]/18 p-4 sm:p-6" onMouseDown={onClose}><section role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()} className="relative max-h-[min(84dvh,760px)] w-[min(92vw,620px)] overflow-y-auto overscroll-contain rounded-[30px] border border-white/75 bg-[linear-gradient(145deg,rgba(255,253,250,.96),rgba(239,231,233,.92))] p-6 text-[#302421] shadow-[0_24px_90px_rgba(74,50,44,.22)] backdrop-blur-xl sm:p-7"><button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-[#d9c8c2]/70 bg-white/70 text-xl">×</button>{children}</section></div>;}
function openShakti(detail:{prompt?:string;activeObject?:string;listen?:boolean}={}){window.dispatchEvent(new CustomEvent('glow:open',{detail}));}
function navigate(href:string,label:string){window.dispatchEvent(new CustomEvent('glow:navigate',{detail:{href,label}}));}
function ripple(label:string){window.dispatchEvent(new CustomEvent('glow:ripple',{detail:{label}}));}

export function TodayLivingCenterV4({tasks,events,routines,energy,mood}:Props){
  const [now,setNow]=useState(()=>new Date());
  const [panel,setPanel]=useState<Panel>(null);
  const [momentIndex,setMomentIndex]=useState(0);
  const [searchText,setSearchText]=useState('');
  const [manualTaskId,setManualTaskId]=useState<string|null>(null);
  const [completedRoutineIds,setCompletedRoutineIds]=useState<string[]>([]);
  const [focusSeconds,setFocusSeconds]=useState(0);
  const [focusRunning,setFocusRunning]=useState(false);
  const [receipt,setReceipt]=useState('');
  const [replanPreview,setReplanPreview]=useState<TaskLite[]>([]);
  const [localOrder,setLocalOrder]=useState<string[]>([]);

  useEffect(()=>{const t=window.setInterval(()=>setNow(new Date()),15000);return()=>window.clearInterval(t);},[]);
  useEffect(()=>{if(!focusRunning)return;const t=window.setInterval(()=>setFocusSeconds(v=>Math.max(0,v-1)),1000);return()=>window.clearInterval(t);},[focusRunning]);
  useEffect(()=>{if(focusRunning&&focusSeconds===0){setFocusRunning(false);setReceipt('Focus complete. The moment settled back into Today.');ripple('focus-complete');}},[focusRunning,focusSeconds]);
  useEffect(()=>{if(!receipt)return;const t=window.setTimeout(()=>setReceipt(''),4200);return()=>window.clearTimeout(t);},[receipt]);
  useEffect(()=>{if(!panel)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setPanel(null);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[panel]);

  const daypart=daypartFor(now.getHours());
  const greeting=greetingFor(daypart);
  const dateLabel=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
  const timeLabel=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const dateKey=now.toLocaleDateString('en-CA');
  useEffect(()=>{try{const raw=localStorage.getItem(`glow:today:routines:${dateKey}`);if(raw){const parsed=JSON.parse(raw) as string[];if(Array.isArray(parsed))setCompletedRoutineIds(parsed);}}catch{}},[dateKey]);
  useEffect(()=>{try{localStorage.setItem(`glow:today:routines:${dateKey}`,JSON.stringify(completedRoutineIds));}catch{}},[completedRoutineIds,dateKey]);

  const orderedTasks=useMemo(()=>{const source=tasks.length?tasks:[fallbackTasks[daypart]];const ranked=[...source].sort((a,b)=>taskScore(b,daypart)-taskScore(a,daypart));if(!localOrder.length)return ranked;const rank=new Map(localOrder.map((id,i)=>[id,i]));return [...ranked].sort((a,b)=>(rank.get(a.id)??999)-(rank.get(b.id)??999));},[tasks,daypart,localOrder]);
  const recommendedTask=orderedTasks[0]??fallbackTasks[daypart];
  const selectedTask=(manualTaskId?orderedTasks.find(t=>t.id===manualTaskId):undefined)??recommendedTask;
  const recommendedMinutes=/urgent|high/i.test(selectedTask.priority)?47:/low/i.test(selectedTask.priority)?20:30;
  const focusMinutes=focusSeconds>0?Math.ceil(focusSeconds/60):recommendedMinutes;

  const capacity=Math.max(35,Math.min(96,energy?Math.round(energy*10):82));
  const emotional=Math.max(35,Math.min(96,mood?Math.round(mood*10):85));
  const physical=Math.max(40,Math.min(96,energy?Math.round(energy*10-8):70));
  const creative=Math.max(55,Math.min(98,capacity+13));
  const metrics=[['Mental',capacity],['Emotional',emotional],['Physical',physical],['Creative',creative]] as const;
  const endOfDay=new Date(now);endOfDay.setHours(23,59,59,999);const timeRemaining=formatDuration(endOfDay.getTime()-now.getTime());

  const eventEntries=useMemo<EventEntry[]>(()=>events.flatMap(event=>{if(!event.startAtISO)return[];const date=new Date(event.startAtISO);return Number.isNaN(date.getTime())?[]:[{event,date}];}),[events]);
  const todayTimed=eventEntries.filter(x=>!x.event.allDay&&sameDay(x.date,now)).sort((a,b)=>a.date.getTime()-b.date.getTime());
  const futureToday=todayTimed.filter(x=>x.date.getTime()>now.getTime()+60000);
  const tomorrowDate=new Date(now);tomorrowDate.setDate(tomorrowDate.getDate()+1);
  const tomorrowItems=eventEntries.filter(x=>sameDay(x.date,tomorrowDate)).sort((a,b)=>a.date.getTime()-b.date.getTime());
  const nextEvent:EventEntry|undefined=futureToday[0];
  const laterEvent:EventEntry|undefined=futureToday[1];
  const tonightEvent:EventEntry|undefined=futureToday.find(x=>x.date.getHours()>=17&&x.event.id!==nextEvent?.event.id&&x.event.id!==laterEvent?.event.id);
  const tomorrowFirst:EventEntry|undefined=tomorrowItems[0];
  const wrapAt=nextEvent?new Date(nextEvent.date.getTime()-30*60000):null;
  const leaveReady=wrapAt&&wrapAt>now?formatDuration(wrapAt.getTime()-now.getTime()):'CLEAR';
  const schedule:ScheduleItem[]=[
    {label:'NEXT',time:eventTime(nextEvent,daypart==='night'?'Now':'Next'),title:eventTitle(nextEvent,daypart==='night'?'Open breathing space':'Protect the next right move'),note:nextEvent?.event.location??(daypart==='night'?'Nothing fixed is pulling you forward.':'Keep the next move clear.'),href:'/calendar',quiet:!nextEvent},
    {label:'LATER',time:eventTime(laterEvent,'Later'),title:eventTitle(laterEvent,daypart==='night'?'Nothing fixed':'Open breathing space'),note:laterEvent?.event.location??(daypart==='night'?'Let the rest stay quiet.':'Leave breathing room around it.'),href:'/calendar',quiet:!laterEvent},
    {label:'TONIGHT',time:eventTime(tonightEvent,'Tonight'),title:eventTitle(tonightEvent,daypart==='night'?'Close gently':'Wind down'),note:tonightEvent?.event.location??(daypart==='night'?'Close, carry, or release.':'Keep the evening soft.'),href:'/calendar',quiet:!tonightEvent},
    {label:'TOMORROW',time:eventTime(tomorrowFirst,'Preview'),title:eventTitle(tomorrowFirst,'A quiet glimpse'),note:tomorrowFirst?.event.location??'',href:'/tomorrow',quiet:!tomorrowFirst},
  ];
  const routineOrder=useMemo(()=>{const exact=routines.filter(r=>r.timeOfDay===daypart);const adjacent=daypart==='night'?routines.filter(r=>r.timeOfDay==='evening'):daypart==='evening'?routines.filter(r=>r.timeOfDay==='night'):[];const source=[...exact,...adjacent];return source.length?source:fallbackRoutines[daypart];},[routines,daypart]);
  const topThree=[...orderedTasks.slice(0,3)];while(topThree.length<3)topThree.push(fallbackTasks[daypart]);
  const prompt=shaktiPrompt(daypart);
  const searchResults=useMemo<SearchResult[]>(()=>{const q=searchText.trim().toLowerCase();if(!q)return[];return[...orderedTasks.map(t=>({kind:'Task' as const,title:t.title,href:'/focus',activeObject:t.title})),...events.map(e=>({kind:'Event' as const,title:e.title,href:'/calendar',activeObject:e.title})),...routineOrder.map(r=>({kind:'Routine' as const,title:r.name,href:'/routines',activeObject:r.name}))].filter(x=>x.title.toLowerCase().includes(q)).slice(0,9);},[searchText,orderedTasks,events,routineOrder]);

  function chooseTask(task:TaskLite){setManualTaskId(task.id);setFocusSeconds(0);setFocusRunning(false);setPanel('focus');setReceipt(`${task.title} moved into focus without leaving Today.`);}
  function toggleFocus(){if(!focusSeconds)setFocusSeconds(recommendedMinutes*60);setFocusRunning(v=>!v);}
  function toggleRoutine(routine:RoutineLite){setCompletedRoutineIds(current=>{const done=current.includes(routine.id);setReceipt(done?`${routine.name} returned to the active pathway.`:`${routine.name} completed and settled into Today.`);return done?current.filter(id=>id!==routine.id):[...current,routine.id];});}
  function previewReplan(){const preview=[...orderedTasks].sort((a,b)=>taskScore(b,daypart)-taskScore(a,daypart));setReplanPreview(preview);setPanel('replan');}
  function applyReplan(){if(replanPreview.length)setLocalOrder(replanPreview.map(t=>t.id));setPanel(null);setReceipt('Today reorganized locally. External schedule changes still need approval.');}
  function openMoment(index:number){setMomentIndex(index);setPanel('moment');}
  const currentTimelineLabel=daypart==='night'||daypart==='evening'?'TONIGHT':'NEXT';

  return <main className="today-v7 relative h-[100dvh] w-full overflow-hidden" data-daypart={daypart}>
    <div className="today-landscape today-landscape-v7 absolute inset-0">
      <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" draggable={false} className="today-room-ambient-v7 absolute inset-0 h-full w-full select-none object-cover"/>
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden"><div className="today-stage-v7 relative shrink-0 overflow-hidden" style={{width:'min(100vw, calc(100dvh * 1067 / 800))',height:'min(100dvh, calc(100vw * 800 / 1067))'}}>
        <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" draggable={false} className="today-reference-v7 absolute inset-0 h-full w-full select-none object-fill"/><div className="today-climate-v7"/><div className="today-window-climate-v7"/><div className="today-light-pools-v7"/>
        <InkLift left={3.1} top={5.1} width={34.2} height={8.8}/><InkLift left={5.0} top={18.1} width={30.7} height={14.8}/><InkLift left={38.0} top={18.5} width={9.5} height={13.2} soft/><InkLift left={5.1} top={36.5} width={20.7} height={17.0}/><InkLift left={26.5} top={36.5} width={20.7} height={14.8}/><InkLift left={5.0} top={56.4} width={30.7} height={10.2}/><InkLift left={15.1} top={68.7} width={32.8} height={5.7}/><InkLift left={5.0} top={77.0} width={47.2} height={13.2}/><InkLift left={55.2} top={78.2} width={20.3} height={11.7}/><InkLift left={77.0} top={78.0} width={19.2} height={11.8}/><InkLift left={82.0} top={13.2} width={14.0} height={55.8}/><InkLift left={59.0} top={41.0} width={11.5} height={11.0} soft/>
        <section className="today-live-v7 greeting-v7" aria-live="polite"><div className="greeting" suppressHydrationWarning>{greeting}</div><div className="date" suppressHydrationWarning>{dateLabel}</div></section>
        <section className="today-live-v7 now-v7"><div className="eyebrow">LIVE MOMENT</div><div className="now-word">NOW</div><div className="task">{selectedTask.title}</div><div className="context">{contextFor(selectedTask.priority)}</div><div className="moment-line">{momentLine(daypart)}</div><div className="clock" suppressHydrationWarning>{timeLabel}</div><button type="button" className={`focus-orbit ${focusRunning?'running':''}`} onClick={toggleFocus}><strong>{focusMinutes}</strong><small>{focusSeconds>0?'FOCUS TIME':'START FOCUS'}</small></button><button type="button" aria-label="Open current focus" className="absolute inset-[0_9cqw_0_0] bg-transparent" onClick={()=>setPanel('focus')}/></section>
        <section className="today-live-v7 what-v7"><button type="button" onClick={()=>setPanel('what-now')} className="w-full text-left"><div className="eyebrow">WHAT NOW? <Sparkles size={12}/></div><div className="subtitle">Your next right 3.</div></button>{orderedTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" className="what-row" onClick={()=>chooseTask(task)}><span className="num">{index+1}</span><span className="title">{task.title}</span><span className="meta">{safeDueLabel(task)}</span></button>)}</section>
        <section className="today-live-v7 capacity-v7"><button type="button" onClick={()=>setPanel('energy')} className="w-full text-left"><div className="eyebrow">ENERGY & CAPACITY</div></button><div className="capacity-body"><button type="button" onClick={()=>setPanel('energy')} className="capacity-orb"><strong>{capacity}</strong><span>Radiant</span></button><div className="metrics">{metrics.map(([label,value])=><div className="metric" key={label}><span>{label}</span><span className="metric-track"><i style={{width:`${value}%`}}/></span><b>{value}%</b></div>)}</div></div></section>
        <section className="today-live-v7 counts-v7"><div><div className="count-label">TIME REMAINING TODAY</div><div className="count-value">{timeRemaining}</div><div className="count-note">until day’s end</div></div><div><div className="count-label">LEAVE-READY</div><div className="count-value">{leaveReady}</div><div className="count-note">{leaveReady==='CLEAR'?'no fixed commitment ahead':'30-minute preparation buffer'}</div></div></section>
        <button type="button" onClick={previewReplan} className="today-live-v7 replan-v7 text-left"><span className="replan-star">✧</span><span className="replan-copy"><span className="label">{replanLabel(daypart)}</span><span className="sub">Preview first. Nothing external changes without approval.</span></span><span className="arrow"><ChevronRight size={18}/></span></button>
        <section className="today-live-v7 priorities-v7"><div className="eyebrow">TOP 3 PRIORITIES <span>♕</span></div><div className="priority-cols">{topThree.map((task,index)=><button key={`${task.id}-${index}`} type="button" onClick={()=>chooseTask(task)} className="priority"><span className="category">{categoryFor(task.title,index)}</span><span className="ptitle">{task.title}</span><span className="pnote">{daypart==='night'?'Close, carry, or move it':index===0?'Move the highest-value work':index===1?'Nourish the day':'Map the next move'}</span><span className="impact">Impact: {priorityLabel(task.priority)}</span></button>)}</div></section>
        <section className="today-live-v7 timeline-v7">{schedule.map((item,index)=><button key={item.label} type="button" onClick={()=>openMoment(index)} className={`timeline-moment ${item.label===currentTimelineLabel?'current':''} ${item.quiet?'quiet':''}`}><span className="timeline-dot"/><span className="timeline-label">{item.label}</span><span className="timeline-time">{item.time}</span><span className="timeline-title">{item.title}</span>{item.note&&<span className="timeline-note">{item.note}</span>}</button>)}</section>
        <section className="today-live-v7 routines-v7"><button type="button" onClick={()=>setPanel('routines')} className="w-full text-left"><div className="eyebrow">ROUTINES DUE NOW</div></button>{routineOrder.slice(0,3).map((routine,index)=>{const done=completedRoutineIds.includes(routine.id);return <button key={routine.id} type="button" onClick={()=>toggleRoutine(routine)} className={`routine-row ${done?'done':''}`}><span className="rname">{routine.name}</span><span className="duration">{[5,10,7][index]??8} MIN</span><span className="check">{done?'✓':''}</span></button>;})}<button type="button" onClick={()=>navigate('/routines','Routines')} className="routines-all">View all routines →</button></section>
        <button type="button" onClick={()=>openShakti({activeObject:selectedTask.title,prompt})} className="today-live-v7 ask-v7 text-left"><div className="ask-copy"><div className="heading">ASK SHAKTI ✧</div><div className="sub">Your oracle. Your clarity.</div><div className="prompt">{prompt}</div></div><span className="shakti-mini-v7"><ShaktiPresence compact/></span></button>
        <div className="today-shakti-v7"><ShaktiPresence/></div><button type="button" onClick={()=>openShakti({activeObject:'Today · Now',prompt})} className="shakti-name-v7">Shakti<span className="sr-only">Open Shakti</span></button>
        <PressArea label="Search Glow OS" style={hotspot(85.7,1,4,5.7)} onClick={()=>setPanel('search')}/><PressArea label="Calendar" style={hotspot(90.5,1,4,5.7)} onClick={()=>navigate('/calendar','Plan · Calendar')}/><PressArea label="Notifications" style={hotspot(95,1,4,5.7)} onClick={()=>navigate('/notices','Attention Center')}/><PressArea label="Today" style={hotspot(25.8,92.2,8.5,6.5)} onClick={()=>setReceipt('You are in Today · The Living Center.')}/><PressArea label="Plan" style={hotspot(34.5,92.2,9.2,6.5)} onClick={()=>navigate('/planning','Plan · The Time Observatory')}/><PressArea label="Life" style={hotspot(44,92.2,9.2,6.5)} onClick={()=>navigate('/world','Life · The Personal House')}/><PressArea label="Brain" style={hotspot(53.3,92.2,9.2,6.5)} onClick={()=>navigate('/brain','Brain · The Inner Universe')}/><PressArea label="Create" style={hotspot(63,92.2,10,6.5)} onClick={()=>navigate('/create','Create · The Transformation Studio')}/><PressArea label="Saint" style={hotspot(87,92,6.8,7)} onClick={()=>setPanel('saint')}/><PressArea label="Tatiyana settings" style={hotspot(94,91.5,5,8)} onClick={()=>setPanel('profile')}/>
      </div></div>
    </div>

    <div className="today-portrait today-portrait-v7 absolute inset-0">
      <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" className="portrait-room-v7 pointer-events-none fixed inset-0 h-full w-full object-cover"/><div className="portrait-climate-v7 pointer-events-none fixed inset-0"/>
      <div className="h-full overflow-y-auto overscroll-y-contain pb-[calc(102px+env(safe-area-inset-bottom))]">
        <header className="portrait-header-v7"><div className="portrait-topline"><span>GLOW OS</span><div><button type="button" onClick={()=>setPanel('search')}><Search size={18}/></button><button type="button" onClick={()=>navigate('/calendar','Plan · Calendar')}><CalendarDays size={18}/></button><button type="button" onClick={()=>navigate('/notices','Attention Center')}><Bell size={18}/></button></div></div><h1 suppressHydrationWarning>{greeting}</h1><p suppressHydrationWarning>{dateLabel}</p></header>
        <section className="portrait-shakti-v7"><div className="portrait-shakti-object-v7"><ShaktiPresence/></div><button type="button" onClick={()=>openShakti({activeObject:'Today · Now',prompt})}><span>Shakti</span></button></section>
        <section className="portrait-now-v7"><button type="button" onClick={()=>setPanel('focus')}><span className="eyebrow">LIVE MOMENT · NOW</span><strong>{selectedTask.title}</strong><small>{contextFor(selectedTask.priority)}</small><em>{momentLine(daypart)}</em></button><button type="button" className="portrait-focus-v7" onClick={toggleFocus}><strong>{focusMinutes}</strong><small>{focusSeconds>0?'FOCUS':'START'}</small></button></section>
        <section className="portrait-field-v7"><div className="portrait-what-v7"><div className="eyebrow">WHAT NOW?</div>{orderedTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" onClick={()=>chooseTask(task)}><span>{index+1}</span><strong>{task.title}</strong><small>{safeDueLabel(task)}</small></button>)}</div><div className="portrait-capacity-v7"><div className="eyebrow">CAPACITY</div><button type="button" onClick={()=>setPanel('energy')}><strong>{capacity}</strong><span>Radiant</span></button>{metrics.map(([label,value])=><div key={label}><span>{label}</span><i><b style={{width:`${value}%`}}/></i><small>{value}%</small></div>)}</div></section>
        <section className="portrait-counts-v7"><div><small>TIME REMAINING</small><strong>{timeRemaining}</strong></div><div><small>LEAVE-READY</small><strong>{leaveReady}</strong></div></section>
        <button type="button" className="portrait-replan-v7" onClick={previewReplan}><span><strong>{replanLabel(daypart)}</strong><small>Preview first. Keep what still matters.</small></span><ChevronRight size={20}/></button>
        <section className="portrait-timeline-v7"><div className="eyebrow">THE REST OF TODAY</div>{schedule.map((item,index)=><button key={item.label} type="button" onClick={()=>openMoment(index)} className={item.quiet?'quiet':''}><span className="node"/><small>{item.label} · {item.time}</small><strong>{item.title}</strong>{item.note&&<em>{item.note}</em>}</button>)}</section>
        <section className="portrait-priorities-v7"><div className="eyebrow">TOP 3 PRIORITIES</div>{topThree.map((task,index)=><button key={`${task.id}-p-${index}`} type="button" onClick={()=>chooseTask(task)}><small>{categoryFor(task.title,index)}</small><strong>{task.title}</strong><em>Impact: {priorityLabel(task.priority)}</em></button>)}</section>
        <section className="portrait-routines-v7"><div className="portrait-section-head"><span className="eyebrow">ROUTINES DUE NOW</span><button type="button" onClick={()=>navigate('/routines','Routines')}>View all</button></div>{routineOrder.slice(0,4).map((routine,index)=>{const done=completedRoutineIds.includes(routine.id);return <button key={routine.id} type="button" onClick={()=>toggleRoutine(routine)} className={done?'done':''}><strong>{routine.name}</strong><small>{[5,10,7,8][index]??8} MIN</small><span>{done?'✓':''}</span></button>;})}</section>
        <button type="button" className="portrait-ask-v7" onClick={()=>openShakti({activeObject:selectedTask.title,prompt})}><div><small>ASK SHAKTI</small><strong>Your oracle. Your clarity.</strong><p>{prompt}</p></div><span><ShaktiPresence compact/></span></button><div className="portrait-footer-v7"><button type="button" onClick={()=>setPanel('saint')}><PawPrint size={16}/> Saint</button><button type="button" onClick={()=>setPanel('profile')}>Tatiyana · Settings</button></div>
      </div>
      <nav className="portrait-nav-v7"><button type="button" className="active"><SunMedium size={17}/><span>Today</span></button><button type="button" onClick={()=>navigate('/planning','Plan · The Time Observatory')}><CalendarDays size={17}/><span>Plan</span></button><button type="button" onClick={()=>navigate('/world','Life · The Personal House')}><Heart size={17}/><span>Life</span></button><button type="button" onClick={()=>navigate('/brain','Brain · The Inner Universe')}><Brain size={17}/><span>Brain</span></button><button type="button" onClick={()=>navigate('/create','Create · The Transformation Studio')}><WandSparkles size={17}/><span>Create</span></button></nav>
    </div>

    {receipt&&<div aria-live="polite" className="today-receipt-v7">{receipt}</div>}
    {panel==='search'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">SEARCH GLOW OS</p><h2 className="mt-2 font-serif text-3xl">Cast light across your world.</h2><input autoFocus value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Tasks, moments, routines…" className="mt-6 w-full rounded-2xl border border-[#d8c2bb] bg-white/62 px-4 py-3 outline-none"/><div className="mt-4">{searchText&&!searchResults.length&&<p className="text-sm opacity-70">No matching live items yet.</p>}{searchResults.map((r,i)=><button key={`${r.kind}-${i}`} type="button" onClick={()=>{setPanel(null);navigate(r.href,r.activeObject);}} className="block w-full border-b border-[#d9c8c2]/50 py-3 text-left"><span className="mr-2 text-[10px] font-semibold tracking-[.15em] opacity-60">{r.kind.toUpperCase()}</span>{r.title}</button>)}</div></Modal>}
    {panel==='focus'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">LIVE MOMENT · NOW</p><h2 className="mt-2 font-serif text-3xl">{selectedTask.title}</h2><p className="mt-2 text-sm opacity-65">{contextFor(selectedTask.priority)}</p><button type="button" onClick={toggleFocus} className="mt-6 grid h-28 w-28 place-items-center rounded-full border-2 border-[#d8bdb5] bg-white/45"><span><span className="block font-serif text-4xl">{focusMinutes}</span><span className="text-[10px] tracking-[.18em]">{focusSeconds>0?'MIN':'START'}</span></span></button><button type="button" onClick={()=>openShakti({prompt:`Help me focus on ${selectedTask.title}`,activeObject:selectedTask.title})} className="mt-5 rounded-full border border-[#d5bdb6] bg-white/45 px-5 py-2.5 text-sm">Ask Shakti</button></Modal>}
    {panel==='what-now'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">WHAT NOW?</p><h2 className="mt-2 font-serif text-3xl">Your next right three.</h2>{orderedTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" onClick={()=>chooseTask(task)} className="flex w-full items-center gap-3 border-b border-[#d7c6c0] py-3 text-left"><span>{index+1}</span><span className="flex-1">{task.title}</span><small>{safeDueLabel(task)}</small></button>)}</Modal>}
    {panel==='energy'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">ENERGY & CAPACITY</p><h2 className="mt-2 font-serif text-3xl">{capacity} · Radiant</h2><div className="mt-6 space-y-4">{metrics.map(([label,value])=><div key={label}><div className="mb-1 flex justify-between text-sm"><span>{label}</span><span>{value}%</span></div><div className="h-1.5 rounded-full bg-[#e2d5d0]"><div className="h-full rounded-full bg-[#b98d84]" style={{width:`${value}%`}}/></div></div>)}</div><button type="button" onClick={()=>openShakti({prompt:`I have ${capacity}% capacity. Help me choose what fits.`,activeObject:'Energy & Capacity'})} className="mt-6 rounded-full border border-[#d5bdb6] bg-white/48 px-5 py-2.5 text-sm">Ask Shakti what fits</button></Modal>}
    {panel==='routines'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">ROUTINES DUE NOW</p><h2 className="mt-2 font-serif text-3xl">One active pathway, not a scoreboard.</h2>{routineOrder.map((r,i)=>{const done=completedRoutineIds.includes(r.id);return <button key={r.id} type="button" onClick={()=>toggleRoutine(r)} className="flex w-full items-center gap-3 border-b border-[#d7c6c0] py-3 text-left"><span className={`flex-1 ${done?'line-through opacity-40':''}`}>{r.name}</span><small>{[5,10,7,12][i]??8} MIN</small><span>{done?'✓':''}</span></button>;})}</Modal>}
    {panel==='moment'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">{schedule[momentIndex].label}</p><h2 className="mt-2 font-serif text-3xl">{schedule[momentIndex].title}</h2><p className="mt-1 text-sm opacity-60">{schedule[momentIndex].time}</p><p className="mt-5 opacity-75">{schedule[momentIndex].note||'This moment remains connected to Today.'}</p><div className="mt-5 flex gap-2"><button type="button" onClick={()=>openShakti({prompt:`Help me with ${schedule[momentIndex].title}`,activeObject:schedule[momentIndex].title})} className="rounded-full border border-[#d4bbb3] bg-white/45 px-4 py-2 text-sm">Ask Shakti</button><button type="button" onClick={()=>{setPanel(null);navigate(schedule[momentIndex].href,schedule[momentIndex].title);}} className="rounded-full border border-[#d4bbb3] px-4 py-2 text-sm">Focus / reveal</button></div></Modal>}
    {panel==='replan'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">{replanLabel(daypart).toUpperCase()}</p><h2 className="mt-2 font-serif text-3xl">Preview before anything moves.</h2><p className="mt-3 text-sm opacity-70">This preview changes only Today locally. Calendar or external changes still require your approval.</p>{replanPreview.slice(0,5).map((task,index)=><div key={task.id} className="flex gap-3 border-b border-[#d9c7c0]/60 py-3"><span>{index+1}</span><span>{task.title}</span></div>)}<button type="button" onClick={applyReplan} className="mt-6 rounded-full border border-[#d0b5ad] bg-white/55 px-5 py-2.5 text-sm">Use this local order</button></Modal>}
    {panel==='saint'&&<Modal onClose={()=>setPanel(null)}><PawPrint size={24}/><h2 className="mt-3 font-serif text-3xl">Saint is with you.</h2><p className="mt-3 opacity-70">Walks, care moments, reminders, and shared plans stay connected to Today.</p></Modal>}
    {panel==='profile'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">TATIYANA</p><h2 className="mt-2 font-serif text-3xl">Your Glow OS controls.</h2><p className="mt-3 opacity-70">Appearance, page climates, motion, Shakti, accessibility, privacy, integrations, and navigation.</p><button type="button" onClick={()=>{setPanel(null);navigate('/settings','Settings');}} className="mt-5 rounded-full border border-[#d1b8b0] px-5 py-2.5 text-sm">Open settings</button></Modal>}
  </main>;
}
