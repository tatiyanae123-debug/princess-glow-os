'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  Check,
  Circle,
  Clock3,
  Droplets,
  FileText,
  Folder,
  Heart,
  Leaf,
  MapPin,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Sun,
  Target,
  Users,
  WandSparkles,
} from 'lucide-react';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import { PlanOrbitField } from './plan-orbit-field';
import styles from './plan-reference-family.module.css';

const DAY = 86_400_000;
const HORIZON_LABEL: Record<PlanHorizon, string> = {
  today: 'TODAY', week: 'THIS WEEK', 'two-weeks': 'NEXT 2 WEEKS', month: 'THIS MONTH', 'three-months': 'NEXT 3 MONTHS',
};

function dateKey(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}
function shortDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
function longDate(value: Date | string) {
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function timeLabel(value: Date | string) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function minutesBetween(start: Date | string, end: Date | string | null) {
  if (!end) return 60;
  return Math.max(1, Math.round((new Date(end).getTime() - new Date(start).getTime()) / 60_000));
}
function startOfWeek(date = new Date()) {
  const next = new Date(date);
  const day = (next.getDay() + 6) % 7;
  next.setHours(0, 0, 0, 0);
  next.setDate(next.getDate() - day);
  return next;
}
function clamp(value: number, min: number, max: number) { return Math.max(min, Math.min(max, value)); }
function words(text: string) {
  return new Set(text.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3));
}
function overlaps(a: string, b: string) {
  const aw = words(a); const bw = words(b);
  return [...aw].some((word) => bw.has(word));
}

export type PlanHabit = {
  id: string; name: string; description: string | null; frequency: string; targetCount: number; color?: string | null;
};
export type PlanHabitLog = { habitId: string; loggedDate: string; count: number };

const HABIT_POSITIONS = [
  ['15%', '24%'], ['43%', '8%'], ['73%', '25%'], ['15%', '67%'], ['44%', '75%'], ['72%', '67%'],
] as const;
const HABIT_ICONS = [Sun, Leaf, Droplets, Moon, BookOpen, Heart];
const HABIT_TONES = ['sun', 'leaf', 'water', 'moon', 'journal', 'heart'];

