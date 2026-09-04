'use client';

import { useEffect,useMemo,useState } from 'react';
import type { ReactNode } from 'react';
import { Bell,Brain,CalendarDays,Check,ChevronRight,Heart,Mic,PawPrint,Search,Sparkles,SunMedium,WandSparkles,X } from 'lucide-react';
import { TodaySceneCanvasV9 } from '@/components/today-scene-canvas-v9';

type TaskLite={id:string;title:string;priority:string;dueLabel?:string|null};
type EventLite={id:string;title:string;timeLabel:string;location?:string|null;startAtISO?:string|null;allDay?:boolean};
type RoutineLite={id:string;name:string;timeOfDay:string};
type Props={tasks:TaskLite[];events:EventLite[];routines:RoutineLite[];energy:number|null;mood:number|null;sleepHours:number|null};
type Daypart='morning'|'afternoon'|'evening'|'night';
type Panel='search'|'capacity'|'routines'|'replan'|'moment'|'shakti'|'focus'|null;
type EventEntry={event:EventLite;date:Date};
type ScheduleItem={label:'NEXT'|'LATER'|'TONIGHT'|'TOMORROW';time:string;title:string;note:string;quiet:boolean};

const rank:Record<string,number>={urgent:5,high:4,medium:3,low:2};
const phaseWords:Record<Daypart,{good:string[];bad:string[]}>= {
  morning:{good:['morning','wake','breakfast','sunrise'],bad:['night','bedtime','evening','shutdown']},
  afternoon:{good:['midday','afternoon','lunch','noon'],bad:['night','bedtime','morning','shutdown']},
  evening:{good:['evening','sunset','dinner','transition'],bad:['morning','midday','lunch']},
  night:{good:['night','shutdown','sleep','bedtime','wind down','wind-down'],bad:['morning','midday','afternoon','lunch']},
};
const fallbackTasks:Record<Daypart,TaskLite>={
  morning:{id:'phase-morning',title:'Begin with the clearest next move',priority:'medium',dueLabel:'Now'},
  afternoon:{id:'phase-afternoon',title:'Reset the middle of the day',priority:'medium',dueLabel:'Now'},
  evening:{id:'phase-evening',title:'Transition into the evening',priority:'medium',dueLabel:'Now'},
  night:{id:'phase-night',title:'Night Shutdown',priority:'medium',dueLabel:'Now'},
};
const fallbackRoutines:Record<Daypart,RoutineLite[]>={
  morning:[{id:'fm1',name:'Morning hydration',timeOfDay:'morning'},{id:'fm2',name:'Creativity warm-up',timeOfDay:'morning'},{id:'fm3',name:'Posture + stretch',timeOfDay:'morning'}],
  afternoon:[{id:'fa1',name:'Hydrate + reset',timeOfDay:'afternoon'},{id:'fa2',name:'Posture + stretch',timeOfDay:'afternoon'},{id:'fa3',name:'Midday reset',timeOfDay:'afternoon'}],
  evening:[{id:'fe1',name:'Evening transition',timeOfDay:'evening'},{id:'fe2',name:'Hydrate + move',timeOfDay:'evening'},{id:'fe3',name:'Prepare tomorrow',timeOfDay:'evening'}],
  night:[{id:'fn1',name:'Night hydration',timeOfDay:'night'},{id:'fn2',name:'Skincare close',timeOfDay:'night'},{id:'fn3',name:'Tomorrow prep',timeOfDay:'night'}],
};

