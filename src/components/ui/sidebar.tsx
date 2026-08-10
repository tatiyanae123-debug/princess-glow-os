'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Crown, Menu, X } from 'lucide-react';
import { navItems } from '@/lib/navigation';
import { cn } from '@/lib/utils';
import { useGlow } from '@/lib/context/glow-provider';
import { THEMES } from '@/lib/themes';
import { useState } from 'react';

const primary = ['/dashboard','/today','/planning','/world','/brain','/intake'];
const preferredOrder = [...primary,'/inbox','/tasks','/calendar','/habits','/fitness','/beauty','/finance','/goals','/projects','/resources','/connections','/notes','/settings'];

export function Sidebar() {
  const pathname = usePathname();
  const { themeId, setTheme, isCustomizing } = useGlow();
  const [mobileOpen, setMobileOpen] = useState(false);
  const ordered = [...navItems].sort((a,b)=>{const ai=preferredOrder.indexOf(a.href);const bi=preferredOrder.indexOf(b.href);if(ai===-1&&bi===-1)return 0;if(ai===-1)return 1;if(bi===-1)return -1;return ai-bi;});

  return <aside className="relative flex h-full w-full flex-col overflow-hidden border-b border-[#eadfd6] bg-[#f4e9e1] p-4 sm:p-5 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-4 lg:py-5">
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-56 opacity-70" style={{background:'radial-gradient(circle at 15% 95%, rgba(217,164,175,.32), transparent 28%), radial-gradient(circle at 80% 90%, rgba(199,170,128,.2), transparent 26%)'}} />
    <div className="relative z-10 flex items-center justify-between gap-3 lg:block">
      <div className="text-center lg:text-left">
        <Crown className="mx-auto mb-1 text-[#b98a51] lg:mx-0" size={18}/>
        <h2 className="text-[31px] leading-none tracking-[-0.04em] text-[#241c1a]" style={{fontFamily:'var(--glow-font-display)'}}>GLOW OS</h2>
        <p className="mt-1 text-[8px] font-semibold uppercase tracking-[0.22em] text-[#7f6d66]">Princess Command Center</p>
      </div>
      <button type="button" onClick={()=>setMobileOpen(o=>!o)} className="rounded-xl border border-[#d8c7bd] bg-white/50 p-2 text-[#5e4e49] lg:hidden" aria-label={mobileOpen?'Close navigation':'Open navigation'}>{mobileOpen?<X size={20}/>:<Menu size={20}/>}</button>
    </div>

    <div className={cn('relative z-10 mt-5 min-h-0 flex-1 lg:flex lg:flex-col',mobileOpen?'block':'hidden lg:flex')}>
      <div className="mb-5 text-center">
        <div className="mx-auto flex h-[78px] w-[78px] items-center justify-center rounded-full border-4 border-[#ede0d7] bg-[linear-gradient(145deg,#d8c4b8,#ead8d4)] text-lg font-semibold text-[#4c3f3a] shadow-[0_12px_28px_rgba(109,81,67,.12)]">TC</div>
        <p className="mt-2 text-[17px] text-[#2f2623]" style={{fontFamily:'var(--glow-font-display)'}}>Tatiyana Curran</p>
        <p className="text-[9px] tracking-[.03em] text-[#776661]">Modern American Princess</p>
      </div>

      <nav aria-label="Glow OS navigation" className="min-h-0 space-y-1 overflow-y-auto pr-1">
        {ordered.map((item,index)=>{const Icon=item.icon;const active=pathname===item.href||pathname.startsWith(item.href+'/');const isPrimary=primary.includes(item.href);return <div key={item.href}>
          {index===primary.length&&<p className="mb-2 mt-4 px-3 text-[8px] font-bold uppercase tracking-[.2em] text-[#b09c93]">Systems</p>}
          <Link href={item.href} onClick={()=>setMobileOpen(false)} className={cn('group flex min-h-9 items-center gap-3 rounded-[9px] px-3 py-2 text-[11px] transition-all duration-200',active?'bg-[#e8cfc7] font-medium text-[#5e3438] shadow-[inset_0_0_0_1px_rgba(192,137,139,.12)]':'text-[#514642] hover:bg-white/42 hover:text-[#271f1d]',isPrimary&&'font-medium')}>
            <Icon size={14} className="shrink-0"/><span className="truncate">{item.label}</span>{isPrimary&&item.href==='/intake'?<span className="ml-auto rounded-full bg-[#2d2321] px-1.5 py-0.5 text-[7px] uppercase text-white">New</span>:null}
          </Link>
        </div>})}
      </nav>

      <div className="mt-5 overflow-hidden rounded-[15px] border border-[#eadbd2] bg-[#f9f1ec]/90 p-4 shadow-[0_12px_30px_rgba(113,84,70,.05)]">
        <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#8c7770]">Daily affirmation</p>
        <p className="mt-2 text-[12px] leading-5 text-[#463a36]" style={{fontFamily:'var(--glow-font-display)'}}>I&apos;m building the life<br/>I used to dream about.</p>
        <div className="mt-4 h-12 rounded-xl opacity-70" style={{background:'linear-gradient(120deg,rgba(223,179,183,.35),rgba(247,235,224,.65)), radial-gradient(circle at 20% 70%,rgba(184,134,132,.18),transparent 25%)'}} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">{THEMES.map(t=><button key={t.id} type="button" title={t.name} onClick={()=>setTheme(t.id)} disabled={isCustomizing} className={cn('h-3.5 w-3.5 rounded-full border border-white/70 transition',themeId===t.id?'ring-1 ring-[#735d56] ring-offset-1 ring-offset-[#f4e9e1]':'opacity-60 hover:opacity-100')} style={{background:t.tokens.accent}} aria-label={`Switch to ${t.name} theme`}/>)}</div>
    </div>
  </aside>;
}
