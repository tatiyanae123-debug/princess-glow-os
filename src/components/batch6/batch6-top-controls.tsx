'use client';

import Link from 'next/link';
import { Bell, Plus, Search } from 'lucide-react';

export function Batch6TopControls(){
  return <div className="pointer-events-none absolute right-3 top-2.5 z-20 flex items-center gap-1 md:right-4 lg:right-5">
    <button type="button" onClick={()=>document.dispatchEvent(new CustomEvent('glow:search-open'))} aria-label="Search Glow" className="pointer-events-auto grid h-6 w-6 place-items-center rounded-full text-[#514a45] transition hover:bg-[#f8f1ee] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d9c0c4]"><Search size={11.5} strokeWidth={1.45}/></button>
    <Link href="/notices" aria-label="Notifications" className="pointer-events-auto relative grid h-6 w-6 place-items-center rounded-full text-[#514a45] transition hover:bg-[#f8f1ee] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d9c0c4]"><Bell size={11.5} strokeWidth={1.45}/><span className="absolute right-[4px] top-[4px] h-[3px] w-[3px] rounded-full bg-[#86505d]"/></Link>
    <button type="button" onClick={()=>document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:{}}))} aria-label="Quick add" className="pointer-events-auto grid h-6 w-6 place-items-center rounded-full bg-[#814b59] text-white shadow-[0_4px_12px_rgba(90,54,66,.12)] transition hover:bg-[#734451] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d9c0c4]"><Plus size={10.5} strokeWidth={1.8}/></button>
    <Link href="/settings?section=profile" aria-label="Profile" className="pointer-events-auto grid h-6 w-6 place-items-center overflow-hidden rounded-full border border-[#eadbd7] bg-[linear-gradient(145deg,#ead2cf,#f7e8e5)] font-serif text-[8px] text-[#70434d] transition hover:border-[#dbc4c0] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#d9c0c4]">T</Link>
  </div>;
}
