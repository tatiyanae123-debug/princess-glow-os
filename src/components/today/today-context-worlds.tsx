'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CalendarDays,
  Check,
  FileText,
  Focus,
  Mail,
  MapPin,
  MessageCircle,
  Pause,
  Play,
  Route,
  Search,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import styles from './today-context-worlds.module.css';

type ContextRoom = 'focus' | 'people' | 'places' | 'resources' | 'journey';
type TodayRoom = ContextRoom | 'morning' | 'what-now' | 'meeting' | 'next-up' | 'later' | 'tonight' | 'tomorrow' | 'replan';

type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  organization: string | null;
};

type Place = {
  id: string;
  name: string;
  eventTitle: string;
  startAt: string;
  mapsUrl: string;
  calendarUrl: string | null;
};

function roomHref(room: TodayRoom) {
  return `/today?room=${encodeURIComponent(room)}`;
}

function hardGo(room: TodayRoom) {
  window.location.assign(roomHref(room));
}

function Matter({ className = '' }: { className?: string }) {
  return <span className={`${styles.matter} ${className}`} aria-hidden="true"><i /><b /></span>;
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');
}

function safePhoneHref(phone: string) {
  return `sms:${phone.replace(/[^+\d]/g, '')}`;
}

function ContextLinks({ active }: { active: ContextRoom }) {
  const links: Array<{ room: ContextRoom; label: string; icon: React.ReactNode }> = [
    { room: 'focus', label: 'Focus', icon: <Focus size={15} /> },
    { room: 'people', label: 'People', icon: <Users size={15} /> },
    { room: 'places', label: 'Places', icon: <MapPin size={15} /> },
    { room: 'resources', label: 'Resources', icon: <FileText size={15} /> },
    { room: 'journey', label: 'Journey', icon: <Route size={15} /> },
  ];

  return (
    <div className={styles.contextLinks} aria-label="Connected context">
      {links.map((item) => (
        <a key={item.room} href={roomHref(item.room)} className={active === item.room ? styles.contextActive : ''}>
          {item.icon}<span>{item.label}</span>
        </a>
      ))}
    </div>
  );
}

