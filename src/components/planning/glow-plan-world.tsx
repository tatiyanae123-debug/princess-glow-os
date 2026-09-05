'use client';

import { ArrowRight, CalendarDays, CheckCircle2, Sparkles, Target } from 'lucide-react';
import { useMemo, useState } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import styles from './glow-plan-world.module.css';

type PlanView = 'day' | 'week' | 'quarter' | 'year';

const views: Array<{ id: PlanView; label: string }> = [
  { id: 'day', label: 'Day' },
  { id: 'week', label: 'Week' },
  { id: 'quarter', label: 'Quarter' },
  { id: 'year', label: 'Year' },
];

function timeLabel(value: string) {
  return new Date(value).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className={styles.emptyState}>
      <strong>{title}</strong>
      <span>{detail}</span>
    </div>
  );
}

export function GlowPlanWorld() {
  const personal = usePersonalContext();
  const [view, setView] = useState<PlanView>('week');
  const [askOpen, setAskOpen] = useState(false);

  const data = personal.status === 'ready' ? personal.data : null;

  const content = useMemo(() => {
    if (!data) return null;

    if (view === 'day') {
      return {
        eyebrow: 'Your actual day',
        title: 'Day',
        detail: 'Only today’s connected commitments and open Glow work appear here.',
        events: data.todayEvents,
        tasks: data.tasks.slice(0, 8),
        goals: [],
      };
    }

    if (view === 'week') {
      return {
        eyebrow: 'Your near-term direction',
        title: 'Week',
        detail: 'Upcoming connected schedule, open work, and routines without a fake sample plan.',
        events: data.events.slice(0, 10),
        tasks: data.tasks.slice(0, 8),
        goals: data.goals.slice(0, 4),
      };
    }

    if (view === 'quarter') {
      return {
        eyebrow: 'Your active direction',
        title: 'Quarter',
        detail: 'Your real goals and planning context, with no generic vision-board placeholders.',
        events: [],
        tasks: data.tasks.filter((task) => task.priority === 'high').slice(0, 6),
        goals: data.goals.slice(0, 8),
      };
    }

    return {
      eyebrow: 'Your longer horizon',
      title: 'Year',
      detail: 'Long-range goals that are actually saved to your Glow account.',
      events: [],
      tasks: [],
      goals: data.goals,
    };
  }, [data, view]);

  return (
    <main className={styles.world}>
      <div className={styles.causticA} aria-hidden="true" />
      <div className={styles.causticB} aria-hidden="true" />
      <div className={styles.pearl} aria-hidden="true"><i /><b /></div>

      <nav className={styles.topNav} aria-label="Glow OS primary navigation">
        <a href="/home" className={styles.homeLink}>Glow OS</a>
        <span className={styles.regionName}>PLAN</span>
        <div className={styles.navActions}>
          <a href="/today?room=what-now">Today</a>
          <button type="button" onClick={() => setAskOpen((value) => !value)} aria-expanded={askOpen}>Ask Glow</button>
        </div>
      </nav>

      <section className={styles.frame}>
        <header className={styles.hero}>
          <span>Plan · connected to your real Glow data</span>
          <h1>See where your life is going.</h1>
          <p>Plan is a living horizon, not the old Life OS dashboard. It organizes what is actually on your account across day, week, quarter, and year.</p>
        </header>

        <div className={styles.viewRail} role="tablist" aria-label="Plan horizon">
          {views.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={view === item.id}
              onClick={() => setView(item.id)}
              className={view === item.id ? styles.activeView : ''}
            >
              {item.label}
            </button>
          ))}
        </div>

        {personal.status === 'loading' ? (
          <EmptyState title="Reading your plan…" detail="Glow is loading your connected tasks, calendar, routines, and goals. No sample schedule is inserted while it waits." />
        ) : null}

        {personal.status === 'error' ? (
          <EmptyState title="Your plan is not connected here yet" detail="Sign in to the Glow account you want this Plan world to represent. Glow will not fill the page with made-up information." />
        ) : null}

        {content ? (
          <section className={styles.planSurface}>
            <div className={styles.surfaceIntro}>
              <span>{content.eyebrow}</span>
              <h2>{content.title}</h2>
              <p>{content.detail}</p>
            </div>

            <div className={styles.contentGrid}>
              <section className={styles.column}>
                <div className={styles.columnHead}><CalendarDays size={16} /><span>Time</span></div>
                <div className={styles.stack}>
                  {content.events.map((event) => (
                    <a key={`${event.source}-${event.id}`} href={event.htmlLink || '/calendar'} className={styles.item} target={event.htmlLink ? '_blank' : undefined} rel={event.htmlLink ? 'noreferrer' : undefined}>
                      <span className={styles.itemMeta}>{timeLabel(event.startAt)}</span>
                      <strong>{event.title}</strong>
                      {event.location ? <small>{event.location}</small> : null}
                      <ArrowRight size={15} />
                    </a>
                  ))}
                  {content.events.length === 0 ? <EmptyState title="No connected time blocks here" detail="Glow did not find real calendar items for this horizon." /> : null}
                </div>
              </section>

              <section className={styles.column}>
                <div className={styles.columnHead}><CheckCircle2 size={16} /><span>Work</span></div>
                <div className={styles.stack}>
                  {content.tasks.map((task) => (
                    <a key={task.id} href="/tasks" className={styles.item}>
                      <span className={styles.itemMeta}>{task.priority} priority · {task.status === 'in_progress' ? 'in progress' : 'open'}</span>
                      <strong>{task.title}</strong>
                      {task.dueDate ? <small>Due {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small> : null}
                      <ArrowRight size={15} />
                    </a>
                  ))}
                  {content.tasks.length === 0 ? <EmptyState title="No open work here" detail="There are no matching Glow tasks for this horizon." /> : null}
                </div>
              </section>

              <section className={styles.column}>
                <div className={styles.columnHead}><Target size={16} /><span>Direction</span></div>
                <div className={styles.stack}>
                  {content.goals.map((goal) => (
                    <a key={goal.id} href="/goals" className={styles.item}>
                      <span className={styles.itemMeta}>{goal.category} · {Math.round(goal.progress)}%</span>
                      <strong>{goal.title}</strong>
                      {goal.targetDate ? <small>Target {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</small> : null}
                      <ArrowRight size={15} />
                    </a>
                  ))}
                  {content.goals.length === 0 ? <EmptyState title="No saved goals here" detail="Glow is leaving this space empty instead of inventing a direction for you." /> : null}
                </div>
              </section>
            </div>
          </section>
        ) : null}
      </section>

      {askOpen ? (
        <aside className={styles.askPanel} role="dialog" aria-label="Ask Glow">
          <div>
            <span className={styles.miniPearl} aria-hidden="true" />
            <div><strong>Glow</strong><small>Plan with your connected context.</small></div>
            <button type="button" onClick={() => setAskOpen(false)} aria-label="Close Ask Glow">×</button>
          </div>
          <p>Ask Glow to help you think through your day, week, quarter, or year. It will not invent personal events or goals that are not in your account.</p>
          <a href="/today?room=replan"><Sparkles size={14} /> Replan today</a>
          <a href="/today?room=tomorrow">See tomorrow</a>
        </aside>
      ) : null}
    </main>
  );
}
