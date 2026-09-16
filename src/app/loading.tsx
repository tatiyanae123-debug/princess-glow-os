export default function Loading() {
  return (
    <main className="glow-system-state" aria-busy="true" aria-live="polite">
      <section className="glow-system-state__card">
        <div className="glow-system-state__pulse" aria-hidden="true" />
        <p className="glow-eyebrow">GLOW OS</p>
        <h1>Opening your world</h1>
        <p>Bringing your current context, plans, and rooms into place.</p>
      </section>
    </main>
  );
}
