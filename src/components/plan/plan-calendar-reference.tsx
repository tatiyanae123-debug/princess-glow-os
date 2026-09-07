'use client';

import { useCallback, useEffect, useMemo, useState, useTransition, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import {
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Dumbbell,
  GitCompare,
  Heart,
  ListTree,
  Move,
  PencilLine,
  ShieldCheck,
  Users,
  Utensils,
} from 'lucide-react';
import { updateCalendarEventAction } from '@/app/actions/calendar-events';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import styles from './plan-calendar-reference.module.css';

const DAY=86_400_000;
type CalendarView='day'|'week'|'month';
export type PlanCalendarEvent={id:string;title:string;description:string|null;startAt:string;endAt:string|null;location:string|null;allDay:boolean;color:string|null;source:string|null};
type MoveRecord={id:string;before:{startAt:string;endAt:string|null};after:{startAt:string;endAt:string|null};title:string};

type FreeWindow={day:Date;dayIndex:number;start:Date;end:Date;minutes:number};

function startOfDay(date:Date){const value=new Date(date);value.setHours(0,0,0,0);return value;}
function startOfWeek(date:Date){const value=startOfDay(date);const offset=(value.getDay()+6)%7;value.setDate(value.getDate()-offset);return value;}
function addDays(date:Date,count:number){return new Date(date.getTime()+count*DAY);}
function sameDay(a:Date,b:Date){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
function timeLabel(date:Date){return date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function rangeLabel(start:Date,end:Date){return `${start.toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${end.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`;}
function horizonLabel(value:PlanHorizon){return value==='today'?'TODAY':value==='week'?'THIS WEEK':value==='two-weeks'?'NEXT 2 WEEKS':value==='month'?'THIS MONTH':'NEXT 3 MONTHS';}
function toneFor(event:PlanCalendarEvent){
  const text=event.title.toLowerCase();
  if(/lunch|breakfast|dinner|brunch|meal/.test(text))return'meal';
  if(/family|date|friend|personal/.test(text))return'personal';
  if(/walk|gym|workout|yoga|health|doctor/.test(text))return'wellness';
  if(/prep|prepare|review notes|brief/.test(text))return'prep';
  if(/meeting|call|sync|appointment|interview/.test(text))return'meeting';
  if(/work|client|office|shift|project/.test(text))return'work';
  return'focus';
}
function minutes(event:PlanCalendarEvent){if(event.allDay)return 0;const start=new Date(event.startAt);const end=event.endAt?new Date(event.endAt):new Date(start.getTime()+60*60_000);return Math.max(0,Math.round((end.getTime()-start.getTime())/60_000));}
function validHex(value:string|null){return Boolean(value&&/^#[0-9a-fA-F]{6}$/.test(value));}
function prepMinutes(description:string|null){if(!description)return null;const match=description.match(/(?:prep(?:aration)?|prepare)[^\d]{0,20}(\d{1,3})\s*(?:m|min|mins|minutes)/i);return match?Number(match[1]):null;}
function openGlow(prompt:string){document.dispatchEvent(new CustomEvent('glow:open',{detail:{prefill:prompt,context:{room:'Plan · Calendar'}}}));}
function iconFor(event:PlanCalendarEvent){const text=event.title.toLowerCase();if(/lunch|breakfast|dinner|brunch|meal/.test(text))return Utensils;if(/family|date|friend/.test(text))return Heart;if(/gym|workout|walk|yoga/.test(text))return Dumbbell;if(/meeting|call|sync|interview/.test(text))return Users;if(/write|design|draft|review/.test(text))return PencilLine;if(/work|office|client|project/.test(text))return BriefcaseBusiness;return Clock3;}

function mergeOccupied(events:PlanCalendarEvent[],day:Date,startHour=6,endHour=22){
  const start=new Date(day);start.setHours(startHour,0,0,0);const end=new Date(day);end.setHours(endHour,0,0,0);
  const ranges=events.filter((event)=>!event.allDay&&sameDay(new Date(event.startAt),day)).map((event)=>{
    const a=Math.max(start.getTime(),new Date(event.startAt).getTime());
    const b=Math.min(end.getTime(),event.endAt?new Date(event.endAt).getTime():a+60*60_000);
    return [a,b] as const;
  }).filter(([a,b])=>b>a).sort((a,b)=>a[0]-b[0]);
  const merged:Array<[number,number]>=[];
  for(const [a,b] of ranges){const last=merged.at(-1);if(!last||a>last[1])merged.push([a,b]);else last[1]=Math.max(last[1],b);}
  return merged;
}
function occupiedMinutes(events:PlanCalendarEvent[],day:Date){return Math.round(mergeOccupied(events,day).reduce((sum,[a,b])=>sum+(b-a),0)/60_000);}
function freeWindowForDay(events:PlanCalendarEvent[],day:Date,dayIndex=0):FreeWindow{
  const start=new Date(day);start.setHours(7,0,0,0);const end=new Date(day);end.setHours(22,0,0,0);
  const ranges=mergeOccupied(events,day,7,22);
  let cursor=start.getTime();let bestStart=cursor;let bestEnd=cursor;
  ranges.forEach(([a,b])=>{if(a-cursor>bestEnd-bestStart){bestStart=cursor;bestEnd=a;}cursor=Math.max(cursor,b);});
  if(end.getTime()-cursor>bestEnd-bestStart){bestStart=cursor;bestEnd=end.getTime();}
  return{day,dayIndex,start:new Date(bestStart),end:new Date(bestEnd),minutes:Math.max(0,Math.round((bestEnd-bestStart)/60_000))};
}

export function PlanCalendarReference({events}:{events:PlanCalendarEvent[]}){
  const router=useRouter();
  const [localEvents,setLocalEvents]=useState(events);
  const [anchor,setAnchor]=useState(()=>new Date());
  const [view,setView]=useState<CalendarView>('week');
  const [horizon,setHorizon]=useState<PlanHorizon>('week');
  const [draggingId,setDraggingId]=useState<string|null>(null);
  const [history,setHistory]=useState<MoveRecord[]>([]);
  const [historyIndex,setHistoryIndex]=useState(-1);
  const [showPrep,setShowPrep]=useState(false);
  const [isPending,startTransition]=useTransition();

  useEffect(()=>setLocalEvents(events),[events]);

  const weekStart=useMemo(()=>startOfWeek(anchor),[anchor]);
  const weekDays=useMemo(()=>Array.from({length:7},(_,index)=>addDays(weekStart,index)),[weekStart]);
  const activeEvents=useMemo(()=>localEvents.filter((event)=>{const date=new Date(event.startAt);return view==='day'?sameDay(date,anchor):view==='week'?date>=weekStart&&date<addDays(weekStart,7):date.getFullYear()===anchor.getFullYear()&&date.getMonth()===anchor.getMonth();}),[localEvents,view,anchor,weekStart]);
  const selectedDayEvents=useMemo(()=>localEvents.filter((event)=>sameDay(new Date(event.startAt),anchor)),[localEvents,anchor]);
  const weekEnd=addDays(weekStart,6);
  const focusMinutes=selectedDayEvents.filter((event)=>toneFor(event)==='focus'||toneFor(event)==='work').reduce((sum,event)=>sum+minutes(event),0);
  const meetingMinutes=selectedDayEvents.filter((event)=>toneFor(event)==='meeting').reduce((sum,event)=>sum+minutes(event),0);
  const personalMinutes=selectedDayEvents.filter((event)=>['personal','wellness','meal'].includes(toneFor(event))).reduce((sum,event)=>sum+minutes(event),0);
  const scheduledMinutes=occupiedMinutes(selectedDayEvents,anchor);
  const dayWindow=16*60;
  const freeMinutes=Math.max(0,dayWindow-scheduledMinutes);
  const focusPercent=scheduledMinutes?Math.round(focusMinutes/scheduledMinutes*100):0;
  const tomorrow=addDays(startOfDay(anchor),1);
  const tomorrowWindow=useMemo(()=>freeWindowForDay(localEvents,tomorrow),[localEvents,tomorrow.getTime()]);
  const prepEvents=selectedDayEvents.filter((event)=>Boolean(event.description?.trim())).slice(0,4);

  const monthStart=new Date(anchor.getFullYear(),anchor.getMonth(),1);const monthOffset=monthStart.getDay();const miniStart=addDays(monthStart,-monthOffset);const miniDays=Array.from({length:42},(_,index)=>addDays(miniStart,index));
  const bestWeekFree=useMemo(()=>weekDays.map((day,index)=>freeWindowForDay(localEvents,day,index)).sort((a,b)=>b.minutes-a.minutes)[0]??null,[weekDays,localEvents]);

  const dependencyPairs=useMemo(()=>view!=='week'?[]:activeEvents.flatMap((source)=>{
    const description=source.description?.toLowerCase()??'';
    if(!description)return[];
    return activeEvents.filter((target)=>target.id!==source.id&&target.title.length>3&&description.includes(target.title.toLowerCase())).slice(0,2).map((target)=>({source,target}));
  }).slice(0,5),[activeEvents,view]);

  function moveAnchor(direction:-1|1){if(view==='day')setAnchor((value)=>addDays(value,direction));else if(view==='week')setAnchor((value)=>addDays(value,direction*7));else setAnchor((value)=>new Date(value.getFullYear(),value.getMonth()+direction,1));}

  const persistPosition=useCallback((id:string,startAt:string,endAt:string|null,rollback?:{startAt:string;endAt:string|null})=>{
    startTransition(async()=>{
      const result=await updateCalendarEventAction(id,{startAt:new Date(startAt),endAt:endAt?new Date(endAt):undefined});
      if(!result?.data&&rollback){setLocalEvents((current)=>current.map((event)=>event.id===id?{...event,...rollback}:event));}
      else router.refresh();
    });
  },[router]);

  const applyRecord=useCallback((record:MoveRecord,direction:'undo'|'redo')=>{
    const target=direction==='undo'?record.before:record.after;
    const rollback=direction==='undo'?record.after:record.before;
    setLocalEvents((current)=>current.map((event)=>event.id===record.id?{...event,startAt:target.startAt,endAt:target.endAt}:event));
    persistPosition(record.id,target.startAt,target.endAt,rollback);
  },[persistPosition]);

  useEffect(()=>{
    document.dispatchEvent(new CustomEvent('glow:plan-history-state',{detail:{canUndo:historyIndex>=0,canRedo:historyIndex<history.length-1,receipt:isPending?'Saving…':historyIndex>=0?'Calendar move saved':'Live calendar'}}));
  },[historyIndex,history.length,isPending]);

  useEffect(()=>{
    const undo=()=>{if(historyIndex<0)return;const record=history[historyIndex];applyRecord(record,'undo');setHistoryIndex((value)=>value-1);};
    const redo=()=>{if(historyIndex>=history.length-1)return;const record=history[historyIndex+1];applyRecord(record,'redo');setHistoryIndex((value)=>value+1);};
    document.addEventListener('glow:plan-undo',undo);
    document.addEventListener('glow:plan-redo',redo);
    return()=>{document.removeEventListener('glow:plan-undo',undo);document.removeEventListener('glow:plan-redo',redo);};
  },[history,historyIndex,applyRecord]);

  function moveEventTo(event:PlanCalendarEvent,day:Date,clientY:number,column:HTMLElement){
    if(event.source==='google_calendar'){
      openGlow(`Simulate moving “${event.title}” to ${day.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})}. It comes from Google Calendar, so show the proposal and ask before changing the external source.`);
      return;
    }
    const rect=column.getBoundingClientRect();
    const pct=Math.max(0,Math.min(1,(clientY-rect.top)/rect.height));
    const rawMinutes=6*60+pct*16*60;
    const rounded=Math.round(rawMinutes/15)*15;
    const start=new Date(day);start.setHours(Math.floor(rounded/60),rounded%60,0,0);
    const oldStart=new Date(event.startAt);const oldEnd=event.endAt?new Date(event.endAt):null;
    const durationMs=oldEnd?Math.max(15*60_000,oldEnd.getTime()-oldStart.getTime()):60*60_000;
    const end=new Date(start.getTime()+durationMs);
    const record:MoveRecord={id:event.id,title:event.title,before:{startAt:event.startAt,endAt:event.endAt},after:{startAt:start.toISOString(),endAt:end.toISOString()}};
    const nextHistory=history.slice(0,historyIndex+1).concat(record);
    setHistory(nextHistory);setHistoryIndex(nextHistory.length-1);
    setLocalEvents((current)=>current.map((item)=>item.id===event.id?{...item,startAt:record.after.startAt,endAt:record.after.endAt}:item));
    persistPosition(event.id,record.after.startAt,record.after.endAt,record.before);
  }

  return <PlanInstrumentChrome title="PLAN · CALENDAR" subtitle="A more intentional day. See, shape, and protect your time." activeInstrument="Calendar" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)} rightReceipt={isPending?'Saving…':'Live calendar'}>
    <section className={styles.stage} aria-label="Plan calendar week">
      <div className={styles.topControls}><div className={styles.navCluster}><button onClick={()=>moveAnchor(-1)} aria-label="Previous period">‹</button><button onClick={()=>moveAnchor(1)} aria-label="Next period">›</button><button className={styles.today} onClick={()=>setAnchor(new Date())}>Today</button></div><strong className={styles.range}>{view==='day'?anchor.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'}):view==='month'?anchor.toLocaleDateString('en-US',{month:'long',year:'numeric'}):rangeLabel(weekStart,weekEnd)}</strong><div className={styles.viewCluster}>{(['day','week','month'] as CalendarView[]).map((item)=><button key={item} onClick={()=>{setView(item);setHorizon(item==='day'?'today':item==='week'?'week':'month')}} className={view===item?styles.active:undefined}>{item[0].toUpperCase()+item.slice(1)}</button>)}</div><button className="plan-calendar-icon-control" type="button" onClick={()=>{setView('month');setHorizon('month')}} aria-label="Open month calendar"><CalendarDays size={15}/></button></div>

      {view!=='month'?<div className={styles.calendarGrid}>
        <div className={styles.gridHeader} style={{gridTemplateColumns:`repeat(${view==='day'?1:7},1fr)`}}>{(view==='day'?[anchor]:weekDays).map((day)=><button type="button" key={day.toISOString()} className={sameDay(day,anchor)?'plan-calendar-day-selected':''} onClick={()=>setAnchor(day)}><span><b>{day.toLocaleDateString('en-US',{weekday:'short'})}</b>{day.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</span></button>)}</div>
        <div className={styles.timeAxis}>{[6,8,10,12,14,16,18,20,22].map((hour)=><span key={hour} style={{top:`${((hour-6)/16)*100}%`}}>{new Date(2000,0,1,hour).toLocaleTimeString('en-US',{hour:'numeric'})}</span>)}</div>
        <div className={styles.gridBody} style={{gridTemplateColumns:`repeat(${view==='day'?1:7},1fr)`}}>
          {(view==='day'?[anchor]:weekDays).map((day,index)=><div className={styles.dayColumn} key={day.toISOString()} onDragOver={(event)=>event.preventDefault()} onDrop={(drop)=>{drop.preventDefault();const event=localEvents.find((item)=>item.id===draggingId);if(event)moveEventTo(event,day,drop.clientY,drop.currentTarget);setDraggingId(null);}}>{activeEvents.filter((event)=>sameDay(new Date(event.startAt),day)).map((event)=>{const start=new Date(event.startAt);const end=event.endAt?new Date(event.endAt):new Date(start.getTime()+60*60_000);const top=event.allDay?1:Math.max(0,Math.min(95,((start.getHours()+start.getMinutes()/60-6)/16)*100));const height=event.allDay?7:Math.max(6,Math.min(45,((end.getTime()-start.getTime())/36e5/16)*100));const Icon=iconFor(event);const styleValue={top:`${top}%`,height:`${height}%`,'--event-accent':validHex(event.color)?event.color:'#8d8ee6'} as CSSProperties;return <button key={event.id} draggable={event.source!=='google_calendar'} onDragStart={()=>setDraggingId(event.id)} onDragEnd={()=>setDraggingId(null)} className={`${styles.event} plan-calendar-event`} data-tone={toneFor(event)} data-source={event.source??'glow'} style={styleValue} onClick={()=>openGlow(`Tell me what matters around “${event.title}” and show any verified preparation or schedule conflicts before changing anything.`)}><Icon className="plan-calendar-event-icon" size={13}/><span className="plan-calendar-event-copy"><b>{event.title}</b><small>{event.allDay?'All day':`${timeLabel(start)}${event.endAt?` – ${timeLabel(end)}`:''}`}</small></span></button>})}{bestWeekFree&&view==='week'&&bestWeekFree.dayIndex===index&&bestWeekFree.minutes>=120?<div className={`${styles.freeBlock} plan-calendar-free-window`} style={{top:`${Math.max(0,((bestWeekFree.start.getHours()+bestWeekFree.start.getMinutes()/60-6)/16)*100)}%`,height:`${Math.min(45,(bestWeekFree.minutes/60/16)*100)}%`}}><span>Free Time</span><small>{Math.floor(bestWeekFree.minutes/60)}h {bestWeekFree.minutes%60}m</small></div>:null}</div>)}
          {view==='week'&&dependencyPairs.length?<svg className="plan-calendar-dependencies" viewBox="0 0 700 1000" preserveAspectRatio="none" aria-label="Verified event dependencies">{dependencyPairs.map(({source,target},index)=>{const sx=((Math.max(0,Math.min(6,Math.floor((startOfDay(new Date(source.startAt)).getTime()-weekStart.getTime())/DAY)))+.5)/7)*700;const tx=((Math.max(0,Math.min(6,Math.floor((startOfDay(new Date(target.startAt)).getTime()-weekStart.getTime())/DAY)))+.5)/7)*700;const sy=Math.max(0,Math.min(1000,((new Date(source.startAt).getHours()+new Date(source.startAt).getMinutes()/60-6)/16)*1000));const ty=Math.max(0,Math.min(1000,((new Date(target.startAt).getHours()+new Date(target.startAt).getMinutes()/60-6)/16)*1000));return <path key={`${source.id}-${target.id}-${index}`} d={`M ${sx} ${sy} C ${(sx+tx)/2} ${sy}, ${(sx+tx)/2} ${ty}, ${tx} ${ty}`}/>})}</svg>:null}
        </div>
      </div>:<div className={`${styles.calendarGrid} plan-calendar-month-field`}>{miniDays.map((day)=><button key={day.toISOString()} onClick={()=>{setAnchor(day);setView('day');setHorizon('today')}} data-outside={day.getMonth()!==anchor.getMonth()?'true':'false'} data-active={sameDay(day,anchor)?'true':'false'}><span>{day.getDate()}</span><small>{localEvents.filter((event)=>sameDay(new Date(event.startAt),day)).length||''}</small></button>)}</div>}

      <aside className={styles.intelRail}><div className={styles.intelCard}><h3>CALENDAR INTELLIGENCE</h3><button className={styles.intelButton} onClick={()=>openGlow('Rearrange my day. Simulate the proposal first, show tradeoffs, and wait for approval before moving anything.')}><Move/>Rearrange my day</button><button className={styles.intelButton} onClick={()=>openGlow('Protect the time I am looking at. Tell me what would need to move and ask before changing it.')}><ShieldCheck/>Protect this time</button><button className={styles.intelButton} onClick={()=>openGlow('Find a better time for the selected commitment using my real calendar and verified constraints.')}><Clock3/>Find a better time</button><button className={styles.intelButton} onClick={()=>openGlow('Compare my real schedule options and explain the tradeoffs.')}><GitCompare/>Compare schedules</button><button className={styles.intelButton} onClick={()=>setShowPrep((value)=>!value)} data-active={showPrep?'true':'false'}><ListTree/>Show hidden preparation</button></div><div className={styles.monthCard}><div className={styles.monthHeader}><strong>{anchor.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</strong><span><button onClick={()=>setAnchor((value)=>new Date(value.getFullYear(),value.getMonth()-1,1))} aria-label="Previous month">‹</button><button onClick={()=>setAnchor((value)=>new Date(value.getFullYear(),value.getMonth()+1,1))} aria-label="Next month">›</button></span></div><div className={styles.monthGrid}>{['S','M','T','W','T','F','S'].map((label,index)=><b key={`${label}-${index}`}>{label}</b>)}{miniDays.map((day)=><button key={day.toISOString()} className={`${styles.monthDay} ${sameDay(day,anchor)?styles.active:''}`} onClick={()=>setAnchor(day)} style={{border:0,backgroundColor:'transparent',fontSize:7}}>{day.getDate()}</button>)}</div><div className={styles.legend}><span><i/>Work</span><span><i/>Focus</span><span><i/>Personal</span><span><i/>Meeting</span><span><i/>Preparation</span></div></div></aside>

      <div className={styles.bottom}><div className={styles.bottomPanel}><h3>DAY INSIGHTS · {anchor.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'}).toUpperCase()}</h3><div className={styles.insightGrid}><div className={styles.focusRing} style={{'--focus':`${focusPercent}%`} as CSSProperties}><b>{focusPercent}%</b></div><div className={styles.breakdown}><span>Focus + work <b>{Math.round(focusMinutes/60*10)/10}h</b></span><span>Meetings <b>{Math.round(meetingMinutes/60*10)/10}h</b></span><span>Personal <b>{Math.round(personalMinutes/60*10)/10}h</b></span><span>Free time <b>{Math.round(freeMinutes/60*10)/10}h</b></span><small className="plan-calendar-insight-method">Free time subtracts merged scheduled intervals from the 6 AM–10 PM view.</small></div></div></div><div className={`${styles.bottomPanel} ${showPrep?'plan-calendar-prep-active':''}`}><h3>PREPARATION SHADOWS</h3><div className={styles.prepList}>{prepEvents.length?prepEvents.map((event)=><div className={styles.prepItem} key={event.id}><i className={styles.prepDot}/><span><b>{event.title} · {timeLabel(new Date(event.startAt))}</b><small>{event.description?.split('\n').filter(Boolean).slice(0,3).join(' · ')}</small></span><span>{prepMinutes(event.description)?`${prepMinutes(event.description)}m`:'stored note'}</span></div>):<p className={styles.empty}>No explicit preparation notes are stored for this day. Glow will not invent them.</p>}</div></div><div className={`${styles.bottomPanel} plan-calendar-open-time`}><h3>OPEN TIME</h3><div className={styles.openTime}><div><span className={styles.empty}>Tomorrow</span><strong>{Math.floor(tomorrowWindow.minutes/60)}h {tomorrowWindow.minutes%60}m</strong><p>{tomorrowWindow.minutes>=180?'A softer calendar window is available.':'Calendar-only open time is limited.'}</p><small>{timeLabel(tomorrowWindow.start)} – {timeLabel(tomorrowWindow.end)}</small></div><button className={styles.findButton} onClick={()=>openGlow(`Find the best time tomorrow. The largest calendar-only opening is ${timeLabel(tomorrowWindow.start)} to ${timeLabel(tomorrowWindow.end)}; also check travel, preparation, routines and capacity before recommending it.`)}>Find best time</button></div><div className="plan-calendar-open-landscape" aria-hidden="true"/></div></div>
    </section>
  </PlanInstrumentChrome>;
}
