'use client';

import Link from 'next/link';
import {
  Activity,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Pill,
  RotateCcw,
  Sparkles,
  SunMedium,
  Utensils,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import styles from './morning-brief-reference.module.css';
import navStyles from './morning-brief-navigation.module.css';

type RoomKey = 'morning' | 'what-now' | 'focus' | 'meeting' | 'next-up' | 'later' | 'tonight' | 'tomorrow' | 'replan';

const steps = ['Finish partnership proposal', 'Workout + shower', 'Prepare for design review'];

function Pearl({ size = 'md', className = '' }: { size?: 'xs' | 'sm' | 'md' | 'lg'; className?: string }) {
  return <span aria-hidden="true" className={`${styles.pearl} ${styles[`pearl_${size}`]} ${className}`}><i /></span>;
}

function goToRoom(room: RoomKey) {
  const url = new URL(window.location.href);
  url.searchParams.set('room', room);
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function MorningBriefReference() {
  const [visible, setVisible] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [glowOpen, setGlowOpen] = useState(false);
  const [receipt, setReceipt] = useState('');

  useEffect(() => {
    const sync = () => {
      const room = new URL(window.location.href).searchParams.get('room');
      const isMorning = new Date().getHours() < 12;
      setVisible(room === 'morning' || (!room && isMorning));
    };
    sync();
    window.addEventListener('popstate', sync);
    const timer = window.setInterval(sync, 160);
    return () => {
      window.removeEventListener('popstate', sync);
      window.clearInterval(timer);
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

  const hasChanges = Object.values(checked).some(Boolean);

  function toggle(label: string) {
    setChecked((old) => ({ ...old, [label]: !old[label] }));
    setReceipt('Progress saved');
  }

  function markCareTaken() {
    setChecked((old) => ({ ...old, 'Vitamin D 1,000 IU': true, 'Magnesium 200 mg': true }));
    setReceipt('Morning care saved');
  }

  if (!visible) return null;

  return (
    <div className={styles.overlay} data-morning-reference="true">
      <div className={styles.stage}>
        <div className={styles.causticA} aria-hidden="true" />
        <div className={styles.causticB} aria-hidden="true" />

        <header className={styles.topbar}>
          <div className={styles.brandBlock}>
            <Link href="/home" className={styles.brandHome} aria-label="Go to Glow OS Home">Glow OS</Link>
          </div>
          <div className={styles.worldLabel}>TODAY</div>
          <button type="button" className={styles.askShakti} onClick={() => setGlowOpen((value) => !value)} aria-expanded={glowOpen} aria-label="Ask Glow">
            <Pearl size="xs" />
            <span>Ask Glow<small>⌘ K</small></span>
          </button>
        </header>

        <nav className={`${styles.leftRail} ${navStyles.singleAnchorRail}`} aria-label="Today navigation">
          <button type="button" className={`${styles.railItem} ${styles.railActive}`} onClick={() => goToRoom('what-now')}><Pearl size="xs" /><span>Today</span></button>
        </nav>

        <main className={styles.content}>
          <section className={styles.titleBlock}>
            <span>{dateText}</span>
            <h1>Morning Brief</h1>
            <p>A calmer, brighter day begins here.</p>
          </section>

          <section className={`${styles.glassSurface} ${styles.greetingCard}`}>
            <Pearl size="md" />
            <div className={styles.greetingCopy}>
              <strong>Good morning</strong>
              <span>You’ve got this. Let’s ease in.</span>
            </div>
            <div className={styles.greetingTime}>
              <strong>9:41 AM</strong>
              <span>A more present you<br />makes a brighter world.</span>
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
              <h2>Same you.<br />A brighter today.</h2>
              <p>Clear mind.<br />Considerate choices.<br />A meaningful day ahead.</p>
            </div>
          </section>

          <section className={styles.factGrid}>
            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.wakeCard}`}>
              <span className={styles.cardLabel}>You woke up</span>
              <SunMedium className={styles.factIcon} />
              <strong className={styles.bigValue}>6:48 AM</strong>
              <p>+12 min earlier<br />than usual</p>
              <span className={styles.wakeMeter}><i /></span>
            </article>

            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.weatherCard}`}>
              <span className={styles.cardLabel}>Weather</span>
              <SunMedium className={styles.factIcon} />
              <strong className={styles.bigValue}>68°</strong>
              <p>Partly sunny</p>
              <small>H: 74° &nbsp; L: 56°</small>
              <span className={styles.weatherDrop}><Pearl size="sm" /></span>
            </article>

            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.appointmentCard}`}>
              <span className={styles.cardLabel}>First appointment</span>
              <CalendarDays className={styles.factIcon} />
              <strong className={styles.cardTitle}>Workout + shower</strong>
              <p>11:00 – 11:45 AM</p>
              <small>In 1h 19m</small>
              <button type="button" className={styles.circleArrow} onClick={() => goToRoom('next-up')} aria-label="Open next appointment"><ChevronRight /></button>
            </article>

            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.careCard}`}>
              <span className={styles.careHeading}><Pill /><span>Medication & supplements</span></span>
              <p>2 items this morning</p>
              {['Vitamin D 1,000 IU', 'Magnesium 200 mg'].map((label) => (
                <button type="button" key={label} className={styles.careRow} onClick={() => toggle(label)} aria-pressed={!!checked[label]}>
                  <span className={`${styles.checkCircle} ${checked[label] ? styles.checked : ''}`}>{checked[label] ? <Check /> : null}</span>
                  <span>{label}</span>
                </button>
              ))}
              <button type="button" className={styles.markTaken} onClick={markCareTaken}><Check /> Mark as taken</button>
            </article>

            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.outfitCard}`}>
              <span className={styles.cardLabel}>Outfit suggestion</span>
              <div className={styles.outfitVisual} aria-hidden="true">
                <span className={styles.blouse}><i /><b /></span>
                <span className={styles.trousers}><i /></span>
                <span className={styles.shoe} />
                <span className={styles.ring} />
              </div>
              <strong className={styles.cardTitle}>Light, clean, comfortable</strong>
              <small>68° · Partly sunny</small>
              <button type="button" className={styles.circleArrow} aria-label="Open outfit suggestion"><ChevronRight /></button>
            </article>

            <article className={`${styles.glassSurface} ${styles.factCard} ${styles.breakfastCard}`}>
              <span className={styles.breakfastHeading}><Utensils /><span>Breakfast for you</span></span>
              <div className={styles.breakfastVisual} aria-hidden="true">
                <div className={styles.bowl}><span className={styles.granola} /><i className={styles.berryA} /><i className={styles.berryB} /><i className={styles.berryC} /></div>
              </div>
              <strong className={styles.cardTitle}>Greek yogurt, berries<br />& honey</strong>
              <small>High protein · Steady energy</small>
              <button type="button" className={styles.circleArrow} aria-label="Open breakfast suggestion"><ChevronRight /></button>
            </article>
          </section>

          <section className={`${styles.glassSurface} ${styles.firstSteps}`}>
            <div className={styles.firstStepsList}>
              <span className={styles.stepsHeading}><CalendarDays /> Today’s first steps</span>
              {steps.map((label, index) => (
                <button type="button" key={label} className={styles.stepRow} onClick={() => toggle(label)} aria-pressed={!!checked[label]}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span className={styles.stepLabel}>{label}</span>
                  <span className={`${styles.stepCircle} ${checked[label] ? styles.checked : ''}`}>{checked[label] ? <Check /> : null}</span>
                </button>
              ))}
            </div>
            <button type="button" className={styles.intentButton} onClick={() => goToRoom('what-now')}><Sparkles /> Start my day</button>
          </section>

          <section className={`${styles.glassSurface} ${styles.quoteCard}`}>
            <Pearl size="sm" className={styles.quotePearlA} />
            <Pearl size="xs" className={styles.quotePearlB} />
            <span className={styles.quoteMark}>“</span>
            <p>A calmer you<br />creates a kinder today.</p>
            <span className={styles.quoteRule}>—</span>
          </section>

          <section className={`${styles.glassSurface} ${styles.energyCard}`}>
            <span className={styles.energyHeading}><Activity /><span>Your energy</span></span>
            <strong>Clear · Steady</strong>
            <p>Good conditions for<br />deep work later.</p>
            <div className={styles.energyLiquid} aria-hidden="true"><Pearl size="xs" /></div>
          </section>
        </main>

        <div className={`${styles.bottomControls} ${navStyles.simpleBottomControls}`}>
          <button type="button" className={`${styles.bottomButton} ${styles.dayView}`} onClick={() => goToRoom('what-now')}>◫ <span>Day view</span><ChevronDown /></button>
          <button type="button" className={`${styles.bottomButton} ${styles.writeDay}`} onClick={() => setGlowOpen(true)}><Sparkles /> Write to my day</button>
          {receipt ? <span className={styles.saveReceipt} role="status">{receipt}</span> : null}
          {hasChanges ? <button type="button" className={`${styles.bottomButton} ${styles.undoButton}`} onClick={() => { setChecked({}); setReceipt('Changes undone'); }}>Undo <RotateCcw /></button> : null}
          <span className={navStyles.passivePearl} aria-label="Morning Brief is part of Today"><Pearl size="sm" className={styles.bottomPearl} /></span>
        </div>

        {glowOpen ? (
          <aside className={styles.shaktiPanel} role="dialog" aria-label="Ask Glow">
            <div className={styles.shaktiHeader}><Pearl size="sm" /><div><strong>Glow</strong><span>Morning context is active</span></div><button onClick={() => setGlowOpen(false)}>×</button></div>
            <p>Ask for anything directly. You do not need to know where it lives in Glow OS.</p>
            <button onClick={() => goToRoom('what-now')}>Go to Today</button>
            <button onClick={() => goToRoom('focus')}>Open my active focus</button>
            <button onClick={() => goToRoom('replan')}>Replan my day</button>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
