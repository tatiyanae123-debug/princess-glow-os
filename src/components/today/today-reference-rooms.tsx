'use client';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
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
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import type { PersonalEvent, PersonalTask } from '@/lib/personal-context/types';
import styles from './today-reference-rooms.module.css';

type ReferenceRoom = 'focus' | 'meeting' | 'next-up' | 'later' | 'tonight' | 'tomorrow' | 'replan' | 'day-view';
const REFERENCE_ROOMS: ReferenceRoom[] = ['focus', 'meeting', 'next-up', 'later', 'tonight', 'tomorrow', 'replan', 'day-view'];

function currentRoom(): ReferenceRoom | null {
  if (typeof window === 'undefined') return null;
  const value = new URL(window.location.href).searchParams.get('room') as ReferenceRoom | null;
  return value && REFERENCE_ROOMS.includes(value) ? value : null;
}

function go(room: string) {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.searchParams.set('room', room);
  url.hash = '';
  window.location.assign(url.toString());
}

function fmtTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function fmtDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function eventRange(event: PersonalEvent) {
  if (event.allDay) return 'All day';
  const start = fmtTime(event.startAt);
  const end = event.endAt ? fmtTime(event.endAt) : null;
  return end ? `${start} – ${end}` : start;
}

function minuteGap(value: string) {
  return Math.max(0, Math.round((new Date(value).getTime() - Date.now()) / 60000));
}

function Matter({ className = '' }: { className?: string }) {
  return <span className={`${styles.matter} ${className}`} aria-hidden="true"><i /><b /><em /></span>;
}

function Pearl({ className = '' }: { className?: string }) {
  return <span className={`${styles.pearl} ${className}`} aria-hidden="true"><i /></span>;
}

function Glass({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`${styles.glass} ${className}`}>{children}</section>;
}

function ReturnAnchor({ label = 'Today' }: { label?: string }) {
  return <button type="button" className={styles.returnAnchor} onClick={() => go('day-view')}><ArrowLeft size={14} />{label}</button>;
}

function PageChrome({ children, room, mood = 'day' }: { children: React.ReactNode; room: ReferenceRoom; mood?: 'day' | 'evening' | 'future' | 'focus' }) {
  return (
    <div className={`${styles.overlay} ${styles[`mood_${mood}`]}`} data-today-reference-room={room}>
      <div className={styles.stage}>
        <div className={styles.causticA} aria-hidden="true" />
        <div className={styles.causticB} aria-hidden="true" />
        <header className={styles.topbar}>
          <button type="button" className={styles.brand} onClick={() => window.location.assign('/home')}>Glow OS <span>· Today</span></button>
          <span className={styles.worldTitle}>WORLD 1 · TODAY · THE LIVING CENTER</span>
          <button type="button" className={styles.askGlow} onClick={() => document.dispatchEvent(new CustomEvent('glow:open'))}><Pearl /> <span>Ask Glow</span></button>
        </header>
        <nav className={styles.worldRail} aria-label="Today world doors">
          <button type="button" className={styles.railActive} onClick={() => go('day-view')}><Pearl /><span>Today</span></button>
          <button type="button" onClick={() => go('focus')}><Focus size={18} /><span>Focus</span></button>
          <button type="button" onClick={() => go('people')}><Users size={18} /><span>People</span></button>
          <button type="button" onClick={() => go('places')}><MapPin size={18} /><span>Places</span></button>
          <button type="button" onClick={() => go('resources')}><FileText size={18} /><span>Resources</span></button>
          <button type="button" onClick={() => go('journey')}><Sparkles size={18} /><span>Journeys</span></button>
        </nav>
        <main className={styles.canvas}>{children}</main>
      </div>
    </div>
  );
}

function Empty({ title, detail }: { title: string; detail: string }) {
  return <div className={styles.empty}><Pearl /><strong>{title}</strong><p>{detail}</p></div>;
}

