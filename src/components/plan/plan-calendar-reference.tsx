'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { CalendarDays, Clock3, GitCompare, ListTree, Move, ShieldCheck } from 'lucide-react';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import styles from './plan-calendar-reference.module.css';

const DAY=86_400_000;
type CalendarView='day'|'week'|'month';
export type PlanCalendarEvent={id:string;title:string;description:string|null;startAt:string;endAt:string|null;location:string|null;allDay:boolean;color:string|null;source:string|null};

function startOfDay(date:Date){const value=new Date(date);value.setHours(0,0,0,0);return value;}
function startOfWeek(date:Date){const value=startOfDay(date);const offset=(value.getDay()+6)%7;value.setDate(value.getDate()-offset);return value;}
function addDays(date:Date,count:number){return new Date(date.getTime()+count*DAY);}
function sameDay(a:Date,b:Date){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function timeLabel(date:Date){return date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function rangeLabel(start:Date,end:Date){return `${start.toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${end.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;}
function horizonLabel(value:PlanHorizon){return value==='today'?'TODAY':value==='week'?'THIS WEEK':value==='two-weeks'?'NEXT 2 WEEKS':value==='month'?'THIS MONTH':'NEXT 3 MONTHS';}
function toneFor(title:string){const text=title.toLowerCase();if(/lunch|breakfast|dinner|brunch|meal/.test(text))return'meal';if(/family|date|friend|personal/.test(text))return'personal';if(/walk|gym|workout|yoga|health|doctor/.test(text))return'wellness';if(/prep|prepare|review notes|brief/.test(text))return'prep';if(/meeting|call|sync|appointment|interview/.test(text))return'meeting';return'focus';}
function minutes(event:PlanCalendarEvent){if(event.allDay)return 0;const start=new Date(event.startAt);const end=event.endAt?new Date(event.endAt):new Date(start.getTime()+60*60_000);return Math.max(0,Math.round((end.getTime()-start.getTime())/60_000));}
function openGlow(prompt:string){document.dispatchEvent(new CustomEvent('glow:open',{detail:{prefill:prompt,context:{room:'Plan · Calendar'}}}));}

export function PlanCalendarReference({events}:{events:PlanCalendarEvent[]}){
  const [anchor,setAnchor]=useState(()=>new Date());
  const [view,setView]=useState<CalendarView>('week');
  const [horizon,setHorizon]=useState<PlanHorizon>('week');
  const weekStart=useMemo(()=>startOfWeek(anchor),[anchor]);
  const weekDays=useMemo(()=>Array.from({length:7},(_,index)=>addDays(weekStart,index)),[weekStart]);
  const activeEvents=useMemo(()=>events.filter((event)=>{const date=new Date(event.startAt);return view==='day'?sameDay(date,anchor):view==='week'?date>=weekStart&&date<addDays(weekStart,7):date.getFullYear()===anchor.getFullYear()&&date.getMonth()===anchor.getMonth();}),[events,view,anchor,weekStart]);
  const selectedDayEvents=useMemo(()=>events.filter((event)=>sameDay(new Date(event.startAt),anchor)),[events,anchor]);
  const weekEnd=addDays(weekStart,6);
  const focusMinutes=selectedDayEvents.filter((event)=>toneFor(event.title)==='focus').reduce((sum,event)=>sum+minutes(event),0);
  const meetingMinutes=selectedDayEvents.filter((event)=>toneFor(event.title)==='meeting').reduce((sum,event)=>sum+minutes(event),0);
  const personalMinutes=selectedDayEvents.filter((event)=>toneFor(event.title)==='personal'||toneFor(event.title)==='wellness'||toneFor(event.title)==='meal').reduce((sum,event)=>sum+minutes(event),0);
  const scheduledMinutes=selectedDayEvents.reduce((sum,event)=>sum+minutes(event),0);
  const dayWindow=16*60;
  const freeMinutes=Math.max(0,dayWindow-scheduledMinutes);
  const focusPercent=scheduledMinutes?Math.round(focusMinutes/scheduledMinutes*100):0;
  const tomorrow=addDays(startOfDay(anchor),1);
  const tomorrowEvents=events.filter((event)=>sameDay(new Date(event.startAt),tomorrow)&&!event.allDay).sort((a,b)=>new Date(a.startAt).getTime()-new Date(b.startAt).getTime());
  let cursor=new Date(tomorrow);cursor.setHours(7,0,0,0);let maxGap=0;
  const endDay=new Date(tomorrow);endDay.setHours(22,0,0,0);
  for(const event of tomorrowEvents){const start=new Date(event.startAt);maxGap=Math.max(maxGap,start.getTime()-cursor.getTime());const end=event.endAt?new Date(event.endAt):new Date(start.getTime()+60*60_000);if(end>cursor)cursor=end;}maxGap=Math.max(maxGap,endDay.getTime()-cursor.getTime());
  const openMinutes=Math.max(0,Math.round(maxGap/60_000));
  const prepEvents=selectedDayEvents.filter((event)=>Boolean(event.description?.trim())).slice(0,2);

  const monthStart=new Date(anchor.getFullYear(),anchor.getMonth(),1);const monthOffset=(monthStart.getDay()+6)%7;const miniStart=addDays(monthStart,-monthOffset);const miniDays=Array.from({length:42},(_,index)=>addDays(miniStart,index));

  function moveAnchor(direction:-1|1){if(view==='day')setAnchor((value)=>addDays(value,direction));else if(view==='week')setAnchor((value)=>addDays(value,direction*7));else setAnchor((value)=>new Date(value.getFullYear(),value.getMonth()+direction,1));}

  return <PlanInstrumentChrome title="PLAN · CALENDAR" subtitle="A more intentional day. See, shape, and protect your time." activeInstrument="Calendar" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)}>
    <section className={styles.stage} aria-label="Plan calendar week">
      <div className={styles.topControls}><div className={styles.navCluster}><button onClick={()=>moveAnchor(-1)} aria-label="Previous period">‹</button><button onClick={()=>moveAnchor(1)} aria-label="Next period">›</button><button className={styles.today} onClick={()=>setAnchor(new Date())}>Today</button></div><strong className={styles.range}>{view==='day'?anchor.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'}):view==='month'?anchor.toLocaleDateString('en-US',{month:'long',year:'numeric'}):rangeLabel(weekStart,weekEnd)}</strong><div className={styles.viewCluster}>{(['day','week','month'] as CalendarView[]).map((item)=><button key={item} onClick={()=>{setView(item);setHorizon(item==='day'?'today':item==='week'?'week':'month')}} className={view===item?styles.active:undefined}>{item[0].toUpperCase()+item.slice(1)}</button>)}</div></div>

      {view!=='month'?<div className={styles.calendarGrid}>
        <div className={styles.gridHeader} style={{gridTemplateColumns:`repeat(${view==='day'?1:7},1fr)`}}>{(view==='day'?[anchor]:weekDays).map((day)=><div key={day.toISOString()}><span><b>{day.toLocaleDateString('en-US',{weekday:'short'})}</b>{day.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></div>)}</div>
        <div className={styles.timeAxis}>{[6,8,10,12,14,16,18,20,22].map((hour)=><span key={hour} style={{top:`${((hour-6)/16)*100}%`}}>{new Date(2000,0,1,hour).toLocaleTimeString('en-US',{hour:'numeric'})}</span>)}</div>
        <div className={styles.gridBody} style={{gridTemplateColumns:`repeat(${view==='day'?1:7},1fr)`}}>{(view==='day'?[anchor]:weekDays).map((day,index)=><div className={styles.dayColumn} key={day.toISOString()}>{activeEvents.filter((event)=>sameDay(new Date(event.startAt),day)).map((event)=>{const start=new Date(event.startAt);const end=event.endAt?new Date(event.endAt):new Date(start.getTime()+60*60_000);const top=event.allDay?1:Math.max(0,Math.min(95,((start.getHours()+start.getMinutes()/60-6)/16)*100));const height=event.allDay?7:Math.max(6,Math.min(45,((end.getTime()-start.getTime())/36e5/16)*100));return <button key={event.id} className={styles.event} data-tone={toneFor(event.title)} style={{top:`${top}%`,height:`${height}%`}} onClick={()=>openGlow(`Tell me what matters around “${event.title}” and show any preparation or schedule conflicts before changing anything.`)}><b>{event.title}</b><small>{event.allDay?'All day':`${timeLabel(start)}${event.endAt?` – ${timeLabel(end)}`:''}`}</small></button>})}{index===5&&view==='week'&&activeEvents.filter((event)=>sameDay(new Date(event.startAt),day)).length===0?<div className={styles.freeBlock}>Free Time</div>:null}</div>)}</div>
      </div>:<div className={styles.calendarGrid} style={{padding:'18px 18px 12px 70px',display:'grid',gridTemplateColumns:'repeat(7,1fr)',gridTemplateRows:'repeat(6,1fr)',gap:5}}>{miniDays.map((day)=><button key={day.toISOString()} onClick={()=>{setAnchor(day);setView('day');setHorizon('today')}} style={{border:'1px solid rgba(255,255,255,.55)',borderRadius:10,background:sameDay(day,anchor)?'rgba(220,213,255,.42)':'rgba(255,255,255,.08)',fontSize:8,color:day.getMonth()===anchor.getMonth()?'#39343a':'rgba(57,52,58,.35)'}}>{day.getDate()}</button>)}</div>}

      <aside className={styles.intelRail}><div className={styles.intelCard}><h3>CALENDAR INTELLIGENCE</h3><button className={styles.intelButton} onClick={()=>openGlow('Rearrange my day. Show me the proposal and tradeoffs before moving anything.')}><Move/>Rearrange my day</button><button className={styles.intelButton} onClick={()=>openGlow('Protect the time I am looking at. Tell me what would need to move and ask before changing it.')}><ShieldCheck/>Protect this time</button><button className={styles.intelButton} onClick={()=>openGlow('Find a better time for the selected commitment using my real calendar.')}><Clock3/>Find a better time</button><button className={styles.intelButton} onClick={()=>openGlow('Compare my schedule options and explain the tradeoffs.')}><GitCompare/>Compare schedules</button><button className={styles.intelButton} onClick={()=>openGlow('Show hidden preparation required by the commitments on this calendar.')}><ListTree/>Show hidden preparation</button></div><div className={styles.monthCard}><div className={styles.monthHeader}><strong>{anchor.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</strong><span>‹ ›</span></div><div className={styles.monthGrid}>{['M','T','W','T','F','S','S'].map((label,index)=><b key={`${label}-${index}`}>{label}</b>)}{miniDays.map((day)=><button key={day.toISOString()} className={`${styles.monthDay} ${sameDay(day,anchor)?styles.active:''}`} onClick={()=>setAnchor(day)} style={{border:0,backgroundColor:'transparent',fontSize:6}}>{day.getDate()}</button>)}</div><div className={styles.legend}><span><i/>Focus</span><span><i/>Personal</span><span><i/>Meeting</span><span><i/>Preparation</span></div></div></aside>

      <div className={styles.bottom}><div className={styles.bottomPanel}><h3>DAY INSIGHTS · {anchor.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}).toUpperCase()}</h3><div className={styles.insightGrid}><div className={styles.focusRing} style={{'--focus':`${focusPercent}%`} as CSSProperties}><b>{focusPercent}%</b></div><div className={styles.breakdown}><span>Focus <b>{Math.round(focusMinutes/60*10)/10}h</b></span><span>Meetings <b>{Math.round(meetingMinutes/60*10)/10}h</b></span><span>Personal <b>{Math.round(personalMinutes/60*10)/10}h</b></span><span>Free time <b>{Math.round(freeMinutes/60*10)/10}h</b></span></div></div></div><div className={styles.bottomPanel}><h3>PREPARATION SHADOWS</h3><div className={styles.prepList}>{prepEvents.length?prepEvents.map((event)=><div className={styles.prepItem} key={event.id}><i className={styles.prepDot}/><span><b>{event.title} · {timeLabel(new Date(event.startAt))}</b><small>{event.description?.split('\n').filter(Boolean).slice(0,2).join(' · ')}</small></span><span>{minutes(event)}m</span></div>):<p className={styles.empty}>No explicit preparation notes are stored for this day. Glow will not invent them.</p>}</div></div><div className={styles.bottomPanel}><h3>OPEN TIME</h3><div className={styles.openTime}><div><span className={styles.empty}>Tomorrow</span><strong>{Math.floor(openMinutes/60)}h {openMinutes%60}m</strong><p>{openMinutes>=180?'A softer window is available.':'Open time is limited.'}</p></div><button className={styles.findButton} onClick={()=>openGlow('Find the best open time tomorrow for something that needs focused attention.')}>Find best time</button></div></div></div>
    </section>
  </PlanInstrumentChrome>;
}