function FocusWorld() {
  const personal = usePersonalContext();
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);

  const timeText = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const data = personal.status === 'ready' ? personal.data : null;
  const active = data?.activeTask ?? null;
  const queue = data?.tasks.filter((task) => task.id !== active?.id).slice(0, 3) ?? [];

  return (
    <>
      <section className={styles.titleArea}>
        <span>Your active work</span>
        <h1>Focus</h1>
        <p>This room uses the task attached to your signed-in Glow account. If no active task exists, Glow leaves the focus empty.</p>
      </section>

      <section className={`${styles.glassPanel} ${styles.focusHero}`}>
        <div className={styles.focusHeroCopy}>
          <span className={styles.kicker}>{active ? `${active.priority} priority` : 'No active task'}</span>
          <h2>{active?.title ?? 'Choose what deserves your attention.'}</h2>
          <p>{active?.description || (active ? 'Your saved task is the only work represented here.' : 'Go to What Now to choose a real task. No sample proposal or project is inserted.')}</p>
          <button type="button" className={styles.primaryButton} disabled={!active} onClick={() => setRunning((value) => !value)}>{running ? <Pause size={17} /> : <Play size={17} />}{running ? 'Pause timer' : 'Start 25 min timer'}</button>
        </div>
        <div className={styles.focusMatterWrap}>
          <Matter className={styles.heroMatter} />
          <div className={styles.timerText}><strong>{active ? timeText : '—'}</strong><span>{active ? 'focus timer' : 'no focus set'}</span></div>
        </div>
      </section>

      <section className={styles.twoCol}>
        <div className={`${styles.glassPanel} ${styles.checklist}`}>
          <span className={styles.sectionLabel}>Your open queue</span>
          {queue.map((task) => (
            <button key={task.id} type="button" onClick={() => setDone((old) => ({ ...old, [task.id]: !old[task.id] }))}>
              <span className={`${styles.checkDot} ${done[task.id] ? styles.checkDone : ''}`}>{done[task.id] ? <Check size={12} /> : null}</span>
              <span>{task.title}</span>
            </button>
          ))}
          {queue.length === 0 ? <div className={styles.stateCard}>No additional open tasks were found for this account.</div> : null}
        </div>
        <div className={`${styles.glassPanel} ${styles.focusProgress}`}>
          <span className={styles.sectionLabel}>Task state</span>
          <strong>{active ? (active.status === 'in_progress' ? 'Active' : 'Ready') : 'Empty'}</strong>
          <small>{active ? `${active.priority} priority${active.dueDate ? ` · due ${new Date(active.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ''}` : 'No fake progress percentage is shown.'}</small>
        </div>
      </section>

      <ContextLinks active="focus" />
    </>
  );
}

function PeopleWorld() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'connect' | 'error'>('loading');
  const [query, setQuery] = useState('');

  useEffect(() => {
    let live = true;
    fetch('/api/contacts', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!live) return;
        if (!response.ok || !data.ok) {
          setStatus(
            data.reason === 'not_signed_in' ||
            data.reason === 'not_connected' ||
            data.reason === 'insufficient_scope' ||
            data.reason === 'revoked'
              ? 'connect'
              : 'error',
          );
          return;
        }
        setContacts(data.contacts ?? []);
        setStatus('ready');
      })
      .catch(() => live && setStatus('error'));
    return () => { live = false; };
  }, []);

  const filtered = useMemo(() => contacts.filter((contact) => {
    const haystack = `${contact.name} ${contact.organization ?? ''} ${contact.email ?? ''}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  }), [contacts, query]);

  return (
    <>
      <section className={styles.titleArea}>
        <span>Your connected contacts</span>
        <h1>People</h1>
        <p>Only contacts returned by your connected Google account are shown. Glow does not create sample people.</p>
      </section>

      <section className={`${styles.glassPanel} ${styles.peopleHero}`}>
        <div><span className={styles.kicker}>Your people</span><h2>Reach the actual person.</h2><p>Message opens Apple Messages for a real phone number. Email opens Mail. Glow does not read your private iMessage history.</p></div>
        <Matter className={styles.peopleMatter} />
      </section>

      <div className={styles.searchBox}><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find one of your contacts" /></div>

      {status === 'loading' ? <div className={styles.stateCard}>Loading your connected contacts…</div> : null}
      {status === 'connect' ? (
        <div className={styles.stateCard}><strong>Contacts are not connected</strong><p>Authorize read-only Google Contacts to show real contacts here. Glow will not replace them with sample names.</p><Link href="/sign-in?connect=contacts" className={styles.primaryLink}>Connect contacts <ArrowRight size={15} /></Link></div>
      ) : null}
      {status === 'error' ? <div className={styles.stateCard}><strong>Contacts could not load.</strong><p>Google returned a service error. Glow is leaving People empty instead of showing invented contacts.</p></div> : null}

      {status === 'ready' ? (
        <section className={styles.contactGrid}>
          {filtered.slice(0, 30).map((contact) => (
            <article className={`${styles.glassPanel} ${styles.contactCard}`} key={contact.id}>
              {contact.photoUrl ? <img src={contact.photoUrl} alt="" /> : <span className={styles.avatar}>{initials(contact.name)}</span>}
              <div className={styles.contactCopy}><strong>{contact.name}</strong><span>{contact.organization || contact.email || contact.phone || 'Contact'}</span></div>
              <div className={styles.contactActions}>
                {contact.phone ? <a href={safePhoneHref(contact.phone)} aria-label={`Message ${contact.name}`}><MessageCircle size={16} /><span>Message</span></a> : null}
                {contact.email ? <a href={`mailto:${contact.email}`} aria-label={`Email ${contact.name}`}><Mail size={16} /><span>Email</span></a> : null}
              </div>
            </article>
          ))}
          {filtered.length === 0 ? <div className={styles.stateCard}>No matching contact exists in the connected account.</div> : null}
        </section>
      ) : null}

      <ContextLinks active="people" />
    </>
  );
}