function EventLine({ event, action = 'Open' }: { event: PersonalEvent; action?: string }) {
  return (
    <article className={styles.eventLine}>
      <Pearl />
      <div className={styles.eventCopy}>
        <strong>{event.title}</strong>
        <span>{eventRange(event)}{event.location ? ` · ${event.location}` : ''}</span>
      </div>
      <button type="button" onClick={() => event.htmlLink ? window.open(event.htmlLink, '_blank', 'noopener,noreferrer') : go('meeting')}>{action}<ArrowRight size={13} /></button>
    </article>
  );
}

function TaskLine({ task, action = 'Start' }: { task: PersonalTask; action?: string }) {
  return (
    <article className={styles.eventLine}>
      <span className={styles.taskOrb}><CheckCircle2 size={15} /></span>
      <div className={styles.eventCopy}><strong>{task.title}</strong><span>{task.priority} priority{task.dueDate ? ` · due ${fmtDate(task.dueDate)}` : ''}</span></div>
      <button type="button" onClick={() => go('focus')}>{action}<ArrowRight size={13} /></button>
    </article>
  );
}

function FocusRoom({ data }: { data: ReturnType<typeof usePersonalContext>['data'] }) {
  const active = data?.activeTask ?? data?.tasks[0] ?? null;
  const [seconds, setSeconds] = useState(55 * 60);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);
  const time = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const queue = (data?.tasks ?? []).filter((task) => task.id !== active?.id).slice(0, 5);

  return (
    <PageChrome room="focus" mood="focus">
      <section className={styles.focusHeader}><ReturnAnchor /><div><span>Protected work</span><h1>Focus Session</h1><h2>{active?.title ?? 'Choose your focus'}</h2><p>Deep work. Real progress.</p></div><blockquote>A calmer mind<br />builds a brighter tomorrow.</blockquote></section>
      <div className={styles.focusLayout}>
        <Glass className={styles.focusChamber}>
          <div className={styles.focusCopy}><span>Focus Session</span><strong>In flow</strong><p>{active?.title ?? 'No active task is set.'}</p><small>{active ? 'You are in a protected focus block.' : 'Glow leaves this chamber empty until you choose real work.'}</small><button type="button" onClick={() => setRunning((v) => !v)}>{running ? <Pause /> : <Play />}{running ? 'Pause' : 'Start'}</button></div>
          <div className={styles.timerWorld}><Matter className={styles.timerMatter} /><span className={styles.orbit} /><Pearl className={styles.orbitPearl} /><strong>{active ? time : '—'}</strong><small>{active ? 'remaining' : 'no focus set'}</small></div>
        </Glass>
        <aside className={styles.focusRail}>
          <Glass className={styles.protected}><span className={styles.kicker}><span className={styles.liveDot} />Protected Focus</span><strong>Distraction guard is active</strong><p>Keep non-urgent interruptions outside this chamber while you work.</p></Glass>
          <Glass><span className={styles.kicker}>Today’s focus</span><strong className={styles.railTitle}>{active?.title ?? 'No focus selected'}</strong>{queue.length ? <div className={styles.queue}>{queue.map((task) => <span key={task.id}><i />{task.title}</span>)}</div> : <p>No additional tasks are queued.</p>}</Glass>
          <Glass><span className={styles.kicker}>Needed for this session</span><div className={styles.fileGhosts}><span><FileText />Connected files appear here</span><span><Headphones />Focus sound available</span></div></Glass>
          <Glass><span className={styles.kicker}>Possible blockers</span><p>Glow keeps later obligations visible without pulling them into the center of your attention.</p></Glass>
        </aside>
      </div>
      <Glass className={styles.focusProgress}><span>Focus progress</span><i><b style={{ width: `${Math.max(0, Math.min(100, 100 - seconds / (55 * 60) * 100))}%` }} /></i><strong>{Math.round(100 - seconds / (55 * 60) * 100)}%</strong></Glass>
    </PageChrome>
  );
}

