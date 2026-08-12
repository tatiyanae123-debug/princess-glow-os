'use client';

import { Database, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export function DataConnectionVault({ children }: { children: React.ReactNode }) {
  const [open,setOpen]=useState(false);

  useEffect(()=>{
    const openVault=()=>setOpen(true);
    const closeVault=()=>setOpen(false);
    document.addEventListener('glow:vault-open',openVault);
    document.addEventListener('glow:vault-close',closeVault);
    return()=>{
      document.removeEventListener('glow:vault-open',openVault);
      document.removeEventListener('glow:vault-close',closeVault);
    };
  },[]);

  if(!open) return null;

  return (
    <div className="fixed inset-0 z-[140] bg-black/20 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Advanced data and connections">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close advanced tools" onClick={()=>setOpen(false)}/>
      <section className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-hidden rounded-t-[24px] border border-[#E7E7E7] bg-white shadow-[0_-18px_60px_rgba(0,0,0,.12)] sm:inset-y-5 sm:left-auto sm:right-5 sm:w-[760px] sm:max-h-none sm:rounded-[22px]">
        <header className="flex min-h-16 items-center gap-3 border-b border-[#ECECEC] px-5 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8EFF1] text-[#B86F7D]"><Database size={18}/></span>
          <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold tracking-[.06em] text-[#28282B]">ADVANCED DATA + CONNECTIONS</span><span className="mt-1 block text-[12px] leading-5 text-[#77777C]">Legacy and connected tools remain available here without changing the new Glow OS room design.</span></span>
          <ShieldCheck size={17} className="text-[#8B9D78]"/>
          <button type="button" onClick={()=>setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[#E8E8E8] text-[#55555A]" aria-label="Close advanced tools"><X size={17}/></button>
        </header>
        <div className="max-h-[calc(86vh-64px)] overflow-auto bg-[#FAFAFA] p-3 sm:h-[calc(100%-64px)] sm:max-h-none sm:p-5">
          <div className="rounded-[16px] border border-[#ECECEC] bg-white p-3 sm:p-5">{children}</div>
        </div>
      </section>
    </div>
  );
}
