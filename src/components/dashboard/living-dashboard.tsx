'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useTransition } from 'react';
import {
  BrainCircuit, CalendarDays, CheckCircle2, Circle, Droplets, Dumbbell,
  Heart, Home, ListChecks, Menu, Moon, NotebookTabs, Search, Settings,
  Sparkles, Target, Utensils, WandSparkles, X, type LucideIcon,
} from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { updateTaskAction } from '@/app/actions/tasks';
import { logHabitAction } from '@/app/actions/habits';

const BACKDROP = 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=2400&q=92';
const WATER = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=88';
const BLOSSOM = 'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=900&q=88';

type NavItem = { label:string; href:string; icon:LucideIcon };
const NAV: NavItem[] = [
  {label:'Dashboard',href:'/dashboard',icon:Home},{label:'Morning Brief',href:'/briefings/morning',icon:NotebookTabs},
  {label:'Evening Debrief',href:'/briefings/evening',icon:Moon},{label:'Calendar',href:'/calendar',icon:CalendarDays},
  {label:'Tasks',href:'/tasks',icon:ListChecks},{label:'Routines',href:'/routines',icon:Sparkles},
  {label:'Habits',href:'/habits',icon:CheckCircle2},{label:'Wellness',href:'/wellness',icon:Heart},
  {label:'Fitness',href:'/fitness',icon:Dumbbell},{label:'Food',href:'/food',icon:Utensils},
  {label:'Beauty',href:'/beauty',icon:WandSparkles},{label:'Brain',href:'/brain',icon:BrainCircuit},
  {label:'Memory',href:'/memory',icon:NotebookTabs},{label:'Timeline',href:'/timeline',icon:Target},
  {label:'All Rooms',href:'/all-rooms',icon:Sparkles},
];

function fmtTime(value: Date | null | undefined) {
  if (!value) return '—';
  return value.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
}
function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function moodLabel(value: string | number | null | undefined) {
  if (value == null) return {title:'Not logged',sub:'Check in today'};
  if (typeof value === 'number') {
    if (value >= 4) return {title:'Calm',sub:'Positive'};
    if (value >= 3) return {title:'Steady',sub:'Balanced'};
    return {title:'Tender',sub:'Go gently'};
  }
  return {title:String(value),sub:'Today'};
}
function energyPercent(value:number|string|null|undefined){
  if(value==null)return null;
  if(typeof value==='string'){
    if(value==='high')return 84;
    if(value==='medium')return 62;
    if(value==='low')return 36;
    if(value==='exhausted')return 18;
    return null;
  }
  if(value<=5)return Math.round((value/5)*100);
  if(value<=10)return Math.round((value/10)*100);
  return Math.min(100,Math.round(value));
}
function Glass({children,className=''}:{children:React.ReactNode;className?:string}){return <section className={`gd-glass ${className}`}>{children}</section>}

function DashboardNav({name,image,onClose}:{name:string;image?:string|null;onClose?:()=>void}){
  return <aside className="gd-sidebar">
    <div className="gd-brand"><Sparkles size={18}/><span>Glow OS</span>{onClose?<button onClick={onClose} aria-label="Close navigation"><X size={17}/></button>:null}</div>
    <nav>{NAV.map(({label,href,icon:Icon})=><Link key={href} href={href} onClick={onClose} className={label==='Dashboard'?'active':''}><Icon size={15}/><span>{label}</span></Link>)}</nav>
    <div className="gd-side-bottom">
      <Link href="/settings?section=profile" className="gd-profile">
        {image?<img src={image} alt="Profile"/>:<span>{name.charAt(0).toUpperCase()}</span>}
        <div><strong>{name}</strong><small>View Profile</small></div>
      </Link>
      <Link href="/focus" className="gd-focus-card"><Sparkles size={17}/><div><strong>Focus Mode</strong><small>Deep Work</small></div></Link>
      <div className="gd-side-icons"><Link href="/ambient-mode" aria-label="Ambient mode"><Moon size={16}/></Link><Link href="/settings" aria-label="Settings"><Settings size={16}/></Link></div>
    </div>
  </aside>
}