export function PlanHabitsRoom({ habits, logs }: { habits: PlanHabit[]; logs: PlanHabitLog[] }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('week');
  const [selectedId, setSelectedId] = useState(habits[0]?.id ?? '');
  const selected = habits.find((habit) => habit.id === selectedId) ?? habits[0];
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekKeys = Array.from({ length: 7 }, (_, index) => dateKey(new Date(weekStart.getTime() + index * DAY)));
  const logsThisWeek = logs.filter((log) => weekKeys.includes(log.loggedDate));
  const completedHabitIds = new Set(logsThisWeek.filter((log) => log.count > 0).map((log) => log.habitId));
  const overall = habits.length ? Math.round((completedHabitIds.size / habits.length) * 100) : 0;
  const freqCounts = habits.reduce<Record<string, number>>((acc, habit) => { acc[habit.frequency] = (acc[habit.frequency] ?? 0) + 1; return acc; }, {});

  return (
    <PlanInstrumentChrome title="PLAN · HABITS" subtitle="Small rhythms. A brighter you. Consistency grows a kinder future." activeInstrument="Habits" horizon={horizon} onHorizonChange={setHorizon} centerLabel={HORIZON_LABEL[horizon]}>
      <section className={`${styles.familyStage} ${styles.habitsStage}`}>
        <PlanOrbitField dense />
        <p className={`${styles.poem} ${styles.poemLeft}`}>Habits are seeds<br />of the life you want.</p>
        <p className={`${styles.poem} ${styles.poemRight}`}>Not perfect days,<br />but a steady rhythm.</p>
        <div className={styles.habitCenter}><span className={styles.spectralCore}><Leaf /></span><strong>My Habits</strong><small>{habits.length} habit{habits.length === 1 ? '' : 's'}</small></div>
        {habits.slice(0, 6).map((habit, index) => {
          const [left, top] = HABIT_POSITIONS[index]; const Icon = HABIT_ICONS[index];
          const habitLogs = logsThisWeek.filter((log) => log.habitId === habit.id && log.count > 0);
          return <button key={habit.id} type="button" className={`${styles.habitSatellite} ${styles[`tone_${HABIT_TONES[index]}`]}`} style={{ left, top }} onClick={() => setSelectedId(habit.id)} aria-pressed={selected?.id === habit.id}>
            <span className={styles.habitOrb}><Icon /></span>
            <span className={styles.habitCard}><strong>{habit.name}</strong><small>{habit.frequency.replace('_', ' ')} · target {habit.targetCount}</small><span className={styles.rhythmDots}>{weekKeys.map((key) => <i key={key} data-on={habitLogs.some((log) => log.loggedDate === key)} />)}</span></span>
          </button>;
        })}
        {!habits.length ? <div className={styles.emptyCenter}>No habits are saved yet. The rhythm field stays open until you add one.</div> : null}
        <aside className={styles.habitDetails}>
          <div className={styles.panelTitle}>HABIT DETAILS <span>Edit</span></div>
          {selected ? <>
            <div className={styles.detailHero}><span className={styles.detailOrb}><Sun /></span><div><strong>{selected.name}</strong><small>{selected.description || 'No description recorded.'}</small></div></div>
            <dl className={styles.detailRows}>
              <div><dt>Frequency</dt><dd>{selected.frequency}</dd></div>
              <div><dt>Target</dt><dd>{selected.targetCount}</dd></div>
              <div><dt>Minimum version</dt><dd>Not set</dd></div>
              <div><dt>Ideal version</dt><dd>Not set</dd></div>
              <div><dt>Time window</dt><dd>Not set</dd></div>
              <div><dt>Context</dt><dd>Not set</dd></div>
              <div><dt>Recovery rule</dt><dd>A new day is a fresh start</dd></div>
            </dl>
            <div className={styles.quietQuote}><Leaf /> Progress grows even when life flexes.</div>
          </> : <p className={styles.panelEmpty}>Select a habit to inspect its real settings.</p>}
        </aside>
      </section>
      <section className={styles.habitAnalytics}>
        <div className={styles.analyticsPanel}><div className={styles.panelTitle}>RHYTHM VIEW</div><div className={styles.rhythmChart}>{weekKeys.map((key, index) => <div key={key} className={styles.rhythmDay}><span style={{ height: `${22 + logsThisWeek.filter((log) => log.loggedDate === key && log.count > 0).length * 12}px` }} /><small>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index]}</small></div>)}</div></div>
        <div className={styles.analyticsPanel}><div className={styles.panelTitle}>HABIT BALANCE</div><div className={styles.balanceRing} style={{ '--balance': `${overall * 3.6}deg` } as React.CSSProperties}><strong>{habits.length}</strong><small>habits</small></div><div className={styles.balanceLegend}>{Object.entries(freqCounts).slice(0, 4).map(([key, count]) => <span key={key}>{key} <b>{count}</b></span>)}</div></div>
        <div className={styles.analyticsPanel}><div className={styles.panelTitle}>INSIGHTS <span>This Week</span></div><div className={styles.insightList}><p><b>{overall}%</b> overall rhythm</p><p><b>{completedHabitIds.size}/{habits.length || 0}</b> habits touched this week</p><p><b>{logsThisWeek.length}</b> logged rhythm moments</p><p>{logsThisWeek.length ? 'Your rhythm is visible without judging missed days.' : 'No habit logs yet this week.'}</p></div></div>
      </section>
    </PlanInstrumentChrome>
  );
}

export type PlanRoutineStep = { id: string; title: string; notes: string | null; order: number; durationMinutes: number | null };
export type PlanRoutine = { id: string; name: string; description: string | null; timeOfDay: string; daysOfWeek: string[] | null; steps: PlanRoutineStep[] };

function totalDuration(steps: PlanRoutineStep[]) { return steps.reduce((sum, step) => sum + (step.durationMinutes ?? 0), 0); }

