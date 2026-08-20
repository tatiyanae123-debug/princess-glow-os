'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, BrainCircuit, CalendarDays, CircleDot, Home, Menu, Plus, Search, Settings, Sparkles, WandSparkles, X, type LucideIcon } from 'lucide-react';
import { ProductivityModeControl } from '@/components/productivity-mode-control';

type Area = { label: string; href: string; icon: LucideIcon; paths: string[]; children: { label: string; href: string }[] };

const AREAS: Area[] = [
  { label: 'Today', href: '/today', icon: CircleDot, paths: ['/today','/dashboard','/briefings','/tomorrow','/day-mode'], children: [
    { label: 'Morning Brief', href: '/briefings/morning' }, { label: 'Today', href: '/today' }, { label: 'Evening Debrief', href: '/briefings/evening' },
  ]},
  { label: 'Plan', href: '/plan', icon: CalendarDays, paths: ['/plan','/calendar','/tasks','/reminders','/planning','/goals','/projects','/routines','/habits','/focus'], children: [
    { label: 'Calendar', href: '/calendar' }, { label: 'Tasks', href: '/tasks' }, { label: 'Reminders', href: '/reminders' }, { label: 'Planning', href: '/planning' }, { label: 'Goals', href: '/goals' }, { label: 'Projects', href: '/projects' }, { label: 'Routines', href: '/routines' }, { label: 'Habits', href: '/habits' },
  ]},
  { label: 'Life', href: '/life', icon: Home, paths: ['/life','/wellness','/fitness','/food','/maintenance','/beauty','/hair','/closet','/home','/finance','/money','/work','/all-rooms','/world','/travel','/saint-space'], children: [
    { label: 'Body', href: '/life#body' }, { label: 'Beauty', href: '/life#beauty' }, { label: 'Home', href: '/life#home' }, { label: 'Money', href: '/life#money' }, { label: 'Work', href: '/life#work' },
  ]},
  { label: 'Brain', href: '/brain', icon: BrainCircuit, paths: ['/brain','/second-brain','/vault','/memory','/timeline','/observations','/graph','/connections','/notices','/concierge','/rules','/knowledge'], children: [
    { label: 'Insights', href: '/brain' }, { label: 'Second Brain', href: '/second-brain' }, { label: 'Vault', href: '/vault' }, { label: 'Memory', href: '/memory' }, { label: 'Timeline', href: '/timeline' }, { label: 'Observations', href: '/observations' }, { label: 'Graph', href: '/graph' }, { label: 'Connections', href: '/connections' }, { label: 'Notices', href: '/notices' }, { label: 'Concierge', href: '/concierge' },
  ]},
  { label: 'Create', href: '/create', icon: WandSparkles, paths: ['/create','/creative-studio','/notes','/resources','/import','/gmail','/inbox','/intake'], children: [
    { label: 'Capture', href: '/intake' }, { label: 'Creative Studio', href: '/creative-studio' }, { label: 'Notes', href: '/notes' }, { label: 'Inbox', href: '/inbox' }, { label: 'Gmail', href: '/gmail' }, { label: 'Import', href: '/import' },
  ]},
];

function matches(pathname: string, href: string) {
  const path = href.split('#')[0];
  if (path === '/brain') return pathname === '/brain';
  return pathname === path || pathname.startsWith(`${path}/`);
}

