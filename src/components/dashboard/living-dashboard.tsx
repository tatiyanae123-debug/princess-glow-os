'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Droplets,
  FolderKanban,
  HeartPulse,
  ListChecks,
  MoonStar,
  Sparkles,
  Sun,
  Target,
  User,
  Wallet,
  Wind,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomizableVisual } from '@/components/ui/customizable-visual';
import type { DashboardRoutineProgress, DashboardWidgetId, LivingDashboardData } from '@/lib/dashboard/types';
import { DEFAULT_WIDGET_ORDER } from '@/lib/dashboard/types';
import { useGlow } from '@/lib/context/glow-provider';

const WIDGET_STORAGE_KEY = 'living-dashboard-widget-order-v1';

type WidgetDescriptor = {
  id: DashboardWidgetId;
  label: string;
  render: () => React.ReactNode;
};

const routineOrder: Array<keyof LivingDashboardData['routines']> = ['morning', 'midday', 'evening', 'night'];

function formatPriority(priority: string) {
  return priority.replace('_', ' ').replace(/^\w/, (char) => char.toUpperCase());
}

function formatTime(date: Date | null) {
  if (!date) return 'No time set';
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatWorkTime(timeValue: string) {
  return timeValue.slice(0, 5);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

function isValidWidgetOrder(value: unknown): value is DashboardWidgetId[] {
  if (!Array.isArray(value) || value.length !== DEFAULT_WIDGET_ORDER.length) return false;
  const valueSet = new Set(value);
  if (valueSet.size !== DEFAULT_WIDGET_ORDER.length) return false;
  return DEFAULT_WIDGET_ORDER.every((widgetId) => valueSet.has(widgetId));
}

function ProgressPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl px-3 py-2" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
      <p className="text-[11px] uppercase tracking-[0.25em]" style={{ color: 'var(--glow-text-muted)' }}>{label}</p>
      <p className="mt-1 text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>{value}</p>
    </div>
  );
}

function RoutineCard({ routine }: { routine: DashboardRoutineProgress }) {
  return (
    <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--glow-accent)' }}>{routine.label}</p>
          <p className="mt-2 text-2xl font-semibold" style={{ color: 'var(--glow-text)', fontFamily: 'var(--glow-font-display)' }}>{routine.completion}%</p>
        </div>
        <div className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}>
          {routine.completedSteps}/{routine.totalSteps || 0} complete
        </div>
      </div>
      <p className="mt-3 text-sm leading-6" style={{ color: 'var(--glow-text-muted)' }}>
        {routine.currentStep ?? 'Add routines to activate this block.'}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {routine.routines.length > 0 ? routine.routines.map((item) => (
          <span key={item.id} className="rounded-full px-3 py-1 text-xs" style={{ background: 'var(--glow-surface)', color: 'var(--glow-text-muted)', border: '1px solid var(--glow-border)' }}>
            {item.name}
          </span>
        )) : (
          <span className="text-xs" style={{ color: 'var(--glow-text-muted)' }}>No routines configured.</span>
        )}
      </div>
    </div>
  );
}

