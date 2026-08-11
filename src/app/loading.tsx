export default function Loading() {
  return (
    <main className="min-h-screen bg-[var(--glow-bg)] px-5 py-10 text-[var(--glow-text)]">
      <div className="mx-auto max-w-5xl space-y-4 animate-pulse">
        <div className="h-24 rounded-[28px] border border-[var(--glow-border)] bg-[var(--glow-surface)]" />
        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-40 rounded-[24px] border border-[var(--glow-border)] bg-[var(--glow-surface)]" />
          <div className="h-40 rounded-[24px] border border-[var(--glow-border)] bg-[var(--glow-surface)]" />
          <div className="h-40 rounded-[24px] border border-[var(--glow-border)] bg-[var(--glow-surface)]" />
        </div>
        <div className="h-72 rounded-[28px] border border-[var(--glow-border)] bg-[var(--glow-surface)]" />
      </div>
    </main>
  );
}
