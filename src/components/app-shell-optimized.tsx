'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Sidebar } from '@/components/ui/sidebar';
import { GlowProvider } from '@/lib/context/glow-provider';
import { GlobalHeader } from '@/components/global-header';
import { DeferredGlobalControls } from '@/components/deferred-global-controls';
import { GlobalCommandSurface } from '@/components/global-command-surface';

function roomFor(pathname: string) {
  if (pathname.startsWith('/beauty/lab')) return 'beauty-lab';
  if (pathname.startsWith('/skincare') || pathname.startsWith('/makeup')) return 'beauty';
  if (pathname.startsWith('/finance/brain')) return 'financial-brain';
  if (pathname.startsWith('/calendar')) return 'calendar';
  if (pathname.startsWith('/reminders')) return 'reminders';
  if (pathname.startsWith('/alerts') || pathname.startsWith('/notices')) return 'notices';
  if (pathname.startsWith('/tasks')) return 'tasks';
  if (pathname.startsWith('/planning') || pathname.startsWith('/tomorrow') || pathname.startsWith('/day-mode')) return 'planning';
  if (pathname.startsWith('/focus') || pathname.startsWith('/ambient')) return 'focus';
  if (pathname.startsWith('/routines') || pathname.startsWith('/ritual')) return 'routines';
  if (pathname.startsWith('/today') || pathname.startsWith('/dashboard')) return 'dashboard';
  if (pathname.startsWith('/habits')) return 'habits';
  if (pathname.startsWith('/workout-studio')) return 'fitness';
  if (pathname.startsWith('/fitness')) return 'fitness';
  if (pathname.startsWith('/food')) return 'food';
  if (pathname.startsWith('/medications')) return 'medications';
  if (pathname.startsWith('/sleep')) return 'sleep';
  if (pathname.startsWith('/symptoms')) return 'symptoms';
  if (pathname.startsWith('/beauty')) return 'beauty';
  if (pathname.startsWith('/hair')) return 'hair';
  if (pathname.startsWith('/wellness') || pathname.startsWith('/maintenance')) return 'wellness';
  if (pathname.startsWith('/spending')) return 'spending';
  if (pathname.startsWith('/subscriptions')) return 'subscriptions';
  if (pathname.startsWith('/forecast')) return 'forecast';
  if (pathname.startsWith('/transactions')) return 'transactions';
  if (pathname.startsWith('/finance') || pathname.startsWith('/money')) return 'finance';
  if (pathname.startsWith('/goals')) return 'goals';
  if (pathname.startsWith('/creative-studio')) return 'creative-studio';
  if (pathname.startsWith('/projects')) return 'projects';
  if (pathname.startsWith('/brain') || pathname.startsWith('/inbox') || pathname.startsWith('/intake') || pathname.startsWith('/rules') || pathname.startsWith('/knowledge') || pathname.startsWith('/command')) return 'brain';
  if (pathname.startsWith('/concierge')) return 'concierge';
  if (pathname.startsWith('/observations')) return 'observations';
  if (pathname.startsWith('/memory')) return 'memory';
  if (pathname.startsWith('/timeline')) return 'timeline';
  if (pathname.startsWith('/briefings')) return 'briefings';
  if (pathname.startsWith('/closet')) return 'closet';
  if (pathname.startsWith('/travel')) return 'travel';
  if (pathname.startsWith('/world') || pathname.startsWith('/life-world')) return 'world';
  if (pathname.startsWith('/home')) return 'home';
  if (pathname.startsWith('/interview-prep') || pathname.startsWith('/applications') || pathname.startsWith('/interviews')) return 'work';
  if (pathname.startsWith('/work')) return 'work';
  if (pathname.startsWith('/graph')) return 'graph';
  if (pathname.startsWith('/all-rooms')) return 'all-rooms';
  if (pathname.startsWith('/notes') || pathname.startsWith('/resources')) return 'notes';
  if (pathname.startsWith('/connections') || pathname.startsWith('/brain-connection')) return 'connections';
  if (pathname.startsWith('/gmail')) return 'gmail';
  if (pathname.startsWith('/import') || pathname.startsWith('/add-anything')) return 'import';
  if (pathname.startsWith('/search')) return 'search';
  if (pathname.startsWith('/system-overview') || pathname.startsWith('/settings')) return 'settings';
  return 'dashboard';
}

const DASHBOARD_WIDTH = 1536;
const DASHBOARD_HEIGHT = 1024;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const room = roomFor(pathname);
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/');
  const [focus, setFocus] = useState(false);
  const [desktopReference, setDesktopReference] = useState(false);
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
    if (!isDashboardRoute) {
      setDesktopReference(false);
      return;
    }
    const resize = () => {
      const width = Math.max(320, document.documentElement.clientWidth || window.innerWidth);
      const useReferenceCanvas = width >= 1024;
      setDesktopReference(useReferenceCanvas);
      if (useReferenceCanvas) setDashboardScale(Math.min(1, width / DASHBOARD_WIDTH));
    };
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, [isDashboardRoute]);

  function exitFocus() {
    const params = new URLSearchParams(window.location.search);
    params.delete('focus');
    router.replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
    setFocus(false);
  }

  const content = (
    <div key={pathname} className={desktopReference ? 'w-full' : 'glow-v3-route-stage mx-auto w-full max-w-[1560px]'}>
      {children}
    </div>
  );

  if (desktopReference) {
    return (
      <GlowProvider>
        <div className="min-h-screen w-full overflow-x-clip bg-white text-[#25211f]" data-room="dashboard" data-glow-shell="v4-reference" data-focus-mode="false">
          <div aria-label="Glow OS dashboard reference canvas" className="relative" style={{ width: DASHBOARD_WIDTH * dashboardScale, height: DASHBOARD_HEIGHT * dashboardScale, maxWidth: '100vw' }}>
            <div className="flex h-[1024px] w-[1536px] bg-white" style={{ transform: `scale(${dashboardScale})`, transformOrigin: 'top left', willChange: 'transform' }}>
              <div className="h-[1024px] w-[238px] shrink-0"><Sidebar variant="dashboard-reference" /></div>
              <main className="h-[1024px] w-[1298px] shrink-0 overflow-hidden p-0">{content}</main>
            </div>
          </div>
          <GlobalCommandSurface />
          <DeferredGlobalControls />
        </div>
      </GlowProvider>
    );
  }

  return (
    <GlowProvider>
      <div className="min-h-screen overflow-x-clip bg-white text-[#25211f]" data-room={room} data-glow-shell="v4-reference" data-focus-mode={focus ? 'true' : 'false'}>
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
            {!focus && !isDashboardRoute ? <GlobalHeader /> : null}
            <main className={focus ? 'min-h-screen px-4 py-8 sm:px-7 lg:px-10' : isDashboardRoute ? 'min-h-screen min-w-0 bg-white p-0' : 'min-h-screen min-w-0 bg-white px-4 pb-24 pt-5 sm:px-6 md:px-7 lg:px-8 lg:pt-6 xl:px-10'}>
              {content}
            </main>
          </div>
        </div>
      </div>

      {focus ? (
        <button type="button" onClick={exitFocus} className="fixed right-5 top-5 z-[100] inline-flex h-10 items-center gap-2 rounded-full border border-[#E9E1DE] bg-white px-4 text-[13px] font-medium text-[#44403d] shadow-[0_8px_28px_rgba(53,38,31,.08)]">
          <X size={15} />Exit Focus
        </button>
      ) : null}

      {!focus ? <DeferredGlobalControls /> : null}
      {!focus ? <GlobalCommandSurface /> : null}
    </GlowProvider>
  );
}