function MeetingRoom({ event }: { event: PersonalEvent | null }) {
  return (
    <PageChrome room="meeting">
      <section className={styles.meetingHeader}><ReturnAnchor /><div><span>{event ? fmtDate(event.startAt) : fmtDate(new Date())}</span><h1>{event?.title ?? 'No event selected'}</h1><h2>{event ? eventRange(event) : 'Your calendar is clear'}</h2><p>{event?.location ?? 'No location attached'}</p></div><Matter className={styles.meetingMatter} /><blockquote>Good preparation<br />turns intention into momentum.</blockquote></section>
      <div className={styles.meetingGrid}>
        <div className={styles.meetingLeft}>
          <Glass><div className={styles.sectionHead}><strong>Participants</strong><span>Connected event context</span></div><div className={styles.peopleStrip}><span className={styles.personGhost}><Users /></span><p>Participant names appear only when supplied by the connected calendar. Glow does not invent attendees.</p></div></Glass>
          <Glass><div className={styles.sectionHead}><strong>Prep notes</strong><button type="button">Edit</button></div><p>{event ? 'Use this space for the notes and preparation attached to this real event.' : 'Choose an event to prepare for it.'}</p><div className={styles.checkRows}><span><i />Review what needs attention</span><span><i />Bring the right materials</span><span><i />Decide what success looks like</span></div></Glass>
          <Glass><div className={styles.sectionHead}><strong>Agenda</strong><span>Event flow</span></div><div className={styles.agenda}><span><b>1</b>Opening and context</span><span><b>2</b>Main work</span><span><b>3</b>Decisions and next steps</span></div></Glass>
        </div>
        <aside className={styles.meetingSide}>
          <Glass className={styles.joinCard}><Pearl /><strong>{event?.htmlLink ? 'Join meeting' : 'Event ready'}</strong><small>{event ? (minuteGap(event.startAt) > 0 ? `Starts in ${minuteGap(event.startAt)} min` : 'Happening now or already started') : 'No event selected'}</small>{event?.htmlLink ? <button type="button" onClick={() => window.open(event.htmlLink!, '_blank', 'noopener,noreferrer')}>Join</button> : null}</Glass>
          <Glass><div className={styles.sectionHead}><strong>Details</strong></div><dl className={styles.detailList}><div><dt>Time</dt><dd>{event ? eventRange(event) : '—'}</dd></div><div><dt>Location</dt><dd>{event?.location ?? '—'}</dd></div><div><dt>Source</dt><dd>{event?.source ?? '—'}</dd></div></dl></Glass>
          <Glass><div className={styles.sectionHead}><strong>Related files</strong><span>Context</span></div><div className={styles.relatedFiles}><span /><span /><span /></div></Glass>
          <Glass><div className={styles.sectionHead}><strong>Location & travel</strong></div><div className={styles.miniMap}><MapPin /><span>{event?.location ?? 'No location attached'}</span></div></Glass>
        </aside>
      </div>
    </PageChrome>
  );
}

function NextUpRoom({ event, task }: { event: PersonalEvent | null; task: PersonalTask | null }) {
  const nextTime = event?.startAt ?? task?.dueDate ?? null;
  return (
    <PageChrome room="next-up">
      <section className={styles.nextHero}><ReturnAnchor /><div><span>{nextTime ? fmtTime(nextTime) : 'Next'}</span><h1>NEXT UP</h1><h2>{event?.title ?? task?.title ?? 'Your next block is open'}</h2><p>Build and move. Protect your next hour.</p></div><Matter className={styles.nextMatter} /><Glass className={styles.quoteTile}><p>“Movement clears<br />mental space.”</p><small>Today flows better.</small></Glass><Glass className={styles.trackTile}><span>Stay on track</span><strong>{nextTime ? `${minuteGap(nextTime)} min` : 'Open'}</strong><small>until the next commitment</small><i /></Glass></section>
      <div className={styles.nextBody}>
        <div className={styles.timelineColumn}>
          {event ? <article className={styles.majorBlock}><span className={styles.timePin}>{fmtTime(event.startAt)}</span><div className={styles.blockCopy}><h3>{event.title}</h3><p>{event.location || 'Calendar event'}</p><small>{eventRange(event)}</small></div><div className={styles.physicalObject}><span className={styles.dumbbell}><i /><b /><em /></span></div><button type="button" onClick={() => go('meeting')}>Open block <ArrowRight /></button></article> : null}
          {task ? <article className={styles.transitionBlock}><span>Preparation</span><strong>{task.title}</strong><p>{task.priority} priority</p><button type="button" onClick={() => go('focus')}>Open</button></article> : null}
          <article className={styles.transitionBlock}><span>Transition</span><strong>Leave a little room between things.</strong><p>Reset, water, breathe, gather what you need.</p></article>
        </div>
        <aside className={styles.nextSide}><Glass className={styles.timeToNext}><span>Time to next</span><strong>{nextTime ? `${minuteGap(nextTime)} min` : 'Open'}</strong><div className={styles.ring} /></Glass><Glass><div className={styles.sectionHead}><strong>What you’ll need</strong><span>Ready</span></div><div className={styles.needList}><span><i />Essentials</span><span><i />Water</span><span><i />Anything attached to the event</span></div></Glass><button type="button" className={styles.openFocus} onClick={() => go('focus')}><Focus />Open in Focus</button></aside>
      </div>
    </PageChrome>
  );
}

