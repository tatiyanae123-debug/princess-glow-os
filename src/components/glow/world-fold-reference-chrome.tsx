'use client';

import { useEffect, useState } from 'react';

type FoldWorld = 'home' | 'today' | 'plan' | 'life' | 'beauty' | 'brain' | 'create';

type WorldItem = {
  key: FoldWorld;
  label: string;
  path: string;
  cue: string;
  detail: string;
  symbol: string;
};

const WORLDS: WorldItem[] = [
  { key: 'home', label: 'Home', path: '/home', cue: 'Your life, in one view.', detail: 'Everything connects here.', symbol: '●' },
  { key: 'today', label: 'Today', path: '/today?room=what-now', cue: 'The present moment.', detail: 'What’s next, now.', symbol: '☼' },
  { key: 'plan', label: 'Plan', path: '/plan', cue: 'Time becoming you.', detail: 'Goals, tasks, and what’s ahead.', symbol: '◎' },
  { key: 'life', label: 'Life', path: '/life', cue: 'Your inhabited world.', detail: 'People, places, systems.', symbol: '◇' },
  { key: 'beauty', label: 'Beauty', path: '/beauty', cue: 'Care. Confidence. You.', detail: 'Routines, progress, and more.', symbol: '✦' },
  { key: 'brain', label: 'Brain', path: '/brain', cue: 'Knowledge in motion.', detail: 'Memories, insights, connections.', symbol: '⌘' },
  { key: 'create', label: 'Create', path: '/create', cue: 'Ideas into reality.', detail: 'Make, design, build, express.', symbol: '✧' },
];

function go(path: string) {
  document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } }));
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

export function WorldFoldReferenceChrome() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    update();
    const timer = window.setInterval(update, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="world-fold-reference-chrome" aria-hidden="false">
      <div className="world-fold-reference-chrome__today-state" aria-hidden="true">
        <span className="world-fold-reference-chrome__sun">☼</span>
        <span><strong>Today</strong><small>In focus · {time || 'Now'}</small></span>
      </div>

      <div className="world-fold-reference-chrome__left-marker" aria-hidden="true">
        <span>Same you.<br />Deeper together.</span><i />
      </div>
      <div className="world-fold-reference-chrome__right-marker" aria-hidden="true">
        <span>Every world<br />is a lens on the same life.</span><i />
      </div>

      <nav className="world-fold-reference-chrome__shelf" aria-label="World Fold world index">
        {WORLDS.map((world) => (
          <button key={world.key} type="button" data-world={world.key} onClick={() => go(world.path)} aria-label={`Enter ${world.label}. ${world.cue} ${world.detail}`}>
            <span className="world-fold-reference-chrome__card-head">
              <i className="world-fold-reference-chrome__pearl" aria-hidden="true">{world.symbol}</i>
              <span><strong>{world.label}</strong><small>{world.cue}<br />{world.detail}</small></span>
            </span>
            <span className="world-fold-reference-chrome__preview" aria-hidden="true"><i/><i/><i/><i/></span>
          </button>
        ))}
      </nav>

      <footer className="world-fold-reference-chrome__footer" aria-hidden="true">
        <span>GLOW OS</span><strong>SAME YOU. · MORE YOU.</strong><span>WORLDS ARE LENSES. YOU ARE THE CENTER.</span>
      </footer>
    </div>
  );
}
