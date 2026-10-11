'use client';

import { useEffect, useState } from 'react';

export default function Loading() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const timer = window.setTimeout(() => setSlow(true), 12000);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <main className="glow-system-state" aria-busy={!slow} aria-live="polite">
      <section className="glow-system-state__card">
        <div className="glow-system-state__pulse" aria-hidden="true" />
        <p className="glow-eyebrow">GLOW OS</p>
        <h1>{slow ? 'Glow is taking longer than expected' : 'Opening your world'}</h1>
        <p>{slow ? 'Your dashboard has not finished loading. This can happen when sign-in or a connected data source is unavailable. You can retry or open sign-in directly.' : 'Bringing your current context, plans, and rooms into place.'}</p>
        {slow && <nav aria-label="Recovery options" style={{display:'flex',gap:12,flexWrap:'wrap',justifyContent:'center',marginTop:20}}><a href="/sign-in">Open sign-in</a><a href="/home">Retry dashboard</a></nav>}
      </section>
    </main>
  );
}