function LaterRoom({ events }: { events: PersonalEvent[] }) {
  return (
    <PageChrome room="later">
      <section className={styles.laterHero}><ReturnAnchor /><div><span>AFTERNOON</span><h1>LATER</h1><p>Collaborate and create.<br />Build on today’s momentum.</p></div><Matter className={styles.laterMatter} /><div className={styles.laterGreeting}><strong>Good progress today.</strong><span>A focused afternoon ahead.</span></div><Glass className={styles.laterQuote}>“Progress compounds<br />in the quiet hours.”<small>— Glow</small></Glass></section>
      <div className={styles.signalRow}><Glass><span>Afternoon energy</span><div className={styles.energyWave} /><strong>Steady</strong></Glass><Glass><span>Focus mode</span><strong>Deep work</strong><small>Protect the best windows</small></Glass><Glass><span>Goals for later</span><div className={styles.checkRows}><span><i />Finish what matters</span><span><i />Leave tomorrow lighter</span></div></Glass></div>
      <section className={styles.afternoonTimeline}>{events.length ? events.map((event) => <EventLine key={`${event.source}-${event.id}`} event={event} />) : <Empty title="Your afternoon is open" detail="No connected afternoon events were found. Glow leaves the horizon quiet instead of inserting a sample schedule." />}</section>
      <div className={styles.bottomAction}><button type="button" onClick={() => go('day-view')}>Day view</button><button type="button" onClick={() => go('what-now')}><Sparkles />Focus with Glow</button></div>
    </PageChrome>
  );
}

function TonightRoom({ events, routines }: { events: PersonalEvent[]; routines: Array<{ id: string; name: string; description: string | null }> }) {
  const cards = [
    { title: events[0]?.title ?? 'Dinner / evening plan', subtitle: events[0] ? eventRange(events[0]) : 'Open', type: 'dinner' },
    { title: routines[0]?.name ?? 'Evening routine', subtitle: routines[0]?.description || 'Small rituals. A calmer you.', type: 'ritual' },
    { title: 'Unwind', subtitle: 'Slow down. Be here.', type: 'unwind' },
    { title: 'Be leave-ready', subtitle: 'A smoother tomorrow.', type: 'ready' },
  ];
  return (
    <PageChrome room="tonight" mood="evening">
      <section className={styles.tonightHero}><div><span>EVENING</span><h1>TONIGHT</h1><p>Unwind and reset.<br />Close the day well.</p><small><Moon />Evening mode</small></div><Matter className={styles.tonightMatter} /><div className={styles.sunset}><i /><b /></div><blockquote>“A peaceful evening<br />builds a brighter tomorrow.”</blockquote><div className={styles.milestones}><span>Dinner</span><span>Evening routine</span><span>Unwind</span><span>Leave-ready</span></div></section>
      <Glass className={styles.eveningIntent}><span>This evening’s intention</span><strong>Nourish. Reflect. Recenter.</strong><div className={styles.energyWave} /><button type="button">How do you want tonight to feel? <ArrowRight /></button></Glass>
      <section className={styles.eveningCards}>{cards.map((card) => <article key={card.title} className={`${styles.eveningCard} ${styles[`evening_${card.type}`]}`}><span className={styles.cardTime}>{card.subtitle}</span><h2>{card.title}</h2><p>{card.type === 'dinner' ? 'Good food, better company.' : card.type === 'ritual' ? 'Small rituals. A calmer you.' : card.type === 'unwind' ? 'Rest your nervous system.' : 'Prepare the essentials for tomorrow.'}</p><div className={styles.sceneImage}><Pearl /></div><div className={styles.checkRows}><span><i />One small next step</span><span><i />Keep it gentle</span><span><i />Leave room to rest</span></div><button type="button">{card.type === 'ritual' ? 'Start routine' : card.type === 'unwind' ? 'Start unwind' : 'Open'}<ArrowRight /></button></article>)}</section>
      <div className={styles.eveningFooter}><span><Moon />Tonight’s wellness</span><button type="button" onClick={() => go('tomorrow')}><Sparkles />End day mindfully</button><small>A calmer tonight leads to a brighter tomorrow.</small></div>
    </PageChrome>
  );
}

