'use client';

import Link from 'next/link';
import type { PlanningView } from '@/lib/productivity/types';

const sections: Record<Exclude<PlanningView, 'quarter' | 'books' | 'bucket-list'>, Array<{ title: string; href: string; detail: string }>> = {
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
  year: [
    { title: 'Vision reflection', href: '/planning', detail: 'Create or update a Year planning layer below.' },
    { title: 'Non-negotiables', href: '/habits', detail: 'Turn recurring standards into trackable habits.' },
    { title: 'Yearly focus', href: '/goals', detail: 'Review long-range goals.' },
    { title: 'What I want to change', href: '/memory', detail: 'Save important decisions and identity shifts.' },
    { title: 'Goals by category', href: '/goals', detail: 'Keep every life area connected.' },
  ],
};

const LABELS: Record<keyof typeof sections, string> = { today: 'Day', week: 'Week', month: 'Month', year: 'Year' };

export function PlanningHub({ view }: { view: keyof typeof sections }) {
  const active = sections[view];
  return (
    <section className="rounded-[20px] border border-[#F1E7E3] bg-white p-5 sm:p-6">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#9A9088]">{LABELS[view]} view</p>
        <h2 className="glow-display mt-2 text-[22px] text-[#2B2420]">One calm place for the bigger picture</h2>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {active.map((section) => (
          <Link key={section.title} href={section.href} className="rounded-[16px] border border-[#F1E7E3] bg-[#FDFAF8] p-4 transition hover:-translate-y-0.5 hover:shadow-sm">
            <p className="text-[13px] font-medium text-[#2B2420]">{section.title}</p>
            <p className="mt-1 text-[11.5px] text-[#8A8078]">{section.detail}</p>
            <p className="mt-3 text-[11px] font-medium text-[#C9727E]">Open →</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
