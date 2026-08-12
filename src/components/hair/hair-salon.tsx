import Link from 'next/link';
import { ArrowRight, CalendarDays, Check, Clock3, Droplets, NotebookPen, PackageOpen, Scissors, Sparkles } from 'lucide-react';
import type { BeautyRoutine, CalendarEvent, Note, RoutineWithSteps, Task } from '@/lib/types';

type Props = { beauty: BeautyRoutine[]; events: CalendarEvent[]; notes: Note[]; routines: RoutineWithSteps[]; tasks: Task[] };
const hairWords = /hair|wash|scalp|curl|braid|silk|moistur|condition|shampoo|style|trim|salon|protective|treatment/i;
const treatmentWords = /treat|condition|mask|protein|oil|scalp|trim/i;
const phases = ['Wash', 'Deep Condition', 'Style', 'Maintenance', 'Refresh', 'Treatment', 'Next Wash'];
const isHair = (...values: Array<string | null | undefined>) => hairWords.test(values.filter(Boolean).join(' '));
const formatDate = (date: Date | null | undefined) => date ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date) : 'Not scheduled';

export function HairSalon({ beauty, events, notes, routines, tasks }: Props) {
  const now = new Date();
  const hairTasks = tasks.filter((task) => isHair(task.title, task.description));
  const openTasks = hairTasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled').sort((a, b) => (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity));
  const hairEvents = events.filter((event) => isHair(event.title, event.description)).sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const upcomingEvents = hairEvents.filter((event) => event.startAt >= now);
  const hairRoutines = routines.filter((routine) => isHair(routine.name, routine.description, ...routine.steps.map((step) => step.title)));
  const washRoutine = hairRoutines.find((routine) => /wash/i.test(routine.name));
  const products = beauty.filter((item) => isHair(item.name, item.notes, ...(item.products ?? [])));
  const productNames = Array.from(new Set(products.flatMap((item) => item.products ?? [])));
  const hairNotes = notes.filter((note) => isHair(note.title, note.content, ...(note.tags ?? [])));
  const datedHair = [...hairEvents.map((item) => ({ title: item.title, date: item.startAt, kind: 'Appointment' })), ...openTasks.filter((item) => item.dueDate).map((item) => ({ title: item.title, date: item.dueDate!, kind: 'Task' }))].sort((a, b) => a.date.getTime() - b.date.getTime());
  const nextAction = datedHair.find((item) => item.date >= now) ?? null;
  const nextWash = datedHair.find((item) => item.date >= now && /wash/i.test(item.title)) ?? null;
  const lastWash = datedHair.filter((item) => item.date < now && /wash/i.test(item.title)).at(-1) ?? null;
  const nextTreatment = datedHair.find((item) => item.date >= now && treatmentWords.test(item.title)) ?? null;
  const completedEvidence = hairTasks.filter((task) => task.status === 'done');
  const currentPhase = nextAction ? phases.find((phase) => new RegExp(phase.replace('Deep Condition', 'condition'), 'i').test(nextAction.title)) ?? 'Maintenance' : null;
  const insight = nextAction ? `${nextAction.title} is the next recorded hair action, scheduled for ${formatDate(nextAction.date)}.` : 'There is not enough hair history yet to identify a cycle pattern.';

  return <div className="hair-page">
    <header className="hair-heading"><div><h1>Hair <Sparkles /></h1><p>Healthy hair, healthy you.</p></div><Link href="/beauty">Manage hair records <ArrowRight /></Link></header>
    <nav className="hair-tabs" aria-label="Hair sections">{['Today','Wash Day','Maintenance','Treatments','Styles','Products','Growth','Schedule'].map((tab, index) => <a className={index === 0 ? 'active' : ''} key={tab} href={`#${tab.toLowerCase().replace(' ','-')}`}>{tab}</a>)}</nav>
    <div className="hair-layout"><main>
      <section className="hair-hero" id="today"><div className="hair-hero-copy"><span>TODAY&apos;S HAIR FOCUS</span><h2>{nextAction?.title ?? 'Your private hair ritual'}</h2><p>{nextAction ? 'Your next recorded action is ready when you are.' : 'Add a wash day, treatment, or maintenance task to begin your hair cycle.'}</p><dl><div><dt>Current phase</dt><dd>{currentPhase ?? 'Not established'}</dd></div><div><dt>Last wash</dt><dd>{lastWash ? formatDate(lastWash.date) : 'No wash recorded'}</dd></div><div><dt>Next wash</dt><dd>{nextWash ? formatDate(nextWash.date) : 'Not scheduled'}</dd></div><div><dt>Current style</dt><dd>No current style recorded</dd></div></dl><Link href={nextAction?.kind === 'Appointment' ? '/calendar' : '/tasks'}>{nextAction ? 'View next action' : 'Plan hair care'} <ArrowRight /></Link></div><div className="hair-hero-image"><img src="https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=1200&q=85" alt="Warm private salon with hair care products" /><blockquote>Your hair<br/>is your crown.</blockquote></div></section>
      <section className="hair-cycle"><header><div><b>HAIR CYCLE TIMELINE</b><p>A lifecycle built only from your recorded care.</p></div><small>{datedHair.length ? `${datedHair.length} dated record${datedHair.length === 1 ? '' : 's'}` : 'Cycle data not established'}</small></header><div className="hair-cycle-track">{phases.map((phase, index) => { const evidence = datedHair.find((item) => new RegExp(phase.replace('Deep Condition','condition'), 'i').test(item.title)); const done = evidence ? evidence.date < now : completedEvidence.some((task) => new RegExp(phase.replace('Deep Condition','condition'), 'i').test(task.title)); const current = phase === currentPhase; return <article className={done ? 'done' : current ? 'current' : ''} key={phase}><i>{done ? <Check /> : index + 1}</i><b>{phase}</b><small>{evidence ? formatDate(evidence.date) : 'No record'}</small></article> })}</div></section>
      <div className="hair-board">
        <HairPanel id="wash-day" title="WASH DAY ROUTINE" icon={<Droplets />} link="/routines">{washRoutine ? <><h3>{washRoutine.name}</h3><p>{washRoutine.steps.length} stored steps · {washRoutine.steps.reduce((sum, step) => sum + (step.durationMinutes ?? 0), 0) || 'No'} min recorded</p>{washRoutine.steps.slice(0,4).map((step, i) => <div className="hair-row" key={step.id}><i>{i+1}</i><span>{step.title}</span><small>{step.durationMinutes ? `${step.durationMinutes} min` : 'Open'}</small></div>)}</> : <Empty title="No wash-day routine" text="Create one in Routines to see its real steps here." />}</HairPanel>
        <HairPanel id="maintenance" title="TODAY'S HAIR PLAN" icon={<Scissors />} link="/tasks">{openTasks.length ? openTasks.slice(0,5).map((task) => <div className="hair-row" key={task.id}><i></i><span>{task.title}</span><small>{formatDate(task.dueDate)}</small></div>) : <Empty title="No hair actions due" text="Hair-tagged tasks will appear here." />}</HairPanel>
        <HairPanel id="products" title="PRODUCT ROTATION" icon={<PackageOpen />} link="/beauty">{productNames.length ? productNames.slice(0,6).map((name, index) => <div className="product-row" key={name}><i>{index + 1}</i><span><b>{name}</b><small>Stored in beauty routine</small></span></div>) : <Empty title="No hair products recorded" text="Products saved to hair-related beauty steps appear here." />}</HairPanel>
        <HairPanel id="treatments" title="TREATMENT SCHEDULE" icon={<Sparkles />} link="/calendar">{datedHair.filter((item) => treatmentWords.test(item.title)).length ? datedHair.filter((item) => treatmentWords.test(item.title)).slice(0,4).map((item) => <div className="hair-row" key={`${item.title}${item.date}`}><i></i><span>{item.title}</span><small>{formatDate(item.date)}</small></div>) : <Empty title="No treatments scheduled" text="Treatment tasks and appointments will collect here." />}</HairPanel>
        <HairPanel id="styles" title="CURRENT STYLE" icon={<Scissors />} link="/notes"><Empty title="No current style recorded" text="Add a hair note when a style is installed." /></HairPanel>
        <HairPanel id="growth" title="GROWTH TRACKING" icon={<Sparkles />} link="/notes"><Empty title="No growth measurements" text="Glow OS has no stored hair-measurement history yet." /></HairPanel>
        <HairPanel title="HAIR NOTES" icon={<NotebookPen />} link="/notes">{hairNotes.length ? hairNotes.slice(0,3).map((note) => <div className="note-row" key={note.id}><b>{note.title}</b><p>{note.content || 'No additional text'}</p></div>) : <Empty title="No hair notes yet" text="Tag an existing note with hair to show it here." />}</HairPanel>
        <HairPanel id="schedule" title="HAIR CALENDAR" icon={<CalendarDays />} link="/calendar">{datedHair.length ? datedHair.slice(0,4).map((item) => <div className="hair-row" key={`${item.kind}${item.title}${item.date}`}><time>{formatDate(item.date)}</time><span>{item.title}</span><small>{item.kind}</small></div>) : <Empty title="Hair calendar is clear" text="Real hair tasks and appointments appear here." />}</HairPanel>
      </div>
      <section className="hair-intelligence"><strong>AI<br/>✦</strong><div><b>HAIR INTELLIGENCE</b><p>{insight}</p></div><Link href="/planning">Plan with Glow <ArrowRight /></Link></section>
    </main><aside className="hair-rail">
      <section><h2>NEXT HAIR ACTION</h2>{nextAction ? <><strong>{nextAction.title}</strong><p><Clock3 /> {formatDate(nextAction.date)}</p><Link href={nextAction.kind === 'Appointment' ? '/calendar' : '/tasks'}>Open {nextAction.kind.toLowerCase()} <ArrowRight /></Link></> : <Empty title="Nothing scheduled" text="Add a task or appointment to begin." />}</section>
      <section><h2>NEXT WASH DAY</h2><strong>{nextWash ? formatDate(nextWash.date) : 'Not scheduled'}</strong><p>{nextWash ? nextWash.title : 'No dated wash record'}</p><Link href="/calendar">View schedule <ArrowRight /></Link></section>
      <section><h2>MAINTENANCE STATUS</h2><div className="hair-status"><i className={openTasks.length ? 'attention' : ''}></i><span><strong>{openTasks.length ? `${openTasks.length} open action${openTasks.length === 1 ? '' : 's'}` : 'No open maintenance'}</strong><small>From real Hair tasks</small></span></div><p>Next treatment: <b>{nextTreatment ? formatDate(nextTreatment.date) : 'Not scheduled'}</b></p></section>
      <section><h2>UPCOMING APPOINTMENT</h2>{upcomingEvents[0] ? <><strong>{upcomingEvents[0].title}</strong><p><CalendarDays /> {formatDate(upcomingEvents[0].startAt)}</p></> : <Empty title="No salon appointment" text="Hair-related calendar events appear here." />}</section>
      <section className="cycle-status"><h2>CURRENT CYCLE</h2><strong>{currentPhase ?? 'Not established'}</strong><p>{datedHair.length ? 'Based on your next dated hair record.' : 'Add dated hair care to map your lifecycle.'}</p></section>
    </aside></div>
  </div>;
}

function HairPanel({ title, icon, link, id, children }: { title: string; icon: React.ReactNode; link: string; id?: string; children: React.ReactNode }) { return <section className="hair-panel" id={id}><header><h2>{icon}{title}</h2><Link href={link}>Manage <ArrowRight /></Link></header><div>{children}</div></section> }
function Empty({ title, text }: { title: string; text: string }) { return <div className="hair-empty"><span>◇</span><b>{title}</b><p>{text}</p></div> }
