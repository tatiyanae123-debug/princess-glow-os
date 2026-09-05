'use client';

import {
  CalendarDays,
  ChevronRight,
  CircleUserRound,
  Compass,
  Home,
  JournalText,
  Search,
  Settings,
  Sparkles,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import styles from './life-personal-house.module.css';

type ChamberId = 'body' | 'beauty' | 'closet' | 'food' | 'home' | 'money' | 'work' | 'relationships' | 'travel';

type Chamber = {
  id: ChamberId;
  title: string;
  descriptor: string;
  href: string;
  keywords: string[];
};

const CHAMBERS: Chamber[] = [
  { id: 'body', title: 'Body', descriptor: 'Energy · Sleep · Movement', href: '/wellness', keywords: ['body', 'fitness', 'workout', 'sleep', 'movement', 'wellness', 'health', 'energy', 'gym'] },
  { id: 'beauty', title: 'Beauty', descriptor: 'Skin · Hair · Glow', href: '/beauty', keywords: ['beauty', 'skin', 'skincare', 'hair', 'makeup', 'gua', 'face', 'glow'] },
  { id: 'closet', title: 'Closet', descriptor: 'Style · Wardrobe · Expression', href: '/notes', keywords: ['closet', 'style', 'wardrobe', 'outfit', 'fashion', 'clothes'] },
  { id: 'food', title: 'Food', descriptor: 'Nourish · Recipes · Balance', href: '/routines', keywords: ['food', 'meal', 'nutrition', 'grocery', 'recipe', 'protein', 'breakfast', 'lunch', 'dinner'] },
  { id: 'home', title: 'Home', descriptor: 'Spaces · Objects · Atmosphere', href: '/notes', keywords: ['home', 'room', 'bedroom', 'clean', 'organize', 'storage', 'closet', 'space'] },
  { id: 'money', title: 'Money', descriptor: 'Wealth · Budget · Freedom', href: '/money', keywords: ['money', 'finance', 'budget', 'saving', 'debt', 'credit', 'invest', 'pay', 'bill'] },
  { id: 'work', title: 'Work', descriptor: 'Focus · Projects · Impact', href: '/work', keywords: ['work', 'job', 'career', 'interview', 'project', 'client', 'design', 'shift'] },
  { id: 'relationships', title: 'Relationships', descriptor: 'People · Connection · Boundaries', href: '/today?room=people', keywords: ['relationship', 'friend', 'family', 'people', 'date', 'boundary', 'birthday'] },
  { id: 'travel', title: 'Travel', descriptor: 'Places · Plans · Experiences', href: '/calendar', keywords: ['travel', 'trip', 'flight', 'hotel', 'vacation', 'airport', 'visit'] },
];

function textContains(value: string | null | undefined, keywords: string[]) {
  if (!value) return false;
  const normalized = value.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function LifePersonalHouse() {
  const personal = usePersonalContext();
  const [askOpen, setAskOpen] = useState(false);

  const model = useMemo(() => {
    if (personal.status !== 'ready') return null;
    const data = personal.data;

    const counts = Object.fromEntries(CHAMBERS.map((chamber) => {
      let count = 0;
      count += data.tasks.filter((item) => textContains(`${item.title} ${item.description ?? ''}`, chamber.keywords)).length;
      count += data.routines.filter((item) => textContains(`${item.name} ${item.description ?? ''}`, chamber.keywords)).length;
      count += data.habits.filter((item) => textContains(`${item.name} ${item.description ?? ''}`, chamber.keywords)).length;
      count += data.notes.filter((item) => textContains(`${item.title} ${item.content ?? ''}`, chamber.keywords)).length;
      count += data.goals.filter((item) => textContains(`${item.title} ${item.description ?? ''} ${item.category}`, chamber.keywords)).length;
      if (chamber.id === 'travel') count += data.events.filter((event) => Boolean(event.location)).length;
      if (chamber.id === 'body' && data.wellness) count += 1;
      return [chamber.id, count];
    })) as Record<ChamberId, number>;

    const recentNotes = [...data.notes]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3);

    return {
      firstName: data.user.name?.split(' ')[0] ?? null,
      counts,
      todayEvents: data.todayEvents.length,
      energy: data.wellness?.energy ?? null,
      connectedCalendar: data.sourceStatus.googleCalendar === 'connected',
      recentNotes,
      totalConnected: Object.values(counts).reduce((sum, count) => sum + count, 0),
    };
  }, [personal]);

  return (
    <main className={styles.world}>
      <div className={styles.causticA} aria-hidden="true" />
      <div className={styles.causticB} aria-hidden="true" />
      <section className={styles.frame} aria-label="Life · The Personal House">
        <header className={styles.header}>
          <div className={styles.homeNav}>
            <a href="/home">Glow OS</a>
            <span>·</span>
            <a href="/today?room=what-now">Today</a>
          </div>
          <div className={styles.identity}>
            <h1>LIFE · THE PERSONAL HOUSE</h1>
            <p>Your life, organized around you.</p>
          </div>
          <button type="button" className={styles.askGlow} onClick={() => setAskOpen((open) => !open)} aria-expanded={askOpen}>
            <Search size={13} />
            <span>Ask Glow…</span>
            <i aria-hidden="true" />
          </button>
        </header>

        <aside className={styles.leftRail} aria-label="Life instruments">
          <a href="/life" className={styles.lifeActive}><span className={styles.navPearl} /><strong>Life</strong></a>
          <a href="/notes"><JournalText /><span>Journal</span></a>
          <a href="/calendar"><CalendarDays /><span>Calendar</span></a>
          <a href="/today?room=people"><Users /><span>People</span></a>
          <a href="/notes"><Compass /><span>Explore</span></a>
          <a href="/settings"><Settings /><span>Settings</span></a>

          <div className={styles.profileCard}>
            <span className={styles.profilePearl}><CircleUserRound /></span>
            <small>{greeting()},</small>
            <strong>{model?.firstName ?? 'you'}</strong>
            <div><span>Today</span><b>{model ? `${model.todayEvents} event${model.todayEvents === 1 ? '' : 's'}` : 'Reading…'}</b></div>
            <div><span>Energy</span><b>{model?.energy ?? 'Not logged'}</b></div>
          </div>

          <button type="button" className={styles.voiceGlow} onClick={() => setAskOpen(true)}>
            <span className={styles.voicePearl} />
            <span><small>Ask Glow</small><strong>Tap to ask</strong></span>
          </button>
        </aside>

        <section className={styles.house}>
          {CHAMBERS.map((chamber) => {
            const count = model?.counts[chamber.id] ?? 0;
            return (
              <a key={chamber.id} href={chamber.href} className={`${styles.chamber} ${styles[chamber.id]}`}>
                <span className={styles.chamberCopy}>
                  <strong>{chamber.title}</strong>
                  <small>{chamber.descriptor}</small>
                  <em>{personal.status === 'loading' ? 'Reading your data…' : count ? `${count} connected item${count === 1 ? '' : 's'}` : 'No connected items yet'}</em>
                </span>
                <span className={styles.objectCluster} aria-hidden="true"><i /><i /><i /></span>
              </a>
            );
          })}

          <button type="button" className={styles.centerYou} onClick={() => setAskOpen(true)}>
            <span className={styles.centerHalo} aria-hidden="true" />
            <strong>You at<br />the center</strong>
            <i />
            <small>{model ? (model.totalConnected ? 'Your connected life is in view' : 'Ready for your real information') : 'Reading your connected life…'}</small>
          </button>
        </section>

        <aside className={styles.rightRail}>
          <section className={styles.flowCard}>
            <span className={styles.eyebrow}>Life flow</span>
            <small>This connected view</small>
            <div className={styles.flowList}>
              {CHAMBERS.map((chamber) => (
                <a href={chamber.href} key={chamber.id}>
                  <i className={styles[`dot_${chamber.id}`]} />
                  <span>{chamber.title}</span>
                  <b>{model ? model.counts[chamber.id] : '—'}</b>
                </a>
              ))}
            </div>
          </section>

          <section className={styles.scoreCard}>
            <span className={styles.eyebrow}>Life status</span>
            <small>{personal.status === 'ready' ? 'Real data only' : 'Connecting'}</small>
            <strong>{model?.connectedCalendar ? 'Connected' : 'Partial'}</strong>
            <div className={styles.scoreArc} aria-hidden="true" />
            <p>{model?.connectedCalendar ? 'Calendar is connected. Other rooms only show information Glow actually has.' : 'Calendar is not fully connected. Glow will not invent a score.'}</p>
          </section>

          <section className={styles.movesCard}>
            <span className={styles.eyebrow}>Recent moves</span>
            {model?.recentNotes.length ? model.recentNotes.map((note) => (
              <a href="/notes" key={note.id}>
                <JournalText size={13} />
                <span><strong>{note.title}</strong><small>Updated {new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></span>
                <ChevronRight size={12} />
              </a>
            )) : <p>No recent connected notes yet.</p>}
          </section>
        </aside>

        <footer className={styles.footer}>
          <span>Live connected data</span>
          <span className={styles.footerPearl}><Sparkles size={12} /></span>
          <span>{personal.status === 'ready' ? 'No sample life data' : 'Connecting…'}</span>
        </footer>
      </section>

      {askOpen ? (
        <aside className={styles.askPanel} role="dialog" aria-label="Ask Glow">
          <div><span className={styles.voicePearl} /><strong>Ask Glow</strong><button type="button" onClick={() => setAskOpen(false)} aria-label="Close">×</button></div>
          <p>Your Life context stays attached. Glow only uses information that belongs to your signed-in account.</p>
          <a href="/today?room=what-now">What should I do now?</a>
          <a href="/planning">Help me plan</a>
          <a href="/beauty">Open Beauty</a>
        </aside>
      ) : null}
    </main>
  );
}
