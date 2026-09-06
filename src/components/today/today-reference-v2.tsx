'use client';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Dumbbell,
  FileText,
  Focus,
  Headphones,
  MapPin,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  SunMedium,
  Users,
  Utensils,
  Waves,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import type { PersonalEvent, PersonalRoutine, PersonalTask } from '@/lib/personal-context/types';
import styles from './today-reference-v2.module.css';

type TodayRoom = 'what-now' | 'focus' | 'meeting' | 'next-up' | 'later' | 'tonight' | 'tomorrow' | 'replan' | 'day-view';
const TARGET_ROOMS: TodayRoom[] = ['what-now', 'focus', 'meeting', 'next-up', 'later', 'tonight', 'tomorrow', 'replan', 'day-view'];

function navigateToday(room: TodayRoom, extra?: Record<string, string | null | undefined>) {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.search = '';
  url.searchParams.set('room', room);
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) url.searchParams.set(key, value);
  }
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path: `${url.pathname}${url.search}` } }));
}

function eventKey(event: PersonalEvent) {
  return `${event.source}:${event.id}`;
}

function fmtTime(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function fmtDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function eventRange(event?: PersonalEvent | null) {
  if (!event) return 'Open';
  if (event.allDay) return 'All day';
  const start = fmtTime(event.startAt);
  return event.endAt ? `${start} – ${fmtTime(event.endAt)}` : start;
}

function minutesUntil(value?: string | null) {
  if (!value) return 0;
  return Math.max(0, Math.round((new Date(value).getTime() - Date.now()) / 60000));
}

function minutesBetween(start?: string | null, end?: string | null) {
  if (!start || !end) return 45;
  return Math.max(5, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60000));
}

function durationLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function splitEventTitle(event?: PersonalEvent | null) {
  if (!event) return 'Open block';
  return event.title;
}

function Pearl({ warm = false, violet = false, className = '' }: { warm?: boolean; violet?: boolean; className?: string }) {
  return <span className={`${styles.pearl} ${warm ? styles.pearlWarm : ''} ${violet ? styles.pearlViolet : ''} ${className}`} aria-hidden="true"><i /></span>;
}

function Matter({ className = '' }: { className?: string }) {
  return <span className={`${styles.matter} ${className}`} aria-hidden="true"><i /><b /><em /><u /></span>;
}

function Glass({ className = '', children }: { className?: string; children: React.ReactNode }) {
  return <section className={`${styles.glass} ${className}`}>{children}</section>;
}

function PageTitle({ eyebrow, title, subtitle, back = false }: { eyebrow?: string; title: string; subtitle?: string; back?: boolean }) {
  return (
    <div className={styles.pageTitle}>
      {back ? <button type="button" className={styles.backLink} onClick={() => navigateToday('day-view')}><ArrowLeft size={14} /> Today</button> : null}
      {eyebrow ? <span>{eyebrow}</span> : null}
      <h1>{title}</h1>
      {subtitle ? <p>{subtitle}</p> : null}
    </div>
  );
}

function PageScene({ room, children, mood = 'day' }: { room: TodayRoom; children: React.ReactNode; mood?: 'day' | 'evening' | 'future' | 'focus' }) {
  return (
    <div className={`${styles.scene} ${styles[`mood_${mood}`]}`} data-today-v2={room}>
      <div className={styles.sceneCausticA} aria-hidden="true" />
      <div className={styles.sceneCausticB} aria-hidden="true" />
      <main className={styles.sceneCanvas}>{children}</main>
    </div>
  );
}

function ActionButton({ children, onClick, primary = false }: { children: React.ReactNode; onClick?: () => void; primary?: boolean }) {
  return <button type="button" onClick={onClick} className={`${styles.actionButton} ${primary ? styles.actionPrimary : ''}`}>{children}</button>;
}

function EventAction({ event, label = 'Open' }: { event: PersonalEvent; label?: string }) {
  return (
    <button type="button" className={styles.miniAction} onClick={() => navigateToday('meeting', { event: eventKey(event) })}>
      {label}<ArrowRight size={13} />
    </button>
  );
}

function MiniChecklist({ items }: { items: string[] }) {
  return <div className={styles.miniChecklist}>{items.map((item, index) => <span key={`${item}-${index}`}><i />{item}</span>)}</div>;
}

