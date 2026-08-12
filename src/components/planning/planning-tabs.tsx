'use client';

import { useState } from 'react';
import { PlanningOverview } from '@/components/planning/planning-overview';
import { PlanningHub } from '@/components/planning/planning-hub';
import type { CalendarEvent, Note, Task } from '@/lib/types';

type Tab = 'Overview' | 'Day' | 'Week' | 'Month' | 'Year';
const TABS: Tab[] = ['Overview', 'Day', 'Week', 'Month', 'Year'];
const HUB_VIEW: Record<Exclude<Tab, 'Overview'>, 'today' | 'week' | 'month' | 'year'> = { Day: 'today', Week: 'week', Month: 'month', Year: 'year' };

export function PlanningTabs(props: {
  tasks: Task[];
  events: CalendarEvent[];
  projects: { id: string; title: string; status: string; progress: number }[];
  notes: Note[];
  blockedTasks: { task: Task; blockedBy: string[] }[];
  sundayResetSteps: { id: string; title: string }[];
  insight: string | null;
  userName: string;
}) {
  const [tab, setTab] = useState<Tab>('Overview');

  return (
    <div className="space-y-5">
      <nav className="flex gap-6 border-b border-[#F1E7E3]" role="tablist" aria-label="Planning views">
        {TABS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={tab === item}
            onClick={() => setTab(item)}
            className={`relative pb-3 text-[14px] font-medium transition ${tab === item ? 'text-[#C9727E]' : 'text-[#8A8078] hover:text-[#4A4440]'}`}
          >
            {item}
            {tab === item ? <span className="absolute inset-x-0 -bottom-px h-[2px] rounded-full bg-[#C9727E]" /> : null}
          </button>
        ))}
      </nav>

      {tab === 'Overview' ? <PlanningOverview {...props} /> : <PlanningHub view={HUB_VIEW[tab]} />}
    </div>
  );
}