function daypartFor(hour:number):Daypart{if(hour>=5&&hour<12)return'morning';if(hour>=12&&hour<17)return'afternoon';if(hour>=17&&hour<21)return'evening';return'night';}
function greeting(d:Daypart){return d==='morning'?'Good morning, Tatiyana ♡':d==='afternoon'?'Good afternoon, Tatiyana ♡':d==='evening'?'Good evening, Tatiyana ♡':'Good night, Tatiyana ♡';}
function sameDay(a:Date,b:Date){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function duration(ms:number){const min=Math.max(0,Math.floor(ms/60000));return`${Math.floor(min/60)}h ${String(min%60).padStart(2,'0')}m`;}
function taskScore(task:TaskLite,d:Daypart){const t=task.title.toLowerCase();let score=(rank[task.priority]??2)*18;if(task.dueLabel==='Overdue')score+=24;if(task.dueLabel==='Today')score+=15;if(task.dueLabel==='Tomorrow')score-=6;for(const w of phaseWords[d].good)if(t.includes(w))score+=36;for(const w of phaseWords[d].bad)if(t.includes(w))score-=54;return score;}
function contextLabel(task:TaskLite,d:Daypart,index=0){const t=task.title.toLowerCase();if(index===0)return'Now';if(d==='night'&&/evening|transition/.test(t))return'Late';if(task.dueLabel==='Overdue')return'Overdue';if(task.dueLabel==='Today')return'Tonight';if(task.dueLabel==='Tomorrow')return'Tomorrow';if(/quick|5 min|10 min|15 min/.test(t))return'Quick';return index===1?'Can wait':'After';}
function impact(priority:string){return /urgent|high/i.test(priority)?'High':/low/i.test(priority)?'Low':'Medium';}
function category(title:string,index:number){const t=title.toLowerCase();if(/hair|skin|body|beauty|hydrate|wellness|care/.test(t))return'CARE';if(/create|creative|studio|content|write|design/.test(t))return'CREATE';if(/plan|calendar|schedule|prepare|tomorrow|organize/.test(t))return'PLAN';return['FOCUS','CARE','PLAN'][index]??'FOCUS';}
function replanCopy(d:Daypart){return d==='night'?'Reset the rest of tonight':d==='evening'?'Replan the evening':'Replan My Day';}
function promptFor(d:Daypart){return d==='morning'?'What deserves your first clear yes?':d==='afternoon'?'What would make the rest of today lighter?':d==='evening'?'What still deserves your energy tonight?':'What can we close, carry, or release?';}
function momentLine(d:Daypart){return d==='morning'?'Begin here.':d==='afternoon'?'This is your moment.':d==='evening'?'Finish what matters.':'Only what still matters.';}
function eventTime(entry:EventEntry|undefined,fallback:string){return entry?entry.date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):fallback;}
function eventTitle(entry:EventEntry|undefined,fallback:string){return entry?.event.title??fallback;}
function navigate(href:string,label:string){window.dispatchEvent(new CustomEvent('glow:navigate',{detail:{href,label}}));}
function askShakti(prompt:string,activeObject:string){window.dispatchEvent(new CustomEvent('glow:open',{detail:{prompt,activeObject}}));}

function ShaktiLife({small=false}:{small?:boolean}){return <div className={`v9-shakti-life ${small?'small':''}`} aria-hidden="true"><span className="v9-shakti-ray r1"/><span className="v9-shakti-ray r2"/><span className="v9-shakti-ray r3"/><span className="v9-shakti-ray r4"/><span className="v9-shakti-caustic c1"/><span className="v9-shakti-caustic c2"/><span className="v9-shakti-glint"/><span className="v9-shakti-floor"/></div>;}

function Modal({children,onClose}:{children:ReactNode;onClose:()=>void}){return <div className="v9-modal-backdrop" onMouseDown={onClose}><section className="v9-modal" role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><button type="button" className="v9-modal-close" onClick={onClose} aria-label="Close"><X size={18}/></button>{children}</section></div>;}

