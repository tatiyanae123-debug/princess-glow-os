'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState, useTransition } from 'react';
import {
  ArrowRight, CalendarDays, Check, Circle, Clock3, Droplets, Dumbbell,
  Heart, Home, ListChecks, Mic, MoreHorizontal, Pause, Play, RefreshCcw,
  Settings2, Sparkles, Utensils, WandSparkles, X,
} from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { updateTaskAction } from '@/app/actions/tasks';
import { logHabitAction } from '@/app/actions/habits';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=2200&q=92';

type DayMode = 'Normal' | 'Busy' | 'Low Energy' | 'Recovery' | 'Social' | 'Workday' | 'Reset Day' | 'Travel';
type DashboardMode = 'command' | 'execution' | 'ambient';
type TimelineItem = { id:string; time:Date; title:string; kind:'event'|'task'|'routine'|'workout'|'beauty'; href:string; duration:number; meta?:string };

function fmtTime(value: Date | null | undefined) {
  if (!value) return '—';
  return value.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
}
function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function energyLabel(value:number|string|null|undefined){
  if(value==null)return 'Not logged';
  if(typeof value==='string') return value.charAt(0).toUpperCase()+value.slice(1);
  const percent=value<=5?Math.round((value/5)*100):value<=10?Math.round((value/10)*100):Math.min(100,Math.round(value));
  return percent>=75?'High':percent>=50?'Medium':'Low';
}
function minutesBetween(a:Date,b:Date){return Math.max(0,Math.round((b.getTime()-a.getTime())/60000))}
function greetingFor(hour:number){if(hour<12)return 'Good morning';if(hour<17)return 'Good afternoon';if(hour<21)return 'Good evening';return 'Good night'}
function partFor(hour:number){if(hour<10)return 'morning';if(hour<16)return 'afternoon';if(hour<20.5)return 'evening';return 'night'}
function durationLabel(minutes:number){if(minutes<60)return `${minutes} min`;const h=Math.floor(minutes/60);const m=minutes%60;return m?`${h}h ${m}m`:`${h}h`}
function openGlow(){document.dispatchEvent(new CustomEvent('glow:voice-open'))}
function quickAdd(module?:string){document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:module?{module}:{}}))}
function SoftCard({children,className=''}:{children:React.ReactNode;className?:string}){
  return <section className={`rounded-[26px] border border-[#eadfe7] bg-white/95 shadow-[0_18px_60px_rgba(73,54,72,.055)] ${className}`}>{children}</section>
}