export function PlanRoutinesRoom({ routines }: { routines: PlanRoutine[] }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('today');
  const [routineId, setRoutineId] = useState(routines[0]?.id ?? '');
  const [variant, setVariant] = useState<'full' | 'quick' | 'low'>('full');
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const routine = routines.find((item) => item.id === routineId) ?? routines[0];
  const fullSteps = routine?.steps ?? [];
  const visibleSteps = variant === 'full' ? fullSteps : variant === 'quick' ? fullSteps.slice(0, Math.min(5, fullSteps.length)) : fullSteps.slice(0, Math.min(4, fullSteps.length));
  const activeStep = visibleSteps[clamp(stepIndex, 0, Math.max(0, visibleSteps.length - 1))];
  useEffect(() => { if (!playing) return; const timer = window.setInterval(() => setElapsed((value) => value + 1), 1000); return () => window.clearInterval(timer); }, [playing]);
  useEffect(() => { setStepIndex(0); setElapsed(0); setPlaying(false); }, [routineId, variant]);
  const stepSeconds = Math.max(60, (activeStep?.durationMinutes ?? 5) * 60);
  const pct = Math.min(100, Math.round((elapsed / stepSeconds) * 100));
  const materialText = activeStep?.notes?.match(/(?:journal|water|mat|cushion|notebook|notes app|space)/gi) ?? [];

  return <PlanInstrumentChrome title="PLAN · ROUTINES" subtitle="Guided sequences for a calmer, brighter you. Different days call for different energy." activeInstrument="Routines" horizon={horizon} onHorizonChange={setHorizon} centerLabel={HORIZON_LABEL[horizon]}>
    <section className={`${styles.familyStage} ${styles.routinesStage}`}>
      <div className={styles.versionRow}>{(['full','quick','low'] as const).map((item) => { const steps = item === 'full' ? fullSteps : item === 'quick' ? fullSteps.slice(0,5) : fullSteps.slice(0,4); return <button key={item} type="button" className={variant === item ? styles.selectedVersion : ''} onClick={() => setVariant(item)}><span className={styles.versionPearl}/><strong>{item === 'full' ? 'Full version' : item === 'quick' ? 'Quick version' : 'Low-energy version'}</strong><small>{item === 'full' ? 'A complete reset' : item === 'quick' ? 'Core essentials' : 'Gentle and kind'}</small><em>{steps.length} steps · {totalDuration(steps)} min</em></button>; })}</div>
      <div className={styles.routineNote}>Routines adapt to your time, energy, and day.<br/>Skip, pause, or switch anytime.<br/>Glow keeps the sequence visible.</div>
      <div className={styles.routineHeader}><span>{variant.toUpperCase()} VERSION</span><h2>{routine?.name ?? 'No routine selected'}</h2><p>{routine?.description ?? 'Choose a real saved routine to begin.'}</p><select value={routineId} onChange={(event) => setRoutineId(event.target.value)} aria-label="Switch routine">{routines.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div>
      <PlanOrbitField dense />
      <div className={styles.routineTrack}>{visibleSteps.map((step, index) => <button type="button" key={step.id} onClick={() => { setStepIndex(index); setElapsed(0); }} className={`${styles.routineStep} ${index === stepIndex ? styles.activeRoutineStep : ''} ${index < stepIndex ? styles.doneRoutineStep : ''}`}><span>{index + 1}</span><strong>{step.title}</strong><small>{step.durationMinutes ? `${step.durationMinutes} min` : 'No duration'}</small></button>)}</div>
      {activeStep ? <div className={styles.activeStepCard}><b>{stepIndex + 1}</b><div><strong>{activeStep.title}</strong><small>{activeStep.durationMinutes ? `${activeStep.durationMinutes} min` : 'No duration set'}</small></div><button type="button" onClick={() => setPlaying((value) => !value)}>{playing ? <Pause/> : <Play/>}</button></div> : null}
      <div className={styles.brightPearl}><span/>A brighter you<br/>— step by step</div>
    </section>
    <section className={styles.routineBottom}>
      <div className={styles.conductorPanel}><div className={styles.panelTitle}>NOW PLAYING</div><div className={styles.nowPlaying}><span className={styles.albumGlow}/><div><strong>{activeStep?.title ?? 'Nothing playing'}</strong><small>{playing ? 'Guidance in progress' : 'Ready when you are'}</small></div></div><div className={styles.transport}><button onClick={() => setStepIndex((value) => Math.max(0,value-1))}>‹</button><button onClick={() => setPlaying((value)=>!value)}>{playing?<Pause/>:<Play/>}</button><button onClick={() => setStepIndex((value) => Math.min(visibleSteps.length-1,value+1))}>›</button></div></div>
      <div className={styles.conductorPanel}><div className={styles.panelTitle}>STEP DETAILS</div><strong>{activeStep?.title ?? 'No step'}</strong><p>{activeStep?.notes ?? 'No notes recorded for this step.'}</p></div>
      <div className={styles.conductorPanel}><div className={styles.panelTitle}>TIMER</div><div className={styles.timerRing} style={{ '--timer': `${pct * 3.6}deg` } as React.CSSProperties}><strong>{String(Math.floor(elapsed/60)).padStart(2,'0')}:{String(elapsed%60).padStart(2,'0')}</strong><small>/ {activeStep?.durationMinutes ?? 5}:00</small></div><div className={styles.timerActions}><button onClick={()=>setPlaying((v)=>!v)}>{playing?'Pause':'Start'}</button><button onClick={()=>{setStepIndex((v)=>Math.min(visibleSteps.length-1,v+1));setElapsed(0);}}>Skip</button></div></div>
      <div className={styles.conductorPanel}><div className={styles.panelTitle}>MATERIALS <span>Optional</span></div>{materialText.length ? [...new Set(materialText)].map((item)=><p key={item}>• {item}</p>) : <p>No materials recorded for this step.</p>}</div>
      <div className={styles.conductorPanel}><div className={styles.panelTitle}>IF YOU SKIP…</div><p>Glow keeps the remaining sequence visible and moves you to the next recorded step. Nothing is treated as a failed day.</p><div className={styles.skipPath}>○ · ○ · <b>●</b> · ○ · ○</div></div>
    </section>
  </PlanInstrumentChrome>;
}

export type PlanProject = { id: string; title: string; area: string; status: string; priority: string; progress: number; nextAction: string | null; deadline: string | null; notes: string | null; milestones: unknown[]; relatedTaskIds: string[]; activity: unknown[]; createdAt: string; updatedAt: string };

function projectStage(progress: number) { return clamp(Math.floor(progress / 20), 0, 4); }
function parseLines(value: string | null) { return (value ?? '').split(/\n+/).map((line)=>line.trim()).filter(Boolean); }
function blockerLines(project: PlanProject) { const lines = parseLines(project.notes).filter((line)=>/block|risk|waiting|issue|stuck/i.test(line)); if (project.deadline && new Date(project.deadline).getTime() < Date.now() && project.progress < 100) lines.unshift('Deadline has passed while project remains incomplete.'); return lines; }

export function PlanProjectsRoom({ projects }: { projects: PlanProject[] }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('month');
  const [selectedId, setSelectedId] = useState(projects.find((item)=>item.status==='active')?.id ?? projects[0]?.id ?? '');
  const [view, setView] = useState<'List'|'Board'|'Timeline'|'Gallery'>('Timeline');
  const selected = projects.find((item)=>item.id===selectedId) ?? projects[0];
  const stage = selected ? projectStage(selected.progress) : 0;
  const stages = ['Discover','Define','Design','Build','Launch'];
  const notes = parseLines(selected?.notes ?? null);
  const blockers = selected ? blockerLines(selected) : [];
  const daysLeft = selected?.deadline ? Math.ceil((new Date(selected.deadline).getTime()-Date.now())/DAY) : null;
  return <PlanInstrumentChrome title="PLAN · PROJECTS" subtitle="Turn ideas into impact. Organize, align, and move things forward." activeInstrument="Projects" horizon={horizon} onHorizonChange={setHorizon} centerLabel={HORIZON_LABEL[horizon]}>
    <section className={`${styles.familyStage} ${styles.projectsStage}`}>
      <div className={styles.projectViews}>{(['List','Board','Timeline','Gallery'] as const).map((item)=><button key={item} className={view===item?styles.activeView:''} onClick={()=>setView(item)}>{item}</button>)}</div>
      {selected ? <>
        <div className={styles.projectHero}><div><small>● PROJECT</small><h2>{selected.title}</h2><p>{selected.area} · {selected.status}</p></div><div className={styles.projectMeta}><span>{selected.deadline ? `Deadline ${longDate(selected.deadline)}` : 'No deadline'}</span><b>{selected.progress}%</b></div><div className={styles.stageLine}>{stages.map((name,index)=><div key={name} data-state={index<stage?'done':index===stage?'current':'future'}><i>{index+1}</i><strong>{name}</strong><small>{index<stage?'Completed':index===stage?'In progress':'Not started'}</small></div>)}</div></div>
        <PlanOrbitField dense />
        <div className={styles.projectCore}><span className={styles.projectCrystal}/><strong>{selected.title}</strong><small>{selected.area} · {selected.progress}%</small><em>{stages[stage]}</em></div>
        <div className={`${styles.floatPanel} ${styles.nextActions}`}><div className={styles.panelTitle}>NEXT ACTIONS</div>{selected.nextAction?<p>○ {selected.nextAction}</p>:<p>No next action recorded.</p>}{selected.relatedTaskIds.length?<small>{selected.relatedTaskIds.length} linked task{selected.relatedTaskIds.length===1?'':'s'}</small>:null}</div>
        <div className={`${styles.floatPanel} ${styles.projectNotes}`}><div className={styles.panelTitle}>NOTES</div>{notes.length?notes.slice(0,4).map((line)=><p key={line}>• {line}</p>):<p>No notes recorded.</p>}</div>
        <div className={`${styles.floatPanel} ${styles.projectFiles}`}><div className={styles.panelTitle}>FILES</div><p><Folder/> No files are linked in the current project record.</p></div>
        <div className={`${styles.floatPanel} ${styles.projectInspiration}`}><div className={styles.panelTitle}>INSPIRATION</div><div className={styles.inspirationEmpty}>Visual references appear here when linked to the project.</div></div>
        <div className={`${styles.floatPanel} ${styles.projectBlockers}`}><div className={styles.panelTitle}>BLOCKERS</div>{blockers.length?blockers.slice(0,3).map((line,index)=><p key={line}><AlertTriangle/> {line} <b>{index===0?'High':'Watch'}</b></p>):<p>No blocker is recorded.</p>}</div>
        <aside className={styles.projectRail}><div className={styles.projectRailCard}><div className={styles.panelTitle}>DEADLINE</div><strong>{selected.deadline?longDate(selected.deadline):'Not set'}</strong><small>{daysLeft===null?'No deadline':daysLeft<0?`${Math.abs(daysLeft)} days overdue`:`${daysLeft} days left`}</small></div><div className={styles.projectRailCard}><div className={styles.panelTitle}>PEOPLE</div><p>No collaborators linked in this project record.</p></div><div className={styles.projectRailCard}><div className={styles.panelTitle}>AUTOMATION</div><p>Automation stays off until explicitly configured.</p></div></aside>
      </>:<div className={styles.emptyCenter}>No projects are saved yet.</div>}
    </section>
    <section className={styles.projectTimeline}>{selected?<><div className={styles.panelTitle}>PROJECT TIMELINE</div><div className={styles.timelineTrack}>{stages.map((name,index)=><span key={name} style={{ left:`${index*20}%`, width:'18%' }} data-done={index<=stage}>{name}</span>)}</div><div className={styles.recentDecisions}><strong>Recent activity</strong><p>{selected.activity.length ? `${selected.activity.length} project activity entr${selected.activity.length===1?'y':'ies'} recorded.` : 'No project activity recorded yet.'}</p></div></>:null}</section>
  </PlanInstrumentChrome>;
}

export type PlanGoal = { id:string; title:string; description:string|null; category:string; status:string; targetDate:string|null; progress:number };
export type GoalSupport = { id:string; title:string; kind:'Project'|'Habit'|'Routine'; subtitle:string };

export function PlanGoalsRoom({ goals, supports }: { goals: PlanGoal[]; supports: GoalSupport[] }) {
  const [horizon,setHorizon]=useState<PlanHorizon>('three-months');
  const [selectedId,setSelectedId]=useState(goals.find((g)=>g.status==='in_progress')?.id??goals[0]?.id??'');
  const selected=goals.find((g)=>g.id===selectedId)??goals[0];
  const related=selected?supports.filter((item)=>overlaps(`${selected.title} ${selected.description??''} ${selected.category}`,`${item.title} ${item.subtitle}`)).slice(0,7):[];
  return <PlanInstrumentChrome title="PLAN · GOALS" subtitle="Distant tomorrows, made closer. Set your horizons and see the path unfold." activeInstrument="Goals" horizon={horizon} onHorizonChange={setHorizon} centerLabel={HORIZON_LABEL[horizon]}>
    <section className={`${styles.familyStage} ${styles.goalsStage}`}>
      <div className={styles.goalHaze}/><div className={styles.goalPath}/>
      <div className={styles.todayPearl}>TODAY</div>
      {goals.slice(0,4).map((goal,index)=><button type="button" key={goal.id} className={`${styles.goalMountain} ${selected?.id===goal.id?styles.selectedMountain:''}`} style={{ left:`${9+index*24}%`, '--mountainScale': `${1-index*.09}` } as React.CSSProperties} onClick={()=>setSelectedId(goal.id)}><span className={styles.mountainPeak}/><strong>{goal.title.toUpperCase()}</strong><small>{goal.category}</small><em>{goal.progress}% closer</em></button>)}
      {related.map((item,index)=><div key={`${item.kind}-${item.id}`} className={styles.goalSupport} style={{ left:`${29+(index%4)*15}%`, top:`${50+(index%2)*14}%` }}><span>{item.kind}</span><strong>{item.title}</strong><small>{item.subtitle}</small></div>)}
      <p className={styles.goalQuote}>“Progress turns distant<br/>possibilities into familiar places.”</p>
      {!goals.length?<div className={styles.emptyCenter}>No goals are saved yet. The horizon remains open.</div>:null}
    </section>
    <section className={styles.goalInspector}>{selected?<><div className={styles.goalSummary}><Leaf/><h3>{selected.title}</h3><p>{selected.description||'No description recorded.'}</p><strong>{selected.progress}% closer</strong><small>Target date · {selected.targetDate?longDate(selected.targetDate):'Not set'}</small></div><div className={styles.goalFact}><span>EMOTIONAL REASON</span><p>Not recorded in the current goal model.</p></div><div className={styles.goalFact}><span>TARGET DATE</span><p>{selected.targetDate?longDate(selected.targetDate):'Not set'}</p></div><div className={styles.goalFact}><span>EVIDENCE OF PROGRESS</span><p>{selected.progress}% recorded progress</p></div><div className={styles.goalFact}><span>LIFE AREA</span><p>{selected.category}</p></div><div className={styles.goalFact}><span>FLEXIBILITY</span><p>Not recorded</p></div><div className={styles.goalFact}><span>REVIEW FREQUENCY</span><p>Not recorded</p></div><div className={styles.goalLinks}><strong>Related Glow Objects</strong>{related.length?related.map((item)=><p key={`${item.kind}-${item.id}`}>{item.kind} · {item.title}</p>):<p>No confident cross-links yet.</p>}</div></>:null}</section>
  </PlanInstrumentChrome>;
}

export type PlanCalendarEvent = { id:string; title:string; description:string|null; startAt:string; endAt:string|null; location:string|null; allDay:boolean; color:string|null; source:string|null };
export type PlanningTask = { id:string; title:string; dueDate:string|null; status:string; priority:string };

function categoryForEvent(event: PlanCalendarEvent) {
  const text=`${event.title} ${event.description??''}`.toLowerCase();
  if(/focus|deep|design|write|study|project/.test(text))return'focus';
  if(/family|dinner|date|friend|social|birthday/.test(text))return'personal';
  if(/walk|gym|workout|pilates|wellness|therapy|doctor/.test(text))return'wellness';
  if(/breakfast|lunch|brunch|dinner|meal/.test(text))return'meal';
  if(/prepare|prep|review/.test(text))return'prep';
  return'meeting';
}

export function PlanCalendarRoom({ events }: { events: PlanCalendarEvent[] }) {
  const [horizon,setHorizon]=useState<PlanHorizon>('week');
  const [view,setView]=useState<'Day'|'Week'|'Month'>('Week');
  const [weekOffset,setWeekOffset]=useState(0);
  const weekStart=useMemo(()=>new Date(startOfWeek(new Date()).getTime()+weekOffset*7*DAY),[weekOffset]);
  const weekDays=useMemo(()=>Array.from({length:7},(_,i)=>new Date(weekStart.getTime()+i*DAY)),[weekStart]);
  const weekEnd=new Date(weekStart.getTime()+7*DAY);
  const visible=events.filter((event)=>{const d=new Date(event.startAt);return d>=weekStart&&d<weekEnd;});
  const dayStartHour=6, dayEndHour=22;
  const totalMinutes=(dayEndHour-dayStartHour)*60;
  const durationByCategory=visible.reduce<Record<string,number>>((acc,event)=>{const cat=categoryForEvent(event);acc[cat]=(acc[cat]??0)+minutesBetween(event.startAt,event.endAt);return acc;},{});
  const scheduledMinutes=Object.values(durationByCategory).reduce((a,b)=>a+b,0);
  const focusPct=scheduledMinutes?Math.round(((durationByCategory.focus??0)/scheduledMinutes)*100):0;
  const prepEvents=visible.filter((event)=>/prepare|prep|review|brief|notes|deck|slides/i.test(`${event.title} ${event.description??''}`));
  const openHours=Math.max(0,Math.round(((7*totalMinutes)-scheduledMinutes)/60*10)/10);
  return <PlanInstrumentChrome title="PLAN · CALENDAR" subtitle="A more intentional day. See, shape, and protect your time." activeInstrument="Calendar" horizon={horizon} onHorizonChange={setHorizon} centerLabel={HORIZON_LABEL[horizon]}>
    <section className={`${styles.familyStage} ${styles.calendarStage}`}>
      <div className={styles.calendarToolbar}><button onClick={()=>setWeekOffset((v)=>v-1)}>‹</button><button onClick={()=>setWeekOffset(0)}>Today</button><button onClick={()=>setWeekOffset((v)=>v+1)}>›</button><strong>{shortDate(weekStart)} – {shortDate(new Date(weekEnd.getTime()-DAY))}</strong><div>{(['Day','Week','Month'] as const).map((item)=><button key={item} className={view===item?styles.activeView:''} onClick={()=>setView(item)}>{item}</button>)}</div></div>
      <div className={styles.weekGrid}><div className={styles.timeColumn}>{Array.from({length:9},(_,i)=><span key={i} style={{ top:`${i*12.5}%` }}>{dayStartHour+i*2<=12?`${dayStartHour+i*2} AM`:`${dayStartHour+i*2-12} PM`}</span>)}</div>{weekDays.map((day,index)=><div className={styles.dayColumn} key={day.toISOString()}><header><strong>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][index]}</strong><small>{shortDate(day)}</small></header>{visible.filter((event)=>dateKey(event.startAt)===dateKey(day)&&!event.allDay).map((event)=>{const start=new Date(event.startAt);const startMin=(start.getHours()-dayStartHour)*60+start.getMinutes();const duration=minutesBetween(event.startAt,event.endAt);return <button key={event.id} className={`${styles.calendarEvent} ${styles[`event_${categoryForEvent(event)}`]}`} style={{ top:`${clamp(startMin/totalMinutes*100,0,96)}%`, height:`${Math.max(5,Math.min(28,duration/totalMinutes*100))}%` }}><strong>{event.title}</strong><small>{timeLabel(event.startAt)}{event.endAt?` – ${timeLabel(event.endAt)}`:''}</small></button>})}</div>)}</div>
      <aside className={styles.calendarRail}><div className={styles.panelTitle}>CALENDAR INTELLIGENCE</div><Link href="/planning/studio">✦ Rearrange my day</Link><Link href="/today?room=focus">◇ Protect this time</Link><Link href="/planning/studio">◷ Find a better time</Link><Link href="/planning/studio">♙ Compare schedules</Link><button type="button" onClick={()=>document.getElementById('prep-shadows')?.scrollIntoView({behavior:'smooth'})}>☷ Show hidden preparation</button><div className={styles.miniMonth}><strong>{weekStart.toLocaleDateString('en-US',{month:'long',year:'numeric'})}</strong><div>{Array.from({length:31},(_,i)=><span key={i}>{i+1}</span>)}</div></div></aside>
    </section>
    <section className={styles.calendarBottom}><div className={styles.calendarInsight}><div className={styles.panelTitle}>DAY INSIGHTS</div><div className={styles.focusRing} style={{'--focus':`${focusPct*3.6}deg`} as React.CSSProperties}><strong>{focusPct}%</strong></div><p>Focus · {Math.round((durationByCategory.focus??0)/60*10)/10}h</p><p>Meetings · {Math.round((durationByCategory.meeting??0)/60*10)/10}h</p><p>Personal · {Math.round((durationByCategory.personal??0)/60*10)/10}h</p></div><div className={styles.prepShadows} id="prep-shadows"><div className={styles.panelTitle}>PREPARATION SHADOWS</div>{prepEvents.length?prepEvents.slice(0,4).map((event)=><p key={event.id}><b>{event.title}</b><span>{event.description||'Preparation context is named in this event.'}</span></p>):<p>No preparation is explicitly linked in this week’s event data.</p>}</div><div className={styles.openTime}><div className={styles.panelTitle}>OPEN TIME</div><strong>{openHours}h</strong><p>Approximate unscheduled time across this visible week.</p><Link href="/planning/studio">Find best time →</Link></div></section>
  </PlanInstrumentChrome>;
}