function WhatNowRoom({ tasks, events, wellness }: { tasks: PersonalTask[]; events: PersonalEvent[]; wellness: { energy?: string | null } | null }) {
  const nextEvent = events.find((event) => new Date(event.startAt).getTime() >= Date.now()) ?? null;
  const openTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const best = openTasks.find((task) => task.status === 'in_progress') ?? openTasks[0] ?? null;
  const candidates = [best, ...openTasks.filter((task) => task.id !== best?.id)].filter(Boolean).slice(0, 5) as PersonalTask[];
  const timeAvailable = nextEvent ? minutesUntil(nextEvent.startAt) : 45;
  const energy = wellness?.energy ? wellness.energy.charAt(0).toUpperCase() + wellness.energy.slice(1) : 'Not logged';
  const protectedMinutes = best ? Math.max(20, Math.min(55, timeAvailable || 45)) : 0;

  return (
    <PageScene room="what-now">
      <section className={styles.whatHero}>
        <PageTitle eyebrow={new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} title="What now?" subtitle="Find the next right step for today." />
        <Matter className={styles.whatMatter} />
        <div className={styles.whatPromptArea}>
          <button type="button" className={styles.askField} onClick={() => document.dispatchEvent(new CustomEvent('glow:open'))}><span>Share what’s on your mind…</span><ArrowRight /></button>
          <div className={styles.promptChips}><button onClick={() => document.dispatchEvent(new CustomEvent('glow:open'))}>I only have 30 minutes</button><button onClick={() => document.dispatchEvent(new CustomEvent('glow:open'))}>Low energy day</button><button onClick={() => navigateToday(nextEvent ? 'meeting' : 'next-up', nextEvent ? { event: eventKey(nextEvent) } : undefined)}>Prep for my meeting</button><button onClick={() => navigateToday('focus')}>Make progress</button></div>
        </div>
      </section>

      <section className={styles.whatGrid}>
        <Glass className={styles.statePanel}>
          <div className={styles.panelHeading}><strong>Your current state</strong><button type="button"><span>Reset</span><RotateCcw size={14} /></button></div>
          <button type="button" className={styles.stateRow}><span><small>Energy</small><strong>{energy}</strong><em>Good for focused work</em></span><Waves size={28} /><ArrowRight size={15} /></button>
          <button type="button" className={styles.stateRow}><span><small>Time available</small><strong>{nextEvent ? `~ ${Math.max(5, timeAvailable)} minutes` : 'Open'}</strong><em>{nextEvent ? `Until ${nextEvent.title}` : 'No immediate event pressure'}</em></span><Pearl /><ArrowRight size={15} /></button>
          <button type="button" className={styles.stateRow}><span><small>Urgency</small><strong>{best?.priority ? best.priority.charAt(0).toUpperCase() + best.priority.slice(1) : 'Low'}</strong><em>Keep momentum</em></span><Pearl warm /><ArrowRight size={15} /></button>
          <button type="button" className={styles.stateRow} onClick={() => navigateToday('focus')}><span><small>Protected focus</small><strong>{protectedMinutes ? `${protectedMinutes} min remaining` : 'Available'}</strong><em>{best?.title ?? 'Choose a focus'}</em></span><Matter className={styles.stateMatter} /><ArrowRight size={15} /></button>
          <button type="button" className={styles.stateRow}><span><small>Context</small><strong>{nextEvent?.location || 'At home'}</strong><em>{nextEvent ? 'Based on your next event' : 'Quiet work environment'}</em></span><Pearl violet /><ArrowRight size={15} /></button>
        </Glass>

        <Glass className={styles.suggestPanel}>
          <div className={styles.panelHeading}><div><strong>Suggested next actions</strong><small>Curated for your current state</small></div><button type="button"><Focus size={15} /></button></div>
          <div className={styles.suggestionList}>
            {candidates.length ? candidates.map((task, index) => (
              <button key={task.id} type="button" className={`${styles.suggestionRow} ${index === 0 ? styles.suggestionBest : ''}`} onClick={() => navigateToday('focus')}>
                <Pearl warm={index === 2} violet={index === 4} />
                <span><strong>{task.title}</strong><small>{index === 0 ? 'High impact · Fits your time · In focus' : `${task.priority} priority · Clear next step`}</small></span>
                <ArrowRight size={15} />
              </button>
            )) : <div className={styles.emptySuggestion}><Pearl /><strong>Your queue is clear.</strong><span>Ask Glow what would make today feel better.</span></div>}
          </div>
          <button type="button" className={styles.moreOptions} onClick={() => document.dispatchEvent(new CustomEvent('glow:open'))}><Sparkles size={14} />More options<ArrowRight size={14} /></button>
        </Glass>

        <div className={styles.whatRight}>
          <Glass className={styles.recommendPanel}>
            <div className={styles.recommendHeading}><span>Recommended for you</span><em>Best next step</em></div>
            <h2>{best?.title ?? 'Choose one useful next step'}</h2>
            <p>{best ? 'This fits the available window and keeps a meaningful priority moving.' : 'Your connected queue is clear, so Glow is not inventing work.'}</p>
            <Pearl className={styles.recommendPearl} />
            <MiniChecklist items={best ? [`Fits your available time (${Math.max(5, timeAvailable || 45)} min)`, 'Aligns with your focus window', `Priority: ${best.priority}`] : ['Nothing urgent is being inserted', 'Your current context stays visible', 'You can ask Glow for a fresh suggestion']} />
            <ActionButton primary onClick={() => best ? navigateToday('focus') : document.dispatchEvent(new CustomEvent('glow:open'))}>{best ? 'Start this' : 'Ask Glow'}<ArrowRight size={15} /></ActionButton>
            <div className={styles.recommendFooter}><button type="button">Save for later</button><button type="button" onClick={() => navigateToday('day-view')}>See plan</button></div>
          </Glass>
          <Glass className={styles.quoteMatter}><blockquote>“Progress today<br />creates more space<br />tomorrow.”</blockquote><Matter /></Glass>
        </div>
      </section>
    </PageScene>
  );
}

