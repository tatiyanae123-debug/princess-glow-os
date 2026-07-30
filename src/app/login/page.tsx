'use client';

import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(253,230,138,0.25),_transparent_40%),linear-gradient(135deg,_#fffaf7_0%,_#fdf2f8_100%)] p-4 dark:bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_40%),linear-gradient(135deg,_#020617_0%,_#111827_100%)]">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-400/20 text-rose-400 shadow-lg">
            <Sparkles size={28} />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-rose-400">Princess Glow</p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100">Life OS</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Your personal sanctuary for intention and beauty.</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/90 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <p className="mb-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Authentication coming soon — powered by Auth.js
          </p>
          <a
            href="/dashboard"
            className="block w-full rounded-2xl bg-slate-900 py-3 text-center text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
          >
            Continue to dashboard
          </a>
        </div>

        <p className="text-center text-xs text-slate-400">
          Princess Glow OS · Your intentions are safe here.
        </p>
      </div>
    </div>
  );
}
