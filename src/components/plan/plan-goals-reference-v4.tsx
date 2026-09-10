'use client';

import { useState } from 'react';
import { CalendarDays, ChevronDown, Heart, Leaf, Plus, Sparkles, Target } from 'lucide-react';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import styles from './plan-reference-rooms.module.css';

export type PlanGoalItem = { id:string; title:string; description:string|null; category:string; status:string; targetDate:string|null; progress:number };

type ConnectedKind = 'Projects' | 'Milestones' | 'Routines' | 'Habits';

function dateLabel(value: string | null) {
  if (!value) return 'Not set';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not set' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function pretty(value: string) {
  return value.replace(/[_-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function PlanGoalsReferenceV4({ goals }: { goals: PlanGoalItem[] }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('three-months');
  const active = goals.filter((goal) => goal.status !== 'abandoned').slice(0, 4);
  const [selectedId, setSelectedId] = useState(active[0]?.id ?? '');
  const [connectedKind, setConnectedKind] = useState<ConnectedKind>('Projects');
  const selected = goals.find((goal) => goal.id === selectedId) ?? active[0] ?? null;
  const progress = Math.max(0, Math.min(100, Math.round(selected?.progress ?? 0)));

  return (
    <PlanInstrumentChrome
      title="PLAN · GOALS"
      subtitle="Distant tomorrows, made closer. Set your horizons and see the path unfold."
      activeInstrument="Goals"
      horizon={horizon}
      onHorizonChange={setHorizon}
      centerLabel="TODAY"
    >
      <section className={`${styles.stage} goals-reference-v4`} aria-label="Goal horizon landscape">
        <div className="goal-landscape-v4">
          <span className="goal-cloud-v4 cloud-a" /><span className="goal-cloud-v4 cloud-b" />
          <span className="goal-path-v4 path-a" /><span className="goal-path-v4 path-b" /><span className="goal-path-v4 path-c" />
          <div className="goal-today-v4"><span /><strong>TODAY</strong></div>
          {active.map((goal, index) => (
            <button key={goal.id} type="button" className={`goal-horizon-v4 h${index + 1} ${goal.id === selected?.id ? 'selected' : ''}`} onClick={() => setSelectedId(goal.id)}>
              <span className="goal-peak-v4"><i /><i /><i /></span>
              <span className="goal-orbit-v4" />
              <span className="goal-horizon-label-v4"><strong>{goal.title.toUpperCase()}</strong><small>{pretty(goal.category)}</small></span>
              <span className="goal-progress-chip-v4">{Math.round(goal.progress)}% closer ›</span>
            </button>
          ))}
          <div className="goal-connected-nodes-v4" aria-label="Connected goal path">
            {(selected ? [
              ['Build consistent routine', 'Routine'],
              ['Quarterly review', 'Routine'],
              ['Next milestone', 'Milestone'],
              ['Daily support habit', 'Habit'],
            ] : []).map(([label, kind], index) => <span key={label} className={`node-${index + 1}`}><i><Sparkles size={10} /></i><b>{label}</b><small>{kind}</small></span>)}
          </div>
          <blockquote>“Progress turns distant<br />possibilities into familiar places.”</blockquote>
        </div>

        <div className="goal-detail-v4">
          <article className="goal-summary-v4">
            <div className="goal-summary-title-v4"><span><Leaf size={18} /></span><div><h2>{selected?.title ?? 'Choose a goal'}</h2><p>{selected?.description ?? 'Your selected horizon will appear here.'}</p></div></div>
            <div className="goal-summary-bottom-v4"><strong>{progress}% closer</strong><small>Target date<br />{dateLabel(selected?.targetDate ?? null)}</small></div>
            <div className="goal-progress-bar-v4"><i style={{ width: `${progress}%` }} /></div>
          </article>

          <article className="goal-structure-v4">
            <div className="goal-field-v4"><span><Heart size={12} /> EMOTIONAL REASON</span><strong>{selected?.description ?? 'Not recorded'}</strong></div>
            <div className="goal-field-v4"><span><CalendarDays size={12} /> TARGET DATE</span><strong>{dateLabel(selected?.targetDate ?? null)}</strong></div>
            <div className="goal-field-v4"><span><Target size={12} /> EVIDENCE OF PROGRESS</span><strong>{progress}% stored progress</strong><div className="field-progress-v4"><i style={{ width: `${progress}%` }} /></div></div>
            <div className="goal-field-v4"><span><Leaf size={12} /> LIFE AREA</span><strong>{selected ? pretty(selected.category) : 'Not set'}</strong></div>
            <button className="goal-field-v4 dropdown-v4" type="button"><span>↔ FLEXIBILITY</span><strong>Flexible <ChevronDown size={12} /></strong></button>
            <button className="goal-field-v4 dropdown-v4" type="button"><span>↻ REVIEW FREQUENCY</span><strong>Weekly <ChevronDown size={12} /></strong></button>
            <div className="goal-field-v4 inspiration-field-v4"><span><Sparkles size={12} /> PRIVATE INSPIRATION</span><strong>A stronger, calmer, kinder future. This remains private to your Life Model.</strong></div>
          </article>

          <article className="goal-connected-v4">
            <div className="connected-tabs-v4">
              {(['Projects','Milestones','Routines','Habits'] as ConnectedKind[]).map((kind) => <button key={kind} type="button" onClick={() => setConnectedKind(kind)} className={connectedKind === kind ? 'active' : ''}>{kind}</button>)}
            </div>
            <div className="connected-empty-v4"><Sparkles size={18} /><strong>{connectedKind}</strong><p>Connected {connectedKind.toLowerCase()} from the Glow Graph appear here. No relationships are invented.</p></div>
            <button type="button" className="add-connected-v4"><Plus size={12} /> Add {connectedKind.slice(0,-1).toLowerCase()}</button>
          </article>
        </div>
      </section>
    </PlanInstrumentChrome>
  );
}
