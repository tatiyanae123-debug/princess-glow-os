'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowRight, Battery, CalendarDays, Check, Circle, Clock3, Droplets, Dumbbell, Flame, Gauge, HeartPulse, Play, Plus, Sparkles } from 'lucide-react';
import { WORKOUT_SPLIT, type Weekday } from '@/lib/glow-content/library';
import type { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import type { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';

type Event = Awaited<ReturnType<typeof getCalendarEventsByUser>>[number];
type Wellness = Awaited<ReturnType<typeof getWellnessEntriesByUser>>[number];
const fitnessWords = /workout|gym|training|fitness|pilates|yoga|run|walk|cardio|mobility|strength/i;

export function FitnessStudio({ events, wellness }: { events: Event[]; wellness: Wellness[] }) {
  const [sessionActive, setSessionActive] = useState(false);
  const [completed, setCompleted] = useState<number[]>([]);
  const now = new Date();
  const day = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as Weekday;
  const template = WORKOUT_SPLIT.find((item) => item.day === day) ?? WORKOUT_SPLIT[0];
  const fitnessEvents = useMemo(() => events.filter((event) => fitnessWords.test(`${event.title} ${event.description ?? ''}`)), [events]);
  const todayEvent = fitnessEvents.find((event) => new Date(event.startAt).toDateString() === now.toDateString());
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - ((now.getDay() + 6) % 7)); weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 7);
  const thisWeek = fitnessEvents.filter((event) => new Date(event.startAt) >= weekStart && new Date(event.startAt) < weekEnd);
  const latest = wellness[0];
  const title = todayEvent?.title ?? `${template.focus} Training`;
  const duration = todayEvent?.endAt ? Math.max(1, Math.round((new Date(todayEvent.endAt).getTime() - new Date(todayEvent.startAt).getTime()) / 60000)) : null;
  const plan = template.exercises;
  const toggle = (index: number) => setCompleted((items) => items.includes(index) ? items.filter((item) => item !== index) : [...items, index]);
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const eventDays = new Set(thisWeek.map((event) => (new Date(event.startAt).getDay() + 6) % 7));

  return <div className="editorial-page fitness-page">
    <header className="fitness-heading">
      <div><h1>Fitness Studio <Dumbbell /></h1><p>Strong body, strong mind, strong glow.</p></div>
    </header>
    <nav className="fitness-tabs" aria-label="Fitness sections">{['Today', 'Workouts', 'Programs', 'Progress', 'Body Stats', 'Mobility', 'Recovery', 'Challenges'].map((item, index) => <button className={index === 0 ? 'active' : ''} key={item}>{item}</button>)}</nav>

    <div className="fitness-layout">
      <main>
        <section className="fitness-hero">
          <div className="fitness-hero-copy">
            <span>TODAY&apos;S WORKOUT</span><h2>{title}</h2>
            <p>{todayEvent ? 'Scheduled in your real Glow OS calendar.' : 'Today’s Glow OS training template — no completed session is recorded yet.'}</p>
            <dl>
              <div><dt><Dumbbell /> Focus</dt><dd>{template.focus}</dd></div>
              <div><dt><Clock3 /> Duration</dt><dd>{duration ? `${duration} min` : 'Not recorded'}</dd></div>
              <div><dt><Activity /> Exercises</dt><dd>{plan.length || 'Rest day'}</dd></div>
              <div><dt><Gauge /> Intensity</dt><dd>Not recorded</dd></div>
            </dl>
            <button onClick={() => setSessionActive(true)} disabled={sessionActive || plan.length === 0}>{sessionActive ? 'Session in progress' : 'Start Workout'} <Play /></button>
          </div>
          <div className="fitness-hero-image"><img src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1400&q=85" alt="Warm, private strength training studio" /><blockquote>Discipline<br/>Dedication<br/>Transformation</blockquote></div>
        </section>

        <div className="fitness-workspace">
          <section className="exercise-plan">
            <header><div><b>TODAY&apos;S PLAN</b><small>{sessionActive ? 'Session progress is local until workout persistence is connected.' : 'Start the workout to check off this session.'}</small></div><span>{completed.length}/{plan.length}</span></header>
            {plan.length ? plan.map((exercise, index) => <button key={exercise} onClick={() => sessionActive && toggle(index)} className={completed.includes(index) ? 'done' : ''} aria-label={`${completed.includes(index) ? 'Unmark' : 'Mark'} ${exercise}`}>
              <i>{index + 1}</i><span><b>{exercise}</b><small>Sets, reps, load, and rest are not stored</small></span>{completed.includes(index) ? <Check /> : <Circle />}
            </button>) : <div className="fitness-empty"><span>☁</span><b>Recovery day</b><p>No exercises are assigned in today’s training template.</p></div>}
            <Link href="/calendar"><CalendarDays /> Review workout schedule</Link>
          </section>

          <section className="muscle-focus">
            <header><b>MUSCLE FOCUS</b><small>Illustrative focus map from today’s Glow OS template</small></header>
            <div className="body-map"><div className="body-figure front"><i className="head"/><i className="torso"/><i className="arm left"/><i className="arm right"/><i className="leg left"/><i className="leg right"/></div><div className="body-figure back"><i className="head"/><i className="torso"/><i className="arm left"/><i className="arm right"/><i className="leg left"/><i className="leg right"/></div></div>
            <ul><li><i className="rose"/> {template.focus}</li><li><i/> Detailed muscle groups not stored</li></ul>
            <aside><Sparkles /><p><b>FITNESS INTELLIGENCE</b>{thisWeek.length ? `You have ${thisWeek.length} fitness ${thisWeek.length === 1 ? 'block' : 'blocks'} on your calendar this week.` : 'No training sessions are recorded on this week’s calendar yet.'}</p></aside>
          </section>
        </div>

        <div className="fitness-lower">
          <section><b>THIS WEEK</b><div className="week-summary"><strong>{thisWeek.length}<small>Scheduled</small></strong><strong>{completed.length}<small>Current session</small></strong><strong>—<small>Calories</small></strong><strong>—<small>Avg. intensity</small></strong></div></section>
          <section className="progress-moments"><b>PROGRESS MOMENTS</b><div><Plus /><p>No progress photos or measurements are stored.</p></div></section>
          <section><b>PROGRAM PROGRESS</b><div className="fitness-empty compact"><p>No connected training program.</p><Link href="/planning">Plan training <ArrowRight /></Link></div></section>
        </div>
      </main>

      <aside className="fitness-rail">
        <section><h2>WEEKLY ACTIVITY</h2><div className="rail-feature"><Flame /><strong>{thisWeek.length}<small>scheduled workouts</small></strong></div><div className="fitness-bar"><i style={{width:`${Math.min(100, thisWeek.length / 6 * 100)}%`}}/></div><div className="fitness-week">{weekDays.map((label, index) => <span key={`${label}${index}`}><i className={eventDays.has(index) ? 'active' : ''}>{eventDays.has(index) && <Check />}</i><small>{label}</small></span>)}</div></section>
        <section><h2>BODY STATS</h2><div className="unsupported"><Activity /><b>No measurements connected</b><p>Weight, body fat, muscle mass, and measurements will appear only when persisted.</p></div></section>
        <section><h2>RECOVERY STATUS</h2><div className="recovery-open"><HeartPulse /><strong>—</strong><span>Not recorded</span></div><p><Battery /> Energy <b>{latest?.energy ?? 'No check-in'}</b></p><p><Clock3 /> Sleep <b>{latest?.sleepHours != null ? `${latest.sleepHours}h` : 'No data'}</b></p><Link href="/wellness">Wellness check-in <ArrowRight /></Link></section>
        <section><h2>HYDRATION</h2><div className="rail-feature"><Droplets /><strong>{latest?.waterGlasses ?? '—'}<small>glasses latest check-in</small></strong></div><div className="water-drops">{Array.from({length:8},(_, index)=><Droplets key={index} className={latest?.waterGlasses != null && index < latest.waterGlasses ? 'filled' : ''}/>)}</div><Link href="/wellness">Update hydration <Plus /></Link></section>
      </aside>
    </div>
  </div>;
}
