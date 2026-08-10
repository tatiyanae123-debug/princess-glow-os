import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--glow-bg)] px-5 py-10 text-[var(--glow-text)]">
      <div className="mx-auto max-w-xl rounded-[32px] border border-[var(--glow-border)] bg-[var(--glow-surface)] p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-50">Glow OS</p>
        <h1 className="mt-3 text-2xl font-semibold">That room is not available yet.</h1>
        <p className="mt-3 text-sm leading-6 opacity-70">Nothing was lost. Return to the dashboard or enter Life World to choose another working section.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/dashboard" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Dashboard</Link>
          <Link href="/world" className="rounded-2xl border border-[var(--glow-border)] px-4 py-2 text-sm font-medium">Life World</Link>
        </div>
      </div>
    </main>
  );
}
