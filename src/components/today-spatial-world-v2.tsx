'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  ArrowUp,
  CalendarDays,
  ChevronDown,
  Ellipsis,
  Focus,
  GripVertical,
  LayoutGrid,
  MapPin,
  Plus,
  Route,
  Sparkles,
  Undo2,
  Users,
  X,
} from 'lucide-react';

type TaskLite = { id: string; title: string; priority: string; status: string; dueDateISO?: string | null };
type EventLite = { id: string; title: string; location?: string | null; startAtISO?: string | null; endAtISO?: string | null; allDay?: boolean };
type RoutineLite = { id: string; name: string; timeOfDay: string };
type FocusLite = { id: string; title: string; startedAtISO: string; plannedMinutes: number; entityId?: string | null; entityType?: string | null };
type Props = { tasks: TaskLite[]; events: EventLite[]; routines: RoutineLite[]; activeFocus: FocusLite | null; energy: number | null; mood: number | null; sleepHours: number | null };
type TimelineItem = { id: string; rawId: string; title: string; at: Date | null; endAt: Date | null; kind: 'event' | 'task'; meta?: string; location?: string | null; allDay?: boolean };
type Bucket = 'NEXT' | 'LATER' | 'TONIGHT' | 'TOMORROW';
type Lens = { kind: 'capacity' } | { kind: 'energy' } | { kind: 'priorities' } | { kind: 'event'; item: TimelineItem } | null;

const BUCKETS: Bucket[] = ['NEXT', 'LATER', 'TONIGHT', 'TOMORROW'];