export function LivingDashboard({ data, error }: { data: LivingDashboardData; error?: string }) {
  const [widgetOrder, setWidgetOrder] = useState<DashboardWidgetId[]>(DEFAULT_WIDGET_ORDER);
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(true);
  const { isCustomizing, markChanged, updateVisual, getVisualSrc, getVisualPosition, createObjectUrl } = useGlow();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WIDGET_STORAGE_KEY);
      if (!raw) {
        setIsPreferencesLoading(false);
        return;
      }
      const parsed = JSON.parse(raw);
      if (isValidWidgetOrder(parsed)) setWidgetOrder(parsed);
    } catch {
      window.localStorage.removeItem(WIDGET_STORAGE_KEY);
    } finally {
      setIsPreferencesLoading(false);
    }
  }, []);

  const moveWidget = (widgetId: DashboardWidgetId, direction: 'up' | 'down') => {
    setWidgetOrder((current) => {
      const currentIndex = current.indexOf(widgetId);
      if (currentIndex === -1) return current;
      const swapIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (swapIndex < 0 || swapIndex >= current.length) return current;
      const next = [...current];
      const target = next[swapIndex];
      next[swapIndex] = widgetId;
      next[currentIndex] = target;
      window.localStorage.setItem(WIDGET_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  const widgets = useMemo<WidgetDescriptor[]>(() => [
    {
      id: 'command-center',
      label: 'Command center',
      render: () => (
        <Card>
          <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
            <div className="space-y-4">
              <div className="flex items-center gap-2" style={{ color: 'var(--glow-accent)' }}>
                <Sparkles size={15} />
                <p className="text-xs font-semibold uppercase tracking-[0.3em]">Living Command Center</p>
              </div>
              <div>
                <h2 className="text-3xl font-semibold sm:text-4xl" style={{ color: 'var(--glow-text)', fontFamily: 'var(--glow-font-display)' }}>
                  {data.hero.title}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7" style={{ color: 'var(--glow-text-muted)' }}>
                  {data.hero.subtitle}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <ProgressPill label="Today" value={data.commandCenter.todayLabel} />
                <ProgressPill label="Weekly focus" value={data.commandCenter.weeklyFocus} />
                <ProgressPill label="Sleep goal" value={data.commandCenter.sleepGoal} />
                <ProgressPill label="Weather" value={data.commandCenter.weather} />
              </div>
            </div>
            <div className="rounded-[24px] p-5" style={{ background: 'var(--glow-accent-soft)', border: '1px solid var(--glow-border)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--glow-accent)' }}>
                <Brain size={15} />
                <p className="text-xs font-semibold uppercase tracking-[0.3em]">AI concierge</p>
              </div>
              <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--glow-text)', fontFamily: 'var(--glow-font-display)' }}>
                {data.commandCenter.aiInsight}
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <ProgressPill label="Primary focus" value={data.hero.primaryFocus} />
                <ProgressPill label="Next up" value={data.hero.secondaryFocus} />
                <ProgressPill label="Overdue" value={`${data.commandCenter.overdueCount} items`} />
                <ProgressPill label="Recent wins" value={`${data.commandCenter.completedAchievements} achievements`} />
              </div>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'today-flow',
      label: 'Today flow',
      render: () => (
        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--glow-accent)' }}>Today flow</p>
              <h3 className="mt-2 text-2xl font-semibold" style={{ color: 'var(--glow-text)', fontFamily: 'var(--glow-font-display)' }}>{data.greeting.title}</h3>
              <p className="mt-2 max-w-2xl text-sm leading-7" style={{ color: 'var(--glow-text-muted)' }}>{data.greeting.message}</p>
            </div>
            <div className="rounded-2xl px-4 py-3 text-sm" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <p className="font-semibold" style={{ color: 'var(--glow-text)' }}>Today&apos;s focus</p>
              <p className="mt-1" style={{ color: 'var(--glow-text-muted)' }}>{data.dailyFocus?.title ?? 'Choose one meaningful win to anchor the day.'}</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Tasks due', value: String(data.todayOverview.tasksDueToday) },
              { label: 'Calendar events', value: String(data.todayOverview.eventsToday) },
              { label: 'Appointments', value: String(data.todayOverview.appointmentsToday) },
              { label: 'Completed today', value: String(data.todayOverview.completedToday) },
              { label: 'Habits tracked', value: String(data.todayOverview.habitsTracked) },
              { label: 'Routines active', value: String(data.todayOverview.activeRoutines) },
              { label: 'Goals active', value: String(data.todayOverview.activeGoals) },
              { label: 'Week theme', value: data.weekTheme.title },
            ].map((item) => <ProgressPill key={item.label} label={item.label} value={item.value} />)}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--glow-text-muted)' }}>
                <ListChecks size={15} />
                <p className="text-xs font-semibold uppercase tracking-[0.3em]">Top priorities</p>
              </div>
              <div className="mt-4 space-y-3">
                {data.topPriorityTasks.length > 0 ? data.topPriorityTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl p-4" style={{ background: 'var(--glow-surface)', border: '1px solid var(--glow-border)' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--glow-text)' }}>{task.title}</p>
                        <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>{task.description ?? 'No notes yet.'}</p>
                      </div>
                      <span className="rounded-full px-3 py-1 text-xs font-medium" style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}>
                        {formatPriority(task.priority)}
                      </span>
                    </div>
                  </div>
                )) : <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>No active priorities yet.</p>}
              </div>
            </div>
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--glow-text-muted)' }}>
                <Target size={15} />
                <p className="text-xs font-semibold uppercase tracking-[0.3em]">Weekly focus</p>
              </div>
              <p className="mt-4 text-lg font-semibold" style={{ color: 'var(--glow-text)' }}>{data.weekTheme.title}</p>
              <p className="mt-2 text-sm leading-7" style={{ color: 'var(--glow-text-muted)' }}>{data.weekTheme.note}</p>
              <div className="mt-4 space-y-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                <p>Workout: {data.wellness.workout}</p>
                <p>Beauty: {data.wellness.beautyFocus}</p>
                <p>Hair: {data.wellness.hairFocus}</p>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'routines',
      label: 'Routines',
      render: () => (
        <Card>
          <div className="flex items-center gap-2" style={{ color: 'var(--glow-accent)' }}>
            <CheckCircle2 size={15} />
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">Routine system</p>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {routineOrder.map((key) => <RoutineCard key={key} routine={data.routines[key]} />)}
          </div>
        </Card>
      ),
    },
    {
      id: 'calendar',
      label: 'Calendar',
      render: () => (
        <Card>
          <div className="flex items-center gap-2" style={{ color: 'var(--glow-accent)' }}>
            <CalendarDays size={15} />
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">Unified calendar</p>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-3">
              {data.todaySchedule.timeline.length > 0 ? data.todaySchedule.timeline.map((item) => (
                <div key={`${item.source}-${item.id}`} className="rounded-[22px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold" style={{ color: 'var(--glow-text)' }}>{item.title}</p>
                    <span className="rounded-full px-3 py-1 text-xs" style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}>{item.source}</span>
                  </div>
                  <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                    {item.allDay ? 'All day' : `${formatTime(item.startAt)}${item.endAt ? ` – ${formatTime(item.endAt)}` : ''}`} · {item.detail}
                  </p>
                </div>
              )) : <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>No scheduled items today.</p>}
            </div>
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--glow-text-muted)' }}>Schedule at a glance</p>
              <div className="mt-4 space-y-3 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                <p>Work slots: {data.todaySchedule.workSlots.length}</p>
                <p>Calendar events: {data.todaySchedule.events.length}</p>
                <p>Appointments: {data.todaySchedule.appointments.length}</p>
                <p>Upcoming: {data.insights.upcoming[0] ?? 'Nothing urgent next'}</p>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'habits',
      label: 'Habits',
      render: () => (
        <Card>
          <div className="flex items-center gap-2" style={{ color: 'var(--glow-accent)' }}>
            <Sparkles size={15} />
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">Habits & achievements</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ProgressPill label="Tracked habits" value={String(data.habits.total)} />
            <ProgressPill label="Completed today" value={String(data.habits.completedToday)} />
            <ProgressPill label="Average completion" value={`${data.habits.averageCompletion}%`} />
            <ProgressPill label="XP" value={String(data.habits.totalXp)} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {data.habits.summaries.length > 0 ? data.habits.summaries.map((habit) => (
              <div key={habit.id} className="rounded-[22px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold" style={{ color: 'var(--glow-text)' }}>{habit.name}</p>
                  <span className="rounded-full px-3 py-1 text-xs" style={{ background: habit.color ?? 'var(--glow-accent-soft)', color: 'white' }}>{habit.streak} day streak</span>
                </div>
                <p className="mt-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>{habit.completedToday}/{habit.targetCount} today · {habit.completionRate}% complete</p>
              </div>
            )) : <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>No habits configured yet.</p>}
          </div>
        </Card>
      ),
    },
    {
      id: 'wellness',
      label: 'Wellness',
      render: () => (
        <Card>
          <div className="flex items-center gap-2" style={{ color: 'var(--glow-accent)' }}>
            <HeartPulse size={15} />
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">Wellness system</p>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--glow-text-muted)' }}><Droplets size={14} /><span className="text-xs uppercase tracking-[0.25em]">Water</span></div>
              <p className="mt-3 text-2xl font-semibold" style={{ color: 'var(--glow-text)' }}>{data.wellness.water}/{data.wellness.targetWater}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>Hydration logged today.</p>
            </div>
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--glow-text-muted)' }}><MoonStar size={14} /><span className="text-xs uppercase tracking-[0.25em]">Sleep</span></div>
              <p className="mt-3 text-2xl font-semibold" style={{ color: 'var(--glow-text)' }}>{data.wellness.sleepHours ?? '—'}/{data.wellness.sleepGoalHours}h</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>Sleep goal tracked from wellness logs.</p>
            </div>
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--glow-text-muted)' }}><Dumbbell size={14} /><span className="text-xs uppercase tracking-[0.25em]">Workout</span></div>
              <p className="mt-3 text-base font-semibold" style={{ color: 'var(--glow-text)' }}>{data.wellness.workout}</p>
              <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>Today&apos;s movement block.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <p className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--glow-text-muted)' }}>Meal reminders</p>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>{data.wellness.meals.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <p className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--glow-text-muted)' }}>Medication reminders</p>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>{data.wellness.medication.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <p className="text-xs uppercase tracking-[0.25em]" style={{ color: 'var(--glow-text-muted)' }}>Beauty + hair</p>
              <p className="mt-3 text-sm font-medium" style={{ color: 'var(--glow-text)' }}>{data.wellness.beautyFocus}</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>{data.wellness.hairFocus}</p>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'beauty',
      label: 'Beauty',
      render: () => (
        <Card>
          <div className="flex items-center gap-2" style={{ color: 'var(--glow-accent)' }}>
            <Sun size={15} />
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">Beauty command center</p>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>Morning routine</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>{data.wellness.beautyFocus}</p>
              <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>Hair dashboard</p>
              <p className="mt-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>{data.wellness.hairFocus}</p>
            </div>
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>What&apos;s tracked already</p>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                <li>Skincare, makeup, nails, body care, and hair routines reuse the existing beauty routines collection.</li>
                <li>Evening and night routines surface in the command center without duplicating modules.</li>
                <li>Use the Beauty section to keep extending inventory, maintenance, and scheduling flows.</li>
              </ul>
            </div>
          </div>
        </Card>
      ),
    },
    {
      id: 'projects',
      label: 'Projects',
      render: () => (
        <Card>
          <div className="flex items-center gap-2" style={{ color: 'var(--glow-accent)' }}>
            <FolderKanban size={15} />
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">Projects & goals</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ProgressPill label="Goals in progress" value={String(data.projects.goalsInProgress)} />
            <ProgressPill label="Goals achieved" value={String(data.projects.goalsAchieved)} />
            <ProgressPill label="Average progress" value={`${data.projects.averageGoalProgress}%`} />
            <ProgressPill label="Active tasks" value={String(data.projects.activeTaskCount)} />
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {data.projects.current.length > 0 ? data.projects.current.map((project) => (
              <div key={project.label} className="rounded-[22px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
                <p className="font-semibold" style={{ color: 'var(--glow-text)' }}>{project.label}</p>
                <p className="mt-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                  {project.activeTasks} active tasks · {project.completedTasks} completed · {project.goalProgress}% goal progress
                </p>
              </div>
            )) : <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>Project data will populate automatically from existing goals and tasks.</p>}
          </div>
        </Card>
      ),
    },
    {
      id: 'finance',
      label: 'Finance',
      render: () => (
        <Card>
          <div className="flex items-center gap-2" style={{ color: 'var(--glow-accent)' }}>
            <Wallet size={15} />
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">Finance snapshot</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <ProgressPill label="Income" value={formatCurrency(data.finance.income)} />
            <ProgressPill label="Expenses" value={formatCurrency(data.finance.expenses)} />
            <ProgressPill label="Savings" value={formatCurrency(data.finance.savings)} />
            <ProgressPill label="Subscriptions" value={String(data.finance.subscriptions)} />
          </div>
          <p className="mt-4 text-sm" style={{ color: 'var(--glow-text-muted)' }}>{data.finance.snapshotLabel}</p>
        </Card>
      ),
    },
    {
      id: 'insights',
      label: 'Insights',
      render: () => (
        <Card>
          <div className="flex items-center gap-2" style={{ color: 'var(--glow-accent)' }}>
            <Wind size={15} />
            <p className="text-xs font-semibold uppercase tracking-[0.3em]">AI insights & wins</p>
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>Overdue</p>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                {data.insights.overdue.length > 0 ? data.insights.overdue.map((item) => <li key={item}>{item}</li>) : <li>No overdue items right now.</li>}
              </ul>
            </div>
            <div className="rounded-[24px] p-4" style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>Recent achievements</p>
              <ul className="mt-3 space-y-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                {data.achievements.length > 0 ? data.achievements.map((achievement) => (
                  <li key={achievement.id}>{achievement.label} · {achievement.detail}</li>
                )) : <li>No achievements logged yet.</li>}
              </ul>
            </div>
          </div>
          <div className="mt-4 rounded-[24px] p-4" style={{ background: 'var(--glow-accent-soft)', border: '1px solid var(--glow-border)' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--glow-accent)' }}>Recommendation</p>
            <p className="mt-3 text-sm leading-7" style={{ color: 'var(--glow-text)' }}>{data.insights.recommendation}</p>
          </div>
        </Card>
      ),
    },
  ], [data]);

  const widgetsById = useMemo(() => new Map(widgets.map((widget) => [widget.id, widget])), [widgets]);

  const heroSrc = getVisualSrc('hero');
  const profileSrc = getVisualSrc('profile');
  const heroPosition = getVisualPosition('hero');
  const profilePosition = getVisualPosition('profile');

  return (
    <div className="space-y-5 animate-fade-in">
      <Card className="overflow-hidden !p-0">
        <div className="relative">
          <div className="relative h-44 sm:h-56">
            <CustomizableVisual
              id="hero"
              src={heroSrc}
              alt="Dashboard hero image"
              aspectRatio="wide"
              mode={heroSrc ? 'photo' : 'none'}
              position={heroPosition}
              editable={isCustomizing}
              className="absolute inset-0 h-full w-full rounded-none"
              fallbackIcon={<Sparkles size={40} />}
              onChange={(v) => {
                updateVisual({ visualId: 'hero', mode: v.mode, imageUrl: v.imageUrl, position: v.position });
                markChanged();
              }}
              onFileUpload={createObjectUrl}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.02) 10%, var(--glow-surface) 100%)' }} />
          </div>

          <div className="flex flex-col gap-4 p-5 pt-0 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4 -mt-8">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full ring-4 ring-[var(--glow-surface)]">
                <CustomizableVisual
                  id="profile"
                  src={profileSrc}
                  alt="Your profile photo"
                  aspectRatio="square"
                  mode={profileSrc ? 'photo' : 'none'}
                  position={profilePosition}
                  editable={isCustomizing}
                  fallbackIcon={<User size={24} />}
                  onChange={(v) => {
                    updateVisual({ visualId: 'profile', mode: v.mode, imageUrl: v.imageUrl, position: v.position });
                    markChanged();
                  }}
                  onFileUpload={createObjectUrl}
                />
              </div>
              <div className="mb-1">
                <p className="text-xs font-semibold uppercase tracking-[0.35em]" style={{ color: 'var(--glow-accent)' }}>{data.greeting.label}</p>
                <h1 className="mt-1 text-2xl font-semibold sm:text-3xl" style={{ fontFamily: 'var(--glow-font-display)', color: 'var(--glow-text)' }}>
                  {data.hero.title}
                </h1>
              </div>
            </div>

            <div className="shrink-0 rounded-2xl px-4 py-3 text-sm max-w-xs" style={{ border: '1px solid var(--glow-border)', background: 'var(--glow-accent-soft)' }}>
              <p className="font-semibold" style={{ color: 'var(--glow-accent)' }}>{data.weekTheme.title}</p>
              <p className="mt-1 text-xs leading-5" style={{ color: 'var(--glow-text-muted)' }}>{data.weekTheme.note}</p>
            </div>
          </div>

          <div className="px-5 pb-5">
            <p className="max-w-3xl text-sm leading-7" style={{ color: 'var(--glow-text-muted)' }}>
              {data.hero.subtitle}
            </p>
          </div>
        </div>

        {error && (
          <div className="mx-5 mb-5 rounded-2xl border p-3 text-sm" style={{ background: 'var(--glow-accent-soft)', borderColor: 'var(--glow-border)', color: 'var(--glow-text-muted)' }}>
            Dashboard data partially unavailable. ({error})
          </div>
        )}
      </Card>

      {isPreferencesLoading ? (
        <Card>
          <p className="text-sm animate-pulse" style={{ color: 'var(--glow-text-muted)' }}>Loading your dashboard…</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {widgetOrder.map((widgetId, index) => {
            const widget = widgetsById.get(widgetId);
            if (!widget) return null;
            return (
              <section key={widgetId} className="space-y-1.5 animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--glow-text-muted)' }}>{widget.label}</p>
                  <div className="flex items-center gap-0.5">
                    <Button type="button" variant="ghost" className="h-7 w-7 rounded-full p-0 text-xs" onClick={() => moveWidget(widgetId, 'up')} disabled={index === 0} aria-label={`Move ${widget.label} up`}>
                      <ArrowUp size={12} />
                    </Button>
                    <Button type="button" variant="ghost" className="h-7 w-7 rounded-full p-0 text-xs" onClick={() => moveWidget(widgetId, 'down')} disabled={index === widgetOrder.length - 1} aria-label={`Move ${widget.label} down`}>
                      <ArrowDown size={12} />
                    </Button>
                  </div>
                </div>
                {widget.render()}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
