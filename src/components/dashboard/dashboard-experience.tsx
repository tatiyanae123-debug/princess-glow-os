'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CheckSquare, EyeOff, Pin, PinOff, Sparkles, WandSparkles } from 'lucide-react';
import { AiAssistantPanel } from '@/components/ui/ai-assistant';
import { Button } from '@/components/ui/button';
import { CalendarCard } from '@/components/ui/calendar-card';
import { Card } from '@/components/ui/card';
import { HabitCard } from '@/components/ui/habit-card';
import { ProgressRing } from '@/components/ui/progress-ring';
import { QuickActionCard } from '@/components/ui/quick-action-card';
import { TaskCard } from '@/components/ui/task-card';
import {
  buildDashboardMessage,
  dashboardEvents,
  dashboardHabits,
  dashboardObservations,
  dashboardProject,
  dashboardQuickActions,
  dashboardTasks,
  getRecommendedWidgetOrder,
  type DashboardMessage,
  type DashboardWidgetId,
} from '@/lib/dashboard';
import { featureFlags } from '@/lib/feature-flags';
import { cn } from '@/lib/utils';

type WidgetPreference = {
  id: DashboardWidgetId;
  hidden: boolean;
  pinned: boolean;
};

type WidgetDefinition = {
  id: DashboardWidgetId;
  title: string;
  description: string;
  render: () => React.ReactNode;
};

const STORAGE_KEY = 'dashboard-widget-preferences';
const DEFAULT_DATE = new Date('2026-01-01T09:00:00');

function buildDefaultPreferences(): WidgetPreference[] {
  return getRecommendedWidgetOrder(DEFAULT_DATE).map((id) => ({ id, hidden: false, pinned: false }));
}

function sortPreferences(preferences: WidgetPreference[]) {
  return [...preferences].sort((left, right) => {
    if (left.pinned !== right.pinned) {
      return left.pinned ? -1 : 1;
    }

    return 0;
  });
}

