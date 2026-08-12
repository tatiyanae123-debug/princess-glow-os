'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Focus, Plus } from 'lucide-react';
import { TaskBoard } from '@/components/tasks/task-board';
import { TaskManager } from '@/components/tasks/task-manager';
import type { Task } from '@/lib/types';

type Tab = 'Overview' | 'List' | 'Focus Mode';
const TABS: Tab[] = ['Overview', 'List', 'Focus Mode'];

export function TasksExperience({ initialTasks, blockedTaskIds }: { initialTasks: Task[]; blockedTaskIds: Record<string, string[]> }) {
  const [tab, setTab] = useState<Tab>('Overview');

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="glow-display text-[38px] leading-none text-[#2B2420] sm:text-[46px]">Tasks</h1>
          <p className="mt-2 text-[13px] text-[#8A8078]">Organize your tasks. Focus on what matters. Create momentum.</p>
        </div>
        <button
          type="button"
          onClick={() => document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: { module: 'task' } }))}
          className="hidden items-center gap-1.5 rounded-full bg-[#C9727E] px-4 py-2.5 text-[12.5px] font-medium text-white sm:inline-flex"
        >
          <Plus size={14} />New Task
        </button>
      </header>

      <nav className="flex items-center gap-6 border-b border-[#F1E7E3]" role="tablist" aria-label="Tasks views">
        {TABS.map((item) =>
          item === 'Focus Mode' ? (
            <Link key={item} href="/focus" className="flex items-center gap-1.5 pb-3 text-[14px] font-medium text-[#8A8078] hover:text-[#4A4440]">
              <Focus size={13} />{item}
            </Link>
          ) : (
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
          ),
        )}
      </nav>

      {tab === 'Overview' ? <TaskBoard initialTasks={initialTasks} blockedTaskIds={blockedTaskIds} /> : <TaskManager initialTasks={initialTasks} />}
    </div>
  );
}
