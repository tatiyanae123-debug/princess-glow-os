'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Clock3,
  FileText,
  Focus,
  Mail,
  MapPin,
  MessageCircle,
  Pause,
  Play,
  Route,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
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

function goToRoom(room: TodayRoom) {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.searchParams.set('room', room);
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
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

function Header({ onAskGlow }: { onAskGlow: () => void }) {
  return (
    <header className={styles.topbar}>
      <Link href="/home" className={styles.wordmark}>Glow OS</Link>
      <button type="button" className={styles.todayAnchor} onClick={() => goToRoom('what-now')}>Today</button>
      <button type="button" className={styles.askGlow} onClick={onAskGlow}><Matter className={styles.miniMatter} /><span>Ask Glow</span></button>
    </header>
  );
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
        <button key={item.room} type="button" className={active === item.room ? styles.contextActive : ''} onClick={() => goToRoom(item.room)}>
          {item.icon}<span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

function FocusWorld() {
  const [seconds, setSeconds] = useState(55 * 60);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [running, seconds]);

  const timeText = `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const tasks = ['Finish core proposal', 'Review partner benefits', 'Prepare first draft'];

  return (
    <>
      <section className={styles.titleArea}>
        <span>Active work</span>
        <h1>Focus</h1>
        <p>One thing at a time. Everything you need stays close.</p>
      </section>

      <section className={`${styles.glassPanel} ${styles.focusHero}`}>
        <div className={styles.focusHeroCopy}>
          <span className={styles.kicker}>Partnership proposal</span>
          <h2>In flow</h2>
          <p>Your focus block is protected. Connected people, place, resources, and next steps stay available without leaving the work.</p>
          <button type="button" className={styles.primaryButton} onClick={() => setRunning((value) => !value)}>{running ? <Pause size={17} /> : <Play size={17} />}{running ? 'Pause' : 'Start focus'}</button>
        </div>
        <div className={styles.focusMatterWrap}>
          <Matter className={styles.heroMatter} />
          <div className={styles.timerText}><strong>{timeText}</strong><span>remaining</span></div>
        </div>
      </section>

      <section className={styles.twoCol}>
        <div className={`${styles.glassPanel} ${styles.checklist}`}>
          <span className={styles.sectionLabel}>Right now</span>
          {tasks.map((task) => (
            <button key={task} type="button" onClick={() => setDone((old) => ({ ...old, [task]: !old[task] }))}>
              <span className={`${styles.checkDot} ${done[task] ? styles.checkDone : ''}`}>{done[task] ? <Check size={12} /> : null}</span>
              <span>{task}</span>
            </button>
          ))}
        </div>
        <div className={`${styles.glassPanel} ${styles.focusProgress}`}>
          <span className={styles.sectionLabel}>Focus progress</span>
          <strong>72%</strong>
          <div className={styles.progressTrack}><i /></div>
          <small>Protected until 11:45 AM</small>
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
          setStatus(data.reason === 'not_signed_in' || data.reason === 'not_connected' || data.reason === 'insufficient_scope' ? 'connect' : 'error');
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
        <span>Connected to your real contacts</span>
        <h1>People</h1>
        <p>No sample names. Glow uses the contacts you have actually connected.</p>
      </section>

      <section className={`${styles.glassPanel} ${styles.peopleHero}`}>
        <div><span className={styles.kicker}>Your people</span><h2>Reach the person, not a placeholder.</h2><p>Message opens Apple Messages on your device for contacts with a phone number. Email opens Mail.</p></div>
        <Matter className={styles.peopleMatter} />
      </section>

      <div className={styles.searchBox}><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a contact" /></div>

      {status === 'loading' ? <div className={styles.stateCard}>Loading your connected contacts…</div> : null}
      {status === 'connect' ? (
        <div className={styles.stateCard}><strong>Connect Contacts</strong><p>Your People page will stay empty rather than inventing names. Sign in with Google once to grant read-only Contacts access.</p><Link href="/sign-in" className={styles.primaryLink}>Connect contacts <ArrowRight size={15} /></Link></div>
      ) : null}
      {status === 'error' ? <div className={styles.stateCard}><strong>Contacts could not load.</strong><p>Glow did not replace them with fake people. Try again after your Google connection is available.</p></div> : null}

      {status === 'ready' ? (
        <section className={styles.contactGrid}>
          {filtered.slice(0, 18).map((contact) => (
            <article className={`${styles.glassPanel} ${styles.contactCard}`} key={contact.id}>
              {contact.photoUrl ? <img src={contact.photoUrl} alt="" /> : <span className={styles.avatar}>{initials(contact.name)}</span>}
              <div className={styles.contactCopy}><strong>{contact.name}</strong><span>{contact.organization || contact.email || contact.phone || 'Contact'}</span></div>
              <div className={styles.contactActions}>
                {contact.phone ? <a href={safePhoneHref(contact.phone)} aria-label={`Message ${contact.name}`}><MessageCircle size={16} /><span>Message</span></a> : null}
                {contact.email ? <a href={`mailto:${contact.email}`} aria-label={`Email ${contact.name}`}><Mail size={16} /><span>Email</span></a> : null}
              </div>
            </article>
          ))}
          {filtered.length === 0 ? <div className={styles.stateCard}>No matching connected contacts.</div> : null}
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
          setStatus(data.reason === 'not_signed_in' || data.reason === 'not_connected' || data.reason === 'insufficient_scope' ? 'connect' : 'error');
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
      <section className={styles.titleArea}><span>Real locations from your schedule</span><h1>Places</h1><p>Where you are going should live beside what you are doing.</p></section>
      <section className={`${styles.glassPanel} ${styles.placeHero}`}>
        <Matter className={styles.placeMatter} />
        <div><span className={styles.kicker}>Today around you</span><h2>Places become part of the plan.</h2><p>Upcoming calendar locations appear here and open directly in Apple Maps.</p></div>
      </section>

      {status === 'loading' ? <div className={styles.stateCard}>Finding places in your connected calendar…</div> : null}
      {status === 'connect' ? <div className={styles.stateCard}><strong>Connect your calendar</strong><p>Glow needs your signed-in Google Calendar connection to show real upcoming places.</p><Link href="/sign-in" className={styles.primaryLink}>Connect calendar <ArrowRight size={15} /></Link></div> : null}
      {status === 'error' ? <div className={styles.stateCard}>Places could not load right now.</div> : null}
      {status === 'ready' ? (
        <section className={styles.placeList}>
          {places.map((place) => (
            <article className={`${styles.glassPanel} ${styles.placeCard}`} key={place.id}>
              <span className={styles.placeIcon}><MapPin size={19} /></span>
              <div><strong>{place.name}</strong><span>{place.eventTitle}</span><small>{new Date(place.startAt).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit' })}</small></div>
              <a href={place.mapsUrl} target="_blank" rel="noreferrer">Open in Maps <ArrowRight size={14} /></a>
            </article>
          ))}
          {places.length === 0 ? <div className={styles.stateCard}>No upcoming calendar locations were found. Glow will show places here as soon as an event has a location.</div> : null}
        </section>
      ) : null}
      <ContextLinks active="places" />
    </>
  );
}

const resources = [
  { title: 'Proposal working notes', type: 'Focus notes', icon: <FileText size={18} /> },
  { title: 'Partner benefit outline', type: 'Working draft', icon: <BriefcaseBusiness size={18} /> },
  { title: 'Design review prep', type: 'Meeting context', icon: <Users size={18} /> },
  { title: 'Today schedule', type: 'Time context', icon: <CalendarDays size={18} /> },
];

function ResourcesWorld() {
  return (
    <>
      <section className={styles.titleArea}><span>Attached to the work</span><h1>Resources</h1><p>Files, notes, and supporting context stay near the thing they belong to.</p></section>
      <section className={`${styles.glassPanel} ${styles.resourcesHero}`}>
        <div><span className={styles.kicker}>Partnership proposal</span><h2>Everything needed for this focus block.</h2><p>Resources are contextual, not a separate filing cabinet you have to browse first.</p></div>
        <Matter className={styles.resourcesMatter} />
      </section>
      <section className={styles.resourceList}>
        {resources.map((resource) => (
          <button type="button" key={resource.title} className={`${styles.glassPanel} ${styles.resourceRow}`}>
            <span className={styles.resourceIcon}>{resource.icon}</span><span><strong>{resource.title}</strong><small>{resource.type}</small></span><ArrowRight size={15} />
          </button>
        ))}
      </section>
      <ContextLinks active="resources" />
    </>
  );
}

const journeySteps: Array<{ label: string; room: TodayRoom; note: string }> = [
  { label: 'Morning Brief', room: 'morning', note: 'Open the day' },
  { label: 'What Now', room: 'what-now', note: 'Choose the next right step' },
  { label: 'Focus', room: 'focus', note: 'Do the work' },
  { label: 'Design Review', room: 'meeting', note: 'Meet with context' },
  { label: 'Tonight', room: 'tonight', note: 'Close the day' },
];

function JourneyWorld() {
  return (
    <>
      <section className={styles.titleArea}><span>Your connected flow</span><h1>Journey</h1><p>A journey is a meaningful sequence through your day, not another menu.</p></section>
      <section className={`${styles.glassPanel} ${styles.journeyHero}`}>
        <Matter className={styles.journeyMatter} />
        <div><span className={styles.kicker}>Today flow</span><h2>From intention to completion.</h2><p>Each step opens directly. Glow keeps the path connected so you do not lose what came before.</p></div>
      </section>
      <section className={styles.journeyPath}>
        {journeySteps.map((step, index) => (
          <button type="button" key={step.label} className={`${styles.glassPanel} ${styles.journeyStep}`} onClick={() => goToRoom(step.room)}>
            <span className={styles.stepNumber}>{index + 1}</span><span><strong>{step.label}</strong><small>{step.note}</small></span><ArrowRight size={15} />
          </button>
        ))}
      </section>
      <ContextLinks active="journey" />
    </>
  );
}

export function TodayContextWorlds() {
  const [room, setRoom] = useState<ContextRoom | null>(null);
  const [askGlowOpen, setAskGlowOpen] = useState(false);

  useEffect(() => {
    const sync = () => {
      const current = new URL(window.location.href).searchParams.get('room');
      setRoom(current === 'focus' || current === 'people' || current === 'places' || current === 'resources' || current === 'journey' ? current : null);
    };
    sync();
    window.addEventListener('popstate', sync);
    const timer = window.setInterval(sync, 160);
    return () => { window.removeEventListener('popstate', sync); window.clearInterval(timer); };
  }, []);

  if (!room) return null;

  return (
    <div className={`${styles.overlay} ${styles[`room_${room}`]}`}>
      <div className={styles.stage}>
        <div className={styles.causticA} aria-hidden="true" /><div className={styles.causticB} aria-hidden="true" />
        <Header onAskGlow={() => setAskGlowOpen(true)} />
        <main className={styles.canvas}>
          {room === 'focus' ? <FocusWorld /> : null}
          {room === 'people' ? <PeopleWorld /> : null}
          {room === 'places' ? <PlacesWorld /> : null}
          {room === 'resources' ? <ResourcesWorld /> : null}
          {room === 'journey' ? <JourneyWorld /> : null}
        </main>
      </div>

      {askGlowOpen ? (
        <aside className={styles.glowPanel} role="dialog" aria-label="Ask Glow">
          <div className={styles.glowPanelHead}><Matter className={styles.miniMatter} /><div><strong>Glow</strong><span>Current context stays attached.</span></div><button onClick={() => setAskGlowOpen(false)}>×</button></div>
          <p>Tell me what you want. You do not need to know which page or system owns it.</p>
          <button onClick={() => { setAskGlowOpen(false); goToRoom('what-now'); }}>What should I do now?</button>
          <button onClick={() => { setAskGlowOpen(false); goToRoom('people'); }}>Show my people</button>
          <button onClick={() => { setAskGlowOpen(false); goToRoom('places'); }}>Show my places</button>
          <button onClick={() => { setAskGlowOpen(false); goToRoom('resources'); }}>Show my resources</button>
        </aside>
      ) : null}
    </div>
  );
}
