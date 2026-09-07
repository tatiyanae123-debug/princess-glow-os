'use client';

import type { CSSProperties } from 'react';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import {
  Ban,
  BarChart3,
  Circle,
  Clock3,
  FileText,
  Hourglass,
  ListTree,
  Mail,
  Phone,
  Send,
  Sparkles,
  TimerReset,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { updateTaskAction } from '@/app/actions/tasks';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import { PlanOrbitField } from './plan-orbit-field';
import styles from './plan-instruments.module.css';

export type PlanTaskItem = {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string | null;
  completedAt: string | null;
  source: string | null;
  createdAt: string;
};

type ZoneId = 'deep' | 'ready' | 'quick' | 'prep' | 'later' | 'waiting' | 'blocked' | 'unplaced';
type ViewBy = 'readiness' | 'priority' | 'due';
type TaskHistoryRecord = { id:string; title:string; beforeStatus:PlanTaskItem['status']; beforeCompletedAt:string|null; afterStatus:PlanTaskItem['status']; afterCompletedAt:string|null };

const DAY = 86_400_000;

function taskText(task: PlanTaskItem) {
  return `${task.title} ${task.description ?? ''}`.toLowerCase();
}

function explicitMinutes(task: PlanTaskItem) {
  const text = `${task.title} ${task.description ?? ''}`;
  const hours = text.match(/(?:^|\s)(\d+(?:\.\d+)?)\s*(?:h|hr|hrs|hour|hours)(?:\s|$)/i);
  if (hours) return Math.max(5, Math.min(720, Math.round(Number(hours[1]) * 60)));
  const minutes = text.match(/(?:^|\s)(\d{1,3})\s*(?:m|min|mins|minute|minutes)(?:\s|$)/i);
  if (minutes) return Math.max(5, Math.min(720, Number(minutes[1])));
  return null;
}

function explicitLocation(task: PlanTaskItem) {
  const text = taskText(task);
  if (/\bhome\b|bedroom|kitchen|bathroom|laundry/.test(text)) return 'Home';
  if (/\bwork\b|office|shift|client/.test(text)) return 'Work';
  if (/gym|pilates|fitness studio/.test(text)) return 'Fitness';
  if (/store|shop|grocery|pharmacy|mall|pickup|pick up/.test(text)) return 'Errand';
  if (/online|website|email|zoom|google meet|teams call/.test(text)) return 'Online';
  return 'Unspecified';
}

function classifyTask(task: PlanTaskItem, now: Date): ZoneId {
  const text = taskText(task);
  const duration = explicitMinutes(task);
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const msUntilDue = due ? due.getTime() - now.getTime() : null;

  if (/\bblocked\b|\bstuck\b|cannot proceed|can't proceed|can’t proceed|cannot start|can't start|can’t start/.test(text)) return 'blocked';
  if (/waiting on|awaiting|pending feedback|pending reply|pending approval|need response|waiting for/.test(text)) return 'waiting';
  if (/prepare|preparation|prep\b|gather|materials|research first|set up|setup|before i can|before starting/.test(text)) return 'prep';
  if (task.status === 'in_progress' || /deep focus/.test(text) || (duration !== null && duration >= 45 && /design|write|research|study|build|strategy|synthesis/.test(text))) return 'deep';
  if (duration !== null && duration <= 15) return 'quick';
  if (task.priority === 'urgent' || task.priority === 'high' || (msUntilDue !== null && msUntilDue <= DAY * 2)) return 'ready';
  if (task.priority === 'low' || (msUntilDue !== null && msUntilDue > DAY * 7)) return 'later';
  return 'unplaced';
}

function horizonEnd(horizon: PlanHorizon, now: Date) {
  if (horizon === 'today') { const end = new Date(now); end.setHours(23,59,59,999); return end; }
  if (horizon === 'week') return new Date(now.getTime() + DAY * 7);
  if (horizon === 'two-weeks') return new Date(now.getTime() + DAY * 14);
  if (horizon === 'month') return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return new Date(now.getTime() + DAY * 90);
}
function horizonLabel(horizon: PlanHorizon) { return horizon==='today'?'TODAY':horizon==='week'?'THIS WEEK':horizon==='two-weeks'?'NEXT 2 WEEKS':horizon==='month'?'THIS MONTH':'NEXT 3 MONTHS'; }
function dueLabel(value: string | null) { if(!value)return'No due date';const date=new Date(value);const today=new Date();if(date.toDateString()===today.toDateString())return`Today · ${date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`;return date.toLocaleDateString('en-US',{month:'short',day:'numeric'}); }
function priorityRank(priority: PlanTaskItem['priority']) { return {urgent:4,high:3,medium:2,low:1}[priority]; }
function priorityLabel(priority:PlanTaskItem['priority']) { return priority==='urgent'?'Urgent':priority==='high'?'High':priority==='medium'?'Medium':'Low'; }
function sameLocalDay(value:string|null,date:Date){ if(!value)return false;return new Date(value).toDateString()===date.toDateString(); }

function subtaskState(task:PlanTaskItem){
  if(!task.description)return{total:0,completed:0};
  const lines=task.description.split(/\n+/).map((line)=>line.trim()).filter((line)=>/^[-*]?\s*\[[ xX]\]\s+/.test(line));
  return{total:lines.length,completed:lines.filter((line)=>/^[-*]?\s*\[[xX]\]/.test(line)).length};
}

function taskIcon(task:PlanTaskItem){const text=taskText(task);if(/call|phone/.test(text))return Phone;if(/email|inbox|reply/.test(text))return Mail;if(/send|submit|proposal/.test(text))return Send;if(/team|people|meeting|client/.test(text))return Users;if(/report|analytics|numbers|budget/.test(text))return BarChart3;return FileText;}

export function PlanTasksRoom({ initialTasks }: { initialTasks: PlanTaskItem[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState(initialTasks);
  const [horizon, setHorizon] = useState<PlanHorizon>('today');
  const [viewBy, setViewBy] = useState<ViewBy>('readiness');
  const [contextFilter, setContextFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [showSubtasks, setShowSubtasks] = useState(true);
  const [expandedZones,setExpandedZones]=useState<Record<string,boolean>>({});
  const [history,setHistory]=useState<TaskHistoryRecord[]>([]);
  const [historyIndex,setHistoryIndex]=useState(-1);
  const [isPending, startTransition] = useTransition();

  useEffect(()=>setTasks(initialTasks),[initialTasks]);
  const now = useMemo(() => new Date(), []);
  const end = useMemo(() => horizonEnd(horizon, now), [horizon, now]);
  const sources = useMemo(() => Array.from(new Set(tasks.map((task) => task.source ?? 'Glow'))).sort(), [tasks]);
  const locations = useMemo(() => Array.from(new Set(tasks.map(explicitLocation).filter((value) => value !== 'Unspecified'))).sort(), [tasks]);

  const filteredOpen = useMemo(() => {
    let values = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
    values = values.filter((task) => !task.dueDate || new Date(task.dueDate) <= end || new Date(task.dueDate) < now);
    if (contextFilter !== 'all') values = values.filter((task) => (task.source ?? 'Glow') === contextFilter);
    if (locationFilter !== 'all') values = values.filter((task) => explicitLocation(task) === locationFilter);
    if (priorityFilter !== 'all') values = values.filter((task) => task.priority === priorityFilter);
    if (durationFilter !== 'all') values = values.filter((task) => { const value=explicitMinutes(task);if(durationFilter==='unknown')return value===null;if(value===null)return false;if(durationFilter==='quick')return value<=15;if(durationFilter==='medium')return value>15&&value<=45;return value>45; });
    return values.sort((a,b)=>{if(viewBy==='priority')return priorityRank(b.priority)-priorityRank(a.priority);if(viewBy==='due')return(a.dueDate?new Date(a.dueDate).getTime():Number.MAX_SAFE_INTEGER)-(b.dueDate?new Date(b.dueDate).getTime():Number.MAX_SAFE_INTEGER);const order:Record<ZoneId,number>={blocked:0,waiting:1,ready:2,deep:3,prep:4,quick:5,later:6,unplaced:7};return order[classifyTask(a,now)]-order[classifyTask(b,now)];});
  }, [tasks,end,now,contextFilter,locationFilter,priorityFilter,durationFilter,viewBy]);

  const zones = useMemo(() => { const grouped:Record<ZoneId,PlanTaskItem[]>={deep:[],ready:[],quick:[],prep:[],later:[],waiting:[],blocked:[],unplaced:[]};filteredOpen.forEach((task)=>grouped[classifyTask(task,now)].push(task));return grouped; }, [filteredOpen,now]);
  const completed=tasks.filter((task)=>task.status==='done');
  const todayRelevant=tasks.filter((task)=>task.status!=='cancelled'&&(sameLocalDay(task.dueDate,now)||sameLocalDay(task.completedAt,now)));
  const todayCompleted=todayRelevant.filter((task)=>task.status==='done'&&sameLocalDay(task.completedAt,now));
  const todayProgress=todayRelevant.length?Math.round(todayCompleted.length/todayRelevant.length*100):0;

  const persistTask=useCallback((id:string,status:PlanTaskItem['status'],completedAt:string|null,rollback?:{status:PlanTaskItem['status'];completedAt:string|null})=>{
    startTransition(async()=>{const result=await updateTaskAction(id,status==='done'?{status:'done',completedAt:completedAt?new Date(completedAt):new Date()}:{status,completedAt:null});if(!result?.data&&rollback)setTasks((current)=>current.map((task)=>task.id===id?{...task,...rollback}:task));else router.refresh();});
  },[router]);

  const applyHistory=useCallback((record:TaskHistoryRecord,direction:'undo'|'redo')=>{const status=direction==='undo'?record.beforeStatus:record.afterStatus;const completedAt=direction==='undo'?record.beforeCompletedAt:record.afterCompletedAt;const rollback=direction==='undo'?{status:record.afterStatus,completedAt:record.afterCompletedAt}:{status:record.beforeStatus,completedAt:record.beforeCompletedAt};setTasks((current)=>current.map((task)=>task.id===record.id?{...task,status,completedAt}:task));persistTask(record.id,status,completedAt,rollback);},[persistTask]);

  useEffect(()=>{document.dispatchEvent(new CustomEvent('glow:plan-history-state',{detail:{canUndo:historyIndex>=0,canRedo:historyIndex<history.length-1,receipt:isPending?'Saving…':historyIndex>=0?'Task change saved':'Live tasks'}}));},[historyIndex,history.length,isPending]);
  useEffect(()=>{const undo=()=>{if(historyIndex<0)return;applyHistory(history[historyIndex],'undo');setHistoryIndex((value)=>value-1);};const redo=()=>{if(historyIndex>=history.length-1)return;applyHistory(history[historyIndex+1],'redo');setHistoryIndex((value)=>value+1);};document.addEventListener('glow:plan-undo',undo);document.addEventListener('glow:plan-redo',redo);return()=>{document.removeEventListener('glow:plan-undo',undo);document.removeEventListener('glow:plan-redo',redo);};},[history,historyIndex,applyHistory]);

  function toggleTask(task: PlanTaskItem) {
    const afterStatus:PlanTaskItem['status']=task.status==='done'?'pending':'done';
    const afterCompletedAt=afterStatus==='done'?new Date().toISOString():null;
    const record:TaskHistoryRecord={id:task.id,title:task.title,beforeStatus:task.status,beforeCompletedAt:task.completedAt,afterStatus,afterCompletedAt};
    const nextHistory=history.slice(0,historyIndex+1).concat(record);setHistory(nextHistory);setHistoryIndex(nextHistory.length-1);
    setTasks((current)=>current.map((item)=>item.id===task.id?{...item,status:afterStatus,completedAt:afterCompletedAt}:item));
    persistTask(task.id,afterStatus,afterCompletedAt,{status:task.status,completedAt:task.completedAt});
  }

  const zoneConfig = [
    { id:'deep' as const,title:'DEEP FOCUS',subtitle:'Uninterrupted time',className:`${styles.deepFocus} ${styles.zoneViolet}`,icon:Sparkles },
    { id:'ready' as const,title:'READY NOW',subtitle:'Clear enough to begin',className:`${styles.readyNow} ${styles.zoneMint}`,icon:Zap },
    { id:'quick' as const,title:'QUICK RELIEF',subtitle:'Explicitly short',className:`${styles.quickRelief} ${styles.zonePink}`,icon:Sparkles },
    { id:'prep' as const,title:'NEEDS PREPARATION',subtitle:'Setup cue detected',className:`${styles.needsPrep} ${styles.zoneViolet}`,icon:Wrench },
    { id:'later' as const,title:'CAN WAIT',subtitle:'Low pressure',className:`${styles.canWait} ${styles.zoneBlue}`,icon:TimerReset },
    { id:'waiting' as const,title:'WAITING',subtitle:'Dependent on others',className:`${styles.waiting} ${styles.zonePeach}`,icon:Hourglass },
    { id:'blocked' as const,title:'BLOCKED',subtitle:'Cannot proceed yet',className:`${styles.blocked} ${styles.zoneRed}`,icon:Ban },
  ];

  return <PlanInstrumentChrome title="PLAN · TASKS" subtitle="Turn intention into movement. Tasks find their place." activeInstrument="Tasks" horizon={horizon} onHorizonChange={setHorizon} centerLabel={horizonLabel(horizon)} rightReceipt={isPending?'Saving…':'Live tasks'}>
    <div className={styles.viewBy}><span>VIEW BY</span><select value={viewBy} onChange={(event)=>setViewBy(event.target.value as ViewBy)} aria-label="View tasks by"><option value="readiness">Readiness</option><option value="priority">Priority</option><option value="due">Due date</option></select></div>

    <section className={styles.stage} aria-label="Task readiness field">
      <PlanOrbitField dense />
      {zoneConfig.map(({id,title,subtitle,className,icon:Icon})=>{const limit=expandedZones[id]?zones[id].length:id==='ready'?3:2;return <article key={id} className={`${styles.zone} ${className}`} data-task-zone={id}>
        <header className={styles.zoneHead}><span className={styles.zoneGlyph}><Icon/></span><span className={styles.zoneHeadText}><strong>{title}</strong><small>{subtitle}</small></span><span className={styles.zoneCount}>{zones[id].length}</span></header>
        <div className={styles.zoneTasks}>{zones[id].length?zones[id].slice(0,limit).map((task)=>{const subtask=showSubtasks?subtaskState(task):{total:0,completed:0};const duration=explicitMinutes(task);const KindIcon=taskIcon(task);return <div className={styles.taskRow} key={task.id}><button type="button" className={styles.taskCheck} onClick={()=>toggleTask(task)} disabled={isPending} aria-label={`Complete ${task.title}`}><Circle/></button><span className={styles.taskInfo}><span className="plan-task-titleline"><KindIcon/><strong>{task.title}</strong></span><small>{dueLabel(task.dueDate)}{duration!==null?` · ${duration}m`:' · duration unknown'}</small><em>{task.source??'Glow'}{subtask.total?` · ${subtask.completed}/${subtask.total} subtasks`:''}</em></span><span className={`${styles.taskEnergy} plan-task-priority`} data-priority={task.priority}>{priorityLabel(task.priority)}</span></div>}):<p className={styles.emptyZone}>Nothing confidently belongs here yet.</p>}{zones[id].length>limit?<button type="button" className={`${styles.moreCount} plan-task-more`} onClick={()=>setExpandedZones((current)=>({...current,[id]:true}))}>See all {zones[id].length}</button>:expandedZones[id]&&zones[id].length>(id==='ready'?3:2)?<button type="button" className={`${styles.moreCount} plan-task-more`} onClick={()=>setExpandedZones((current)=>({...current,[id]:false}))}>Collapse</button>:null}</div>
      </article>})}

      <div className={styles.centerLens} data-glow-material="pearl"><span className={styles.centerSpectral}/><strong>TASKS</strong><span>7 zones · {filteredOpen.length} task{filteredOpen.length===1?'':'s'}</span><small>Find your next move.</small></div>
      {zones.unplaced.length?<div className={styles.unplaced}>{zones.unplaced.length} task{zones.unplaced.length===1?'':'s'} remain unplaced because readiness context is not explicit enough.</div>:null}
      <div className={`${styles.completedLabel} plan-task-completed-object`}><i data-glow-material="pearl"/><strong>COMPLETED</strong><span>{completed.length?`${completed.length} finished task${completed.length===1?'':'s'}`:'Small steps, a brighter you.'}</span></div>
    </section>

    <section className={styles.controlBand} aria-label="Task controls"><div className={styles.controlCard}><div className={styles.controlTitle}>TASK CONTROLS</div><div className={styles.controlsRow}>
      <div className={styles.controlPill}><ListTree size={14}/><label><small>Sort</small><select value={viewBy} onChange={(event)=>setViewBy(event.target.value as ViewBy)}><option value="readiness">Readiness</option><option value="priority">Priority</option><option value="due">Due date</option></select></label></div>
      <div className={styles.controlPill}><ListTree size={14}/><label><small>Context</small><select value={contextFilter} onChange={(event)=>setContextFilter(event.target.value)}><option value="all">All</option>{sources.map((source)=><option key={source} value={source}>{source}</option>)}</select></label></div>
      <div className={styles.controlPill}><span>⌖</span><label><small>Location cue</small><select value={locationFilter} onChange={(event)=>setLocationFilter(event.target.value)}><option value="all">All</option>{locations.map((location)=><option key={location} value={location}>{location}</option>)}</select></label></div>
      <div className={styles.controlPill}><span>⚑</span><label><small>Priority</small><select value={priorityFilter} onChange={(event)=>setPriorityFilter(event.target.value)}><option value="all">All</option><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label></div>
      <button type="button" className={`${styles.controlPill} ${styles.togglePill}`} onClick={()=>setShowSubtasks((value)=>!value)}><span className={`${styles.toggleTrack} ${showSubtasks?styles.on:''}`}/><label><small>Subtasks</small><span>{showSubtasks?'Shown':'Hidden'}</span></label></button>
      <div className={styles.controlPill}><Clock3 size={14}/><label><small>Est. duration</small><select value={durationFilter} onChange={(event)=>setDurationFilter(event.target.value)}><option value="all">Any</option><option value="quick">≤15m</option><option value="medium">15–45m</option><option value="long">45m+</option><option value="unknown">Unknown</option></select></label></div>
    </div></div><div className={styles.progressCard}><div className={styles.controlTitle}>TODAY’S PROGRESS</div><div className={styles.progressBody}><div className={styles.progressRing} style={{'--progress':`${todayProgress}%`} as CSSProperties}><strong>{todayCompleted.length}/{todayRelevant.length}</strong></div><span className={styles.progressText}><strong>today-linked tasks completed</strong><small>{todayRelevant.length?'Only tasks due or completed today are counted.':'No tasks are explicitly linked to today yet.'}</small></span></div></div></section>
  </PlanInstrumentChrome>;
}
