'use client';

import { useEffect,useMemo,useState } from 'react';
import type { ReactNode } from 'react';
import { Bell,Brain,CalendarDays,ChevronRight,Heart,PawPrint,Search,SunMedium,WandSparkles,X } from 'lucide-react';
import { ShaktiPresence } from './shakti-presence';
import styles from './today-clean-room.module.css';

type TaskLite={id:string;title:string;priority:string;dueLabel?:string|null};
type EventLite={id:string;title:string;timeLabel:string;location?:string|null;startAtISO?:string|null;allDay?:boolean};
type RoutineLite={id:string;name:string;timeOfDay:string};
type Props={tasks:TaskLite[];events:EventLite[];routines:RoutineLite[];energy:number|null;mood:number|null;sleepHours:number|null};
type Daypart='morning'|'afternoon'|'evening'|'night';
type Panel='search'|'focus'|'energy'|'routines'|'saint'|'replan'|null;

const rank:Record<string,number>={urgent:5,high:4,medium:3,low:2};
const phaseWords:Record<Daypart,string[]>={morning:['morning','wake','breakfast','sunrise'],afternoon:['midday','afternoon','lunch','noon'],evening:['evening','sunset','dinner','transition'],night:['night','shutdown','sleep','bedtime','wind down','wind-down']};
const fallbackTask:Record<Daypart,TaskLite>={morning:{id:'fm',title:'Begin with the clearest next move',priority:'medium',dueLabel:'Now'},afternoon:{id:'fa',title:'Reset the middle of the day',priority:'medium',dueLabel:'Now'},evening:{id:'fe',title:'Transition into the evening',priority:'medium',dueLabel:'Now'},night:{id:'fn',title:'Close the day gently',priority:'medium',dueLabel:'Now'}};
const fallbackRoutines:Record<Daypart,RoutineLite[]>={morning:[{id:'rm1',name:'Morning hydration',timeOfDay:'morning'},{id:'rm2',name:'Posture + stretch',timeOfDay:'morning'},{id:'rm3',name:'Morning reset',timeOfDay:'morning'}],afternoon:[{id:'ra1',name:'Hydrate + reset',timeOfDay:'afternoon'},{id:'ra2',name:'Posture + stretch',timeOfDay:'afternoon'},{id:'ra3',name:'Midday reset',timeOfDay:'afternoon'}],evening:[{id:'re1',name:'Evening transition',timeOfDay:'evening'},{id:'re2',name:'Hydrate + move',timeOfDay:'evening'},{id:'re3',name:'Prepare tomorrow',timeOfDay:'evening'}],night:[{id:'rn1',name:'Night hydration',timeOfDay:'night'},{id:'rn2',name:'Skincare close',timeOfDay:'night'},{id:'rn3',name:'Tomorrow prep',timeOfDay:'night'}]};

