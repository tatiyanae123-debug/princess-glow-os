'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Brain, CalendarDays, ChevronRight, Heart, PawPrint, Search, Sparkles, SunMedium, WandSparkles } from 'lucide-react';
import { TODAY_LIVING_CENTER_REFERENCE } from '@/lib/design/today-living-center-reference';
import styles from './today-living-center.module.css';

type TaskLite={id:string;title:string;priority:string;dueDateISO?:string|null};
type EventLite={id:string;title:string;timeLabel:string;location?:string|null;startAtISO?:string|null;allDay?:boolean};
type RoutineLite={id:string;name:string;timeOfDay:string};
type Props={tasks:TaskLite[];events:EventLite[];routines:RoutineLite[];energy:number|null;mood:number|null;sleepHours:number|null;glowMessage:string};
type Panel='search'|'what-now'|'energy'|'priorities'|'routines'|'ask'|'saint'|'moment'|'focus'|null;
type Daypart='morning'|'afternoon'|'evening'|'night';
type EventEntry={event:EventLite;date:Date};
type ScheduleItem={label:'NEXT'|'LATER'|'TONIGHT'|'TOMORROW';time:string;title:string;note:string;href:string;quiet?:boolean};

const priorityRank:Record<string,number>={urgent:5,high:4,medium:3,low:2};
const fallbackTasks:Record<Daypart,TaskLite>={
  morning:{id:'phase-morning',title:'Begin with the clearest next move',priority:'medium'},
  afternoon:{id:'phase-afternoon',title:'Reset the middle of the day',priority:'medium'},
  evening:{id:'phase-evening',title:'Transition into the evening',priority:'medium'},
  night:{id:'phase-night',title:'Close the day gently',priority:'medium'},
};
const fallbackRoutines:Record<Daypart,RoutineLite[]>={
  morning:[{id:'m1',name:'Morning hydration',timeOfDay:'morning'},{id:'m2',name:'Creativity warm-up',timeOfDay:'morning'},{id:'m3',name:'Posture + stretch',timeOfDay:'morning'}],
  afternoon:[{id:'a1',name:'Hydrate + reset',timeOfDay:'afternoon'},{id:'a2',name:'Posture + stretch',timeOfDay:'afternoon'},{id:'a3',name:'Midday reset',timeOfDay:'afternoon'}],
  evening:[{id:'e1',name:'Evening transition',timeOfDay:'evening'},{id:'e2',name:'Hydrate + move',timeOfDay:'evening'},{id:'e3',name:'Prepare tomorrow',timeOfDay:'evening'}],
  night:[{id:'n1',name:'Night hydration',timeOfDay:'night'},{id:'n2',name:'Skincare close',timeOfDay:'night'},{id:'n3',name:'Tomorrow prep',timeOfDay:'night'}],
};
const phaseWords:Record<Daypart,{yes:string[];no:string[]}>= {
  morning:{yes:['morning','wake','breakfast','sunrise'],no:['night','bedtime','evening','midday']},
  afternoon:{yes:['midday','afternoon','lunch','noon'],no:['night','bedtime','morning']},
  evening:{yes:['evening','sunset','dinner','transition'],no:['morning','midday','lunch']},
  night:{yes:['night','shutdown','sleep','bedtime','wind down','wind-down','evening'],no:['morning','midday','afternoon','lunch']},
};

