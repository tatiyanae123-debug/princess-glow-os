'use client';

import { useEffect, useState } from 'react';
import { BellRing, Search } from 'lucide-react';

export function TopNav() {
  const [dateTime, setDateTime] = useState<Date | null>(null);

  useEffect(() => {
    setDateTime(new Date());
    const interval = window.setInterval(() => setDateTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <header className="flex flex-col gap-4 rounded-[28px] border border-slate-200/70 bg-white/80 p-4 shadow-[0_15px_40px_rgba(15,23,42,0.05)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          {dateTime ? dateTime.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' }) : 'Loading day context'}
        </p>
        <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {dateTime ? dateTime.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }) : '—'}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          <Search size={16} />
          <input className="w-32 bg-transparent outline-none sm:w-48" placeholder="Search" />
        </label>
        <button className="rounded-full border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
          <BellRing size={16} />
        </button>
      </div>
    </header>
  );
}
