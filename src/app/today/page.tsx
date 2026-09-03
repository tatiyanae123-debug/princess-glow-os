import { auth } from '@/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { CSSProperties } from 'react';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getTasksByUser } from '@/lib/data/tasks';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import styles from './today-home.module.css';

export const dynamic = 'force-dynamic';

const priorityWeight: Record<string, number> = { urgent: 100, high: 80, medium: 55, low: 30 };

type NavWorld = { label: 'Today' | 'Plan' | 'Life' | 'Brain' | 'Create'; href: string; active?: boolean };

const worlds: NavWorld[] = [
  { label: 'Today', href: '/today', active: true },
  { label: 'Plan', href: '/planning' },
  { label: 'Life', href: '/world' },
  { label: 'Brain', href: '/brain' },
  { label: 'Create', href: '/intake' },
];

function greetingLabel(date: Date) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Good night';
}

function sentenceForContext(priorityCount: number, hasEvent: boolean) {
  if (priorityCount > 0 && hasEvent) return 'Your priorities and next commitment are aligned for today.';
  if (priorityCount > 0) return 'Your highest-priority moves are ready whenever you begin.';
  if (hasEvent) return 'Your calendar is guiding the day; keep your transitions gentle and clear.';
  return 'The room is clear — choose one meaningful action and begin with calm focus.';
}

function inscription(value: string, max = 42) {
  const normalized = value.trim().replace(/\s+/g, ' ');
  if (normalized.length <= max) return normalized;
  const sliced = normalized.slice(0, max - 1);
  const cut = sliced.lastIndexOf(' ');
  return `${(cut > 12 ? sliced.slice(0, cut) : sliced).trim()}…`;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function formatDuration(startAt: Date, endAt: Date | null) {
  if (!endAt) return null;
  const minutes = Math.max(1, Math.round((endAt.getTime() - startAt.getTime()) / 60_000));
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function capacityNarrative(percent: number | null) {
  if (percent === null) return 'No capacity check-in yet.';
  if (percent >= 80) return 'High capacity — protect deep work windows.';
  if (percent >= 55) return 'Steady capacity — focus one priority at a time.';
  if (percent >= 35) return 'Moderate capacity — choose lighter, clear wins.';
  return 'Low capacity — protect essentials and recovery.';
}

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const userId = session.user.id;
  const firstName = session.user.name?.trim().split(/\s+/)[0] || 'Tatiyana';
  const now = new Date();

  const [tasks, events, wellnessEntries] = await Promise.all([
    getTasksByUser(userId),
    getCalendarEventsByUser(userId),
    getWellnessEntriesByUser(userId),
  ]);

  const openTasks = tasks.filter((task) => task.status !== 'done' && task.status !== 'cancelled');
  const rankedTasks = [...openTasks].sort((a, b) => {
    const aDue = a.dueDate ? Math.max(-40, 30 - Math.floor((a.dueDate.getTime() - now.getTime()) / 86_400_000) * 5) : 0;
    const bDue = b.dueDate ? Math.max(-40, 30 - Math.floor((b.dueDate.getTime() - now.getTime()) / 86_400_000) * 5) : 0;
    return (priorityWeight[b.priority] ?? 0) + bDue - ((priorityWeight[a.priority] ?? 0) + aDue);
  });

  const priorities = rankedTasks.slice(0, 3);
  const nextEvent = [...events]
    .filter((event) => event.endAt ? event.endAt.getTime() >= now.getTime() : event.startAt.getTime() >= now.getTime())
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime())[0] ?? null;

  const energy = wellnessEntries[0]?.energy ?? null;
  const capacityPercent = typeof energy === 'number' ? Math.max(0, Math.min(100, energy * 10)) : null;
  const primaryHref = priorities[0] ? '/tasks' : nextEvent ? '/calendar' : '/brain';

  return (
    <div className={styles.todayHome}>
      <div className={styles.room}>
        <section className={styles.greetingWall} aria-label="Greeting wall">
          <div className={styles.wallRim}>
            <div className={styles.wallChamber}>
              <h1>
                {greetingLabel(now)}, <span>{firstName}.</span>
              </h1>
              <p>{sentenceForContext(priorities.length, Boolean(nextEvent))}</p>
            </div>
          </div>
        </section>

        <section className={styles.priorityMonument} aria-label="Today's priorities">
          <div className={styles.monumentRim}>
            <div className={styles.monumentChamber}>
              <p className={styles.kicker}>TODAY&apos;S PRIORITIES</p>
              <ol>
                {priorities.length
                  ? priorities.map((task, index) => (
                    <li key={task.id} title={task.title}>
                      <span>{index + 1}.</span>
                      <Link href="/tasks">{inscription(task.title)}</Link>
                    </li>
                  ))
                  : <li><span>1.</span><Link href="/tasks">No active priorities yet — choose your first.</Link></li>}
              </ol>
            </div>
          </div>
        </section>

        <section className={styles.eventPortal} aria-label="Next event portal">
          <div className={styles.portalRim}>
            <div className={styles.portalWindow} aria-hidden="true" />
            <div className={styles.portalPlaque}>
              <p className={styles.kicker}>NEXT EVENT</p>
              {nextEvent ? (
                <>
                  <p className={styles.eventTitle} title={nextEvent.title}>{inscription(nextEvent.title, 34)}</p>
                  <p className={styles.eventMeta}>
                    {nextEvent.allDay ? 'All day' : formatTime(nextEvent.startAt)}
                    {nextEvent.allDay ? '' : nextEvent.endAt ? ` · ${formatDuration(nextEvent.startAt, nextEvent.endAt)}` : ''}
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.eventTitle}>No upcoming event</p>
                  <p className={styles.eventMeta}>Your schedule is currently open.</p>
                </>
              )}
            </div>
          </div>
        </section>

        <section className={styles.capacityBasin} aria-label="Current capacity basin">
          <div
            className={styles.basinOrb}
            style={capacityPercent !== null ? ({ '--capacity': `${capacityPercent}%` } as CSSProperties) : undefined}
          />
          <div className={styles.basinRim}>
            <div className={styles.basinChamber}>
              <p className={styles.kicker}>CURRENT CAPACITY</p>
              <p className={styles.capacityValue}>{capacityPercent === null ? 'Not logged' : `${capacityPercent}%`}</p>
              <p className={styles.capacityMeta}>{capacityNarrative(capacityPercent)}</p>
              <Link href="/wellness" className={styles.capacityLink}>View capacity factors</Link>
            </div>
          </div>
        </section>

        <div className={styles.thresholds}>
          <Link href={primaryHref} className={styles.primaryThreshold}>What should I do now?</Link>
          <Link href="/brain" className={styles.secondaryThreshold}>Ask Glow</Link>
        </div>

        <nav className={styles.fiveWorldNav} aria-label="Five-world navigation">
          {worlds.map((world) => (
            <Link key={world.label} href={world.href} className={world.active ? `${styles.worldLink} ${styles.worldLinkActive}` : styles.worldLink}>
              {world.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
