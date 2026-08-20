'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell, BrainCircuit, CalendarDays, CircleDot, Home, Layers3, Menu, NotebookTabs, Plus,
  Search, Settings, Sparkles, WandSparkles, X, type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProductivityModeControl } from '@/components/productivity-mode-control';

type Area = {
  label: string;
  href: string;
  icon: LucideIcon;
  paths: string[];
  children: { label: string; href: string }[];
};

const AREAS: Area[] = [
  {
    label: 'Today', href: '/today', icon: CircleDot,
    paths: ['/today', '/dashboard', '/briefings', '/tomorrow', '/day-mode'],
    children: [
      { label: 'Morning Brief', href: '/briefings/morning' },
      { label: 'Today', href: '/today' },
      { label: 'Evening Debrief', href: '/briefings/evening' },
    ],
  },
  {
    label: 'Plan', href: '/plan', icon: CalendarDays,
    paths: ['/plan', '/calendar', '/tasks', '/reminders', '/planning', '/goals', '/projects', '/routines', '/habits', '/focus'],
    children: [
      { label: 'Calendar', href: '/calendar' },
      { label: 'Tasks', href: '/tasks' },
      { label: 'Reminders', href: '/reminders' },
      { label: 'Planning', href: '/planning' },
      { label: 'Goals', href: '/goals' },
      { label: 'Projects', href: '/projects' },
      { label: 'Routines', href: '/routines' },
      { label: 'Habits', href: '/habits' },
    ],
  },
  {
    label: 'Life', href: '/life', icon: Home,
    paths: ['/life', '/wellness', '/fitness', '/food', '/maintenance', '/beauty', '/skincare', '/makeup', '/hair', '/closet', '/home', '/finance', '/money', '/work', '/career', '/all-rooms', '/world', '/travel', '/saint-space'],
    children: [
      { label: 'Body', href: '/life#body' },
      { label: 'Beauty', href: '/life#beauty' },
      { label: 'Home', href: '/life#home' },
      { label: 'Money', href: '/life#money' },
      { label: 'Work', href: '/life#work' },
    ],
  },
  {
    label: 'Brain', href: '/brain', icon: BrainCircuit,
    paths: ['/brain', '/memory', '/timeline', '/observations', '/graph', '/connections', '/notices', '/concierge', '/rules', '/knowledge'],
    children: [
      { label: 'Insights', href: '/brain' },
      { label: 'Memory', href: '/memory' },
      { label: 'Timeline', href: '/timeline' },
      { label: 'Observations', href: '/observations' },
      { label: 'Graph', href: '/graph' },
      { label: 'Connections', href: '/connections' },
      { label: 'Notices', href: '/notices' },
      { label: 'Concierge', href: '/concierge' },
    ],
  },
  {
    label: 'Create', href: '/create', icon: WandSparkles,
    paths: ['/create', '/creative-studio', '/notes', '/resources', '/import', '/gmail', '/inbox', '/intake'],
    children: [
      { label: 'Capture', href: '/intake' },
      { label: 'Creative Studio', href: '/creative-studio' },
      { label: 'Notes', href: '/notes' },
      { label: 'Inbox', href: '/inbox' },
      { label: 'Gmail', href: '/gmail' },
      { label: 'Import', href: '/import' },
    ],
  },
];

function matches(pathname: string, path: string) {
  if (path === '/brain') return pathname === '/brain';
  if (path === '/finance') return pathname === '/finance' || pathname.startsWith('/finance/');
  return pathname === path || pathname.startsWith(`${path}/`);
}

function areaActive(pathname: string, area: Area) {
  return area.paths.some((path) => matches(pathname, path));
}

