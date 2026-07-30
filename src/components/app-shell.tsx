'use client';

import { Sidebar } from '@/components/ui/sidebar';
import { TopNav } from '@/components/ui/top-nav';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(253,230,138,0.25),_transparent_40%),linear-gradient(135deg,_#fffaf7_0%,_#fdf2f8_100%)] p-3 text-slate-800 transition-colors dark:bg-[radial-gradient(circle_at_top_left,_rgba(244,114,182,0.18),_transparent_40%),linear-gradient(135deg,_#020617_0%,_#111827_100%)] dark:text-slate-100 sm:p-4 lg:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row">
        <div className="w-full lg:w-72">
          <Sidebar />
        </div>
        <div className="flex-1 space-y-4">
          <TopNav />
          <main className="rounded-[30px] border border-slate-200/70 bg-white/80 p-4 shadow-[0_25px_80px_rgba(15,23,42,0.06)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