export function DashboardExperience() {
  const [preferences, setPreferences] = useState<WidgetPreference[]>(() => buildDefaultPreferences());
  const [message, setMessage] = useState<DashboardMessage>(() => buildDashboardMessage(DEFAULT_DATE));

  useEffect(() => {
    setMessage(buildDashboardMessage(new Date()));

    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as WidgetPreference[];
      const defaultIds = new Set(getRecommendedWidgetOrder(DEFAULT_DATE));
      const normalized = parsed.filter((item) => defaultIds.has(item.id));

      if (normalized.length === defaultIds.size) {
        setPreferences(normalized);
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  function moveWidget(id: DashboardWidgetId, direction: 'up' | 'down') {
    setPreferences((current) => {
      const next = [...current];
      const index = next.findIndex((item) => item.id === id);

      if (index < 0) {
        return current;
      }

      const swapIndex = direction === 'up' ? index - 1 : index + 1;

      if (swapIndex < 0 || swapIndex >= next.length) {
        return current;
      }

      [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
      return next;
    });
  }

  function toggleHidden(id: DashboardWidgetId) {
    setPreferences((current) => current.map((item) => (item.id === id ? { ...item, hidden: !item.hidden } : item)));
  }

  function togglePinned(id: DashboardWidgetId) {
    setPreferences((current) => current.map((item) => (item.id === id ? { ...item, pinned: !item.pinned } : item)));
  }

  function resetLayout() {
    setPreferences(buildDefaultPreferences());
  }

  const widgetMap: Record<DashboardWidgetId, WidgetDefinition> = {
    focus: {
      id: 'focus',
      title: 'Daily focus',
      description: message.focusNote,
      render: () => (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-400">{message.focusLabel}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Complete your highest-value work first.</h2>
            </div>
            <div className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">Focus block</div>
          </div>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{message.focusNote}</p>
        </Card>
      ),
    },
    tasks: {
      id: 'tasks',
      title: 'Tasks',
      description: 'Three priorities with clear timing.',
      render: () => (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Today’s tasks</p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{dashboardTasks.length} priorities</p>
            </div>
            <div className="rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <CheckSquare size={16} />
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {dashboardTasks.map((task) => (
              <TaskCard key={task.title} {...task} />
            ))}
          </div>
        </Card>
      ),
    },
    habits: {
      id: 'habits',
      title: 'Habits',
      description: 'Daily rituals with visible progress.',
      render: () => (
        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Habit progress</p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Steady and calm</p>
            </div>
            <ProgressRing value={82} label="Momentum" />
          </div>
          <div className="mt-4 grid gap-3 xl:grid-cols-3">
            {dashboardHabits.map((habit) => (
              <HabitCard key={habit.name} {...habit} />
            ))}
          </div>
        </Card>
      ),
    },
    schedule: {
      id: 'schedule',
      title: 'Schedule',
      description: 'The next commitments for the day.',
      render: () => (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Upcoming events</p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Keep the day paced</p>
            </div>
            <Button variant="ghost" className="gap-2 px-2 py-1">
              View all
            </Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {dashboardEvents.map((event) => (
              <CalendarCard key={event.title} {...event} />
            ))}
          </div>
        </Card>
      ),
    },
    project: {
      id: 'project',
      title: 'Project status',
      description: 'A lightweight project manager foundation.',
      render: () => (
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-500">Project status</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{dashboardProject.name}</h2>
            </div>
            <div className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{dashboardProject.status}</div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Progress</p>
              <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{dashboardProject.progress}%</p>
            </div>
            <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Next action</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{dashboardProject.nextAction}</p>
            </div>
            <div className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">Milestone</p>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{dashboardProject.milestone}</p>
            </div>
          </div>
        </Card>
      ),
    },
    observations: {
      id: 'observations',
      title: 'Observations',
      description: 'Helpful observations, not alarms.',
      render: () => (
        <Card className="space-y-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-500">Helpful observations</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Gentle context from today’s structured data</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-3">
            {dashboardObservations.map((observation) => (
              <div key={observation.title} className="rounded-[20px] border border-slate-200/70 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                <p className="font-medium text-slate-900 dark:text-slate-100">{observation.title}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{observation.detail}</p>
              </div>
            ))}
          </div>
        </Card>
      ),
    },
    actions: {
      id: 'actions',
      title: 'Actions',
      description: 'Reusable quick actions for later integrations.',
      render: () => (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Quick actions</p>
              <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Keep momentum light</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {dashboardQuickActions.map((action) => (
              <QuickActionCard key={action.title} {...action} />
            ))}
          </div>
        </Card>
      ),
    },
  };

  const orderedPreferences = useMemo(() => sortPreferences(preferences), [preferences]);
  const visiblePreferences = orderedPreferences.filter((item) => !item.hidden);
  const hiddenPreferences = orderedPreferences.filter((item) => item.hidden);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <Card className="relative overflow-hidden bg-[linear-gradient(135deg,_rgba(255,245,247,1),_rgba(255,255,255,0.95))] dark:bg-[linear-gradient(135deg,_rgba(15,23,42,1),_rgba(30,41,59,0.95))]">
          <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-br from-rose-200/40 to-transparent dark:from-rose-500/20" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-500">{message.eyebrow}</p>
                <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">{message.title}</h1>
              </div>
              <div className="rounded-full bg-white/70 p-3 text-rose-500 shadow-sm dark:bg-slate-800/80">
                <Sparkles size={20} />
              </div>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">{message.description}</p>
            <div className="flex flex-wrap gap-3">
              <Button>Review today</Button>
              <Button variant="secondary">Start ritual</Button>
            </div>
          </div>
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Dashboard mode</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">Living dashboard</p>
            </div>
            <div className="rounded-full bg-amber-50 p-3 text-amber-500 dark:bg-amber-500/10">
              <WandSparkles size={20} />
            </div>
          </div>
          <div className="rounded-[20px] bg-slate-50 p-4 dark:bg-slate-800/80">
            <p className="text-sm text-slate-500 dark:text-slate-400">Deterministic widget ordering and contextual messaging are active. Nothing here claims a live AI or private-account integration yet.</p>
          </div>
          {featureFlags.widgetCustomization ? (
            <div className="space-y-3 rounded-[20px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Layout controls</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Pin, hide, and reorder widgets. Preferences stay on this device.</p>
                </div>
                <Button variant="ghost" onClick={resetLayout}>Reset</Button>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                {orderedPreferences.map((item) => (
                  <span key={item.id} className="rounded-full bg-slate-100 px-3 py-1 capitalize dark:bg-slate-800">{item.id}</span>
                ))}
              </div>
            </div>
          ) : null}
        </Card>
      </section>

      <AiAssistantPanel />

      <section className="grid gap-4">
        {visiblePreferences.map((preference) => {
          const widget = widgetMap[preference.id];

          return (
            <div key={widget.id} className="space-y-2">
              {featureFlags.widgetCustomization ? (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-slate-200/70 bg-white/70 px-4 py-3 text-sm shadow-[0_12px_24px_rgba(15,23,42,0.04)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/70">
                  <div>
                    <p className="font-semibold text-slate-900 capitalize dark:text-slate-100">{widget.title}</p>
                    <p className="text-slate-500 dark:text-slate-400">{widget.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" onClick={() => moveWidget(widget.id, 'up')} disabled={preferences.findIndex((item) => item.id === widget.id) === 0} aria-label={`Move ${widget.title} up`}>
                      <ArrowUp size={16} />
                    </Button>
                    <Button variant="ghost" onClick={() => moveWidget(widget.id, 'down')} disabled={preferences.findIndex((item) => item.id === widget.id) === preferences.length - 1} aria-label={`Move ${widget.title} down`}>
                      <ArrowDown size={16} />
                    </Button>
                    <Button variant="ghost" onClick={() => togglePinned(widget.id)} className={cn(preference.pinned ? 'text-rose-500 dark:text-rose-300' : undefined)}>
                      {preference.pinned ? <Pin size={16} /> : <PinOff size={16} />}
                    </Button>
                    <Button variant="ghost" onClick={() => toggleHidden(widget.id)}>
                      <EyeOff size={16} />
                    </Button>
                  </div>
                </div>
              ) : null}
              {widget.render()}
            </div>
          );
        })}
      </section>

      {featureFlags.widgetCustomization && hiddenPreferences.length > 0 ? (
        <Card className="space-y-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Hidden widgets</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Restore any widget you want back on the dashboard.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {hiddenPreferences.map((preference) => (
              <Button key={preference.id} variant="secondary" onClick={() => toggleHidden(preference.id)} className="capitalize">
                Show {preference.id}
              </Button>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
