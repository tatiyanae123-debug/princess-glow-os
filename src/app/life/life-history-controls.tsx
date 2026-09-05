'use client';

import { useEffect, useState } from 'react';
import styles from './life-personal-house.module.css';

export function LifeHistoryControls() {
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  useEffect(() => {
    setCanBack(window.history.length > 1);
    // Browsers do not expose forward-stack length. Keep Redo available as a real history action;
    // if there is no forward entry the browser simply stays in place.
    setCanForward(true);
  }, []);

  return (
    <div className={styles.historyControls} aria-label="Life history controls">
      <button type="button" onClick={() => window.history.back()} disabled={!canBack} title="Return to the previous Glow view">
        <span aria-hidden="true">←</span>
        <span>Undo</span>
      </button>
      <span className={styles.historyDivider} aria-hidden="true" />
      <button type="button" onClick={() => window.history.forward()} disabled={!canForward} title="Move forward to the next Glow view">
        <span>Redo</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
