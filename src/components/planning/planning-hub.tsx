'use client';

import { useMemo, useState } from 'react';
import { BookOpen, CalendarRange, Flag, ListChecks, Target } from 'lucide-react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import type { PlanningView } from '@/lib/productivity/types';

const views: Array<{ id: PlanningView; label: string; icon: typeof CalendarRange; description: string }> = [
  { id: 'week', label: 'Week', icon: CalendarRange, description: 'Your open work, upcoming schedule, and saved routines.' },
  { id: 'quarter', label: 'Quarter', icon: Target, description: 'Your active goals and the notes supporting them.' },
  { id: 'year', label: 'Year', icon: Flag, description: 'Your real longer-range goals, not a sample vision board.' },
  { id: 'books', label: 'Books', icon: BookOpen, description: 'Book tracking is not connected yet.' },
  { id: 'bucket-list', label: 'Bucket List', icon: ListChecks, description: 'A dedicated bucket-list data source is not connected yet.' },
];

function Empty({ children }: { children: React.ReactNode }) {
  return <div className="rounded-3xl border p-5 text-sm opacity-70" style={{ background: 'var(--glow-bg)', borderColor: 'var(--glow-border)' }}>{children}</div>;
}

export function PlanningHub() {
  const personal = usePersonalContext();
  const [activeView, setActiveView] = useState<PlanningView>('week');
  const active = useMemo(() => views.find((view) => view.id === activeView) ?? views[0], [activeView]);
  const data = personal.status === 'ready' ? personal.data : null;

  const weekItems = useMemo(() => {
    if (!data) return [];
    return [
      ...data.tasks.slice(0, 6).map((task) => ({ id: `task-${task.id}`, title: task.title, meta: `${task.priority} priority · ${task.status === 'in_progress' ? 'in progress' : 'open'}`, href: '/tasks' })),
      ...data.events.slice(0, 6).map((event) => ({ id: `event-${event.source}-${event.id}`, title: event.title, meta: new Date(event.startAt).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' }), href: '/calendar' })),
      ...data.routines.slice(0, 4).map((routine) => ({ id: `routine-${routine.id}`, title: routine.name, meta: `${routine.timeOfDay} routine`, href: '/routines' })),
    ].slice(0, 12);
  }, [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Planning views">
        {views.map((view) => {
          const Icon = view.icon;
          const selected = view.id === activeView;
          return (
            <button
              key={view.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActiveView(view.id)}
              className="flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition"
              style={{
                borderColor: selected ? 'var(--glow-accent)' : 'var(--glow-border)',
                background: selected ? 'var(--glow-accent-soft)' : 'var(--glow-surface)',
                color: selected ? 'var(--glow-accent)' : 'var(--glow-text)',
              }}
            >
              <Icon size={16} />
              {view.label}
            </button>
          );
        })}
      </div>

      <section className="rounded-glow border p-5 sm:p-6" style={{ background: 'var(--glow-surface)', borderColor: 'var(--glow-border)' }}>
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] opacity-50">{active.label} view</p>
          <h2 className="mt-2 text-2xl font-semibold" style={{ fontFamily: 'var(--glow-font-display)' }}>
            {personal.status === 'ready' ? 'Your actual planning context' : 'Connect your Glow account to plan from real data'}
          </h2>
          <p className="mt-2 text-sm opacity-70">{active.description}</p>
        </div>

        {activeView === 'week' ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {weekItems.map((item) => (
              <a key={item.id} href={item.href} className="rounded-3xl border p-4 no-underline" style={{ background: 'var(--glow-bg)', borderColor: 'var(--glow-border)', color: 'var(--glow-text)' }}>
                <p className="font-medium">{item.title}</p>
                <p className="mt-1 text-sm opacity-60">{item.meta}</p>
              </a>
            ))}
            {personal.status === 'ready' && weekItems.length === 0 ? <Empty>Your week has no open tasks, upcoming events, or saved routines yet.</Empty> : null}
          </div>
        ) : null}

        {activeView === 'quarter' ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            {data?.goals.slice(0, 8).map((goal) => (
              <a key={goal.id} href="/goals" className="rounded-3xl border p-4 no-underline" style={{ background: 'var(--glow-bg)', borderColor: 'var(--glow-border)', color: 'var(--glow-text)' }}>
                <p className="font-medium">{goal.title}</p>
                <p className="mt-1 text-sm opacity-60">{goal.category} · {Math.round(goal.progress)}% · {goal.status.replaceAll('_', ' ')}</p>
              </a>
            ))}
            {data?.notes.slice(0, 4).map((note) => (
              <a key={note.id} href="/notes" className="rounded-3xl border p-4 no-underline" style={{ background: 'var(--glow-bg)', borderColor: 'var(--glow-border)', color: 'var(--glow-text)' }}>
                <p className="font-medium">{note.title}</p>
                <p className="mt-1 text-sm opacity-60">{note.pinned ? 'Pinned note' : 'Planning context'}</p>
              </a>
            ))}
            {personal.status === 'ready' && (data?.goals.length ?? 0) === 0 && (data?.notes.length ?? 0) === 0 ? <Empty>No goals or planning notes are saved for this account yet.</Empty> : null}
          </div>
        ) : null}

        {activeView === 'year' ? (
          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {data?.goals.map((goal) => (
              <a key={goal.id} href="/goals" className="rounded-3xl border p-4 no-underline" style={{ background: 'var(--glow-bg)', borderColor: 'var(--glow-border)', color: 'var(--glow-text)' }}>
                <p className="font-medium">{goal.title}</p>
                <p className="mt-1 text-sm opacity-60">{goal.targetDate ? `Target ${new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : 'No target date'} · {Math.round(goal.progress)}%</p>
              </a>
            ))}
            {personal.status === 'ready' && (data?.goals.length ?? 0) === 0 ? <Empty>No long-range goals are saved yet. Glow is not filling this with a generic vision.</Empty> : null}
          </div>
        ) : null}

        {activeView === 'books' ? <div className="mt-6"><Empty>Books are not connected to a real Glow data source yet. This page will stay honest and empty until you add or connect a book system.</Empty></div> : null}
        {activeView === 'bucket-list' ? <div className="mt-6"><Empty>There is no dedicated bucket-list database connected yet. Glow will not present sample experiences as yours.</Empty></div> : null}
      </section>

      <aside className="rounded-3xl border px-4 py-3 text-sm" style={{ background: 'var(--glow-accent-soft)', borderColor: 'var(--glow-border)' }}>
        Planning now uses your signed-in Glow records. Anything without a real data source is labeled unconnected instead of being simulated.
      </aside>
    </div>
  );
}
