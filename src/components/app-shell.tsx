'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';
import { TopNav } from '@/components/ui/top-nav';
import { GlowProvider } from '@/lib/context/glow-provider';
import { QuickAdd } from '@/components/quick-add/quick-add';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GlowProvider>
      <div
        className="min-h-screen p-3 transition-colors sm:p-4 lg:p-6"
        style={{ backgroundColor: 'var(--glow-bg)', color: 'var(--glow-text)' }}
      >
        <Link
          href="/dashboard"
          aria-label="Go to Glow OS Home"
          className="fixed left-3 top-3 z-[100] inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3 py-2 text-xs font-medium text-slate-700 shadow-[0_10px_35px_rgba(15,23,42,0.10)] backdrop-blur-xl transition hover:bg-white sm:left-4 sm:top-4"
        >
          <Home size={15} strokeWidth={1.7} />
          <span>Home</span>
        </Link>

        <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row">
          <div className="w-full lg:w-72 lg:shrink-0">
            <Sidebar />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <TopNav />
            <main
              className="rounded-glow border p-4 backdrop-blur-sm sm:p-6 lg:p-8"
              style={{
                background: 'var(--glow-surface)',
                borderColor: 'var(--glow-border)',
                boxShadow: 'var(--glow-shadow)',
              }}
            >
              {children}
            </main>
          </div>
        </div>
      </div>
      <QuickAdd />
    </GlowProvider>
  );
}