function getDaypart(hour:number):Daypart{if(hour>=5&&hour<12)return'morning';if(hour>=12&&hour<17)return'afternoon';if(hour>=17&&hour<21)return'evening';return'night'}
function greeting(d:Daypart){return d==='morning'?'Good morning, Tatiyana ♡':d==='afternoon'?'Good afternoon, Tatiyana ♡':d==='evening'?'Good evening, Tatiyana ♡':'Good night, Tatiyana ♡'}
function taskScore(t:TaskLite,d:Daypart){const v=t.title.toLowerCase();let s=(rank[t.priority]??2)*15;if(phaseWords[d].some(w=>v.includes(w)))s+=42;if(d==='night'&&/morning|midday|afternoon|lunch/.test(v))s-=52;if(d==='morning'&&/night|bedtime|shutdown/.test(v))s-=48;if(t.dueLabel==='Overdue')s+=18;if(t.dueLabel==='Today')s+=10;return s}
function safeMeta(t:TaskLite,d:Daypart,index:number){if(index===0)return'Now';if(t.dueLabel==='Overdue')return'Overdue';if(t.dueLabel==='Tomorrow')return'Tomorrow';if(t.dueLabel==='Today')return d==='night'?'Late':'Today';return index===1?(d==='night'?'Can wait':'Later'):'After'}
function sameDay(a:Date,b:Date){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function fmtTime(d:Date){return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
function fmtDuration(ms:number){const m=Math.max(0,Math.floor(ms/60000));return`${Math.floor(m/60)}H ${String(m%60).padStart(2,'0')}M`}
function category(title:string,index:number){const v=title.toLowerCase();if(/hair|body|skin|wellness|hydrate|care|beauty/.test(v))return'CARE';if(/write|content|studio|create|design|creative/.test(v))return'CREATE';if(/plan|schedule|calendar|prepare|organize|tomorrow/.test(v))return'PLAN';return['FOCUS','CARE','PLAN'][index]??'FOCUS'}
function impact(p:string){return /urgent|high/i.test(p)?'High':/low/i.test(p)?'Low':'Medium'}
function navigate(href:string,label:string){window.dispatchEvent(new CustomEvent('glow:navigate',{detail:{href,label}}))}
function askShakti(prompt:string,activeObject:string){window.dispatchEvent(new CustomEvent('glow:open',{detail:{prompt,activeObject}}))}

function Modal({children,onClose}:{children:ReactNode;onClose:()=>void}){return <div className={styles.modalBackdrop} onMouseDown={onClose}><section className={styles.modal} role="dialog" aria-modal="true" onMouseDown={e=>e.stopPropagation()}><button type="button" className={styles.modalClose} onClick={onClose}><X size={17}/></button>{children}</section></div>}

export function TodayCleanRoom({tasks,events,routines,energy,mood}:Props){
  const [now,setNow]=useState(()=>new Date());
  const [panel,setPanel]=useState<Panel>(null);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [focusSeconds,setFocusSeconds]=useState(0);
  const [focusRunning,setFocusRunning]=useState(false);
  const [doneRoutines,setDoneRoutines]=useState<string[]>([]);
  const [receipt,setReceipt]=useState('');
  const [query,setQuery]=useState('');
  const [localOrder,setLocalOrder]=useState<string[]>([]);

  useEffect(()=>{const t=window.setInterval(()=>setNow(new Date()),15000);return()=>window.clearInterval(t)},[]);
  useEffect(()=>{if(!focusRunning)return;const t=window.setInterval(()=>setFocusSeconds(s=>Math.max(0,s-1)),1000);return()=>window.clearInterval(t)},[focusRunning]);
  useEffect(()=>{if(focusRunning&&focusSeconds===0){setFocusRunning(false);setReceipt('Focus complete.');}},[focusRunning,focusSeconds]);
  useEffect(()=>{if(!receipt)return;const t=window.setTimeout(()=>setReceipt(''),3400);return()=>window.clearTimeout(t)},[receipt]);

  const daypart=getDaypart(now.getHours());
  const rankedTasks=useMemo(()=>{const base=tasks.length?tasks:[fallbackTask[daypart]];const sorted=[...base].sort((a,b)=>taskScore(b,daypart)-taskScore(a,daypart));if(!localOrder.length)return sorted;const positions=new Map(localOrder.map((id,i)=>[id,i]));return [...sorted].sort((a,b)=>(positions.get(a.id)??999)-(positions.get(b.id)??999))},[tasks,daypart,localOrder]);
  const selected=rankedTasks.find(t=>t.id===selectedId)??rankedTasks[0]??fallbackTask[daypart];
  const topThree=[...rankedTasks.slice(0,3)];while(topThree.length<3)topThree.push(fallbackTask[daypart]);
  const suggestedMinutes=/urgent|high/i.test(selected.priority)?45:/low/i.test(selected.priority)?20:30;
  const focusMinutes=focusSeconds>0?Math.ceil(focusSeconds/60):suggestedMinutes;
  const cap=energy?Math.max(35,Math.min(96,Math.round(energy*10))):72;
  const emotional=mood?Math.max(35,Math.min(96,Math.round(mood*10))):70;
  const physical=energy?Math.max(35,Math.min(96,Math.round(energy*10-8))):66;
  const creative=Math.max(45,Math.min(98,cap+10));
  const metrics=[['Mental',cap],['Emotional',emotional],['Physical',physical],['Creative',creative]] as const;
  const end=new Date(now);end.setHours(23,59,59,999);const timeLeft=fmtDuration(end.getTime()-now.getTime());
  const entries=useMemo(()=>events.flatMap(e=>{if(!e.startAtISO)return[];const date=new Date(e.startAtISO);return Number.isNaN(date.getTime())?[]:[{event:e,date}]}),[events]);
  const futureToday=entries.filter(x=>!x.event.allDay&&sameDay(x.date,now)&&x.date>now).sort((a,b)=>a.date.getTime()-b.date.getTime());
  const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
  const tomorrowFirst=entries.filter(x=>sameDay(x.date,tomorrow)).sort((a,b)=>a.date.getTime()-b.date.getTime())[0];
  const next=futureToday[0];const later=futureToday[1];const tonight=futureToday.find(x=>x.date.getHours()>=17&&x.event.id!==next?.event.id&&x.event.id!==later?.event.id);
  const wrapAt=next?new Date(next.date.getTime()-30*60000):null;const leaveReady=wrapAt&&wrapAt>now?fmtDuration(wrapAt.getTime()-now.getTime()):'Clear';
  const schedule=[
    {label:'NEXT',time:next?fmtTime(next.date):'Now',title:next?.event.title??'Open breathing space',note:next?.event.location??'Nothing fixed is pulling you forward.'},
    {label:'LATER',time:later?fmtTime(later.date):'Later',title:later?.event.title??'Nothing fixed',note:later?.event.location??'Let the rest stay quiet.'},
    {label:'TONIGHT',time:tonight?fmtTime(tonight.date):'Tonight',title:tonight?.event.title??(daypart==='night'?'Close gently':'Wind down'),note:tonight?.event.location??'Close, carry, or release.'},
    {label:'TOMORROW',time:tomorrowFirst?fmtTime(tomorrowFirst.date):'Preview',title:tomorrowFirst?.event.title??'A quiet glimpse',note:tomorrowFirst?.event.location??''},
  ];
  const phaseRoutines=useMemo(()=>{const exact=routines.filter(r=>r.timeOfDay===daypart);return exact.length?exact:fallbackRoutines[daypart]},[routines,daypart]);
  const shaktiPrompt=daypart==='morning'?'What deserves your first clear yes?':daypart==='afternoon'?'What would make the rest of today lighter?':daypart==='evening'?'What still deserves your energy tonight?':'What can we close, carry, or release?';
  const searchResults=[...rankedTasks.map(t=>({type:'Task',title:t.title,href:'/focus'})),...events.map(e=>({type:'Event',title:e.title,href:'/calendar'})),...phaseRoutines.map(r=>({type:'Routine',title:r.name,href:'/routines'}))].filter(x=>x.title.toLowerCase().includes(query.trim().toLowerCase())).slice(0,8);

  function chooseTask(t:TaskLite){setSelectedId(t.id);setFocusSeconds(0);setFocusRunning(false);setPanel('focus');setReceipt(`${t.title} moved into focus.`)}
  function toggleFocus(){if(!focusSeconds)setFocusSeconds(suggestedMinutes*60);setFocusRunning(v=>!v)}
  function toggleRoutine(r:RoutineLite){setDoneRoutines(ids=>ids.includes(r.id)?ids.filter(id=>id!==r.id):[...ids,r.id])}
  function applyReplan(){setLocalOrder(rankedTasks.map(t=>t.id));setPanel(null);setReceipt('Tonight reorganized locally. Nothing external changed.')}

  return <main className={styles.root} data-daypart={daypart}>
    <div className={styles.room} aria-hidden="true"><div className={styles.window}/><div className={`${styles.curtain} ${styles.curtainLeft}`}/><div className={`${styles.curtain} ${styles.curtainRight}`}/><div className={styles.floor}/><div className={styles.lightPool}/><div className={styles.vanity}><div className={styles.mirror}/><div className={styles.desk}/><div className={styles.flowers}/><div className={styles.chair}/></div><div className={styles.roomGlow}/><div className={styles.grain}/></div>
    <div className={styles.shell}>
      <header className={styles.header}><div className={styles.brand}>GLOW OS</div><div className={styles.greeting} suppressHydrationWarning>{greeting(daypart)}</div><div className={styles.date} suppressHydrationWarning>{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div></header>
      <div className={styles.tools}><button className={styles.iconButton} onClick={()=>setPanel('search')} aria-label="Search"><Search size={18}/></button><button className={styles.iconButton} onClick={()=>navigate('/calendar','Plan · Calendar')} aria-label="Calendar"><CalendarDays size={18}/></button><button className={styles.iconButton} onClick={()=>navigate('/notices','Attention Center')} aria-label="Notifications"><Bell size={18}/></button></div>
      <section className={styles.left}>
        <article className={`${styles.surface} ${styles.now}`}><div className={`${styles.eyebrow} ${styles.nowEyebrow}`}>LIVE MOMENT · NOW</div><div className={styles.clock} suppressHydrationWarning>{fmtTime(now)}</div><div className={styles.nowWord}>NOW</div><div className={styles.taskTitle}>{selected.title}</div><div className={styles.context}>{/urgent|high/i.test(selected.priority)?'High focus · protect what matters':'Steady focus · move with intention'}</div><div className={styles.momentLine}>{daypart==='night'?'Only what still matters.':daypart==='evening'?'Finish what matters.':'This is your moment.'}</div><button type="button" className={styles.focus} onClick={toggleFocus}><span><strong>{focusMinutes}</strong><span>{focusSeconds>0?(focusRunning?'PAUSE':'RESUME'):'START'}</span></span></button></article>
        <article className={`${styles.surface} ${styles.what}`}><div className={styles.eyebrow}>WHAT NOW?</div><div className={`${styles.subtle}`} style={{fontSize:10,marginTop:5}}>Your next right 3.</div><div className={styles.whatRows}>{rankedTasks.slice(0,3).map((t,i)=><button key={t.id} className={styles.whatRow} onClick={()=>chooseTask(t)}><span className={styles.number}>{i+1}</span><span className={styles.rowTitle}>{t.title}</span><span className={styles.meta}>{safeMeta(t,daypart,i)}</span></button>)}</div></article>
        <article className={`${styles.surface} ${styles.capacity}`}><div className={styles.eyebrow}>ENERGY & CAPACITY</div><div className={styles.capacityBody}><button className={styles.capacityOrb} onClick={()=>setPanel('energy')}><span><strong>{cap}</strong><small>{energy?'Radiant':'inferred'}</small></span></button><div>{metrics.map(([label,value])=><div className={styles.metric} key={label}><span>{label}</span><span className={styles.track}><span className={styles.fill} style={{width:`${value}%`}}/></span><span>{value}%</span></div>)}</div></div></article>
        <article className={`${styles.surface} ${styles.counts}`}><div><div className={styles.countLabel}>TIME REMAINING TODAY</div><div className={styles.countValue}>{timeLeft}</div><div className={styles.countNote}>until day’s end</div></div><div><div className={styles.countLabel}>LEAVE-READY</div><div className={styles.countValue}>{leaveReady}</div><div className={styles.countNote}>{leaveReady==='Clear'?'no fixed commitment ahead':'30-minute preparation buffer'}</div></div></article>
        <button type="button" className={`${styles.surface} ${styles.replan}`} onClick={()=>setPanel('replan')}><span className={styles.replanMark}>✧</span><span className={styles.replanText}><strong>{daypart==='night'?'Reset the rest of tonight':daypart==='evening'?'Replan My Evening':'Replan My Day'}</strong><small>Preview first. Nothing external changes without approval.</small></span><span className={styles.replanArrow}><ChevronRight size={16}/></span></button>
        <article className={`${styles.surface} ${styles.priorities}`}><div className={styles.eyebrow}>TOP 3 PRIORITIES</div><div className={styles.priorityGrid}>{topThree.map((t,i)=><button key={`${t.id}-${i}`} className={styles.priority} onClick={()=>chooseTask(t)}><span className={styles.category}>{category(t.title,i)}</span><span className={styles.priorityTitle}>{t.title}</span><span className={styles.priorityNote}>Impact: {impact(t.priority)}</span></button>)}</div></article>
      </section>
      <section className={styles.center}><div className={styles.shaktiWrap}><button type="button" className={styles.shaktiButton} onClick={()=>askShakti(shaktiPrompt,'Today · Now')} aria-label="Open Shakti"><ShaktiPresence/><span className={styles.shaktiLabel}>Shakti</span></button></div><button type="button" className={styles.askShakti} onClick={()=>askShakti(shaktiPrompt,selected.title)}>Ask Shakti</button></section>
      <aside className={styles.right}><article className={`${styles.surface} ${styles.timeline}`}><div className={styles.eyebrow}>THE REST OF TODAY</div>{schedule.map(item=><button key={item.label} className={styles.moment} onClick={()=>navigate(item.label==='TOMORROW'?'/tomorrow':'/calendar',item.title)}><span className={styles.node}/><span className={styles.momentLabel}>{item.label}</span><span className={styles.momentTime}>{item.time}</span><span className={styles.momentTitle}>{item.title}</span>{item.note&&<span className={styles.momentNote}>{item.note}</span>}</button>)}</article><article className={`${styles.surface} ${styles.routines}`}><div className={styles.eyebrow}>ROUTINES DUE NOW</div>{phaseRoutines.slice(0,3).map((r,i)=>{const done=doneRoutines.includes(r.id);return <button key={r.id} className={`${styles.routine} ${done?styles.done:''}`} onClick={()=>toggleRoutine(r)}><span className={styles.routineName}>{r.name}</span><span className={styles.routineDuration}>{[5,10,7][i]} MIN</span><span className={styles.check}>{done?'✓':''}</span></button>})}</article><button type="button" className={`${styles.surface} ${styles.askPanel}`} onClick={()=>askShakti(shaktiPrompt,selected.title)}><div><div className={styles.eyebrow}>ASK SHAKTI</div><h3>Your oracle. Your clarity.</h3><p>{shaktiPrompt}</p></div><div className={styles.miniShakti}><ShaktiPresence small/></div></button></aside>
    </div>
    <nav className={styles.nav}><button className={styles.active}><SunMedium size={16}/>Today</button><button onClick={()=>navigate('/planning','Plan · The Time Observatory')}><CalendarDays size={16}/>Plan</button><button onClick={()=>navigate('/world','Life · The Personal House')}><Heart size={16}/>Life</button><button onClick={()=>navigate('/brain','Brain · The Inner Universe')}><Brain size={16}/>Brain</button><button onClick={()=>navigate('/create','Create · The Transformation Studio')}><WandSparkles size={16}/>Create</button></nav>
    <button type="button" className={styles.saint} onClick={()=>setPanel('saint')}><PawPrint size={16}/><span>Saint</span></button>
    {receipt&&<div className={styles.receipt} aria-live="polite">{receipt}</div>}
    {panel==='search'&&<Modal onClose={()=>setPanel(null)}><div className={styles.eyebrow}>SEARCH GLOW OS</div><h2>Cast light across your world.</h2><input autoFocus className={styles.searchInput} value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tasks, events, routines…"/><div className={styles.modalList}>{query&&searchResults.map((r,i)=><button key={`${r.type}-${i}`} className={styles.modalRow} onClick={()=>{setPanel(null);navigate(r.href,r.title)}}><span className={styles.eyebrow}>{r.type}</span><span>{r.title}</span><ChevronRight size={14}/></button>)}</div></Modal>}
    {panel==='focus'&&<Modal onClose={()=>setPanel(null)}><div className={styles.eyebrow}>LIVE MOMENT · NOW</div><h2>{selected.title}</h2><p>Keep the current object connected to Today while you work.</p><button className={styles.focus} onClick={toggleFocus}><span><strong>{focusMinutes}</strong><span>{focusSeconds>0?(focusRunning?'PAUSE':'RESUME'):'START'}</span></span></button></Modal>}
    {panel==='energy'&&<Modal onClose={()=>setPanel(null)}><div className={styles.eyebrow}>ENERGY & CAPACITY</div><h2>{cap} · {energy?'Radiant':'Inferred'}</h2><p>{energy?'Using your latest check-in.':'No current energy check-in was found, so Glow is labeling this estimate honestly.'}</p>{metrics.map(([label,value])=><div className={styles.modalRow} key={label}><span>{label}</span><span>{value}%</span></div>)}</Modal>}
    {panel==='replan'&&<Modal onClose={()=>setPanel(null)}><div className={styles.eyebrow}>PREVIEW</div><h2>{daypart==='night'?'Reset the rest of tonight':'Replan the day'}</h2><p>This changes only the local Today order. Calendar changes still require approval.</p>{rankedTasks.slice(0,5).map((t,i)=><div className={styles.modalRow} key={t.id}><span>{i+1}</span><span>{t.title}</span></div>)}<button className={styles.askShakti} onClick={applyReplan}>Use this local order</button></Modal>}
    {panel==='saint'&&<Modal onClose={()=>setPanel(null)}><PawPrint size={22}/><h2>Saint is with you.</h2><p>Walks, care moments, reminders, and shared plans remain connected to Today.</p></Modal>}
  </main>
}
