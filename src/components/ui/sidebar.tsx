'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Crown, Menu, X, Heart } from 'lucide-react';
import { navItems, type NavItem } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useGlow } from '@/lib/context/glow-provider';
import { THEMES } from '@/lib/themes';
import { useMemo, useState } from 'react';

const GROUPS: Array<{label:string;paths:string[]}> = [
  {label:'TODAY',paths:['/dashboard','/today','/tomorrow','/tasks','/calendar','/planning','/briefings']},
  {label:'SELF',paths:['/habits','/fitness','/wellness','/beauty','/beauty/lab','/hair','/maintenance']},
  {label:'LIFE',paths:['/finance','/finance/brain','/goals','/home','/closet']},
  {label:'CREATE',paths:['/projects','/notes','/resources']},
  {label:'INTELLIGENCE',paths:['/brain','/concierge','/observations','/memory','/timeline','/inbox','/intake','/rules']},
  {label:'WORLD',paths:['/world']},
  {label:'SYSTEM',paths:['/gmail','/connections','/import','/settings']},
];

export function Sidebar() {
  const pathname = usePathname();
  const { themeId, setTheme, isCustomizing } = useGlow();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed,setCollapsed]=useState<Record<string,boolean>>({});
  const byHref=useMemo(()=>new Map(navItems.map(item=>[item.href,item])),[]);
  const used=new Set(GROUPS.flatMap(group=>group.paths));
  const fallback=navItems.filter(item=>!used.has(item.href));

  const renderItem=(item:NavItem)=>{
    const Icon=item.icon;
    const active=pathname===item.href||pathname.startsWith(item.href+'/');
    return <Link key={item.href} href={item.href} onClick={()=>setMobileOpen(false)} className={cn('group flex min-h-[32px] items-center gap-2.5 rounded-[9px] px-2.5 py-1.5 text-[10px] transition-all',active?'bg-[#e5c6c5] text-[#4a3334] shadow-[inset_0_0_0_1px_rgba(164,100,108,.07)]':'text-[#5e4f49] hover:bg-white/35 hover:text-[#302622]')}>
      <Icon size={13} strokeWidth={1.7} className="shrink-0"/><span className="truncate">{item.label}</span>
    </Link>;
  };

  return (
    <aside className="flex h-full w-full flex-col border-b border-[#dfd0c6] bg-[linear-gradient(180deg,#efe2d8_0%,#f3e9e1_55%,#eee0d6_100%)] px-4 py-4 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-3 lg:py-5">
      <div className="flex items-center justify-between lg:block lg:text-center">
        <div>
          <Crown className="mx-auto hidden text-[#b68a53] lg:block" size={20} strokeWidth={1.6}/>
          <h2 className="glow-display mt-1 text-[27px] leading-none tracking-[-.035em] text-[#302622]">GLOW OS</h2>
          <p className="mt-1 text-[7px] font-semibold uppercase tracking-[.18em] text-[#79665f]">Princess Command Center</p>
        </div>
        <button type="button" onClick={()=>setMobileOpen((open)=>!open)} className="rounded-xl border border-[#d8c7bc] bg-white/35 p-2 text-[#6d5951] lg:hidden" aria-label={mobileOpen?'Close navigation':'Open navigation'}>{mobileOpen?<X size={20}/>:<Menu size={20}/>}</button>
      </div>

      <div className={cn('mt-5 min-h-0 flex-1 lg:flex lg:flex-col',mobileOpen?'block':'hidden lg:flex')}>
        <div className="mb-4 text-center">
          <div className="mx-auto flex h-[78px] w-[78px] items-center justify-center overflow-hidden rounded-full border-[4px] border-[#ead9ce] bg-[linear-gradient(145deg,#cbb5aa,#806a61)] shadow-[0_8px_20px_rgba(83,61,52,.11)]">
            <span className="glow-display text-xl text-white/90">TC</span>
          </div>
          <p className="glow-display mt-2 text-[16px] text-[#352b27]">Tatiyana Curran</p>
          <p className="mt-0.5 text-[8px] tracking-wide text-[#7c6961]">Modern American Princess</p>
        </div>

        <nav aria-label="Glow OS navigation" className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
          {GROUPS.map(group=>{
            const items=group.paths.map(path=>byHref.get(path)).filter(Boolean) as NavItem[];
            const open=!collapsed[group.label];
            const groupActive=items.some(item=>pathname===item.href||pathname.startsWith(item.href+'/'));
            return <div key={group.label}>
              <button type="button" onClick={()=>setCollapsed(current=>({...current,[group.label]:!current[group.label]}))} className="flex w-full items-center justify-between px-2 py-1 text-left">
                <span className={cn('text-[7px] font-bold uppercase tracking-[.18em]',groupActive?'text-[#9f6670]':'text-[#9a857c]')}>{group.label}</span>
                <ChevronDown size={10} className={cn('text-[#a89086] transition',open?'rotate-0':'-rotate-90')}/>
              </button>
              {open?<div className="space-y-[1px]">{items.map(renderItem)}</div>:null}
            </div>;
          })}
          {fallback.length?<div><p className="px-2 py-1 text-[7px] font-bold uppercase tracking-[.18em] text-[#9a857c]">MORE</p>{fallback.map(renderItem)}</div>:null}
        </nav>

        <div className="paper-card mt-4 overflow-hidden p-3 text-left">
          <p className="glow-display text-[11px] text-[#4b3d38]">Daily Affirmation</p>
          <div className="my-2 h-px bg-[#d9c8bd]"/>
          <p className="text-[9px] leading-4 text-[#65544e]">I&apos;m building the life I used to dream about.</p>
          <Heart size={12} className="ml-auto mt-2 text-[#b66f79]"/>
          <div className="mt-3 h-12 rounded-[3px] bg-[radial-gradient(circle_at_20%_70%,#e1b6bc_0_8%,transparent_9%),radial-gradient(circle_at_42%_64%,#d9aaa9_0_8%,transparent_9%),radial-gradient(circle_at_66%_72%,#efc8c8_0_8%,transparent_9%),linear-gradient(180deg,transparent,#e9ddd4)]"/>
        </div>

        <div className="mt-3 grid grid-cols-7 gap-1">
          {THEMES.map((t)=><button key={t.id} type="button" title={t.name} onClick={()=>setTheme(t.id)} disabled={isCustomizing} className={cn('h-3 rounded-full border border-white/60 transition',themeId===t.id?'ring-1 ring-[#806b62]':'opacity-60 hover:opacity-100')} style={{background:t.tokens.accent}} aria-label={`Switch to ${t.name} theme`}/>) }
        </div>
      </div>
    </aside>
  );
}
