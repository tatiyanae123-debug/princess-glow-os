'use client';

import { useMemo, useState } from 'react';
import { Flame, Flower2, Leaf, Sparkles, Sprout, TreeDeciduous } from 'lucide-react';
import { HabitManager } from '@/components/habits/habit-manager';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { buildHabitDashboardStats, categorize } from '@/lib/habits/dashboard-stats';
import type { Habit, HabitLog } from '@/lib/types';

function growthIcon(streak: number) {
  if (streak >= 21) return TreeDeciduous;
  if (streak >= 7) return Flower2;
  if (streak >= 1) return Sprout;
  return Sprout;
}

const CATEGORY_TONE: Record<string, string> = {
  Mind: 'bg-[#E4EBDD] text-[#5A6E52]',
  Health: 'bg-[#DDE7EE] text-[#4E6B82]',
  Fitness: 'bg-[#F6E3D6] text-[#9A6A3D]',
  Wellness: 'bg-[#E9E4F2] text-[#6E5E92]',
  General: 'bg-[#F1E8E4] text-[#8A5A56]',
};

export function HabitsExperience({ initialHabits, initialLogs }: { initialHabits: Habit[]; initialLogs: HabitLog[] }) {
  const [showManager, setShowManager] = useState(false);
  const stats = useMemo(() => buildHabitDashboardStats(initialHabits, initialLogs), [initialHabits, initialLogs]);
  const todayKey = new Date().toISOString().slice(0, 10);
  const loggedToday = useMemo(() => new Set(initialLogs.filter((log) => log.loggedDate === todayKey && log.count > 0).map((log) => log.habitId)), [initialLogs, todayKey]);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="glow-display text-[38px] leading-none text-[#2B2420] sm:text-[46px]">Habits</h1>
          <p className="mt-2 text-[13px] text-[#8A8078]">Small actions. Beautiful results.</p>
        </div>
        <div className="flex items-center gap-3 text-right">
          <Leaf size={26} className="text-[#8CA07F]" />
          <div>
            <p className="glow-display text-[14px] italic leading-tight text-[#4A4440]">&ldquo;We are what we repeatedly do.&rdquo;</p>
            <p className="text-[11px] text-[#9A9088]">— Aristotle</p>
          </div>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#2B2420]"><Flame size={14} className="text-[#C9727E]" />Current Streak</div>
          <p className="glow-display mt-3 text-[30px] text-[#2B2420]">{stats.bestCurrentStreak}</p>
          <p className="text-[11px] text-[#9A9088]">days</p>
          <span className="mt-2 inline-block rounded-full bg-[#FBE4E8] px-2.5 py-1 text-[10px] font-medium text-[#B15A68]">Best: {stats.bestEverStreak} days</span>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[12px] font-medium text-[#2B2420]">Completed Today</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `conic-gradient(#C9727E ${stats.totalHabits ? (stats.completedToday / stats.totalHabits) * 360 : 0}deg, #F4ECE8 0deg)` }}>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">
                <span className="glow-display text-[16px] text-[#2B2420]">{stats.completedToday}<span className="text-[10px] text-[#9A9088]">/{stats.totalHabits}</span></span>
              </div>
            </div>
            <p className="text-[11px] text-[#9A9088]">Keep it going!</p>
          </div>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[12px] font-medium text-[#2B2420]">Weekly Progress</p>
          <p className="glow-display mt-2 text-[26px] text-[#2B2420]">{stats.weeklyProgress}%</p>
          <div className="mt-3 flex items-end gap-1.5">
            {stats.weeklyBars.map((bar, index) => (
              <div key={`${bar.label}-${index}`} className="flex flex-1 flex-col items-center gap-1">
                <div className="h-10 w-full overflow-hidden rounded-full bg-[#F4ECE8]"><div className="w-full rounded-full bg-[#C9727E]" style={{ height: `${Math.max(6, bar.ratio * 100)}%`, marginTop: `${(1 - Math.max(0.06, bar.ratio)) * 40}px` }} /></div>
                <span className="text-[9px] text-[#B5ACA5]">{bar.label[0]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[12px] font-medium text-[#2B2420]">Total Habits</p>
          <p className="glow-display mt-3 text-[30px] text-[#2B2420]">{stats.totalHabits}</p>
          <p className="text-[11px] text-[#9A9088]">Across {stats.categoryBreakdown.length} categor{stats.categoryBreakdown.length === 1 ? 'y' : 'ies'}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-medium text-[#2B2420]">Today&apos;s Habits</p>
            <button type="button" onClick={() => setShowManager(true)} className="rounded-full border border-[#F1E7E3] px-3 py-1.5 text-[11px] font-medium text-[#8A8078]">Manage</button>
          </div>
          <div className="mt-3 divide-y divide-[#F4ECE8]">
            {initialHabits.length === 0 ? <p className="py-6 text-center text-[12px] text-[#9A9088]">No habits yet.</p> : initialHabits.map((habit) => {
              const done = loggedToday.has(habit.id);
              const category = categorize(habit);
              const insight = stats.insights.get(habit.id);
              return (
                <div key={habit.id} className="flex items-center gap-3 py-2.5">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${done ? 'bg-[#C9727E] text-white' : 'border border-[#D8CDC8]'}`}>{done ? '✓' : ''}</span>
                  <span className="min-w-0 flex-1 truncate text-[13px] text-[#3A332E]">{habit.name}</span>
                  <span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline ${CATEGORY_TONE[category]}`}>{category}</span>
                  <span className="shrink-0 text-[11px] font-medium text-[#C9727E]">{insight?.currentStreak ?? 0} day streak</span>
                </div>
              );
            })}
          </div>
          <p className="mt-4 text-center text-[11.5px] italic text-[#9A9088]">&ldquo;Every choice plants a seed.&rdquo;</p>
        </div>

        <div className="overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <p className="text-[13px] font-medium text-[#2B2420]">Your Habit Garden</p>
          <p className="mt-1 text-[11.5px] text-[#8A8078]">Nurture your habits and watch them grow.</p>
          <div className="mt-4 flex items-end justify-center gap-2 rounded-[14px] bg-[#F4F6EF] p-5">
            {initialHabits.slice(0, 6).map((habit) => {
              const streak = stats.insights.get(habit.id)?.currentStreak ?? 0;
              const Icon = growthIcon(streak);
              return <Icon key={habit.id} size={streak >= 21 ? 34 : streak >= 7 ? 28 : 22} strokeWidth={1.1} className={streak > 0 ? 'text-[#7C9271]' : 'text-[#C3CABC]'} />;
            })}
            {initialHabits.length === 0 ? <p className="text-[12px] text-[#9A9088]">Add a habit to start your garden.</p> : null}
          </div>
          <button type="button" onClick={() => setShowManager(true)} className="mt-4 rounded-full bg-[#C9727E] px-4 py-2 text-[11.5px] font-medium text-white">View Garden</button>
        </div>
      </div>

      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-[13px] font-medium text-[#2B2420]">Habits by Category</p>
          <button type="button" onClick={() => setShowManager(true)} className="text-[11.5px] font-medium text-[#C9727E]">View all</button>
        </div>
        <div className="mt-3 space-y-3">
          {stats.categoryBreakdown.length === 0 ? <p className="text-[12px] text-[#9A9088]">Add habits to see category trends.</p> : stats.categoryBreakdown.map(({ category, count, percent }) => (
            <div key={category} className="flex items-center gap-3">
              <span className={`w-16 shrink-0 rounded-full px-2 py-1 text-center text-[10px] font-medium ${CATEGORY_TONE[category]}`}>{category}</span>
              <span className="w-16 shrink-0 text-[11px] text-[#9A9088]">{count} habit{count === 1 ? '' : 's'}</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#C9727E]" style={{ width: `${percent}%` }} /></div>
              <span className="w-9 shrink-0 text-right text-[11px] text-[#9A9088]">{percent}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <Sprout size={16} className="text-[#8CA07F]" />
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[.08em] text-[#9A9088]">Insight</p>
          <p className="glow-display mt-1 text-[16px] text-[#2B2420]">{stats.bestWeekdayLabel ? `You're most consistent on ${stats.isWeekdayStrong ? 'weekdays' : 'weekends'}.` : 'Log a few more days to see your pattern.'}</p>
          {stats.bestWeekdayLabel ? <p className="mt-1.5 text-[11.5px] text-[#8A8078]">Try building a {stats.isWeekdayStrong ? 'weekend' : 'weekday'} anchor habit.</p> : null}
        </div>
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[.08em] text-[#9A9088]"><Sparkles size={13} className="text-[#C9727E]" />Best Time</div>
          <p className="glow-display mt-2 text-[22px] text-[#2B2420]">{stats.bestHour !== null ? new Date(2000, 0, 1, stats.bestHour).toLocaleTimeString('en-US', { hour: 'numeric' }) : '—'}</p>
          <p className="mt-1.5 text-[11.5px] text-[#8A8078]">{stats.bestHour !== null ? 'You complete habits most consistently at this time.' : 'Log a habit to discover your rhythm.'}</p>
        </div>
        <div className="relative overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center gap-3">
            <EditableRoomImage slot="habits:sprout" label="Habit growth" className="h-12 w-12 shrink-0 rounded-full" overlay={false} />
            <div>
              <p className="glow-display text-[16px] text-[#2B2420]">Keep growing.</p>
              <p className="text-[11.5px] text-[#8A8078]">{stats.totalHabits > 0 ? "You're doing great." : 'Plant your first habit.'}</p>
            </div>
          </div>
        </div>
      </div>

      {showManager ? (
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between"><p className="text-[13px] font-medium text-[#2B2420]">Manage Habits</p><button type="button" onClick={() => setShowManager(false)} className="text-[11.5px] font-medium text-[#C9727E]">Close</button></div>
          <div className="mt-4"><HabitManager initialHabits={initialHabits} initialLogs={initialLogs} /></div>
        </div>
      ) : null}
    </div>
  );
}