export function LivingDashboard({data,error,insight,userName}:{data:LivingDashboardData;error?:string;insight?:string|null;userName?:string;userImage?:string|null}){
  const router=useRouter();
  const [pending,startTransition]=useTransition();
  const [busyTask,setBusyTask]=useState<string|null>(null);
  const [busyHabit,setBusyHabit]=useState<string|null>(null);
  const [dayMode,setDayMode]=useState<DayMode>('Normal');
  const [dashboardMode,setDashboardMode]=useState<DashboardMode>('command');
  const [focusSeconds,setFocusSeconds]=useState(25*60);
  const [focusRunning,setFocusRunning]=useState(false);
  const [simplified,setSimplified]=useState(false);
  const [showCommandPalette,setShowCommandPalette]=useState(false);
  const [expandedTask,setExpandedTask]=useState<string|null>(null);
  const [reflection,setReflection]=useState<string|null>(null);
  const [clock,setClock]=useState(()=>new Date());

  useEffect(()=>{
    const id=window.setInterval(()=>setClock(new Date()),60_000);
    return()=>window.clearInterval(id);
  },[]);
  useEffect(()=>{
    if(!focusRunning||focusSeconds<=0)return;
    const id=window.setInterval(()=>setFocusSeconds(value=>Math.max(0,value-1)),1_000);
    return()=>window.clearInterval(id);
  },[focusRunning,focusSeconds]);
  useEffect(()=>{if(focusSeconds===0)setFocusRunning(false)},[focusSeconds]);

  const now=clock;
  const name=userName?.split(' ')[0]||'Tatiyana';
  const hour=now.getHours()+now.getMinutes()/60;
  const part=partFor(hour);
  const tasks=data.topPriorityTasks.filter(t=>t.status!=='done').slice(0,6);
  const events=useMemo(()=>[...data.todaySchedule.events].sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()),[data.todaySchedule.events]);
  const habits=data.habitSummary.habits.slice(0,6);
  const nextEvent=events.find(e=>e.endAt.getTime()>now.getTime())??null;
  const top=tasks[0]??null;
  const focusTitle=top?.title||data.dailyFocus?.title||data.weekTheme.title||'Protect your peace';
  const completed=data.todayOverview.tasksCompletedToday+data.habitSummary.completedToday;
  const total=Math.max(1,data.todayOverview.tasksTotalToday+data.habitSummary.totalHabits);
  const dayProgress=Math.min(100,Math.round((completed/total)*100));
  const energy=energyLabel(data.wellnessToday.entry?.energy);
  const freeMinutes=nextEvent?minutesBetween(now,nextEvent.startAt):60;
  const quickMode=dayMode==='Low Energy'||dayMode==='Busy'||simplified;
  const suggestedBlock=quickMode?Math.min(15,Math.max(5,freeMinutes)):Math.min(25,Math.max(10,freeMinutes));
  const beautyCount=data.beautyToday.length;
  const workoutReady=Boolean(data.workoutOfTheDay.label||data.workoutOfTheDay.exercises.length);
  const water=Math.max(0,Math.round(data.wellnessToday.entry?.waterGlasses??0));

  const timeline=useMemo<TimelineItem[]>(()=>{
    const today=new Date(now);today.setHours(0,0,0,0);
    const items:TimelineItem[]=[];
    events.forEach(e=>items.push({id:`event-${e.id}`,time:e.startAt,title:e.title,kind:'event',href:`/calendar?eventId=${encodeURIComponent(e.id)}&view=day`,duration:Math.max(15,minutesBetween(e.startAt,e.endAt)),meta:e.location||'Calendar'}));
    tasks.slice(0,3).forEach((t,index)=>{const d=t.dueDate?new Date(t.dueDate):new Date(today.getTime()+(14+index*2)*3600000);items.push({id:`task-${t.id}`,time:d,title:t.title,kind:'task',href:'/tasks',duration:quickMode?15:25,meta:`${t.priority||'normal'} priority`})});
    data.routinesForNow.slice(0,2).forEach((r,index)=>{const d=new Date(today);d.setHours(part==='night'?20+index:part==='evening'?17+index:8+index);items.push({id:`routine-${r.id}`,time:d,title:r.name,kind:'routine',href:'/routines',duration:quickMode?10:20,meta:'Routine'});});
    if(workoutReady){const d=new Date(today);d.setHours(14);items.push({id:'workout',time:d,title:data.workoutOfTheDay.label||'Workout',kind:'workout',href:'/fitness/plan',duration:quickMode?20:30,meta:data.workoutOfTheDay.focus||'Fitness'});}
    if(beautyCount){const d=new Date(today);d.setHours(19);items.push({id:'beauty',time:d,title:'Beauty routine',kind:'beauty',href:'/beauty',duration:quickMode?15:25,meta:`${beautyCount} routine${beautyCount===1?'':'s'} ready`});}
    return items.sort((a,b)=>a.time.getTime()-b.time.getTime()).slice(0,10);
  },[events,tasks,data.routinesForNow,workoutReady,data.workoutOfTheDay.label,data.workoutOfTheDay.focus,beautyCount,quickMode,part,now]);

  const nextUp=timeline.filter(item=>item.time.getTime()>=now.getTime()).slice(0,3);
  const plannedMinutes=nextUp.reduce((sum,item)=>sum+item.duration,0)+tasks.slice(0,3).length*(quickMode?15:25);
  const availableMinutes=nextEvent?Math.max(0,minutesBetween(now,nextEvent.startAt))+180:240;
  const overbooked=Math.max(0,plannedMinutes-availableMinutes);
  const planningProgress=data.todayOverview.tasksTotalToday?Math.round((data.todayOverview.tasksCompletedToday/data.todayOverview.tasksTotalToday)*100):0;
  const pulse=[
    {label:'Planning',value:planningProgress,href:'/planning',basis:'today tasks'},
    {label:'Movement',value:workoutReady?60:20,href:'/fitness',basis:'context estimate'},
    {label:'Meals',value:part==='night'?80:55,href:'/food',basis:'context estimate'},
    {label:'Beauty',value:beautyCount?40:0,href:'/beauty',basis:'context estimate'},
    {label:'Home',value:part==='night'?65:45,href:'/home',basis:'context estimate'},
    {label:'Routines',value:data.todayOverview.activeRoutines?Math.min(100,55+data.todayOverview.activeRoutines*10):20,href:'/routines',basis:'context estimate'},
  ];
  const drivers=[top?.title,data.dailyFocus?.title,data.routinesForNow[0]?.name].filter((v,i,a):v is string=>Boolean(v)&&a.indexOf(v)===i).slice(0,3);
  const fallbackDrivers=['Protect your most important task','Complete one body-care action','Prepare tomorrow before night'];
  while(drivers.length<3)drivers.push(fallbackDrivers[drivers.length]);

  function completeTask(id:string){setBusyTask(id);startTransition(async()=>{try{await updateTaskAction(id,{status:'done'});router.refresh()}finally{setBusyTask(null)}})}
  function logHabit(id:string){setBusyHabit(id);startTransition(async()=>{try{await logHabitAction({habitId:id,loggedDate:dateKey(),count:1});router.refresh()}finally{setBusyHabit(null)}})}
  function startFocus(){setDashboardMode('execution');setFocusSeconds(Math.max(5,suggestedBlock)*60);setFocusRunning(false)}
  function finishFocus(){if(top)completeTask(top.id);setDashboardMode('command');setFocusRunning(false)}

  if(dashboardMode==='execution'){
    const mins=Math.floor(focusSeconds/60);const secs=String(focusSeconds%60).padStart(2,'0');
    return <div className="mx-auto flex min-h-[72vh] max-w-4xl items-center justify-center px-3 py-6 sm:px-4 sm:py-10">
      <div className="w-full rounded-[30px] border border-[#e7dce7] bg-white/95 p-6 text-center shadow-[0_30px_100px_rgba(75,54,78,.10)] sm:rounded-[38px] sm:p-12">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#f3eaf2] text-[#785d77]"><Sparkles size={23}/></div>
        <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#9b8599]">Execution mode</p>
        <h1 className="mt-3 font-serif text-4xl text-[#2f2830] sm:text-6xl">{focusTitle}</h1>
        <div className="mt-7 font-serif text-6xl tracking-[-.04em] text-[#2f2830] sm:text-8xl">{mins}:{secs}</div>
        <p className="mt-6 text-sm text-[#766b74]">Current step</p>
        <p className="mx-auto mt-1 max-w-xl text-base text-[#3f3740] sm:text-lg">Work only on the next clear piece. Glow will hold everything else.</p>
        {focusSeconds===0?<p className="mt-4 text-sm font-medium text-[#765f73]">Focus block complete. Mark it done or choose what comes next.</p>:null}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <button type="button" disabled={focusSeconds===0} onClick={()=>setFocusRunning(v=>!v)} className="inline-flex items-center gap-2 rounded-full bg-[#302832] px-5 py-3 text-sm font-medium text-white disabled:opacity-40">{focusRunning?<Pause size={15}/>:<Play size={15}/>} {focusRunning?'Pause':'Start'}</button>
          <button type="button" onClick={finishFocus} className="rounded-full border border-[#ded3dd] px-5 py-3 text-sm text-[#4d434d]">Done</button>
          <button type="button" onClick={openGlow} className="rounded-full border border-[#ded3dd] px-5 py-3 text-sm text-[#4d434d]">Need help</button>
          <button type="button" onClick={()=>{setDashboardMode('command');setFocusRunning(false)}} className="rounded-full border border-[#ded3dd] px-5 py-3 text-sm text-[#4d434d]">Change task</button>
        </div>
      </div>
    </div>
  }

  if(dashboardMode==='ambient'){
    return <div className="relative min-h-[70vh] overflow-hidden rounded-[28px] border border-white/60 bg-[#eee4ec] sm:rounded-[36px]">
      <img src={HERO_IMAGE} alt="Soft botanical Glow dashboard atmosphere" data-glow-image-key="dashboard-background" className="absolute inset-0 h-full w-full object-cover opacity-65"/>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,25,31,.60),rgba(31,25,31,.14))]"/>
      <div className="relative flex min-h-[70vh] max-w-3xl flex-col justify-center p-7 text-white sm:p-14">
        <p className="text-sm uppercase tracking-[.18em] text-white/75">{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}</p>
        <h1 className="mt-3 font-serif text-6xl tracking-[-.04em] sm:text-8xl">{fmtTime(now)}</h1>
        <p className="mt-6 max-w-xl font-serif text-3xl leading-tight">{completed>=total?'You’re done for now.':'Your day is moving. Keep it simple.'}</p>
        <p className="mt-3 text-base text-white/85">{nextEvent?`Next: ${nextEvent.title} at ${fmtTime(nextEvent.startAt)}`:'Nothing urgent is asking for your attention.'}</p>
        <button type="button" onClick={()=>setDashboardMode('command')} className="mt-8 w-fit rounded-full bg-white/95 px-5 py-3 text-sm font-medium text-[#3b303a]">Return to command mode</button>
      </div>
    </div>
  }

  return <div className="mx-auto max-w-[1500px] space-y-7 pb-16 sm:space-y-8">
    {error?<div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Some live data could not load. Glow is showing confirmed information only.</div>:null}

    <section className="relative overflow-hidden rounded-[28px] border border-white/70 bg-[#eadfe9] shadow-[0_26px_90px_rgba(76,52,75,.09)] sm:rounded-[36px]">
      <img src={HERO_IMAGE} alt="Soft botanical Glow dashboard atmosphere" data-glow-image-key="dashboard-right-now" className="absolute inset-0 h-full w-full object-cover opacity-38"/>
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,252,254,.99)_0%,rgba(255,252,254,.92)_55%,rgba(255,252,254,.50)_100%)]"/>
      <div className="relative grid min-h-[400px] gap-8 p-5 sm:p-9 lg:grid-cols-[1.2fr_.8fr] lg:p-12">
        <div className="flex flex-col justify-center">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#887987]"><CalendarDays size={14}/><span>{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · {fmtTime(now)}</span></div>
          <p className="mt-6 text-sm font-medium text-[#9b8294]">{greetingFor(now.getHours())}, {name}</p>
          <h1 className="mt-2 max-w-3xl font-serif text-4xl leading-[1.02] tracking-[-.035em] text-[#302833] sm:text-7xl">Here is what matters now.</h1>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[.17em] text-[#9c8698]">Your best next move</p>
          <div className="mt-2 flex flex-wrap items-end gap-3"><h2 className="font-serif text-3xl text-[#3a303a] sm:text-4xl">{focusTitle}</h2><span className="mb-1 rounded-full bg-white/80 px-3 py-1 text-xs text-[#746573]">{suggestedBlock} min</span></div>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#6f636d]">{nextEvent?`You have ${Math.max(0,freeMinutes)} minutes before ${nextEvent.title}. ${quickMode?'I’m keeping this block intentionally light.':'There is enough room for one focused win and a small buffer.'}`:'Your schedule has breathing room. Use it for one meaningful action, then reassess.'}</p>
          <div className="mt-7 flex flex-wrap gap-2"><button type="button" onClick={startFocus} className="inline-flex items-center gap-2 rounded-full bg-[#332b34] px-5 py-3 text-sm font-medium text-white"><Play size={14}/>Start now</button><button type="button" onClick={openGlow} className="inline-flex items-center gap-2 rounded-full border border-[#d9cdd8] bg-white/85 px-5 py-3 text-sm text-[#4e424d]"><Sparkles size={14}/>Ask Glow</button><button type="button" onClick={()=>setSimplified(v=>!v)} className="rounded-full border border-[#d9cdd8] bg-white/85 px-5 py-3 text-sm text-[#4e424d]">{simplified?'Restore plan':'Change my plan'}</button></div>
        </div>
        <div className="flex items-end lg:justify-end"><div className="w-full max-w-md rounded-[24px] border border-white/80 bg-white/75 p-5 backdrop-blur-xl sm:rounded-[28px]"><div className="grid grid-cols-2 gap-x-4 gap-y-5"><div><p className="text-[10px] uppercase tracking-[.12em] text-[#958791]">Energy</p><strong className="mt-1 block font-serif text-2xl text-[#3a303a]">{energy}</strong></div><div><p className="text-[10px] uppercase tracking-[.12em] text-[#958791]">Day progress</p><strong className="mt-1 block font-serif text-2xl text-[#3a303a]">{dayProgress}%</strong></div><div><p className="text-[10px] uppercase tracking-[.12em] text-[#958791]">Next event</p><strong className="mt-1 block text-sm text-[#3a303a]">{nextEvent?fmtTime(nextEvent.startAt):'Open'}</strong></div><div><p className="text-[10px] uppercase tracking-[.12em] text-[#958791]">Top priority</p><strong className="mt-1 block truncate text-sm text-[#3a303a]">{top?.title||'Choose one'}</strong></div></div><div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/85"><div className="h-full rounded-full bg-[#8d718b] transition-all" style={{width:`${dayProgress}%`}}/></div></div></div>
      </div>
    </section>

    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1">{(['Normal','Busy','Low Energy','Recovery','Social','Workday','Reset Day','Travel'] as DayMode[]).map(mode=><button key={mode} type="button" onClick={()=>setDayMode(mode)} className={`shrink-0 rounded-full px-3.5 py-2 text-xs transition ${dayMode===mode?'bg-[#382f39] text-white':'border border-[#e5dce3] bg-white text-[#6f636d]'}`}>{mode}</button>)}</div>
      <div className="flex flex-wrap gap-2"><button type="button" onClick={()=>setDashboardMode('ambient')} className="rounded-full border border-[#e5dce3] bg-white px-3.5 py-2 text-xs text-[#6f636d]">Ambient</button><button type="button" onClick={()=>setShowCommandPalette(true)} className="rounded-full border border-[#e5dce3] bg-white px-3.5 py-2 text-xs text-[#6f636d]">Command palette</button><button type="button" onClick={()=>document.querySelector<HTMLButtonElement>('.glow-customize-fab')?.click()} className="rounded-full border border-[#e5dce3] bg-white p-2 text-[#6f636d]" aria-label="Customize dashboard"><Settings2 size={15}/></button></div>
    </div>

    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,.65fr)]">
      <div className="space-y-6">
        <SoftCard className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#eee6ec] px-5 py-4 sm:px-7"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Today</p><h2 className="mt-1 font-serif text-2xl text-[#332b34]">Your living timeline</h2></div><Link href="/calendar?view=day" className="text-xs text-[#7b6777]">Full day →</Link></div>
          <div className="px-4 py-3 sm:px-7">{timeline.length?timeline.map((item,index)=>{const past=item.time.getTime()<now.getTime();return <div key={item.id} className="relative grid grid-cols-[54px_16px_minmax(0,1fr)] gap-2 py-3 sm:grid-cols-[74px_22px_minmax(0,1fr)] sm:gap-3"><div className="pt-1 text-right text-[11px] text-[#90848d] sm:text-xs">{fmtTime(item.time)}</div><div className="relative flex justify-center"><span className={`z-10 mt-1 h-3 w-3 rounded-full border-2 ${past?'border-[#88a083] bg-[#88a083]':'border-[#a88ba5] bg-white'}`}/>{index<timeline.length-1?<span className="absolute bottom-[-18px] top-4 w-px bg-[#eadfe7]"/>:null}</div><div className={`rounded-[16px] px-3 py-3 transition sm:rounded-[18px] sm:px-4 ${past?'bg-[#f8f6f7] opacity-65':'bg-[#fbf8fa]'}`}><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><strong className="block truncate text-sm font-medium text-[#413741]">{item.title}</strong><p className="mt-1 text-xs text-[#91858e]">{item.meta} · {durationLabel(item.duration)}</p></div><div className="flex flex-wrap gap-1"><Link href={item.href} className="rounded-full border border-[#e4dbe2] px-2.5 py-1.5 text-[10px] text-[#6f636d]">Open</Link>{item.kind==='task'?<button type="button" onClick={()=>completeTask(item.id.replace('task-',''))} disabled={pending||busyTask===item.id.replace('task-','')} className="rounded-full border border-[#e4dbe2] px-2.5 py-1.5 text-[10px] text-[#6f636d] disabled:opacity-40">Complete</button>:null}<button type="button" onClick={openGlow} className="rounded-full border border-[#e4dbe2] p-1.5 text-[#6f636d]" aria-label={`Ask Glow about ${item.title}`}><MoreHorizontal size={12}/></button></div></div></div></div>}):<div className="py-10 text-center text-sm text-[#90848d]">Your day is open. Add something or ask Glow what would be useful.</div>}</div>
        </SoftCard>

        <SoftCard className="p-5 sm:p-7"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Today’s 3 drivers</p><h2 className="mt-1 font-serif text-2xl text-[#332b34]">Why today matters</h2></div><button type="button" onClick={openGlow} className="text-xs text-[#7b6777]">Edit with Glow</button></div><div className="mt-5 grid gap-3 md:grid-cols-3">{drivers.map((driver,index)=><div key={`${driver}-${index}`} className="rounded-[20px] bg-[#faf7f9] p-4"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#eee4ec] text-xs font-semibold text-[#765f73]">{index+1}</span><strong className="mt-4 block text-sm text-[#403640]">{driver}</strong><p className="mt-2 text-xs leading-5 text-[#8e828b]">{index===0?'Moves your most important work forward.':index===1?'Protects consistency across the day.':'Makes tomorrow easier.'}</p></div>)}</div></SoftCard>

        <SoftCard className="p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Tasks</p><h2 className="mt-1 font-serif text-2xl text-[#332b34]">Action, not storage</h2></div><Link href="/tasks" className="text-xs text-[#7b6777]">All tasks →</Link></div><div className="mt-4 divide-y divide-[#eee7ec]">{tasks.length?tasks.map(task=><div key={task.id} className="py-3"><div className="flex items-center gap-3"><button type="button" disabled={pending||busyTask===task.id} onClick={()=>completeTask(task.id)} aria-label={`Complete ${task.title}`} className="text-[#8b7687] disabled:opacity-40"><Circle size={18}/></button><button type="button" onClick={()=>setExpandedTask(expandedTask===task.id?null:task.id)} className="min-w-0 flex-1 text-left"><strong className="block truncate text-sm text-[#403640]">{task.title}</strong><span className="text-xs text-[#90838d]">{task.priority||'normal'} priority</span></button><button type="button" onClick={startFocus} className="rounded-full border border-[#e4dbe2] px-3 py-1.5 text-[10px] text-[#6f636d]">Start</button><button type="button" onClick={openGlow} className="hidden rounded-full border border-[#e4dbe2] px-3 py-1.5 text-[10px] text-[#6f636d] sm:block">Break down</button></div>{expandedTask===task.id?<div className="ml-8 mt-3 rounded-[16px] bg-[#faf7f9] p-4 text-xs leading-5 text-[#786c75]"><p className="font-medium text-[#4a4049]">Next clear pieces</p><ol className="mt-2 list-decimal space-y-1 pl-4"><li>Define the smallest finished outcome.</li><li>Work for {quickMode?'10':'20'} focused minutes.</li><li>Review what remains and either finish or schedule it.</li></ol><button type="button" onClick={openGlow} className="mt-3 text-[#765f73]">Ask Glow for a custom breakdown →</button></div>:null}</div>):<p className="py-6 text-sm text-[#90848d]">No active priority tasks. Your attention is free.</p>}</div></SoftCard>
      </div>

      <aside className="space-y-6">
        <SoftCard className="p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Next up</p><h2 className="mt-1 font-serif text-xl text-[#332b34]">Immediate sequence</h2></div><Clock3 size={16} className="text-[#9d8898]"/></div><div className="mt-4 space-y-2">{nextUp.length?nextUp.map(item=><Link href={item.href} key={item.id} className="flex items-center gap-3 rounded-[18px] bg-[#faf7f9] p-3.5"><span className="w-14 text-xs text-[#8e808b]">{fmtTime(item.time)}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-[#403640]">{item.title}</strong><small className="text-[#91858e]">{durationLabel(item.duration)}</small></span><ArrowRight size={13} className="text-[#9d8999]"/></Link>):<p className="py-5 text-center text-xs text-[#90848d]">Nothing urgent next.</p>}</div></SoftCard>

        <SoftCard className="p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Life pulse</p><h2 className="mt-1 font-serif text-xl text-[#332b34]">Where today stands</h2></div><Heart size={15} className="text-[#9c8297]"/></div><div className="mt-4 space-y-3">{pulse.map(item=><Link href={item.href} key={item.label} className="block" title={item.basis==='today tasks'?'Based on today’s logged tasks':'Contextual estimate until richer tracking data is available'}><div className="flex justify-between text-xs"><span className="text-[#6f636d]">{item.label}</span><span className="text-[#8f818c]">{item.value}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#f0e9ee]"><div className="h-full rounded-full bg-[#9b8197]" style={{width:`${item.value}%`}}/></div></Link>)}</div><p className="mt-4 rounded-[16px] bg-[#faf7f9] p-3 text-xs leading-5 text-[#7b6f78]">{part==='evening'||part==='night'?'Anything unfinished can stay in its natural evening window. You do not need every meter at 100%.':'Planning uses logged task data. Other pulse areas are contextual until their detailed trackers report completion.'}</p></SoftCard>

        <SoftCard className="p-5"><div className="flex items-center gap-2"><Sparkles size={15} className="text-[#8e7188]"/><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Glow noticed</p></div><p className="mt-4 font-serif text-xl leading-7 text-[#403640]">{overbooked?`You have about ${durationLabel(overbooked)} more planned than your current window comfortably holds.`:nextEvent?`Your next event is ${nextEvent.title}. You still have room for one focused win before it.`:'Your schedule has breathing room. Protect it instead of filling every gap.'}</p><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={()=>setSimplified(true)} className="rounded-full bg-[#372e38] px-4 py-2 text-xs text-white">✦ Make my day easier</button><button type="button" onClick={openGlow} className="rounded-full border border-[#e4dbe2] px-4 py-2 text-xs text-[#6f636d]">Ask why</button></div>{simplified?<div className="mt-4 rounded-[18px] bg-[#f8f3f7] p-4 text-xs leading-5 text-[#746873]"><strong className="block text-[#453a44]">Simplified mode is active.</strong><span>Glow is showing shorter routines, fewer priorities, and more buffer. Nothing has been deleted or moved permanently.</span></div>:null}</SoftCard>
      </aside>
    </div>

    <section className="grid gap-6 lg:grid-cols-2">
      <SoftCard className="p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Ask or add anything</p><h2 className="mt-1 font-serif text-2xl text-[#332b34]">Universal capture</h2></div><button type="button" onClick={openGlow} className="inline-flex items-center gap-2 rounded-full bg-[#372e38] px-4 py-2.5 text-xs text-white"><Mic size={13}/>Speak to Glow</button></div><button type="button" onClick={openGlow} className="mt-5 flex w-full items-center justify-between gap-3 rounded-[22px] border border-[#e4dbe2] bg-[#fcfafb] px-4 py-4 text-left text-sm text-[#8f828c] sm:px-5"><span>Remind me, move something, log spending, remember something, ask anything…</span><Sparkles size={16} className="shrink-0"/></button><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={()=>quickAdd('task')} className="rounded-full border border-[#e4dbe2] px-3 py-2 text-xs text-[#6f636d]">+ Task</button><button type="button" onClick={()=>quickAdd('event')} className="rounded-full border border-[#e4dbe2] px-3 py-2 text-xs text-[#6f636d]">+ Event</button><button type="button" onClick={()=>quickAdd('note')} className="rounded-full border border-[#e4dbe2] px-3 py-2 text-xs text-[#6f636d]">Brain dump</button></div></SoftCard>

      <SoftCard className="p-5 sm:p-7"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Time reality check</p><h2 className="mt-1 font-serif text-2xl text-[#332b34]">Is today realistic?</h2></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-[18px] bg-[#faf7f9] p-4"><p className="text-[10px] text-[#958992]">Available</p><strong className="mt-2 block font-serif text-2xl text-[#3c333c]">{durationLabel(availableMinutes)}</strong></div><div className="rounded-[18px] bg-[#faf7f9] p-4"><p className="text-[10px] text-[#958992]">Planned</p><strong className="mt-2 block font-serif text-2xl text-[#3c333c]">{durationLabel(plannedMinutes)}</strong></div><div className="rounded-[18px] bg-[#faf7f9] p-4"><p className="text-[10px] text-[#958992]">Difference</p><strong className="mt-2 block font-serif text-2xl text-[#3c333c]">{overbooked?`+${durationLabel(overbooked)}`:'Balanced'}</strong></div></div><button type="button" onClick={()=>setSimplified(true)} className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-[#7a6375]"><RefreshCcw size={12}/>Fix my day</button></SoftCard>
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
      <SoftCard className="p-5 sm:p-7"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Momentum</p><h2 className="mt-1 font-serif text-2xl text-[#332b34]">Small wins count</h2></div><span className="rounded-full bg-[#f0e8ef] px-3 py-1 text-xs text-[#745f70]">{completed} actions complete</span></div><div className="mt-5 flex gap-2 overflow-x-auto pb-1">{habits.length?habits.map(habit=>{const pct=Math.min(100,Math.round((habit.currentCount/Math.max(1,habit.targetCount))*100));return <button type="button" key={habit.id} onClick={()=>logHabit(habit.id)} disabled={habit.completedToday||busyHabit===habit.id} className="min-w-[150px] rounded-[18px] border border-[#e9e0e6] bg-[#fbf9fa] p-3 text-left disabled:opacity-60"><div className="flex items-center justify-between"><span className="text-xs font-medium text-[#4c414b]">{habit.name}</span>{habit.completedToday?<Check size={13} className="text-[#6f8a68]"/>:<Circle size={13} className="text-[#a18e9d]"/>}</div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#eee7ec]"><div className="h-full rounded-full bg-[#998195]" style={{width:`${pct}%`}}/></div><span className="mt-2 block text-[10px] text-[#958992]">{habit.currentCount}/{Math.max(1,habit.targetCount)}</span></button>}):<p className="text-sm text-[#90848d]">No habits configured yet.</p>}</div><p className="mt-4 text-xs text-[#7f737c]">{habits.filter(h=>!h.completedToday).length<=2?'Only a couple of easy wins remain.':'Keep your momentum. You do not need to finish everything at once.'}</p></SoftCard>

      <SoftCard className="p-5 sm:p-7"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Relevant right now</p><h2 className="mt-1 font-serif text-2xl text-[#332b34]">Rooms worth opening</h2></div><div className="mt-4 grid grid-cols-2 gap-3"><Link href="/beauty" className="rounded-[18px] bg-[#faf5f8] p-4"><WandSparkles size={16} className="text-[#9c708c]"/><strong className="mt-3 block text-sm text-[#463a43]">Beauty</strong><span className="text-xs text-[#91858d]">{beautyCount?`${beautyCount} routine${beautyCount===1?'':'s'} ready`:'Plan tonight'}</span></Link><Link href="/fitness" className="rounded-[18px] bg-[#f6f8fb] p-4"><Dumbbell size={16} className="text-[#78879a]"/><strong className="mt-3 block text-sm text-[#463a43]">Fitness</strong><span className="text-xs text-[#91858d]">{workoutReady?'Workout ready':'Open movement'}</span></Link><Link href="/food" className="rounded-[18px] bg-[#f8f8f3] p-4"><Utensils size={16} className="text-[#88916f]"/><strong className="mt-3 block text-sm text-[#463a43]">Food</strong><span className="text-xs text-[#91858d]">Next meal + groceries</span></Link><Link href="/home" className="rounded-[18px] bg-[#f9f6f2] p-4"><Home size={16} className="text-[#9a856e]"/><strong className="mt-3 block text-sm text-[#463a43]">Home</strong><span className="text-xs text-[#91858d]">Quick reset</span></Link></div></SoftCard>
    </section>

    <section className="grid gap-6 lg:grid-cols-3"><SoftCard className="p-5"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Quick win</p><h3 className="mt-2 font-serif text-xl text-[#3b313a]">You have {Math.max(5,Math.min(15,freeMinutes))} useful minutes.</h3><p className="mt-3 text-xs leading-5 text-[#82767f]">Pick one tiny action, then stop. A small completed loop is better than opening five new ones.</p><button type="button" onClick={startFocus} className="mt-4 text-xs font-medium text-[#786272]">Do it →</button></SoftCard><SoftCard className="p-5"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">This week</p><h3 className="mt-2 font-serif text-xl text-[#3b313a]">{data.weekTheme.title}</h3><p className="mt-3 text-xs leading-5 text-[#82767f]">{data.weekTheme.note}</p><Link href="/planning" className="mt-4 inline-block text-xs font-medium text-[#786272]">Open weekly direction →</Link></SoftCard><SoftCard className="p-5"><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Tomorrow</p><h3 className="mt-2 font-serif text-xl text-[#3b313a]">Prepare before you close today.</h3><p className="mt-3 text-xs leading-5 text-[#82767f]">Outfit, essentials, first priority, and morning start. Keep tomorrow from becoming a morning decision pile.</p><Link href="/planning?view=tomorrow" className="mt-4 inline-block text-xs font-medium text-[#786272]">Prepare tomorrow →</Link></SoftCard></section>

    {(part==='evening'||part==='night')?<SoftCard className="p-6 sm:p-8"><div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center"><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9b8796]">Close your day</p><h2 className="mt-2 font-serif text-3xl text-[#342b34]">Finish gently, not perfectly.</h2><p className="mt-3 text-sm text-[#81747e]">{data.todayOverview.tasksCompletedToday} tasks completed · {water} cups of water · {data.habitSummary.completedToday} habits logged.</p></div><div className="flex flex-wrap gap-2"><Link href="/routines" className="rounded-full bg-[#352d36] px-5 py-3 text-sm text-white">Start night routine</Link><button type="button" onClick={()=>setReflection('open')} className="rounded-full border border-[#e3d9e1] px-5 py-3 text-sm text-[#665965]">Finish day</button></div></div>{reflection?<div className="mt-6 border-t border-[#eee6ec] pt-6"><p className="text-sm font-medium text-[#4c414a]">How was today?</p><div className="mt-3 flex flex-wrap gap-2">{['😍 Great','🙂 Good','😐 Okay','😞 Hard'].map(option=><button type="button" key={option} onClick={()=>setReflection(option)} className={`rounded-full px-4 py-2 text-sm ${reflection===option?'bg-[#382f39] text-white':'border border-[#e4dbe2] text-[#6f636d]'}`}>{option}</button>)}</div><button type="button" onClick={openGlow} className="mt-4 text-xs text-[#7b6576]">Tell Glow anything it should remember about today →</button></div>:null}</SoftCard>:null}

    {insight?<div className="rounded-[22px] border border-[#e7dde5] bg-[#faf7f9] px-5 py-4 text-sm text-[#776a74]">{insight}</div>:null}

    {showCommandPalette?<div className="fixed inset-0 z-[120] flex items-start justify-center bg-[#221b22]/25 px-3 pt-[8vh] backdrop-blur-sm sm:px-4 sm:pt-[12vh]" onMouseDown={e=>{if(e.target===e.currentTarget)setShowCommandPalette(false)}}><div className="max-h-[80vh] w-full max-w-xl overflow-y-auto rounded-[24px] border border-white/80 bg-white shadow-[0_35px_120px_rgba(58,42,58,.22)] sm:rounded-[28px]"><div className="sticky top-0 flex items-center justify-between border-b border-[#eee7ec] bg-white px-5 py-4"><div><p className="text-[10px] uppercase tracking-[.15em] text-[#9a8795]">Glow command palette</p><h2 className="mt-1 font-serif text-2xl text-[#362d36]">What do you want to do?</h2></div><button type="button" onClick={()=>setShowCommandPalette(false)} className="rounded-full p-2 text-[#82737f]" aria-label="Close command palette"><X size={17}/></button></div><div className="grid gap-2 p-4">{[
      ['Start a routine','/routines',Sparkles],['Add a task','quick-task',ListChecks],['Plan tomorrow','/planning?view=tomorrow',CalendarDays],['Log spending','/finance',Droplets],['Start workout','/fitness/plan',Dumbbell],['Beauty','/beauty',WandSparkles],['Ask Glow','glow',Heart]
    ].map(([label,href,Icon])=><button type="button" key={String(label)} onClick={()=>{setShowCommandPalette(false);if(href==='quick-task')quickAdd('task');else if(href==='glow')openGlow();else router.push(String(href))}} className="flex items-center gap-3 rounded-[18px] px-4 py-3 text-left hover:bg-[#faf7f9]"><Icon size={16} className="text-[#91798c]"/><span className="flex-1 text-sm text-[#493e47]">{String(label)}</span><ArrowRight size={13} className="text-[#a395a0]"/></button>)}</div></div></div>:null}
  </div>
}
