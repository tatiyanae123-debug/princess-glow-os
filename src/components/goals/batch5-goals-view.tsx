'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Plus, Sparkles } from 'lucide-react';
import { GoalsRouteExperience } from '@/components/goals/goals-route-experience';
import type { Goal } from '@/lib/types';

type Tab = 'active' | 'completed' | 'all';

function dateLabel(goal: Goal) {
  if (!goal.targetDate) return 'No target date';
  const d = goal.targetDate instanceof Date ? goal.targetDate : new Date(goal.targetDate);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function nextStep(goal: Goal) {
  if (goal.progress >= 100 || goal.status === 'achieved') return 'Celebrate & reflect';
  if (goal.progress >= 75) return 'Finish final milestone';
  if (goal.progress >= 50) return 'Advance next milestone';
  if (goal.progress >= 25) return 'Protect momentum';
  return 'Choose first move';
}

export function Batch5GoalsView({ goals }: { goals: Goal[] }) {
  const [tab, setTab] = useState<Tab>('active');
  const list = useMemo(
    () => goals.filter((goal) => tab === 'all'
      ? true
      : tab === 'completed'
        ? goal.status === 'achieved' || goal.progress >= 100
        : !(goal.status === 'achieved' || goal.status === 'abandoned' || goal.progress >= 100)),
    [goals, tab],
  );

  return <div className="batch5-goals-root">
    <div className="batch5-page-header">
      <div>
        <p className="batch5-eyebrow">3. Goals</p>
        <h1 className="glow-display">Goals</h1>
        <p>Your future, designed by you.</p>
      </div>
      <Link href="/goals?new=1" className="batch5-add"><Plus size={12} /> New Goal</Link>
    </div>

    <div className="batch5-goal-tabs" role="tablist" aria-label="Goal views">
      <button type="button" role="tab" aria-selected={tab === 'active'} onClick={() => setTab('active')} className={tab === 'active' ? 'active' : ''}>Active Goals</button>
      <button type="button" role="tab" aria-selected={tab === 'completed'} onClick={() => setTab('completed')} className={tab === 'completed' ? 'active' : ''}>Completed</button>
      <button type="button" role="tab" aria-selected={tab === 'all'} onClick={() => setTab('all')} className={tab === 'all' ? 'active' : ''}>All Goals</button>
    </div>

    <div className="batch5-goal-list">
      {list.length ? list.map((goal, index) => (
        <Link key={goal.id} href={`/goals?goalId=${goal.id}`} className="batch5-goal-row">
          <div className={`batch5-goal-photo batch5-goal-photo-${index % 4}`} aria-hidden="true">
            <span className="batch5-goal-photo-shape" />
          </div>
          <div className="batch5-goal-copy">
            <h2>{goal.title}</h2>
            <p>{goal.description || `${goal.category} goal`}</p>
            <div className="batch5-goal-progress">
              <div><i style={{ width: `${Math.min(100, Math.max(0, goal.progress))}%` }} /></div>
              <span>{goal.progress}%</span>
            </div>
          </div>
          <div className="batch5-goal-meta">
            <span><small>Target Date</small>{dateLabel(goal)}</span>
            <span><small>Next Step</small>{nextStep(goal)}</span>
          </div>
          <ArrowRight size={14} />
        </Link>
      )) : <div className="batch5-card batch5-empty">No goals in this view yet.</div>}
    </div>

    <div className="batch5-goal-insight">
      <Sparkles size={16} />
      <div>
        <strong>Glow Insight</strong>
        <p>{goals.length ? 'You make more progress when you break big goals into small weekly actions.' : 'Create your first goal and Glow will keep the destination visible.'}</p>
      </div>
      <Link href="/brain">View insights</Link>
    </div>

    <GoalsRouteExperience initialGoals={goals} showManager={false} />
  </div>;
}
