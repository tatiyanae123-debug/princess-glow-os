'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[Glow OS] route error', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[var(--glow-bg)] px-5 py-10 text-[var(--glow-text)]">
      <div className="mx-auto max-w-xl rounded-[32px] border border-[var(--glow-border)] bg-[var(--glow-surface)] p-7 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] opacity-50">Glow OS recovery</p>
        <h1 className="mt-3 text-2xl font-semibold">This section needs a quick refresh.</h1>
        <p className="mt-3 text-sm leading-6 opacity-70">Your other Glow OS sections are still safe. Retry this page, or return to the dashboard and keep moving.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={() => reset()} className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Try again</button>
          <Link href="/dashboard" className="rounded-2xl border border-[var(--glow-border)] px-4 py-2 text-sm font-medium">Dashboard</Link>
        </div>
        {error.digest && <p className="mt-5 text-xs opacity-40">Reference: {error.digest}</p>}
      </div>
    </main>
  );
}