export function TodayLivingCenterV9({tasks,events,routines,energy,mood}:Props){
  const [now,setNow]=useState(()=>new Date());
  const [panel,setPanel]=useState<Panel>(null);
  const [momentIndex,setMomentIndex]=useState(0);
  const [search,setSearch]=useState('');
  const [manualTask,setManualTask]=useState<string|null>(null);
  const [focusSeconds,setFocusSeconds]=useState(0);
  const [focusRunning,setFocusRunning]=useState(false);
  const [doneRoutines,setDoneRoutines]=useState<string[]>([]);
  const [receipt,setReceipt]=useState('');

  useEffect(()=>{const id=window.setInterval(()=>setNow(new Date()),15000);return()=>window.clearInterval(id);},[]);
  useEffect(()=>{if(!focusRunning)return;const id=window.setInterval(()=>setFocusSeconds(v=>Math.max(0,v-1)),1000);return()=>window.clearInterval(id);},[focusRunning]);
  useEffect(()=>{if(focusRunning&&focusSeconds===0){setFocusRunning(false);setReceipt('Focus complete.');}},[focusRunning,focusSeconds]);
  useEffect(()=>{if(!receipt)return;const id=window.setTimeout(()=>setReceipt(''),3200);return()=>window.clearTimeout(id);},[receipt]);
  useEffect(()=>{const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setPanel(null);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[]);

  const daypart=daypartFor(now.getHours());
  const taskList=useMemo(()=>{const source=tasks.length?tasks:[fallbackTasks[daypart]];return[...source].sort((a,b)=>taskScore(b,daypart)-taskScore(a,daypart));},[tasks,daypart]);
  const selected=taskList.find(t=>t.id===manualTask)??taskList[0]??fallbackTasks[daypart];
  const top3=[...taskList.slice(0,3)];while(top3.length<3)top3.push(fallbackTasks[daypart]);
  const suggestedMinutes=/urgent|high/i.test(selected.priority)?47:/low/i.test(selected.priority)?20:30;
  const focusMinutes=focusSeconds?Math.ceil(focusSeconds/60):suggestedMinutes;

  const capacityEstimated=energy==null||mood==null;
  const mental=Math.max(35,Math.min(96,energy?Math.round(energy*10):72));
  const emotional=Math.max(35,Math.min(96,mood?Math.round(mood*10):70));
  const physical=Math.max(35,Math.min(96,energy?Math.round(energy*10-8):66));
  const creative=Math.max(45,Math.min(98,Math.round((mental+emotional)/2+8)));
  const capacity=Math.round((mental+emotional+physical+creative)/4);
  const metrics=[['Mental',mental],['Emotional',emotional],['Physical',physical],['Creative',creative]] as const;

  const entries=useMemo<EventEntry[]>(()=>events.flatMap(event=>{if(!event.startAtISO)return[];const date=new Date(event.startAtISO);return Number.isNaN(date.getTime())?[]:[{event,date}];}),[events]);
  const futureToday=entries.filter(x=>!x.event.allDay&&sameDay(x.date,now)&&x.date.getTime()>now.getTime()+60000).sort((a,b)=>a.date.getTime()-b.date.getTime());
  const tomorrowDate=new Date(now);tomorrowDate.setDate(tomorrowDate.getDate()+1);
  const tomorrow=entries.filter(x=>sameDay(x.date,tomorrowDate)).sort((a,b)=>a.date.getTime()-b.date.getTime());
  const next=futureToday[0];const later=futureToday[1];const tonight=futureToday.find(x=>x.date.getHours()>=17&&x.event.id!==next?.event.id&&x.event.id!==later?.event.id);const tomorrowFirst=tomorrow[0];
  const schedule:ScheduleItem[]=[
    {label:'NEXT',time:eventTime(next,daypart==='night'?'Now':'Next'),title:eventTitle(next,daypart==='night'?'Open breathing space':'Protect the next right move'),note:next?.event.location??(daypart==='night'?'Nothing fixed is pulling you forward.':'Keep the next move clear.'),quiet:!next},
    {label:'LATER',time:eventTime(later,'Later'),title:eventTitle(later,daypart==='night'?'Nothing fixed':'Open breathing space'),note:later?.event.location??(daypart==='night'?'Let the rest stay quiet.':'Leave breathing room around it.'),quiet:!later},
    {label:'TONIGHT',time:eventTime(tonight,'Tonight'),title:eventTitle(tonight,daypart==='night'?'Close gently':'Wind down'),note:tonight?.event.location??(daypart==='night'?'Close, carry, or release.':'Keep the evening soft.'),quiet:!tonight},
    {label:'TOMORROW',time:eventTime(tomorrowFirst,'Preview'),title:eventTitle(tomorrowFirst,'A quiet glimpse'),note:tomorrowFirst?.event.location??'',quiet:!tomorrowFirst},
  ];
  const end=new Date(now);end.setHours(23,59,59,999);const remaining=duration(end.getTime()-now.getTime());
  const leaveReady=next?duration(Math.max(0,next.date.getTime()-30*60000-now.getTime())):'clear';
  const routineList=useMemo(()=>{const exact=routines.filter(r=>r.timeOfDay===daypart);const adjacent=daypart==='night'?routines.filter(r=>r.timeOfDay==='evening'):[];const list=[...exact,...adjacent];return list.length?list:fallbackRoutines[daypart];},[routines,daypart]);
  const prompt=promptFor(daypart);
  const date=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();
  const clock=now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const searchResults=useMemo(()=>{const q=search.trim().toLowerCase();if(!q)return[];return [...taskList.map(t=>({type:'TASK',title:t.title,href:'/focus'})),...events.map(e=>({type:'EVENT',title:e.title,href:'/calendar'})),...routineList.map(r=>({type:'ROUTINE',title:r.name,href:'/routines'}))].filter(x=>x.title.toLowerCase().includes(q)).slice(0,8);},[search,taskList,events,routineList]);

  function selectTask(task:TaskLite){setManualTask(task.id);setFocusSeconds(0);setFocusRunning(false);setReceipt(`${task.title} is now in focus.`);}
  function toggleFocus(){if(!focusSeconds)setFocusSeconds(suggestedMinutes*60);setFocusRunning(v=>!v);}
  function toggleRoutine(id:string,name:string){setDoneRoutines(list=>{const done=list.includes(id);setReceipt(done?`${name} returned to the pathway.`:`${name} completed.`);return done?list.filter(x=>x!==id):[...list,id];});}
  function openMoment(index:number){setMomentIndex(index);setPanel('moment');}

  const sharedScene=<><TodaySceneCanvasV9 className="v9-scene"/><div className="v9-night-sky"/><div className="v9-room-light"/></>;
  const shakti=<button type="button" className="v9-shakti" onClick={()=>askShakti(prompt,'Today · Now')} aria-label="Open Shakti"><ShaktiLife/><span>Shakti</span></button>;
  const nav=<nav className="v9-world-nav"><button className="active" type="button"><SunMedium/><span>Today</span></button><button type="button" onClick={()=>navigate('/planning','Plan · The Time Observatory')}><CalendarDays/><span>Plan</span></button><button type="button" onClick={()=>navigate('/world','Life · The Personal House')}><Heart/><span>Life</span></button><button type="button" onClick={()=>navigate('/brain','Brain · The Inner Universe')}><Brain/><span>Brain</span></button><button type="button" onClick={()=>navigate('/create','Create · The Transformation Studio')}><WandSparkles/><span>Create</span></button></nav>;

  return <main className="today-v9" data-daypart={daypart}>
    <section className="v9-layout v9-full">
      {sharedScene}
      <div className="v9-brand">GLOW OS</div>
      <div className="v9-tools"><button type="button" onClick={()=>setPanel('search')}><Search/></button><button type="button" onClick={()=>navigate('/calendar','Calendar')}><CalendarDays/></button><button type="button" onClick={()=>navigate('/notices','Attention Center')}><Bell/></button></div>
      <header className="v9-greeting"><h1 suppressHydrationWarning>{greeting(daypart)}</h1><p suppressHydrationWarning>{date}</p></header>
      <section className="v9-now"><div className="v9-now-copy"><small>LIVE MOMENT</small><strong>NOW</strong><h2>{selected.title}</h2><p>{/urgent|high/i.test(selected.priority)?'High focus · Protect what matters':'Steady focus · Move with intention'}</p><em>{momentLine(daypart)}</em></div><div className="v9-now-clock" suppressHydrationWarning>{clock}</div><button type="button" className={`v9-focus ${focusRunning?'running':''}`} onClick={toggleFocus}><b>{focusMinutes}</b><span>{focusSeconds?'MIN':'START'}</span></button></section>
      <section className="v9-what"><div className="v9-kicker">WHAT NOW? <Sparkles/></div><p>Your next right 3.</p>{top3.map((task,index)=><button key={`${task.id}-${index}`} type="button" onClick={()=>selectTask(task)}><span>{index+1}</span><strong>{task.title}</strong><small>{contextLabel(task,daypart,index)}</small></button>)}</section>
      <section className="v9-capacity"><button type="button" className="v9-kicker" onClick={()=>setPanel('capacity')}>ENERGY & CAPACITY</button><div className="v9-cap-body"><button type="button" className="v9-cap-orb" onClick={()=>setPanel('capacity')}><b>{capacity}</b><span>{capacityEstimated?'Inferred':'Radiant'}</span></button><div>{metrics.map(([label,value])=><div className="v9-metric" key={label}><span>{label}</span><i><b style={{width:`${value}%`}}/></i><small>{value}%</small></div>)}</div></div></section>
      <section className="v9-counts"><div><small>TIME REMAINING TODAY</small><strong>{remaining}</strong><span>until day’s end</span></div><div><small>LEAVE-READY</small><strong>{leaveReady}</strong><span>{next?'30-minute preparation buffer':'no fixed commitment ahead'}</span></div></section>
      <button className="v9-replan" type="button" onClick={()=>setPanel('replan')}><Sparkles/><span><strong>{replanCopy(daypart)}</strong><small>Preview first. Keep what still matters.</small></span><ChevronRight/></button>
      <section className="v9-priorities"><div className="v9-kicker">TOP 3 PRIORITIES ♕</div><div>{top3.map((task,index)=><button key={`p-${task.id}-${index}`} type="button" onClick={()=>selectTask(task)}><small>{category(task.title,index)}</small><strong>{task.title}</strong><span>Impact: {impact(task.priority)}</span></button>)}</div></section>
      {shakti}
      <section className="v9-timeline">{schedule.map((item,index)=><button key={item.label} className={item.quiet?'quiet':''} type="button" onClick={()=>openMoment(index)}><i/><small>{item.label}</small><span>{item.time}</span><strong>{item.title}</strong><em>{item.note}</em></button>)}</section>
      <section className="v9-routines"><div className="v9-kicker">ROUTINES DUE NOW</div>{routineList.slice(0,3).map((r,index)=>{const done=doneRoutines.includes(r.id);return <button key={r.id} type="button" className={done?'done':''} onClick={()=>toggleRoutine(r.id,r.name)}><strong>{r.name}</strong><small>{[5,10,7][index]??8} MIN</small><span>{done?<Check/>:''}</span></button>;})}<button type="button" className="all" onClick={()=>navigate('/routines','Routines')}>View all routines →</button></section>
      <button type="button" className="v9-ask" onClick={()=>askShakti(prompt,selected.title)}><div><small>ASK SHAKTI ✧</small><strong>Your oracle. Your clarity.</strong><p>{prompt}</p></div><span className="v9-mini-shakti"><ShaktiLife small/><Mic/></span></button>
      <button type="button" className="v9-saint" onClick={()=>navigate('/routines','Saint')}><PawPrint/> Saint</button>
      {nav}
    </section>

    <section className="v9-layout v9-compact">
      {sharedScene}
      <div className="v9-compact-scrim"/>
      <header className="v9c-header"><div><span>GLOW OS</span><h1 suppressHydrationWarning>{greeting(daypart)}</h1><p suppressHydrationWarning>{date}</p></div><div className="v9c-tools"><button type="button" onClick={()=>setPanel('search')}><Search/></button><button type="button" onClick={()=>navigate('/calendar','Calendar')}><CalendarDays/></button><button type="button" onClick={()=>navigate('/notices','Attention Center')}><Bell/></button></div></header>
      <section className="v9c-left"><div className="v9c-now"><small>LIVE MOMENT · NOW</small><h2>{selected.title}</h2><p>{momentLine(daypart)}</p><button type="button" onClick={toggleFocus}><b>{focusMinutes}</b><span>{focusSeconds?'MIN':'START'}</span></button></div><div className="v9c-grid"><div className="v9c-what"><div className="v9-kicker">WHAT NOW?</div>{top3.map((task,index)=><button key={`c-${task.id}-${index}`} onClick={()=>selectTask(task)}><span>{index+1}</span><strong>{task.title}</strong><small>{contextLabel(task,daypart,index)}</small></button>)}</div><div className="v9c-cap"><div className="v9-kicker">CAPACITY</div><button type="button" onClick={()=>setPanel('capacity')}><b>{capacity}</b><span>{capacityEstimated?'inferred':'Radiant'}</span></button>{metrics.slice(0,2).map(([label,value])=><div key={label}><span>{label}</span><i><b style={{width:`${value}%`}}/></i><small>{value}%</small></div>)}</div></div><div className="v9c-counts"><span><small>TIME LEFT</small><strong>{remaining}</strong></span><span><small>LEAVE-READY</small><strong>{leaveReady}</strong></span></div><button type="button" className="v9c-replan" onClick={()=>setPanel('replan')}><Sparkles/><span>{replanCopy(daypart)}</span><ChevronRight/></button></section>
      <div className="v9c-shakti">{shakti}<button type="button" className="v9c-ask" onClick={()=>askShakti(prompt,selected.title)}>Ask Shakti</button></div>
      <section className="v9c-right"><div className="v9-kicker">THE REST OF TODAY</div>{schedule.map((item,index)=><button key={`c-${item.label}`} className={item.quiet?'quiet':''} onClick={()=>openMoment(index)}><i/><small>{item.label} · {item.time}</small><strong>{item.title}</strong><span>{item.note}</span></button>)}</section>
      <div className="v9c-bottom"><section><div className="v9-kicker">PRIORITIES</div>{top3.map((task,index)=><button key={`cp-${task.id}-${index}`} onClick={()=>selectTask(task)}><small>{category(task.title,index)}</small><strong>{task.title}</strong></button>)}</section><section><div className="v9-kicker">ROUTINES</div>{routineList.slice(0,2).map(r=><button key={`cr-${r.id}`} onClick={()=>toggleRoutine(r.id,r.name)}><strong>{r.name}</strong><span>{doneRoutines.includes(r.id)?'✓':'○'}</span></button>)}</section></div>
      <button type="button" className="v9c-saint" onClick={()=>navigate('/routines','Saint')}><PawPrint/> Saint</button>
      {nav}
    </section>

    <section className="v9-layout v9-portrait">
      {sharedScene}<div className="v9p-scrim"/>
      <div className="v9p-scroll"><header><div className="v9p-top"><span>GLOW OS</span><div><button onClick={()=>setPanel('search')}><Search/></button><button onClick={()=>navigate('/calendar','Calendar')}><CalendarDays/></button><button onClick={()=>navigate('/notices','Attention Center')}><Bell/></button></div></div><h1 suppressHydrationWarning>{greeting(daypart)}</h1><p suppressHydrationWarning>{date}</p></header>
      <div className="v9p-shakti">{shakti}</div>
      <section className="v9p-now"><div><small>LIVE MOMENT · NOW</small><h2>{selected.title}</h2><em>{momentLine(daypart)}</em></div><button onClick={toggleFocus}><b>{focusMinutes}</b><span>{focusSeconds?'MIN':'START'}</span></button></section>
      <section className="v9p-what"><div className="v9-kicker">WHAT NOW?</div>{top3.map((task,index)=><button key={`pwhat-${task.id}-${index}`} onClick={()=>selectTask(task)}><span>{index+1}</span><strong>{task.title}</strong><small>{contextLabel(task,daypart,index)}</small></button>)}</section>
      <section className="v9p-cap"><div className="v9-kicker">CAPACITY {capacityEstimated&&<small>· inferred</small>}</div><button onClick={()=>setPanel('capacity')}><b>{capacity}</b><span>Capacity</span></button>{metrics.map(([label,value])=><div key={`pm-${label}`}><span>{label}</span><i><b style={{width:`${value}%`}}/></i><small>{value}%</small></div>)}</section>
      <section className="v9p-counts"><div><small>TIME LEFT</small><strong>{remaining}</strong></div><div><small>LEAVE-READY</small><strong>{leaveReady}</strong></div></section>
      <button className="v9p-replan" onClick={()=>setPanel('replan')}><Sparkles/><span><strong>{replanCopy(daypart)}</strong><small>Preview first.</small></span><ChevronRight/></button>
      <section className="v9p-timeline"><div className="v9-kicker">THE REST OF TODAY</div>{schedule.map((item,index)=><button key={`pt-${item.label}`} className={item.quiet?'quiet':''} onClick={()=>openMoment(index)}><i/><small>{item.label} · {item.time}</small><strong>{item.title}</strong><em>{item.note}</em></button>)}</section>
      <section className="v9p-priorities"><div className="v9-kicker">TOP 3 PRIORITIES</div>{top3.map((task,index)=><button key={`pp-${task.id}-${index}`} onClick={()=>selectTask(task)}><small>{category(task.title,index)}</small><strong>{task.title}</strong><span>{impact(task.priority)} impact</span></button>)}</section>
      <section className="v9p-routines"><div className="v9-kicker">ROUTINES DUE NOW</div>{routineList.slice(0,4).map(r=><button key={`pr-${r.id}`} onClick={()=>toggleRoutine(r.id,r.name)} className={doneRoutines.includes(r.id)?'done':''}><strong>{r.name}</strong><span>{doneRoutines.includes(r.id)?'✓':'○'}</span></button>)}</section>
      <button className="v9p-ask" onClick={()=>askShakti(prompt,selected.title)}><span><small>ASK SHAKTI</small><strong>Your oracle. Your clarity.</strong><p>{prompt}</p></span><span className="v9-mini-shakti"><ShaktiLife small/><Mic/></span></button><button className="v9p-saint" onClick={()=>navigate('/routines','Saint')}><PawPrint/> Saint</button></div>
      {nav}
      <button className="v9p-shakti-rest" onClick={()=>askShakti(prompt,'Today · Now')} aria-label="Ask Shakti"><ShaktiLife small/></button>
    </section>

    {receipt&&<div className="v9-receipt" aria-live="polite">{receipt}</div>}
    {panel==='search'&&<Modal onClose={()=>setPanel(null)}><div className="v9-modal-kicker">SEARCH GLOW OS</div><h2>Cast light across your world.</h2><input autoFocus value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tasks, moments, routines…"/>{searchResults.map((result,index)=><button key={`${result.type}-${index}`} className="v9-result" onClick={()=>{setPanel(null);navigate(result.href,result.title);}}><small>{result.type}</small><span>{result.title}</span></button>)}</Modal>}
    {panel==='capacity'&&<Modal onClose={()=>setPanel(null)}><div className="v9-modal-kicker">ENERGY & CAPACITY</div><h2>{capacity} · {capacityEstimated?'Inferred':'Radiant'}</h2>{capacityEstimated&&<p className="v9-modal-note">No current check-in was available, so these values are explicitly shown as inferred rather than pretending to be measured live data.</p>}<div className="v9-modal-metrics">{metrics.map(([label,value])=><div key={label}><span>{label}</span><i><b style={{width:`${value}%`}}/></i><small>{value}%</small></div>)}</div><button className="v9-primary" onClick={()=>askShakti(`I have about ${capacity}% capacity. Help me choose what fits.`, 'Energy & Capacity')}>Ask Shakti what fits</button></Modal>}
    {panel==='routines'&&<Modal onClose={()=>setPanel(null)}><div className="v9-modal-kicker">ROUTINES</div><h2>One active pathway.</h2>{routineList.map(r=><button key={`mr-${r.id}`} className="v9-result" onClick={()=>toggleRoutine(r.id,r.name)}><span>{r.name}</span><small>{doneRoutines.includes(r.id)?'DONE':'READY'}</small></button>)}</Modal>}
    {panel==='replan'&&<Modal onClose={()=>setPanel(null)}><div className="v9-modal-kicker">{replanCopy(daypart).toUpperCase()}</div><h2>Shakti will preview the change first.</h2><p className="v9-modal-note">Today can reorganize locally without changing an external calendar. Any meaningful schedule change still needs your approval.</p>{top3.map((task,index)=><div className="v9-preview" key={`preview-${task.id}-${index}`}><span>{index+1}</span><strong>{task.title}</strong><small>{contextLabel(task,daypart,index)}</small></div>)}<button className="v9-primary" onClick={()=>{setPanel(null);setReceipt('The rest of Today has been re-centered around what still matters.');}}>Use this local order</button></Modal>}
    {panel==='moment'&&<Modal onClose={()=>setPanel(null)}><div className="v9-modal-kicker">{schedule[momentIndex].label}</div><h2>{schedule[momentIndex].title}</h2><p className="v9-modal-note">{schedule[momentIndex].time}<br/>{schedule[momentIndex].note}</p><button className="v9-primary" onClick={()=>askShakti(`Help me with ${schedule[momentIndex].title}`,schedule[momentIndex].title)}>Ask Shakti</button></Modal>}
    {panel==='focus'&&<Modal onClose={()=>setPanel(null)}><div className="v9-modal-kicker">LIVE MOMENT</div><h2>{selected.title}</h2><button className="v9-modal-focus" onClick={toggleFocus}><b>{focusMinutes}</b><span>{focusSeconds?'MIN':'START'}</span></button></Modal>}
  </main>;
}
