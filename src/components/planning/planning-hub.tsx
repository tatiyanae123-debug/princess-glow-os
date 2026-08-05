'use client';

import { useMemo, useState } from 'react';
import { BookOpen, CalendarRange, Flag, ListChecks, Target } from 'lucide-react';
import type { PlanningView } from '@/lib/productivity/types';

const views: Array<{ id: PlanningView; label: string; icon: typeof CalendarRange; description: string }> = [
  { id: 'week', label: 'Week', icon: CalendarRange, description: 'Tasks, gym sessions, weekly focus, reading, and reflections.' },
  { id: 'quarter', label: 'Quarter', icon: Target, description: 'Finances, goals, achievements, books, and your idea parking lot.' },
  { id: 'year', label: 'Year', icon: Flag, description: 'Vision, non-negotiables, yearly themes, and long-range goals.' },
  { id: 'books', label: 'Books', icon: BookOpen, description: 'Search, save, and track what you are reading.' },
  { id: 'bucket-list', label: 'Bucket List', icon: ListChecks, description: 'Track meaningful experiences and long-term wishes.' },
];

const sections: Record<PlanningView, string[]> = {
  week: ['Weekly task checklist', 'Gym session tracker', 'Weekly focus and goals', 'Currently reading', 'Weekly reflections'],
  quarter: ['13-week consistency overview', 'Credit cards and savings goals', 'Quarterly goals by category', 'Achievements', 'Idea parking lot'],
  year: ['Vision reflection', 'Non-negotiables', 'Yearly focus', 'What I want to change', 'Goals by category'],
  books: ['Open Library search', 'Currently reading', 'Want to read', 'Books finished this quarter'],
  'bucket-list': ['Category filters', 'Completion progress', 'Add and edit items', 'Completion dates'],
};

export function PlanningHub() {
  const [activeView, setActiveView] = useState<PlanningView>('week');
  const active = useMemo(() => views.find((view) => view.id === activeView) ?? views[0], [activeView]);

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

      <section
        className="rounded-glow border p-5 sm:p-6"
        style={{ background: 'var(--glow-surface)', borderColor: 'var(--glow-border)' }}
      >
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] opacity-50">{active.label} view</p>
          <h2 className="mt-2 text-2xl font-semibold" style={{ fontFamily: 'var(--glow-font-display)' }}>
            One calm place for the bigger picture
          </h2>
          <p className="mt-2 text-sm opacity-70">{active.description}</p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sections[activeView].map((section) => (
            <article
              key={section}
              className="rounded-3xl border p-4"
              style={{ background: 'var(--glow-bg)', borderColor: 'var(--glow-border)' }}
            >
              <p className="font-medium">{section}</p>
              <p className="mt-1 text-sm opacity-60">Ready for the database-backed feature implementation.</p>
            </article>
          ))}
        </div>
      </section>

      <aside
        className="rounded-3xl border px-4 py-3 text-sm"
        style={{ background: 'var(--glow-accent-soft)', borderColor: 'var(--glow-border)' }}
      >
        This foundation keeps the existing database and architecture. Persistence, Open Library search, completion effects, and historical navigation will be added without replacing the current Glow OS systems.
      </aside>
    </div>
  );
}
