'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/ui/sidebar';
import { TopNav } from '@/components/ui/top-nav';
import { GlowProvider } from '@/lib/context/glow-provider';
import { QuickAdd } from '@/components/quick-add/quick-add';
import { isEditorialRoute } from '@/lib/editorial-routes';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const editorial = isEditorialRoute(pathname);
  return (
    <GlowProvider>
      <div
        className={editorial ? 'app-shell editorial-shell' : 'min-h-screen p-3 transition-colors sm:p-4 lg:p-6'}
        style={{ backgroundColor: 'var(--glow-bg)', color: 'var(--glow-text)' }}
      >
        <div className={editorial ? 'editorial-shell-inner' : 'mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row'}>
          <div className={editorial ? 'editorial-sidebar-wrap' : 'w-full lg:w-72 lg:shrink-0'}>
            <Sidebar />
          </div>
          <div className={editorial ? 'editorial-content' : 'flex min-w-0 flex-1 flex-col gap-4'}>
            <TopNav />
            <main
              className={editorial ? 'editorial-main' : 'rounded-glow border p-4 backdrop-blur-sm sm:p-6 lg:p-8'}
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
