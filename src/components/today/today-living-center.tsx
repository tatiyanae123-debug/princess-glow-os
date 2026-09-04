'use client';

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Dumbbell,
  FileText,
  Focus,
  HeartHandshake,
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
  TimerReset,
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
  { key: 'morning', label: 'Morning brief', time: 'Morning', next: 'what-now' },
  { key: 'what-now', label: 'What now?', time: 'Now', prev: 'morning', next: 'focus' },
  { key: 'focus', label: 'Focus session', time: '11:00', prev: 'what-now', next: 'meeting' },
  { key: 'meeting', label: 'Design review', time: '1:00', prev: 'focus', next: 'next-up' },
  { key: 'next-up', label: 'Next up', time: '11:00', prev: 'meeting', next: 'later' },
  { key: 'later', label: 'Later', time: 'Afternoon', prev: 'next-up', next: 'tonight' },
  { key: 'tonight', label: 'Tonight', time: 'Evening', prev: 'later', next: 'tomorrow' },
  { key: 'tomorrow', label: 'Tomorrow preview', time: 'Preview', prev: 'tonight', next: 'replan' },
  { key: 'replan', label: 'Replan my day', time: 'Adjust', prev: 'tomorrow' },
];

const taskLabels = ['Finish partnership proposal', 'Workout + shower', 'Prepare for design review'];
const prepItems = ['Review updated designs', 'Prepare feedback on onboarding flow', 'Confirm decision owners', 'Bring questions about motion and accessibility'];

function Matter({ className = '', small = false }: { className?: string; small?: boolean }) {
  return <span aria-hidden="true" className={`${styles.matter} ${small ? styles.matterSmall : ''} ${className}`} />;
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <button type="button" className={styles.checkRow} onClick={onChange} aria-pressed={checked}>
      <span className={`${styles.checkDot} ${checked ? styles.checkDotOn : ''}`}>{checked ? <Check size={12} /> : null}</span>
      <span>{label}</span>
    </button>
  );
}

