'use client';

import Link from 'next/link';
import { Bell, Plus, Search, UserRound } from 'lucide-react';

export function Batch6TopControls(){
  return <div className="pointer-events-none absolute right-4 top-3 z-20 flex items-center gap-1.5 md:right-5 lg:right-6">
    <button type="button" onClick={()=>document.dispatchEvent(new CustomEvent('glow:search-open'))} aria-label="Search Glow" className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#514a45] transition hover:bg-[#f8f1ee]"><Search size={12.5}/></button>
    <Link href="/notices" aria-label="Notifications" className="pointer-events-auto relative grid h-7 w-7 place-items-center rounded-full bg-white/90 text-[#514a45] transition hover:bg-[#f8f1ee]"><Bell size={12.5}/><span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-[#86505d]"/></Link>
    <button type="button" onClick={()=>document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:{}}))} aria-label="Quick add" className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full bg-[#7c4857] text-white shadow-[0_5px_14px_rgba(90,54,66,.14)]"><Plus size={12}/></button>
    <Link href="/settings?section=profile" aria-label="Profile" className="pointer-events-auto grid h-7 w-7 place-items-center rounded-full bg-[#f2e5e2] text-[#744653]"><UserRound size={12}/></Link>
  </div>;
}
