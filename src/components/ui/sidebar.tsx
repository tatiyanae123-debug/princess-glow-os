'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell, BrainCircuit, CalendarDays, CheckSquare2, CircleDot, FolderKanban, Goal, Grid2X2,
  Home, Menu, NotebookTabs, Search, Settings, Sparkles, TimerReset, UserRound, X,
  Heart, Dumbbell, Utensils, Scissors, Shirt, WalletCards, Music2, LockKeyhole, Upload,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

type Item = { label: string; href: string; icon: typeof Home };
type Group = { label: string; items: Item[] };

const GROUPS: Group[] = [
  { label: 'TODAY', items: [
    { label: 'Dashboard', href: '/dashboard', icon: Grid2X2 },
    { label: 'Second Brain', href: '/second-brain', icon: BrainCircuit },
    { label: 'Calendar', href: '/calendar', icon: CalendarDays },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare2 },
    { label: 'Reminders', href: '/reminders', icon: Bell },
    { label: 'Briefings', href: '/briefings/morning', icon: NotebookTabs },
  ]},
  { label: 'LIFE', items: [
    { label: 'Routines', href: '/routines', icon: Sparkles },
    { label: 'Habits', href: '/habits', icon: CheckSquare2 },
    { label: 'Fitness', href: '/fitness', icon: Dumbbell },
    { label: 'Wellness', href: '/wellness', icon: Heart },
    { label: 'Food', href: '/food', icon: Utensils },
    { label: 'Beauty', href: '/beauty', icon: Sparkles },
    { label: 'Hair', href: '/hair', icon: Scissors },
    { label: 'Closet', href: '/closet', icon: Shirt },
    { label: 'Home', href: '/home', icon: Home },
  ]},
  { label: 'GROW', items: [
    { label: 'Goals', href: '/goals', icon: Goal },
    { label: 'Projects', href: '/projects', icon: FolderKanban },
    { label: 'Planning', href: '/planning', icon: TimerReset },
    { label: 'Finance', href: '/finance', icon: WalletCards },
    { label: 'Financial Brain', href: '/finance/brain', icon: BrainCircuit },
  ]},
  { label: 'BRAIN', items: [
    { label: 'Brain', href: '/brain', icon: BrainCircuit },
    { label: 'Concierge', href: '/concierge', icon: Sparkles },
    { label: 'Observations', href: '/observations', icon: CircleDot },
    { label: 'Memory', href: '/memory', icon: NotebookTabs },
    { label: 'Timeline', href: '/timeline', icon: CircleDot },
    { label: 'Notes', href: '/notes', icon: NotebookTabs },
  ]},
  { label: 'CONNECT', items: [
    { label: 'Gmail', href: '/gmail', icon: Bell },
    { label: 'Connections', href: '/connections', icon: UserRound },
    { label: 'Spotify', href: '/spotify', icon: Music2 },
    { label: 'Vault', href: '/vault', icon: LockKeyhole },
  ]},
  { label: 'SYSTEM', items: [
    { label: 'World', href: '/world', icon: Grid2X2 },
    { label: 'Import', href: '/import', icon: Upload },
    { label: 'All Rooms', href: '/all-rooms', icon: Grid2X2 },
    { label: 'Work', href: '/work', icon: UserRound },
    { label: 'Travel', href: '/travel', icon: CalendarDays },
    { label: 'Creative Studio', href: '/creative-studio', icon: Sparkles },
    { label: 'Settings', href: '/settings', icon: Settings },
  ]},
];

function active(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function FullNavigation({ compact = false }: { compact?: boolean }) {
  const pathname = usePathname();
  return <div className={compact ? 'space-y-5' : 'space-y-6'}>
    {GROUPS.map((group) => <section key={group.label}>
      <p className={cn('mb-2 font-semibold tracking-[.15em] text-[#96908c]', compact ? 'px-2 text-[8.5px]' : 'px-3 text-[10px]')}>{group.label}</p>
      <div className="space-y-0.5">
        {group.items.map(({ label, href, icon: Icon }) => <Link key={`${group.label}-${href}`} href={href} className={cn('flex items-center rounded-[12px] transition', compact ? 'min-h-[38px] gap-2.5 px-2.5 text-[11px]' : 'min-h-[44px] gap-3 px-3 text-[13px]', active(pathname, href) ? 'bg-[#f8e4e7] font-medium text-[#b85b70]' : 'text-[#45403c] hover:bg-[#faf5f3]')}>
          <Icon size={compact ? 15 : 17} strokeWidth={1.45}/><span>{label}</span>
        </Link>)}
      </div>
    </section>)}
  </div>;
}

function ReferenceSidebar() {
  function openSearch() { document.dispatchEvent(new CustomEvent('glow:search-open')); }
  function openCapture() { document.dispatchEvent(new CustomEvent('glow:voice-open')); }
  return <aside className="flex h-full min-h-[100dvh] w-[238px] flex-col border-r border-[#ebe6e3] bg-white px-4 pb-4 pt-5 text-[#282421]">
    <Link href="/dashboard" className="flex h-[44px] shrink-0 items-center gap-3 px-2"><Sparkles size={19} strokeWidth={1.35} className="text-[#c85f78]"/><span className="font-serif text-[17px] font-semibold tracking-[.09em]">GLOW OS</span></Link>
    <button type="button" onClick={openCapture} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-[13px] bg-[#c45f76] px-3 text-[10.5px] font-medium text-white shadow-[0_7px_20px_rgba(196,95,118,.18)]"><Sparkles size={13}/>Tell Glow anything</button>
    <nav className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin]"><FullNavigation compact /></nav>
    <div className="shrink-0 border-t border-[#eee8e5] pt-3"><div className="grid grid-cols-3 gap-1 text-[#5d5651]"><button type="button" onClick={openSearch} aria-label="Search Glow" className="flex h-10 items-center justify-center rounded-full hover:bg-[#f7eeed]"><Search size={16}/></button><Link href="/notices" aria-label="Attention center" className="flex h-10 items-center justify-center rounded-full hover:bg-[#f7eeed]"><Bell size={16}/></Link><Link href="/settings" aria-label="Settings" className="flex h-10 items-center justify-center rounded-full hover:bg-[#f7eeed]"><Settings size={16}/></Link></div></div>
  </aside>;
}

export function Sidebar({ variant = 'default' }: { variant?: 'default' | 'dashboard-reference' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  if (variant === 'dashboard-reference') return <ReferenceSidebar />;
  return <aside className="flex h-full w-full flex-col border-b border-[#EEE9E6] bg-white px-3 py-2.5 lg:min-h-screen lg:w-[220px] lg:border-b-0 lg:border-r lg:px-3.5 lg:py-5">
    <div className="flex min-h-[40px] items-center justify-between px-1"><Link href="/dashboard" className="flex min-w-0 items-center gap-2 text-[#2D2927]"><Sparkles size={17} className="text-[#c85f78]"/><span className="font-serif text-[18px] font-semibold tracking-[.06em]">Glow OS</span></Link><button type="button" onClick={() => setMobileOpen((value) => !value)} className="rounded-full p-2 text-[#756D68] lg:hidden" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}>{mobileOpen ? <X size={18}/> : <Menu size={18}/>}</button></div>
    <div className={cn('mt-3 min-h-0 flex-1 overflow-y-auto pb-4 lg:mt-5', mobileOpen ? 'block' : 'hidden lg:block')}><FullNavigation compact /></div>
  </aside>;
}