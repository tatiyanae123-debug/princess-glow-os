'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, CircleDot, Sparkles, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import styles from './glow-current-navigation.module.css';

type Scope = 'home' | 'today';
type Region = 'today' | 'plan' | 'life' | 'brain' | 'create';

type Props = {
  scope: Scope;
  currentRoom?: string;
  currentLabel?: string;
};

const todayOrder = ['morning', 'what-now', 'focus', 'meeting', 'next-up', 'later', 'tonight', 'tomorrow', 'replan'];

const nearbyByRoom: Record<string, Array<{ label: string; room: string; note: string }>> = {
  morning: [
    { label: 'What matters now?', room: 'what-now', note: 'The next decision became nearer.' },
    { label: 'Next up', room: 'next-up', note: 'The next commitment moved into focus.' },
    { label: 'Protected focus', room: 'focus', note: 'Active work expanded without losing Today.' },
  ],
  'what-now': [
    { label: 'Partnership proposal', room: 'focus', note: 'The chosen task became a working environment.' },
    { label: 'Design review', room: 'meeting', note: 'Meeting context surfaced beside the current decision.' },
    { label: 'Replan the day', room: 'replan', note: 'Time unfolded into an editable surface.' },
  ],
  focus: [
    { label: 'Today context', room: 'morning', note: 'Focus surfaced back into Today.' },
    { label: 'Design review', room: 'meeting', note: 'The next connected commitment became clearer.' },
    { label: 'Later', room: 'later', note: 'The afternoon moved closer without closing Focus.' },
  ],
  meeting: [
    { label: 'Today context', room: 'morning', note: 'The meeting remained attached to Today.' },
    { label: 'Later', room: 'later', note: 'The afternoon opened from the meeting context.' },
    { label: 'Tomorrow', room: 'tomorrow', note: 'The future horizon became visible.' },
  ],
  'next-up': [
    { label: 'Start focus', room: 'focus', note: 'The active block expanded into focused work.' },
    { label: 'Design review', room: 'meeting', note: 'The upcoming meeting surfaced with its context.' },
    { label: 'Later', room: 'later', note: 'The current drifted forward through the day.' },
  ],
  later: [
    { label: 'Design review', room: 'meeting', note: 'The meeting resurfaced from the afternoon.' },
    { label: 'Tonight', room: 'tonight', note: 'Afternoon light softened toward evening.' },
    { label: 'Tomorrow', room: 'tomorrow', note: 'Tomorrow became visible at the edge of the day.' },
  ],
  tonight: [
    { label: 'Today context', room: 'morning', note: 'The day remained connected behind the evening.' },
    { label: 'Tomorrow', room: 'tomorrow', note: 'The horizon opened toward tomorrow.' },
    { label: 'Replan tomorrow', room: 'replan', note: 'Tomorrow unfolded into movable time.' },
  ],
  tomorrow: [
    { label: 'Tonight', room: 'tonight', note: 'Tomorrow receded back toward tonight.' },
    { label: 'Replan', room: 'replan', note: 'The preview stretched into an editable schedule.' },
    { label: 'Present', room: 'morning', note: 'The Return Current brought the world back to Today.' },
  ],
  replan: [
    { label: 'Tomorrow preview', room: 'tomorrow', note: 'The schedule gathered back into tomorrow.' },
    { label: 'Today', room: 'morning', note: 'The revised plan settled into the present.' },
    { label: 'Focus', room: 'focus', note: 'Protected work became the nearest active context.' },
  ],
};

const regionDescriptions: Record<Region, { title: string; detail: string }> = {
  today: { title: 'Today', detail: 'Immediate · present-time movement' },
  plan: { title: 'Plan', detail: 'Future horizon · time as depth' },
  life: { title: 'Life', detail: 'Inhabited systems · material world' },
  brain: { title: 'Brain', detail: 'Relational depth · memory and knowledge' },
  create: { title: 'Create', detail: 'Open potential · generative space' },
};

