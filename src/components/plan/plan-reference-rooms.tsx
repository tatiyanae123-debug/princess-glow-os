'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import {
  BookOpen,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Droplets,
  Heart,
  Leaf,
  Moon,
  Pause,
  Play,
  Plus,
  Sparkles,
  Sun,
  Target,
} from 'lucide-react';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import styles from './plan-reference-rooms.module.css';

const DAY = 86_400_000;

function horizonLabel(horizon: PlanHorizon) {
  if (horizon === 'today') return 'TODAY';
  if (horizon === 'week') return 'THIS WEEK';
  if (horizon === 'two-weeks') return 'NEXT 2 WEEKS';
  if (horizon === 'month') return 'THIS MONTH';
  return 'NEXT 3 MONTHS';
}

function shortDate(value: string | null | undefined) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function minutesFromText(text: string | null | undefined) {
  if (!text) return null;
  const match = text.match(/\b(\d{1,3})\s*(?:m|min|mins|minute|minutes)\b/i);
  return match ? Number(match[1]) : null;
}

function frequencyLabel(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function openGlow(context: Record<string, string> = {}) {
  document.dispatchEvent(new CustomEvent('glow:open', { detail: { context } }));
}

export type PlanHabitItem = {
  id: string;
  name: string;
  description: string | null;
  frequency: string;
  targetCount: number;
  rhythm: number;
  streak: number;
};

const habitIcons = [Sun, Leaf, Droplets, Moon, BookOpen, Heart];

export function PlanHabitsRoom({ habits }: { habits: PlanHabitItem[] }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('today');
  const shown = habits.slice(0, 6);
  const [selectedId, setSelectedId] = useState(shown[0]?.id ?? '');
  const selected = habits.find((habit) => habit.id === selectedId) ?? shown[0] ?? null;
  const overall = habits.length ? Math.round(habits.reduce((sum, habit) => sum + habit.rhythm, 0) / habits.length) : 0;
  const onTrack = habits.filter((habit) => habit.rhythm >= 70).length;

  return (
    <PlanInstrumentChrome
      title="PLAN · HABITS"
      subtitle="Small rhythms. A brighter you. Consistency grows a kinder future."
      activeInstrument="Habits"
      horizon={horizon}
      onHorizonChange={setHorizon}
      centerLabel={horizonLabel(horizon)}
    >
      <section className={styles.stage} aria-label="Habits rhythm constellation">
        <div className={styles.habitWorld}>
          <div className={styles.habitOrbit}>
            <div className={styles.orbitLine}/><div className={styles.orbitLine}/><div className={styles.orbitLine}/><div className={styles.orbitLine}/><div className={styles.orbitLine}/>
            <div className={styles.orbitDots}/>
            <p className={`${styles.habitQuote} ${styles.habitQuoteLeft}`}>Habits are seeds<br/>of the life you want.</p>
            <p className={`${styles.habitQuote} ${styles.habitQuoteRight}`}>Not perfect days,<br/>but a steady rhythm.</p>
            <div className={`${styles.habitCenter} ${styles.pearl}`}>
              <strong>My Habits</strong>
              <span>{habits.length} habit{habits.length === 1 ? '' : 's'}</span>
            </div>
            {shown.map((habit, index) => {
              const Icon = habitIcons[index] ?? Sparkles;
              const dots = Math.max(0, Math.min(7, Math.round(habit.rhythm / 14.3)));
              return (
                <button key={habit.id} type="button" className={styles.satellite} data-pos={index} onClick={() => setSelectedId(habit.id)} aria-pressed={selected?.id === habit.id}>
                  <span className={`${styles.satelliteCard} ${styles.glass}`}>
                    <strong>{habit.name}</strong>
                    <span>{frequencyLabel(habit.frequency)} · {habit.targetCount > 1 ? `${habit.targetCount}× target` : '1× target'}</span>
                    <span className={styles.rhythmDots}>{Array.from({length:7},(_,dot)=><i key={dot} className={dot<dots?styles.on:undefined}/>)}</span>
                  </span>
                  <span className={`${styles.satelliteOrb} ${styles.pearl}`}><Icon size={25} strokeWidth={1.25}/></span>
                </button>
              );
            })}
            {!shown.length ? <p className={styles.empty} style={{position:'absolute',left:'50%',top:'56%',transform:'translate(-50%,-50%)'}}>Your habit field is ready. Add a habit to begin the constellation.</p> : null}
          </div>

          <aside className={`${styles.habitInspector} ${styles.glass}`}>
            <div className={styles.inspectorHead}>
              <span className={`${styles.inspectorIcon} ${styles.pearl}`}><Sun size={18}/></span>
              <div><small>HABIT DETAILS</small><strong>{selected?.name ?? 'No habit selected'}</strong><small>{selected?.description ?? 'Select a habit to inspect its rhythm.'}</small></div>
            </div>
            <div className={styles.detailRow}><span>Frequency</span><span>{selected ? frequencyLabel(selected.frequency) : '—'}</span></div>
            <div className={styles.detailRow}><span>Minimum version</span><span>{selected ? (minutesFromText(selected.description) ? `${minutesFromText(selected.description)} minutes` : 'Not set') : '—'}</span></div>
            <div className={styles.detailRow}><span>Ideal version</span><span>{selected ? (minutesFromText(selected.description) ? `${Math.max(10,(minutesFromText(selected.description) ?? 5)*2)} minutes` : 'Not set') : '—'}</span></div>
            <div className={styles.detailRow}><span>Time window</span><span>Not set</span></div>
            <div className={styles.detailRow}><span>Context</span><span>Not set</span></div>
            <div className={styles.detailRow}><span>Flexible target</span><span>{selected && selected.targetCount > 1 ? `${selected.targetCount}×` : 'Single completion'}</span></div>
            <div className={styles.detailRow}><span>Recovery rule</span><span>Not configured</span></div>
            <div className={styles.detailRow}><span>Rhythm</span><span>{selected ? `${selected.rhythm}% · ${selected.streak}d streak` : '—'}</span></div>
            <button type="button" onClick={() => location.assign('/habits/rhythm-garden')} className={styles.glass} style={{width:'100%',borderRadius:999,padding:'8px',marginTop:9,fontSize:8}}>Open Rhythm Garden</button>
          </aside>

          <div className={styles.habitBottom}>
            <div className={`${styles.metricPanel} ${styles.glass}`}>
              <h3>RHYTHM VIEW</h3>
              <div className={styles.miniChart}>
                <svg viewBox="0 0 250 74" preserveAspectRatio="none" aria-hidden="true"><polyline points="0,55 40,39 80,47 120,27 160,43 200,24 250,36"/>{[0,40,80,120,160,200,250].map((x,index)=><circle key={x} cx={x} cy={[55,39,47,27,43,24,36][index]} r="3"/>)}</svg>
              </div>
            </div>
            <div className={`${styles.metricPanel} ${styles.glass}`}>
              <h3>HABIT BALANCE</h3>
              <div className={styles.balanceRing}><span>{habits.length}</span></div>
            </div>
            <div className={`${styles.metricPanel} ${styles.glass}`}>
              <h3>INSIGHTS</h3>
              <div className={styles.insightLine}><b>{overall}%</b><div>Overall rhythm<br/><small>Derived from stored completion history</small></div></div>
              <div className={styles.insightLine}><b>{onTrack}/{habits.length}</b><div>Habits on track<br/><small>70% rhythm or higher</small></div></div>
              <div className={styles.insightLine}><b>{Math.max(0,...habits.map((habit)=>habit.streak))}d</b><div>Longest current streak<br/><small>Secondary to recovery and rhythm</small></div></div>
            </div>
          </div>
        </div>
      </section>
    </PlanInstrumentChrome>
  );
}

export type PlanRoutineStep = { id: string; title: string; notes: string | null; durationMinutes: number | null; order: number };
export type PlanRoutineItem = { id: string; name: string; description: string | null; timeOfDay: string; steps: PlanRoutineStep[] };

export function PlanRoutinesRoom({ routines }: { routines: PlanRoutineItem[] }) {
  const [horizon,setHorizon]=useState<PlanHorizon>('today');
  const [routineId,setRoutineId]=useState(routines[0]?.id ?? '');
  const [activeStep,setActiveStep]=useState(0);
  const routine=routines.find((item)=>item.id===routineId) ?? routines[0] ?? null;
  const steps=routine?.steps ?? [];
  const total=steps.reduce((sum,step)=>sum+(step.durationMinutes ?? 0),0);
  const quickCount=Math.max(1,Math.ceil(steps.length*.65));
  const lowCount=Math.max(1,Math.ceil(steps.length*.5));
  const current=steps[activeStep] ?? null;

  return <PlanInstrumentChrome title="PLAN · ROUTINES" subtitle="Guided sequences for a calmer, brighter you. Different days call for different energy." activeInstrument="Routines" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)}>
    <section className={styles.stage} aria-label="Routine conductor">
      <div className={styles.routineWorld}>
        <div className={styles.routineVariants}>
          <button className={`${styles.variant} ${styles.glass} ${styles.active}`}><span className={`${styles.variantOrb} ${styles.pearl}`}/><span><strong>Full version</strong><span>A complete reset</span><span>{steps.length} steps · {total || '—'} min</span></span></button>
          <button className={`${styles.variant} ${styles.glass}`}><span className={`${styles.variantOrb} ${styles.pearl}`}/><span><strong>Quick version</strong><span>Core essentials</span><span>{quickCount} steps · preview</span></span></button>
          <button className={`${styles.variant} ${styles.glass}`}><span className={`${styles.variantOrb} ${styles.pearl}`}/><span><strong>Low-energy version</strong><span>Gentle and kind</span><span>{lowCount} steps · preview</span></span></button>
          <div className={`${styles.variantNote} ${styles.glass}`}>Routines adapt to your time, energy, and day. Skip, pause, or switch without losing the underlying routine.</div>
        </div>
        <div className={styles.routineTitle}><small>FULL VERSION</small><h2>{routine?.name ?? 'Your routine'}</h2><p>{routine?.description ?? 'Choose a routine and follow the flow.'}</p></div>
        {routines.length>1?<select value={routineId} onChange={(event)=>{setRoutineId(event.target.value);setActiveStep(0)}} aria-label="Switch routine" style={{position:'absolute',top:128,left:360,borderRadius:999,padding:'8px 14px',border:'1px solid rgba(255,255,255,.8)',background:'rgba(255,255,255,.2)',fontSize:8}}>{routines.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select>:null}
        <div className={styles.routinePath}>
          {current?<div className={`${styles.activeStepCard} ${styles.glass}`}><span className={`${styles.inspectorIcon} ${styles.pearl}`}>{activeStep+1}</span><span><b>{current.title}</b><span>{current.durationMinutes ? `${current.durationMinutes} min` : 'No duration set'}</span></span><button className={styles.play} onClick={()=>openGlow({room:'Plan · Routines',routine:routine?.name ?? '',step:current.title})} aria-label="Ask Glow for guidance"><Play size={15}/></button></div>:null}
          {steps.slice(0,8).map((step,index)=>{
            const left=`${6 + index*(88/Math.max(1,Math.min(7,steps.length-1)))}%`;
            return <button key={step.id} type="button" className={`${styles.step} ${index===activeStep?styles.active:''}`} style={{left} as CSSProperties} onClick={()=>setActiveStep(index)}><span className={`${styles.stepOrb} ${styles.pearl}`}>{index<activeStep?<Check size={18}/>:index+1}</span><strong>{step.title}</strong><small>{step.durationMinutes?`${step.durationMinutes} min`:'No time set'}</small></button>
          })}
          {!steps.length?<p className={styles.empty} style={{position:'absolute',left:20,top:78}}>This routine has no saved steps yet. Use the routine library below to add them.</p>:null}
        </div>
        <div className={styles.routineBottom}>
          <div className={`${styles.routinePanel} ${styles.glass}`}><h3>NOW PLAYING</h3><div className={`${styles.variantOrb} ${styles.pearl}`} style={{margin:'8px auto'}}/><strong style={{fontSize:10}}>{current?.title ?? 'No active step'}</strong><p className={styles.empty}>{routine?.timeOfDay ? frequencyLabel(routine.timeOfDay) : 'Anytime'} routine</p></div>
          <div className={`${styles.routinePanel} ${styles.glass}`}><h3>STEP DETAILS</h3><strong style={{fontSize:11}}>{current?.title ?? 'Select a step'}</strong><p className={styles.empty}>{current?.notes ?? 'No step notes saved.'}</p></div>
          <div className={`${styles.routinePanel} ${styles.glass}`}><h3>TIMER</h3><div className={styles.timer}><b>{current?.durationMinutes ? `${String(current.durationMinutes).padStart(2,'0')}:00` : '—'}</b></div><div style={{display:'flex',justifyContent:'center',gap:9}}><button className={styles.play}><Pause size={13}/></button><button className={styles.play} onClick={()=>setActiveStep((value)=>Math.min(steps.length-1,value+1))}><ChevronRight size={14}/></button></div></div>
          <div className={`${styles.routinePanel} ${styles.glass}`}><h3>MATERIALS</h3><div className={styles.materials}><span>Journal or notes app</span><span>Water</span><span>Comfortable space</span><span className={styles.muted}>Only use what the step actually needs.</span></div></div>
          <div className={`${styles.routinePanel} ${styles.glass}`}><h3>IF YOU SKIP…</h3><p className={styles.empty}>Glow keeps the same routine object and adjusts the remaining path instead of creating a duplicate.</p><div className={styles.skipMap}><i/><i/><i/></div></div>
        </div>
      </div>
    </section>
  </PlanInstrumentChrome>;
}