function TomorrowRoom({ events }: { events: PersonalEvent[] }) {
  return (
    <PageChrome room="tomorrow" mood="future">
      <section className={styles.tomorrowHero}><ReturnAnchor /><div><span>TOMORROW</span><h1>Preview</h1><p>A clear tomorrow<br />creates a lighter today.</p><small>Here’s what’s ahead, and a gentle head start to help you flow into it.</small></div><Matter className={styles.tomorrowMatter} /><div className={styles.futureHorizon}><i /><b /></div><blockquote>A calmer<br />tomorrow<br />starts now.</blockquote><Glass className={styles.tomorrowDate}><span>Tomorrow</span><strong>{fmtDate(new Date(Date.now() + 86400000))}</strong><small>Only your connected plans appear below.</small></Glass></section>
      <div className={styles.tomorrowFirst}>{events.slice(0, 2).map((event) => <EventLine key={`${event.source}-${event.id}`} event={event} action="View" />)}{events.length === 0 ? <Empty title="Tomorrow is clear" detail="No events are currently scheduled for tomorrow." /> : null}</div>
      <Glass className={styles.glance}><strong>Tomorrow at a glance</strong><div>{events.slice(0, 6).map((event) => <button key={`${event.source}-${event.id}`} type="button" onClick={() => go('meeting')}><small>{fmtTime(event.startAt)}</small><span>{event.title}</span></button>)}</div></Glass>
      <div className={styles.tomorrowLower}><Glass><div className={styles.sectionHead}><strong>Light preparation</strong></div><div className={styles.checkRows}><span><i />Review what must be ready</span><span><i />Gather anything needed</span><span><i />Make the first step obvious</span></div></Glass><Glass><div className={styles.sectionHead}><strong>Key context</strong></div><p>Documents, notes and reminders connected to tomorrow can live here without filling the page with fake examples.</p></Glass><Glass><div className={styles.sectionHead}><strong>Flow into tomorrow</strong></div><div className={styles.flowLinks}><button type="button">Wrap current work<ArrowRight /></button><button type="button" onClick={() => go('replan')}>Review tomorrow’s plan<ArrowRight /></button><button type="button" onClick={() => go('tonight')}>Wind down well<ArrowRight /></button></div></Glass></div>
    </PageChrome>
  );
}