function FocusRoom({ active, tasks }: { active: PersonalTask | null; tasks: PersonalTask[] }) {
  const [seconds, setSeconds] = useState(55 * 60);
  const [running, setRunning] = useState(false);
  const progress = Math.round((1 - seconds / (55 * 60)) * 100);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running]);
  const time = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const queue = tasks.filter((task) => task.id !== active?.id && task.status !== 'done').slice(0, 5);

  return (
    <PageScene room="focus" mood="focus">
      <section className={styles.focusTop}>
        <PageTitle back title="Focus Session" subtitle={active?.title ?? 'Choose your focus'} />
        <div className={styles.focusTags}><span><i />Protected time</span><span>{Math.ceil(seconds / 60)} min left</span><span>Deep work</span></div>
        <blockquote>A calmer mind<br />builds a brighter tomorrow.</blockquote>
      </section>
      <section className={styles.focusGrid}>
        <Glass className={styles.focusChamber}>
          <div className={styles.focusCopy}><small>Focus Session</small><h2>In flow</h2><strong>{active?.title ?? 'No active focus'}</strong><p>{active ? 'You’re in a protected focus block. Distractions stay outside this room.' : 'Choose a real task from What Now to start a protected block.'}</p><ActionButton onClick={() => setRunning((value) => !value)}>{running ? <Pause size={17} /> : <Play size={17} />}{running ? 'Pause' : 'Start'}</ActionButton></div>
          <div className={styles.timerWorld}><span className={styles.timerOrbit} /><Pearl className={styles.timerPearl} /><Matter className={styles.timerMatter} /><strong>{active ? time : '—'}</strong><small>{active ? 'remaining' : 'no focus set'}</small></div>
          <div className={styles.focusTools}><button><Waves /></button><button><Headphones /></button><button><MoreHorizontal /></button></div>
        </Glass>
        <aside className={styles.focusSide}>
          <Glass><div className={styles.focusRailHeading}><span><i />Protected Focus</span><small>Ends in {Math.ceil(seconds / 60)} min</small></div><strong>Distraction guard</strong><p>Glow keeps non-urgent context outside the chamber while this focus block is running.</p><button type="button">Change settings<ArrowRight size={13} /></button></Glass>
          <Glass><div className={styles.sectionHeading}><strong>Today’s focus</strong></div><h3>{active?.title ?? 'No focus selected'}</h3><MiniChecklist items={(active ? [active.description || 'Define the first concrete step', ...queue.slice(0, 4).map((task) => task.title)] : ['Choose a real task', 'Set the intended outcome', 'Start when ready']).slice(0, 5)} /></Glass>
          <Glass><div className={styles.sectionHeading}><strong>Needed for this session</strong></div><div className={styles.fileRows}><span><FileText />Connected files appear here<MoreHorizontal /></span><span><Headphones />Focus sound<MoreHorizontal /></span></div></Glass>
          <Glass><div className={styles.sectionHeading}><strong>Possible blockers</strong></div><MiniChecklist items={['Follow-up can wait until after this block', 'Keep new ideas parked, not lost']} /></Glass>
        </aside>
      </section>
      <Glass className={styles.focusProgress}><span><strong>Focus progress</strong><small>You’re {progress}% through this focus block.</small></span><i><b style={{ width: `${progress}%` }} /></i><strong>{progress}%</strong><span><small>Time block</small><strong>{durationLabel(55)}</strong></span></Glass>
      <Glass className={styles.focusAffirmation}><Pearl /><span><strong>You’ve got this.</strong><small>Focus creates the space for your best ideas.</small></span><em>A more open tomorrow</em></Glass>
    </PageScene>
  );
}

function MeetingRoom({ event }: { event: PersonalEvent | null }) {
  const startsIn = event ? minutesUntil(event.startAt) : 0;
  return (
    <PageScene room="meeting">
      <section className={styles.meetingTop}>
        <PageTitle back eyebrow={event ? fmtDate(event.startAt) : fmtDate(new Date())} title={event?.title ?? 'Event detail'} subtitle={event ? `${eventRange(event)} · ${durationLabel(minutesBetween(event.startAt, event.endAt))}` : 'No event selected'} />
        <div className={styles.meetingLocation}><MapPin size={18} />{event?.location ?? 'No location attached'}</div>
        <Matter className={styles.meetingMatter} /><blockquote>Good design<br />turns intention<br />into momentum.</blockquote>
      </section>
      <section className={styles.meetingLayout}>
        <div className={styles.meetingMain}>
          <Glass className={styles.participantsCard}><div className={styles.sectionHeading}><strong>Participants</strong><span>Connected calendar</span><button>Message all</button></div><div className={styles.peopleRow}><span className={styles.personAvatar}><Users /></span><span className={styles.personAvatar}>A</span><span className={styles.personAvatar}>+</span><p>Attendees appear here when the connected event provides them. Glow does not invent people.</p></div></Glass>
          <Glass className={styles.prepCard}><div className={styles.sectionHeading}><strong>Prep notes</strong><button>Edit</button></div><p>{event ? `Prepare for ${event.title}. Keep the purpose, decisions, and materials visible in one place.` : 'Select an event from Day View to prepare for it.'}</p><MiniChecklist items={['Review the latest context', 'Prepare the most important feedback', 'Confirm the decision or outcome you need', 'Bring questions that should not be forgotten']} /></Glass>
          <Glass className={styles.agendaCard}><div className={styles.sectionHeading}><strong>Agenda</strong><span>{event ? durationLabel(minutesBetween(event.startAt, event.endAt)) : 'Open'}</span></div><div className={styles.agendaRows}><span><b>1</b>Recap & goals<em>5 min</em></span><span><b>2</b>Main walkthrough<em>25 min</em></span><span><b>3</b>Feedback & discussion<em>25 min</em></span><span><b>4</b>Decisions & next steps<em>5 min</em></span></div></Glass>
        </div>
        <aside className={styles.meetingSide}>
          <Glass className={styles.joinCard}><Pearl /><strong>{event?.htmlLink ? 'Join meeting' : 'Event ready'}</strong><small>{event ? (startsIn > 0 ? `Starts in ${startsIn} min` : 'Happening now or already started') : 'Choose an event'}</small>{event?.htmlLink ? <ActionButton primary onClick={() => window.open(event.htmlLink!, '_blank', 'noopener,noreferrer')}>Join</ActionButton> : null}<div className={styles.joinTools}><button><Headphones />Join with audio</button><button><ArrowRight />Copy link</button><button><MoreHorizontal />More options</button></div></Glass>
          <Glass><div className={styles.sectionHeading}><strong>Details</strong></div><dl className={styles.detailList}><div><dt>Time</dt><dd>{event ? `${fmtDate(event.startAt)} · ${eventRange(event)}` : '—'}</dd></div><div><dt>Location</dt><dd>{event?.location ?? '—'}</dd></div><div><dt>Calendar</dt><dd>{event?.source === 'google' ? 'Google Calendar' : event ? 'Glow' : '—'}</dd></div><div><dt>Reminder</dt><dd>10 minutes before</dd></div></dl></Glass>
          <Glass><div className={styles.sectionHeading}><strong>Related files</strong><span>3</span><button>+ Add</button></div><div className={styles.fileThumbs}><span><Matter /></span><span><FileText /></span><span><Pearl /></span></div></Glass>
          <Glass><div className={styles.sectionHeading}><strong>Location & travel</strong><button>Get directions</button></div><div className={styles.mapPreview}><MapPin /><span><strong>{event?.location ?? 'No location'}</strong><small>Open the event location when available.</small></span></div></Glass>
        </aside>
      </section>
    </PageScene>
  );
}

