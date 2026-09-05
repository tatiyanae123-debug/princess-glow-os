import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import {
  CalendarDays,
  Compass,
  NotebookText,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { LifeWing, isLifeRoomId } from '@/components/life/life-wing';
import { getBeautyRoutinesByUser } from '@/lib/data/beauty-routines';
import { getCalendarEventsByUser } from '@/lib/data/calendar-events';
import { getFinanceEntriesByUser } from '@/lib/data/finance-entries';
import { getGoalsByUser } from '@/lib/data/goals';
import { getHabitsByUser } from '@/lib/data/habits';
import { getNotesByUser } from '@/lib/data/notes';
import { getRoutinesByUser } from '@/lib/data/routines';
import { getTasksByUser } from '@/lib/data/tasks';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { getWellnessEntriesByUser } from '@/lib/data/wellness-entries';
import { LifeHistoryControls } from './life-history-controls';
import styles from './life-personal-house-v3.module.css';

export const dynamic = 'force-dynamic';

const NEW_YORK_TZ = 'America/New_York';

type ChamberId = 'body' | 'beauty' | 'closet' | 'food' | 'home' | 'money' | 'work' | 'relationships' | 'travel';
type Chamber = { id: ChamberId; title: string; descriptor: string; href: string; keywords: string[] };
type LifePageProps = { searchParams: Promise<{ room?: string }> };

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
    year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

function formatEnergy(value: string | null | undefined) {
  if (!value) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

function quietCount(count: number, singular: string, plural: string, fallback: string, active: string) {
  if (!count) return fallback;
  if (count <= 12) return `${count} ${count === 1 ? singular : plural}`;
  return active;
}

function shortLocation(value: string) {
  const first = value.split(',')[0]?.trim();
  return first && first.length <= 22 ? first : first?.slice(0, 20) || 'Trip planned';
}

function humanMoveTitle(title: string) {
  const clean = title
    .replace(/^\[[^\]]*GLOW[^\]]*\]\s*/i, '')
    .replace(/^GLOW\s*(VOICE|ACTION|COMMAND|CAPTURE)?\s*[·:\-–—]*\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!clean || /^(voice|action|command|capture)$/i.test(clean)) return 'Journal updated';
  if (clean.length > 31) return `${clean.slice(0, 29).trim()}…`;
  return clean;
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

  const [tasks, events, habits, goals, routines, finance, wellness, notes, beauty, projects] = await Promise.all([
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
  const todayKey = dateKey(now);
  const todayEvents = [...events].filter((event) => dateKey(event.startAt) === todayKey);
  const latestWellness = wellness[0] ?? null;
  const energy = formatEnergy(latestWellness?.energy);
  const recentNotes = [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 3);

  const styleCount = countMatches([...notes, ...tasks, ...goals] as unknown[], ['closet', 'style', 'wardrobe', 'outfit', 'fashion']);
  const foodCount = countMatches([...notes, ...tasks, ...routines] as unknown[], ['food', 'meal', 'recipe', 'grocery', 'breakfast', 'lunch', 'dinner']);
  const homeCount = countMatches([...tasks, ...notes, ...routines] as unknown[], ['home', 'room', 'clean', 'laundry', 'organize', 'storage']);
  const workCount = projects.length + countMatches(tasks as unknown[], ['work', 'job', 'career', 'project', 'interview', 'shift']);
  const relationshipCount = countMatches([...notes, ...tasks] as unknown[], ['relationship', 'friend', 'family', 'people', 'social', 'boundary']);
  const nextTravelEvent = [...events].find((event) => event.startAt.getTime() >= now.getTime() && Boolean(event.location));

  const roomStatus: Record<ChamberId, string> = {
    body: energy ? `Energy ${energy}` : wellness.length ? 'Wellness updated' : 'Ready',
    beauty: quietCount(beauty.length, 'ritual', 'rituals', 'Ready', 'Rituals active'),
    closet: quietCount(styleCount, 'look', 'looks', 'Ready', 'Style in motion'),
    food: quietCount(foodCount, 'meal idea', 'meal ideas', 'Ready', 'Meal ideas ready'),
    home: homeCount ? 'In motion' : 'Calm',
    money: finance.length ? 'Updated' : 'Ready',
    work: quietCount(workCount, 'priority', 'priorities', 'Clear', 'Priorities active'),
    relationships: relationshipCount ? 'Connections active' : 'Open',
    travel: nextTravelEvent?.location ? `Next: ${shortLocation(nextTravelEvent.location)}` : 'Open',
  };

  const flowStatus: Record<ChamberId, string> = {
    body: energy ?? 'Ready',
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
      <div className={styles.causticD} aria-hidden="true" />

      <section className={styles.frame} aria-label="Life · The Personal House">
        <header className={styles.header}>
          <div className={styles.brandBlock}>
            <Link href="/home">Glow OS <span aria-hidden="true">⌄</span></Link>
            <small>Personal House</small>
          </div>

          <div className={styles.identity}>
            <span className={styles.worldLabel}>LIFE</span>
            <h1>LIFE · THE PERSONAL HOUSE</h1>
            <p>Your life, organized around you.</p>
          </div>

          <div className={styles.askCluster}>
            <Link href="/ask-glow" className={styles.askGlow}>
              <Search size={12} strokeWidth={1.45} />
              <span>Ask Glow…</span>
            </Link>
            <Link href="/ask-glow" className={styles.askOrb} aria-label="Open Ask Glow" />
          </div>
        </header>

        <aside className={styles.leftRail} aria-label="Life instruments">
          <nav className={styles.lifeNav}>
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
            <div><span>Energy</span><b>{energy ?? 'Not logged'}</b></div>
          </div>

          <Link href="/ask-glow" className={styles.voiceGlow}>
            <span className={styles.voicePearl} />
            <span><small>Ask Glow</small><strong>Listening</strong></span>
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
            <span className={styles.centerHaloA} aria-hidden="true" />
            <span className={styles.centerHaloB} aria-hidden="true" />
            <span className={styles.centerRefraction} aria-hidden="true" />
            <strong>You at<br />the center</strong>
            <i />
            <small>Everything<br />in sync</small>
          </Link>
        </section>

        <aside className={styles.rightRail} aria-label="Life intelligence">
          <section className={styles.flowSection}>
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

          <section className={styles.scoreSection}>
            <span className={styles.eyebrow}>Life Score</span>
            <small>Aligned</small>
            <strong>—</strong>
            <div className={styles.scoreArc} aria-hidden="true" />
            <p>Still forming</p>
          </section>

          <section className={styles.movesSection}>
            <span className={styles.eyebrow}>Recent moves</span>
            {recentNotes.length ? recentNotes.map((note) => (
              <Link href="/notes" key={note.id}>
                <span className={styles.moveIcon} aria-hidden="true">✓</span>
                <span><strong>{humanMoveTitle(note.title)}</strong><small>Updated {note.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></span>
              </Link>
            )) : <p>Nothing new yet.</p>}
          </section>
        </aside>
      </section>

      <div className={styles.externalControls}>
        <LifeHistoryControls />
        <div className={styles.savedReceipt}><span aria-hidden="true">✓</span> All changes saved</div>
      </div>
    </main>
  );
}
