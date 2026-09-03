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

type Panel = 'search'|'what-now'|'energy'|'priorities'|'routines'|'saint'|'moment'|'focus'|'profile'|'replan'|null;
type ScheduleItem = { label:string; time:string; title:string; duration:string; note:string; href:string; sourceId?:string };
type SearchResult = { kind:'Task'|'Event'|'Routine'; title:string; href:string; activeObject:string };

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
function titleSize(title:string,base=1.68,min=1.05){const amount=Math.max(0,title.length-20);return `${Math.max(min,base-amount*.017)}cqw`;}
function hotspot(left:number,top:number,width:number,height:number):CSSProperties{return{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`};}

function Hotspot({label,style,onClick}:{label:string;style:CSSProperties;onClick:()=>void}){
  return <button type="button" aria-label={label} title={label} onClick={onClick} style={style} className="absolute z-30 rounded-[1cqw] bg-transparent outline-none transition hover:bg-white/[.055] focus-visible:ring-2 focus-visible:ring-[#bd948d] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"/>;
}
function DataLine({left,top,width,height=3.1,children,className=''}:{left:number;top:number;width:number;height?:number;children:ReactNode;className?:string}){
  return <div className={`absolute z-20 flex items-center overflow-hidden ${className}`} style={{left:`${left}%`,top:`${top}%`,width:`${width}%`,height:`${height}%`,background:'linear-gradient(90deg,rgba(255,248,244,.90),rgba(255,248,244,.77) 86%,rgba(255,248,244,0))',WebkitMaskImage:'linear-gradient(90deg,#000 0%,#000 86%,transparent 100%)',maskImage:'linear-gradient(90deg,#000 0%,#000 86%,transparent 100%)',backdropFilter:'blur(2px)',WebkitBackdropFilter:'blur(2px)'}}>{children}</div>;
}
function Modal({children,onClose}:{children:ReactNode;onClose:()=>void}){
  return <div className="absolute inset-0 z-50 grid place-items-center bg-[#6f5149]/10 p-4 backdrop-blur-[3px] sm:p-6" onMouseDown={onClose}><section role="dialog" aria-modal="true" onMouseDown={event=>event.stopPropagation()} className="relative max-h-[84dvh] w-[min(92vw,590px)] overflow-y-auto overscroll-contain rounded-[28px] border border-white/80 bg-[linear-gradient(145deg,rgba(255,252,249,.96),rgba(244,226,220,.91))] p-6 text-[#312522] shadow-[0_24px_90px_rgba(92,61,52,.22),inset_0_1px_0_rgba(255,255,255,.96)] sm:p-7"><button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/55 text-xl shadow-sm">×</button>{children}</section></div>;
}
function emitGlowOpen(detail:{prompt?:string;activeObject?:string;listen?:boolean}={}){window.dispatchEvent(new CustomEvent('glow:open',{detail}));}
function emitNavigate(href:string,label:string){window.dispatchEvent(new CustomEvent('glow:navigate',{detail:{href,label}}));}
function emitRipple(label:string){window.dispatchEvent(new CustomEvent('glow:ripple',{detail:{label}}));}

export function TodayLivingCenter({tasks,events,routines,energy,mood,sleepHours}:Props){
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
  useEffect(()=>{if(focusSeconds===0){setFocusRunning(false);setReceipt('Focus block complete. The moment released its light back into Today.');emitRipple('focus-complete');}},[focusSeconds]);
  useEffect(()=>{if(!panel)return;const close=(event:KeyboardEvent)=>{if(event.key==='Escape')setPanel(null);};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close);},[panel]);
  useEffect(()=>{const ripple=()=>setRippleKey(value=>value+1);window.addEventListener('glow:ripple',ripple);return()=>window.removeEventListener('glow:ripple',ripple);},[]);
  useEffect(()=>{if(!receipt)return;const timer=window.setTimeout(()=>setReceipt(''),4200);return()=>window.clearTimeout(timer);},[receipt]);

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
  const schedule:ScheduleItem[]=useMemo(()=>{
    const next=futureTimed[0]?.event??allDay[0];
    const later=futureTimed[1]?.event??futureTimed[0]?.event;
    const tonight=futureTimed.find(item=>(item.date?.getHours()??0)>=17)?.event;
    return[
      {label:'NEXT',time:next?.timeLabel??'12:00 PM',title:next?.title??'Lunch + Call',duration:'1H 00M',note:next?.location??'Nourish & connect',href:'/calendar',sourceId:next?.id},
      {label:'LATER',time:later?.timeLabel??'2:30 PM',title:later?.title??'Creative Planning',duration:'2H 00M',note:later?.location??'Deep work',href:'/calendar',sourceId:later?.id},
      {label:'TONIGHT',time:tonight?.timeLabel??'7:00 PM',title:tonight?.title??'Wind Down',duration:'1H 00M',note:tonight?.location??'Reset & reflect',href:'/calendar',sourceId:tonight?.id},
      {label:'TOMORROW',time:'Preview',title:'A quiet glimpse',duration:'',note:'',href:'/tomorrow'},
    ];
  },[futureTimed,allDay]);

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
  function applyReplanPreview(){if(replanPreview.length)setDisplayTasks(replanPreview);setPanel(null);setReceipt('Today reorganized around priority and capacity. No external calendar change was made without approval.');emitRipple('replan-applied');}
  function openMoment(index:number){setMomentIndex(index);setPanel('moment');setReceipt(`${schedule[index].label} came into focus while Now stayed anchored.`);emitRipple('moment-focus');}
  function navigate(href:string,label:string){emitNavigate(href,label);}

  return <main className="h-[100dvh] w-full overflow-hidden bg-[#eadfd8] text-[#312522]">
    <style>{`
      @keyframes livingRipple{0%{opacity:0;transform:translate(-50%,-50%) scale(.2)}28%{opacity:.78}100%{opacity:0;transform:translate(-50%,-50%) scale(3.2)}}
      @keyframes receiptIn{0%{opacity:0;transform:translateY(8px)}100%{opacity:1;transform:translateY(0)}}
      @keyframes auraBreath{0%,100%{opacity:.38;transform:translate(-50%,-50%) scale(.96)}50%{opacity:.62;transform:translate(-50%,-50%) scale(1.035)}}
      .living-ripple{animation:livingRipple .82s cubic-bezier(.15,.72,.18,1) both}.today-receipt{animation:receiptIn .24s ease-out both}.today-live-aura{animation:auraBreath 5.6s ease-in-out infinite}.portrait-pan{overflow:hidden}
      @media(orientation:portrait){.portrait-pan{overflow-x:auto;overflow-y:hidden;scrollbar-width:none;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch}.portrait-pan::-webkit-scrollbar{display:none}.glow-stage{width:133.333dvh!important;height:100dvh!important;min-width:133.333dvh}}
      @media(prefers-reduced-motion:reduce){.living-ripple,.today-receipt,.today-live-aura{animation:none!important}}
    `}</style>
    <div className="portrait-pan flex h-full w-full items-center justify-center bg-[#eadfd8]">
      <div className="glow-stage relative shrink-0 overflow-hidden" style={{width:'min(100vw, calc(100dvh * 4 / 3))',height:'min(100dvh, calc(100vw * 3 / 4))',containerType:'inline-size'}}>
        <img src={TODAY_LIVING_CENTER_REFERENCE} alt="" aria-hidden="true" draggable={false} className="absolute inset-0 h-full w-full select-none object-cover"/>
        <div className="today-live-aura pointer-events-none absolute z-[19] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{left:'60.2%',top:'27.8%',width:'10.8%',aspectRatio:'1',background:'radial-gradient(circle,rgba(255,255,255,.85) 0 4%,rgba(255,246,240,.30) 18%,rgba(219,232,255,.13) 37%,transparent 69%)',boxShadow:'0 0 1.4cqw .15cqw rgba(255,255,255,.28)'}}/>

        <div aria-live="polite" className="absolute z-20 flex flex-col justify-center" style={{left:'3.9%',top:'5.4%',width:'30%',height:'8.1%',background:'linear-gradient(90deg,rgba(255,249,246,.94) 0%,rgba(255,249,246,.83) 72%,rgba(255,249,246,0) 100%)',WebkitMaskImage:'linear-gradient(90deg,#000 0%,#000 78%,transparent 100%)',maskImage:'linear-gradient(90deg,#000 0%,#000 78%,transparent 100%)',backdropFilter:'blur(2px)',WebkitBackdropFilter:'blur(2px)'}}><div className="whitespace-nowrap font-serif leading-none tracking-[-.035em]" style={{fontSize:'2.47cqw'}}>{greeting}</div><div className="mt-[.75cqw] font-medium tracking-[.18em]" style={{fontSize:'.72cqw'}}>{dateLabel}</div></div>
        <DataLine left={41.4} top={16.4} width={5.2} height={2.8} className="justify-center"><span className="font-medium" style={{fontSize:'.72cqw'}}>{timeLabel}</span></DataLine>
        <DataLine left={5.8} top={22.75} width={25.1} height={4.0}><span className="font-serif leading-none" style={{fontSize:titleSize(selectedTask.title)}}>{selectedTask.title}</span></DataLine>
        {displayTasks.slice(0,3).map((task,index)=>{const tops=[40.95,44.95,48.95];return <DataLine key={task.id} left={8.1} top={tops[index]} width={16.2} height={2.75}><span className="min-w-0 flex-1 truncate font-serif" style={{fontSize:'.72cqw'}}>{task.title}</span><span className="ml-[.45cqw] shrink-0" style={{fontSize:'.57cqw'}}>{taskMeta(task,index)}</span></DataLine>;})}
        <DataLine left={5.75} top={58.65} width={9.3} height={3.7}><span className="font-serif" style={{fontSize:'1.48cqw'}}>{timeRemaining}</span></DataLine>
        <DataLine left={20.4} top={58.65} width={10.2} height={3.7}><span className="font-serif" style={{fontSize:'1.48cqw'}}>{leaveReady}</span></DataLine>
        {topThree.map((task,index)=>{const lefts=[6.5,23.2,39.1];const widths=[12.6,12.5,13.1];return <DataLine key={`priority-${task.id}`} left={lefts[index]} top={80.55} width={widths[index]} height={3.0}><span className="truncate font-serif" style={{fontSize:'1.05cqw'}}>{task.title}</span></DataLine>;})}
        {topThree.map((task,index)=>{const lefts=[6.5,23.2,39.1];return <DataLine key={`impact-${task.id}`} left={lefts[index]} top={85.9} width={9.2} height={2.2}><span style={{fontSize:'.54cqw'}}>Impact: {priorityLabel(task.priority)}</span></DataLine>;})}
        {schedule.map((item,index)=>{const topSets=[{time:14.1,title:16.45,note:21.0},{time:30.5,title:32.95,note:37.65},{time:47.0,title:49.25,note:54.0},{time:62.0,title:64.2,note:0}];const p=topSets[index];return <div key={item.label}><DataLine left={82.15} top={p.time} width={11.1} height={2.2}><span style={{fontSize:'.59cqw'}}>{item.time}</span></DataLine><DataLine left={82.15} top={p.title} width={12.1} height={3.2}><span className="truncate font-serif" style={{fontSize:'1.03cqw'}}>{item.title}</span></DataLine>{p.note>0&&<DataLine left={82.15} top={p.note} width={12.2} height={2.2}><span className="truncate" style={{fontSize:'.56cqw'}}>{item.note}</span></DataLine>}</div>;})}
        {liveRoutines.slice(0,3).map((routine,index)=>{const tops=[78.55,82.7,86.85];const done=completedRoutineIds.includes(routine.id);return <DataLine key={routine.id} left={57.75} top={tops[index]} width={13.4} height={2.55}><span className={`truncate font-serif ${done?'line-through opacity-45':''}`} style={{fontSize:'.66cqw'}}>{routine.name}</span></DataLine>;})}
        {rippleKey>0&&<div key={rippleKey} className="living-ripple pointer-events-none absolute left-[60.2%] top-[27.8%] z-40 aspect-square w-[8.8cqw] rounded-full border border-white/85 shadow-[0_0_2cqw_.55cqw_rgba(255,255,255,.64),0_0_5cqw_1.2cqw_rgba(234,204,221,.30)]"/>}

        <Hotspot label="Open current focus" style={hotspot(4.0,14.7,34.5,18.8)} onClick={()=>setPanel('focus')}/>
        <Hotspot label={focusRunning?'Pause focus timer':'Start focus timer'} style={hotspot(39.2,19.8,8.2,12.2)} onClick={()=>{setFocusRunning(value=>!value);setReceipt(focusRunning?'Focus paused.':'Focus timer started.');emitRipple('focus-timer');}}/>
        <Hotspot label="What Now" style={hotspot(4.9,34.2,21.0,19.0)} onClick={()=>setPanel('what-now')}/>
        <Hotspot label="Energy and Capacity" style={hotspot(26.4,34.2,21.7,19.0)} onClick={()=>setPanel('energy')}/>
        <Hotspot label="Living Glow Aura" style={hotspot(52.2,9.0,17.2,52.5)} onClick={()=>emitGlowOpen({activeObject:'Today · Now'})}/>
        <Hotspot label="Replan My Day" style={hotspot(4.2,67.2,44.1,7.0)} onClick={previewReplan}/>
        {topThree.map((task,index)=>{const positions=[[4.1,74.7,16.4,16.2],[20.6,74.7,16.1,16.2],[36.8,74.7,16.4,16.2]] as const;const [left,top,width,height]=positions[index];return <Hotspot key={`priority-hotspot-${task.id}`} label={`Focus ${task.title}`} style={hotspot(left,top,width,height)} onClick={()=>chooseTask(task)}/>;})}
        {liveRoutines.slice(0,3).map((routine,index)=>{const tops=[77.0,81.2,85.3];return <Hotspot key={`routine-hotspot-${routine.id}`} label={`${completedRoutineIds.includes(routine.id)?'Reopen':'Complete'} ${routine.name}`} style={hotspot(54.4,tops[index],20.9,4.0)} onClick={()=>toggleRoutine(routine)}/>;})}
        <Hotspot label="View all routines" style={hotspot(54.4,89.0,20.9,2.4)} onClick={()=>navigate('/routines','Routines')}/>
        <Hotspot label="Ask Glow" style={hotspot(76.0,74.1,21.4,16.9)} onClick={()=>emitGlowOpen({activeObject:selectedTask.title})}/>
        <Hotspot label="Talk to Glow" style={hotspot(91.0,82.0,5.8,7.3)} onClick={()=>emitGlowOpen({activeObject:selectedTask.title,listen:true})}/>
        <Hotspot label="Saint" style={hotspot(87.1,92.3,6.7,6.8)} onClick={()=>setPanel('saint')}/>
        <Hotspot label="Princess profile" style={hotspot(94.0,91.6,4.8,7.6)} onClick={()=>setPanel('profile')}/>
        {schedule.map((item,index)=>{const tops=[10.4,27.1,43.4,58.7];return <Hotspot key={`moment-${item.label}`} label={item.label} style={hotspot(78.0,tops[index],18.8,14.2)} onClick={()=>openMoment(index)}/>;})}
        <Hotspot label="Search Glow OS" style={hotspot(85.7,1.0,4.0,5.7)} onClick={()=>setPanel('search')}/>
        <Hotspot label="Calendar" style={hotspot(90.5,1.0,4.0,5.7)} onClick={()=>navigate('/calendar','Plan · Calendar')}/>
        <Hotspot label="Notifications" style={hotspot(95.0,1.0,4.0,5.7)} onClick={()=>navigate('/notices','Attention Center')}/>
        <Hotspot label="Today" style={hotspot(22.5,92.5,8.0,7.2)} onClick={()=>{setReceipt('You are already in Today · The Living Center.');emitRipple('today-anchor');}}/>
        <Hotspot label="Plan" style={hotspot(33.0,92.5,8.0,7.2)} onClick={()=>navigate('/planning','Plan · The Time Observatory')}/>
        <Hotspot label="Life" style={hotspot(44.2,92.5,8.0,7.2)} onClick={()=>navigate('/world','Life · The Personal House')}/>
        <Hotspot label="Brain" style={hotspot(54.5,92.5,8.2,7.2)} onClick={()=>navigate('/brain','Brain · The Inner Universe')}/>
        <Hotspot label="Create" style={hotspot(65.0,92.5,8.4,7.2)} onClick={()=>navigate('/projects','Create · The Transformation Studio')}/>
        {focusRunning&&<div className="pointer-events-none absolute z-40 grid place-items-center rounded-full bg-white/76 font-serif shadow-[0_0_28px_rgba(255,226,219,.78)] backdrop-blur-sm" style={{left:'41.2%',top:'21.3%',width:'4.8%',aspectRatio:'1'}}><div className="text-center"><div style={{fontSize:'1.35cqw'}}>{focusMinutes}</div><div className="tracking-[.12em]" style={{fontSize:'.42cqw'}}>MIN</div></div></div>}
        {receipt&&<div aria-live="polite" className="today-receipt absolute bottom-[8.2%] left-1/2 z-40 max-w-[54%] -translate-x-1/2 rounded-full border border-white/75 bg-white/72 px-[1.15cqw] py-[.58cqw] text-center shadow-[0_10px_30px_rgba(92,64,56,.13)] backdrop-blur-xl" style={{fontSize:'.61cqw'}}>{receipt}</div>}

        {panel==='search'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">SEARCH GLOW OS</p><h2 className="mt-2 font-serif text-3xl">Cast light across your world.</h2><input autoFocus value={searchText} onChange={event=>setSearchText(event.target.value)} placeholder="Tasks, moments, routines…" className="mt-6 w-full rounded-2xl border border-[#d8c2bb] bg-white/60 px-4 py-3 outline-none focus:ring-2 focus:ring-[#cba6a0]"/><div className="mt-4 space-y-2">{searchText&&!searchResults.length&&<p className="text-sm opacity-70">No matching live items yet.</p>}{searchResults.map((result,index)=><button key={`${result.kind}-${index}`} type="button" onClick={()=>{setPanel(null);navigate(result.href,result.activeObject);}} className="block w-full rounded-xl bg-white/42 px-4 py-3 text-left transition hover:bg-white/70"><span className="mr-2 text-[10px] font-semibold tracking-[.15em] opacity-60">{result.kind.toUpperCase()}</span>{result.title}</button>)}</div></Modal>}
        {panel==='focus'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">LIVE MOMENT · NOW</p><h2 className="mt-2 font-serif text-3xl">{selectedTask.title}</h2><p className="mt-2 text-sm opacity-65">High focus · Creative work</p><div className="mt-6 flex items-center gap-6"><button type="button" onClick={()=>setFocusRunning(value=>!value)} className="grid h-28 w-28 shrink-0 place-items-center rounded-full border-2 border-[#d8bdb5] bg-white/45 shadow-[inset_0_0_30px_rgba(255,255,255,.8)]"><div><div className="font-serif text-4xl">{focusMinutes}</div><div className="text-[10px] tracking-[.18em]">MIN</div></div></button><div><p className="font-serif italic text-[#9e766e]">This is your moment.</p><p className="mt-3 text-sm leading-relaxed opacity-70">The current object stays tied to Today. Start, pause, or move deeper without losing the timeline around it.</p></div></div><div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={()=>setFocusRunning(value=>!value)} className="rounded-full bg-[#3d302c] px-5 py-2.5 text-sm text-white">{focusRunning?'Pause focus':'Start focus'}</button><button type="button" onClick={()=>navigate('/focus',selectedTask.title)} className="rounded-full border border-[#d5bdb6] bg-white/45 px-5 py-2.5 text-sm">Expand into Focus Studio</button><button type="button" onClick={()=>emitGlowOpen({prompt:`Help me focus on ${selectedTask.title}`,activeObject:selectedTask.title})} className="rounded-full border border-[#d5bdb6] bg-white/45 px-5 py-2.5 text-sm">Ask Glow</button></div></Modal>}
        {panel==='what-now'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">WHAT NOW?</p><h2 className="mt-2 font-serif text-3xl">Your next right three.</h2><div className="mt-5 space-y-3">{displayTasks.slice(0,3).map((task,index)=><button key={task.id} type="button" onClick={()=>chooseTask(task)} className="flex w-full items-center gap-3 rounded-2xl bg-white/45 px-4 py-3 text-left transition hover:bg-white/70"><span className="grid h-8 w-8 place-items-center rounded-lg bg-[#ecd9d2]">{index+1}</span><span className="min-w-0 flex-1"><span className="block font-serif text-lg">{task.title}</span><span className="text-xs opacity-60">{taskMeta(task,index)} · {priorityLabel(task.priority)} impact</span></span></button>)}</div><button type="button" onClick={()=>emitGlowOpen({prompt:'Show me what I need to do next.',activeObject:'What Now'})} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Glow to choose with me</button></Modal>}
        {panel==='energy'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">ENERGY & CAPACITY</p><h2 className="mt-2 font-serif text-3xl">How much can today hold?</h2><div className="mt-5 flex flex-col items-center gap-6 sm:flex-row"><div className="grid h-32 w-32 shrink-0 place-items-center rounded-full border-2 border-[#d9bdb5] bg-white/40 text-center"><div><div className="font-serif text-5xl">{capacity}</div><div className="font-serif">Radiant</div></div></div><div className="w-full flex-1 space-y-3">{[['Mental',capacity],['Emotional',emotional],['Physical',physical],['Creative',creative]].map(([label,value])=><div key={String(label)}><div className="mb-1 flex justify-between text-xs"><span>{label}</span><span>{value}%</span></div><div className="h-1 rounded-full bg-[#ddcec9]"><div className="h-full rounded-full bg-[#cda39c]" style={{width:`${value}%`}}/></div></div>)}</div></div>{sleepHours!=null&&<p className="mt-5 text-sm opacity-70">Last recorded sleep: {sleepHours} hours.</p>}<button type="button" onClick={()=>emitGlowOpen({prompt:'Replan the rest of today around my current capacity.',activeObject:'Energy & Capacity'})} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Glow to adapt the day</button></Modal>}
        {panel==='priorities'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">TOP 3 PRIORITIES</p><h2 className="mt-2 font-serif text-3xl">What deserves your light.</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{topThree.map((task,index)=><button type="button" key={task.id} onClick={()=>chooseTask(task)} className="rounded-2xl bg-white/42 p-4 text-left transition hover:bg-white/70"><p className="text-[10px] tracking-[.15em] opacity-60">{['CREATE','CARE','PLAN'][index]}</p><p className="mt-2 font-serif text-xl">{task.title}</p><p className="mt-2 text-xs opacity-60">Impact: {priorityLabel(task.priority)}</p></button>)}</div></Modal>}
        {panel==='routines'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">ROUTINES DUE NOW</p><h2 className="mt-2 font-serif text-3xl">Move through the pathway.</h2><div className="mt-5 divide-y divide-[#d9c8c2]">{liveRoutines.slice(0,5).map((routine,index)=>{const done=completedRoutineIds.includes(routine.id);return <button key={routine.id} type="button" onClick={()=>toggleRoutine(routine)} className="flex w-full items-center gap-3 py-3 text-left"><span className={`min-w-0 flex-1 font-serif text-lg ${done?'line-through opacity-45':''}`}>{routine.name}</span><span className="text-xs opacity-60">{[5,10,7,12,8][index]??8} MIN</span><span className={`grid h-5 w-5 place-items-center rounded-full border border-[#a9857d] ${done?'bg-[#9fa88e] text-white':''}`}>{done?'✓':''}</span></button>;})}</div><button type="button" onClick={()=>navigate('/routines','Routines')} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Open guided Routine Studio</button></Modal>}
        {panel==='replan'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">REPLAN MY DAY</p><h2 className="mt-2 font-serif text-3xl">A reversible preview, not a silent rewrite.</h2><p className="mt-3 text-sm leading-relaxed opacity-70">Glow gathered the most important unfinished work toward Now. External calendar changes still require approval.</p><div className="mt-5 space-y-2">{replanPreview.slice(0,5).map((task,index)=><div key={task.id} className="flex items-center gap-3 rounded-2xl bg-white/45 px-4 py-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#ecd9d2] text-xs">{index+1}</span><span className="min-w-0 flex-1 font-serif">{task.title}</span><span className="text-xs opacity-55">{priorityLabel(task.priority)}</span></div>)}</div><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={applyReplanPreview} className="rounded-full bg-[#3d302c] px-5 py-2.5 text-sm text-white">Use this order in Today</button><button type="button" onClick={()=>emitGlowOpen({prompt:'Help me replan the rest of today and show me the changes before committing them.',activeObject:'Replan My Day'})} className="rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Plan it with Glow</button></div></Modal>}
        {panel==='saint'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">SAINT</p><h2 className="mt-2 font-serif text-3xl">Saint is with you. ♡</h2><p className="mt-4 text-sm leading-relaxed opacity-75">His Today context remains connected to walks, routines, leave-ready timing, and the Life world without turning this room into another dashboard.</p><button type="button" onClick={()=>emitGlowOpen({prompt:'What do I need to remember for Saint today?',activeObject:'Saint'})} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Glow about Saint</button></Modal>}
        {panel==='profile'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">PRINCESS</p><h2 className="mt-2 font-serif text-3xl">Your personal layer.</h2><p className="mt-4 text-sm leading-relaxed opacity-75">Your appearance, page climates, Glow initiative, accessibility, voice, privacy, and room-specific preferences belong here without interrupting Today.</p><button type="button" onClick={()=>navigate('/settings','Settings')} className="mt-5 rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Open settings</button></Modal>}
        {panel==='moment'&&<Modal onClose={()=>setPanel(null)}><p className="text-xs font-semibold tracking-[.2em]">{schedule[momentIndex].label}</p><h2 className="mt-2 font-serif text-3xl">{schedule[momentIndex].title}</h2><p className="mt-2 text-sm">{schedule[momentIndex].time}{schedule[momentIndex].duration?` · ${schedule[momentIndex].duration}`:''}</p>{schedule[momentIndex].note&&<p className="mt-3 text-sm opacity-70">{schedule[momentIndex].note}</p>}<p className="mt-5 text-sm leading-relaxed opacity-70">This time object expanded from Today. Now stays connected behind it.</p><div className="mt-5 flex flex-wrap gap-2"><button type="button" onClick={()=>navigate(schedule[momentIndex].href,schedule[momentIndex].label)} className="rounded-full bg-[#3b2d29] px-5 py-2.5 text-sm text-white">Move into time</button><button type="button" onClick={()=>emitGlowOpen({prompt:`Help me prepare for ${schedule[momentIndex].title}`,activeObject:schedule[momentIndex].title})} className="rounded-full border border-[#d4bbb4] bg-white/50 px-5 py-2.5 text-sm">Ask Glow</button></div></Modal>}
      </div>
    </div>
  </main>;
}
