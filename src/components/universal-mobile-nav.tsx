'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Bell, BrainCircuit, CalendarDays, CheckSquare2, CircleDot, FolderKanban, Goal, Grid2X2,
  Home, Menu, NotebookTabs, Search, Settings, Sparkles, TimerReset, UserRound, X,
  Heart, Dumbbell, Utensils, Scissors, Shirt, WalletCards, Music2, LockKeyhole, Upload,
} from 'lucide-react';

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

export function UniversalMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function openSearch() {
    setOpen(false);
    document.dispatchEvent(new CustomEvent('glow:search-open'));
  }
  function openCapture() {
    setOpen(false);
    document.dispatchEvent(new CustomEvent('glow:voice-open'));
  }

  return <>
    <div className="sticky top-0 z-[72] flex min-h-[58px] w-full items-center justify-between border-b border-[#eee8e5] bg-white px-3.5 pb-2 pt-[max(8px,env(safe-area-inset-top))] shadow-[0_3px_14px_rgba(62,43,36,.035)] xl:hidden">
      <button type="button" onClick={() => setOpen(true)} className="flex min-w-0 items-center gap-2.5 text-[#282421]" aria-label="Open Glow OS navigation">
        <Menu size={18} /><span className="font-serif text-[15px] tracking-[.04em]">Glow OS</span>
      </button>
      <div className="flex items-center gap-1">
        <button type="button" onClick={openCapture} aria-label="Tell Glow anything" className="flex h-9 items-center gap-1.5 rounded-full bg-[#c45f76] px-3 text-[10px] font-medium text-white"><Sparkles size={13}/>Add</button>
        <button type="button" onClick={openSearch} aria-label="Search Glow" className="flex h-9 w-9 items-center justify-center rounded-full text-[#5d5651] hover:bg-[#f8efee]"><Search size={17}/></button>
      </div>
    </div>

    {open ? <button type="button" aria-label="Close navigation overlay" onClick={() => setOpen(false)} className="fixed inset-0 z-[88] bg-black/20 xl:hidden"/> : null}

    <aside className={`fixed inset-y-0 left-0 z-[90] flex w-[min(92vw,390px)] flex-col border-r border-[#ebe6e3] bg-white text-[#282421] shadow-[18px_0_50px_rgba(53,38,31,.14)] transition-transform duration-200 xl:hidden ${open ? 'translate-x-0' : '-translate-x-full'}`} aria-hidden={!open}>
      <div className="flex min-h-[80px] shrink-0 items-center justify-between px-7 pb-3 pt-[max(18px,env(safe-area-inset-top))]">
        <Link href="/dashboard" className="flex items-center gap-3"><Sparkles size={23} strokeWidth={1.35} className="text-[#c85f78]"/><span className="font-serif text-[24px] font-semibold tracking-[.11em]">GLOW OS</span></Link>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#f8efee]"><X size={19}/></button>
      </div>

      <div className="px-8 pb-2"><button type="button" onClick={openCapture} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-[#c45f76] px-4 text-[12px] font-medium text-white"><Sparkles size={14}/>Tell Glow anything</button></div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-8 pb-8 pt-3 [scrollbar-width:thin]">
        {GROUPS.map((group) => <section key={group.label} className="mb-7">
          <p className="mb-3 text-[11px] font-semibold tracking-[.16em] text-[#8e8986]">{group.label}</p>
          <div className="space-y-1">
            {group.items.map(({ label, href, icon: Icon }) => <Link key={`${group.label}-${href}`} href={href} className={`flex min-h-[48px] items-center gap-4 rounded-[16px] px-3 text-[16px] transition ${active(pathname, href) ? 'bg-[#f8e4e7] font-medium text-[#b85b70]' : 'text-[#3d3936] hover:bg-[#faf5f3]'}`}>
              <Icon size={20} strokeWidth={1.45}/><span>{label}</span>
            </Link>)}
          </div>
        </section>)}
      </nav>

      <div className="shrink-0 border-t border-[#eee8e5] bg-white px-8 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={openSearch} className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#eee5e1] text-[13px] text-[#544d48]"><Search size={15}/>Search</button>
          <Link href="/settings" className="flex h-11 items-center justify-center gap-2 rounded-full border border-[#eee5e1] text-[13px] text-[#544d48]"><Settings size={15}/>Settings</Link>
        </div>
      </div>
    </aside>
  </>;
}