export type PlanGoalItem = { id:string; title:string; description:string|null; category:string; status:string; targetDate:string|null; progress:number };

export function PlanGoalsRoom({ goals }: { goals: PlanGoalItem[] }) {
  const [horizon,setHorizon]=useState<PlanHorizon>('three-months');
  const active=goals.filter((goal)=>goal.status!=='abandoned').slice(0,4);
  const [selectedId,setSelectedId]=useState(active[0]?.id ?? '');
  const selected=goals.find((goal)=>goal.id===selectedId) ?? active[0] ?? null;
  return <PlanInstrumentChrome title="PLAN · GOALS" subtitle="Distant tomorrows, made closer. Set your horizons and see the path unfold." activeInstrument="Goals" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)}>
    <section className={styles.stage} aria-label="Goal horizons">
      <div className={styles.goalsWorld}>
        <div className={styles.horizonScene}>
          <div className={styles.goalPath}/><div className={`${styles.todayPearl} ${styles.pearl}`}>TODAY</div>
          <p className={styles.goalQuote}>“Progress turns distant possibilities into familiar places.”</p>
          {active.map((goal,index)=>{
            const left=[25,47,67,85][index] ?? 50; const scale=[1.13,.9,.76,.64][index] ?? .7;
            return <button type="button" key={goal.id} onClick={()=>setSelectedId(goal.id)} className={styles.goalMountain} style={{left:`${left}%`,transform:`translateX(-50%) scale(${scale})`,transformOrigin:'bottom center',border:0,cursor:'pointer'}} aria-pressed={selected?.id===goal.id}><span className={`${styles.goalPeak} ${styles.pearl}`}/><span className={styles.goalProgress}>{Math.round(goal.progress)}% closer</span><span className={styles.goalLabel}><strong>{goal.title.toUpperCase()}</strong><small>{frequencyLabel(goal.category)}</small></span></button>
          })}
          {!active.length?<p className={styles.empty} style={{position:'absolute',left:'50%',top:'46%',transform:'translate(-50%,-50%)'}}>No active goals yet. Add a goal and it will become a horizon in this landscape.</p>:null}
        </div>
        <div className={styles.goalBottom}>
          <div className={`${styles.goalPanel} ${styles.glass} ${styles.goalSummary}`}><h3>SELECTED GOAL</h3><strong>{selected?.title ?? 'No goal selected'}</strong><p>{selected?.description ?? 'Choose a direction worth moving toward.'}</p><div className={styles.progressBar}><i style={{width:`${Math.max(0,Math.min(100,selected?.progress ?? 0))}%`}}/></div><p>{selected?`${Math.round(selected.progress)}% verified progress`:'—'}</p></div>
          <div className={`${styles.goalPanel} ${styles.glass}`}><h3>GOAL STRUCTURE</h3><div className={styles.goalFields}><div className={styles.goalField}><span>Emotional reason</span><b>{selected?.description ?? 'Not recorded'}</b></div><div className={styles.goalField}><span>Target date</span><b>{shortDate(selected?.targetDate)}</b></div><div className={styles.goalField}><span>Evidence of progress</span><b>{selected?`${Math.round(selected.progress)}% stored progress`:'—'}</b></div><div className={styles.goalField}><span>Life area</span><b>{selected?frequencyLabel(selected.category):'—'}</b></div><div className={styles.goalField}><span>State</span><b>{selected?frequencyLabel(selected.status):'—'}</b></div><div className={styles.goalField}><span>Review frequency</span><b>Not configured</b></div></div></div>
          <div className={`${styles.goalPanel} ${styles.glass}`}><h3>CONNECTED LIFE</h3><div className={styles.linkedList}><span>Projects · linked through Glow Graph when available</span><span>Milestones · derived from verified progress</span><span>Routines · shared objects, never copied</span><span>Habits · shared objects, never copied</span></div></div>
        </div>
      </div>
    </section>
  </PlanInstrumentChrome>;
}

