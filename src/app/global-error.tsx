'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Glow OS] global error', error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <main
          role="alert"
          aria-live="assertive"
          aria-labelledby="glow-global-error-title"
          aria-describedby="glow-global-error-description"
          style={{
            minHeight: '100dvh',
            display: 'grid',
            placeItems: 'center',
            padding: 'max(20px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(20px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))',
            fontFamily: 'Inter, system-ui, sans-serif',
            background: 'linear-gradient(180deg,#f8f2ed 0%,#f4ece6 100%)',
            color: '#302622',
            boxSizing: 'border-box',
          }}
        >
          <section style={{ width: '100%', maxWidth: 560, padding: 28, borderRadius: 28, background: 'rgba(255,252,249,.94)', border: '1px solid rgba(135,106,94,.16)', boxShadow: '0 16px 44px rgba(92,65,54,.08)', boxSizing: 'border-box' }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, letterSpacing: '.18em', textTransform: 'uppercase', color: '#98746f' }}>Glow OS · Recovery</p>
            <h1 id="glow-global-error-title" style={{ margin: '12px 0 0', fontFamily: 'Georgia, serif', fontSize: 30, lineHeight: 1.05, fontWeight: 500, letterSpacing: '-.03em' }}>Glow OS needs to reload.</h1>
            <p id="glow-global-error-description" style={{ margin: '12px 0 0', lineHeight: 1.65, color: '#7b6962', fontSize: 14 }}>The app shell did not finish loading. Reload Glow OS to rebuild the current view.</p>
            <button
              type="button"
              onClick={reset}
              style={{ minHeight: 44, marginTop: 22, border: 0, borderRadius: 16, padding: '10px 16px', background: '#302622', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Reload Glow OS
            </button>
            {error.digest ? <p style={{ margin: '18px 0 0', fontSize: 11, color: '#7b6962', opacity: .6 }}>Reference: {error.digest}</p> : null}
          </section>
        </main>
      </body>
    </html>
  );
}