function daypartFor(hour:number):Daypart{if(hour>=5&&hour<12)return'morning';if(hour>=12&&hour<17)return'afternoon';if(hour>=17&&hour<21)return'evening';return'night';}
function greetingFor(d:Daypart){return d==='morning'?'Good morning, Tatiyana ♡':d==='afternoon'?'Good afternoon, Tatiyana ♡':d==='evening'?'Good evening, Tatiyana ♡':'Good night, Tatiyana ♡';}
function sameDay(a:Date,b:Date){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function dayStart(date:Date){const d=new Date(date);d.setHours(0,0,0,0);return d;}
function formatDuration(ms:number){const minutes=Math.max(0,Math.floor(ms/60000));return`${Math.floor(minutes/60)}H ${String(minutes%60).padStart(2,'0')}M`;}
function priorityLabel(value:string){const p=value.toLowerCase();return p==='urgent'||p==='high'?'High':p==='low'?'Low':'Medium';}
function categoryFor(title:string,index:number){const t=title.toLowerCase();if(/hair|body|skin|wellness|hydrate|care|beauty/.test(t))return'CARE';if(/content|write|studio|create|design|creative/.test(t))return'CREATE';if(/plan|schedule|calendar|prepare|tomorrow|organize/.test(t))return'PLAN';return['FOCUS','CARE','PLAN'][index]??'FOCUS';}
function contextFor(priority:string){return /urgent|high/i.test(priority)?'High focus · protect what matters':/low/i.test(priority)?'Light focus · keep momentum':'Steady focus · move with intention';}
function momentLine(d:Daypart){return d==='morning'?'Begin here.':d==='afternoon'?'This is your moment.':d==='evening'?'Finish what matters.':'Only what still matters.';}
function replanLabel(d:Daypart){return d==='night'?'Close the rest of tonight':d==='evening'?'Replan My Evening':'Replan My Day';}
function shaktiPrompt(d:Daypart){return d==='morning'?'What deserves your first clear yes?':d==='afternoon'?'What would make the rest of today lighter?':d==='evening'?'What still deserves your energy tonight?':'What can we close, carry, or release?';}
function taskDueState(task:TaskLite,now:Date){if(!task.dueDateISO)return'Can wait';const due=new Date(task.dueDateISO);if(Number.isNaN(due.getTime()))return'Can wait';const diff=Math.round((dayStart(due).getTime()-dayStart(now).getTime())/86400000);if(diff<0)return'Overdue';if(diff===0)return'Today';if(diff===1)return'Tomorrow';return'Can wait';}
function taskScore(task:TaskLite,d:Daypart,now:Date){const value=task.title.toLowerCase();let score=(priorityRank[task.priority]??2)*18;for(const word of phaseWords[d].yes)if(value.includes(word))score+=34;for(const word of phaseWords[d].no)if(value.includes(word))score-=52;const due=taskDueState(task,now);if(due==='Overdue')score+=22;if(due==='Today')score+=14;if(due==='Tomorrow')score-=5;return score;}
function eventTime(entry:EventEntry|undefined,fallback:string){return entry?entry.date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):fallback;}
function eventTitle(entry:EventEntry|undefined,fallback:string){return entry?.event.title??fallback;}

function Modal({children,onClose}:{children:ReactNode;onClose:()=>void}){return <div className={styles.modalBackdrop} onMouseDown={onClose}><section role="dialog" aria-modal="true" className={styles.modal} onMouseDown={e=>e.stopPropagation()}><button type="button" className={styles.close} onClick={onClose} aria-label="Close">×</button>{children}</section></div>}