function setTodayRoom(room: string) {
  const url = new URL(window.location.href);
  url.pathname = '/today';
  url.searchParams.set('room', room);
  window.history.pushState({}, '', url);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

export function GlowCurrentNavigation({ scope, currentRoom = 'morning', currentLabel = 'Today' }: Props) {
  const [fieldOpen, setFieldOpen] = useState(false);
  const [foldOpen, setFoldOpen] = useState(false);
  const [threadOpen, setThreadOpen] = useState(false);
  const [receipt, setReceipt] = useState('');
  const [recentRooms, setRecentRooms] = useState<string[]>([]);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);
  const gestureCommitted = useRef(false);

  const nearby = useMemo(() => nearbyByRoom[currentRoom] ?? nearbyByRoom.morning, [currentRoom]);

  useEffect(() => {
    setRecentRooms((old) => {
      const next = [currentRoom, ...old.filter((item) => item !== currentRoom)].slice(0, 5);
      return next;
    });
  }, [currentRoom]);

  useEffect(() => {
    function isInteractive(target: EventTarget | null) {
      return target instanceof Element && !!target.closest('button,a,input,textarea,select,[role="button"],[data-glow-current-ignore="true"]');
    }

    function onPointerDown(event: PointerEvent) {
      if (isInteractive(event.target)) return;
      origin.current = { x: event.clientX, y: event.clientY };
      gestureCommitted.current = false;
      if (holdTimer.current) clearTimeout(holdTimer.current);
      holdTimer.current = setTimeout(() => {
        setFieldOpen(true);
        setReceipt('Glow Current revealed nearby meaning.');
      }, 430);
    }

    function onPointerMove(event: PointerEvent) {
      if (!origin.current || !fieldOpen || gestureCommitted.current) return;
      const dx = event.clientX - origin.current.x;
      const dy = event.clientY - origin.current.y;
      if (dy < -70) {
        gestureCommitted.current = true;
        setFoldOpen(true);
        setFieldOpen(false);
        setReceipt('World Fold opened around the current room.');
      } else if (dx < -78) {
        gestureCommitted.current = true;
        window.history.back();
        setFieldOpen(false);
        setReceipt('Current reversed to the previous context.');
      } else if (dx > 78 && scope === 'today') {
        gestureCommitted.current = true;
        const index = Math.max(0, todayOrder.indexOf(currentRoom));
        const next = todayOrder[Math.min(todayOrder.length - 1, index + 1)];
        if (next !== currentRoom) setTodayRoom(next);
        setFieldOpen(false);
        setReceipt('The day moved forward with context intact.');
      }
    }

    function onPointerUp() {
      origin.current = null;
      if (holdTimer.current) clearTimeout(holdTimer.current);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setFoldOpen(false);
        setFieldOpen(false);
        setThreadOpen(false);
      }
      if (event.shiftKey && event.code === 'Space') {
        event.preventDefault();
        setFoldOpen(true);
        setFieldOpen(false);
      }
    }

    document.addEventListener('pointerdown', onPointerDown, true);
    document.addEventListener('pointermove', onPointerMove, true);
    document.addEventListener('pointerup', onPointerUp, true);
    document.addEventListener('pointercancel', onPointerUp, true);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('pointermove', onPointerMove, true);
      document.removeEventListener('pointerup', onPointerUp, true);
      document.removeEventListener('pointercancel', onPointerUp, true);
      window.removeEventListener('keydown', onKeyDown);
      if (holdTimer.current) clearTimeout(holdTimer.current);
    };
  }, [currentRoom, fieldOpen, scope]);

  function travelRoom(room: string, note: string) {
    setTodayRoom(room);
    setFieldOpen(false);
    setReceipt(note);
  }

  function returnPresent() {
    if (scope === 'today') setTodayRoom('morning');
    else window.location.assign('/today');
    setReceipt('Return Anchor brought the world toward the present.');
  }

  function travelRegion(region: Region) {
    if (region === 'today') {
      window.location.assign('/today');
      return;
    }
    setReceipt(`${regionDescriptions[region].title} is visible in the geography, but its new Glow Current room is not entered until that region is rebuilt.`);
  }

  return (
    <div className={styles.layer} data-glow-current-layer="true">
      <Link href="/home" className={styles.wordmark} aria-label="Glow OS Home" data-glow-current-ignore="true">Glow OS</Link>

      <button type="button" className={styles.returnAnchor} onClick={returnPresent} aria-label="Return to the present" title="Return Anchor" data-glow-current-ignore="true">
        <span className={styles.anchorCore} />
      </button>

      <button type="button" className={styles.currentSeed} onClick={() => setFieldOpen(true)} aria-label="Reveal Glow Current" title="Press and hold empty space, or tap here, to reveal Glow Current" data-glow-current-ignore="true">
        <span />
      </button>

      <button type="button" className={styles.threadSeed} onClick={() => setThreadOpen((value) => !value)} aria-label="Reveal Glow Thread" title="Glow Thread" data-glow-current-ignore="true">
        <span className={styles.threadLine} />
      </button>

      {receipt ? <div className={styles.receipt}><Sparkles size={12} /> <span>{receipt}</span><button onClick={() => setReceipt('')} aria-label="Dismiss"><X size={11} /></button></div> : null}

      {fieldOpen ? (
        <section className={styles.navigationField} aria-label="Glow Current navigation field" data-glow-current-ignore="true">
          <div className={styles.fieldAtmosphere} />
          <div className={styles.fieldHeader}><span>Glow Current</span><strong>{currentLabel}</strong><small>Near relationships are becoming visible.</small></div>
          <div className={styles.nearField}>
            {nearby.map((item, index) => (
              <button key={item.room + item.label} type="button" className={`${styles.currentPath} ${styles[`path${index + 1}`]}`} onClick={() => travelRoom(item.room, item.note)}>
                <span className={styles.pathLight} />
                <strong>{item.label}</strong>
                <small>{index === 0 ? 'near' : index === 1 ? 'connected' : 'deeper'}</small>
              </button>
            ))}
          </div>
          <div className={styles.gestureHints}><span>pull left · reverse</span><span>pull right · forward</span><span>pull up · World Fold</span></div>
          <button type="button" className={styles.closeField} onClick={() => setFieldOpen(false)}>Let the Current recede</button>
        </section>
      ) : null}

      {threadOpen ? (
        <section className={styles.threadPanel} aria-label="Glow Thread" data-glow-current-ignore="true">
          <div className={styles.threadHeader}><span>Glow Thread</span><small>Recent living contexts</small></div>
          <div className={styles.threadStates}>{recentRooms.map((item, index) => <button key={item} onClick={() => travelRoom(item, 'Glow Thread restored a recent context.')}><span>{index + 1}</span><strong>{item.replace('-', ' ')}</strong></button>)}</div>
          <button type="button" onClick={() => setThreadOpen(false)}>Close</button>
        </section>
      ) : null}

      {foldOpen ? (
        <section className={styles.worldFold} aria-label="World Fold" data-glow-current-ignore="true">
          <div className={styles.foldBackdrop} />
          <div className={styles.foldCurrentRoom}><span>you are here</span><strong>{scope === 'home' ? 'Glow OS Center' : currentLabel}</strong><small>The current environment remains alive inside the larger geography.</small></div>
          {(Object.keys(regionDescriptions) as Region[]).map((region) => (
            <button key={region} type="button" className={`${styles.regionPreview} ${styles[`region_${region}`]}`} onClick={() => travelRegion(region)}>
              <span className={styles.regionAtmosphere} />
              <span className={styles.regionCopy}><strong>{regionDescriptions[region].title}</strong><small>{regionDescriptions[region].detail}</small></span>
            </button>
          ))}
          <button type="button" className={styles.foldClose} onClick={() => setFoldOpen(false)}><ArrowLeft size={14} /> Return to the current room</button>
          <div className={styles.foldLegend}><CircleDot size={11} /><span>Distance represents meaning, not folders.</span><ArrowRight size={12} /></div>
        </section>
      ) : null}
    </div>
  );
}
