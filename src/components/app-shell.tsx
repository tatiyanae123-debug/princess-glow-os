'use client';

import { Sidebar } from '@/components/ui/sidebar';
import { TopNav } from '@/components/ui/top-nav';
import { GlowProvider } from '@/lib/context/glow-provider';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <GlowProvider>
      <div
        className="min-h-screen p-3 transition-colors sm:p-4 lg:p-6"
        style={{ backgroundColor: 'var(--glow-bg)', color: 'var(--glow-text)' }}
      >
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
    </GlowProvider>
  );
}