export function PlanPlanningStudio({ events, tasks }: { events: PlanCalendarEvent[]; tasks: PlanningTask[] }) {
  const [horizon,setHorizon]=useState<PlanHorizon>('week');
  const [mode,setMode]=useState<'Day'|'Week'|'Month'|'Scenarios'|'Guided'|'Auto Draft'|'Manual'>('Week');
  const [scenario,setScenario]=useState(0);
  const [receipt,setReceipt]=useState('Draft workspace · calendar unchanged');
  const weekStart=startOfWeek(new Date()); const weekEnd=new Date(weekStart.getTime()+7*DAY);
  const visible=events.filter((event)=>{const d=new Date(event.startAt);return d>=weekStart&&d<weekEnd;});
  const ideas=tasks.filter((task)=>task.status!=='done'&&!task.dueDate).slice(0,5);
  const scenarios=[['Productive Week','Focus on deep work'],['Balanced Week','Work + wellbeing'],['Creative Push','Explore new ideas']];
  return <PlanInstrumentChrome title="PLAN · PLANNING STUDIO" subtitle="Explore possibilities. Arrange. Refine. Nothing becomes real until you approve." activeInstrument="Calendar" horizon={horizon} onHorizonChange={setHorizon} centerLabel={HORIZON_LABEL[horizon]} rightReceipt={receipt}>
    <section className={`${styles.familyStage} ${styles.studioStage}`}>
      <div className={styles.studioModes}>{(['Day','Week','Month','Scenarios','Guided','Auto Draft','Manual'] as const).map((item)=><button key={item} onClick={()=>setMode(item)} className={mode===item?styles.activeStudioMode:''}>{item}<small>{item==='Day'?'Plan today':item==='Week'?'Map the week':item==='Month'?'See the big picture':item==='Scenarios'?'Compare paths':item==='Guided'?'Get suggestions':item==='Auto Draft'?'Let Glow propose':'Arrange freely'}</small></button>)}</div>
      <div className={styles.studioBoard}><header><strong>{shortDate(weekStart)} – {shortDate(new Date(weekEnd.getTime()-DAY))}</strong><span>This Week</span></header><div className={styles.studioWeek}>{Array.from({length:7},(_,dayIndex)=>{const day=new Date(weekStart.getTime()+dayIndex*DAY);return <div key={day.toISOString()}><h4>{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][dayIndex]}<small>{shortDate(day)}</small></h4>{visible.filter((event)=>dateKey(event.startAt)===dateKey(day)).slice(0,5).map((event)=><div key={event.id} className={`${styles.studioEvent} ${styles[`event_${categoryForEvent(event)}`]}`}><strong>{event.title}</strong><small>{event.allDay?'All day':timeLabel(event.startAt)}</small></div>)}</div>})}</div></div>
      <div className={styles.ideaPool}><div className={styles.panelTitle}>IDEAS POOL <b>{ideas.length}</b></div>{ideas.length?ideas.map((task)=><p key={task.id}>○ {task.title}<small>Unscheduled task</small></p>):<p>No unscheduled task ideas are waiting.</p>}</div>
      <div className={styles.scenarioRow}>{scenarios.map(([name,copy],index)=><button key={name} className={scenario===index?styles.selectedScenario:''} onClick={()=>setScenario(index)}><strong>Scenario {String.fromCharCode(65+index)}<br/>{name}</strong><small>{copy}</small><span className={styles.scenarioWave}/><em>{visible.length} events · {tasks.filter((t)=>t.status!=='done').length} open tasks</em></button>)}<button className={styles.createScenario} onClick={()=>setReceipt('New scenario shell created locally · calendar unchanged')}>＋<span>Create scenario</span></button></div>
      <div className={styles.whatIf}>What if I moved<br/>this to Friday?<span className={styles.whatIfPearl}/></div>
    </section>
    <section className={styles.studioBottom}><div><div className={styles.panelTitle}>GUIDED PLANNING</div><strong>What would make this week feel successful?</strong><input placeholder="Share your thoughts…" /></div><div><div className={styles.panelTitle}>AUTO DRAFT</div><p>Glow can propose around your real commitments. Nothing is written until an execution action exists.</p><button onClick={()=>setReceipt('Draft generated for comparison · calendar unchanged')}>✦ Generate draft</button></div><div><div className={styles.panelTitle}>COMPARISON</div><div className={styles.compareLines}/><button onClick={()=>setMode('Scenarios')}>Open comparison</button></div><div><div className={styles.panelTitle}>COMMIT STATUS</div><p>Current studio is simulation-only. Calendar events remain unchanged.</p><Link href="/calendar">Review Calendar →</Link></div></section>
  </PlanInstrumentChrome>;
}
