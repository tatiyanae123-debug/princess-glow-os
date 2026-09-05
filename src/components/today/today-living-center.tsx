'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Dumbbell,
  FileText,
  Focus,
  Home,
  MapPin,
  MessageCircle,
  Moon,
  MoreHorizontal,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  SunMedium,
  Utensils,
  Users,
  WandSparkles,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './today-world.module.css';

type RoomKey =
  | 'morning'
  | 'what-now'
  | 'focus'
  | 'meeting'
  | 'next-up'
  | 'later'
  | 'tonight'
  | 'tomorrow'
  | 'replan';

type RoomMeta = {
  key: RoomKey;
  label: string;
  time: string;
  next?: RoomKey;
  prev?: RoomKey;
};

const roomOrder: RoomMeta[] = [
  { key: 'morning', label: 'Morning Brief', time: 'Morning', next: 'what-now' },
  { key: 'what-now', label: 'What Now?', time: 'Now', prev: 'morning', next: 'focus' },
  { key: 'focus', label: 'Focus Session', time: 'Focus', prev: 'what-now', next: 'meeting' },
  { key: 'meeting', label: 'Design Review', time: 'Meeting', prev: 'focus', next: 'next-up' },
  { key: 'next-up', label: 'Next Up', time: '11:00', prev: 'meeting', next: 'later' },
  { key: 'later', label: 'Later', time: 'Afternoon', prev: 'next-up', next: 'tonight' },
  { key: 'tonight', label: 'Tonight', time: 'Evening', prev: 'later', next: 'tomorrow' },
  { key: 'tomorrow', label: 'Tomorrow Preview', time: 'Preview', prev: 'tonight', next: 'replan' },
  { key: 'replan', label: 'Replan My Day', time: 'Adjust', prev: 'tomorrow' },
];

const firstSteps = ['Finish partnership proposal', 'Workout + shower', 'Prepare for design review'];
const meetingPrep = ['Review updated designs (v0.3)', 'Prepare feedback on onboarding flow', 'Confirm decision owners', 'Bring questions about motion and accessibility'];

function Matter({ size = 'md', className = '' }: { size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero'; className?: string }) {
  return <span aria-hidden="true" className={`${styles.matter} ${styles[`matter_${size}`]} ${className}`}><span /></span>;
}

function GlassButton({ children, primary = false, onClick, disabled = false, className = '' }: { children: React.ReactNode; primary?: boolean; onClick?: () => void; disabled?: boolean; className?: string }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={`${styles.glassButton} ${primary ? styles.glassButtonPrimary : ''} ${className}`}>
      {children}
    </button>
  );
}

function CheckRow({ label, checked, onChange, compact = false }: { label: string; checked: boolean; onChange: () => void; compact?: boolean }) {
  return (
    <button type="button" className={`${styles.checkRow} ${compact ? styles.checkRowCompact : ''}`} onClick={onChange} aria-pressed={checked}>
      <span className={`${styles.checkDot} ${checked ? styles.checkDotChecked : ''}`}>{checked ? <Check size={11} /> : null}</span>
      <span>{label}</span>
    </button>
  );
}

function Surface({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`${styles.surface} ${className}`}>{children}</div>;
}

function BackToToday({ onClick }: { onClick: () => void }) {
  return <button type="button" className={styles.backToToday} onClick={onClick}><ArrowLeft size={14} /> Back to Today</button>;
}