function NextUpRoom({ event, task }: { event: PersonalEvent | null; task: PersonalTask | null }) {
  const minutes = event ? minutesUntil(event.startAt) : 55;
  return (
    <PageScene room="next-up">
      <section className={styles.nextHero}>
        <PageTitle back eyebrow={event ? fmtTime(event.startAt) : 'Next'} title="NEXT UP" subtitle={`${splitEventTitle(event)}\nBuild and move. Protect your next hour.`} />
        <Matter className={styles.nextMatter} />
        <Glass className={styles.nextQuote}><blockquote>“Movement clears<br />mental space.”</blockquote><small>Today flows better.</small></Glass>
        <Glass className={styles.stayTrack}><small>Stay on track</small><strong>{minutes ? durationLabel(minutes) : 'Now'}</strong><span>until {event?.title ?? 'your next block'}</span><i /></Glass>
      </section>
      <section className={styles.nextLayout}>
        <div className={styles.nextTimeline}>
          <article className={styles.timelineBlockMajor}><span className={styles.timeMarker}>{event ? fmtTime(event.startAt) : '11:00 AM'}</span><div className={styles.timelineCard}><div><h2>{event?.title ?? 'Workout + shower'}</h2><p>{event?.location || 'Move, reset, and refresh.'}</p><small>{event ? eventRange(event) : '11:00 – 11:45 AM · Personal'}</small></div><div className={styles.dumbbellObject}><Dumbbell /></div><div className={styles.blockSteps}><span><Dumbbell />Main block <em>{event ? durationLabel(minutesBetween(event.startAt, event.endAt)) : '30 min'}</em></span><span><Waves />Reset + refresh <em>15 min</em></span><ActionButton onClick={() => event ? navigateToday('meeting', { event: eventKey(event) }) : navigateToday('focus')}><Play size={14} />Start block</ActionButton></div></div></article>
          <article className={styles.timelineBlock}><span className={styles.timeMarker}>{event?.endAt ? fmtTime(event.endAt) : '11:45 AM'}</span><div><h3>{task?.title ?? 'Design review prep'}</h3><p>{task?.description || 'Organize notes and refine.'}</p><small>{task?.priority ? `${task.priority} priority` : 'Deep work'}</small></div><Matter className={styles.docMatter} /><MiniChecklist items={['Review latest feedback', 'Update slides', 'Run through flow']} /></article>
          <article className={styles.timelineBlock}><span className={styles.timeMarker}>12:30 PM</span><div><h3>Transition</h3><p>Short reset before the next thing.</p><small>Personal</small></div><Pearl /><MiniChecklist items={['Quick stretch', 'Get water', 'Set intention']} /></article>
          <article className={styles.timelineBlock}><span className={styles.timeMarker}>{event ? fmtTime(event.startAt) : '1:00 PM'}</span><div><h3>{event?.title ?? 'Next event'}</h3><p>{event?.location || 'Present and align.'}</p><small>{event ? eventRange(event) : 'Meeting'}</small></div><Pearl violet /><MiniChecklist items={['Join or arrive', 'Be present', 'Capture next steps']} /></article>
          <Glass className={styles.nextQuoteBottom}><Pearl />“A little preparation creates a smoother you.”</Glass>
        </div>
        <aside className={styles.nextSide}>
          <Glass className={styles.timeToNext}><small>Time to next</small><strong>{minutes ? durationLabel(minutes) : 'Now'}</strong><div className={styles.ringVisual}><i /></div><span>Plenty of time. You’re on schedule.</span></Glass>
          <Glass><div className={styles.sectionHeading}><strong>What you’ll need</strong><span>3 items</span></div><div className={styles.needRows}><span><Dumbbell /><b>Workout clothes</b><em>Ready</em><Check /></span><span><Waves /><b>Towel</b><em>Ready</em><Check /></span><span><Pearl /><b>Water bottle</b><em>Ready</em><Check /></span></div></Glass>
          <ActionButton primary onClick={() => navigateToday('focus')}><Focus size={15} />Open in Focus</ActionButton>
        </aside>
      </section>
    </PageScene>
  );
}

function LaterRoom({ events, tasks }: { events: PersonalEvent[]; tasks: PersonalTask[] }) {
  const laterEvents = events.filter((event) => { const hour = new Date(event.startAt).getHours(); return hour >= 12 && hour < 18; }).slice(0, 4);
  const rows = laterEvents.length ? laterEvents : [];
  return (
    <PageScene room="later">
      <section className={styles.laterHero}>
        <PageTitle back eyebrow="AFTERNOON" title="LATER" subtitle="Collaborate and create.\nBuild on today’s momentum." />
        <Matter className={styles.laterMatter} />
        <div className={styles.laterGreeting}><strong>Good progress today.</strong><span>A focused afternoon ahead.</span></div>
        <Glass className={styles.laterQuote}><blockquote>“Progress compounds<br />in the quiet hours.”</blockquote><small>— Glow</small><Matter /></Glass>
        <div className={styles.laterContext}><Glass><small>Afternoon energy</small><div className={styles.energyLine} /><strong>Steady</strong><span>Good for deep work</span></Glass><Glass><small>Focus mode</small><Focus /><strong>Deep work</strong><span>{tasks.filter((task) => task.status !== 'done').length} open tasks</span></Glass><Glass><small>Goals for later</small><MiniChecklist items={tasks.slice(0, 3).map((task) => task.title).length ? tasks.slice(0, 3).map((task) => task.title) : ['Finish what matters', 'Leave a clear handoff', 'Wrap up intentionally']} /></Glass></div>
      </section>
      <section className={styles.laterTimeline}>
        {(rows.length ? rows : [null, null, null, null]).map((event, index) => {
          const fallbackTitles = ['Design review', 'User research synthesis', 'Strategy block', 'Wrap up'];
          const prepTitles = ['Design review prep', 'Research notes', 'Strategy doc', 'End-of-day checklist'];
          return <article key={event ? eventKey(event) : `fallback-${index}`}><span className={styles.timeMarker}>{event ? fmtTime(event.startAt) : `${index + 1}:00 PM`}</span><Pearl warm={index === 2} violet={index === 1} /><div className={styles.laterEventCopy}><h3>{event?.title ?? fallbackTitles[index]}</h3><p>{event?.location || ['Share, discuss, and align.', 'Turn insights into direction.', 'Plan what’s next.', 'Close the day with clarity.'][index]}</p><small>{event ? `${eventRange(event)} · ${durationLabel(minutesBetween(event.startAt, event.endAt))}` : index === 3 ? '5:30 – 6:00 PM · Personal' : 'Deep work'}</small></div><FileText /><div className={styles.laterPrep}><strong>{prepTitles[index]}</strong><MiniChecklist items={tasks.slice(index, index + 3).map((task) => task.title).length ? tasks.slice(index, index + 3).map((task) => task.title) : ['Finalize the key piece', 'Review context', 'Capture next step']} /></div>{event ? <EventAction event={event} /> : <button className={styles.miniAction}>Open<ArrowRight size={13} /></button>}</article>;
        })}
      </section>
      <div className={styles.laterFooter}><button type="button" onClick={() => navigateToday('day-view')}>Day view<ChevronDown size={14} /></button><ActionButton primary onClick={() => navigateToday('focus')}><Sparkles size={14} />Focus with Glow</ActionButton><span>All changes saved</span><button type="button">Undo<RotateCcw size={14} /></button></div>
    </PageScene>
  );
}

