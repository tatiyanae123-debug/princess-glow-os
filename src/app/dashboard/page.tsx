import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ProgressRing } from '@/components/ui/progress-ring';
import { TaskCard } from '@/components/ui/task-card';
import { HabitCard } from '@/components/ui/habit-card';
import { CalendarCard } from '@/components/ui/calendar-card';
import { QuickActionCard } from '@/components/ui/quick-action-card';
import { dashboardTasks, habits, quickActions } from '@/lib/navigation';
import { Droplets, CloudSun, Sparkles, ArrowRight, Plus, CheckSquare } from 'lucide-react';

const upcomingEvents = [
  { title: 'Dermatology consult', time: '14:00', location: 'West Avenue Clinic' },
  { title: 'Dinner with friends', time: '19:30', location: 'Golden Hour' },
  { title: 'Creative block', time: '21:00', location: 'Studio desk' },
];

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <section className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
          <Card className="relative overflow-hidden bg-[linear-gradient(135deg,_rgba(255,245,247,1),_rgba(255,255,255,0.95))] dark:bg-[linear-gradient(135deg,_rgba(15,23,42,1),_rgba(30,41,59,0.95))]">
            <div className="absolute inset-y-0 right-0 w-28 bg-gradient-to-br from-rose-200/40 to-transparent dark:from-rose-500/20" />
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-500">Good morning</p>
                  <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100 sm:text-4xl">Princess, your day is ready.</h1>
                </div>
                <div className="rounded-full bg-white/70 p-3 text-rose-500 shadow-sm dark:bg-slate-800/80">
                  <Sparkles size={20} />
                </div>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                You have a calm, intentional rhythm ahead. The plan below keeps the important things visible while leaving space to breathe.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button>Review today</Button>
                <Button variant="secondary">Start ritual</Button>
              </div>
            </div>
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Weather</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">24°C</p>
              </div>
              <div className="rounded-full bg-amber-50 p-3 text-amber-500 dark:bg-amber-500/10">
                <CloudSun size={20} />
              </div>
            </div>
            <div className="rounded-[20px] bg-slate-50 p-4 dark:bg-slate-800/80">
              <p className="text-sm text-slate-500 dark:text-slate-400">Gentle breeze, sunny afternoon, perfect for a walk.</p>
            </div>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <Card className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-400">Daily focus</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">Complete your highest-value work first.</h2>
                </div>
                <div className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">09:30 slot</div>
              </div>
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">Your strongest creative focus is available before lunch. Protect that window for the most important work and let everything else become lighter.</p>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Today’s tasks</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">3 priorities</p>
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

              <Card>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Habit progress</p>
                    <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Steady and calm</p>
                  </div>
                  <ProgressRing value={82} label="Momentum" />
                </div>
                <div className="mt-4 space-y-3">
                  {habits.map((habit) => (
                    <HabitCard key={habit.name} {...habit} />
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="space-y-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Water tracker</p>
                  <p className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">6 glasses</p>
                </div>
                <div className="rounded-full bg-cyan-50 p-3 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-300">
                  <Droplets size={18} />
                </div>
              </div>
              <div className="mt-4 flex items-end gap-2">
                {[30, 60, 90, 100, 70, 50].map((height, index) => (
                  <div key={index} className="flex-1 rounded-t-full bg-gradient-to-t from-cyan-400 to-sky-200" style={{ height: `${height}px` }} />
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Upcoming events</p>
                </div>
                <Button variant="ghost" className="gap-2 px-2 py-1">
                  <Plus size={14} /> Add
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {upcomingEvents.map((event) => (
                  <CalendarCard key={event.title} {...event} />
                ))}
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Quick actions</p>
                </div>
                <Button variant="ghost" className="gap-2 px-2 py-1">
                  <ArrowRight size={14} /> View all
                </Button>
              </div>
              <div className="mt-4 space-y-3">
                {quickActions.map((action) => (
                  <QuickActionCard key={action.title} {...action} />
                ))}
              </div>
            </Card>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