function ReplanRoom({ events }: { events: PersonalEvent[] }) {
  return (
    <PageChrome room="replan">
      <section className={styles.replanTitle}><ReturnAnchor /><div><h1>Replan My Day</h1><p>A calmer, more focused day. You’re in control.</p></div><button type="button">Today <span>{fmtDate(new Date())}</span></button></section>
      <div className={styles.replanGrid}>
        <section className={styles.timeWorkbench}><div className={styles.hourRail}>{['8 AM','9 AM','10 AM','11 AM','12 PM','1 PM','2 PM','3 PM','4 PM','5 PM','6 PM','7 PM','8 PM','9 PM'].map((h) => <span key={h}>{h}</span>)}</div><div className={styles.scheduleCanvas}>{events.slice(0, 7).map((event, index) => <article key={`${event.source}-${event.id}`} className={`${styles.dragBlock} ${index === 1 ? styles.conflictBlock : ''}`} style={{ top: `${index * 90 + 14}px` }}><i /><div><strong>{event.title}</strong><span>{eventRange(event)}</span></div><Pearl />{index === 1 ? <b>Review timing</b> : null}</article>)}{events.length === 0 ? <Empty title="Nothing to move" detail="Today’s connected calendar has no remaining events." /> : null}</div></section>
        <aside className={styles.replanIntelligence}><Glass className={styles.betterFlow}><Matter /><div><strong>A better flow<br />is within reach.</strong><p>Move, protect, or reschedule. Preview the changes, then apply.</p></div></Glass><div className={styles.replanStats}><Glass><Clock3 /><strong>{events.length}</strong><span>items visible</span></Glass><Glass><Focus /><strong>+</strong><span>protect focus</span></Glass><Glass><Sparkles /><strong>Calmer</strong><span>day shape</span></Glass></div><Glass className={styles.suggestions}><strong>Suggestions</strong><button type="button"><Clock3 /><span>Move a flexible block earlier<small>Open space around fixed commitments.</small></span><b>Apply</b></button><button type="button"><Focus /><span>Protect your best work window<small>Reduce interruptions around deep work.</small></span><b>Apply</b></button><button type="button"><CalendarDays /><span>Resolve visible conflicts<small>Keep fixed events readable.</small></span><b>Apply</b></button></Glass><Glass className={styles.previewStrip}><strong>Preview your day</strong><span><i /><i /><i /><i /><i /></span></Glass></aside>
      </div>
      <div className={styles.editTray}><span>{events.length} items ready<small>No calendar changes are applied automatically.</small></span><button type="button"><RotateCcw />Reset</button><button type="button">Save for later</button><button type="button" className={styles.applyButton}><Sparkles />Apply changes</button></div>
    </PageChrome>
  );
}