function TonightRoom({ events, routines }: { events: PersonalEvent[]; routines: PersonalRoutine[] }) {
  const dinner = events.find((event) => new Date(event.startAt).getHours() >= 17) ?? null;
  const eveningRoutine = routines.find((routine) => routine.timeOfDay === 'evening' || routine.timeOfDay === 'night') ?? null;
  const cards = [
    { kind: 'dinner', title: dinner?.title ?? 'Dinner', time: dinner ? eventRange(dinner) : '7:00 – 8:30 PM', desc: dinner?.location || 'Good food, better company.', action: 'Open in Calendar' },
    { kind: 'routine', title: eveningRoutine?.name ?? 'Evening routine', time: '9:15 PM', desc: eveningRoutine?.description || 'Small rituals. A calmer you.', action: 'Start routine' },
    { kind: 'unwind', title: 'Unwind', time: 'From 9:30 PM', desc: 'Slow down. Be here.', action: 'Start unwind' },
    { kind: 'ready', title: 'Be leave-ready', time: 'Target 2h 09m', desc: 'A smoother tomorrow.', action: 'Mark as ready' },
  ];
  return (
    <PageScene room="tonight" mood="evening">
      <section className={styles.tonightHero}>
        <PageTitle eyebrow="7:00 PM" title="TONIGHT" subtitle="Unwind and reset.\nClose the day well." />
        <span className={styles.eveningMode}><Moon size={14} />Evening mode</span>
        <Matter className={styles.tonightMatter} />
        <div className={styles.sunsetWorld}><i /><b /><em /></div>
        <div className={styles.tonightCopy}><strong>Same day.<br />A softer rhythm.</strong><blockquote>“A peaceful evening<br />builds a brighter tomorrow.”</blockquote><span>Good progress today.<br />Now, take care of you.</span></div>
        <div className={styles.eveningMilestones}><span><Utensils />Dinner<small>{cards[0].time}</small></span><span><Sparkles />Evening routine<small>{cards[1].time}</small></span><span><Moon />Unwind<small>{cards[2].time}</small></span><span><Pearl />Leave-ready<small>{cards[3].time}</small></span></div>
      </section>
      <section className={styles.eveningIntentRow}><Glass><small>This evening’s intention</small><strong>Nourish. Reflect. Recenter.</strong><div className={styles.intentionWave} /><button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:open'))}>How do you want tonight to feel?<ArrowRight /></button></Glass><Glass><small>Evening focus</small><MiniChecklist items={['Good food', 'Device light', 'Calm mind', 'Ready for tomorrow']} /></Glass></section>
      <section className={styles.eveningCards}>
        {cards.map((card, index) => <article className={`${styles.eveningCard} ${styles[`evening_${card.kind}`]}`} key={card.kind}><span className={styles.cardTime}>{card.time}</span><h2>{card.title}</h2><p>{card.desc}</p><div className={styles.photoScene}><span className={styles.sceneGlow} /><Pearl /><i /><b /></div><MiniChecklist items={index === 0 ? ['Reservation / meal plan', 'Be present', 'Take a picture'] : index === 1 ? ['Shower', 'Skincare', 'Comfortable clothes', '10 minutes of reading', 'Set out tomorrow’s outfit'] : index === 2 ? ['Dim the lights', 'No screens after 10:00 PM', 'Journal or breathe', 'Listen to something calming', 'Gratitude'] : ['Pack bag', 'Laptop charged', 'Keys, wallet, essentials', 'Prepare tomorrow’s top 3', 'Set alarm']} /><ActionButton onClick={() => index === 0 && dinner ? navigateToday('meeting', { event: eventKey(dinner) }) : undefined}>{card.action}</ActionButton></article>)}
      </section>
      <div className={styles.eveningFooter}><span><Moon />Tonight’s wellness<small>Rest well. You’re doing enough.</small></span><ActionButton primary onClick={() => navigateToday('tomorrow')}><Sparkles />End day mindfully</ActionButton><blockquote>“A calmer tonight<br />leads to a brighter tomorrow.”</blockquote><button type="button">Set wind down<ChevronDown size={14} /></button></div>
    </PageScene>
  );
}

