'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CalendarRange, Flag, ListChecks, MoonStar, RefreshCw, SunMedium, Target } from 'lucide-react';
import type { PlanningView } from '@/lib/productivity/types';

const views: Array<{ id: PlanningView; label: string; icon: typeof CalendarRange; description: string }> = [
  { id: 'today', label: 'Today', icon: SunMedium, description: 'Anchor the day to real commitments, priorities, routines, and energy.' },
  { id: 'week', label: 'Week', icon: CalendarRange, description: 'Tasks, gym sessions, weekly focus, reading, and reflections.' },
  { id: 'month', label: 'Month', icon: CalendarDays, description: 'See the month as one connected layer of commitments, maintenance, goals, and resets.' },
  { id: 'quarter', label: 'Quarter', icon: Target, description: 'Finances, goals, achievements, books, and your idea parking lot.' },
  { id: 'year', label: 'Year', icon: Flag, description: 'Vision, non-negotiables, yearly themes, and long-range goals.' },
  { id: 'books', label: 'Books', icon: BookOpen, description: 'Save and track what you are reading inside persistent Planning.' },
  { id: 'bucket-list', label: 'Bucket List', icon: ListChecks, description: 'Track meaningful experiences and long-term wishes inside persistent Planning.' },
];

const sections: Record<PlanningView, Array<{ title: string; href: string; detail: string }>> = {
  today: [
    { title: 'Build My Day', href: '/today', detail: 'Use live tasks, calendar context, routines, and the Now Engine to shape today.' },
    { title: 'Today’s commitments', href: '/calendar?view=day', detail: 'Review fixed commitments before adding more.' },
    { title: 'Current focus', href: '/tasks?view=now', detail: 'Move directly into the highest-value executable work.' },
    { title: 'Life mode and energy', href: '/today', detail: 'Let planning adapt to your current mode and capacity.' },
    { title: 'Finish My Day', href: '/today', detail: 'Close the loop so today can feed Memory, Timeline, and tomorrow.' },
  ],
  week: [
    { title: 'Weekly task checklist', href: '/tasks?view=upcoming', detail: 'Open upcoming work and decide what actually belongs this week.' },
    { title: 'Week calendar', href: '/calendar?view=week', detail: 'Balance commitments with realistic open space.' },
    { title: 'Gym session tracker', href: '/fitness', detail: 'Log workouts, energy, soreness, equipment, and notes.' },
    { title: 'Weekly focus and goals', href: '/goals', detail: 'Connect current goals to this week.' },
    { title: 'Weekly reflections', href: '/planning', detail: 'Save reflections directly in your planning layers.' },
  ],
  month: [
    { title: 'Month calendar', href: '/calendar?view=month', detail: 'Scan the whole month for busy periods, open space, and collisions.' },
    { title: 'Maintenance forecast', href: '/notices', detail: 'Bring upcoming life maintenance into the plan before it becomes urgent.' },
    { title: 'Goals and milestones', href: '/goals', detail: 'Choose the milestones that should move this month.' },
    { title: 'Finance horizon', href: '/finance', detail: 'Review bills, subscriptions, savings, and upcoming expenses.' },
    { title: 'Monthly reflection', href: '/briefings', detail: 'Use reports and patterns to adjust the next month.' },
  ],
  quarter: [
    { title: '13-week consistency overview', href: '/habits', detail: 'Use Habit history as the consistency signal.' },
    { title: 'Credit cards and savings goals', href: '/finance/brain', detail: 'Track savings and financial goals.' },
    { title: 'Quarterly goals by category', href: '/goals', detail: 'Organize the outcomes that matter this quarter.' },
    { title: 'Achievements', href: '/timeline', detail: 'Record milestones in your Life Timeline.' },
    { title: 'Idea parking lot', href: '/notes', detail: 'Capture ideas without losing focus.' },
  ],
  year: [
    { title: 'Vision reflection', href: '/planning', detail: 'Create or update a Year planning layer above.' },
    { title: 'Non-negotiables', href: '/habits', detail: 'Turn recurring standards into trackable habits.' },
    { title: 'Yearly focus', href: '/goals', detail: 'Review long-range goals.' },
    { title: 'What I want to change', href: '/memory', detail: 'Save important decisions and identity shifts.' },
    { title: 'Goals by category', href: '/goals', detail: 'Keep every life area connected.' },
  ],
  books: [
    { title: 'Add a book', href: '/planning', detail: 'Choose Book in Create a planning layer above.' },
    { title: 'Currently reading', href: '/planning', detail: 'Use progress and reflection fields to track the book.' },
    { title: 'Want to read', href: '/planning', detail: 'Save future reads as Book layers with 0% progress.' },
    { title: 'Books finished', href: '/timeline', detail: 'Add completed books to your Life Timeline.' },
  ],
  'bucket-list': [
    { title: 'Add a bucket-list item', href: '/planning', detail: 'Choose Bucket list in Create a planning layer above.' },
    { title: 'Completion progress', href: '/planning', detail: 'Update each item from 0 to 100%.' },
    { title: 'Dates and notes', href: '/planning', detail: 'Add target dates, details, and reflections.' },
    { title: 'Completed experiences', href: '/timeline', detail: 'Move meaningful completed experiences into your Life Timeline.' },
  ],
};

