'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';
import { GlowProvider } from '@/lib/context/glow-provider';
import { GlobalHeader } from '@/components/global-header';
import { DeferredGlobalControls } from '@/components/deferred-global-controls';

function roomFor(pathname: string) {
  if (pathname.startsWith('/beauty/lab')) return 'beauty-lab';
  if (pathname.startsWith('/skincare') || pathname.startsWith('/makeup')) return 'beauty';
  if (pathname.startsWith('/finance/brain')) return 'financial-brain';
  if (pathname.startsWith('/calendar')) return 'calendar';
  if (pathname.startsWith('/reminders')) return 'reminders';
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/planning') || pathname.startsWith('/tomorrow')) return 'planning';
  if (pathname.startsWith('/routines')) return 'routines';
  if (pathname.startsWith('/today') || pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/habits')) return 'habits';
  if (pathname.startsWith('/fitness')) return 'fitness';
  if (pathname.startsWith('/food')) return 'food';
  if (pathname.startsWith('/beauty')) return 'beauty';
  if (pathname.startsWith('/hair')) return 'hair';
  if (pathname.startsWith('/wellness') || pathname.startsWith('/maintenance')) return 'wellness';
  if (pathname.startsWith('/finance')) return 'finance';
  if (pathname.startsWith('/goals')) return 'goals';
  if (pathname.startsWith('/projects') || pathname.startsWith('/creative-studio')) return 'projects';
  if (pathname.startsWith('/brain') || pathname.startsWith('/inbox') || pathname.startsWith('/intake') || pathname.startsWith('/rules')) return 'brain';
  if (pathname.startsWith('/concierge')) return 'concierge';
  if (pathname.startsWith('/observations')) return 'observations';
  if (pathname.startsWith('/memory')) return 'memory';
  if (pathname.startsWith('/timeline')) return 'timeline';
  if (pathname.startsWith('/briefings')) return 'briefings';
  if (pathname.startsWith('/closet')) return 'closet';
  if (pathname.startsWith('/world') || pathname.startsWith('/life-world')) return 'world';
  if (pathname.startsWith('/home')) return 'home';
  if (pathname.startsWith('/work')) return 'work';
  if (pathname.startsWith('/graph')) return 'graph';
  if (pathname.startsWith('/notices') || pathname.startsWith('/alerts')) return 'notices';
  if (pathname.startsWith('/all-rooms')) return 'all-rooms';
  if (pathname.startsWith('/notes') || pathname.startsWith('/resources')) return 'notes';
  if (pathname.startsWith('/connections')) return 'connections';
  if (pathname.startsWith('/gmail')) return 'gmail';
  if (pathname.startsWith('/import')) return 'import';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/settings')) return 'settings';
  return 'dashboard';
}

const DASHBOARD_WIDTH = 1536;
const DASHBOARD_HEIGHT = 1024;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const room = roomFor(pathname);
  const isReferenceDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const [focus, setFocus] = useState(false);
  const [dashboardScale, setDashboardScale] = useState(1);

  useEffect(() => {
    const sync = () => setFocus(new URLSearchParams(window.location.search).get('focus') === '1');
    sync();
    window.addEventListener('popstate', sync);
    document.addEventListener('glow:focus-changed', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      document.removeEventListener('glow:focus-changed', sync);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isReferenceDashboard) return;
    const resize = () => {
      const width = Math.max(320, document.documentElement.clientWidth || window.innerWidth);
      setDashboardScale(Math.min(1, width / DASHBOARD_WIDTH));
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, [isReferenceDashboard]);

  function exitFocus() {
    const params = new URLSearchParams(window.location.search);
    params.delete('focus');
    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    setFocus(false);
  }

  const content = (
    <div key={pathname} className={isReferenceDashboard ? 'w-full' : 'glow-v3-route-stage mx-auto w-full max-w-[1500px]'}>
      {children}
    </div>
  );

  if (isReferenceDashboard) {
    return (
      <GlowProvider>
        <div className="min-h-screen w-full overflow-x-clip bg-white text-[#25211f]" data-room="dashboard" data-glow-shell="v3" data-focus-mode="false">
          <div
            aria-label="Glow OS dashboard reference canvas"
            className="relative"
            style={{ width: DASHBOARD_WIDTH * dashboardScale, height: DASHBOARD_HEIGHT * dashboardScale, maxWidth: '100vw' }}
          >
            <div
              className="flex h-[1024px] w-[1536px] bg-white"
              style={{ transform: `scale(${dashboardScale})`, transformOrigin: 'top left', willChange: 'transform' }}
            >
              <div className="h-[1024px] w-[238px] shrink-0"><Sidebar variant="dashboard-reference" /></div>
              <main className="h-[1024px] w-[1298px] shrink-0 overflow-hidden p-0">{content}</main>
            </div>
          </div>
        </div>
      </GlowProvider>
    );
  }

  return (
    <GlowProvider>
      <div
        className="min-h-screen overflow-x-clip bg-white text-[#25211f]"
        data-room={room}
        data-glow-shell="v3"
        data-focus-mode={focus ? 'true' : 'false'}
      >
        <div className="flex min-h-screen w-full flex-col bg-white md:flex-row">
          {!focus ? (
            <>
              <div className="w-full md:hidden"><Sidebar /></div>
              <div className="hidden md:sticky md:top-0 md:block md:h-screen md:w-[238px] md:shrink-0 md:overflow-y-auto md:overflow-x-hidden md:border-r md:border-[#ebe6e3] md:bg-white">
                <Sidebar variant="dashboard-reference" />
              </div>
            </>
          ) : null}

          <div className="min-w-0 flex-1 bg-white">
            {!focus ? <GlobalHeader /> : null}
            <main className={focus ? 'min-h-screen px-4 py-8 sm:px-7 lg:px-10' : 'min-h-screen min-w-0 bg-white px-4 pb-24 pt-5 sm:px-6 md:px-7 lg:px-10 lg:pt-7'}>
              {content}
            </main>
          </div>
        </div>
      </div>

      {focus ? (
        <button
          type="button"
          onClick={exitFocus}
          className="fixed right-5 top-5 z-[100] inline-flex h-10 items-center gap-2 rounded-full border border-[#E9E1DE] bg-white px-4 text-[13px] font-medium text-[#44403d] shadow-[0_8px_28px_rgba(53,38,31,.08)]"
        >
          <X size={15} />Exit Focus
        </button>
      ) : null}

      {!focus ? <DeferredGlobalControls /> : null}
    </GlowProvider>
  );
}