function TomorrowRoom({ events, tasks }: { events: PersonalEvent[]; tasks: PersonalTask[] }) {
  const first = events.slice(0, 2);
  return (
    <PageScene room="tomorrow" mood="future">
      <section className={styles.tomorrowHero}>
        <PageTitle back eyebrow="TOMORROW" title="Preview" subtitle="A clear tomorrow\ncreates a lighter today." />
        <p className={styles.tomorrowIntro}>Here’s what’s ahead, and a gentle head start to help you flow into it.</p>
        <span className={styles.tomorrowBadge}><i />Tomorrow is in view</span>
        <Matter className={styles.tomorrowMatter} />
        <div className={styles.futureHorizon}><i /><b /><em /></div>
        <blockquote>A calmer<br />tomorrow<br />starts now.</blockquote>
        <Glass className={styles.tomorrowWeather}><small>Tomorrow</small><strong>{fmtDate(new Date(Date.now() + 86400000))}</strong><span><SunMedium />Conditions from your connected weather can appear here.</span><blockquote>“Preparation is a form of self-care.”</blockquote></Glass>
      </section>
      <section className={styles.tomorrowFirstRow}>
        {first.length ? first.map((event) => <Glass key={eventKey(event)} className={styles.tomorrowEvent}><Pearl /><div><small>{fmtTime(event.startAt)}</small><h3>{event.title}</h3><p>{event.location || 'Align, decide, and move forward.'}</p><span>{durationLabel(minutesBetween(event.startAt, event.endAt))}</span></div><EventAction event={event} label="View" /></Glass>) : <Glass className={styles.tomorrowEvent}><Pearl /><div><small>Tomorrow</small><h3>Your schedule is open</h3><p>No sample meetings were inserted.</p></div></Glass>}
        <Glass className={styles.previewTime}><small>Preview time</small><strong>{durationLabel(Math.max(0, Math.round((new Date(new Date().setHours(24, 0, 0, 0)).getTime() - Date.now()) / 60000)))}</strong><div className={styles.previewWave}><i /></div><span>Now <em>Tomorrow</em></span></Glass>
      </section>
      <Glass className={styles.tomorrowGlance}><strong>Tomorrow at a glance</strong><div>{events.slice(0, 6).map((event) => <button type="button" key={eventKey(event)} onClick={() => navigateToday('meeting', { event: eventKey(event) })}><small>{fmtTime(event.startAt)}</small><span>{event.title}</span></button>)}{!events.length ? <span className={styles.emptyGlance}>No events scheduled.</span> : null}</div><button type="button" onClick={() => navigateToday('day-view')}>View full day<ArrowRight /></button></Glass>
      <section className={styles.tomorrowLower}><Glass><div className={styles.sectionHeading}><strong>Light preparation</strong></div><MiniChecklist items={tasks.slice(0, 5).map((task) => task.title).length ? tasks.slice(0, 5).map((task) => task.title) : ['Review what matters', 'Gather the latest context', 'Send what must be sent', 'Prep talking points', 'Set up the first step']} /></Glass><Glass><div className={styles.sectionHeading}><strong>Key context</strong></div><div className={styles.contextRows}><span><FileText /><b>{events[0]?.title ?? 'Tomorrow’s first event'}</b><small>Latest context</small><ArrowRight /></span><span><FileText /><b>{events[1]?.title ?? 'Next important block'}</b><small>Connected notes</small><ArrowRight /></span><span><FileText /><b>Product metrics</b><small>When connected</small><ArrowRight /></span><span><FileText /><b>Customer insights</b><small>When connected</small><ArrowRight /></span></div></Glass><Glass><div className={styles.sectionHeading}><strong>Flow into tomorrow</strong></div><div className={styles.flowRows}><button>Wrap current work<small>You’re one task away from a clean handoff.</small><ArrowRight /></button><button onClick={() => navigateToday('replan')}>Review tomorrow’s plan<small>Feel prepared, not rushed.</small><ArrowRight /></button><button onClick={() => navigateToday('tonight')}>Wind down well<small>A better tomorrow starts with rest.</small><ArrowRight /></button></div></Glass></section>
      <div className={styles.tomorrowFooter}><button type="button" onClick={() => navigateToday('day-view')}>Day view<ChevronDown size={14} /></button><ActionButton primary>I’m ready for tomorrow</ActionButton><span>All changes saved</span><button type="button">Undo<RotateCcw size={14} /></button></div>
    </PageScene>
  );
}

type ReplanBlock = { key: string; event: PersonalEvent; minutes: number; stagedMinutes: number };

function minutesFromDayStart(value: string) {
  const date = new Date(value);
  return date.getHours() * 60 + date.getMinutes();
}