export function PlanningHub() {
  const [activeView, setActiveView] = useState<PlanningView>('today');
  const active = useMemo(() => views.find((view) => view.id === activeView) ?? views[0], [activeView]);

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-2">
        <Link href="/planning?reset=sunday" className="rounded-[24px] border border-[#eadfd8] bg-[linear-gradient(145deg,#fffaf7,#f4ece6)] p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex items-center gap-2 text-[#9b6c70]"><RefreshCw size={15}/><p className="glow-eyebrow">Sunday Reset</p></div>
          <p className="glow-display mt-2 text-[20px] text-[#493b36]">Reset the week before it starts.</p>
          <p className="mt-2 text-[9px] leading-4 text-[#7d6c65]">Review unfinished work, calendar pressure, home maintenance, wellness, money, and the one focus that matters most next week.</p>
          <p className="mt-4 text-[9px] font-medium text-[#6d5355]">Open weekly planning →</p>
        </Link>
        <Link href="/tomorrow" className="rounded-[24px] border border-[#e4ded7] bg-[linear-gradient(145deg,#faf8f5,#eee8e3)] p-5 transition hover:-translate-y-0.5 hover:shadow-sm">
          <div className="flex items-center gap-2 text-[#7c6b78]"><MoonStar size={15}/><p className="glow-eyebrow">Prepare Tomorrow</p></div>
          <p className="glow-display mt-2 text-[20px] text-[#493b36]">End today with tomorrow already lighter.</p>
          <p className="mt-2 text-[9px] leading-4 text-[#7d6c65]">Review tomorrow’s commitments, top three priorities, suggested wake target, and what should be prepared tonight.</p>
          <p className="mt-4 text-[9px] font-medium text-[#625761]">Prepare tomorrow →</p>
        </Link>
      </section>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Planning views">
        {views.map((view) => {
          const Icon = view.icon;
          const selected = view.id === activeView;
          return (
            <button key={view.id} type="button" role="tab" aria-selected={selected} onClick={() => setActiveView(view.id)} className="flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm font-medium transition" style={{ borderColor: selected ? 'var(--glow-accent)' : 'var(--glow-border)', background: selected ? 'var(--glow-accent-soft)' : 'var(--glow-surface)', color: selected ? 'var(--glow-accent)' : 'var(--glow-text)' }}>
              <Icon size={16} />{view.label}
            </button>
          );
        })}
      </div>

      <section className="rounded-glow border p-5 sm:p-6" style={{ background: 'var(--glow-surface)', borderColor: 'var(--glow-border)' }}>
        <div className="max-w-2xl"><p className="text-xs uppercase tracking-[0.3em] opacity-50">{active.label} view</p><h2 className="mt-2 text-2xl font-semibold" style={{ fontFamily: 'var(--glow-font-display)' }}>One calm place for the bigger picture</h2><p className="mt-2 text-sm opacity-70">{active.description}</p></div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sections[activeView].map((section) => (
            <Link key={section.title} href={section.href} className="rounded-3xl border p-4 transition hover:-translate-y-0.5 hover:shadow-sm" style={{ background: 'var(--glow-bg)', borderColor: 'var(--glow-border)' }}>
              <p className="font-medium">{section.title}</p><p className="mt-1 text-sm opacity-60">{section.detail}</p><p className="mt-3 text-xs font-medium opacity-70">Open →</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