export type PlanProjectItem = { id:string; title:string; area:string; status:string; priority:string; progress:number; deadline:string|null; nextAction:string|null; notes:string|null };

export function PlanProjectsRoom({ projects }: { projects: PlanProjectItem[] }) {
  const [horizon,setHorizon]=useState<PlanHorizon>('month');
  const [selectedId,setSelectedId]=useState(projects.find((project)=>project.status==='active')?.id ?? projects[0]?.id ?? '');
  const selected=projects.find((project)=>project.id===selectedId) ?? projects[0] ?? null;
  const stages=['Discover','Define','Design','Build','Launch'];
  const stageIndex=selected?Math.min(4,Math.floor(Math.max(0,selected.progress)/20)):0;
  const days=selected?.deadline?Math.ceil((new Date(selected.deadline).getTime()-Date.now())/DAY):null;
  return <PlanInstrumentChrome title="PLAN · PROJECTS" subtitle="Turn ideas into impact. Organize, align, and move things forward." activeInstrument="Projects" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)}>
    <section className={styles.stage} aria-label="Project world">
      <div className={styles.projectsWorld}>
        <div className={`${styles.projectHero} ${styles.glass}`}><h2>{selected?.title ?? 'No project selected'}</h2><div className={styles.projectMeta}>{selected?`${selected.area} · ${frequencyLabel(selected.status)} · ${Math.round(selected.progress)}%`:'Create a project to build its world.'}</div><div className={styles.stageLine}>{stages.map((stage,index)=><span key={stage} className={`${styles.stageNode} ${index<stageIndex?styles.done:index===stageIndex?styles.current:''}`} title={stage}>{index+1}</span>)}</div></div>
        {projects.length>1?<select value={selectedId} onChange={(event)=>setSelectedId(event.target.value)} aria-label="Select project" style={{position:'absolute',right:8,top:14,zIndex:4,borderRadius:999,padding:'7px 10px',border:'1px solid rgba(255,255,255,.75)',background:'rgba(255,255,255,.22)',fontSize:8}}>{projects.map((project)=><option key={project.id} value={project.id}>{project.title}</option>)}</select>:null}
        <div className={styles.projectWorkspace}>
          <div className={`${styles.projectCenter} ${styles.pearl}`}><strong>{selected?.title ?? 'Project world'}</strong><small>{selected?`${selected.area} · ${stages[stageIndex]}`:'No project data'}</small></div>
          <div className={`${styles.projectCard} ${styles.actions} ${styles.glass}`}><h3>NEXT ACTIONS</h3><p>{selected?.nextAction ?? 'No next action recorded.'}</p></div>
          <div className={`${styles.projectCard} ${styles.notes} ${styles.glass}`}><h3>NOTES</h3><p>{selected?.notes ?? 'No project notes recorded.'}</p></div>
          <div className={`${styles.projectCard} ${styles.files} ${styles.glass}`}><h3>FILES</h3><p>No project file links are recorded in this project model yet.</p></div>
          <div className={`${styles.projectCard} ${styles.inspiration} ${styles.glass}`}><h3>INSPIRATION</h3><p>Linked visual references will appear here when the shared project graph has them.</p></div>
          <div className={`${styles.projectCard} ${styles.blockers} ${styles.glass}`}><h3>BLOCKERS</h3><p>{selected?.status==='paused'?'Project is intentionally paused.':selected?.nextAction?'No explicit blocker recorded.':'No next action is recorded yet.'}</p></div>
        </div>
        <aside className={styles.projectRail}><div className={styles.glass}><h3>DEADLINE</h3><div className={styles.deadlineBig}>{shortDate(selected?.deadline)}</div><p className={styles.empty}>{days===null?'No deadline stored':days<0?`${Math.abs(days)} days overdue`:`${days} days remaining`}</p></div><div className={styles.glass}><h3>PEOPLE</h3><p className={styles.empty}>No collaborator records are attached to the project model yet.</p></div><div className={styles.glass}><h3>AUTOMATION</h3><p className={styles.empty}>Automation remains off until a verified executor is configured. Ask Glow can propose one without silently enabling it.</p><button type="button" onClick={()=>openGlow({room:'Plan · Projects',project:selected?.title ?? ''})} className={styles.glass} style={{borderRadius:999,padding:'7px 10px',fontSize:8}}>Ask Glow</button></div></aside>
        <div className={styles.projectBottom}><div className={`${styles.timelinePanel} ${styles.glass}`}><h3>PROJECT TIMELINE</h3><div className={styles.timelineRows}>{stages.map((stage,index)=><div className={styles.timelineRow} key={stage}><span>{stage}</span><div className={styles.timelineTrack}><i style={{width:`${Math.max(0,Math.min(100,(selected?.progress ?? 0)-index*20))*5}%`}}/></div></div>)}</div></div><div className={`${styles.decisionPanel} ${styles.glass}`}><h3>RECENT DECISIONS</h3><p>Decision history will appear here from the shared History Engine when project decisions have recorded provenance.</p></div></div>
      </div>
    </section>
  </PlanInstrumentChrome>;
}