export function LivingDashboard({data,error,insight,userName,userImage}:{data:LivingDashboardData;error?:string;insight?:string|null;userName?:string;userImage?:string|null}){
  const router=useRouter();const[nameMenu,setNameMenu]=useState(false);const[pending,startTransition]=useTransition();const[busyTask,setBusyTask]=useState<string|null>(null);const[busyHabit,setBusyHabit]=useState<string|null>(null);
  const now=new Date();const name=userName??'Tatiyana';
  const tasks=data.topPriorityTasks.slice(0,5);const events=useMemo(()=>[...data.todaySchedule.events].sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,4),[data.todaySchedule.events]);
  const habits=data.habitSummary.habits.slice(0,5);const energy=energyPercent(data.wellnessToday.entry?.energy);const mood=moodLabel(data.wellnessToday.entry?.mood);const water=Math.max(0,Math.round(data.wellnessToday.entry?.waterGlasses??0));const waterGoal=10;
  const top=tasks[0]??null;const taskTotal=data.projectStatus.activeTaskCount+data.projectStatus.completedTaskCount;const taskDone=data.projectStatus.completedTaskCount;const routineCount=data.todayOverview.activeRoutines;const habitDone=data.habitSummary.completedToday;
  const dayLabel=now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
  const focusTitle=data.dailyFocus?.title||data.weekTheme.title||'Protect your peace';

  function openSearch(){document.dispatchEvent(new CustomEvent('glow:search-open'))}
  function quickAdd(module?:string){document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:module?{module}:{}}))}
  function openCustomize(){document.querySelector<HTMLButtonElement>('.glow-customize-fab')?.click()}
  function completeTask(id:string){setBusyTask(id);startTransition(async()=>{await updateTaskAction(id,{status:'done'});setBusyTask(null);router.refresh()})}
  function logHabit(id:string){setBusyHabit(id);startTransition(async()=>{await logHabitAction({habitId:id,loggedDate:dateKey(),count:1});setBusyHabit(null);router.refresh()})}

  return <div className="gd-world">
    <img className="gd-backdrop" src={BACKDROP} alt="Glow dashboard background" data-glow-image-key="dashboard-background"/>
    {error?<div className="gd-error">Some live data could not load. Confirmed data only.</div>:null}
    <div className="gd-desktop-nav"><DashboardNav name={name} image={userImage}/></div>
    <button className="gd-mobile-menu" type="button" onClick={()=>setNameMenu(true)} aria-label="Open navigation"><Menu size={18}/><span>Glow OS</span></button>
    {nameMenu?<><button className="gd-nav-scrim" onClick={()=>setNameMenu(false)} aria-label="Close navigation"/><div className="gd-mobile-drawer"><DashboardNav name={name} image={userImage} onClose={()=>setNameMenu(false)}/></div></>:null}

    <main className="gd-main">
      <header className="gd-hero">
        <div className="gd-date-pill"><CalendarDays size={15}/><span>{dayLabel}</span></div>
        <button className="gd-customize" onClick={openCustomize}><Settings size={15}/>Customize</button>
        <div className="gd-greeting"><small>Good morning,</small><h1>{name}.</h1><p>{data.greeting.message||"You're right on track. Let's make today beautiful."}</p><div><Link href="/planning" className="primary">Plan My Day</Link><Link href="/calendar?view=day">View Full Day</Link></div></div>
      </header>

      <div className="gd-layout">
        <div className="gd-center">
          <div className="gd-kpis">
            <Glass className="gd-focus"><span className="gd-mini">✧ Daily Focus</span><strong>{focusTitle}</strong><img src={BLOSSOM} alt="Blossom" data-glow-image-key="dashboard-daily-focus"/></Glass>
            <Glass><span className="gd-mini">✧ Top Priority</span><strong>{top?.title||'No priority selected'}</strong><div className="gd-progress"><i style={{width:`${top?Math.max(18,Math.min(90,top.priority==='high'?78:top.priority==='medium'?58:38)):0}%`}}/></div><small>{top?`${top.priority} priority`:'Open Tasks to choose one'}</small></Glass>
            <Glass className="gd-energy"><span className="gd-mini">✧ Energy</span><div className="gd-ring" style={{'--value':`${energy??0}%`} as React.CSSProperties}><strong>{energy==null?'—':`${energy}%`}</strong><small>{energy==null?'Not logged':energy>=75?'Good':energy>=50?'Steady':'Low'}</small></div></Glass>
            <Glass className="gd-mood"><span className="gd-mini">✧ Mood</span><div className="gd-flower">✿</div><strong>{mood.title}</strong><small>{mood.sub}</small><div className="gd-dots"><i/><i/><i/><i/><i/></div></Glass>
          </div>

          <div className="gd-middle">
            <Glass className="gd-list-card"><div className="gd-card-head"><h2>Today&apos;s Tasks</h2><Link href="/tasks">View All</Link></div><div className="gd-task-list">{tasks.length?tasks.map(task=><div key={task.id} className="gd-task-row"><button disabled={pending||busyTask===task.id} onClick={()=>completeTask(task.id)} aria-label={`Complete ${task.title}`}><Circle size={17}/></button><div><strong>{task.title}</strong><small><i/> {task.priority||'Task'}</small></div><span>{task.dueDate?fmtTime(new Date(task.dueDate)):'—'}</span><b>☆</b></div>):<div className="gd-empty">No priority tasks yet. <Link href="/tasks">Add one →</Link></div>}</div></Glass>
            <Glass className="gd-list-card"><div className="gd-card-head"><h2>Upcoming Events</h2><Link href="/calendar">View Calendar</Link></div><div className="gd-event-list">{events.length?events.map((event,index)=><Link href={`/calendar?eventId=${encodeURIComponent(event.id)}&view=day`} key={event.id} className="gd-event-row"><span>{event.allDay?'All day':fmtTime(event.startAt)}</span><div><strong>{event.title}</strong><small>{event.location||'Calendar'}</small></div><i style={{backgroundImage:`url(${index%2?WATER:BLOSSOM})`}}/></Link>):<div className="gd-empty">No upcoming events today.</div>}</div></Glass>
          </div>

          <Glass className="gd-assistant"><div className="gd-card-head"><h2>✧ Glow Assistant</h2></div><button className="gd-assistant-input" onClick={openSearch}><span>Ask Glow anything...</span><Search size={16}/></button><div className="gd-orb">✦</div><div className="gd-suggestions"><button onClick={()=>quickAdd('task')}>Optimize my schedule</button><Link href="/focus">Find focus time</Link><Link href="/food">Plan healthy meals</Link><button onClick={()=>quickAdd('note')}>Brain dump</button></div></Glass>
        </div>

        <aside className="gd-right">
          <Glass><div className="gd-card-head"><h2>✧ Today at a Glance</h2></div><div className="gd-glance"><p><ListChecks size={15}/><span>Tasks</span><strong>{taskDone} / {Math.max(taskTotal,taskDone)}</strong></p><p><CalendarDays size={15}/><span>Events</span><strong>{data.todayOverview.eventsToday}</strong></p><p><Sparkles size={15}/><span>Routines</span><strong>{routineCount}</strong></p><p><CheckCircle2 size={15}/><span>Habits</span><strong>{habitDone} / {data.habitSummary.totalHabits}</strong></p></div></Glass>
          <Glass><div className="gd-card-head"><h2>✧ Habit Progress</h2><Link href="/habits">View All</Link></div><div className="gd-habits">{habits.length?habits.map((habit,index)=><button key={habit.id} disabled={habit.completedToday||busyHabit===habit.id} onClick={()=>logHabit(habit.id)}><i style={{backgroundImage:`url(${index%2?WATER:BLOSSOM})`}}/><span><strong>{habit.name}</strong><em><b style={{width:habit.completedToday?'100%':'12%'}}/></em></span><small>{habit.completedToday?`${habit.targetCount}/${habit.targetCount}`:`0/${habit.targetCount}`}</small></button>):<div className="gd-empty">No habits configured.</div>}</div></Glass>
          <Glass><div className="gd-water-head"><h2>Water Tracker</h2><strong>{water} / {waterGoal} cups</strong></div><Link href="/wellness" className="gd-water" aria-label="Open wellness water tracker">{Array.from({length:waterGoal}).map((_,i)=><Droplets key={i} size={18} className={i<water?'filled':''}/>)}</Link></Glass>
          <Glass><div className="gd-card-head"><h2>✧ Quick Actions</h2></div><div className="gd-actions"><button onClick={()=>quickAdd('task')}><CheckCircle2/>New Task</button><button onClick={()=>quickAdd('event')}><CalendarDays/>Add Event</button><button onClick={()=>router.push('/habits')}><Heart/>Log Habit</button><button onClick={()=>quickAdd('note')}><Sparkles/>Brain Dump</button></div></Glass>
        </aside>
      </div>
      {insight?<div className="gd-insight">{insight}</div>:null}
    </main>
  </div>
}
