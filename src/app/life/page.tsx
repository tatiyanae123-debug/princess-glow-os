import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import {
  CalendarDays,
  ChevronRight,
  Compass,
  Home as HomeIcon,
  NotebookText,
  Search,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import { LifeWing, isLifeRoomId } from '@/components/life/life-wing';
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
import { LifeHistoryControls } from './life-history-controls';
import styles from './life-personal-house.module.css';

export const dynamic = 'force-dynamic';

const NEW_YORK_TZ = 'America/New_York';

type ChamberId = 'body' | 'beauty' | 'closet' | 'food' | 'home' | 'money' | 'work' | 'relationships' | 'travel';
type Chamber = { id: ChamberId; title: string; descriptor: string; href: string; keywords: string[] };

type LifePageProps = {
  searchParams: Promise<{ room?: string }>;
};

const CHAMBERS: Chamber[] = [
  { id: 'body', title: 'Body', descriptor: 'Energy · Sleep · Movement', href: '/life?room=body', keywords: ['body', 'fitness', 'workout', 'sleep', 'movement', 'wellness', 'health', 'energy', 'gym'] },
  { id: 'beauty', title: 'Beauty', descriptor: 'Skin · Hair · Glow', href: '/life?room=beauty', keywords: ['beauty', 'skin', 'skincare', 'hair', 'makeup', 'gua sha', 'face', 'glow'] },
  { id: 'closet', title: 'Closet', descriptor: 'Style · Wardrobe · Expression', href: '/life?room=closet', keywords: ['closet', 'style', 'wardrobe', 'outfit', 'fashion', 'clothes'] },
  { id: 'food', title: 'Food', descriptor: 'Nourish · Recipes · Balance', href: '/life?room=food', keywords: ['food', 'meal', 'nutrition', 'grocery', 'recipe', 'protein', 'breakfast', 'lunch', 'dinner'] },
  { id: 'home', title: 'Home', descriptor: 'Spaces · Objects · Atmosphere', href: '/life?room=home', keywords: ['home', 'room', 'bedroom', 'clean', 'organize', 'storage', 'space', 'laundry'] },
  { id: 'money', title: 'Money', descriptor: 'Wealth · Budget · Freedom', href: '/life?room=money', keywords: ['money', 'finance', 'budget', 'saving', 'debt', 'credit', 'invest', 'pay', 'bill'] },
  { id: 'work', title: 'Work', descriptor: 'Focus · Projects · Impact', href: '/life?room=work', keywords: ['work', 'job', 'career', 'interview', 'project', 'client', 'design', 'shift'] },
  { id: 'relationships', title: 'Relationships', descriptor: 'People · Connection · Boundaries', href: '/life?room=relationships', keywords: ['relationship', 'friend', 'family', 'people', 'boundary', 'birthday', 'social'] },
  { id: 'travel', title: 'Travel', descriptor: 'Places · Plans · Experiences', href: '/life?room=travel', keywords: ['travel', 'trip', 'flight', 'hotel', 'vacation', 'airport', 'visit'] },
];

const FLOW_ORDER: ChamberId[] = ['body', 'beauty', 'work', 'relationships', 'home', 'money', 'travel', 'food', 'closet'];

async function safe<T>(load: () => Promise<T>, fallback: T): Promise<T> {
  try { return await load(); }
  catch (error) { console.error('[Glow OS] Life source unavailable', error); return fallback; }
}

function textForItem(item: unknown) {
  if (!item || typeof item !== 'object') return '';
  const record = item as Record<string, unknown>;
  return ['title', 'name', 'description', 'notes', 'category', 'location']
    .map((key) => typeof record[key] === 'string' ? String(record[key]) : '')
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function countMatches(items: unknown[], keywords: string[]) {
  return items.filter((item) => {
    const text = textForItem(item);
    return keywords.some((keyword) => text.includes(keyword));
  }).length;
}

function dateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: NEW_YORK_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function formatEnergy(value: string | null | undefined) {
  if (!value) return 'Not logged';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatEventTime(value: Date) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: NEW_YORK_TZ,
    hour: 'numeric',
    minute: '2-digit',
  }).format(value);
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function Scene({ id }: { id: ChamberId }) {
  return (
    <span className={`${styles.scene} ${styles[`${id}Scene`]}`} aria-hidden="true">
      <i className={styles.sceneA} />
      <i className={styles.sceneB} />
      <i className={styles.sceneC} />
      <i className={styles.sceneD} />
      <i className={styles.sceneE} />
    </span>
  );
}

export default async function LifePage({ searchParams }: LifePageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const params = await searchParams;

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

  if (isLifeRoomId(params.room)) {
    return <LifeWing room={params.room} connectedCount={counts[params.room]} />;
  }

  const now = new Date();
  const firstName = session.user.name?.trim().split(/\s+/)[0] ?? 'you';
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: NEW_YORK_TZ, hour: '2-digit', hourCycle: 'h23' }).format(now));
  const greeting = greetingForHour(hour);
  const dateText = new Intl.DateTimeFormat('en-US', { timeZone: NEW_YORK_TZ, weekday: 'short', month: 'short', day: 'numeric' }).format(now);
  const fullDateText = new Intl.DateTimeFormat('en-US', { timeZone: NEW_YORK_TZ, weekday: 'long', month: 'long', day: 'numeric' }).format(now);
  const todayKey = dateKey(now);
  const todayEvents = [...events]
    .filter((event) => dateKey(event.startAt) === todayKey)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  const remainingToday = todayEvents.filter((event) => event.startAt.getTime() >= now.getTime() - 30 * 60 * 1000).slice(0, 4);
  const latestWellness = wellness[0] ?? null;
  const recentNotes = [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3);
  const calendarConnected = connections?.calendarState === 'connected';

  const styleCount = countMatches([...notes, ...tasks, ...goals] as unknown[], ['closet', 'style', 'wardrobe', 'outfit', 'fashion']);
  const foodCount = countMatches([...notes, ...tasks, ...routines] as unknown[], ['food', 'meal', 'recipe', 'grocery', 'breakfast', 'lunch', 'dinner']);
  const homeCount = countMatches([...tasks, ...notes, ...routines] as unknown[], ['home', 'room', 'clean', 'laundry', 'organize', 'storage']);
  const workCount = projects.length + countMatches(tasks as unknown[], ['work', 'job', 'career', 'project', 'interview', 'shift']);
  const relationshipCount = countMatches([...notes, ...tasks] as unknown[], ['relationship', 'friend', 'family', 'people', 'social', 'boundary']);
  const nextTravelEvent = [...events].find((event) => event.startAt.getTime() >= now.getTime() && Boolean(event.location));

  const roomStatus: Record<ChamberId, string> = {
    body: latestWellness?.energy ? `Energy ${formatEnergy(latestWellness.energy)} →` : wellness.length ? `${wellness.length} wellness update${wellness.length === 1 ? '' : 's'} →` : 'No wellness logged →',
    beauty: beauty.length ? `${beauty.length} ritual${beauty.length === 1 ? '' : 's'} →` : 'No rituals yet →',
    closet: styleCount ? `${styleCount} style note${styleCount === 1 ? '' : 's'} →` : 'No looks saved →',
    food: foodCount ? `${foodCount} meal idea${foodCount === 1 ? '' : 's'} →` : 'No meal ideas saved →',
    home: homeCount ? `${homeCount} home item${homeCount === 1 ? '' : 's'} →` : 'Home is clear →',
    money: finance.length ? 'Money updated →' : 'No money entries yet →',
    work: workCount ? `${workCount} active priorit${workCount === 1 ? 'y' : 'ies'} →` : 'No active priorities →',
    relationships: relationshipCount ? `${relationshipCount} people note${relationshipCount === 1 ? '' : 's'} →` : 'Open people →',
    travel: nextTravelEvent?.location ? `Next: ${nextTravelEvent.location} →` : 'No trip on calendar →',
  };

  const flowStatus: Record<ChamberId, string> = {
    body: latestWellness?.energy ? formatEnergy(latestWellness.energy) : 'Not logged',
    beauty: beauty.length ? 'Active' : 'Quiet',
    closet: styleCount ? 'In motion' : 'Open',
    food: foodCount ? 'Planned' : 'Open',
    home: homeCount ? 'Active' : 'Calm',
    money: finance.length ? 'Updated' : 'Open',
    work: workCount ? 'Active' : 'Clear',
    relationships: relationshipCount ? 'Active' : 'Open',
    travel: nextTravelEvent ? 'Upcoming' : 'Open',
  };

  const profileImage = session.user.image ?? null;

  return (
    <main className={styles.world} data-glow-room="life-personal-house">
      <div className={styles.causticA} aria-hidden="true" />
      <div className={styles.causticB} aria-hidden="true" />
      <div className={styles.causticC} aria-hidden="true" />

      <section className={styles.frame} aria-label="Life · The Personal House">
        <header className={styles.header}>
          <div className={styles.brandBlock}>
            <Link href="/home">Glow OS <span aria-hidden="true">⌄</span></Link>
            <small>Life</small>
          </div>

          <div className={styles.identity}>
            <span className={styles.worldLabel}>LIFE</span>
            <h1>LIFE · THE PERSONAL HOUSE</h1>
            <p>Your life, organized around you.</p>
          </div>

          <Link href="/ask-glow" className={styles.askGlow}>
            <Search size={13} strokeWidth={1.5} />
            <span>Ask Glow…</span>
            <i aria-hidden="true" />
          </Link>
        </header>

        <aside className={styles.leftRail} aria-label="Life instruments">
          <nav className={styles.lifeNav}>
            <Link href="/home"><span className={styles.iconShell}><HomeIcon /></span><span>Home</span></Link>
            <Link href="/life" className={styles.lifeActive}><span className={styles.navPearl} /><strong>Life</strong></Link>
            <Link href="/notes"><span className={styles.iconShell}><NotebookText /></span><span>Journal</span></Link>
            <Link href="/calendar"><span className={styles.iconShell}><CalendarDays /></span><span>Calendar</span></Link>
            <Link href="/life?room=relationships"><span className={styles.iconShell}><Users /></span><span>People</span></Link>
            <Link href="/life?room=travel"><span className={styles.iconShell}><Compass /></span><span>Explore</span></Link>
            <Link href="/settings"><span className={styles.iconShell}><Settings /></span><span>Settings</span></Link>
          </nav>

          <div className={styles.profileCard}>
            {profileImage ? <img src={profileImage} alt="" className={styles.profileImage} /> : <span className={styles.profilePearl}><span>{firstName.slice(0, 1).toUpperCase()}</span></span>}
            <small>{greeting},</small>
            <strong>{firstName}</strong>
            <div><span>Today</span><b>{todayEvents.length} event{todayEvents.length === 1 ? '' : 's'}</b></div>
            <div><span>Energy</span><b>{formatEnergy(latestWellness?.energy)}</b></div>
          </div>

          <Link href="/ask-glow" className={styles.voiceGlow}>
            <span className={styles.voicePearl} />
            <span><small>Ask Glow</small><strong>Listening when you need it</strong></span>
          </Link>
        </aside>

        <section className={styles.house} aria-label="Your Life rooms">
          {CHAMBERS.map((chamber) => (
            <Link key={chamber.id} href={chamber.href} className={`${styles.chamber} ${styles[chamber.id]}`}>
              <span className={styles.chamberCopy}>
                <strong>{chamber.title}</strong>
                <small>{chamber.descriptor}</small>
                <em>{roomStatus[chamber.id]}</em>
              </span>
              <Scene id={chamber.id} />
            </Link>
          ))}

          <Link href="/ask-glow" className={styles.centerYou}>
            <span className={styles.centerHalo} aria-hidden="true" />
            <span className={styles.centerRefraction} aria-hidden="true" />
            <strong>You at<br />the center</strong>
            <i />
            <small>Everything<br />in sync</small>
          </Link>
        </section>

        <aside className={styles.rightRail} aria-label="Life intelligence">
          <section className={styles.flowCard}>
            <span className={styles.eyebrow}>Life Flow</span>
            <small>This week</small>
            <div className={styles.flowList}>
              {FLOW_ORDER.map((id) => {
                const chamber = CHAMBERS.find((item) => item.id === id)!;
                return (
                  <Link href={chamber.href} key={id}>
                    <i className={styles[`dot_${id}`]} />
                    <span>{chamber.title}</span>
                    <b>{flowStatus[id]}</b>
                  </Link>
                );
              })}
            </div>
          </section>

          <section className={styles.scoreCard}>
            <span className={styles.eyebrow}>Life Score</span>
            <small>Aligned</small>
            <strong>—</strong>
            <div className={styles.scoreArc} aria-hidden="true" />
            <p>Not enough verified signal yet to calculate a real alignment score.</p>
          </section>

          <section className={styles.movesCard}>
            <span className={styles.eyebrow}>Recent moves</span>
            {recentNotes.length ? recentNotes.map((note) => (
              <Link href="/notes" key={note.id}>
                <NotebookText size={12} strokeWidth={1.35} />
                <span><strong>{note.title}</strong><small>Updated {note.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></span>
                <ChevronRight size={12} strokeWidth={1.3} />
              </Link>
            )) : <p>No recent moves yet.</p>}
          </section>
        </aside>

        <section className={styles.bottomBand} aria-label="Today at a glance">
          <div className={styles.todayGlance}>
            <div className={styles.glanceDate}>
              <span>Today at a glance</span>
              <strong>{dateText}</strong>
              <small>{calendarConnected ? 'Weather not connected' : 'Calendar and weather are not fully connected'}</small>
            </div>
            <div className={styles.eventStrip}>
              {remainingToday.length ? remainingToday.map((event) => (
                <Link href="/calendar" key={event.id} className={styles.eventItem}>
                  <b>{formatEventTime(event.startAt)}</b>
                  <span>{event.title}</span>
                </Link>
              )) : <div className={styles.emptyEvent}>No more events today.</div>}
            </div>
            <Link href="/calendar" className={styles.viewCalendar}>View calendar <span aria-hidden="true">→</span></Link>
          </div>

          <Link href="/ask-glow" className={styles.editorialCard}>
            <span className={styles.editorialGlow} aria-hidden="true" />
            <small>GLOW</small>
            <strong>A more intentional you,<br />in a more beautiful life.</strong>
            <span>Ask Glow <span aria-hidden="true">→</span></span>
          </Link>
        </section>

        <footer className={styles.footer}>
          <LifeHistoryControls />
          <Link href="/today?room=replan" className={styles.planDay}>
            <span className={styles.planOrb}><Sparkles size={12} /></span>
            <strong>Plan my day with Glow</strong>
          </Link>
          <div className={styles.savedReceipt}><span aria-hidden="true">✓</span> All changes saved</div>
        </footer>
      </section>
    </main>
  );
}