export type PlanStudioEvent = { id:string; title:string; startAt:string; endAt:string|null; allDay:boolean };
export type PlanPlanningItem = { id:string; title:string; level:string; focus:string|null; progress:number; startsAt:string|null; endsAt:string|null };

function startOfWeek(date=new Date()) { const start=new Date(date); const offset=(start.getDay()+6)%7; start.setHours(0,0,0,0); start.setDate(start.getDate()-offset); return start; }
function dayIndexFor(date:Date,weekStart:Date){ return Math.floor((new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime()-weekStart.getTime())/DAY); }

export function PlanPlanningStudio({ events, planning }: { events: PlanStudioEvent[]; planning: PlanPlanningItem[] }) {
  const [horizon,setHorizon]=useState<PlanHorizon>('week');
  const weekStart=useMemo(()=>startOfWeek(),[]);
  const weekEnd=new Date(weekStart.getTime()+6*DAY);
  const weekEvents=events.filter((event)=>{const date=new Date(event.startAt);return date>=weekStart&&date<new Date(weekStart.getTime()+7*DAY)});
  const days=Array.from({length:7},(_,index)=>new Date(weekStart.getTime()+index*DAY));
  return <PlanInstrumentChrome title="PLAN · PLANNING STUDIO" subtitle="Explore possibilities. Arrange. Refine. Nothing becomes real until you approve." activeInstrument="Calendar" horizon={horizon} onHorizonChange={setHorizon} centerLabel={`${weekStart.toLocaleDateString('en-US',{month:'short',day:'numeric'})} – ${weekEnd.toLocaleDateString('en-US',{month:'short',day:'numeric'})}`}>
    <section className={styles.stage} aria-label="Planning Studio">
      <div className={styles.planningWorld}>
        <div className={styles.studioModes}>{['Day','Week','Month','Scenarios','Guided','Auto Draft','Manual'].map((mode)=><button key={mode} className={`${styles.studioMode} ${styles.glass} ${mode==='Week'?styles.active:''}`} onClick={()=>mode==='Auto Draft'?openGlow({room:'Plan · Planning Studio',intent:'Draft a plan using current commitments'}):undefined}><b>{mode}</b><span>{mode==='Week'?'Map the week':mode==='Scenarios'?'Compare paths':mode==='Guided'?'Get suggestions':mode==='Auto Draft'?'Let Glow propose':'Planning instrument'}</span></button>)}</div>
        <div className={`${styles.weekBoard} ${styles.glass}`}><div className={styles.weekHeader}><strong>{weekStart.toLocaleDateString('en-US',{month:'short',day:'numeric'})} – {weekEnd.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</strong><span>This week</span></div><div className={styles.weekGrid}>{days.map((day,index)=><div className={styles.dayCol} key={day.toISOString()}><strong>{day.toLocaleDateString('en-US',{weekday:'short'})}<br/>{day.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</strong>{weekEvents.filter((event)=>dayIndexFor(new Date(event.startAt),weekStart)===index).slice(0,6).map((event)=>{const start=new Date(event.startAt);const end=event.endAt?new Date(event.endAt):new Date(start.getTime()+60*60*1000);const top=event.allDay?2:Math.max(2,Math.min(88,((start.getHours()-6)+start.getMinutes()/60)/15*100));const height=event.allDay?10:Math.max(8,Math.min(38,(end.getTime()-start.getTime())/3600000/15*100));return <div key={event.id} className={styles.eventBlock} style={{top:`${top}%`,height:`${height}%`}}><b>{event.title}</b><small>{event.allDay?'All day':start.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</small></div>})}</div>)}</div></div>
        <aside className={styles.studioRail}><div className={`${styles.askBubble} ${styles.glass}`}>What if I moved this to Friday?</div><div className={`${styles.studioPearl} ${styles.pearl}`}/><button type="button" onClick={()=>openGlow({room:'Plan · Planning Studio',intent:'Simulate a change before applying it'})} className={styles.glass} style={{position:'absolute',right:0,top:192,borderRadius:999,padding:'8px 12px',fontSize:8}}>Ask Glow to simulate</button></aside>
        <div className={styles.scenarioStack}><div className={`${styles.ideasPool} ${styles.glass}`}><h3>IDEAS POOL</h3>{planning.length?planning.slice(0,5).map((item)=><div key={item.id} className={styles.idea}>{item.title} · {frequencyLabel(item.level)}</div>):<p className={styles.empty}>No saved planning ideas yet.</p>}</div><div className={`${styles.scenarioCard} ${styles.glass}`}><h3>SCENARIO A</h3><b>Current commitments</b><span>{weekEvents.length} calendar events</span><div className={styles.scenarioWave}/><span>Verified baseline</span></div><div className={`${styles.scenarioCard} ${styles.glass}`}><h3>SCENARIO B</h3><b>More focused</b><span>Simulation only</span><div className={styles.scenarioWave}/><button onClick={()=>openGlow({room:'Plan · Planning Studio',scenario:'More focused'})} style={{border:0,background:'none',fontSize:7}}>Explore</button></div><div className={`${styles.scenarioCard} ${styles.glass}`}><h3>SCENARIO C</h3><b>More balanced</b><span>Simulation only</span><div className={styles.scenarioWave}/><button onClick={()=>openGlow({room:'Plan · Planning Studio',scenario:'More balanced'})} style={{border:0,background:'none',fontSize:7}}>Explore</button></div><button className={`${styles.createScenario} ${styles.glass}`} onClick={()=>openGlow({room:'Plan · Planning Studio',intent:'Create a new scenario'})}><span><b>+</b>Create scenario</span></button></div>
      </div>
    </section>
  </PlanInstrumentChrome>;
}
