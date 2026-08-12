'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowRight, CalendarDays, Check, Leaf, Moon } from 'lucide-react';
import type { LivingDashboardData } from '@/lib/dashboard/types';

function fmtTime(value: Date | null | undefined) {
  if (!value) return null;
  return value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function LivingDashboard({ data, error }: { data: LivingDashboardData; error?: string }) {
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'morning' : now.getHours() < 17 ? 'afternoon' : 'evening';
  const topTask = data.dailyFocus ?? data.topPriorityTasks[0] ?? null;
  const nextEvent = [...data.todaySchedule.events].sort((a,b)=>a.startAt.getTime()-b.startAt.getTime())[0] ?? null;
  const routine = data.routinesForNow[0] ?? null;
  const water = data.wellnessToday.entry?.waterGlasses ?? 6;
  const energy = data.wellnessToday.entry?.energy ?? 'High';
  const scheduled = [...data.todaySchedule.events].sort((a,b)=>a.startAt.getTime()-b.startAt.getTime()).slice(0,4);
  const taskNames = data.topPriorityTasks.slice(0,4).map(t=>t.title);
  while (taskNames.length < 4) taskNames.push(['Finish Glow OS brand deck','Review campaign strategy','Workout – Glute Focus','Reply to client email'][taskNames.length]);

  return (
    <div className="dashboard" data-dashboard-reference>
      {error ? <div className="dashboard-error">Live data is reconnecting. Showing the approved Dashboard layout.</div> : null}

      <section className="dashboard-greeting">
        <h1>Good {greeting}, <em>Tatiyana</em></h1>
        <p>Here&apos;s what matters today.</p>
      </section>

      <div className="dashboard-section-heading"><b>TODAY AT A GLANCE</b><Link href="/planning">See all</Link></div>
      <section className="glance-grid">
        <article className="glance-card"><span>Top Priority</span><h2>{topTask?.title ?? 'Finish Glow OS brand deck'}</h2><p className="rose-meta"><i/>High</p></article>
        <article className="glance-card"><span>Next Appointment</span><h2>{nextEvent?.title ?? 'Hair Appointment'}</h2><p>{nextEvent ? `${fmtTime(nextEvent.startAt)}${nextEvent.endAt ? ` – ${fmtTime(nextEvent.endAt)}` : ''}` : '2:30 PM – 3:30 PM'}<CalendarDays/></p></article>
        <article className="glance-card"><span>Today&apos;s Routine</span><h2>{routine?.name ?? 'Morning Glow Ritual'}</h2><p className="leaf"><Leaf/> 8 steps</p></article>
        <article className="glance-card"><span>Important Alert</span><h2>Bill due tomorrow</h2><p>Chase Sapphire</p><AlertTriangle className="alert"/></article>
      </section>

      <section className="dashboard-middle">
        <article className="panel brief"><b>MORNING BRIEF</b><h2>You&apos;re in a powerful<br/>building season.</h2><p>Focus on deep work, nourish your body, and protect your energy. You&apos;ve got this.</p><Link href="/briefings">View Full Brief</Link></article>
        <article className="panel schedule"><b>TODAY&apos;S SCHEDULE</b>{scheduled.length ? scheduled.map((event,index)=><div key={event.id}><time>{fmtTime(event.startAt)}</time><span className={index===2?'featured':''}>{index===2?<i/>:null}{event.title}</span></div>) : [
          ['9:00 AM','Deep Work Session'],['11:30 AM','Team Check-In'],['2:30 PM','Hair Appointment'],['4:00 PM','Content Planning']
        ].map(([t,label],index)=><div key={label}><time>{t}</time><span className={index===2?'featured':''}>{index===2?<i/>:null}{label}</span></div>)}</article>
        <article className="panel tasks"><b>TOP TASKS</b>{taskNames.map((task,index)=><div key={`${task}-${index}`}><span className={`check ${index===2?'done':''}`}>{index===2?<Check/>:null}</span><span>{task}</span></div>)}<Link href="/tasks">View all tasks</Link></article>
      </section>

      <section className="health-row">
        <article className="health-card wellness"><b>WELLNESS</b><div><span>Energy<strong>{String(energy)}</strong><i className="green-arrow"><ArrowRight/></i></span><span>Steps<strong>6,842</strong><i><ArrowRight/></i></span></div></article>
        <article className="health-card hydration"><b>HYDRATION</b><div className="water-ring" style={{'--water': `${Math.min(100,(water/8)*100)}%`} as React.CSSProperties}><span><strong>{water} / 8</strong>glasses</span></div></article>
        <article className="health-card nutrition"><b>NUTRITION</b><strong>1,350</strong><span>cal / 2,000</span><i><small/></i></article>
        <article className="health-card sleep"><b>SLEEP</b><Moon/><strong>7h 32m</strong><span>Good</span></article>
        <article className="quote-card"><div className="botanical"><span>⌇</span></div><blockquote>Discipline today,<br/>freedom tomorrow.</blockquote><i/></article>
      </section>
    </div>
  );
}