function ReplanRoom({ events }: { events: PersonalEvent[] }) {
  const base = events.filter((event) => !event.allDay).slice(0, 8);
  const initial = base.map((event) => ({ key: eventKey(event), event, minutes: minutesFromDayStart(event.startAt), stagedMinutes: minutesFromDayStart(event.startAt) }));
  const [blocks, setBlocks] = useState<ReplanBlock[]>(initial);
  const [dragging, setDragging] = useState<string | null>(null);
  const [receipt, setReceipt] = useState('');

  function shift(key: string, delta: number) {
    setBlocks((current) => current.map((block) => block.key === key ? { ...block, stagedMinutes: Math.min(21 * 60, Math.max(8 * 60, block.stagedMinutes + delta)) } : block));
  }

  const changed = blocks.filter((block) => block.stagedMinutes !== block.minutes);
  const conflicts = blocks.filter((block, index) => blocks.some((other, otherIndex) => otherIndex !== index && Math.abs(other.stagedMinutes - block.stagedMinutes) < 45));

  return (
    <PageScene room="replan">
      <section className={styles.replanHeader}><button type="button" className={styles.backCircle} onClick={() => navigateToday('day-view')}><ArrowLeft /></button><div><h1>Replan My Day</h1><p>A calmer, more focused day. You’re in control.</p></div><button type="button">Today <span>{fmtDate(new Date())}</span><ChevronDown /></button></section>
      <section className={styles.replanGrid}>
        <div className={styles.timeWorkbench}>
          <div className={styles.hourRail}>{Array.from({ length: 14 }, (_, index) => 8 + index).map((hour) => <span key={hour}>{hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}</span>)}</div>
          <div className={styles.scheduleBoard}>
            {blocks.map((block, index) => {
              const top = ((block.stagedMinutes - 8 * 60) / (13 * 60)) * 100;
              const conflict = conflicts.some((item) => item.key === block.key);
              return <article key={block.key} draggable onDragStart={() => setDragging(block.key)} onDragEnd={() => setDragging(null)} className={`${styles.replanBlock} ${conflict ? styles.replanConflict : ''} ${dragging === block.key ? styles.replanDragging : ''}`} style={{ top: `${Math.max(1, Math.min(92, top))}%`, zIndex: dragging === block.key ? 10 : 2 + index }}><i /><div><strong>{block.event.title}</strong><span>{fmtTime(new Date(new Date(block.event.startAt).setHours(Math.floor(block.stagedMinutes / 60), block.stagedMinutes % 60)).toISOString())} · {durationLabel(minutesBetween(block.event.startAt, block.event.endAt))}</span></div><Pearl warm={index === 4} violet={index === 3} /><div className={styles.replanNudges}><button onClick={() => shift(block.key, -30)}>−30</button><button onClick={() => shift(block.key, 30)}>+30</button></div>{conflict ? <b>Conflict</b> : null}</article>;
            })}
            {!blocks.length ? <div className={styles.emptyBoard}><Pearl /><strong>Your calendar is open.</strong><span>There is nothing to rearrange right now.</span></div> : null}
          </div>
        </div>
        <aside className={styles.replanSide}>
          <Glass className={styles.betterFlow}><Matter /><div><strong>A better flow<br />is within reach.</strong><p>Move, protect, or reschedule. Preview the changes, then apply.</p></div></Glass>
          <div className={styles.replanStats}><Glass><Clock3 /><strong>{Math.max(0, conflicts.length)}</strong><span>conflicts visible</span></Glass><Glass><Focus /><strong>+1h</strong><span>focus possibility</span></Glass><Glass><Sparkles /><strong>Calmer</strong><span>afternoon</span></Glass></div>
          <Glass className={styles.replanSuggestions}><h3>Suggestions</h3>{blocks.slice(0, 3).map((block, index) => <div key={block.key}><span>{index === 0 ? <Dumbbell /> : index === 1 ? <Focus /> : <CalendarDays />}</span><p><strong>{index === 0 ? 'Move flexible block earlier' : index === 1 ? 'Protect this time' : 'Resolve a conflict'}</strong><small>{block.event.title}</small></p><button type="button" onClick={() => shift(block.key, index === 0 ? -60 : 30)}>Apply</button><button type="button"><MoreHorizontal /></button></div>)}<button type="button" className={styles.showMore}><Sparkles />Show more options<ArrowRight /></button></Glass>
          <Glass className={styles.planPreview}><strong>Preview your day</strong><div><span>Current plan</span><i>{blocks.map((block) => <b key={`current-${block.key}`} style={{ left: `${((block.minutes - 8 * 60) / (13 * 60)) * 100}%` }} />)}</i></div><div><span>Proposed plan</span><i>{blocks.map((block) => <b key={`proposed-${block.key}`} style={{ left: `${((block.stagedMinutes - 8 * 60) / (13 * 60)) * 100}%` }} />)}</i></div></Glass>
        </aside>
      </section>
      <div className={styles.replanTray}><span><strong>{changed.length} changes ready</strong><small>{receipt || 'No calendar changes are applied until you confirm.'}</small></span><button type="button" onClick={() => { setBlocks(initial); setReceipt('Preview reset'); }}><RotateCcw />Reset</button><button type="button" onClick={() => setReceipt('Saved as a local preview')}>Save for later</button><ActionButton primary onClick={() => setReceipt(changed.length ? 'Preview applied in Glow. Calendar sync is unchanged until write access is connected.' : 'Nothing changed yet.')}><Sparkles />Apply changes</ActionButton></div>
    </PageScene>
  );
}

function DayEventRow({ event, label = 'Open' }: { event: PersonalEvent; label?: string }) {
  return <article className={styles.dayEvent}><div className={styles.dayEventIcon}>{event.title.toLowerCase().includes('workout') ? <Dumbbell /> : event.title.toLowerCase().includes('dinner') ? <Utensils /> : <FileText />}</div><div className={styles.dayEventCopy}><div><strong>{event.title}</strong><span>{event.source === 'google' ? 'Calendar' : 'Glow'}</span></div><small>{eventRange(event)} · {durationLabel(minutesBetween(event.startAt, event.endAt))}</small><MiniChecklist items={event.location ? [event.location, 'Review the next step'] : ['Review the next step', 'Keep the handoff clear']} /></div><button type="button"><MoreHorizontal /></button><EventAction event={event} label={label} /><button type="button" className={styles.dayArrow} onClick={() => navigateToday('meeting', { event: eventKey(event) })}><ArrowRight /></button></article>;
}

