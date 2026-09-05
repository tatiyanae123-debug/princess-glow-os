import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import {
  CalendarDays,
  Compass,
  NotebookText,
  Search,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getConnectionsOverview } from '@/lib/data/connections';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getGoalsByUser } from '@/lib/data/goals';
import { getHabitsByUser } from '@/lib/data/habits';
import { getNotesByUser } from '@/lib/data/notes';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getTasksByUser } from '@/lib/data/tasks';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import styles from './life-personal-house.module.css';

export const dynamic = 'force-dynamic';

type ChamberId = 'body' | 'beauty' | 'closet' | 'food' | 'home' | 'money' | 'work' | 'relationships' | 'travel';
type Chamber = { id: ChamberId; title: string; descriptor: string; href: string; keywords: string[] };

const CHAMBERS: Chamber[] = [
  { id: 'body', title: 'Body', descriptor: 'Energy · Sleep · Movement', href: '/wellness', keywords: ['body', 'fitness', 'workout', 'sleep', 'movement', 'wellness', 'health', 'energy', 'gym'] },
  { id: 'beauty', title: 'Beauty', descriptor: 'Skin · Hair · Glow', href: '/beauty', keywords: ['beauty', 'skin', 'skincare', 'hair', 'makeup', 'gua sha', 'face', 'glow'] },
  { id: 'closet', title: 'Closet', descriptor: 'Style · Wardrobe · Expression', href: '/closet', keywords: ['closet', 'style', 'wardrobe', 'outfit', 'fashion', 'clothes'] },
  { id: 'food', title: 'Food', descriptor: 'Nourish · Recipes · Balance', href: '/food', keywords: ['food', 'meal', 'nutrition', 'grocery', 'recipe', 'protein', 'breakfast', 'lunch', 'dinner'] },
  { id: 'home', title: 'Home', descriptor: 'Spaces · Objects · Atmosphere', href: '/tasks', keywords: ['home', 'room', 'bedroom', 'clean', 'organize', 'storage', 'space', 'laundry'] },
  { id: 'money', title: 'Money', descriptor: 'Wealth · Budget · Freedom', href: '/finance', keywords: ['money', 'finance', 'budget', 'saving', 'debt', 'credit', 'invest', 'pay', 'bill'] },
  { id: 'work', title: 'Work', descriptor: 'Focus · Projects · Impact', href: '/work', keywords: ['work', 'job', 'career', 'interview', 'project', 'client', 'design', 'shift'] },
  { id: 'relationships', title: 'Relationships', descriptor: 'People · Connection · Boundaries', href: '/today?room=people', keywords: ['relationship', 'friend', 'family', 'people', 'boundary', 'birthday', 'social'] },
  { id: 'travel', title: 'Travel', descriptor: 'Places · Plans · Experiences', href: '/today?room=places', keywords: ['travel', 'trip', 'flight', 'hotel', 'vacation', 'airport', 'visit'] },
];

async function safe<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try { return await load(); }
  catch (error) { console.error('[Glow OS] Life source unavailable', error); return fallback; }
}

function countMatches(items: unknown[], keywords: string[]) {
  return items.filter((item) => {
    const text = (JSON.stringify(item) ?? '').toLowerCase();
    return keywords.some((keyword) => text.includes(keyword));
  }).length;
}

function upcomingWithin24Hours(events: Array<{ startAt: Date }>) {
  const now = Date.now();
  const end = now + 24 * 60 * 60 * 1000;
  return events.filter((event) => event.startAt.getTime() >= now && event.startAt.getTime() <= end).length;
}

