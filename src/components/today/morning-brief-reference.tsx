'use client';

import Link from 'next/link';
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CloudSun,
  RotateCcw,
  Sparkles,
  SunMedium,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import styles from './morning-brief-reference.module.css';
import navStyles from './morning-brief-navigation.module.css';

type RoomKey = 'morning' | 'what-now' | 'focus' | 'meeting' | 'next-up' | 'later' | 'tonight' | 'tomorrow' | 'replan';

function Pearl({ size = 'md', className = '' }: { size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }) {
  return <span aria-hidden="true" className={`${styles.pearl} ${styles[`pearl_${size}`]} ${className}`}><i /></span>;
}

function goToRoom(room: RoomKey) {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.searchParams.set('room', room);
  url.hash = '';
  window.location.assign(url.toString());
}

function fmtTime(value: string) {
  return new Date(value).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function energyText(value: string | null | undefined) {
  if (!value) return 'Not logged';
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function MorningBriefReference() {
  const personal = usePersonalContext();
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [glowOpen, setGlowOpen] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [clockText, setClockText] = useState('');

  useEffect(() => {
    const sync = () => {
      const room = new URL(window.location.href).searchParams.get('room');
      const isMorning = new Date().getHours() < 12;
      setVisible(room === 'morning' || (!room && isMorning));
    };
    const updateClock = () => setClockText(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    sync();
    updateClock();
    window.addEventListener('popstate', sync);
    const roomTimer = window.setInterval(sync, 300);
    const clockTimer = window.setInterval(updateClock, 60_000);
    return () => {
      window.removeEventListener('popstate', sync);
      window.clearInterval(roomTimer);
      window.clearInterval(clockTimer);
    };
  }, []);

  useEffect(() => {
    if (!receipt) return;
    const timer = window.setTimeout(() => setReceipt(''), 2400);
    return () => window.clearTimeout(timer);
  }, [receipt]);

  const dateText = useMemo(() => new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }), []);

  const data = personal.status === 'ready' ? personal.data : null;
  const firstEvent = data?.todayEvents.find((event) => new Date(event.startAt).getTime() >= Date.now()) ?? null;
  const morningRoutine = data?.routines.find((routine) => routine.timeOfDay === 'morning') ?? null;
  const firstHabit = data?.habits[0] ?? null;
  const steps = data?.tasks.slice(0, 3) ?? [];
  const wellness = data?.wellness ?? null;
  const hasChanges = Object.values(checked).some(Boolean);

  function toggle(id: string) {
    setChecked((old) => ({ ...old, [id]: !old[id] }));
    setReceipt('Morning progress noted');
  }

  if (!visible) return null;

  const greetingName = data?.user.name?.split(' ')[0] ?? null;

  return (
    <div className={styles.overlay} data-morning-reference="true">
      <div className={styles.stage}>
        <div className={styles.causticA} aria-hidden="true" />
        <div className={styles.causticB} aria-hidden="true" />

        <header className={styles.topbar} aria-hidden="true">
          <div className={styles.brandBlock}><Link href="/home" className={styles.brandHome} tabIndex={-1}>Glow OS</Link></div>
          <div className={styles.worldLabel}>TODAY</div>
          <span className={styles.askShakti}><Pearl size="xs" /><span>Ask Glow<small>⌘ K</small></span></span>
        </header>

        <nav className={`${styles.leftRail} ${navStyles.singleAnchorRail}`} aria-label="Today navigation">
          <button type="button" className={`${styles.railItem} ${styles.railActive}`} onClick={() => goToRoom('what-now')}><Pearl size="xs" /><span>Today</span></button>
        </nav>

        <main className={styles.content}>
          <section className={styles.titleBlock}>
            <span>{dateText}</span>
            <h1>Morning Brief</h1>
            <p>Your morning, using only information connected to this Glow account.</p>
          </section>

          <section className={`${styles.glassSurface} ${styles.greetingCard}`}>
            <Pearl size="md" />
            <div className={styles.greetingCopy}>
              <strong>Good morning{greetingName ? `, ${greetingName}` : ''}</strong>
              <span>{personal.status === 'ready' ? 'Here is what Glow actually knows about this morning.' : 'Connecting your personal context…'}</span>
            </div>
            <div className={styles.greetingTime}>
              <strong>{clockText}</strong>
              <span>No sample schedule<br />or health data is inserted.</span>
            </div>
          </section>

          <section className={`${styles.glassSurface} ${styles.editorialCard}`}>
            <div className={styles.editorialScene} aria-hidden="true">
              <div className={styles.sunDisc} />
              <div className={styles.cityLine} />
              <div className={styles.plantStem}><i /><b /><em /></div>
              <div className={styles.curtainOne} />
              <div className={styles.curtainTwo} />
            </div>
            <div className={styles.editorialCopy}>
              <span className={styles.shortRule} />
              <h2>Your real day.<br />One calm view.</h2>
              <p>Tasks you saved.<br />Events you scheduled.<br />Routines you actually use.</p>
            </div>
          </section>

          <section className={styles.factGrid}>
            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.wakeCard}`}>
              <span className={styles.cardLabel}>Sleep</span>
              <SunMedium className={styles.factIcon} />
              <strong className={styles.bigValue}>{wellness?.sleepHours != null ? `${wellness.sleepHours}h` : '—'}</strong>
              <p>{wellness?.sleepHours != null ? 'From your latest wellness log' : 'No sleep data logged'}</p>
              <span className={styles.wakeMeter}><i style={{ width: wellness?.sleepHours != null ? `${Math.min(100, (wellness.sleepHours / 9) * 100)}%` : '0%' }} /></span>
            </article>

            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.weatherCard}`}>
              <span className={styles.cardLabel}>Weather</span>
              <CloudSun className={styles.factIcon} />
              <strong className={styles.bigValue}>—</strong>
              <p>Weather is not connected to Glow yet.</p>
              <small>No forecast is being guessed.</small>
              <span className={styles.weatherDrop}><Pearl size="sm" /></span>
            </article>

            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.appointmentCard}`}>
              <span className={styles.cardLabel}>First appointment</span>
              <CalendarDays className={styles.factIcon} />
              <strong className={styles.cardTitle}>{firstEvent?.title ?? 'Nothing scheduled'}</strong>
              <p>{firstEvent ? fmtTime(firstEvent.startAt) : 'Your connected calendar is clear'}</p>
              <small>{firstEvent?.location || (firstEvent ? 'No location attached' : 'No placeholder event')}</small>
              <button type="button" className={styles.circleArrow} onClick={() => goToRoom(firstEvent ? 'meeting' : 'what-now')} aria-label="Open calendar context"><ChevronRight /></button>
            </article>

            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.careCard}`}>
              <span className={styles.careHeading}><Activity /><span>Morning routine</span></span>
              <p>{morningRoutine ? 'From your saved routines' : 'No morning routine is saved'}</p>
              <strong className={styles.cardTitle}>{morningRoutine?.name ?? 'Not set'}</strong>
              <small>{morningRoutine?.description || 'Glow will not invent medication or supplement entries.'}</small>
              {morningRoutine ? <button type="button" className={styles.markTaken} onClick={() => window.location.assign('/routines')}><Check /> Open routine</button> : null}
            </article>

            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.outfitCard}`}>
              <span className={styles.cardLabel}>Habit</span>
              <div className={styles.outfitVisual} aria-hidden="true"><Pearl size="sm" /></div>
              <strong className={styles.cardTitle}>{firstHabit?.name ?? 'No habit selected'}</strong>
              <small>{firstHabit ? `${firstHabit.frequency} · from your saved habits` : 'No sample habit inserted'}</small>
              <button type="button" className={styles.circleArrow} onClick={() => window.location.assign('/habits')} aria-label="Open habits"><ChevronRight /></button>
            </article>

            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.breakfastCard}`}>
              <span className={styles.cardLabel}>Wellness check-in</span>
              <div className={styles.breakfastVisual} aria-hidden="true"><Pearl size="sm" /></div>
              <strong className={styles.cardTitle}>{wellness ? `${energyText(wellness.energy)} energy` : 'Not logged'}</strong>
              <small>{wellness?.mood ? `Mood: ${energyText(wellness.mood)}` : 'Add a wellness entry when you want this personalized.'}</small>
              <button type="button" className={styles.circleArrow} onClick={() => window.location.assign('/wellness')} aria-label="Open wellness"><ChevronRight /></button>
            </article>
          </section>

          <section className={`${styles.glassSurface} ${styles.firstSteps}`}>
            <div className={styles.firstStepsList}>
              <span className={styles.stepsHeading}><CalendarDays /> Your first open tasks</span>
              {steps.length > 0 ? steps.map((task, index) => (
                <button type="button" key={task.id} className={styles.stepRow} onClick={() => toggle(task.id)} aria-pressed={!!checked[task.id]}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span className={styles.stepLabel}>{task.title}</span>
                  <span className={`${styles.stepCircle} ${checked[task.id] ? styles.checked : ''}`}>{checked[task.id] ? <Check /> : null}</span>
                </button>
              )) : <div className={styles.stepRow}><span className={styles.stepNumber}>—</span><span className={styles.stepLabel}>No open Glow tasks</span><span className={styles.stepCircle} /></div>}
            </div>
            <button type="button" className={styles.intentButton} onClick={() => goToRoom('what-now')}><Sparkles /> Start my day</button>
          </section>

          <section className={`${styles.glassSurface} ${styles.quoteCard}`}>
            <Pearl size="sm" className={styles.quotePearlA} />
            <Pearl size="xs" className={styles.quotePearlB} />
            <span className={styles.quoteMark}>“</span>
            <p>Start with what is<br />actually true today.</p>
            <span className={styles.quoteRule}>—</span>
          </section>

          <section className={`${styles.glassSurface} ${styles.energyCard}`}>
            <span className={styles.energyHeading}><Activity /><span>Your energy</span></span>
            <strong>{wellness ? energyText(wellness.energy) : 'Not logged'}</strong>
            <p>{wellness?.notes || 'No wellness note has been added for this account.'}</p>
            <div className={styles.energyLiquid} aria-hidden="true"><Pearl size="xs" /></div>
          </section>
        </main>

        <div className={`${styles.bottomControls} ${navStyles.simpleBottomControls}`}>
          <button type="button" className={`${styles.bottomButton} ${styles.dayView}`} onClick={() => goToRoom('what-now')}>◫ <span>Day view</span><ChevronDown /></button>
          <button type="button" className={`${styles.bottomButton} ${styles.writeDay}`} onClick={() => setGlowOpen(true)}><Sparkles /> Ask Glow</button>
          {receipt ? <span className={styles.saveReceipt} role="status">{receipt}</span> : null}
          {hasChanges ? <button type="button" className={`${styles.bottomButton} ${styles.undoButton}`} onClick={() => { setChecked({}); setReceipt('View changes cleared'); }}>Undo <RotateCcw /></button> : null}
          <span className={navStyles.passivePearl} aria-label="Morning Brief is part of Today"><Pearl size="sm" className={styles.bottomPearl} /></span>
        </div>

        {glowOpen ? (
          <aside className={styles.shaktiPanel} role="dialog" aria-label="Ask Glow">
            <div className={styles.shaktiHeader}><Pearl size="sm" /><div><strong>Glow</strong><span>Your real morning context is active</span></div><button onClick={() => setGlowOpen(false)}>×</button></div>
            <p>Ask using the data connected to your account. Missing weather, health, people, or plans stay visibly unconnected instead of being invented.</p>
            <button onClick={() => goToRoom('what-now')}>Go to Today</button>
            <button onClick={() => goToRoom('focus')}>Open my active focus</button>
            <button onClick={() => goToRoom('replan')}>Replan my day</button>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
