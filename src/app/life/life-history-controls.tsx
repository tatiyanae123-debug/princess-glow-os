'use client';

import { useEffect, useState } from 'react';
import styles from './life-personal-house-v3.module.css';

export function LifeHistoryControls() {
  const [canBack, setCanBack] = useState(false);
  const [canForward, setCanForward] = useState(false);

  useEffect(() => {
    setCanBack(window.history.length > 1);
    setCanForward(true);
  }, []);

  function quickAdd() {
    window.location.assign('/ask-glow');
  }

  return (
    <div className={styles.historyControls} aria-label="Life history controls">
      <button type="button" onClick={() => window.history.back()} disabled={!canBack} title="Return to the previous Glow view">
        <span aria-hidden="true">←</span>
        <span>Undo</span>
      </button>
      <button type="button" onClick={quickAdd} className={styles.historyAdd} aria-label="Add with Glow" title="Add with Glow">
        <span aria-hidden="true">+</span>
      </button>
      <button type="button" onClick={() => window.history.forward()} disabled={!canForward} title="Move forward to the next Glow view">
        <span>Redo</span>
        <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
