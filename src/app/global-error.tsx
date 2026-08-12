'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html>
      <body>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, fontFamily: 'system-ui, sans-serif', background: '#fff7f8', color: '#17111a' }}>
          <section style={{ width: '100%', maxWidth: 560, padding: 28, borderRadius: 28, background: '#fff', border: '1px solid #eadde2' }}>
            <p style={{ fontSize: 12, letterSpacing: '.22em', textTransform: 'uppercase', opacity: .55 }}>Glow OS recovery</p>
            <h1 style={{ fontSize: 28, margin: '12px 0' }}>Glow OS is still here.</h1>
            <p style={{ lineHeight: 1.6, opacity: .72 }}>A section failed to load, but the app can recover without losing the rest of your workspace.</p>
            <button onClick={() => reset()} style={{ marginTop: 20, border: 0, borderRadius: 16, padding: '11px 16px', background: '#17111a', color: '#fff', fontWeight: 600 }}>Reload Glow OS</button>
          </section>
        </main>
      </body>
    </html>
  );
}
