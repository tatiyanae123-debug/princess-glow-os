'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, FolderKanban, ListChecks, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { DashboardWidgetId, LivingDashboardData } from '@/lib/dashboard/types';
import { DEFAULT_WIDGET_ORDER } from '@/lib/dashboard/types';
import type { AccentColor, WidgetSize } from '@/lib/visual/types';
import { useCustomization } from './customization-context';

const WIDGET_STORAGE_KEY = 'living-dashboard-widget-order-v1';

// ── Widget visual helpers ─────────────────────────────────────────────────────

const ACCENT_BORDER: Record<AccentColor, string> = {
  default: '',
  rose: 'border-l-4 border-rose-400 pl-3',
  violet: 'border-l-4 border-violet-400 pl-3',
  sky: 'border-l-4 border-sky-400 pl-3',
  emerald: 'border-l-4 border-emerald-400 pl-3',
  amber: 'border-l-4 border-amber-400 pl-3',
};

const SIZE_CLASS: Record<WidgetSize, string> = {
  compact: 'text-sm [&_h2]:text-xl [&_.text-2xl]:text-lg [&_.text-xl]:text-base',
  default: '',
  expanded: 'shadow-lg ring-1 ring-slate-200/70 dark:ring-slate-700/70',
};

type WidgetDescriptor = {
  id: DashboardWidgetId;
  label: string;
  render: () => React.ReactNode;
};

function formatPriority(priority: string) {
  return priority.replace('_', ' ').replace(/^\w/, (char) => char.toUpperCase());
}

function formatTime(date: Date | null) {
  if (!date) return 'No time set';
  return date.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' });
}

function formatWorkTime(timeValue: string) {
  return timeValue.slice(0, 5);
}

function isValidWidgetOrder(value: unknown): value is DashboardWidgetId[] {
  if (!Array.isArray(value) || value.length !== DEFAULT_WIDGET_ORDER.length) return false;
  const valueSet = new Set(value);
  if (valueSet.size !== DEFAULT_WIDGET_ORDER.length) return false;
  return DEFAULT_WIDGET_ORDER.every((widgetId) => valueSet.has(widgetId));
}

