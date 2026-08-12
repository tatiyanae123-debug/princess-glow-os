'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  CalendarRange,
  ChevronDown,
  CircleDot,
  CircleEllipsis,
  Gem,
  Heart,
  HeartPulse,
  Hexagon,
  Menu,
  Puzzle,
  RefreshCw,
  Sparkles,
  SquarePen,
  Tag,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { navItems, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useMemo, useState } from 'react';

const PRIMARY: Array<{ label: string; href: string; icon: LucideIcon }> = [
  { label: 'Today', href: '/dashboard', icon: CircleDot },
  { label: 'Plan', href: '/planning', icon: CalendarRange },
  { label: 'Tasks', href: '/tasks', icon: SquarePen },
  { label: 'Calendar', href: '/calendar', icon: CalendarDays },
  { label: 'Routines', href: '/routines', icon: RefreshCw },
  { label: 'Habits', href: '/habits', icon: Heart },
  { label: 'Health & Care', href: '/wellness', icon: HeartPulse },
  { label: 'Beauty', href: '/beauty', icon: Sparkles },
  { label: 'Money & Growth', href: '/finance', icon: Hexagon },
  { label: 'Projects', href: '/projects', icon: Tag },
  { label: 'Glow', href: '/brain', icon: Gem },
  { label: 'Life World', href: '/world', icon: Puzzle },
];

const GROUPS: Array<{ label: string; paths: string[] }> = [
  { label: 'PLAN', paths: ['/tasks', '/calendar', '/planning', '/routines', '/habits', '/reminders', '/today', '/tomorrow'] },
  { label: 'HEALTH & CARE', paths: ['/fitness', '/wellness', '/food', '/beauty', '/beauty/lab', '/hair', '/maintenance'] },
  { label: 'MONEY & GROWTH', paths: ['/finance', '/finance/brain', '/goals'] },
  { label: 'GLOW', paths: ['/brain', '/concierge', '/briefings', '/observations', '/inbox', '/memory', '/timeline', '/intake', '/rules'] },
  { label: 'LIBRARY & SYSTEM', paths: ['/notes', '/closet', '/gmail', '/resources', '/connections', '/import', '/settings', '/home'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const byHref = useMemo(() => new Map(navItems.map((item) => [item.href, item])), []);

  const roomItem = (item: NavItem) => {
    const Icon = item.icon;
    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setMobileOpen(false)}
        className={cn(
          'flex min-h-9 items-center gap-2.5 rounded-[10px] px-3 text-[12.5px] transition',
          active ? 'bg-[#FBE4E8] font-medium text-[#B15A68]' : 'text-[#726B67] hover:bg-[#FAF6F4] hover:text-[#2B2420]',
        )}
      >
        <Icon size={14} strokeWidth={1.6} />
        <span>{item.label}</span>
      </Link>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col border-b border-[#F1E7E3] bg-white px-4 py-4 lg:min-h-screen lg:w-[236px] lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 text-[#2B2420]" onClick={() => setMobileOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FBE4E8] text-[#C9727E]"><Sparkles size={15} strokeWidth={1.6} /></span>
          <span className="glow-display text-[20px] tracking-[.01em]">Glow OS</span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen((value) => !value)}
          className="rounded-full p-2 text-[#8A8078] hover:bg-[#FAF6F4] lg:hidden"
          aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div className={cn('mt-7 min-h-0 flex-1 overflow-y-auto', mobileOpen ? 'block' : 'hidden lg:block')}>
        <nav aria-label="Primary Glow OS navigation" className="space-y-1">
          {PRIMARY.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex min-h-[42px] items-center gap-3 rounded-[12px] px-3.5 text-[13.5px] font-medium transition',
                  active ? 'bg-[#FBE4E8] text-[#B15A68]' : 'text-[#4A4440] hover:bg-[#FAF6F4]',
                )}
              >
                <Icon size={16} strokeWidth={1.7} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="my-4 h-px bg-[#F1E7E3]" />

        <button
          type="button"
          onClick={() => setRoomsOpen((value) => !value)}
          className="flex min-h-[38px] w-full items-center justify-between rounded-[10px] px-3.5 text-left text-[12px] font-medium text-[#8A8078] hover:bg-[#FAF6F4]"
          aria-expanded={roomsOpen}
        >
          <span className="flex items-center gap-2.5"><CircleEllipsis size={14} />All Rooms</span>
          <ChevronDown size={13} className={cn('transition-transform', roomsOpen ? 'rotate-180' : '')} />
        </button>

        {roomsOpen ? (
          <div className="mt-3 max-h-[42vh] space-y-4 overflow-y-auto pr-1">
            {GROUPS.map((group) => (
              <section key={group.label}>
                <p className="mb-1 px-3.5 text-[9px] font-semibold uppercase tracking-[.14em] text-[#B5ACA5]">{group.label}</p>
                <div className="space-y-0.5">
                  {group.paths.map((path) => byHref.get(path)).filter(Boolean).map((item) => roomItem(item as NavItem))}
                </div>
              </section>
            ))}
          </div>
        ) : null}
      </div>

      <Link
        href="/settings?section=profile"
        className="hidden items-center gap-2.5 rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] px-3 py-2.5 lg:flex"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F1E0D9] text-[#8A5A56]"><UserRound size={15} /></span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12px] font-medium text-[#3A332E]">Tatiyana</span>
          <span className="block text-[10px] text-[#9A9088]">Glow Member</span>
        </span>
        <ChevronDown size={13} className="shrink-0 text-[#9A9088]" />
      </Link>
    </aside>
  );
}