function PlacesWorld() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'connect' | 'error'>('loading');

  useEffect(() => {
    let live = true;
    fetch('/api/places', { cache: 'no-store' })
      .then(async (response) => {
        const data = await response.json();
        if (!live) return;
        if (!response.ok || !data.ok) {
          setStatus(data.reason === 'not_signed_in' || data.reason === 'not_connected' || data.reason === 'insufficient_scope' || data.reason === 'revoked' ? 'connect' : 'error');
          return;
        }
        setPlaces(data.places ?? []);
        setStatus('ready');
      })
      .catch(() => live && setStatus('error'));
    return () => { live = false; };
  }, []);

  return (
    <>
      <section className={styles.titleArea}><span>Locations from your schedule</span><h1>Places</h1><p>Only real locations attached to your connected events appear here.</p></section>
      <section className={`${styles.glassPanel} ${styles.placeHero}`}>
        <Matter className={styles.placeMatter} />
        <div><span className={styles.kicker}>Around your real plans</span><h2>Places become part of the day.</h2><p>Open an actual event location directly in Apple Maps.</p></div>
      </section>

      {status === 'loading' ? <div className={styles.stateCard}>Finding locations in your connected calendar…</div> : null}
      {status === 'connect' ? <div className={styles.stateCard}><strong>Calendar not connected</strong><p>Connect Google Calendar to surface locations attached to your real events.</p><Link href="/connections" className={styles.primaryLink}>Open connections <ArrowRight size={15} /></Link></div> : null}
      {status === 'error' ? <div className={styles.stateCard}>Places could not load. No sample locations are being shown.</div> : null}
      {status === 'ready' ? (
        <section className={styles.placeList}>
          {places.map((place) => (
            <article className={`${styles.glassPanel} ${styles.placeCard}`} key={place.id}>
              <span className={styles.placeIcon}><MapPin size={19} /></span>
              <div><strong>{place.name}</strong><span>{place.eventTitle}</span><small>{new Date(place.startAt).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</small></div>
              <a href={place.mapsUrl} target="_blank" rel="noreferrer">Open in Maps <ArrowRight size={14} /></a>
            </article>
          ))}
          {places.length === 0 ? <div className={styles.stateCard}>No upcoming event currently has a location attached.</div> : null}
        </section>
      ) : null}
      <ContextLinks active="places" />
    </>
  );
}

