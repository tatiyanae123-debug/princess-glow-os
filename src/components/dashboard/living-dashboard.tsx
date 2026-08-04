'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, CalendarDays, FolderKanban, ListChecks, Sparkles, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomizableVisual } from '@/components/ui/customizable-visual';
import type { DashboardWidgetId, LivingDashboardData } from '@/lib/dashboard/types';
import { DEFAULT_WIDGET_ORDER } from '@/lib/dashboard/types';
import { useGlow } from '@/lib/context/glow-provider';

const WIDGET_STORAGE_KEY = 'living-dashboard-widget-order-v1';

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
  const { isCustomizing, markChanged, updateVisual, getVisualSrc, getVisualPosition, createObjectUrl } = useGlow();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(WIDGET_STORAGE_KEY);
      if (!raw) { setIsPreferencesLoading(false); return; }
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

  const widgets = useMemo<WidgetDescriptor[]>(
    () => [
      {
        id: 'today-overview',
        label: 'Today overview',
        render: () => (
          <Card>
            <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--glow-accent)' }}>
              <Sparkles size={15} />
              <p className="text-xs font-semibold uppercase tracking-[0.3em]">Today overview</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Tasks due', value: data.todayOverview.tasksDueToday },
                { label: 'Events', value: data.todayOverview.eventsToday },
                { label: 'Routines now', value: data.todayOverview.activeRoutines },
                { label: 'Goals active', value: data.todayOverview.activeGoals },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-4 transition-all duration-200 hover:opacity-90"
                  style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}
                >
                  <p className="text-xs uppercase tracking-[0.2em]" style={{ color: 'var(--glow-text-muted)' }}>
                    {stat.label}
                  </p>
                  <p
                    className="mt-2 text-2xl font-semibold"
                    style={{ fontFamily: 'var(--glow-font-display)', color: 'var(--glow-text)' }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ),
      },
      {
        id: 'daily-focus',
        label: 'Daily focus',
        render: () => (
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--glow-accent)' }}>
              Daily focus
            </p>
            {data.dailyFocus ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2
                    className="text-2xl font-semibold"
                    style={{ fontFamily: 'var(--glow-font-display)', color: 'var(--glow-text)' }}
                  >
                    {data.dailyFocus.title}
                  </h2>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}
                  >
                    {formatPriority(data.dailyFocus.priority)}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7" style={{ color: 'var(--glow-text-muted)' }}>
                  {data.dailyFocus.note}
                </p>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                No focus task yet. Add a task to anchor your day.
              </p>
            )}
          </Card>
        ),
      },
      {
        id: 'top-priority',
        label: 'Top priority',
        render: () => (
          <Card>
            <div className="flex items-center gap-2 mb-3" style={{ color: 'var(--glow-text-muted)' }}>
              <ListChecks size={15} />
              <p className="text-xs font-semibold uppercase tracking-[0.3em]">Top priority</p>
            </div>
            {data.topPriorityTasks.length > 0 ? (
              <div className="space-y-3">
                {data.topPriorityTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl p-4 transition-all duration-200 hover:shadow-sm"
                    style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold" style={{ color: 'var(--glow-text)' }}>{task.title}</p>
                      <span
                        className="rounded-full px-3 py-0.5 text-xs font-medium"
                        style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}
                      >
                        {formatPriority(task.priority)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                      {task.description ?? 'No notes added.'}
                    </p>
                    <p className="mt-2 text-xs" style={{ color: 'var(--glow-text-muted)' }}>
                      Due: {task.dueDate ? task.dueDate.toLocaleDateString('en') : 'No due date'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                No active priorities. Your list is clear.
              </p>
            )}
          </Card>
        ),
      },
      {
        id: 'routine-summary',
        label: 'Routine summary',
        render: () => (
          <Card>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-3" style={{ color: 'var(--glow-accent)' }}>
              Routine summary
            </p>
            {data.routinesForNow.length > 0 ? (
              <div className="space-y-3">
                {data.routinesForNow.map((routine) => (
                  <div
                    key={routine.id}
                    className="rounded-2xl p-4"
                    style={{ background: 'var(--glow-accent-soft)', border: '1px solid var(--glow-border)' }}
                  >
                    <p className="font-semibold" style={{ color: 'var(--glow-text)' }}>{routine.name}</p>
                    <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                      {routine.description ?? 'No details yet.'}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-[0.15em]" style={{ color: 'var(--glow-accent)' }}>
                      {formatPriority(routine.timeOfDay)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                No routines for this time window yet.
              </p>
            )}
          </Card>
        ),
      },
      {
        id: 'schedule-summary',
        label: 'Schedule summary',
        render: () => (
          <Card>
            <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--glow-text-muted)' }}>
              <CalendarDays size={15} />
              <p className="text-xs font-semibold uppercase tracking-[0.3em]">Schedule summary</p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  title: 'Work schedule',
                  items: data.todaySchedule.workSlots.map((s) => `${s.title} · ${formatWorkTime(s.startTime)}–${formatWorkTime(s.endTime)}`),
                  empty: 'No work schedule set for today.',
                },
                {
                  title: 'Calendar events',
                  items: data.todaySchedule.events.map((e) => `${e.title} · ${e.allDay ? 'All day' : formatTime(e.startAt)}`),
                  empty: 'No calendar events scheduled today.',
                },
              ].map((col) => (
                <div
                  key={col.title}
                  className="rounded-2xl p-4"
                  style={{ border: '1px solid var(--glow-border)' }}
                >
                  <p className="text-sm font-semibold mb-2" style={{ color: 'var(--glow-text)' }}>{col.title}</p>
                  {col.items.length > 0 ? (
                    <ul className="space-y-1.5">
                      {col.items.map((item) => (
                        <li key={item} className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>{col.empty}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ),
      },
      {
        id: 'project-status',
        label: 'Project status',
        render: () => (
          <Card>
            <div className="flex items-center gap-2 mb-4" style={{ color: 'var(--glow-accent)' }}>
              <FolderKanban size={15} />
              <p className="text-xs font-semibold uppercase tracking-[0.3em]">Project status</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              {[
                { label: 'Goals in progress', value: data.projectStatus.goalsInProgress },
                { label: 'Goals achieved',    value: data.projectStatus.goalsAchieved },
                { label: 'Average progress',  value: `${data.projectStatus.averageGoalProgress}%` },
                { label: 'Active tasks',      value: data.projectStatus.activeTaskCount },
                { label: 'Completed tasks',   value: data.projectStatus.completedTaskCount },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl p-4"
                  style={{ background: 'var(--glow-surface-muted)', border: '1px solid var(--glow-border)' }}
                >
                  <p className="text-xs" style={{ color: 'var(--glow-text-muted)' }}>{stat.label}</p>
                  <p
                    className="mt-2 text-xl font-semibold"
                    style={{ fontFamily: 'var(--glow-font-display)', color: 'var(--glow-text)' }}
                  >
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data]
  );

  const widgetsById = useMemo(() => new Map(widgets.map((widget) => [widget.id, widget])), [widgets]);

  const heroSrc = getVisualSrc('hero');
  const profileSrc = getVisualSrc('profile');
  const heroPosition = getVisualPosition('hero');
  const profilePosition = getVisualPosition('profile');

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Hero card */}
      <Card className="overflow-hidden !p-0">
        <div className="relative">
          {/* Hero visual */}
          <div className="relative h-40 sm:h-52">
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
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 30%, var(--glow-surface) 100%)' }}
            />
          </div>

          {/* Profile + greeting */}
          <div className="flex flex-col gap-4 p-5 pt-0 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4 -mt-8">
              {/* Profile photo */}
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
                <p
                  className="text-xs font-semibold uppercase tracking-[0.35em]"
                  style={{ color: 'var(--glow-accent)' }}
                >
                  {data.greeting.label}
                </p>
                <h1
                  className="mt-1 text-2xl font-semibold sm:text-3xl"
                  style={{ fontFamily: 'var(--glow-font-display)', color: 'var(--glow-text)' }}
                >
                  {data.greeting.title}
                </h1>
              </div>
            </div>

            {/* Week theme */}
            <div
              className="shrink-0 rounded-2xl px-4 py-3 text-sm max-w-xs"
              style={{
                border: '1px solid var(--glow-border)',
                background: 'var(--glow-accent-soft)',
              }}
            >
              <p className="font-semibold" style={{ color: 'var(--glow-accent)' }}>{data.weekTheme.title}</p>
              <p className="mt-1 text-xs leading-5" style={{ color: 'var(--glow-text-muted)' }}>
                {data.weekTheme.note}
              </p>
            </div>
          </div>

          {/* Greeting message */}
          <div className="px-5 pb-5">
            <p className="max-w-2xl text-sm leading-7" style={{ color: 'var(--glow-text-muted)' }}>
              {data.greeting.message}
            </p>
          </div>
        </div>

        {error && (
          <div
            className="mx-5 mb-5 rounded-2xl border p-3 text-sm"
            style={{
              background: 'var(--glow-accent-soft)',
              borderColor: 'var(--glow-border)',
              color: 'var(--glow-text-muted)',
            }}
          >
            Dashboard data partially unavailable. ({error})
          </div>
        )}
      </Card>

      {/* Widgets */}
      {isPreferencesLoading ? (
        <Card>
          <p className="text-sm animate-pulse" style={{ color: 'var(--glow-text-muted)' }}>
            Loading your dashboard…
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {widgetOrder.map((widgetId, index) => {
            const widget = widgetsById.get(widgetId);
            if (!widget) return null;
            return (
              <section key={widgetId} className="space-y-1.5 animate-fade-in" style={{ animationDelay: `${index * 40}ms` }}>
                <div className="flex items-center justify-between px-1">
                  <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: 'var(--glow-text-muted)' }}>
                    {widget.label}
                  </p>
                  <div className="flex items-center gap-0.5">
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 w-7 rounded-full p-0 text-xs"
                      onClick={() => moveWidget(widgetId, 'up')}
                      disabled={index === 0}
                      aria-label={`Move ${widget.label} up`}
                    >
                      <ArrowUp size={12} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-7 w-7 rounded-full p-0 text-xs"
                      onClick={() => moveWidget(widgetId, 'down')}
                      disabled={index === widgetOrder.length - 1}
                      aria-label={`Move ${widget.label} down`}
                    >
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
