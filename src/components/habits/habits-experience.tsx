'use client';

import { useMemo, useState } from 'react';
import { Flame, Flower2, Leaf, Sparkles, Sprout, TreeDeciduous } from 'lucide-react';
import { HabitManager } from '@/components/habits/habit-manager';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { buildHabitDashboardStats, categorize } from '@/lib/habits/dashboard-stats';
import type { Habit, HabitLog } from '@/lib/types';

const CATEGORY_TONE: Record<string, string> = {
  Mind: 'bg-[#E4EBDD] text-[#5A6E52]',
  Health: 'bg-[#DDE7EE] text-[#4E6B82]',
  Fitness: 'bg-[#F6E3D6] text-[#9A6A3D]',
  Wellness: 'bg-[#E9E4F2] text-[#6E5E92]',
  General: 'bg-[#F1E8E4] text-[#8A5A56]',
};

function plantStage(streak: number) {
  if (streak >= 30) return { label: 'Flourishing', height: 90, leaves: 6, flower: true };
  if (streak >= 14) return { label: 'Blooming', height: 76, leaves: 5, flower: true };
  if (streak >= 7) return { label: 'Growing', height: 60, leaves: 4, flower: false };
  if (streak >= 3) return { label: 'Sprouting', height: 45, leaves: 2, flower: false };
  if (streak >= 1) return { label: 'Seedling', height: 32, leaves: 1, flower: false };
  return { label: 'Planted', height: 18, leaves: 0, flower: false };
}