function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function tomorrowFrom(date: Date) { const next = new Date(date); next.setDate(next.getDate() + 1); return next; }
function formatClock(date: Date) { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date); }
function formatRange(item: TimelineItem) {
  if (item.allDay) return 'All day';
  if (!item.at) return item.meta ?? '';
  if (item.endAt && item.endAt > item.at) return `${formatClock(item.at)} – ${formatClock(item.endAt)}`;
  return formatClock(item.at);
}
function durationMinutes(item: TimelineItem) { if (!item.at || !item.endAt || item.endAt <= item.at) return null; return Math.max(1, Math.round((item.endAt.getTime() - item.at.getTime()) / 60000)); }
function until(from: Date, to: Date | null) { if (!to) return 'Open'; const mins = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000)); if (mins < 60) return `${mins} min`; return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`; }
function priorityWeight(priority: string) { return priority === 'urgent' ? 4 : priority === 'high' ? 3 : priority === 'medium' ? 2 : 1; }
function energyLabel(energy: number | null, sleepHours: number | null) { if (energy === null) return sleepHours !== null && sleepHours < 6 ? 'Low sleep · check in' : 'Not checked in'; if (energy >= 8) return 'Clear · Strong'; if (energy >= 6) return 'Clear · Steady'; if (energy >= 4) return 'Gentle · Steady'; return 'Low · Protect'; }
function capacityLabel(energy: number | null) { if (energy === null) return 'Check in first'; if (energy >= 8) return 'High focus'; if (energy >= 6) return 'Steady focus'; if (energy >= 4) return 'Moderate'; return 'Low load'; }
function startOfHour(date: Date, hour: number) { const value = new Date(date); value.setHours(hour, 0, 0, 0); return value; }
function bucketCopy(bucket: Bucket) { if (bucket === 'NEXT') return ['Build and move', 'Protect your next hour.']; if (bucket === 'LATER') return ['Collaborate and create', 'Afternoon momentum.']; if (bucket === 'TONIGHT') return ['Unwind and reset', 'Close the day well.']; return ['Preview your tomorrow', 'So today can flow.']; }
function bucketTone(bucket: Bucket, index: number) { if (bucket === 'TONIGHT' && index === 0) return 'tsw-peach'; if (bucket === 'LATER' && index === 0) return 'tsw-violet'; if (bucket === 'TONIGHT' && index === 1) return 'tsw-violet'; return 'tsw-cool'; }
function isUrl(value?: string | null) { return Boolean(value && /^https?:\/\//i.test(value.trim())); }
function lensTitle(lens: NonNullable<Lens>) { if (lens.kind === 'event') return lens.item.title; if (lens.kind === 'capacity') return 'Capacity'; if (lens.kind === 'energy') return 'Energy check-in'; return 'Top 3 priorities'; }

export function TodaySpatialWorldV2({ tasks, events, routines, activeFocus, energy, mood, sleepHours }: Props) {
  const riverRef = useRef<HTMLDivElement | null>(null);
  const dragStartY = useRef<number | null>(null);
  const lastWheel = useRef(0);
  const longPress = useRef<number | null>(null);
  const draggingItem = useRef<TimelineItem | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [intent, setIntent] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lens, setLens] = useState<Lens>(null);

  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    const bodyOverscroll = document.body.style.overscrollBehavior;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      document.body.style.overscrollBehavior = bodyOverscroll;
    };
  }, []);

  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 15000); return () => window.clearInterval(timer); }, []);

  const rankedTasks = useMemo(() => [...tasks].sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority)), [tasks]);
  const topThree = rankedTasks.slice(0, 3);
  const activeTask = activeFocus ? rankedTasks.find((task) => task.id === activeFocus.entityId) ?? rankedTasks[0] ?? null : rankedTasks[0] ?? null;

  const items = useMemo<TimelineItem[]>(() => {
    const eventItems = events.flatMap((event) => {
      const at = event.startAtISO ? new Date(event.startAtISO) : null;
      const endAt = event.endAtISO ? new Date(event.endAtISO) : null;
      if (at && Number.isNaN(at.getTime())) return [];
      return [{ id: `event-${event.id}`, rawId: event.id, title: event.title, at, endAt: endAt && !Number.isNaN(endAt.getTime()) ? endAt : null, kind: 'event' as const, meta: event.location || 'Calendar', location: event.location, allDay: event.allDay }];
    });
    const taskItems = tasks.flatMap((task) => {
      if (!task.dueDateISO) return [];
      const at = new Date(task.dueDateISO);
      if (Number.isNaN(at.getTime())) return [];
      return [{ id: `task-${task.id}`, rawId: task.id, title: task.title, at, endAt: null, kind: 'task' as const, meta: task.priority }];
    });
    return [...eventItems, ...taskItems].sort((a, b) => (a.at?.getTime() ?? Infinity) - (b.at?.getTime() ?? Infinity));
  }, [events, tasks]);

  const buckets = useMemo<Record<Bucket, TimelineItem[]>>(() => {
    const tomorrow = tomorrowFrom(now);
    const nextCutoff = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const eveningStart = startOfHour(now, 17);
    const todayFuture = items.filter((item) => item.at && sameDay(item.at, now) && (item.allDay || item.at >= now));
    const timed = todayFuture.filter((item) => item.at && !item.allDay);
    const allDay = todayFuture.filter((item) => item.allDay);
    const next = [...timed.filter((item) => item.at && item.at < nextCutoff), ...allDay].slice(0, 3);
    const nextIds = new Set(next.map((item) => item.id));
    const later = timed.filter((item) => item.at && item.at >= nextCutoff && item.at < eveningStart && !nextIds.has(item.id)).slice(0, 3);
    const used = new Set([...next, ...later].map((item) => item.id));
    const tonight = timed.filter((item) => item.at && item.at >= eveningStart && !used.has(item.id)).slice(0, 3);
    const tomorrowItems = items.filter((item) => item.at && sameDay(item.at, tomorrow)).slice(0, 3);
    return { NEXT: next, LATER: later, TONIGHT: tonight, TOMORROW: tomorrowItems };
  }, [items, now]);

  const nextEvent = items.find((item) => item.kind === 'event' && item.at && item.at >= now && !item.allDay) ?? null;
  const focusElapsed = activeFocus ? Math.max(0, Math.round((now.getTime() - new Date(activeFocus.startedAtISO).getTime()) / 60000)) : 0;
  const focusPlanned = Math.max(1, activeFocus?.plannedMinutes ?? 25);
  const focusPct = activeFocus ? Math.max(0, Math.min(100, Math.round((focusElapsed / focusPlanned) * 100))) : 0;
  const focusRemaining = activeFocus ? Math.max(0, focusPlanned - focusElapsed) : null;
  const capacityText = capacityLabel(energy);
  const energyText = energyLabel(energy, sleepHours);
  const routineContext = routines.length ? `${routines.length} routines available` : 'No routine due now';

  const openGlow = useCallback((prefill?: string) => { document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill } })); }, []);
  const navigate = useCallback((path: string) => { document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } })); }, []);
  const stepTime = useCallback((delta: number) => { setActiveIndex((index) => Math.max(0, Math.min(BUCKETS.length - 1, index + delta))); }, []);

  function submitIntent() { const value = intent.trim(); openGlow(value || undefined); setIntent(''); }
  function selectContext(item: TimelineItem) { document.dispatchEvent(new CustomEvent('glow:context', { detail: { type: item.kind, label: item.title, id: item.rawId, route: '/today' } })); }
  function focusItem(item: TimelineItem) { selectContext(item); setLens({ kind: 'event', item }); }
  function queueMove(item: TimelineItem, bucket: Bucket) { selectContext(item); openGlow(`Move ${item.title} to ${bucket.toLowerCase()} in my Today flow. Prepare the exact change as a proposal. Do not change anything until I approve.`); setLens(null); }
  function bucketTime(bucket: Bucket, list: TimelineItem[]) { const first = list.find((item) => item.at && !item.allDay)?.at; return first ? formatClock(first) : bucket === 'TOMORROW' ? 'Tomorrow' : 'Open'; }
  function countdown(bucket: Bucket, list: TimelineItem[]) { const first = list.find((item) => item.at && !item.allDay)?.at ?? null; if (bucket === 'TONIGHT' && first) return until(now, new Date(first.getTime() - 30 * 60000)); return first ? until(now, first) : 'Open'; }

  useEffect(() => {
    const node = riverRef.current;
    if (!node) return;
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const stamp = Date.now();
      if (stamp - lastWheel.current < 330 || Math.abs(event.deltaY) < 5) return;
      lastWheel.current = stamp;
      stepTime(event.deltaY > 0 ? 1 : -1);
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [stepTime]);

  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) { dragStartY.current = event.clientY; event.currentTarget.setPointerCapture(event.pointerId); }
  function pointerUp(event: ReactPointerEvent<HTMLDivElement>) { if (dragStartY.current == null) return; const delta = event.clientY - dragStartY.current; dragStartY.current = null; if (Math.abs(delta) > 32) stepTime(delta < 0 ? 1 : -1); }
  function beginHold(item: TimelineItem) { if (longPress.current) window.clearTimeout(longPress.current); longPress.current = window.setTimeout(() => focusItem(item), 520); }
  function endHold() { if (longPress.current) window.clearTimeout(longPress.current); longPress.current = null; }

  return <div className="tsw-root" data-glow-spatial-room="today">
    <div className="tsw-world-light" aria-hidden="true"/>
    <div className="tsw-shell">
      <div className="tsw-caustic" aria-hidden="true"/>
      <header className="tsw-header">
        <div className="tsw-brand"><strong>Glow OS</strong><span>Batch 1</span></div>
        <div className="tsw-world-name">world 1: TODAY · THE LIVING CENTER</div>
        <button className="tsw-ask-top" type="button" onClick={() => openGlow()} aria-label="Ask Glow"><span className="tsw-pearl tsw-pearl-top"/><span>Ask Glow<br/>⌘ K</span></button>
      </header>

      <nav className="tsw-rail" aria-label="Today spatial navigation">
        <button className="tsw-rail-button active" type="button" onClick={() => setActiveIndex(0)}><span className="tsw-rail-mount"><span className="tsw-pearl tsw-pearl-today"/></span><span>Today</span></button>
        <button className="tsw-rail-button" type="button" onClick={() => navigate('/focus')}><span className="tsw-rail-mount"><Focus size={14}/></span><span>Focus</span></button>
        <button className="tsw-rail-button" type="button" onClick={() => navigate('/connections')}><span className="tsw-rail-mount"><Users size={14}/></span><span>People</span></button>
        <button className="tsw-rail-button" type="button" onClick={() => navigate('/world')}><span className="tsw-rail-mount"><MapPin size={14}/></span><span>Places</span></button>
        <button className="tsw-rail-button" type="button" onClick={() => navigate('/resources')}><span className="tsw-rail-mount"><LayoutGrid size={14}/></span><span>Resources</span></button>
        <button className="tsw-rail-button" type="button" onClick={() => navigate('/planning')}><span className="tsw-rail-mount"><Route size={14}/></span><span>Journeys</span></button>
        <div className="tsw-rail-spacer"/>
        <button className="tsw-add-pearl" type="button" onClick={() => openGlow('Create ')} aria-label="Create with Glow"><Plus size={13}/></button>
      </nav>

      <main className="tsw-scene">
        <section className="tsw-chamber">
          <div className="tsw-now-zone"><div className="tsw-clock">{formatClock(now)}</div><div className="tsw-now">NOW</div><div className="tsw-flow">You’re in flow</div><div className="tsw-flow-note">Keep the momentum.</div><button className="tsw-protected" type="button" onClick={() => openGlow('Protect 90 minutes for my current focus. Show me the proposal before changing my schedule.')}><span/><b>Protected 90 min</b></button></div>
          <div className="tsw-matter" aria-label="Glow Matter present-state sculpture"><div className="tsw-matter-ground"/><div className="tsw-sculpt"><div className="tsw-cavity"/><div className="tsw-ribbon r1"/><div className="tsw-ribbon r2"/><div className="tsw-ribbon r3"/></div></div>

          <div className="tsw-intel">
            <div><div className="tsw-what">What now?</div><div className="tsw-intent"><input value={intent} onChange={(event) => setIntent(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitIntent(); }} placeholder="Share intent or ask anything…" aria-label="Ask Glow what now"/><button type="button" onClick={submitIntent} aria-label="Send to Glow"><ArrowUp size={11}/></button></div></div>
            <div className="tsw-intel-tray" aria-label="Current intelligence tray">
              <button className="tsw-intel-card" type="button" onClick={() => setLens({ kind: 'capacity' })}><small>Capacity</small><strong>{capacityText}</strong><i className="tsw-capacity-wave"/></button>
              <button className="tsw-intel-card" type="button" onClick={() => setLens({ kind: 'energy' })}><small>Energy</small><strong className="tsw-energy-copy">{energyText}</strong><span className="tsw-pearl tsw-energy-pearl"/></button>
              <button className="tsw-intel-card priorities" type="button" onClick={() => setLens({ kind: 'priorities' })}><small>Top 3 priorities</small>{topThree.length ? topThree.map((task,index)=><span className="tsw-priority" key={task.id}><em>{index+1}</em><b>{task.title}</b><i/></span>) : <strong>No open priorities.</strong>}</button>
            </div>
          </div>

          <div className="tsw-focus-inset">
            <button type="button" onClick={() => activeFocus ? navigate('/focus') : openGlow(`Start a focus session for ${activeTask?.title ?? 'my next priority'}. Show me the focus plan first.`)}><small>In focus</small><strong>{activeFocus?.title ?? activeTask?.title ?? 'Open focus'}</strong><span>{activeFocus ? <><i className="tsw-focus-track"><b style={{width:`${focusPct}%`}}/></i><em>{focusPct}% · {focusRemaining} min</em></> : <><em>{activeTask?.priority ?? 'Open'}</em><i className="tsw-micro-button">Start focus</i></>}</span></button>
            <button type="button" onClick={() => { const first = buckets.NEXT[0]; if (first) focusItem(first); else setActiveIndex(0); }}><small>Next up</small><strong>{buckets.NEXT[0]?.title ?? 'Open'}</strong><span>{buckets.NEXT[0] ? <><Focus size={10}/><em>{formatRange(buckets.NEXT[0])}{durationMinutes(buckets.NEXT[0]) ? ` · ${durationMinutes(buckets.NEXT[0])} min` : ''}</em></> : <em>{routineContext}</em>}</span></button>
            <button type="button" onClick={() => nextEvent && focusItem(nextEvent)}><small>Appointments</small><strong>{nextEvent?.title ?? 'No appointment'}</strong><span>{nextEvent ? <><CalendarDays size={10}/><em>{formatRange(nextEvent)}</em><i className="tsw-micro-button">Open</i></> : <em>Your schedule is open.</em>}</span></button>
          </div>
        </section>

        <section ref={riverRef} className="tsw-river" aria-label="Living time river" onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { dragStartY.current = null; }}>
          <span className="tsw-river-instruction">Drag or swipe through time</span>
          {BUCKETS.map((bucket,index) => {
            const distance = index - activeIndex;
            const list = buckets[bucket];
            const opacity = Math.max(.38, 1 - Math.abs(distance) * .16);
            const scale = Math.max(.92, 1 - Math.abs(distance) * .018);
            return <div key={bucket} className={`tsw-band ${index===activeIndex?'active':''}`} style={{transform:`translate3d(0,${distance*64}px,${-Math.abs(distance)*58}px) scale(${scale})`,opacity}} role="button" tabIndex={0} onClick={() => setActiveIndex(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActiveIndex(index); }} onDragOver={(event)=>event.preventDefault()} onDrop={(event)=>{event.preventDefault();const item=draggingItem.current;draggingItem.current=null;if(item)queueMove(item,bucket);}}>
              <div className="tsw-band-label"><small>{bucketTime(bucket,list)}</small><strong>{bucket}</strong><span>{bucketCopy(bucket)[0]}<br/>{bucketCopy(bucket)[1]}</span></div>
              <div className="tsw-band-events" onPointerDown={(event)=>event.stopPropagation()} onPointerUp={(event)=>event.stopPropagation()}>{list.length ? list.slice(0,3).map((item,itemIndex)=><button key={item.id} className="tsw-event" type="button" draggable onDragStart={()=>{draggingItem.current=item;}} onDragEnd={()=>{draggingItem.current=null;}} onPointerDown={()=>beginHold(item)} onPointerUp={endHold} onPointerCancel={endHold} onClick={(event)=>{event.stopPropagation();focusItem(item);}}><span className={`tsw-object ${bucketTone(bucket,itemIndex)}`}/><span><strong>{item.title}</strong><small>{formatRange(item)}<em>{item.kind==='event'?'Calendar':item.meta}</em></small></span></button>) : <div className="tsw-empty">Open by design.</div>}</div>
              <div className="tsw-count"><small>{bucket==='NEXT'?'Time to next':bucket==='LATER'?'Time to later':bucket==='TONIGHT'?'Leave-ready':'Preview time'}</small><strong>{countdown(bucket,list)}</strong></div>
            </div>;
          })}
          <div className="tsw-river-dots">{BUCKETS.map((bucket,index)=><button type="button" key={bucket} className={index===activeIndex?'active':''} onClick={(event)=>{event.stopPropagation();setActiveIndex(index);}} aria-label={`Move to ${bucket}`}/>)}</div>
        </section>

        <footer className="tsw-footer"><button type="button" onClick={() => navigate('/calendar')}><CalendarDays size={10}/><span>Day view</span><ChevronDown size={9}/></button><button className="tsw-replan" type="button" onClick={() => openGlow('Replan my day using my real tasks, calendar, priorities, and current capacity. Show me the proposal before changing anything.')}><Sparkles size={10}/><span>Replan my day</span></button><div><span>All changes saved</span><button type="button" onClick={() => openGlow('Undo my most recent Glow OS change if it is safe and reversible. Show me exactly what will be undone first.')}><span>Undo</span><Undo2 size={10}/></button><i className="tsw-pearl tsw-corner-pearl"/></div></footer>
      </main>

      {lens ? <div className="tsw-lens-backdrop" onPointerDown={(event)=>{if(event.target===event.currentTarget)setLens(null);}}><section className="tsw-lens" aria-modal="true" role="dialog"><div className="tsw-lens-head"><div><small>Glow Matter · focused object</small><strong>{lensTitle(lens)}</strong></div><button type="button" onClick={()=>setLens(null)} aria-label="Close"><X size={14}/></button></div>
        {lens.kind==='capacity' ? <><p>Capacity is a working state, not a score. Bring this object forward whenever the day needs to become lighter, steadier, or more focused.</p><div className="tsw-lens-row"><span className="tsw-pearl tsw-pearl-today"/><div><strong>Current capacity</strong><small>{capacityText}</small></div><em>{energy ?? '—'}</em></div><div className="tsw-lens-actions"><button className="primary" onClick={()=>{openGlow('Check in my capacity and adjust Today around what I can realistically hold. Show me the proposal first.');setLens(null);}}>Check in with Glow</button><button onClick={()=>{openGlow('Make the rest of Today lighter without deleting anything. Show me what would move.');setLens(null);}}>Lighten today</button></div></> : null}
        {lens.kind==='energy' ? <><p>Energy changes how information should surface. Use this object to update the day’s pacing instead of forcing the same plan at every energy level.</p><div className="tsw-lens-row"><span className="tsw-pearl tsw-violet"/><div><strong>Current energy</strong><small>{energyText}</small></div><em>{energy ?? '—'}</em></div><div className="tsw-lens-actions"><button className="primary" onClick={()=>{navigate('/wellness');setLens(null);}}>Open check-in</button><button onClick={()=>{openGlow('Use my current energy to adapt the rest of Today. Show the proposed changes before applying them.');setLens(null);}}>Adapt Today</button></div></> : null}
        {lens.kind==='priorities' ? <><p>These are your current highest-priority open tasks. The full object comes forward here instead of being cropped inside the command deck.</p><div className="tsw-lens-rows">{topThree.length ? topThree.map((task,index)=><div className="tsw-lens-row" key={task.id}><GripVertical size={12}/><div><strong>{task.title}</strong><small>{task.priority}</small></div><em>{index+1}</em></div>) : <div className="tsw-lens-row"><span>—</span><div><strong>No open priorities</strong><small>Today has room.</small></div><em/></div>}</div><div className="tsw-lens-actions"><button className="primary" onClick={()=>{openGlow('Help me reorder my Top 3 priorities. Prepare the new order for approval before changing anything.');setLens(null);}}>Reorder with Glow</button><button onClick={()=>{navigate('/tasks');setLens(null);}}>Open tasks</button></div></> : null}
        {lens.kind==='event' ? <><p>This is a real temporal object. Tap to focus it, hold to open it, or move it to another Today region. Calendar mutations remain approval-based.</p><div className="tsw-lens-row"><span className="tsw-object tsw-cool"/><div><strong>{lens.item.title}</strong><small>{formatRange(lens.item)} · {lens.item.kind==='event'?'Calendar':lens.item.meta}</small></div><button type="button" onClick={()=>{selectContext(lens.item);openGlow(`Help me with ${lens.item.title}`);setLens(null);}} aria-label="Ask Glow about this"><ArrowUp size={11}/></button></div><div className="tsw-lens-actions">{isUrl(lens.item.location)?<button className="primary" onClick={()=>window.open(lens.item.location!, '_blank', 'noopener,noreferrer')}>Join</button>:<button className="primary" onClick={()=>{selectContext(lens.item);openGlow(`Open the context for ${lens.item.title}`);setLens(null);}}>Open context</button>}<button onClick={()=>{selectContext(lens.item);openGlow(`What should I know or prepare for ${lens.item.title}?`);setLens(null);}}>Prepare me</button><button onClick={()=>{selectContext(lens.item);openGlow(`Show me all details for ${lens.item.title}`);setLens(null);}}><Ellipsis size={12}/></button></div><small className="tsw-move-label">Move through time</small><div className="tsw-move-grid">{BUCKETS.map((bucket)=><button type="button" key={bucket} onClick={()=>queueMove(lens.item,bucket)}>{bucket}</button>)}</div></> : null}
      </section></div> : null}
    </div>
  </div>;
}