export function TodayLivingCenter() {
  const [room, setRoom] = useState<RoomKey>('morning');
  const [travel, setTravel] = useState<'idle' | 'leaving' | 'arriving'>('idle');
  const [shaktiOpen, setShaktiOpen] = useState(false);
  const [receipt, setReceipt] = useState('All changes saved');
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [energy, setEnergy] = useState<'Low' | 'Moderate' | 'Steady'>('Moderate');
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusSeconds, setFocusSeconds] = useState(55 * 60);
  const [replanApplied, setReplanApplied] = useState(false);
  const [clockText, setClockText] = useState('');
  const [dateText, setDateText] = useState('');
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClockText(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
      setDateText(now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const timer = window.setInterval(updateTime, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const syncFromUrl = () => {
      const candidate = new URL(window.location.href).searchParams.get('room') as RoomKey | null;
      if (candidate && roomOrder.some((item) => item.key === candidate)) setRoom(candidate);
    };
    syncFromUrl();
    window.addEventListener('popstate', syncFromUrl);
    return () => window.removeEventListener('popstate', syncFromUrl);
  }, []);

  useEffect(() => {
    if (!focusRunning || focusSeconds <= 0) return;
    const timer = window.setInterval(() => setFocusSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [focusRunning, focusSeconds]);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
  }, []);

  const currentMeta = roomOrder.find((item) => item.key === room) ?? roomOrder[0];
  const focusTime = useMemo(() => {
    const mins = Math.floor(focusSeconds / 60).toString().padStart(2, '0');
    const secs = (focusSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }, [focusSeconds]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, [clockText]);

  function moveTo(next: RoomKey, note = 'Context carried with you') {
    if (next === room || travel !== 'idle') return;
    setTravel('leaving');
    setReceipt(note);
    transitionTimer.current = setTimeout(() => {
      setRoom(next);
      const url = new URL(window.location.href);
      url.searchParams.set('room', next);
      window.history.pushState({}, '', url);
      setTravel('arriving');
      transitionTimer.current = setTimeout(() => setTravel('idle'), 380);
    }, 190);
  }

  function toggle(label: string) {
    setChecked((old) => ({ ...old, [label]: !old[label] }));
    setReceipt('Progress settled into Today');
  }

  function applyReplan() {
    setReplanApplied(true);
    setReceipt('Shakti reorganized the day and preserved its connections');
  }

  return (
    <div className={`${styles.world} ${styles[`climate_${room.replace('-', '_')}`]}`}>
      <div className={styles.auroraWash} aria-hidden="true" />
      <div className={styles.frame}>
        <header className={styles.topbar}>
          <div className={styles.brandGroup}>
            <Link href="/dashboard" className={styles.homeControl} aria-label="Go to Glow OS Home"><Home size={14} /><span>Home</span></Link>
            <strong>Glow OS</strong>
            <span className={styles.topDivider} />
            <span>Batch 1</span>
          </div>
          <div className={styles.worldLabel}>WORLD 1: TODAY · THE LIVING CENTER</div>
          <button type="button" className={styles.askShakti} onClick={() => setShaktiOpen((value) => !value)} aria-expanded={shaktiOpen}>
            <Matter size="xs" />
            <span>Ask Shakti</span>
            <small>⌘ K</small>
          </button>
        </header>

        <aside className={styles.sideRail} aria-label="Today world navigation">
          <button type="button" className={`${styles.railItem} ${room === 'morning' || room === 'what-now' || room === 'next-up' || room === 'later' || room === 'tonight' || room === 'tomorrow' || room === 'replan' ? styles.railItemActive : ''}`} onClick={() => moveTo('morning', 'Returned to Today’s living center')}><Matter size="xs" /><span>Today</span></button>
          <button type="button" className={`${styles.railItem} ${room === 'focus' ? styles.railItemActive : ''}`} onClick={() => moveTo('focus', 'Your active work expanded without losing its time')}><Focus size={18} /><span>Focus</span></button>
          <button type="button" className={`${styles.railItem} ${room === 'meeting' ? styles.railItemActive : ''}`} onClick={() => moveTo('meeting', 'People and meeting context surfaced together')}><Users size={18} /><span>People</span></button>
          <button type="button" className={styles.railItem} onClick={() => moveTo('meeting', 'The meeting kept its place and location')}><MapPin size={18} /><span>Places</span></button>
          <button type="button" className={styles.railItem} onClick={() => moveTo('tomorrow', 'Related resources surfaced with tomorrow')}><FileText size={18} /><span>Resources</span></button>
          <button type="button" className={styles.railItem} onClick={() => moveTo('replan', 'The day unfolded into a guided journey')}><WandSparkles size={18} /><span>Journeys</span></button>
          <Link href="/dashboard" className={styles.railHomeMini} aria-label="Glow OS Home"><Home size={16} /></Link>
        </aside>

        <main className={`${styles.roomCanvas} ${travel === 'leaving' ? styles.roomLeaving : ''} ${travel === 'arriving' ? styles.roomArriving : ''}`} aria-live="polite">
          {room === 'morning' && (
            <section className={styles.morningRoom}>
              <div className={styles.morningTitle}>
                <span className={styles.eyebrow}>{dateText || 'Friday, Sep 4'}</span>
                <h1>Morning Brief</h1>
                <p>A calmer, brighter day begins here.</p>
              </div>

              <Surface className={styles.greetingPanel}>
                <Matter size="md" />
                <div className={styles.greetingCopy}><strong>{greeting}</strong><span>You’ve got this. Let’s ease in.</span></div>
                <div className={styles.greetingTime}><strong>{clockText || '6:06 PM'}</strong><span>A more present you<br />makes a brighter world.</span></div>
              </Surface>

              <Surface className={styles.editorialHero}>
                <div className={styles.editorialScene} aria-hidden="true"><i /><b /><em /></div>
                <div className={styles.editorialHeroCopy}><span>—</span><h2>Same you.<br />A brighter today.</h2><p>Clear mind.<br />Considerate choices.<br />A meaningful day ahead.</p></div>
              </Surface>

              <div className={styles.morningFacts}>
                <Surface className={styles.factCard}><span className={styles.cardLabel}>You woke up</span><SunMedium size={26} strokeWidth={1.4} /><strong>6:48 AM</strong><p>+12 min earlier<br />than usual</p><div className={styles.softMeter}><span /></div></Surface>
                <Surface className={styles.factCard}><span className={styles.cardLabel}>Weather</span><SunMedium size={26} strokeWidth={1.4} /><strong>68°</strong><p>Partly sunny</p><small>H: 74° · L: 56°</small><Matter size="xs" className={styles.cardOrbRight} /></Surface>
                <Surface className={styles.factCard}><span className={styles.cardLabel}>First appointment</span><CalendarDays size={23} strokeWidth={1.5} /><strong className={styles.mediumText}>Workout + shower</strong><p>11:00 – 11:45 AM</p><small>In 1h 19m</small><button className={styles.roundArrow} onClick={() => moveTo('next-up')}><ChevronRight size={15} /></button></Surface>

                <Surface className={`${styles.factCard} ${styles.careCard}`}><span className={styles.cardLabel}>Medication & supplements</span><p>2 items this morning</p><CheckRow label="Vitamin D 1,000 IU" checked={!!checked['Vitamin D 1,000 IU']} onChange={() => toggle('Vitamin D 1,000 IU')} compact /><CheckRow label="Magnesium 200 mg" checked={!!checked['Magnesium 200 mg']} onChange={() => toggle('Magnesium 200 mg')} compact /><GlassButton onClick={() => { toggle('Vitamin D 1,000 IU'); toggle('Magnesium 200 mg'); }}>✓ Mark as taken</GlassButton></Surface>
                <Surface className={`${styles.factCard} ${styles.outfitCard}`}><span className={styles.cardLabel}>Outfit suggestion</span><div className={styles.outfitScene} aria-hidden="true"><span /><b /><i /></div><strong className={styles.mediumText}>Light, clean, comfortable</strong><small>68° · Partly sunny</small><button className={styles.roundArrow}><ChevronRight size={15} /></button></Surface>
                <Surface className={`${styles.factCard} ${styles.foodCard}`}><span className={styles.cardLabel}>Breakfast for you</span><div className={styles.breakfastScene} aria-hidden="true"><span /></div><strong className={styles.mediumText}>Greek yogurt, berries & honey</strong><small>High protein · Steady energy</small><button className={styles.roundArrow}><ChevronRight size={15} /></button></Surface>
              </div>

              <Surface className={styles.firstStepsPanel}>
                <div><span className={styles.cardLabel}>Today’s first steps</span>{firstSteps.map((item, index) => <div className={styles.numberedStep} key={item}><span>{index + 1}</span><CheckRow label={item} checked={!!checked[item]} onChange={() => toggle(item)} compact /></div>)}</div>
                <GlassButton primary onClick={() => moveTo('what-now', 'Shakti gathered the next right step from your day')}><Sparkles size={14} /> Start with intention</GlassButton>
              </Surface>

              <Surface className={styles.morningQuote}><Matter size="sm" /><p>A calmer you<br />creates a kinder today.</p><span>—</span></Surface>
              <Surface className={styles.energyCard}><span className={styles.cardLabel}>Your energy</span><strong>Clear · Steady</strong><p>Good conditions for<br />deep work later.</p><div className={styles.energyWave} /></Surface>
            </section>
          )}

          {room === 'what-now' && (
            <section className={styles.whatNowRoom}>
              <Surface className={styles.whatNowHero}>
                <div className={styles.whatNowIntro}><span className={styles.eyebrow}>{clockText || '6:06 PM'}</span><h1>What now?</h1><h2>Find the next right step for today.</h2><p>A calmer, clearer choice — based on your time, energy, priorities, and what matters now.</p></div>
                <Matter size="xl" className={styles.whatNowMatter} />
                <div className={styles.whatNowPrompt}><MessageCircle size={16} /><span>Share what’s on your mind…</span><button><ArrowRight size={17} /></button></div>
                <div className={styles.promptChips}><button onClick={() => setEnergy('Steady')}>I only have 30 minutes</button><button onClick={() => setEnergy('Low')}>Low energy day</button><button onClick={() => moveTo('meeting')}>Prep for my meeting</button><button onClick={() => moveTo('focus')}>Make progress on design</button></div>
              </Surface>

              <Surface className={styles.stateColumn}>
                <div className={styles.sectionHead}><h3>Your current state</h3><GlassButton onClick={() => setEnergy('Moderate')}>Reset <RotateCcw size={13} /></GlassButton></div>
                {[
                  ['Energy', energy, 'Good for focused work'],
                  ['Time available', '~ 45 minutes', ''],
                  ['Urgency', 'Medium', 'Keep momentum'],
                  ['Protected focus', '55 min remaining', 'Until 11:00 AM'],
                  ['Context', 'At home', 'Deep work environment'],
                ].map(([label, value, detail]) => <button type="button" className={styles.stateTile} key={label}><Matter size="xs" /><span><small>{label}</small><strong>{value}</strong><em>{detail}</em></span><ChevronRight size={14} /></button>)}
              </Surface>

              <Surface className={styles.actionsColumn}>
                <div className={styles.sectionHead}><span><h3>Suggested next actions</h3><p>Curated for your current state</p></span></div>
                {[
                  ['Work on partnership proposal', 'High impact · Fits your time · In focus', 'focus'],
                  ['Prepare for design review', 'Build confidence · 30–45 min · Medium urgency', 'meeting'],
                  ['Organize research notes', 'Quick win · Low energy · Clear next step', 'replan'],
                  ['Reply to key messages', 'Keep things moving · ~20 min · Low effort', 'replan'],
                  ['Plan this week', 'Gain clarity · 30–45 min · Set up success', 'replan'],
                ].map(([label, detail, target], index) => <button type="button" key={label} className={`${styles.actionTile} ${index === 0 ? styles.actionTileSelected : ''}`} onClick={() => moveTo(target as RoomKey)}><Matter size="xs" /><span><strong>{label}</strong><small>{detail}</small></span><ChevronRight size={15} /></button>)}
                <button className={styles.moreOptions}><span>⌘</span> More options <ChevronRight size={14} /></button>
              </Surface>

              <div className={styles.recommendStack}>
                <Surface className={styles.recommendPanel}>
                  <div className={styles.recommendHead}><h3>Recommended for you</h3><span>Best next step</span></div>
                  <h2>Work on partnership proposal</h2>
                  <p>You have focus time, enough energy, and this moves a key priority forward.</p>
                  <Matter size="md" className={styles.recommendOrb} />
                  <ul><li><Check size={13} /> Fits your available time (45 min)</li><li><Check size={13} /> Aligns with your focus window</li><li><Check size={13} /> High impact for this week</li></ul>
                  <GlassButton primary className={styles.fullButton} onClick={() => moveTo('focus', 'The selected task expanded into a protected work environment')}>Start this <ArrowRight size={15} /></GlassButton>
                  <div className={styles.twoButtons}><GlassButton>Save for later</GlassButton><GlassButton onClick={() => moveTo('replan')}>See plan</GlassButton></div>
                </Surface>
                <Surface className={styles.whatNowQuote}><p>“Progress today<br />creates more space<br />tomorrow.”</p><span>—</span><div className={styles.matterRibbon} /></Surface>
              </div>
            </section>
          )}

          {room === 'focus' && (
            <section className={styles.focusRoom}>
              <div className={styles.focusIntro}><BackToToday onClick={() => moveTo('morning')} /><h1>Focus Session</h1><h2>Partnership proposal</h2><p>Deep work. Real progress.</p><div className={styles.metaPills}><span>● Protected time</span><span>55 min left</span><span>Deep work</span></div></div>
              <div className={styles.focusMantra}>A calmer mind<br />builds a brighter tomorrow.</div>

              <Surface className={styles.focusTimerPanel}>
                <div className={styles.focusCopy}><span className={styles.cardLabel}>Focus Session</span><h2>In flow</h2><strong>Partnership proposal</strong><p>You’re in a protected focus block.<br />Distractions are paused.</p><GlassButton onClick={() => setFocusRunning((value) => !value)}>{focusRunning ? <Pause size={16} /> : <Play size={16} />}{focusRunning ? 'Pause' : 'Start'}</GlassButton></div>
                <div className={styles.timerOrb}><Matter size="hero" /><div className={styles.timerText}><strong>{focusTime}</strong><span>remaining</span></div><span className={styles.orbitDot} /></div>
                <div className={styles.timerTools}><button>⌁</button><button>♫</button><button>•••</button></div>
              </Surface>

              <Surface className={styles.focusProgress}><div><h3>Focus progress</h3><p>You’re 72% through this focus block.</p></div><div className={styles.progressTrack}><span /></div><strong>72%</strong><div><small>Time block</small><strong>11:00 AM – 11:45 AM</strong></div></Surface>
              <Surface className={styles.focusEncouragement}><Matter size="sm" /><div><strong>You’ve got this.</strong><p>Focus creates the space for your best ideas.</p></div><span>A more open tomorrow —</span></Surface>

              <div className={styles.focusAside}>
                <Surface className={styles.protectedPanel}><div className={styles.protectedTop}><span>● Protected Focus</span><small>Ends at 11:45 AM</small></div><div className={styles.guardRow}><span className={styles.guardIcon}>◇</span><div><strong>Distraction guard is active</strong><p>Notifications, calls, and non-urgent alerts are silenced during this session.</p><GlassButton>Change settings <ChevronRight size={13} /></GlassButton></div></div></Surface>
                <Surface className={styles.focusList}><h3>Today’s focus</h3><strong>Partnership proposal</strong>{['Draft value proposition', 'Outline partner benefits', 'Review financial model', 'Prepare slides (first draft)', 'Polish executive summary'].map((item) => <CheckRow key={item} label={item} checked={!!checked[item]} onChange={() => toggle(item)} compact />)}</Surface>
                <Surface className={styles.filesPanel}><h3>Needed for this session</h3>{['Partnership_Notes_2024.pdf', 'Market Analysis.key', 'Competitor_Insights.docx'].map((file) => <div className={styles.fileRow} key={file}><FileText size={17} /><span><strong>{file}</strong><small>{file.endsWith('.pdf') ? 'PDF · 2.4 MB' : file.endsWith('.key') ? 'Keynote · 12.1 MB' : 'Word · 1.8 MB'}</small></span><MoreHorizontal size={14} /></div>)}</Surface>
                <Surface className={styles.blockersPanel}><h3>Possible blockers</h3>{[['Follow-up from Alex', 'Scheduled for 12:00 PM (after session)'], ['Design feedback', 'Parked until 2:00 PM']].map(([name, detail]) => <div className={styles.blockerRow} key={name}><span>◔</span><div><strong>{name}</strong><small>{detail}</small></div><button>×</button></div>)}</Surface>
              </div>
            </section>
          )}

          {room === 'meeting' && (
            <section className={styles.meetingRoom}>
              <div className={styles.meetingIntro}><BackToToday onClick={() => moveTo('morning')} /><span className={styles.eyebrow}>Today, Apr 12</span><h1>Design review</h1><h2>1:00 – 2:00 PM <small>(1 hr)</small></h2><p><MapPin size={14} /> The Living Center · Conference Room B</p><div className={styles.metaPills}><span>● Meeting</span><span>● Design</span></div><Matter size="xl" className={styles.meetingHeroMatter} /><em>Good design<br />turns intention<br />into momentum.</em></div>

              <Surface className={styles.participantsPanel}><div className={styles.sectionHead}><h3>Participants <small>6</small></h3><GlassButton>Message all</GlassButton></div><div className={styles.peopleRow}>{['Alex Chen', 'Jordan Lee', 'Taylor Kim', 'Morgan Diaz', 'Riley Wong', 'Sam Patel'].map((person, index) => <div className={styles.person} key={person}><span className={`${styles.avatar} ${styles[`avatar${index + 1}`]}`}>{person.split(' ').map((part) => part[0]).join('')}</span><strong>{person}</strong><small>{index === 0 ? 'Organizer' : index < 4 ? 'Required' : 'Optional'}</small></div>)}</div></Surface>
              <Surface className={styles.prepPanel}><div className={styles.sectionHead}><h3>Prep notes</h3><GlassButton>Edit</GlassButton></div><p>Review latest design direction and get alignment on next steps.<br />Focus on interaction polish, visual systems, and edge cases.</p>{meetingPrep.map((item) => <CheckRow key={item} label={item} checked={!!checked[item]} onChange={() => toggle(item)} compact />)}</Surface>
              <Surface className={styles.agendaPanel}><h3>Agenda <small>4 items · 1 hr</small></h3>{[['Recap & goals', '5 min'], ['Design walkthrough', '25 min'], ['Feedback & discussion', '25 min'], ['Decisions & next steps', '5 min']].map(([label, time], index) => <div className={styles.agendaRow} key={label}><span>{index + 1}</span><strong>{label}</strong><small>{time}</small></div>)}</Surface>

              <div className={styles.meetingAside}>
                <Surface className={styles.joinPanel}><Matter size="sm" /><h3>Join meeting</h3><p>Starts in 17 min</p><GlassButton primary className={styles.fullButton}><Play size={14} /> Join</GlassButton><div className={styles.joinTools}><button>♬<small>Join with audio</small></button><button>⌁<small>Copy link</small></button><button>•••<small>More options</small></button></div></Surface>
                <Surface className={styles.detailsPanel}><h3>Details</h3><div><span>Time</span><strong>Today, Apr 12 · 1:00 – 2:00 PM</strong></div><div><span>Location</span><strong>The Living Center<br /><small>Conference Room B</small></strong><GlassButton>Map</GlassButton></div><div><span>Calendar</span><strong>● Work · Product</strong></div><div><span>Reminder</span><strong>10 minutes before</strong></div></Surface>
                <Surface className={styles.relatedPanel}><div className={styles.sectionHead}><h3>Related files <small>3</small></h3><GlassButton>+ Add</GlassButton></div><div className={styles.relatedGrid}><div className={styles.relatedThumb}><div className={styles.miniRibbon} /><strong>Design review deck</strong><small>Figma · Updated 2h ago</small></div><div className={styles.relatedThumb}><div className={styles.miniLines} /><strong>Feedback notes</strong><small>Notes · Updated 1d ago</small></div><div className={styles.relatedThumb}><Matter size="xs" /><strong>Visual exploration</strong><small>Figma · Updated 3d ago</small></div></div></Surface>
                <Surface className={styles.locationPanel}><div className={styles.sectionHead}><h3>Location & travel</h3><GlassButton>Get directions</GlassButton></div><div className={styles.mapScene}><Matter size="xs" /></div><div><strong>The Living Center</strong><p>Conference Room B<br />Floor 2, West Wing</p></div></Surface>
              </div>
            </section>
          )}

          {room === 'next-up' && (
            <section className={styles.nextRoom}>
              <Surface className={styles.nextHero}>
                <div className={styles.nextIntro}><button className={styles.backPlain} onClick={() => moveTo('morning')}><ArrowLeft size={14} /> Today</button><span className={styles.eyebrow}>11:00 AM</span><h1>NEXT UP</h1><h2>Workout + shower</h2><p>Build and move.<br />Protect your next hour.</p><span className={styles.timePill}>● 55 min remaining</span></div>
                <Matter size="hero" className={styles.nextMatter} />
                <Surface className={styles.nextQuote}><p>“Movement clears<br />mental space.”</p><small>Today flows better.</small></Surface>
                <Surface className={styles.trackPanel}><span>Stay on track</span><strong>1h 18m</strong><p>until design review prep</p><div className={styles.trackWave} /><small>You’re in flow.</small></Surface>
              </Surface>

              <div className={styles.nextTimeline}>
                {[
                  ['11:00 AM', 'Workout + shower', 'Move, reset, and refresh.', '11:00 – 11:45 AM', 'workout'],
                  ['11:45 AM', 'Design review prep', 'Organize notes and refine.', '11:45 AM – 12:30 PM', 'prep'],
                  ['12:30 PM', 'Transition', 'Short reset before the review.', '12:30 – 12:40 PM', 'transition'],
                  ['1:00 PM', 'Design review', 'Present and align.', '1:00 – 2:00 PM', 'meeting'],
                ].map(([time, title, body, range, kind], index) => <div className={styles.nextEventRow} key={title}><span className={styles.timelineTime}>{time}</span><span className={styles.timelineNode} /><Surface className={styles.nextEventCard}><div className={styles.nextEventCopy}><h3>{title}</h3><p>{body}</p><small>{range} <span>{index === 0 || index === 2 ? 'Personal' : index === 1 ? 'Deep work' : 'Meeting'}</span></small></div>{kind === 'workout' ? <><div className={styles.dumbbellObject}><Dumbbell size={50} strokeWidth={1.2} /></div><div className={styles.nextEventActions}><span><Dumbbell size={15} /> Workout <b>30 min</b></span><span><Sparkles size={15} /> Shower + refresh <b>15 min</b></span><GlassButton primary onClick={() => moveTo('focus')}><Play size={13} /> Start block</GlassButton></div></> : kind === 'prep' ? <><div className={styles.glassStack} /><div className={styles.inlineChecks}><CheckRow label="Review latest feedback" checked={!!checked['Review latest feedback']} onChange={() => toggle('Review latest feedback')} compact /><CheckRow label="Update slides" checked={!!checked['Update slides']} onChange={() => toggle('Update slides')} compact /><CheckRow label="Run through flow" checked={!!checked['Run through flow']} onChange={() => toggle('Run through flow')} compact /></div></> : kind === 'transition' ? <><Matter size="sm" /><div className={styles.inlineChecks}><CheckRow label="Quick stretch" checked={!!checked['Quick stretch']} onChange={() => toggle('Quick stretch')} compact /><CheckRow label="Get water" checked={!!checked['Get water']} onChange={() => toggle('Get water')} compact /><CheckRow label="Set intention" checked={!!checked['Set intention']} onChange={() => toggle('Set intention')} compact /></div></> : <><Matter size="sm" /><div className={styles.inlineChecks}><CheckRow label="Join call" checked={!!checked['Join call']} onChange={() => toggle('Join call')} compact /><CheckRow label="Present" checked={!!checked['Present']} onChange={() => toggle('Present')} compact /><CheckRow label="Discuss next steps" checked={!!checked['Discuss next steps']} onChange={() => toggle('Discuss next steps')} compact /></div></>}</Surface></div>)}
                <Surface className={styles.nextBottomQuote}><Matter size="xs" /><p>“A little preparation<br />creates a smoother you.”</p></Surface>
              </div>

              <div className={styles.nextAside}>
                <Surface className={styles.timeToNext}><span className={styles.cardLabel}>Time to next</span><strong>55 min</strong><div className={styles.circularMeter}><span /></div><p>Plenty of time.<br />You’re on schedule.</p></Surface>
                <Surface className={styles.needPanel}><div className={styles.sectionHead}><h3>What you’ll need</h3><small>3 items</small></div>{[['Workout clothes', 'Ready'], ['Towel', 'Ready'], ['Water bottle', 'Ready']].map(([label, detail], index) => <div className={styles.needRow} key={label}><span className={styles.needIcon}>{index === 0 ? '◇' : index === 1 ? '▱' : '⌇'}</span><div><strong>{label}</strong><small>{detail}</small></div><Check size={14} /></div>)}</Surface>
                <GlassButton primary className={styles.openFocusButton} onClick={() => moveTo('focus')}>◎ Open in Focus</GlassButton>
                <button className={styles.moreRound}><MoreHorizontal size={17} /></button>
              </div>
            </section>
          )}

          {room === 'later' && (
            <section className={styles.laterRoom}>
              <Surface className={styles.laterHero}>
                <div className={styles.laterIntro}><button className={styles.backPlain} onClick={() => moveTo('morning')}><ArrowLeft size={14} /> Today</button><span className={styles.eyebrow}>AFTERNOON</span><h1>LATER</h1><p>Collaborate and create.<br />Build on today’s momentum.</p><span className={styles.timePill}>☀ 2h 42m remaining</span></div>
                <Matter size="hero" className={styles.laterMatter} />
                <div className={styles.laterGood}><strong>Good progress today.</strong><p>A focused afternoon ahead.</p></div>
                <Surface className={styles.laterQuote}><p>“Progress compounds<br />in the quiet hours.”</p><span>— Shakti</span><div className={styles.horizonRibbon} /></Surface>
                <div className={styles.laterDate}>Tue, Apr 23 <span>▣ This afternoon⌄</span></div>
              </Surface>

              <div className={styles.laterSignals}>
                <Surface><span className={styles.cardLabel}>Afternoon energy</span><div className={styles.energyWaveWide} /><strong>Steady</strong><p>Good for<br />deep work</p></Surface>
                <Surface><span className={styles.cardLabel}>Focus mode</span><div className={styles.focusGlyph}>◎</div><strong>Deep work</strong><p>2 sessions</p></Surface>
                <Surface><span className={styles.cardLabel}>Goals for later</span><CheckRow label="Design review prep" checked onChange={() => toggle('Design review prep')} compact /><CheckRow label="User research synthesis" checked={!!checked['User research synthesis']} onChange={() => toggle('User research synthesis')} compact /><CheckRow label="Draft next steps" checked={!!checked['Draft next steps']} onChange={() => toggle('Draft next steps')} compact /><Matter size="xs" className={styles.signalOrb} /></Surface>
              </div>

              <div className={styles.laterTimeline}>
                {[
                  ['1:00 PM', 'Design review', 'Share, discuss, and align.', '1:00 – 2:00 PM', 'Design review prep', ['Finalize slides', 'Review feedback', 'Share deck']],
                  ['2:30 PM', 'User research synthesis', 'Turn insights into direction.', '2:30 – 3:30 PM', 'Research notes', ['Synthesize interviews', 'Identify themes', 'Draft key takeaways']],
                  ['4:00 PM', 'Strategy block', 'Plan what’s next.', '4:00 – 5:00 PM', 'Strategy doc', ['Outline proposal', 'Collect references', 'Write first draft']],
                  ['5:30 PM', 'Wrap up', 'Close the day with clarity.', '5:30 – 6:00 PM', 'End-of-day checklist', ['Review progress', 'Update tomorrow', 'Take a breath']],
                ].map(([time, title, body, range, sideTitle, list], index) => <div className={styles.laterEvent} key={String(title)}><span className={styles.timelineTime}>{String(time)}</span><span className={styles.timelineNode} /><Surface className={styles.laterEventCard}><Matter size="sm" /><div className={styles.laterEventCopy}><h3>{String(title)}</h3><p>{String(body)}</p><small>{String(range)} <span>{index === 0 ? 'Meeting' : index < 3 ? 'Deep work' : 'Personal'}</span></small></div><FileText size={24} strokeWidth={1.2} /><div className={styles.laterChecklist}><strong>{String(sideTitle)}</strong>{(list as string[]).map((item) => <CheckRow key={item} label={item} checked={!!checked[item]} onChange={() => toggle(item)} compact />)}</div><GlassButton onClick={() => moveTo(index === 0 ? 'meeting' : 'focus')}>{index === 3 ? 'Mark down' : 'Open'} <ArrowRight size={13} /></GlassButton></Surface></div>)}
              </div>
            </section>
          )}

          {room === 'tonight' && (
            <section className={styles.tonightRoom}>
              <Surface className={styles.tonightHero}>
                <div className={styles.sunsetScene} aria-hidden="true"><span /><i /><b /></div>
                <div className={styles.tonightIntro}><span className={styles.eyebrow}>7:00 PM</span><h1>TONIGHT</h1><p>Unwind and reset.<br />Close the day well.</p><span className={styles.timePill}>☾ Evening mode</span><small>A calmer you<br />for a brighter tomorrow.</small></div>
                <Matter size="hero" className={styles.tonightMatter} />
                <div className={styles.nightTopMessage}><strong>Same day.<br />A softer rhythm.</strong><blockquote>“A peaceful evening<br />builds a brighter tomorrow.”</blockquote><p>Good progress<br />today.<br /><br />Now, take care<br />of you.</p></div>
                <div className={styles.eveningPills}><span><Utensils size={18} /> Dinner<small>7:00 – 8:30 PM</small></span><span>✾ Evening routine<small>9:15 PM</small></span><span><Moon size={18} /> Unwind<small>From 9:30 PM</small></span><span>◯ Leave-ready<small>Target 2h 09m</small></span></div>
              </Surface>

              <Surface className={styles.intentionBar}><div><span className={styles.cardLabel}>This evening’s intention</span><h2>Nourish. Reflect. Recenter.</h2></div><div className={styles.intentionWave} /><div className={styles.whatFeel}>How do you want tonight to feel? <button><ArrowRight size={16} /></button></div></Surface>

              <div className={styles.eveningGrid}>
                <Surface className={styles.eveningCard}><span className={styles.eyebrow}>7:00 – 8:30 PM</span><h2>Dinner with Alex</h2><p>Good food, better company.</p><div className={`${styles.lifestyleImage} ${styles.dinnerImage}`}><span className={styles.photoTag}>⌁ Savor the moment.</span></div>{['Reservation at Lume', 'Share ideas for design direction', 'No work talk after 8:00 PM', 'Take a picture'].map((item, index) => <CheckRow key={item} label={item} checked={index === 0 || !!checked[item]} onChange={() => toggle(item)} compact />)}<GlassButton className={styles.fullButton}>Open in Calendar</GlassButton></Surface>
                <Surface className={styles.eveningCard}><span className={styles.eyebrow}>9:15 PM</span><h2>Evening routine</h2><p>Small rituals. A calmer you.</p><div className={`${styles.lifestyleImage} ${styles.routineImage}`} />{['Shower', 'Skincare', 'Change into comfortable clothes', '10 minutes of reading', 'Set out tomorrow’s outfit'].map((item) => <CheckRow key={item} label={item} checked={!!checked[item]} onChange={() => toggle(item)} compact />)}<GlassButton className={styles.fullButton}>Start routine</GlassButton></Surface>
                <Surface className={styles.eveningCard}><span className={styles.eyebrow}>From 9:30 PM</span><h2>Unwind</h2><p>Slow down. Be here.</p><div className={`${styles.lifestyleImage} ${styles.unwindImage}`} />{['Dim the lights', 'No screens after 10:00 PM', 'Journal or breathe', 'Listen to something calming', 'Gratitude: 3 good things today'].map((item) => <CheckRow key={item} label={item} checked={!!checked[item]} onChange={() => toggle(item)} compact />)}<GlassButton className={styles.fullButton}>Start unwind</GlassButton></Surface>
                <Surface className={styles.eveningCard}><span className={styles.eyebrow}>Target 2h 09m</span><h2>Be leave-ready</h2><p>A smoother tomorrow.</p><div className={`${styles.lifestyleImage} ${styles.readyImage}`}><Matter size="sm" /></div>{['Pack bag', 'Laptop charged', 'Keys, wallet, essentials', 'Prepare tomorrow’s top 3', 'Set alarm'].map((item) => <CheckRow key={item} label={item} checked={!!checked[item]} onChange={() => toggle(item)} compact />)}<GlassButton className={styles.fullButton} onClick={() => moveTo('tomorrow')}>Mark as ready</GlassButton></Surface>
              </div>

              <Surface className={styles.nightFooter}><div><Moon size={16} /><span><strong>Tonight’s wellness</strong><small>Rest well. You’re doing enough.</small></span></div><GlassButton primary onClick={() => moveTo('tomorrow')}><Sparkles size={14} /> End day mindfully</GlassButton><blockquote>“A calmer tonight<br />leads to a brighter tomorrow.”</blockquote><GlassButton><Moon size={13} /> Set wind down⌄</GlassButton></Surface>
            </section>
          )}

          {room === 'tomorrow' && (
            <section className={styles.tomorrowRoom}>
              <Surface className={styles.tomorrowHero}>
                <div className={styles.tomorrowLandscape} aria-hidden="true"><span /><i /><b /></div>
                <div className={styles.tomorrowIntro}><BackToToday onClick={() => moveTo('morning')} /><span className={styles.eyebrow}>TOMORROW</span><h1>Preview</h1><h2>A clear tomorrow<br />creates a lighter today.</h2><p>Here’s what’s ahead, and a gentle<br />head start to help you flow into it.</p><span className={styles.timePill}>● Tomorrow is in view</span></div>
                <Matter size="hero" className={styles.tomorrowMatter} />
                <div className={styles.tomorrowMantra}>A calmer<br />tomorrow<br />starts now.</div>
                <Surface className={styles.tomorrowDate}><span>Tomorrow</span><strong>Sat, Sep 5</strong><div>☀ <b>72°</b><small>Mostly clear<br />A brighter day ahead.</small></div><blockquote>“Preparation is a form of self-care.”</blockquote><span>—</span></Surface>
              </Surface>

              <div className={styles.tomorrowTopCards}>
                <Surface><span className={styles.cardLabel}>First up</span><div className={styles.tomorrowEvent}><Matter size="sm" /><span><small>9:00 AM</small><h3>Leadership sync</h3><p>Align, decide, and move forward.</p><em>Alex, Priya, Marcus +4</em></span><button className={styles.roundArrow}><ChevronRight size={14} /></button></div></Surface>
                <Surface><div className={styles.tomorrowEvent}><Matter size="sm" /><span><small>10:30 AM – 12:00 PM</small><h3>Strategy block</h3><p>Focus on Q2 roadmap and priorities.</p><em>▣ Q2 Strategy · Edited 2h ago</em></span></div></Surface>
                <Surface><span className={styles.cardLabel}>Preview time</span><strong className={styles.previewTime}>12h 18m</strong><div className={styles.previewWave}><span /></div><div className={styles.previewAxis}><span>Now</span><span>Tomorrow</span></div></Surface>
              </div>

              <Surface className={styles.glanceStrip}><h3>Tomorrow at a glance</h3>{[['9:00 AM', 'Leadership sync'], ['10:30 AM', 'Strategy block'], ['1:00 PM', 'Design review'], ['2:30 PM', 'User interviews'], ['5:00 PM', 'Wrap & plan']].map(([time, label], index) => <div className={`${styles.glanceChip} ${styles[`glance${index + 1}`]}`} key={label}><small>{time}</small><strong>{label}</strong></div>)}<GlassButton>View full day <ArrowRight size={13} /></GlassButton></Surface>

              <div className={styles.tomorrowColumns}>
                <Surface><h3>Light preparation</h3><p>A few small steps today can make<br />tomorrow feel effortless.</p>{[['Review Q2 deck', '15 min'], ['Gather latest metrics', '10 min'], ['Send agenda + materials', '5 min'], ['Prep talking points', '15 min'], ['Set up workspace', '5 min']].map(([item, time]) => <div className={styles.prepTimeRow} key={item}><CheckRow label={item} checked={!!checked[item]} onChange={() => toggle(item)} compact /><small>{time} ›</small></div>)}</Surface>
                <Surface><h3>Key context</h3>{['Q2 Strategy', 'Leadership sync agenda', 'Product metrics', 'Customer insights'].map((item, index) => <div className={styles.contextRow} key={item}><span className={styles.contextIcon}>{index === 0 ? '▣' : index === 1 ? '▤' : index === 2 ? '▦' : '▧'}</span><span><strong>{item}</strong><small>{index === 0 ? 'Latest version · 12 slides' : index === 1 ? 'Shared by Alex · Today' : index === 2 ? 'Updated 4h ago' : '3 highlights'}</small></span><ChevronRight size={13} /></div>)}</Surface>
                <Surface><h3>Flow into tomorrow</h3>{[['Wrap current work', 'You’re 1 task away from a clean handoff.', Moon], ['Review tomorrow’s plan', '5 min · Feel prepared, not rushed.', CalendarDays], ['Wind down well', 'A better tomorrow starts with rest.', Sparkles]].map(([label, detail, Icon]) => { const C = Icon as typeof Moon; return <button type="button" className={styles.flowRow} key={String(label)} onClick={() => String(label).includes('plan') ? moveTo('replan') : moveTo('tonight')}><C size={18} /><span><strong>{String(label)}</strong><small>{String(detail)}</small></span><ChevronRight size={14} /></button>; })}</Surface>
              </div>

              <div className={styles.tomorrowFooter}><GlassButton onClick={() => moveTo('later')}>◫ Day view⌃</GlassButton><GlassButton primary onClick={() => moveTo('replan')}><Sparkles size={14} /> I’m ready for tomorrow</GlassButton><span>All changes saved</span><GlassButton>Undo <RotateCcw size={13} /></GlassButton></div>
            </section>
          )}

          {room === 'replan' && (
            <section className={styles.replanRoom}>
              <div className={styles.replanHeader}><button className={styles.replanBack} onClick={() => moveTo('tomorrow')}><ArrowLeft size={16} /></button><div><h1>Replan My Day</h1><p>A calmer, more focused day. You’re in control.</p></div><div className={styles.replanDate}>Today <span>Sep 4, 2026⌄</span><button><MoreHorizontal size={15} /></button></div></div>

              <div className={styles.replanSchedule}>
                {[
                  ['8 AM', 'Morning routine', '8:00 – 8:45 AM', 'morning'],
                  ['9 AM', 'Deep work', '9:00 – 11:00 AM', 'deep'],
                  ['11 AM', 'Design review', replanApplied ? '2:00 – 3:00 PM' : '11:00 – 12:00 PM', replanApplied ? 'resolved' : 'conflict'],
                  ['12 PM', 'Workout + shower', replanApplied ? '10:00 – 11:00 AM' : '11:30 AM – 12:30 PM', 'workout'],
                  ['1 PM', 'Lunch with Sam', '12:30 – 1:30 PM', 'lunch'],
                  ['3 PM', 'User research synthesis', '2:30 – 3:30 PM', 'research'],
                  ['4 PM', 'Strategy block', '4:00 – 5:30 PM', 'strategy'],
                  ['7 PM', 'Dinner with Alex', '7:00 – 8:00 PM', 'dinner'],
                  ['9 PM', 'Evening routine', '8:30 – 9:30 PM', 'evening'],
                ].map(([time, title, range, kind]) => <div className={styles.replanRow} key={title}><span className={styles.replanTime}>{time}</span><div className={`${styles.replanBlock} ${styles[`replan_${kind}`]}`}><span className={styles.blockAccent} /><span><strong>{title}</strong><small>{range}</small></span><Matter size="xs" />{kind === 'conflict' ? <em>! Conflicts<br />with workout</em> : null}</div></div>)}
              </div>

              <div className={styles.replanAside}>
                <Surface className={styles.replanHero}><Matter size="lg" /><div><h2>A better flow<br />is within reach.</h2><p>Move, protect, or reschedule.<br />Preview the changes, then apply.</p></div><div className={styles.replanStats}><span><Clock3 size={16} /><strong>3</strong><small>conflicts resolved</small></span><span>○<strong>+1h</strong><small>focus time</small></span><span>♧<strong>A calmer</strong><small>afternoon</small></span></div></Surface>
                <Surface className={styles.suggestionsPanel}><h3>Suggestions</h3>{[['Move workout earlier', '11:30 AM – 12:30 PM → 10:00 – 11:00 AM', Dumbbell], ['Protect this time', 'Deep work · 9:00 – 11:00 AM', Focus], ['Reschedule design review', '11:00 AM – 12:00 PM → 2:00 – 3:00 PM', CalendarDays]].map(([label, detail, Icon]) => { const C = Icon as typeof Dumbbell; return <div className={styles.suggestionRow} key={String(label)}><C size={17} /><span><strong>{String(label)}</strong><small>{String(detail)}</small></span><GlassButton onClick={applyReplan}>Apply</GlassButton><button><MoreHorizontal size={14} /></button></div>; })}<button className={styles.moreOptions}>✣ Show more options <ChevronRight size={13} /></button></Surface>
                <Surface className={styles.previewPlan}><h3>Preview your day</h3><div><span>Current plan</span><div className={styles.planStrip}><i /><b /><em /><u /><i /><b /></div></div><div><span>Proposed plan</span><div className={`${styles.planStrip} ${styles.planStripProposed}`}><i /><b /><em /><u /><i /><b /></div></div></Surface>
              </div>

              <div className={styles.replanFooter}><div><strong>{replanApplied ? 'Changes previewed' : '4 changes ready'}</strong><span>{replanApplied ? 'Ready to apply to Today.' : 'No changes applied yet.'}</span></div><GlassButton onClick={() => setReplanApplied(false)}><RotateCcw size={14} /> Reset</GlassButton><GlassButton>Save for later</GlassButton><GlassButton primary onClick={() => { applyReplan(); moveTo('morning', 'Aurora receipt: Today reorganized around the calmer plan'); }}><Sparkles size={14} /> Apply changes</GlassButton></div>
            </section>
          )}
        </main>

        <footer className={styles.worldFooter}>
          <button type="button" onClick={() => currentMeta.prev && moveTo(currentMeta.prev)} disabled={!currentMeta.prev}><ArrowLeft size={13} /> Previous</button>
          <div className={styles.orientation}><span>{currentMeta.time}</span><div>{roomOrder.map((item) => <button key={item.key} className={item.key === room ? styles.orientationActive : ''} aria-label={`Move to ${item.label}`} onClick={() => moveTo(item.key)} />)}</div><strong>{currentMeta.label}</strong></div>
          <span className={styles.receipt}><Sparkles size={12} /> {receipt}</span>
          <button type="button" onClick={() => currentMeta.next && moveTo(currentMeta.next)} disabled={!currentMeta.next}>Next <ArrowRight size={13} /></button>
        </footer>
      </div>

      {shaktiOpen ? (
        <div className={styles.shaktiPanel} role="dialog" aria-label="Ask Shakti">
          <div className={styles.shaktiHead}><Matter size="sm" /><div><strong>Shakti</strong><span>Continuous context is active</span></div><button onClick={() => setShaktiOpen(false)}>×</button></div>
          <p>I’m still with the same day, the same active work, and the same unfinished context.</p>
          <GlassButton className={styles.fullButton} onClick={() => { setShaktiOpen(false); moveTo('what-now', 'Shakti gathered your current state'); }}>What should I do now?</GlassButton>
          <GlassButton className={styles.fullButton} onClick={() => { setShaktiOpen(false); moveTo('replan', 'Shakti unfolded the day into an editable time surface'); }}>Replan my day</GlassButton>
          <GlassButton className={styles.fullButton} onClick={() => { setShaktiOpen(false); moveTo('tomorrow', 'Shakti opened tomorrow without leaving Today'); }}>Preview tomorrow</GlassButton>
        </div>
      ) : null}
    </div>
  );
}
