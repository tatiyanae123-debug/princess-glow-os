'use client';

import { useEffect, useRef } from 'react';

const INTELLIGENCE_EVENTS = ['glow:intelligence', 'glow:command-complete', 'glow:action-complete'];

export function GlowMatterField() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    const makeRipple = (event: PointerEvent) => {
      if (event.pointerType === 'mouse' && event.button !== 0) return;
      const ripple = document.createElement('span');
      ripple.className = 'glow-matter-ripple';
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      field.appendChild(ripple);
      window.setTimeout(() => ripple.remove(), 1100);
    };

    const aurora = () => {
      field.classList.remove('glow-intelligence-active');
      void field.offsetWidth;
      field.classList.add('glow-intelligence-active');
      window.setTimeout(() => field.classList.remove('glow-intelligence-active'), 1700);
    };

    document.addEventListener('pointerdown', makeRipple, { passive: true });
    INTELLIGENCE_EVENTS.forEach((name) => document.addEventListener(name, aurora));

    return () => {
      document.removeEventListener('pointerdown', makeRipple);
      INTELLIGENCE_EVENTS.forEach((name) => document.removeEventListener(name, aurora));
    };
  }, []);

  return (
    <div ref={fieldRef} className="glow-matter-field" aria-hidden="true">
      <div className="glow-caustic glow-caustic-one" />
      <div className="glow-caustic glow-caustic-two" />
      <div className="glow-crystal-orbit glow-crystal-orbit-one" />
      <div className="glow-crystal-orbit glow-crystal-orbit-two" />
      <div className="glow-aurora-wave" />
      <div className="glow-grain" />
    </div>
  );
}