export function UniversalMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => { setOpen(false); }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [open]);

  function openSearch() { setOpen(false); document.dispatchEvent(new CustomEvent('glow:search-open')); }
  function quickAdd() { setOpen(false); document.dispatchEvent(new CustomEvent('glow:quick-add')); }
  const activeArea = AREAS.find((area) => area.paths.some((path) => matches(pathname, path)));

  return <>
    <div className="sticky top-0 z-[72] flex min-h-[58px] w-full items-center justify-between border-b border-[#eee8e5] bg-white px-3.5 pb-2 pt-[max(8px,env(safe-area-inset-top))] shadow-[0_3px_14px_rgba(62,43,36,.035)] xl:hidden" style={{backgroundColor:'#fff',opacity:1}}>
      <Link href="/dashboard" className="flex min-w-0 items-center gap-2.5 text-[#282421]"><Sparkles size={17} strokeWidth={1.4} className="text-[#c85f78]"/><span className="font-serif text-[16px] font-semibold tracking-[.08em]">GLOW OS</span></Link>
      <div className="flex items-center gap-1.5"><button type="button" onClick={openSearch} aria-label="Search Glow" className="flex h-9 w-9 items-center justify-center rounded-full text-[#5d5651] hover:bg-[#f8efee]"><Search size={16}/></button><button type="button" onClick={()=>setOpen(true)} aria-label="Open navigation" className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eee5e1] bg-white text-[#4c4541] shadow-sm hover:bg-[#f8efee]"><Menu size={18}/></button></div>
    </div>
    {open ? <button type="button" aria-label="Close navigation overlay" onClick={()=>setOpen(false)} className="fixed inset-0 z-[88] bg-black/35 xl:hidden"/> : null}
    <aside className={`fixed inset-y-0 left-0 z-[90] flex w-[min(90vw,390px)] flex-col border-r border-[#ebe6e3] bg-white text-[#282421] shadow-[20px_0_55px_rgba(53,38,31,.18)] transition-transform duration-200 xl:hidden ${open?'translate-x-0':'-translate-x-full'}`} style={{backgroundColor:'#fff',opacity:1}} aria-hidden={!open}>
      <div className="flex min-h-[72px] shrink-0 items-center justify-between border-b border-[#eee8e5] bg-white px-5 pb-3 pt-[max(12px,env(safe-area-inset-top))]"><Link href="/dashboard" className="flex items-center gap-3"><Sparkles size={22} strokeWidth={1.35} className="text-[#c85f78]"/><span className="font-serif text-[22px] font-semibold tracking-[.09em]">GLOW OS</span></Link><button type="button" onClick={()=>setOpen(false)} aria-label="Close navigation" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-[#f8efee]"><X size={19}/></button></div>
      <div className="border-b border-[#eee8e5] bg-white px-5 py-4"><ProductivityModeControl /></div>
      <nav className="min-h-0 flex-1 overflow-y-auto bg-white px-5 py-5 [scrollbar-width:thin]">
        <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[.16em] text-[#9b918b]">Your world</p>
        <div className="space-y-2">
          {AREAS.map((area) => {
            const Icon = area.icon; const active = activeArea?.label === area.label;
            return <div key={area.label}>
              <Link href={area.href} aria-current={active?'page':undefined} className={`flex min-h-[48px] items-center gap-3 rounded-[16px] px-3.5 text-[15px] transition ${active?'bg-[#fae4e7] font-medium text-[#b85169]':'text-[#393431] hover:bg-[#f8efee]'}`}><Icon size={18} strokeWidth={1.45}/><span>{area.label}</span></Link>
              {active ? <div className="ml-5 mt-1 space-y-0.5 border-l border-[#eee5e1] pl-4">{area.children.map((child)=><Link key={child.href} href={child.href} className={`block rounded-[10px] px-3 py-2 text-[12.5px] ${matches(pathname,child.href)?'font-medium text-[#b85169]':'text-[#817771] hover:bg-[#fbf7f5]'}`}>{child.label}</Link>)}</div> : null}
            </div>;
          })}
        </div>
        <div className="mt-7 border-t border-[#eee8e5] pt-5">
          <Link href="/notices" className="flex min-h-[44px] items-center gap-3 rounded-[14px] px-3 text-[14px] text-[#393431] hover:bg-[#f8efee]"><Bell size={17}/>Attention Center</Link>
          <Link href="/settings" className="flex min-h-[44px] items-center gap-3 rounded-[14px] px-3 text-[14px] text-[#393431] hover:bg-[#f8efee]"><Settings size={17}/>Settings</Link>
        </div>
      </nav>
      <div className="shrink-0 border-t border-[#eee8e5] bg-white px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-4"><button type="button" onClick={quickAdd} className="flex h-[54px] w-full items-center justify-center gap-3 rounded-full bg-[#cd6b7e] px-5 text-[16px] font-medium text-white shadow-[0_9px_24px_rgba(190,85,107,.22)]"><Plus size={19}/>Add Anything <Sparkles size={15}/></button></div>
    </aside>
  </>;
}