function HabitPlant({ name, streak, done }: { name: string; streak: number; done: boolean }) {
  const stage = plantStage(streak);
  const leaves = Array.from({ length: stage.leaves });
  return (
    <div className="group flex min-w-0 flex-col items-center text-center">
      <div className="relative flex h-[116px] w-full items-end justify-center overflow-hidden rounded-[14px] border border-[#E6EBDD] bg-[linear-gradient(180deg,#FBFCF8_0%,#F2F6EC_68%,#E5E2D5_69%,#D9D2BE_100%)] px-2 pb-[13px] shadow-[inset_0_1px_0_rgba(255,255,255,.9)]">
        <div className="absolute bottom-[7px] h-[12px] w-[46px] rounded-[50%] bg-[#B8AA8E]/28 blur-[1px]" />
        <div className="relative flex items-end justify-center" style={{ height: stage.height }}>
          <div className={`w-[2px] rounded-full ${done ? 'bg-[#6E8A65]' : 'bg-[#8CA07F]'}`} style={{ height: Math.max(10, stage.height - 7) }} />
          {leaves.map((_, index) => {
            const side = index % 2 === 0 ? 'left' : 'right';
            const y = 14 + Math.floor(index / 2) * 14;
            return (
              <span
                key={index}
                className={`absolute h-[11px] w-[18px] bg-[#89A17E] ${side === 'left' ? 'origin-bottom-right -rotate-[34deg] rounded-[90%_20%_80%_20%]' : 'origin-bottom-left rotate-[34deg] rounded-[20%_90%_20%_80%]'}`}
                style={{ bottom: y, [side]: '50%' }}
              />
            );
          })}
          {stage.flower ? (
            <div className="absolute -top-1 left-1/2 -translate-x-1/2">
              <Flower2 size={streak >= 30 ? 27 : 22} strokeWidth={1.05} className={done ? 'fill-[#F7D1D8]/50 text-[#A75A6A]' : 'fill-[#F3DFD7]/60 text-[#B88174]'} />
            </div>
          ) : streak === 0 ? (
            <div className="absolute bottom-0 left-1/2 h-3 w-5 -translate-x-1/2 rounded-[50%] bg-[#927D62]/55" />
          ) : null}
        </div>
        {done ? <span className="absolute right-2 top-2 rounded-full bg-white/90 px-1.5 py-0.5 text-[8px] font-medium text-[#627A5C] shadow-sm">today ✓</span> : null}
      </div>
      <p className="mt-2 w-full truncate text-[10.5px] font-medium text-[#3A332E]">{name}</p>
      <p className="mt-0.5 text-[9px] text-[#8A8078]">{stage.label} · {streak} day{streak === 1 ? '' : 's'}</p>
    </div>
  );
}

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
          <p className="mt-2 text-[13px] text-[#8A8078]">Small actions. Big impact.</p>
        </div>
        <button type="button" onClick={() => setShowManager(true)} className="inline-flex items-center gap-2 rounded-[9px] border border-[#E9E4DF] bg-white px-3.5 py-2 text-[11px] font-medium text-[#4A4440] shadow-[0_5px_18px_rgba(54,39,33,.04)]"><Sprout size={13} className="text-[#7C9271]" />Add Habit</button>
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
          <div className="mt-3 flex items-center gap-3"><div className="relative flex h-16 w-16 items-center justify-center rounded-full" style={{ background: `conic-gradient(#C9727E ${stats.totalHabits ? (stats.completedToday / stats.totalHabits) * 360 : 0}deg, #F4ECE8 0deg)` }}><div className="flex h-12 w-12 items-center justify-center rounded-full bg-white"><span className="glow-display text-[16px] text-[#2B2420]">{stats.completedToday}<span className="text-[10px] text-[#9A9088]">/{stats.totalHabits}</span></span></div></div><p className="text-[11px] text-[#9A9088]">Keep it going.</p></div>
        </div>
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[12px] font-medium text-[#2B2420]">Weekly Progress</p><p className="glow-display mt-2 text-[26px] text-[#2B2420]">{stats.weeklyProgress}%</p>
          <div className="mt-3 flex items-end gap-1.5">{stats.weeklyBars.map((bar, index) => <div key={`${bar.label}-${index}`} className="flex flex-1 flex-col items-center gap-1"><div className="h-10 w-full overflow-hidden rounded-full bg-[#F4ECE8]"><div className="w-full rounded-full bg-[#7F9474]" style={{ height: `${Math.max(6, bar.ratio * 100)}%`, marginTop: `${(1 - Math.max(0.06, bar.ratio)) * 40}px` }} /></div><span className="text-[9px] text-[#B5ACA5]">{bar.label[0]}</span></div>)}</div>
        </div>
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[12px] font-medium text-[#2B2420]">Garden Growth</p><p className="glow-display mt-3 text-[30px] text-[#2B2420]">{initialHabits.filter((habit) => (stats.insights.get(habit.id)?.currentStreak ?? 0) >= 7).length}</p><p className="text-[11px] text-[#9A9088]">habits growing strongly</p>
        </div>
      </div>

      <section className="overflow-hidden rounded-[18px] border border-[#E8E7DE] bg-white shadow-[0_12px_38px_rgba(65,55,42,.045)]">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[#F0ECE7] px-5 py-4">
          <div><div className="flex items-center gap-2"><Leaf size={14} className="text-[#768B6C]" /><h2 className="glow-display text-[19px] text-[#2B2420]">Your Habit Garden</h2></div><p className="mt-1 text-[11px] text-[#8A8078]">Each habit is a living plant. Consistency moves it from seed → sprout → bloom → flourishing.</p></div>
          <button type="button" onClick={() => setShowManager(true)} className="text-[10.5px] font-medium text-[#7A8C70]">Manage garden →</button>
        </div>
        {initialHabits.length === 0 ? (
          <div className="grid min-h-[190px] place-items-center bg-[linear-gradient(180deg,#FBFCF9,#F2F5EC)] p-8 text-center"><div><Sprout size={28} strokeWidth={1} className="mx-auto text-[#8CA07F]" /><p className="mt-3 glow-display text-[17px]">Plant your first habit.</p><p className="mt-1 text-[11px] text-[#8A8078]">As you complete it, Glow will grow it with you.</p><button type="button" onClick={() => setShowManager(true)} className="mt-4 rounded-[8px] bg-[#75886C] px-4 py-2 text-[10.5px] font-medium text-white">+ Plant a habit</button></div></div>
        ) : (
          <div className="grid grid-cols-2 gap-3 bg-[linear-gradient(180deg,#FBFCF9,#F5F6F0)] p-4 sm:grid-cols-3 lg:grid-cols-6">
            {initialHabits.slice(0, 12).map((habit) => <HabitPlant key={habit.id} name={habit.name} streak={stats.insights.get(habit.id)?.currentStreak ?? 0} done={loggedToday.has(habit.id)} />)}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[#F0ECE7] bg-[#FFFDFC] px-5 py-3 text-[9px] text-[#918980]"><span>● Seed 0 days</span><span>↟ Seedling 1–2</span><span>♧ Sprout 3–6</span><span>♧ Growing 7–13</span><span>✿ Bloom 14–29</span><span>✿ Flourishing 30+</span></div>
      </section>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between"><p className="text-[13px] font-medium text-[#2B2420]">Today&apos;s Habits</p><button type="button" onClick={() => setShowManager(true)} className="rounded-full border border-[#F1E7E3] px-3 py-1.5 text-[11px] font-medium text-[#8A8078]">Manage</button></div>
          <div className="mt-3 divide-y divide-[#F4ECE8]">{initialHabits.length === 0 ? <p className="py-6 text-center text-[12px] text-[#9A9088]">No habits yet.</p> : initialHabits.map((habit) => { const done = loggedToday.has(habit.id); const category = categorize(habit); const insight = stats.insights.get(habit.id); const StageIcon = (insight?.currentStreak ?? 0) >= 21 ? TreeDeciduous : (insight?.currentStreak ?? 0) >= 7 ? Flower2 : Sprout; return <div key={habit.id} className="flex items-center gap-3 py-2.5"><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${done ? 'bg-[#75886C] text-white' : 'border border-[#D8CDC8]'}`}>{done ? '✓' : ''}</span><StageIcon size={13} strokeWidth={1.15} className="shrink-0 text-[#7F9474]"/><span className="min-w-0 flex-1 truncate text-[13px] text-[#3A332E]">{habit.name}</span><span className={`hidden shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium sm:inline ${CATEGORY_TONE[category]}`}>{category}</span><span className="shrink-0 text-[11px] font-medium text-[#7A8C70]">{insight?.currentStreak ?? 0} day streak</span></div>; })}</div>
          <p className="mt-4 text-center text-[11.5px] italic text-[#9A9088]">&ldquo;Every choice plants a seed.&rdquo;</p>
        </div>
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <p className="text-[13px] font-medium text-[#2B2420]">Habits by Category</p><div className="mt-3 space-y-3">{stats.categoryBreakdown.length === 0 ? <p className="text-[12px] text-[#9A9088]">Add habits to see category trends.</p> : stats.categoryBreakdown.map(({ category, count, percent }) => <div key={category} className="flex items-center gap-3"><span className={`w-16 shrink-0 rounded-full px-2 py-1 text-center text-[10px] font-medium ${CATEGORY_TONE[category]}`}>{category}</span><span className="w-16 shrink-0 text-[11px] text-[#9A9088]">{count} habit{count === 1 ? '' : 's'}</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#7F9474]" style={{ width: `${percent}%` }} /></div><span className="w-9 shrink-0 text-right text-[11px] text-[#9A9088]">{percent}%</span></div>)}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><Sprout size={16} className="text-[#8CA07F]" /><p className="mt-2 text-[11px] font-medium uppercase tracking-[.08em] text-[#9A9088]">Insight</p><p className="glow-display mt-1 text-[16px] text-[#2B2420]">{stats.bestWeekdayLabel ? `You're most consistent on ${stats.isWeekdayStrong ? 'weekdays' : 'weekends'}.` : 'Log a few more days to see your pattern.'}</p>{stats.bestWeekdayLabel ? <p className="mt-1.5 text-[11.5px] text-[#8A8078]">Try building a {stats.isWeekdayStrong ? 'weekend' : 'weekday'} anchor habit.</p> : null}</div>
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[.08em] text-[#9A9088]"><Sparkles size={13} className="text-[#C9727E]" />Best Time</div><p className="glow-display mt-2 text-[22px] text-[#2B2420]">{stats.bestHour !== null ? new Date(2000, 0, 1, stats.bestHour).toLocaleTimeString('en-US', { hour: 'numeric' }) : '—'}</p><p className="mt-1.5 text-[11.5px] text-[#8A8078]">{stats.bestHour !== null ? 'You complete habits most consistently at this time.' : 'Log a habit to discover your rhythm.'}</p></div>
        <div className="relative overflow-hidden rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center gap-3"><EditableRoomImage slot="habits:sprout" label="Habit growth" className="h-12 w-12 shrink-0 rounded-full" overlay={false} /><div><p className="glow-display text-[16px] text-[#2B2420]">Keep growing.</p><p className="text-[11.5px] text-[#8A8078]">{stats.totalHabits > 0 ? "Your garden reflects what you've practiced." : 'Plant your first habit.'}</p></div></div></div>
      </div>

      {showManager ? <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5"><div className="flex items-center justify-between"><p className="text-[13px] font-medium text-[#2B2420]">Manage Habits</p><button type="button" onClick={() => setShowManager(false)} className="text-[11.5px] font-medium text-[#C9727E]">Close</button></div><div className="mt-4"><HabitManager initialHabits={initialHabits} initialLogs={initialLogs} /></div></div> : null}
    </div>
  );
}