function DayViewRoom({ events, tasks, wellness }: { events: PersonalEvent[]; tasks: PersonalTask[]; wellness: { energy?: string | null } | null }) {
  const now = Date.now();
  const next = events.find((event) => new Date(event.startAt).getTime() >= now) ?? null;
  const tonight = events.filter((event) => new Date(event.startAt).getHours() >= 17);
  const later = events.filter((event) => new Date(event.startAt).getHours() >= 12 && new Date(event.startAt).getHours() < 17);
  return (
    <PageChrome room="day-view">
      <section className={styles.dayHero}><div><span>{fmtDate(new Date())}</span><h1>Today</h1><p>A balanced day ahead.<br />Keep the momentum.</p></div><Matter className={styles.dayMatter} /><blockquote>Calm focus<br />creates a brighter you.</blockquote><Glass className={styles.flowState}><span className={styles.liveDot} />You’re in flow</Glass></section>
      <div className={styles.dayLayout}>
        <section className={styles.dayTimeline}>
          <div className={styles.dayRegion}><div className={styles.regionLabel}><small>{new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</small><strong>NOW</strong><span>You’re here.</span></div><div className={styles.regionEvents}>{tasks.slice(0,1).map((task) => <TaskLine key={task.id} task={task} action="Open" />)}</div></div>
          <div className={styles.dayRegion}><div className={styles.regionLabel}><small>{next ? fmtTime(next.startAt) : 'Next'}</small><strong>NEXT</strong><span>Protect your next hour.</span></div><div className={styles.regionEvents}>{next ? <EventLine event={next} action="Start" /> : <Empty title="No next event" detail="Your connected schedule is open." />}</div></div>
          <div className={styles.dayRegion}><div className={styles.regionLabel}><small>Afternoon</small><strong>LATER</strong><span>Collaborate and create.</span></div><div className={styles.regionEvents}>{later.slice(0,3).map((event) => <EventLine key={`${event.source}-${event.id}`} event={event} />)}</div></div>
          <div className={styles.dayRegion}><div className={styles.regionLabel}><small>Evening</small><strong>TONIGHT</strong><span>Unwind and reset.</span></div><div className={styles.regionEvents}>{tonight.slice(0,2).map((event) => <EventLine key={`${event.source}-${event.id}`} event={event} action="View" />)}<button type="button" className={styles.tonightLink} onClick={() => go('tonight')}>Open Tonight <ArrowRight /></button></div></div>
          <div className={styles.dayRegion}><div className={styles.regionLabel}><small>Tomorrow</small><strong>TOMORROW</strong><span>Preview what’s next.</span></div><div className={styles.regionEvents}><button type="button" className={styles.tomorrowLink} onClick={() => go('tomorrow')}>Preview tomorrow <ArrowRight /></button></div></div>
        </section>
        <aside className={styles.daySide}><Glass className={styles.dailyRhythm}><span>Daily rhythm</span><div className={styles.rhythmRing}><strong>{events.length ? Math.min(99, Math.round((events.filter((e) => new Date(e.startAt).getTime() < now).length / events.length) * 100)) : 0}%</strong><small>day complete</small></div><div className={styles.rhythmFacts}><span>{tasks.length} tasks</span><span>{events.length} events</span><span>{wellness?.energy ?? 'Energy not logged'}</span></div></Glass><Glass><div className={styles.sectionHead}><strong>Top priorities</strong></div><ol className={styles.priorityList}>{tasks.slice(0,3).map((task, i) => <li key={task.id}><b>{i+1}</b>{task.title}</li>)}</ol></Glass><Glass><div className={styles.sectionHead}><strong>Notes for today</strong><button type="button">+</button></div><p>Capture a thought, idea, or reminder without leaving Today.</p></Glass><Glass className={styles.focusFlow}><div className={styles.waveThumb} /><strong>Focus Flow</strong><small>Ambient support for deep work</small><button type="button" onClick={() => go('focus')}><Play /></button></Glass><Glass className={styles.encouragement}><Pearl /><strong>You’re doing great.</strong><small>Consistency creates freedom.</small></Glass></aside>
      </div>
      <div className={styles.dayFooter}><button type="button">Day view</button><button type="button" onClick={() => go('replan')}><Sparkles />Replan my day</button><span>All changes saved</span></div>
    </PageChrome>
  );
}

export function TodayReferenceRooms() {
  const personal = usePersonalContext();
  const [room, setRoom] = useState<ReferenceRoom | null>(null);
  useEffect(() => {
    const sync = () => setRoom(currentRoom());
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  const data = personal.status === 'ready' ? personal.data : null;
  const derived = useMemo(() => {
    if (!data) return { nextEvent: null, later: [], tonight: [], remaining: [] as PersonalEvent[] };
    const now = Date.now();
    const remaining = data.todayEvents.filter((event) => (event.endAt ? new Date(event.endAt).getTime() : new Date(event.startAt).getTime()) >= now);
    const nextEvent = remaining[0] ?? data.events.find((event) => new Date(event.startAt).getTime() >= now) ?? null;
    const later = remaining.filter((event) => { const h = new Date(event.startAt).getHours(); return h >= 12 && h < 17; });
    const tonight = remaining.filter((event) => new Date(event.startAt).getHours() >= 17);
    return { nextEvent, later, tonight, remaining };
  }, [data]);

  if (!room) return null;
  if (personal.status === 'loading') return <PageChrome room={room}><Empty title="Reading your Today context…" detail="Glow is loading your connected tasks, calendar, routines and wellness without substituting sample information." /></PageChrome>;
  if (!data) return <PageChrome room={room}><Empty title="Today is not connected" detail="Sign in to the Glow account you want represented here. Missing data stays missing instead of becoming sample content." /></PageChrome>;

  if (room === 'focus') return <FocusRoom data={data} />;
  if (room === 'meeting') return <MeetingRoom event={derived.nextEvent} />;
  if (room === 'next-up') return <NextUpRoom event={derived.nextEvent} task={data.tasks[0] ?? null} />;
  if (room === 'later') return <LaterRoom events={derived.later} />;
  if (room === 'tonight') return <TonightRoom events={derived.tonight} routines={data.routines.filter((r) => r.timeOfDay === 'evening' || r.timeOfDay === 'night').slice(0, 2)} />;
  if (room === 'tomorrow') return <TomorrowRoom events={data.tomorrowEvents} />;
  if (room === 'replan') return <ReplanRoom events={derived.remaining.length ? derived.remaining : data.todayEvents} />;
  return <DayViewRoom events={data.todayEvents} tasks={data.tasks} wellness={data.wellness} />;
}