function ShellNavigation({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const activeArea = AREAS.find((area) => areaActive(pathname, area));

  return (
    <>
      <div className={mobile ? 'space-y-2' : 'space-y-1.5'}>
        {AREAS.map((area) => {
          const Icon = area.icon;
          const active = activeArea?.label === area.label;
          return (
            <div key={area.label}>
              <Link
                href={area.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-[14px] font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f2cbd3]',
                  mobile ? 'min-h-[48px] px-3.5 text-[15px]' : 'min-h-[42px] px-3 text-[12.5px]',
                  active ? 'bg-[#fae7ea] text-[#b45569]' : 'text-[#443e3a] hover:bg-[#faf5f3]'
                )}
              >
                <Icon size={mobile ? 18 : 16} strokeWidth={1.5} />
                <span>{area.label}</span>
              </Link>
              {active ? (
                <div className={cn('mt-1 space-y-0.5 border-l border-[#eee5e1]', mobile ? 'ml-5 pl-4' : 'ml-5 pl-3')}>
                  {area.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={onNavigate}
                      className={cn(
                        'block rounded-[9px] text-[#817771] transition hover:bg-[#fbf7f5] hover:text-[#5a514c]',
                        mobile ? 'px-3 py-2 text-[12.5px]' : 'px-2.5 py-1.5 text-[10.5px]',
                        matches(pathname, child.href.split('#')[0]) && 'font-medium text-[#b45569]'
                      )}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}

function ReferenceSidebar() {
  function openSearch() { document.dispatchEvent(new CustomEvent('glow:search-open')); }
  function quickAdd() { document.dispatchEvent(new CustomEvent('glow:quick-add')); }

  return (
    <aside className="flex h-full min-h-[100dvh] w-[238px] flex-col border-r border-[#ebe6e3] bg-white px-4 pb-4 pt-5 text-[#282421]">
      <Link href="/today" className="flex h-[44px] shrink-0 items-center gap-3 px-2">
        <Sparkles size={19} strokeWidth={1.35} className="text-[#c85f78]" />
        <span className="font-serif text-[17px] font-semibold tracking-[.09em]">GLOW OS</span>
      </Link>

      <div className="mt-4 px-1"><ProductivityModeControl compact /></div>

      <nav className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
        <p className="mb-2 px-3 text-[9px] font-semibold uppercase tracking-[.16em] text-[#9b918b]">Your world</p>
        <ShellNavigation />
      </nav>

      <div className="shrink-0 border-t border-[#eee8e5] pt-3">
        <button type="button" onClick={quickAdd} className="flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full bg-[#c86679] px-4 text-[12px] font-medium text-white shadow-[0_8px_22px_rgba(185,88,109,.18)]">
          <Plus size={15} /> Add Anything
        </button>
        <div className="mt-2 grid grid-cols-4 gap-1 text-[#5d5651]">
          <button type="button" onClick={openSearch} aria-label="Search Glow" className="flex h-10 items-center justify-center rounded-full hover:bg-[#f7eeed]"><Search size={16} /></button>
          <Link href="/concierge" aria-label="Glow Concierge" className="flex h-10 items-center justify-center rounded-full hover:bg-[#f7eeed]"><Sparkles size={16} /></Link>
          <Link href="/notices" aria-label="Attention center" className="relative flex h-10 items-center justify-center rounded-full hover:bg-[#f7eeed]"><Bell size={16} /></Link>
          <Link href="/settings" aria-label="Settings" className="flex h-10 items-center justify-center rounded-full hover:bg-[#f7eeed]"><Settings size={16} /></Link>
        </div>
      </div>
    </aside>
  );
}

export function Sidebar({ variant = 'default' }: { variant?: 'default' | 'dashboard-reference' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  if (variant === 'dashboard-reference') return <ReferenceSidebar />;

  return (
    <aside className="flex h-full w-full flex-col border-b border-[#EEE9E6] bg-white/96 px-3 py-2.5 backdrop-blur-xl lg:min-h-screen lg:w-[220px] lg:border-b-0 lg:border-r lg:px-3.5 lg:py-5">
      <div className="flex min-h-[40px] items-center justify-between px-1">
        <Link href="/today" className="flex min-w-0 items-center gap-2 text-[#2D2927]"><Sparkles size={17} className="text-[#c85f78]" /><span className="font-serif text-[18px] font-semibold tracking-[.06em]">Glow OS</span></Link>
        <button type="button" onClick={() => setMobileOpen((value) => !value)} className="rounded-full p-2 text-[#756D68] lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}>{mobileOpen ? <X size={18} /> : <Menu size={18} />}</button>
      </div>
      <div className={cn('mt-3 min-h-0 flex-1 overflow-y-auto pb-4 lg:mt-5', mobileOpen ? 'block' : 'hidden lg:block')}>
        <ProductivityModeControl compact />
        <div className="mt-4"><ShellNavigation mobile /></div>
      </div>
    </aside>
  );
}