function ResourcesWorld() {
  const personal = usePersonalContext();
  const data = personal.status === 'ready' ? personal.data : null;
  const notes = data?.notes.slice(0, 6) ?? [];
  const active = data?.activeTask ?? null;

  return (
    <>
      <section className={styles.titleArea}><span>Attached to your real work</span><h1>Resources</h1><p>Your saved notes and real Glow systems stay close to the task you are actually working on.</p></section>
      <section className={`${styles.glassPanel} ${styles.resourcesHero}`}>
        <div><span className={styles.kicker}>{active ? 'Current task' : 'No active task'}</span><h2>{active?.title ?? 'Your resources are ready when you are.'}</h2><p>No invented files or project documents are shown. Resources come from your saved Glow data.</p></div>
        <Matter className={styles.resourcesMatter} />
      </section>
      <section className={styles.resourceList}>
        {notes.map((note) => (
          <a href="/notes" key={note.id} className={`${styles.glassPanel} ${styles.resourceRow}`}>
            <span className={styles.resourceIcon}><FileText size={18} /></span><span><strong>{note.title}</strong><small>{note.pinned ? 'Pinned note' : `Updated ${new Date(note.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}</small></span><ArrowRight size={15} />
          </a>
        ))}
        <a href="/tasks" className={`${styles.glassPanel} ${styles.resourceRow}`}><span className={styles.resourceIcon}><Check size={18} /></span><span><strong>Your tasks</strong><small>{data ? `${data.tasks.length} open` : 'Loading'}</small></span><ArrowRight size={15} /></a>
        <a href="/calendar" className={`${styles.glassPanel} ${styles.resourceRow}`}><span className={styles.resourceIcon}><CalendarDays size={18} /></span><span><strong>Your calendar</strong><small>{data ? `${data.events.length} upcoming` : 'Loading'}</small></span><ArrowRight size={15} /></a>
        {personal.status === 'ready' && notes.length === 0 ? <div className={styles.stateCard}>No saved notes were found. Glow has not created placeholder files.</div> : null}
      </section>
      <ContextLinks active="resources" />
    </>
  );
}

function JourneyWorld() {
  const personal = usePersonalContext();
  const data = personal.status === 'ready' ? personal.data : null;
  const active = data?.activeTask ?? null;
  const nextEvent = data?.todayEvents.find((event) => new Date(event.startAt).getTime() >= Date.now()) ?? null;
  const eveningRoutine = data?.routines.find((routine) => routine.timeOfDay === 'evening' || routine.timeOfDay === 'night') ?? null;

  const steps: Array<{ label: string; room: TodayRoom; note: string }> = [
    { label: 'Morning Brief', room: 'morning', note: 'Open your connected morning state' },
    { label: 'What Now', room: 'what-now', note: 'See your real current priorities' },
    { label: active?.title ?? 'No active focus', room: active ? 'focus' : 'what-now', note: active ? 'Continue your current Glow task' : 'Choose a real task when you are ready' },
    { label: nextEvent?.title ?? 'No upcoming event', room: nextEvent ? 'meeting' : 'later', note: nextEvent ? `${new Date(nextEvent.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${nextEvent.location ? ` · ${nextEvent.location}` : ''}` : 'Your calendar is clear' },
    { label: eveningRoutine?.name ?? 'Tonight', room: 'tonight', note: eveningRoutine ? 'Your saved evening routine' : 'See your actual evening' },
  ];

  return (
    <>
      <section className={styles.titleArea}><span>Your connected flow</span><h1>Journey</h1><p>This sequence is built from your actual task, calendar, and routine context.</p></section>
      <section className={`${styles.glassPanel} ${styles.journeyHero}`}>
        <Matter className={styles.journeyMatter} />
        <div><span className={styles.kicker}>Today flow</span><h2>Your day, without placeholders.</h2><p>When something is not scheduled, Glow says so instead of filling the space with someone else’s plans.</p></div>
      </section>
      <section className={styles.journeyPath}>
        {steps.map((step, index) => (
          <button type="button" key={`${step.room}-${index}`} className={`${styles.glassPanel} ${styles.journeyStep}`} onClick={() => hardGo(step.room)}>
            <span className={styles.stepNumber}>{index + 1}</span><span><strong>{step.label}</strong><small>{step.note}</small></span><ArrowRight size={14} />
          </button>
        ))}
      </section>
      <ContextLinks active="journey" />
    </>
  );
}

function GlowPanel({ onClose }: { onClose: () => void }) {
  return (
    <aside className={styles.glowPanel} role="dialog" aria-label="Ask Glow">
      <div className={styles.glowPanelHead}><Matter className={styles.miniMatter} /><div><strong>Glow</strong><span>Your real context stays attached</span></div><button type="button" onClick={onClose}>×</button></div>
      <p>Glow will not invent people, places, files, tasks, or calendar events when data is missing.</p>
      <button type="button" onClick={() => hardGo('what-now')}>What should I do now?</button>
      <button type="button" onClick={() => hardGo('focus')}>Open my focus</button>
      <button type="button" onClick={() => hardGo('tomorrow')}>Show tomorrow</button>
    </aside>
  );
}

export function TodayContextWorlds() {
  const [room, setRoom] = useState<ContextRoom | null>(null);
  const [glowOpen, setGlowOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const value = new URL(window.location.href).searchParams.get('room') as ContextRoom | null;
      setRoom(value === 'focus' || value === 'people' || value === 'places' || value === 'resources' || value === 'journey' ? value : null);
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  if (!room) return null;

  return (
    <div className={`${styles.overlay} ${styles[`room_${room}`]}`}>
      <div className={styles.stage}>
        <div className={styles.causticA} aria-hidden="true" />
        <div className={styles.causticB} aria-hidden="true" />
        <main className={styles.canvas} style={{ paddingTop: 96 }}>
          {room === 'focus' ? <FocusWorld /> : null}
          {room === 'people' ? <PeopleWorld /> : null}
          {room === 'places' ? <PlacesWorld /> : null}
          {room === 'resources' ? <ResourcesWorld /> : null}
          {room === 'journey' ? <JourneyWorld /> : null}
        </main>
      </div>
      {glowOpen ? <GlowPanel onClose={() => setGlowOpen(false)} /> : null}
      <button type="button" className="sr-only" onClick={() => setGlowOpen(true)}>Ask Glow</button>
    </div>
  );
}