export function TodayLivingCenter({tasks,events,routines,energy,mood,sleepHours,glowMessage}:Props){
  const router=useRouter();
  const [now,setNow]=useState(()=>new Date());
  const [panel,setPanel]=useState<Panel>(null);
  const [momentIndex,setMomentIndex]=useState(0);
  const [selectedTaskId,setSelectedTaskId]=useState<string|null>(null);
  const [focusRunning,setFocusRunning]=useState(false);
  const [focusSeconds,setFocusSeconds]=useState(0);
  const [searchText,setSearchText]=useState('');
  const [askText,setAskText]=useState('');
  const [askReceipt,setAskReceipt]=useState('');
  const [receipt,setReceipt]=useState('');
  const [completedRoutineIds,setCompletedRoutineIds]=useState<string[]>([]);
  const [localOrder,setLocalOrder]=useState<string[]>([]);

  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),15000);return()=>window.clearInterval(timer)},[]);
  useEffect(()=>{if(!focusRunning)return;const timer=window.setInterval(()=>setFocusSeconds(v=>Math.max(0,v-1)),1000);return()=>window.clearInterval(timer)},[focusRunning]);
  useEffect(()=>{if(focusRunning&&focusSeconds===0){setFocusRunning(false);setReceipt('Focus complete. This moment settled back into Today.')}},[focusRunning,focusSeconds]);
  useEffect(()=>{if(!receipt)return;const timer=window.setTimeout(()=>setReceipt(''),4200);return()=>window.clearInterval(timer)},[receipt]);
  useEffect(()=>{if(!panel)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setPanel(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[panel]);

  const daypart=daypartFor(now.getHours());
  const greeting=greetingFor(daypart);
  const dateLabel=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
  const timeLabel=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const dateKey=now.toLocaleDateString('en-CA');
  useEffect(()=>{try{const raw=localStorage.getItem(`glow:today:routines:${dateKey}`);if(raw){const parsed=JSON.parse(raw) as string[];if(Array.isArray(parsed))setCompletedRoutineIds(parsed)}}catch{}},[dateKey]);
  useEffect(()=>{try{localStorage.setItem(`glow:today:routines:${dateKey}`,JSON.stringify(completedRoutineIds))}catch{}},[completedRoutineIds,dateKey]);

  const orderedTasks=useMemo(()=>{const source=tasks.length?tasks:[fallbackTasks[daypart]];const ranked=[...source].sort((a,b)=>taskScore(b,daypart,now)-taskScore(a,daypart,now));if(!localOrder.length)return ranked;const positions=new Map(localOrder.map((id,index)=>[id,index]));return [...ranked].sort((a,b)=>(positions.get(a.id)??999)-(positions.get(b.id)??999))},[tasks,daypart,now,localOrder]);
  const activeTask=(selectedTaskId?orderedTasks.find(t=>t.id===selectedTaskId):undefined)??orderedTasks[0]??fallbackTasks[daypart];
  const suggestedMinutes=/urgent|high/i.test(activeTask.priority)?47:/low/i.test(activeTask.priority)?20:30;
  useEffect(()=>{setFocusSeconds(suggestedMinutes*60);setFocusRunning(false)},[activeTask.id,suggestedMinutes]);
  const focusMinutes=Math.max(1,Math.ceil(focusSeconds/60));

  const defaults:Record<Daypart,[number,number,number,number]>={morning:[78,76,72,84],afternoon:[70,72,66,78],evening:[64,68,60,73],night:[56,62,52,66]};
  const inferred=defaults[daypart];
  const capacity=energy!==null?Math.max(30,Math.min(96,Math.round(energy*10))):inferred[0];
  const emotional=mood!==null?Math.max(30,Math.min(96,Math.round(mood*10))):inferred[1];
  const physical=energy!==null?Math.max(30,Math.min(96,Math.round(energy*10-8))):inferred[2];
  const creative=Math.max(35,Math.min(98,energy!==null?capacity+10:inferred[3]));
  const capacityStatus=energy!==null||mood!==null?'Live':'Inferred';
  const metrics=[['Mental',capacity],['Emotional',emotional],['Physical',physical],['Creative',creative]] as const;

  const eventEntries=useMemo<EventEntry[]>(()=>events.flatMap(event=>{if(!event.startAtISO)return[];const date=new Date(event.startAtISO);return Number.isNaN(date.getTime())?[]:[{event,date}]}),[events]);
  const todayFuture=eventEntries.filter(x=>!x.event.allDay&&sameDay(x.date,now)&&x.date.getTime()>now.getTime()+60000).sort((a,b)=>a.date.getTime()-b.date.getTime());
  const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
  const tomorrowEntries=eventEntries.filter(x=>sameDay(x.date,tomorrow)).sort((a,b)=>a.date.getTime()-b.date.getTime());
  const nextEvent=todayFuture[0];
  const laterEvent=todayFuture[1];
  const tonightEvent=todayFuture.find(x=>x.date.getHours()>=17&&x.event.id!==nextEvent?.event.id&&x.event.id!==laterEvent?.event.id);
  const tomorrowFirst=tomorrowEntries[0];
  const schedule:ScheduleItem[]=[
    {label:'NEXT',time:eventTime(nextEvent,'Now'),title:eventTitle(nextEvent,'Open breathing space'),note:nextEvent?.event.location??'Nothing fixed is pulling you forward.',href:'/calendar',quiet:!nextEvent},
    {label:'LATER',time:eventTime(laterEvent,'Later'),title:eventTitle(laterEvent,'Nothing fixed'),note:laterEvent?.event.location??'Let the rest stay quiet.',href:'/calendar',quiet:!laterEvent},
    {label:'TONIGHT',time:eventTime(tonightEvent,'Tonight'),title:eventTitle(tonightEvent,daypart==='night'?'Close gently':'Wind down'),note:tonightEvent?.event.location??(daypart==='night'?'Close, carry, or release.':'Keep the evening soft.'),href:'/calendar',quiet:!tonightEvent},
    {label:'TOMORROW',time:eventTime(tomorrowFirst,'Preview'),title:eventTitle(tomorrowFirst,'A quiet glimpse'),note:tomorrowFirst?.event.location??'',href:'/tomorrow',quiet:!tomorrowFirst},
  ];
  const endOfDay=new Date(now);endOfDay.setHours(23,59,59,999);const timeRemaining=formatDuration(endOfDay.getTime()-now.getTime());
  const wrapAt=nextEvent?new Date(nextEvent.date.getTime()-30*60000):null;
  const leaveReady=wrapAt&&wrapAt>now?formatDuration(wrapAt.getTime()-now.getTime()):'CLEAR';

  const routineOrder=useMemo(()=>{const exact=routines.filter(r=>r.timeOfDay===daypart);const adjacent=daypart==='night'?routines.filter(r=>r.timeOfDay==='evening'):daypart==='evening'?routines.filter(r=>r.timeOfDay==='night'):[];const source=[...exact,...adjacent];return source.length?source:fallbackRoutines[daypart]},[routines,daypart]);
  const topThree=[...orderedTasks.slice(0,3)];while(topThree.length<3)topThree.push(fallbackTasks[daypart]);
  const prompt=shaktiPrompt(daypart);

  const searchResults=useMemo(()=>{const q=searchText.trim().toLowerCase();if(!q)return[];return[...orderedTasks.map(t=>({kind:'Task',title:t.title,href:'/focus'})),...events.map(e=>({kind:'Event',title:e.title,href:'/calendar'})),...routineOrder.map(r=>({kind:'Routine',title:r.name,href:'/routines'}))].filter(x=>x.title.toLowerCase().includes(q)).slice(0,9)},[searchText,orderedTasks,events,routineOrder]);

  function go(href:string){router.push(href)}
  function chooseTask(task:TaskLite){setSelectedTaskId(task.id);setPanel('focus');setReceipt(`${task.title} moved into focus without leaving Today.`)}
  function toggleFocus(){if(focusSeconds===0)setFocusSeconds(suggestedMinutes*60);setFocusRunning(v=>!v)}
  function toggleRoutine(routine:RoutineLite){setCompletedRoutineIds(current=>current.includes(routine.id)?current.filter(id=>id!==routine.id):[...current,routine.id]);setReceipt(`${routine.name} updated.`)}
  function replan(){const order=[...orderedTasks].sort((a,b)=>taskScore(b,daypart,now)-taskScore(a,daypart,now));setLocalOrder(order.map(t=>t.id));setReceipt(daypart==='night'?'Tonight reorganized. Nothing external moved.':'Today reorganized. Nothing external moved.')}
  function submitAsk(event:FormEvent){event.preventDefault();if(!askText.trim())return;setAskReceipt(glowMessage||`Shakti understood. ${askText.trim()}`)}

  return <main className={styles.root} data-daypart={daypart}>
    <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" className={styles.room}/>
    <div className={styles.dayClimate}/><div className={styles.uiSoftener}/>
    <div className={styles.stage}>
      <header className={styles.header}><div className={styles.brand}>GLOW OS</div><div className={styles.greeting}>{greeting}</div><div className={styles.date}>{dateLabel}</div></header>
      <div className={styles.tools}><button type="button" className={styles.tool} onClick={()=>setPanel('search')} aria-label="Search Glow OS"><Search size={17}/></button><button type="button" className={styles.tool} onClick={()=>go('/calendar')} aria-label="Calendar"><CalendarDays size={17}/></button><button type="button" className={styles.tool} onClick={()=>go('/notices')} aria-label="Attention Center"><Bell size={17}/></button></div>

      <section className={styles.left}>
        <div className={styles.master}>
          <section className={`${styles.surface} ${styles.now}`}><div className={`${styles.eyebrow} ${styles.liveMoment}`}>LIVE MOMENT · NOW</div><div className={styles.clock}>{timeLabel}</div><div className={styles.nowWord}>NOW</div><div className={styles.taskTitle}>{activeTask.title}</div><div className={styles.context}>{contextFor(activeTask.priority)}</div><div className={styles.momentLine}>{momentLine(daypart)}</div><button type="button" className={styles.focus} onClick={toggleFocus}><span><strong>{focusMinutes}</strong><small>{focusRunning?'FOCUS TIME':'START FOCUS'}</small></span></button></section>
          <section className={`${styles.surface} ${styles.what}`}><button type="button" onClick={()=>setPanel('what-now')} style={{background:'transparent',width:'100%',textAlign:'left'}}><div className={styles.eyebrow}>WHAT NOW? <Sparkles size={10}/></div><div className={styles.sectionIntro}>Your next right 3.</div></button><div className={styles.rows}>{orderedTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" className={styles.whatRow} onClick={()=>chooseTask(task)}><span className={styles.num}>{index+1}</span><span className={styles.rowTitle}>{task.title}</span><span className={styles.meta}>{index===0?'Now':taskDueState(task,now)==='Today'?(daypart==='night'?'Carry':'Today'):taskDueState(task,now)}</span></button>)}</div></section>
          <section className={`${styles.surface} ${styles.capacity}`}><button type="button" onClick={()=>setPanel('energy')} style={{background:'transparent',width:'100%',textAlign:'left'}}><div className={styles.eyebrow}>ENERGY & CAPACITY</div></button><div className={styles.capacityBody}><div className={styles.capacityOrb}><span><strong>{capacity}</strong><small>{capacityStatus}</small></span></div><div>{metrics.map(([label,value])=><div className={styles.metric} key={label}><span>{label}</span><span className={styles.track}><span className={styles.fill} style={{width:`${value}%`,display:'block'}}/></span><span>{value}%</span></div>)}</div></div></section>
          <section className={`${styles.surface} ${styles.counts}`}><div><div className={styles.countLabel}>TIME REMAINING TODAY</div><div className={styles.countValue}>{timeRemaining}</div><div className={styles.countNote}>until day’s end</div></div><div><div className={styles.countLabel}>LEAVE-READY</div><div className={styles.countValue}>{leaveReady}</div><div className={styles.countNote}>{leaveReady==='CLEAR'?'no fixed commitment ahead':'30-minute preparation buffer'}</div></div></section>
        </div>
        <button type="button" className={`${styles.surface} ${styles.replan}`} onClick={replan}><span className={styles.replanMark}>✧</span><span className={styles.replanText}><strong>{replanLabel(daypart)}</strong><small>Preview locally. Nothing external moves without approval.</small></span><span className={styles.arrow}><ChevronRight size={17}/></span></button>
        <section className={`${styles.surface} ${styles.priorities}`}><div className={styles.eyebrow}>TOP 3 PRIORITIES ♕</div><div className={styles.priorityGrid}>{topThree.map((task,index)=><button key={`${task.id}-${index}`} type="button" className={styles.priority} onClick={()=>chooseTask(task)}><span className={styles.category}>{categoryFor(task.title,index)}</span><span className={styles.priorityTitle}>{task.title}</span><span className={styles.priorityNote}>{daypart==='night'?'Close, carry, or move it':index===0?'Move the highest-value work':index===1?'Nourish the day':'Map the next move'}</span><span className={styles.impact}>Impact: {priorityLabel(task.priority)}</span></button>)}</div></section>
      </section>

      <section className={styles.center}><div className={styles.centerVeil}/><div className={styles.shaktiLive}/><button type="button" className={styles.shaktiName} onClick={()=>setPanel('ask')}>Shakti</button><button type="button" className={styles.askShakti} onClick={()=>setPanel('ask')}>Ask Shakti</button></section>

      <section className={styles.right}>
        <section className={`${styles.surface} ${styles.timeline}`}><div className={styles.eyebrow}>THE REST OF TODAY</div>{schedule.map((item,index)=><button key={item.label} type="button" className={styles.moment} onClick={()=>{setMomentIndex(index);setPanel('moment')}}><span className={styles.node}/><span className={styles.momentLabel}>{item.label}</span><span className={styles.momentTime}>{item.time}</span><span className={styles.momentTitle}>{item.title}</span>{item.note&&<span className={styles.momentNote}>{item.note}</span>}</button>)}</section>
        <section className={`${styles.surface} ${styles.routines}`}><div className={styles.eyebrow}>ROUTINES DUE NOW</div>{routineOrder.slice(0,3).map((routine,index)=>{const done=completedRoutineIds.includes(routine.id);return <button key={routine.id} type="button" className={`${styles.routine} ${done?styles.done:''}`} onClick={()=>toggleRoutine(routine)}><span className={styles.routineName}>{routine.name}</span><span className={styles.routineDuration}>{[5,10,7][index]} MIN</span><span className={styles.check}>{done?'✓':''}</span></button>})}</section>
        <button type="button" className={`${styles.surface} ${styles.askPanel}`} onClick={()=>setPanel('ask')}><span><span className={styles.eyebrow}>ASK SHAKTI ✧</span><h3>Your oracle. Your clarity.</h3><p>{prompt}</p></span><span className={styles.miniShakti}/></button>
      </section>
    </div>

    <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" className={styles.avatarReveal}/>
    <div className={styles.navMask}/>
    <nav className={styles.nav}><button type="button" className={styles.active}><SunMedium size={15}/><span>Today</span></button><button type="button" onClick={()=>go('/planning')}><CalendarDays size={15}/><span>Plan</span></button><button type="button" onClick={()=>go('/world')}><Heart size={15}/><span>Life</span></button><button type="button" onClick={()=>go('/brain')}><Brain size={15}/><span>Brain</span></button><button type="button" onClick={()=>go('/world')}><WandSparkles size={15}/><span>Create</span></button></nav>
    <button type="button" className={styles.saint} onClick={()=>setPanel('saint')}><PawPrint size={15}/><span>Saint</span></button>

    {receipt&&<div className={styles.receipt} aria-live="polite">{receipt}</div>}
    {panel==='search'&&<Modal onClose={()=>setPanel(null)}><p className={styles.eyebrow}>SEARCH GLOW OS</p><h2>Cast light across your world.</h2><input autoFocus className={styles.input} value={searchText} onChange={e=>setSearchText(e.target.value)} placeholder="Tasks, moments, routines…"/><div>{searchText&&!searchResults.length&&<p>No matching live items yet.</p>}{searchResults.map((result,index)=><button key={`${result.kind}-${index}`} type="button" className={styles.modalRow} onClick={()=>go(result.href)}><span className={styles.eyebrow}>{result.kind}</span><span>{result.title}</span></button>)}</div></Modal>}
    {panel==='focus'&&<Modal onClose={()=>setPanel(null)}><p className={styles.eyebrow}>LIVE MOMENT · NOW</p><h2>{activeTask.title}</h2><p>{contextFor(activeTask.priority)}</p><button type="button" className={styles.focus} onClick={toggleFocus}><span><strong>{focusMinutes}</strong><small>{focusRunning?'PAUSE':'START'}</small></span></button></Modal>}
    {panel==='what-now'&&<Modal onClose={()=>setPanel(null)}><p className={styles.eyebrow}>WHAT NOW?</p><h2>Your next right three.</h2>{orderedTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" className={styles.modalRow} onClick={()=>chooseTask(task)}><span>{index+1}</span><span>{task.title}</span><small>{taskDueState(task,now)}</small></button>)}</Modal>}
    {panel==='energy'&&<Modal onClose={()=>setPanel(null)}><p className={styles.eyebrow}>ENERGY & CAPACITY</p><h2>{capacity} · {capacityStatus}</h2>{metrics.map(([label,value])=><div key={label} className={styles.modalRow}><span>{label}</span><span>{value}%</span></div>)}{sleepHours!==null&&<p>Sleep logged: {sleepHours} hours.</p>}</Modal>}
    {panel==='priorities'&&<Modal onClose={()=>setPanel(null)}><p className={styles.eyebrow}>TOP 3 PRIORITIES</p><h2>What still matters most.</h2>{topThree.map((task,index)=><button key={`${task.id}-modal-${index}`} type="button" className={styles.modalRow} onClick={()=>chooseTask(task)}><span>{index+1}</span><span>{task.title}</span></button>)}</Modal>}
    {panel==='routines'&&<Modal onClose={()=>setPanel(null)}><p className={styles.eyebrow}>ROUTINES DUE NOW</p><h2>One active pathway, not a scoreboard.</h2>{routineOrder.map(routine=><button key={routine.id} type="button" className={styles.modalRow} onClick={()=>toggleRoutine(routine)}><span>{completedRoutineIds.includes(routine.id)?'✓':'○'}</span><span>{routine.name}</span></button>)}</Modal>}
    {panel==='moment'&&<Modal onClose={()=>setPanel(null)}><p className={styles.eyebrow}>{schedule[momentIndex].label}</p><h2>{schedule[momentIndex].title}</h2><p>{schedule[momentIndex].time}</p><p>{schedule[momentIndex].note}</p><button type="button" className={styles.modalRow} onClick={()=>go(schedule[momentIndex].href)}><span>Focus / reveal</span><ChevronRight size={17}/></button></Modal>}
    {panel==='ask'&&<Modal onClose={()=>setPanel(null)}><p className={styles.eyebrow}>ASK SHAKTI</p><h2>Your oracle. Your clarity.</h2><p>{prompt}</p><form onSubmit={submitAsk}><input className={styles.input} value={askText} onChange={e=>{setAskText(e.target.value);setAskReceipt('')}} placeholder="Speak naturally to Shakti…"/><button type="submit" className={styles.modalRow}><span>Send to Shakti</span><ChevronRight size={17}/></button></form>{askReceipt&&<p>{askReceipt}</p>}</Modal>}
    {panel==='saint'&&<Modal onClose={()=>setPanel(null)}><PawPrint size={23}/><h2>Saint is with you.</h2><p>Walks, care moments, reminders, and shared plans remain connected to Today.</p></Modal>}
  </main>
}
