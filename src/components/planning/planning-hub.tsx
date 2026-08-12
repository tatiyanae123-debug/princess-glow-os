'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Brain, CalendarDays, Check, Lightbulb, Plus, ShoppingBag, Sparkles } from 'lucide-react';
import type { CalendarEvent, Goal, Note, Routine, Task } from '@/lib/types';

const periods = ['Today', 'This Week', 'This Month', 'Quarter', 'Year'] as const;
const resetSteps = ['Clean & Reset Home','Laundry','Groceries','Meal Prep','Planning & Review','Beauty Maintenance','Hair Care','Finances','Calendar Setup','Week Intentions'];
const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
function sameDate(a:Date,b:Date){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function monday(){const d=new Date();const day=d.getDay();d.setDate(d.getDate()-(day===0?6:day-1));d.setHours(0,0,0,0);return d}
function matches(task:Task, terms:RegExp){return terms.test(`${task.title} ${task.description||''}`.toLowerCase())}

export function PlanningHub({ tasks, events, goals, notes, routines }: { tasks:Task[]; events:CalendarEvent[]; goals:Goal[]; notes:Note[]; routines:Routine[] }) {
  const [period,setPeriod]=useState<(typeof periods)[number]>('Today');
  const [resetDone,setResetDone]=useState<number[]>([]);
  const week=useMemo(()=>Array.from({length:7},(_,i)=>{const d=monday();d.setDate(d.getDate()+i);return d}),[]);
  const open=tasks.filter(t=>t.status!=='done'&&t.status!=='cancelled');
  const top=open.filter(t=>t.priority==='urgent'||t.priority==='high').slice(0,3);
  const deadlines=open.filter(t=>t.dueDate).sort((a,b)=>(a.dueDate?.getTime()||0)-(b.dueDate?.getTime()||0)).slice(0,4);
  const shopping=open.filter(t=>matches(t,/buy|purchase|order|restock|shop/)).slice(0,4);
  const groceries=open.filter(t=>matches(t,/grocery|groceries|produce|protein|pantry|food/)).slice(0,5);
  const waiting=open.filter(t=>matches(t,/waiting|follow.?up|feedback|reply/)).slice(0,4);
  const ideas=notes.filter(n=>/idea|brain|inspiration/i.test(`${n.title} ${n.content||''}`)).slice(0,4);
  const weekEvents=events.filter(e=>e.startAt>=week[0]&&e.startAt<new Date(week[6].getTime()+86400000));
  const overdue=deadlines.filter(t=>t.dueDate&&t.dueDate<new Date()).length;
  const resetRoutine=routines.find(r=>/reset|weekly/i.test(r.name));
  const PaperModule=({title,icon,children,link,wide=false,className=''}:{title:string;icon?:React.ReactNode;children:React.ReactNode;link:string;wide?:boolean;className?:string})=><article className={`planning-paper ${wide?'wide':''} ${className}`}><h2>{icon}{title}</h2><div className="planning-paper-body">{children}</div><Link href={link}>View {title.toLowerCase()} →</Link></article>;
  const TaskRows=({items,empty}:{items:Task[];empty:string})=><>{items.map(t=><p className="planning-row" key={t.id}><i className={t.status==='done'?'done':''}>{t.status==='done'&&<Check/>}</i><span>{t.title}</span>{t.dueDate&&<time>{t.dueDate.toLocaleDateString('en',{month:'short',day:'numeric'})}</time>}</p>)}{!items.length&&<small>{empty}</small>}</>;

  return <div className="editorial-page planning-page">
    <header className="planning-heading"><div><h1>Planning</h1><p>design your days, then your destiny ♕</p></div><div><Link href="/notes"><Brain/> Brain Dump</Link><button>•••</button></div></header>
    <nav className="planning-periods">{periods.map(p=><button className={period===p?'active':''} onClick={()=>setPeriod(p)} key={p}>{p}</button>)}</nav>
    <div className="planning-layout">
      <main className="planning-board">
        <section className="planning-module-grid">
          <PaperModule title="TOP THREE" icon={<Sparkles/>} link="/tasks" className="top-three">{top.map((t,i)=><p className="rank-row" key={t.id}><b>{i+1}</b>{t.title}</p>)}{!top.length&&<small>No high-priority tasks selected.</small>}</PaperModule>
          <PaperModule title="APPOINTMENTS" icon={<CalendarDays/>} link="/calendar">{events.filter(e=>e.startAt>=new Date()).slice(0,4).map(e=><p className="planning-row" key={e.id}><i/><span>{e.title}</span><time>{e.startAt.toLocaleDateString('en',{month:'short',day:'numeric'})}</time></p>)}{!events.some(e=>e.startAt>=new Date())&&<small>No upcoming appointments.</small>}</PaperModule>
          <PaperModule title="DEADLINES" link="/tasks"><TaskRows items={deadlines} empty="No dated deadlines."/></PaperModule>
          <PaperModule title="THINGS TO BUY" icon={<ShoppingBag/>} link="/tasks"><TaskRows items={shopping} empty="No shopping tasks saved."/></PaperModule>
          <PaperModule title="GROCERIES" link="/tasks"><TaskRows items={groceries} empty="No grocery tasks saved."/></PaperModule>
          <PaperModule title="THINGS TO REMEMBER" link="/notes">{notes.slice(0,4).map(n=><p className="planning-row" key={n.id}><i/><span>{n.title}</span></p>)}{!notes.length&&<small>No notes captured yet.</small>}</PaperModule>
          <PaperModule title="WAITING ON" link="/tasks"><TaskRows items={waiting} empty="Nothing waiting on a response."/></PaperModule>
          <PaperModule title="IDEAS" icon={<Lightbulb/>} link="/notes" className="idea-paper">{ideas.map(n=><p key={n.id}>{n.title}</p>)}{!ideas.length&&<small>Your idea space is open.</small>}</PaperModule>
          <PaperModule title="MEALS TO MAKE" link="/planning" wide className="meal-plans"><div className="honest-placeholder"><span>🍽</span><b>No meal plan saved</b><small>Add meal-related tasks to populate this space.</small></div></PaperModule>
          <PaperModule title="PROJECTS TO MOVE" link="/goals" wide className="project-plans">{goals.filter(g=>g.status==='in_progress'||g.status==='not_started').slice(0,5).map(g=><div className="project-row" key={g.id}><span>{g.title}</span><i><b style={{width:`${Math.min(100,g.progress)}%`}}/></i><time>{Math.round(g.progress)}%</time></div>)}{!goals.length&&<small>No active goals or projects.</small>}</PaperModule>
        </section>
        <section className="weekly-overview"><h2>WEEKLY OVERVIEW</h2><div>{week.map((day,i)=><article className={sameDate(day,new Date())?'today':''} key={day.toISOString()}><b>{dayNames[i]}</b><time>{day.toLocaleDateString('en',{month:'short',day:'numeric'})}</time>{weekEvents.filter(e=>sameDate(e.startAt,day)).slice(0,3).map(e=><p key={e.id}><i/>{e.title}</p>)}{open.filter(t=>t.dueDate&&sameDate(t.dueDate,day)).slice(0,2).map(t=><p key={t.id}><i className="task"/>{t.title}</p>)}{!weekEvents.some(e=>sameDate(e.startAt,day))&&!open.some(t=>t.dueDate&&sameDate(t.dueDate,day))&&<small>Open day</small>}</article>)}</div></section>
        <section className="planning-insight"><b><span>AI</span> PLANNING INTELLIGENCE</b><p>{overdue?`${overdue} deadline${overdue===1?' is':'s are'} overdue. Review before adding more priorities.`:top.length>2?'Your Top Three is full. Protect time before adding another priority.':'Your plan has room for one intentional priority.'}</p><Link href="/planning">Build My Day ✨</Link></section>
      </main>
      <aside className="planning-rail">
        <section className="sunday-reset"><h2>{resetRoutine?.name?.toUpperCase() || 'SUNDAY RESET'}</h2><p>reset, realign, refocus</p><div className="reset-photo"><span>Reset<br/>Realign<br/>Refocus</span></div><div className="reset-progress"><i style={{width:`${resetDone.length*10}%`}}/><small>{resetDone.length}/10 complete</small></div>{resetSteps.map((step,i)=><button key={step} onClick={()=>setResetDone(current=>current.includes(i)?current.filter(x=>x!==i):[...current,i])}><b>{i+1}</b><span>{step}</span><i className={resetDone.includes(i)?'done':''}>{resetDone.includes(i)&&<Check/>}</i></button>)}<Link href="/routines">{resetDone.length?'Continue':'Start'} Weekly Reset ✨</Link></section>
        <div className="planning-rail-bottom"><section><h2>NOTES</h2><p>capture thoughts<br/>organise later</p><Link href="/notes"><Plus/> New Note</Link></section><section><h2>QUICK ADD</h2><Link href="/tasks">New Task</Link><Link href="/calendar">New Event</Link><Link href="/notes">New Note</Link><Link href="/routines">New Routine</Link></section></div>
      </aside>
    </div>
  </div>;
}