function GlassButton({ children, onClick, primary = false, disabled = false }: { children: React.ReactNode; onClick?: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <button type="button" className={`${styles.glassButton} ${primary ? styles.primaryButton : ''}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

export function TodayLivingCenter() {
  const [room, setRoom] = useState<RoomKey>('morning');
  const [travel, setTravel] = useState<'idle' | 'leaving' | 'arriving'>('idle');
  const [shaktiOpen, setShaktiOpen] = useState(false);
  const [receipt, setReceipt] = useState('All changes saved');
  const [focusSeconds, setFocusSeconds] = useState(55 * 60);
  const [focusRunning, setFocusRunning] = useState(false);
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});
  const [energy, setEnergy] = useState<'Low' | 'Moderate' | 'Steady'>('Moderate');
  const [replanApplied, setReplanApplied] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const syncFromUrl = () => {
      const value = new URL(window.location.href).searchParams.get('room') as RoomKey | null;
      if (value && roomOrder.some((item) => item.key === value)) setRoom(value);
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
    const minutes = Math.floor(focusSeconds / 60).toString().padStart(2, '0');
    const seconds = (focusSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [focusSeconds]);

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
      transitionTimer.current = setTimeout(() => setTravel('idle'), 360);
    }, 180);
  }

  function toggleChecked(label: string) {
    setCheckedTasks((old) => ({ ...old, [label]: !old[label] }));
    setReceipt('Progress settled into Today');
  }

  function applyReplan() {
    setReplanApplied(true);
    setReceipt('Shakti reorganized Today and preserved every connection');
  }

  const roomClass = `${styles.roomStage} ${styles[`climate_${room.replace('-', '_')}`]} ${travel === 'leaving' ? styles.roomLeaving : ''} ${travel === 'arriving' ? styles.roomArriving : ''}`;

  return (
    <div className={styles.world}>
      <div className={styles.ambientA} aria-hidden="true" />
      <div className={styles.ambientB} aria-hidden="true" />
      <header className={styles.topbar}>
        <div className={styles.brand}><strong>Glow OS</strong><span>•</span><span>World 1: Today</span></div>
        <div className={styles.worldTitle}>THE LIVING CENTER</div>
        <button type="button" className={styles.askShakti} onClick={() => setShaktiOpen((value) => !value)} aria-expanded={shaktiOpen}>
          <Matter small />
          <span>Ask Shakti</span>
          <span className={styles.shortcut}>⌘ K</span>
        </button>
      </header>

      <aside className={styles.sideRail} aria-label="Living Center navigation">
        <button type="button" className={`${styles.railItem} ${room === 'morning' || room === 'what-now' || room === 'next-up' || room === 'later' || room === 'tonight' || room === 'tomorrow' || room === 'replan' ? styles.railActive : ''}`} onClick={() => moveTo('morning', 'Returned to the current day anchor')}><SunMedium size={19} /><span>Today</span></button>
        <button type="button" className={`${styles.railItem} ${room === 'focus' ? styles.railActive : ''}`} onClick={() => moveTo('focus', 'Your active work stayed attached to its time')}><Focus size={19} /><span>Focus</span></button>
        <button type="button" className={`${styles.railItem} ${room === 'meeting' ? styles.railActive : ''}`} onClick={() => moveTo('meeting', 'People and meeting context surfaced together')}><Users size={19} /><span>People</span></button>
        <button type="button" className={styles.railItem} onClick={() => moveTo('meeting', 'The meeting location remained attached')}><MapPin size={19} /><span>Places</span></button>
        <button type="button" className={styles.railItem} onClick={() => moveTo('tomorrow', 'Tomorrow’s files and context surfaced')}><FileText size={19} /><span>Resources</span></button>
        <button type="button" className={styles.railItem} onClick={() => moveTo('replan', 'The day unfolded into a planning surface')}><WandSparkles size={19} /><span>Journeys</span></button>
      </aside>

      <main className={roomClass} aria-live="polite">
        <div className={styles.depthPlane} aria-hidden="true" />
        {room === 'morning' && (
          <section className={styles.morningLayout}>
            <div className={styles.heroCopy}>
              <span className={styles.kicker}>Friday, Sep 4</span>
              <h1>Morning Brief</h1>
              <p>A calmer, brighter day begins here.</p>
            </div>
            <div className={`${styles.surface} ${styles.greetingSurface}`}>
              <Matter />
              <div><strong>Good afternoon</strong><p>You’ve got this. Let’s ease in.</p></div>
              <div className={styles.timeText}><strong>5:24 PM</strong><span>A more present you makes a brighter world.</span></div>
            </div>
            <div className={`${styles.surface} ${styles.editorialWindow}`}>
              <div className={styles.sunWindow} aria-hidden="true" />
              <div className={styles.editorialText}><span>—</span><h2>Same you.<br />A brighter today.</h2><p>Clear mind.<br />Considerate choices.<br />A meaningful day ahead.</p></div>
            </div>
            <div className={styles.morningGrid}>
              <article className={styles.surface}><span className={styles.kicker}>You woke up</span><SunMedium size={28} /><strong className={styles.metric}>6:48 AM</strong><p>+12 min earlier than usual</p></article>
              <article className={styles.surface}><span className={styles.kicker}>Weather</span><SunMedium size={28} /><strong className={styles.metric}>68°</strong><p>Partly sunny • H 74° / L 56°</p></article>
              <article className={styles.surface}><span className={styles.kicker}>First appointment</span><CalendarDays size={24} /><strong>Workout + shower</strong><p>11:00 – 11:45 AM</p><GlassButton onClick={() => moveTo('next-up')}>Open <ChevronRight size={15} /></GlassButton></article>
              <article className={styles.surface}><span className={styles.kicker}>Morning care</span><p>2 items this morning</p><CheckRow label="Vitamin D" checked={!!checkedTasks['Vitamin D']} onChange={() => toggleChecked('Vitamin D')} /><CheckRow label="Magnesium" checked={!!checkedTasks['Magnesium']} onChange={() => toggleChecked('Magnesium')} /></article>
              <article className={styles.surface}><span className={styles.kicker}>Outfit suggestion</span><div className={styles.outfitGlyph}>⌇</div><strong>Light, clean, comfortable</strong><p>68° • Partly sunny</p></article>
              <article className={styles.surface}><span className={styles.kicker}>Breakfast for you</span><div className={styles.foodScene} aria-hidden="true" /><strong>Greek yogurt, berries & honey</strong><p>High protein • Steady energy</p></article>
            </div>
            <div className={`${styles.surface} ${styles.firstSteps}`}><div><span className={styles.kicker}>Today’s first steps</span>{taskLabels.map((label) => <CheckRow key={label} label={label} checked={!!checkedTasks[label]} onChange={() => toggleChecked(label)} />)}</div><GlassButton primary onClick={() => moveTo('what-now', 'Shakti gathered the next decision from your day')}>What should I do now? <Sparkles size={16} /></GlassButton></div>
            <div className={`${styles.surface} ${styles.quoteSurface}`}><Matter small /><p>A calmer you creates a kinder today.</p></div>
          </section>
        )}

        {room === 'what-now' && (
          <section className={styles.whatNowLayout}>
            <div className={`${styles.surface} ${styles.whatNowHero}`}>
              <div><span className={styles.kicker}>5:24 PM</span><h1>What now?</h1><p>Find the next right step for today.</p><small>A calmer, clearer choice based on your time, energy, priorities, and what matters now.</small></div>
              <Matter className={styles.largeMatter} />
              <div className={styles.promptBox}><MessageCircle size={18} /><span>Share what’s on your mind…</span><ArrowRight size={18} /></div>
              <div className={styles.promptChips}><button onClick={() => setEnergy('Steady')}>I only have 30 minutes</button><button onClick={() => setEnergy('Low')}>Low energy day</button><button onClick={() => moveTo('meeting')}>Prep for my meeting</button><button onClick={() => moveTo('focus')}>Make progress on design</button></div>
            </div>
            <div className={`${styles.surface} ${styles.stateColumn}`}><div className={styles.sectionHeading}><h3>Your current state</h3><GlassButton onClick={() => setEnergy('Moderate')}>Reset <RotateCcw size={14} /></GlassButton></div>{[['Energy', energy], ['Time available', '~ 45 minutes'], ['Urgency', 'Medium'], ['Protected focus', '55 min remaining'], ['Context', 'At home']].map(([a, b]) => <div className={styles.stateRow} key={a}><Matter small /><div><span>{a}</span><strong>{b}</strong></div><ChevronRight size={17} /></div>)}</div>
            <div className={`${styles.surface} ${styles.actionColumn}`}><div className={styles.sectionHeading}><div><h3>Suggested next actions</h3><p>Curated for your current state</p></div></div>{['Work on partnership proposal', 'Prepare for design review', 'Organize research notes', 'Reply to key messages', 'Plan this week'].map((label, index) => <button type="button" key={label} className={`${styles.actionRow} ${index === 0 ? styles.actionRowActive : ''}`} onClick={() => moveTo(index === 0 ? 'focus' : index === 1 ? 'meeting' : 'replan')}><Matter small /><div><strong>{label}</strong><span>{index === 0 ? 'High impact · Fits your time · In focus' : index === 1 ? '30–45 min · Medium urgency' : 'Clear next step · Low friction'}</span></div><ChevronRight size={17} /></button>)}</div>
            <div className={`${styles.surface} ${styles.recommendColumn}`}><span className={styles.badge}>Best next step</span><h2>Work on partnership proposal</h2><p>You have focus time, enough energy, and this moves a key priority forward.</p><ul><li><Check size={15} /> Fits your available time</li><li><Check size={15} /> Aligns with your focus window</li><li><Check size={15} /> High impact for this week</li></ul><Matter /><GlassButton primary onClick={() => moveTo('focus', 'The selected task expanded into a protected work environment')}>Start this <ArrowRight size={16} /></GlassButton><div className={styles.splitButtons}><GlassButton>Save for later</GlassButton><GlassButton onClick={() => moveTo('replan')}>See plan</GlassButton></div></div>
          </section>
        )}

        {room === 'focus' && (
          <section className={styles.focusLayout}>
            <div className={styles.focusHeader}><button type="button" className={styles.backLink} onClick={() => moveTo('what-now')}><ArrowLeft size={16} /> Back to Today</button><h1>Focus Session</h1><h2>Partnership proposal</h2><p>Deep work. Real progress.</p><div className={styles.chipRow}><span>● Protected time</span><span>55 min left</span><span>Deep work</span></div></div>
            <div className={`${styles.surface} ${styles.timerSurface}`}><div className={styles.flowCopy}><span className={styles.kicker}>Focus Session</span><h2>In flow</h2><p>Partnership proposal</p><small>You’re in a protected focus block. Distractions are paused.</small><GlassButton onClick={() => setFocusRunning((value) => !value)}>{focusRunning ? <Pause size={18} /> : <Play size={18} />}{focusRunning ? 'Pause' : 'Start'}</GlassButton></div><div className={styles.timerMatter}><Matter /><div className={styles.timerText}><strong>{focusTime}</strong><span>remaining</span></div></div></div>
            <div className={`${styles.surface} ${styles.focusProgress}`}><div><strong>Focus progress</strong><p>You’re 72% through this focus block.</p></div><div className={styles.progressTrack}><span style={{ width: '72%' }} /></div><strong>72%</strong><div><span>Time block</span><strong>11:00 AM – 11:45 AM</strong></div></div>
            <aside className={styles.focusAside}><div className={styles.surface}><span className={styles.kicker}>Protected Focus</span><strong>Distraction guard is active</strong><p>Notifications, calls, and non-urgent alerts are silenced during this session.</p></div><div className={styles.surface}><h3>Today’s focus</h3>{['Draft value proposition', 'Outline partner benefits', 'Review financial model', 'Prepare slides', 'Polish executive summary'].map((label) => <CheckRow key={label} label={label} checked={!!checkedTasks[label]} onChange={() => toggleChecked(label)} />)}</div><div className={styles.surface}><h3>Needed for this session</h3>{['Partnership Notes.pdf', 'Market Analysis.key', 'Competitor Insights.docx'].map((label) => <div className={styles.fileRow} key={label}><FileText size={18} /><span>{label}</span><MoreHorizontal size={16} /></div>)}</div><GlassButton primary onClick={() => moveTo('meeting', 'Focus context stayed connected to the next meeting')}>Open design review <ArrowRight size={16} /></GlassButton></aside>
          </section>
        )}

        {room === 'meeting' && (
          <section className={styles.meetingLayout}>
            <div className={styles.meetingHero}><button type="button" className={styles.backLink} onClick={() => moveTo('later')}><ArrowLeft size={16} /> Back to Today</button><span className={styles.kicker}>Today</span><h1>Design review</h1><h2>1:00 – 2:00 PM <small>(1 hr)</small></h2><p><MapPin size={16} /> The Living Center · Conference Room B</p><Matter className={styles.meetingMatter} /></div>
            <div className={`${styles.surface} ${styles.participants}`}><div className={styles.sectionHeading}><h3>Participants <small>6</small></h3><GlassButton>Message all</GlassButton></div><div className={styles.peopleRow}>{['Alex Chen', 'Jordan Lee', 'Taylor Kim', 'Morgan Diaz', 'Riley Wong', 'Sam Patel'].map((person, i) => <div key={person} className={styles.person}><span className={styles.avatar}>{person.split(' ').map((x) => x[0]).join('')}</span><strong>{person}</strong><small>{i === 0 ? 'Organizer' : i < 4 ? 'Required' : 'Optional'}</small></div>)}</div></div>
            <div className={`${styles.surface} ${styles.prepNotes}`}><div className={styles.sectionHeading}><h3>Prep notes</h3><GlassButton>Edit</GlassButton></div><p>Review latest design direction and get alignment on next steps. Focus on interaction polish, visual systems, and edge cases.</p>{prepItems.map((label) => <CheckRow key={label} label={label} checked={!!checkedTasks[label]} onChange={() => toggleChecked(label)} />)}</div>
            <div className={`${styles.surface} ${styles.agenda}`}><h3>Agenda <small>4 items · 1 hr</small></h3>{[['Recap & goals', '5 min'], ['Design walkthrough', '25 min'], ['Feedback & discussion', '25 min'], ['Decisions & next steps', '5 min']].map(([label, time], index) => <div className={styles.agendaRow} key={label}><span>{index + 1}</span><strong>{label}</strong><small>{time}</small></div>)}</div>
            <aside className={styles.meetingAside}><div className={`${styles.surface} ${styles.joinSurface}`}><Matter /><h3>Join meeting</h3><p>Starts in 17 min</p><GlassButton primary><Play size={16} /> Join</GlassButton></div><div className={styles.surface}><h3>Details</h3><div className={styles.detailRow}><span>Time</span><strong>Today · 1:00 – 2:00 PM</strong></div><div className={styles.detailRow}><span>Location</span><strong>The Living Center</strong></div><div className={styles.detailRow}><span>Reminder</span><strong>10 minutes before</strong></div></div><div className={styles.surface}><h3>Related files</h3><div className={styles.relatedFiles}><div>Design review deck</div><div>Feedback notes</div><div>Visual exploration</div></div></div><GlassButton primary onClick={() => moveTo('next-up', 'The meeting collapsed back into the day timeline')}>Return to the day <ArrowRight size={16} /></GlassButton></aside>
          </section>
        )}

        {room === 'next-up' && (
          <section className={styles.nextLayout}>
            <div className={`${styles.surface} ${styles.nextHero}`}><div><button type="button" className={styles.backLink} onClick={() => moveTo('morning')}><ArrowLeft size={16} /> Today</button><span className={styles.kicker}>11:00 AM</span><h1>NEXT UP</h1><h2>Workout + shower</h2><p>Build and move. Protect your next hour.</p><span className={styles.badge}>55 min remaining</span></div><Matter className={styles.wideMatter} /><blockquote>“Movement clears mental space.”<small>Today flows better.</small></blockquote><div><span className={styles.kicker}>Stay on track</span><strong className={styles.metric}>1h 18m</strong><p>until design review prep</p></div></div>
            <div className={styles.timeline}><span className={styles.timelineLine} />{[['11:00 AM', 'Workout + shower', 'Move, reset, and refresh.', '11:00 – 11:45 AM'], ['11:45 AM', 'Design review prep', 'Organize notes and refine.', '11:45 AM – 12:30 PM'], ['12:30 PM', 'Transition', 'Short reset before the review.', '12:30 – 12:40 PM'], ['1:00 PM', 'Design review', 'Present and align.', '1:00 – 2:00 PM']].map(([time, title, body, range], index) => <article key={title} className={`${styles.surface} ${styles.timelineItem}`}><span className={styles.timelineTime}>{time}</span><span className={styles.timelineNode} /><div><h3>{title}</h3><p>{body}</p><small>{range}</small></div>{index === 0 ? <div className={styles.nextActions}><span><Dumbbell size={17} /> Workout · 30 min</span><span><Sparkles size={17} /> Shower + refresh · 15 min</span><GlassButton primary onClick={() => moveTo('focus', 'The active block expanded into a guided surface')}><Play size={15} /> Start block</GlassButton></div> : <Matter small />}</article>)}</div>
            <aside className={styles.nextAside}><div className={styles.surface}><span className={styles.kicker}>Time to next</span><strong className={styles.metric}>55 min</strong><div className={styles.ringMeter}><span /></div><p>Plenty of time. You’re on schedule.</p></div><div className={styles.surface}><h3>What you’ll need</h3><div className={styles.needRow}><Dumbbell size={19} /><strong>Workout clothes</strong><Check size={16} /></div><div className={styles.needRow}><Sparkles size={19} /><strong>Towel</strong><Check size={16} /></div><div className={styles.needRow}><Utensils size={19} /><strong>Water bottle</strong><Check size={16} /></div></div><GlassButton primary onClick={() => moveTo('later', 'The timeline drifted forward without losing your place')}>Drift to later <ArrowRight size={16} /></GlassButton></aside>
          </section>
        )}

        {room === 'later' && (
          <section className={styles.laterLayout}>
            <div className={`${styles.surface} ${styles.laterHero}`}><div><button type="button" className={styles.backLink} onClick={() => moveTo('next-up')}><ArrowLeft size={16} /> Today</button><span className={styles.kicker}>AFTERNOON</span><h1>LATER</h1><p>Collaborate and create.<br />Build on today’s momentum.</p><span className={styles.badge}>2h 42m remaining</span></div><Matter className={styles.laterMatter} /><div><strong>Good progress today.</strong><p>A focused afternoon ahead.</p></div><blockquote>“Progress compounds in the quiet hours.”<small>— Shakti</small></blockquote></div>
            <div className={styles.laterSignals}><div className={styles.surface}><span className={styles.kicker}>Afternoon energy</span><div className={styles.waveLine} /><strong>Steady</strong><p>Good for deep work</p></div><div className={styles.surface}><span className={styles.kicker}>Focus mode</span><strong>Deep work</strong><p>2 sessions</p></div><div className={styles.surface}><span className={styles.kicker}>Goals for later</span><CheckRow label="Design review prep" checked onChange={() => toggleChecked('Design review prep')} /><CheckRow label="User research synthesis" checked={!!checkedTasks['User research synthesis']} onChange={() => toggleChecked('User research synthesis')} /></div></div>
            <div className={styles.afternoonTimeline}>{[['1:00 PM', 'Design review', 'Share, discuss, and align.', 'Meeting'], ['2:30 PM', 'User research synthesis', 'Turn insights into direction.', 'Deep work'], ['4:00 PM', 'Strategy block', 'Plan what’s next.', 'Deep work'], ['5:30 PM', 'Wrap up', 'Close the day with clarity.', 'Personal']].map(([time, title, body, tag]) => <article key={title} className={`${styles.surface} ${styles.afternoonRow}`}><span>{time}</span><Matter small /><div><h3>{title}</h3><p>{body}</p><small>{tag}</small></div><div className={styles.inlineChecklist}><CheckRow label={title === 'Design review' ? 'Finalize slides' : title === 'Wrap up' ? 'Review progress' : 'Open working notes'} checked={!!checkedTasks[title]} onChange={() => toggleChecked(title)} /></div><GlassButton onClick={() => moveTo(title === 'Design review' ? 'meeting' : 'focus')}>Open <ArrowRight size={14} /></GlassButton></article>)}</div>
            <div className={styles.laterFooter}><GlassButton primary onClick={() => moveTo('tonight', 'Afternoon light softened into evening without a page break')}>Move into tonight <Moon size={16} /></GlassButton></div>
          </section>
        )}

        {room === 'tonight' && (
          <section className={styles.tonightLayout}>
            <div className={`${styles.surface} ${styles.tonightHero}`}><div><span className={styles.kicker}>7:00 PM</span><h1>TONIGHT</h1><p>Unwind and reset.<br />Close the day well.</p><span className={styles.badge}>Evening mode</span></div><Matter className={styles.nightMatter} /><div className={styles.sunsetScene} aria-hidden="true" /><div className={styles.nightMessage}><strong>Same day.<br />A softer rhythm.</strong><blockquote>“A peaceful evening builds a brighter tomorrow.”</blockquote></div></div>
            <div className={`${styles.surface} ${styles.eveningIntent}`}><div><span className={styles.kicker}>This evening’s intention</span><h2>Nourish. Reflect. Recenter.</h2></div><div className={styles.waveLine} /><div className={styles.promptBox}><span>How do you want tonight to feel?</span><ArrowRight size={17} /></div></div>
            <div className={styles.eveningCards}>{[
              ['7:00 – 8:30 PM', 'Dinner', 'Good food, better company.', ['Reservation at Lume', 'Share ideas for design direction', 'No work talk after 8:00 PM']],
              ['9:15 PM', 'Evening routine', 'Small rituals. A calmer you.', ['Shower', 'Skincare', 'Change into comfortable clothes', '10 minutes of reading']],
              ['From 9:30 PM', 'Unwind', 'Slow down. Be here.', ['Dim the lights', 'No screens after 10:00 PM', 'Journal or breathe', 'Listen to something calming']],
              ['Target 2h 09m', 'Be leave-ready', 'A smoother tomorrow.', ['Pack bag', 'Laptop charged', 'Keys, wallet, essentials', 'Prepare tomorrow’s top 3']],
            ].map(([time, title, body, items]) => <article key={String(title)} className={`${styles.surface} ${styles.eveningCard}`}><span className={styles.kicker}>{String(time)}</span><h3>{String(title)}</h3><p>{String(body)}</p><div className={styles.eveningImage}><Matter /></div>{(items as string[]).map((label) => <CheckRow key={label} label={label} checked={!!checkedTasks[label]} onChange={() => toggleChecked(label)} />)}<GlassButton primary onClick={() => title === 'Be leave-ready' ? moveTo('tomorrow') : toggleChecked(String(title))}>{title === 'Dinner' ? 'Open in Calendar' : title === 'Evening routine' ? 'Start routine' : title === 'Unwind' ? 'Start unwind' : 'Mark as ready'}</GlassButton></article>)}</div>
            <div className={styles.laterFooter}><GlassButton primary onClick={() => moveTo('tomorrow', 'The day horizon opened into tomorrow')}>Preview tomorrow <ArrowRight size={16} /></GlassButton></div>
          </section>
        )}

        {room === 'tomorrow' && (
          <section className={styles.tomorrowLayout}>
            <div className={`${styles.surface} ${styles.tomorrowHero}`}><div><button type="button" className={styles.backLink} onClick={() => moveTo('tonight')}><ArrowLeft size={16} /> Back to Today</button><span className={styles.kicker}>TOMORROW</span><h1>Preview</h1><h2>A clear tomorrow creates a lighter today.</h2><p>Here’s what’s ahead, and a gentle head start to help you flow into it.</p><span className={styles.badge}>Tomorrow is in view</span></div><Matter className={styles.tomorrowMatter} /><div className={styles.horizonScene} aria-hidden="true" /><div className={`${styles.surface} ${styles.dateTile}`}><span>Tomorrow</span><strong>Sat, Sep 5</strong><p>Mostly clear · 72°</p><blockquote>“Preparation is a form of self-care.”</blockquote></div></div>
            <div className={styles.tomorrowTop}><article className={styles.surface}><span className={styles.kicker}>First up</span><div className={styles.eventLine}><Matter small /><div><strong>9:00 AM</strong><h3>Leadership sync</h3><p>Align, decide, and move forward.</p></div><ArrowRight size={18} /></div></article><article className={styles.surface}><span className={styles.kicker}>10:30 AM – 12:00 PM</span><div className={styles.eventLine}><Matter small /><div><h3>Strategy block</h3><p>Focus on Q2 roadmap and priorities.</p></div></div></article><article className={styles.surface}><span className={styles.kicker}>Preview time</span><strong className={styles.metric}>12h 18m</strong><div className={styles.waveLine} /><p>Now → Tomorrow</p></article></div>
            <div className={`${styles.surface} ${styles.glanceStrip}`}><h3>Tomorrow at a glance</h3>{[['9:00', 'Leadership sync'], ['10:30', 'Strategy block'], ['1:00', 'Design review'], ['2:30', 'User interviews'], ['5:00', 'Wrap & plan']].map(([time, label]) => <div className={styles.glanceItem} key={label}><span>{time}</span><strong>{label}</strong></div>)}</div>
            <div className={styles.tomorrowColumns}><div className={styles.surface}><h3>Light preparation</h3><p>A few small steps today can make tomorrow feel effortless.</p>{['Review Q2 deck', 'Gather latest metrics', 'Send agenda + materials', 'Prep talking points', 'Set up workspace'].map((label) => <CheckRow key={label} label={label} checked={!!checkedTasks[label]} onChange={() => toggleChecked(label)} />)}</div><div className={styles.surface}><h3>Key context</h3>{['Q2 Strategy', 'Leadership sync agenda', 'Product metrics', 'Customer insights'].map((label) => <div className={styles.fileRow} key={label}><FileText size={18} /><span>{label}</span><ChevronRight size={16} /></div>)}</div><div className={styles.surface}><h3>Flow into tomorrow</h3><button type="button" className={styles.flowRow} onClick={() => moveTo('tonight')}><Moon size={18} /><div><strong>Wrap current work</strong><span>A clean handoff is one task away.</span></div><ChevronRight size={16} /></button><button type="button" className={styles.flowRow} onClick={() => moveTo('replan')}><CalendarDays size={18} /><div><strong>Review tomorrow’s plan</strong><span>Feel prepared, not rushed.</span></div><ChevronRight size={16} /></button><button type="button" className={styles.flowRow} onClick={() => moveTo('tonight')}><Sparkles size={18} /><div><strong>Wind down well</strong><span>A better tomorrow starts with rest.</span></div><ChevronRight size={16} /></button></div></div>
            <div className={styles.laterFooter}><GlassButton primary onClick={() => moveTo('replan', 'Tomorrow stretched into a movable time surface')}>Replan my day <TimerReset size={16} /></GlassButton></div>
          </section>
        )}

        {room === 'replan' && (
          <section className={styles.replanLayout}>
            <div className={styles.replanTitle}><button type="button" className={styles.backLink} onClick={() => moveTo('tomorrow')}><ArrowLeft size={16} /> Preview</button><h1>Replan My Day</h1><p>A calmer, more focused day. You’re in control.</p></div>
            <div className={styles.replanTimeline}>{[
              ['8 AM', 'Morning routine', '8:00 – 8:45 AM', 'routine'],
              ['9 AM', 'Deep work', '9:00 – 11:00 AM', 'focus'],
              ['11 AM', 'Design review', replanApplied ? '2:00 – 3:00 PM' : '11:00 – 12:00 PM', replanApplied ? 'moved' : 'conflict'],
              ['12 PM', 'Workout + shower', replanApplied ? '10:00 – 11:00 AM' : '11:30 AM – 12:30 PM', 'workout'],
              ['1 PM', 'Lunch with Sam', '12:30 – 1:30 PM', 'meal'],
              ['3 PM', 'User research synthesis', '2:30 – 3:30 PM', 'research'],
              ['4 PM', 'Strategy block', '4:00 – 5:30 PM', 'strategy'],
              ['7 PM', 'Dinner with Alex', '7:00 – 8:00 PM', 'meal'],
              ['9 PM', 'Evening routine', '8:30 – 9:30 PM', 'routine'],
            ].map(([time, title, range, kind]) => <div className={`${styles.planBlock} ${kind === 'conflict' ? styles.planConflict : ''} ${kind === 'moved' ? styles.planMoved : ''}`} key={title}><span className={styles.planTime}>{time}</span><div><strong>{title}</strong><span>{range}</span></div><Matter small />{kind === 'conflict' ? <span className={styles.conflictText}>Conflicts with workout</span> : null}</div>)}</div>
            <aside className={styles.replanAside}><div className={`${styles.surface} ${styles.replanHero}`}><Matter /><h2>A better flow is within reach.</h2><p>Move, protect, or reschedule. Preview the changes, then apply.</p><div className={styles.replanStats}><span><strong>3</strong> conflicts resolved</span><span><strong>+1h</strong> focus time</span><span><strong>◌</strong> calmer afternoon</span></div></div><div className={styles.surface}><h3>Suggestions</h3>{[['Move workout earlier', '11:30 AM → 10:00 AM'], ['Protect this time', 'Deep work · 9:00 – 11:00 AM'], ['Reschedule design review', '11:00 AM → 2:00 PM']].map(([label, detail]) => <div className={styles.suggestionRow} key={label}><Sparkles size={18} /><div><strong>{label}</strong><span>{detail}</span></div><GlassButton onClick={applyReplan}>Apply</GlassButton></div>)}</div><div className={styles.surface}><h3>Preview your day</h3><div className={styles.miniPlan}><span /><span /><span /><span /><span /></div><div className={`${styles.miniPlan} ${styles.miniPlanProposed}`}><span /><span /><span /><span /><span /></div></div></aside>
            <div className={styles.replanFooter}><div><strong>{replanApplied ? 'Changes previewed' : '4 changes ready'}</strong><span>{replanApplied ? 'Ready to apply to Today.' : 'No changes applied yet.'}</span></div><GlassButton onClick={() => setReplanApplied(false)}><RotateCcw size={15} /> Reset</GlassButton><GlassButton>Save for later</GlassButton><GlassButton primary onClick={() => { applyReplan(); moveTo('morning', 'Aurora receipt: Today reorganized around the calmer plan'); }}><Sparkles size={16} /> Apply changes</GlassButton></div>
          </section>
        )}
      </main>

      <footer className={styles.worldFooter}>
        <button type="button" className={styles.footerControl} onClick={() => currentMeta.prev && moveTo(currentMeta.prev)} disabled={!currentMeta.prev}><ArrowLeft size={15} /> Previous</button>
        <div className={styles.orientation}><span className={styles.orientationLabel}>{currentMeta.time}</span><div className={styles.orientationTrack}>{roomOrder.map((item) => <button key={item.key} aria-label={`Move to ${item.label}`} title={item.label} className={`${styles.orientationDot} ${item.key === room ? styles.orientationDotActive : ''}`} onClick={() => moveTo(item.key)} />)}</div><span>{currentMeta.label}</span></div>
        <div className={styles.receipt}><Sparkles size={14} /><span>{receipt}</span></div>
        <button type="button" className={styles.footerControl} onClick={() => currentMeta.next && moveTo(currentMeta.next)} disabled={!currentMeta.next}>Next <ArrowRight size={15} /></button>
      </footer>

      {shaktiOpen ? (
        <div className={styles.shaktiPanel} role="dialog" aria-label="Ask Shakti">
          <div className={styles.shaktiHeader}><Matter /><div><strong>Shakti</strong><span>Continuous context is active</span></div><button onClick={() => setShaktiOpen(false)} aria-label="Close Shakti"><MoreHorizontal size={18} /></button></div>
          <p>I’m still with the same day, the same active work, and the same unfinished context.</p>
          <div className={styles.shaktiActions}><GlassButton onClick={() => { setShaktiOpen(false); moveTo('what-now', 'Shakti gathered your current state'); }}>What should I do now?</GlassButton><GlassButton onClick={() => { setShaktiOpen(false); moveTo('replan', 'Shakti unfolded the day into an editable time surface'); }}>Replan my day</GlassButton><GlassButton onClick={() => { setShaktiOpen(false); moveTo('tomorrow', 'Shakti opened the horizon without leaving Today'); }}>Preview tomorrow</GlassButton></div>
        </div>
      ) : null}
    </div>
  );
}