export function LivingDashboard({ data, error }: { data: LivingDashboardData; error?: string }) {
  const [widgetOrder, setWidgetOrder] = useState<DashboardWidgetId[]>(DEFAULT_WIDGET_ORDER);
  const [isPreferencesLoading, setIsPreferencesLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WIDGET_STORAGE_KEY);
      if (!raw) {
        setIsPreferencesLoading(false);
        return;
      }
      const parsed = JSON.parse(raw);
      if (isValidWidgetOrder(parsed)) {
        setWidgetOrder(parsed);
      }
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

  const widgets = useMemo<WidgetDescriptor[]>(
    () => [
      {
        id: 'today-overview',
        label: 'Today overview',
        render: () => (
          <Card className="space-y-4">
            <div className="flex items-center gap-2 text-rose-500">
              <Sparkles size={16} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em]">Today overview</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Tasks due</p>
                <p className="mt-2 text-2xl font-semibold">{data.todayOverview.tasksDueToday}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Events</p>
                <p className="mt-2 text-2xl font-semibold">{data.todayOverview.eventsToday}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Routines now</p>
                <p className="mt-2 text-2xl font-semibold">{data.todayOverview.activeRoutines}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Goals active</p>
                <p className="mt-2 text-2xl font-semibold">{data.todayOverview.activeGoals}</p>
              </div>
            </div>
          </Card>
        ),
      },
      {
        id: 'daily-focus',
        label: 'Daily focus',
        render: () => (
          <Card className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">Daily focus</p>
            {data.dailyFocus ? (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{data.dailyFocus.title}</h2>
                  <span className="rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-700 dark:bg-rose-500/20 dark:text-rose-200">
                    {formatPriority(data.dailyFocus.priority)}
                  </span>
                </div>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{data.dailyFocus.note}</p>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No focus task yet. Add a task to anchor your day.</p>
            )}
          </Card>
        ),
      },
      {
        id: 'top-priority',
        label: 'Top priority',
        render: () => (
          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <ListChecks size={16} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em]">Top priority</p>
            </div>
            {data.topPriorityTasks.length > 0 ? (
              <div className="space-y-3">
                {data.topPriorityTasks.map((task) => (
                  <div key={task.id} className="rounded-2xl border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900 dark:text-slate-100">{task.title}</p>
                      <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-700 dark:text-slate-100">
                        {formatPriority(task.priority)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{task.description ?? 'No notes added.'}</p>
                    <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Due: {task.dueDate ? task.dueDate.toLocaleDateString('en') : 'No due date'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No active priorities. Your list is clear.</p>
            )}
          </Card>
        ),
      },
      {
        id: 'routine-summary',
        label: 'Routine summary',
        render: () => (
          <Card className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-600">Routine summary</p>
            {data.routinesForNow.length > 0 ? (
              <div className="space-y-3">
                {data.routinesForNow.map((routine) => (
                  <div key={routine.id} className="rounded-2xl bg-emerald-50/70 p-4 dark:bg-emerald-500/10">
                    <p className="font-semibold text-slate-900 dark:text-slate-100">{routine.name}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{routine.description ?? 'No details yet.'}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">{formatPriority(routine.timeOfDay)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">No routines for this time window yet.</p>
            )}
          </Card>
        ),
      },
      {
        id: 'schedule-summary',
        label: 'Schedule summary',
        render: () => (
          <Card className="space-y-4">
            <div className="flex items-center gap-2 text-sky-600">
              <CalendarDays size={16} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em]">Schedule summary</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Work schedule</p>
                {data.todaySchedule.workSlots.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {data.todaySchedule.workSlots.map((slot) => (
                      <li key={slot.id}>
                        {slot.title} · {formatWorkTime(slot.startTime)}–{formatWorkTime(slot.endTime)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No work schedule set for today.</p>
                )}
              </div>
              <div className="rounded-2xl border border-slate-200/70 p-4 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Calendar events</p>
                {data.todaySchedule.events.length > 0 ? (
                  <ul className="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    {data.todaySchedule.events.map((event) => (
                      <li key={event.id}>
                        {event.title} · {event.allDay ? 'All day' : formatTime(event.startAt)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">No calendar events scheduled today.</p>
                )}
              </div>
            </div>
          </Card>
        ),
      },
      {
        id: 'project-status',
        label: 'Project status',
        render: () => (
          <Card className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600">
              <FolderKanban size={16} />
              <p className="text-sm font-semibold uppercase tracking-[0.3em]">Project status</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">Goals in progress</p>
                <p className="mt-2 text-xl font-semibold">{data.projectStatus.goalsInProgress}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">Goals achieved</p>
                <p className="mt-2 text-xl font-semibold">{data.projectStatus.goalsAchieved}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">Average progress</p>
                <p className="mt-2 text-xl font-semibold">{data.projectStatus.averageGoalProgress}%</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">Active tasks</p>
                <p className="mt-2 text-xl font-semibold">{data.projectStatus.activeTaskCount}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70">
                <p className="text-xs text-slate-500 dark:text-slate-400">Completed tasks</p>
                <p className="mt-2 text-xl font-semibold">{data.projectStatus.completedTaskCount}</p>
              </div>
            </div>
          </Card>
        ),
      },
    ],
    [data],
  );

  const widgetsById = useMemo(() => new Map(widgets.map((widget) => [widget.id, widget])), [widgets]);

  // Visual customisation from context (optional — falls back gracefully if not provided)
  const customCtx = useCustomization();
  const visualWidgetPrefs = customCtx?.prefs.widgets;

  return (
    <div className="space-y-6">
      <Card className="space-y-4 bg-[linear-gradient(135deg,_rgba(255,245,247,1),_rgba(255,255,255,0.95))] dark:bg-[linear-gradient(135deg,_rgba(15,23,42,1),_rgba(30,41,59,0.95))]">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-500">{data.greeting.label}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">{data.greeting.title}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">{data.greeting.message}</p>
          </div>
          <div className="rounded-2xl border border-rose-200/80 bg-white/70 px-4 py-3 text-sm dark:border-rose-500/40 dark:bg-slate-900/60">
            <p className="font-semibold text-rose-700 dark:text-rose-300">{data.weekTheme.title}</p>
            <p className="mt-1 text-slate-600 dark:text-slate-300">{data.weekTheme.note}</p>
          </div>
        </div>
        {error ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            We could not fully load live dashboard data. Showing fallback-friendly results. ({error})
          </div>
        ) : null}
      </Card>

      {isPreferencesLoading ? (
        <Card>
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading your dashboard preferences…</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {widgetOrder.map((widgetId, index) => {
            const widget = widgetsById.get(widgetId);
            if (!widget) return null;

            // Apply visual preferences if available
            const vPref = visualWidgetPrefs?.[widgetId];
            const isVisible = vPref?.visible !== false;
            if (!isVisible) return null;

            const accentBorder = ACCENT_BORDER[vPref?.accentColor ?? 'default'];
            const sizeClass = SIZE_CLASS[vPref?.size ?? 'default'];

            return (
              <section key={widgetId} className={cn('space-y-2 rounded-xl transition-all', accentBorder, sizeClass)}>
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{widget.label}</p>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => moveWidget(widgetId, 'up')}
                      disabled={index === 0}
                      aria-label={`Move ${widget.label} up`}
                    >
                      <ArrowUp size={14} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 w-8 rounded-full p-0"
                      onClick={() => moveWidget(widgetId, 'down')}
                      disabled={index === widgetOrder.length - 1}
                      aria-label={`Move ${widget.label} down`}
                    >
                      <ArrowDown size={14} />
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