function formatEnergy(value: string | null | undefined) {
  if (!value) return 'Not logged';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default async function LifePage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;

  const [tasks, events, habits, goals, routines, finance, wellness, notes, beauty, projects, connections] = await Promise.all([
    safe(() => getTasksByUser(userId), []),
    safe(() => getCalendarEventsByUser(userId), []),
    safe(() => getHabitsByUser(userId), []),
    safe(() => getGoalsByUser(userId), []),
    safe(() => getRoutinesByUser(userId), []),
    safe(() => getFinanceEntriesByUser(userId), []),
    safe(() => getWellnessEntriesByUser(userId), []),
    safe(() => getNotesByUser(userId), []),
    safe(() => getBeautyRoutinesByUser(userId), []),
    safe(() => getProjectsByUser(userId), []),
    safe(() => getConnectionsOverview(userId), null),
  ]);

  const shared = [tasks, habits, goals, routines, notes, events].flat() as unknown[];
  const counts = Object.fromEntries(CHAMBERS.map((chamber) => {
    let count = countMatches(shared, chamber.keywords);
    if (chamber.id === 'body') count += wellness.length;
    if (chamber.id === 'beauty') count += beauty.length;
    if (chamber.id === 'money') count += finance.length;
    if (chamber.id === 'work') count += projects.length;
    if (chamber.id === 'travel') count += events.filter((event) => Boolean(event.location)).length;
    return [chamber.id, count];
  })) as Record<ChamberId, number>;

  const now = new Date();
  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? 'you';
  const dateText = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'long', month: 'long', day: 'numeric' }).format(now);
  const timeText = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit' }).format(now);
  const totalConnected = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const latestWellness = wellness[0] ?? null;
  const todayCount = upcomingWithin24Hours(events);
  const recentNotes = [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3);
  const calendarConnected = connections?.calendarState === 'connected';
  const statusLabel = calendarConnected && totalConnected > 0 ? 'Connected' : totalConnected > 0 ? 'Partial' : 'Ready';

  return (
    <main className={styles.world} data-glow-room="life-personal-house">
      <div className={styles.causticA} aria-hidden="true" />
      <div className={styles.causticB} aria-hidden="true" />

      <section className={styles.frame} aria-label="Life · The Personal House">
        <header className={styles.header}>
          <nav className={styles.homeNav} aria-label="Glow navigation">
            <Link href="/home">Glow OS</Link>
            <span>·</span>
            <Link href="/today?room=what-now">Today</Link>
          </nav>

          <div className={styles.identity}>
            <h1>LIFE · THE PERSONAL HOUSE</h1>
            <p>Your life, organized around you.</p>
          </div>

          <Link href="/ask-glow" className={styles.askGlow}>
            <Search size={13} />
            <span>Ask Glow…</span>
            <i aria-hidden="true" />
          </Link>
        </header>

        <aside className={styles.leftRail} aria-label="Life instruments">
          <Link href="/life" className={styles.lifeActive}><span className={styles.navPearl} /><strong>Life</strong></Link>
          <Link href="/notes"><NotebookText /><span>Journal</span></Link>
          <Link href="/calendar"><CalendarDays /><span>Calendar</span></Link>
          <Link href="/today?room=people"><Users /><span>People</span></Link>
          <Link href="/today?room=places"><Compass /><span>Explore</span></Link>
          <Link href="/settings"><Settings /><span>Settings</span></Link>

          <div className={styles.profileCard}>
            <span className={styles.profilePearl}><span>{firstName.slice(0, 1).toUpperCase()}</span></span>
            <small>Welcome,</small>
            <strong>{firstName}</strong>
            <div><span>{dateText}</span><b>{timeText}</b></div>
            <div><span>Next 24 hours</span><b>{todayCount} event{todayCount === 1 ? '' : 's'}</b></div>
            <div><span>Energy</span><b>{formatEnergy(latestWellness?.energy)}</b></div>
          </div>

          <Link href="/ask-glow" className={styles.voiceGlow}>
            <span className={styles.voicePearl} />
            <span><small>Ask Glow</small><strong>Tap to ask</strong></span>
          </Link>
        </aside>

        <section className={styles.house} aria-label="Your Life rooms">
          {CHAMBERS.map((chamber) => {
            const count = counts[chamber.id];
            return (
              <Link key={chamber.id} href={chamber.href} className={`${styles.chamber} ${styles[chamber.id]}`}>
                <span className={styles.chamberCopy}>
                  <strong>{chamber.title}</strong>
                  <small>{chamber.descriptor}</small>
                  <em>{count ? `${count} connected item${count === 1 ? '' : 's'}` : 'No connected items yet'}</em>
                </span>
                <span className={styles.objectCluster} aria-hidden="true"><i /><i /><i /></span>
              </Link>
            );
          })}

          <Link href="/ask-glow" className={styles.centerYou}>
            <span className={styles.centerHalo} aria-hidden="true" />
            <strong>You at<br />the center</strong>
            <i />
            <small>{totalConnected ? 'Your connected life is in view' : 'Ready for your real information'}</small>
          </Link>
        </section>

        <aside className={styles.rightRail} aria-label="Life intelligence">
          <section className={styles.flowCard}>
            <span className={styles.eyebrow}>Life flow</span>
            <small>Connected information</small>
            <div className={styles.flowList}>
              {CHAMBERS.map((chamber) => (
                <Link href={chamber.href} key={chamber.id}>
                  <i className={styles[`dot_${chamber.id}`]} />
                  <span>{chamber.title}</span>
                  <b>{counts[chamber.id]}</b>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.scoreCard}>
            <span className={styles.eyebrow}>Life status</span>
            <small>Real data only</small>
            <strong>{statusLabel}</strong>
            <div className={styles.scoreArc} aria-hidden="true" />
            <p>{calendarConnected ? 'Calendar is connected. Every room only shows information Glow actually has.' : 'Glow will not invent a Life Score while connected information is incomplete.'}</p>
          </section>

          <section className={styles.movesCard}>
            <span className={styles.eyebrow}>Recent moves</span>
            {recentNotes.length ? recentNotes.map((note) => (
              <Link href="/notes" key={note.id}>
                <NotebookText size={13} />
                <span><strong>{note.title}</strong><small>Updated {note.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></span>
                <span aria-hidden="true">›</span>
              </Link>
            )) : <p>No recent connected notes yet.</p>}
          </section>
        </aside>

        <footer className={styles.footer}>
          <span>Live connected data</span>
          <span className={styles.footerPearl}><Sparkles size={12} /></span>
          <span>No sample life data</span>
        </footer>
      </section>
    </main>
  );
}
