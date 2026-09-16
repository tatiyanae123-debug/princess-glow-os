'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Glow OS] route error', error);
  }, [error]);

  return (
    <main className="glow-system-state" role="alert">
      <section className="glow-system-state__card">
        <p className="glow-eyebrow">GLOW OS RECOVERY</p>
        <h1>This room needs a quick refresh</h1>
        <p>Your other Glow OS worlds remain available. Retry this room, or return to Today without losing your place elsewhere.</p>
        <div className="glow-system-state__actions">
          <button type="button" onClick={reset}>Try again</button>
          <Link href="/today">Return to Today</Link>
        </div>
        {error.digest ? <p style={{ marginTop: 18, fontSize: 11, opacity: .48 }}>Reference: {error.digest}</p> : null}
      </section>
    </main>
  );
}