function DayViewRoom({ events, tasks, wellness }: { events: PersonalEvent[]; tasks: PersonalTask[]; wellness: { energy?: string | null } | null }) {
  const now = Date.now();
  const future = events.filter((event) => new Date(event.endAt ?? event.startAt).getTime() >= now);
  const next = future[0] ?? null;
  const later = future.filter((event) => { const hour = new Date(event.startAt).getHours(); return hour >= 12 && hour < 17; }).slice(0, 2);
  const tonight = future.filter((event) => new Date(event.startAt).getHours() >= 17).slice(0, 2);
  const doneTasks = tasks.filter((task) => task.status === 'done').length;
  const completion = tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0;
  const active = tasks.find((task) => task.status === 'in_progress') ?? tasks.find((task) => task.status !== 'done') ?? null;

  return (
    <PageScene room="day-view">
      <section className={styles.dayHero}><PageTitle eyebrow={fmtDate(new Date())} title="Today" subtitle="A balanced day ahead.\nKeep the momentum." /><Matter className={styles.dayMatter} /><blockquote>Calm focus<br />creates a brighter you.</blockquote><Glass className={styles.flowState}><i />You’re in flow<ChevronDown size={16} /></Glass></section>
      <section className={styles.dayGrid}>
        <div className={styles.dayTimeline}>
          <section className={styles.dayRegion}><div className={styles.regionLabel}><Pearl /><small>{new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</small><strong>NOW</strong><span>You’re in flow.<br />Keep going.</span></div><div className={styles.regionBody}>{active ? <article className={styles.dayTask}><FileText /><div><strong>{active.title}</strong><span>Deep work</span><small>{active.description || 'Current focus'}</small><div className={styles.taskProgress}><i style={{ width: active.status === 'in_progress' ? '68%' : '12%' }} /></div></div><button><MoreHorizontal /></button><ActionButton onClick={() => navigateToday('focus')}>Open</ActionButton><button onClick={() => navigateToday('focus')}><ArrowRight /></button></article> : <div className={styles.dayEmpty}>No active task.</div>}</div></section>
          <section className={styles.dayRegion}><div className={styles.regionLabel}><Pearl /><small>{next ? fmtTime(next.startAt) : 'Next'}</small><strong>NEXT</strong><span>Build and move.<br />Protect your next hour.</span></div><div className={styles.regionBody}>{next ? <DayEventRow event={next} label="Start" /> : <div className={styles.dayEmpty}>Your next block is open.</div>}</div></section>
          <section className={styles.dayRegion}><div className={styles.regionLabel}><Pearl violet /><small>Afternoon</small><strong>LATER</strong><span>Collaborate and create.<br />Afternoon momentum.</span></div><div className={styles.regionBody}>{later.map((event) => <DayEventRow key={eventKey(event)} event={event} />)}{!later.length ? <button className={styles.dayEmpty} onClick={() => navigateToday('later')}>Open Later</button> : null}</div></section>
          <section className={styles.dayRegion}><div className={styles.regionLabel}><Pearl warm /><small>Evening</small><strong>TONIGHT</strong><span>Unwind and reset.<br />Close the day well.</span></div><div className={styles.regionBody}>{tonight.map((event) => <DayEventRow key={eventKey(event)} event={event} label="View" />)}<button type="button" className={styles.roomLink} onClick={() => navigateToday('tonight')}>Open Tonight<ArrowRight /></button></div></section>
          <section className={styles.dayRegion}><div className={styles.regionLabel}><CalendarDays /><small>Tomorrow</small><strong>TOMORROW</strong><span>Preview your tomorrow.<br />So today can flow.</span></div><div className={styles.regionBody}><button type="button" className={styles.roomLink} onClick={() => navigateToday('tomorrow')}>Preview tomorrow<ArrowRight /></button></div></section>
        </div>
        <aside className={styles.daySide}>
          <Glass className={styles.dailyRhythm}><strong>Daily rhythm</strong><div className={styles.rhythmRing}><span>{completion}%</span><small>Day complete</small></div><div className={styles.rhythmFacts}><span><i />{doneTasks}/{Math.max(tasks.length, 1)}<small>Tasks done</small></span><span><i />{events.length}<small>Events</small></span><span><i />{wellness?.energy || 'Not logged'}<small>Energy</small></span></div></Glass>
          <Glass className={styles.dayQuote}>“A calm today<br />builds a brighter tomorrow.”<Pearl /></Glass>
          <Glass><div className={styles.sectionHeading}><strong>Top priorities</strong></div><ol className={styles.priorityRows}>{tasks.filter((task) => task.status !== 'done').slice(0, 3).map((task, index) => <li key={task.id}><b>{index + 1}</b>{task.title}<i /></li>)}{!tasks.length ? <li><b>—</b>No priorities set<i /></li> : null}</ol></Glass>
          <Glass><div className={styles.sectionHeading}><strong>Notes for today</strong><button>+</button></div><p>Capture a thought, idea, or reminder without leaving Today.</p></Glass>
          <Glass className={styles.focusFlow}><div className={styles.focusWave} /><span><strong>Focus Flow</strong><small>Ambient support for deep work</small></span><button onClick={() => navigateToday('focus')}><Play /></button></Glass>
          <Glass className={styles.encouragement}><Pearl /><span><strong>You’re doing great.</strong><small>Consistency creates freedom.</small></span></Glass>
        </aside>
      </section>
      <div className={styles.dayFooter}><button type="button">Day view<ChevronDown size={14} /></button><ActionButton primary onClick={() => navigateToday('replan')}><Sparkles />Replan my day</ActionButton><span>All changes saved</span><button type="button">Undo<RotateCcw size={14} /></button></div>
    </PageScene>
  );
}

export function TodayReferenceV2() {
  const params = useSearchParams();
  const personal = usePersonalContext();
  const requested = (params.get('room') || 'what-now') as TodayRoom;
  if (!TARGET_ROOMS.includes(requested)) return null;

  const data = personal.status === 'ready' ? personal.data : null;
  const tasks = data?.tasks ?? [];
  const events = data?.todayEvents ?? [];
  const routines = data?.routines ?? [];
  const wellness = data?.wellness ?? null;
  const active = data?.activeTask ?? tasks.find((task) => task.status === 'in_progress') ?? tasks.find((task) => task.status !== 'done') ?? null;
  const selectedEventKey = params.get('event');
  const selectedEvent = useMemo(() => {
    if (!data) return null;
    if (selectedEventKey) return data.events.find((event) => eventKey(event) === selectedEventKey) ?? null;
    return data.todayEvents.find((event) => new Date(event.endAt ?? event.startAt).getTime() >= Date.now()) ?? data.events[0] ?? null;
  }, [data, selectedEventKey]);

  const nextEvent = events.find((event) => new Date(event.endAt ?? event.startAt).getTime() >= Date.now()) ?? null;

  if (requested === 'what-now') return <WhatNowRoom tasks={tasks} events={events} wellness={wellness} />;
  if (requested === 'focus') return <FocusRoom active={active} tasks={tasks} />;
  if (requested === 'meeting') return <MeetingRoom event={selectedEvent} />;
  if (requested === 'next-up') return <NextUpRoom event={nextEvent} task={active} />;
  if (requested === 'later') return <LaterRoom events={events} tasks={tasks} />;
  if (requested === 'tonight') return <TonightRoom events={events} routines={routines} />;
  if (requested === 'tomorrow') return <TomorrowRoom events={data?.tomorrowEvents ?? []} tasks={tasks} />;
  if (requested === 'replan') return <ReplanRoom events={events} />;
  return <DayViewRoom events={events} tasks={tasks} wellness={wellness} />;
}
