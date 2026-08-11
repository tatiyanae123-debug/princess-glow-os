'use client';

import { ChevronDown, Database, ShieldCheck } from 'lucide-react';
import { useEffect, useRef } from 'react';

export function DataConnectionVault({ children }: { children: React.ReactNode }) {
  const detailsRef=useRef<HTMLDetailsElement>(null);

  useEffect(()=>{
    const openVault=()=>{
      const details=detailsRef.current;
      if(!details)return;
      details.open=true;
      window.requestAnimationFrame(()=>details.scrollIntoView({behavior:'smooth',block:'start'}));
    };
    document.addEventListener('glow:vault-open',openVault);
    return()=>document.removeEventListener('glow:vault-open',openVault);
  },[]);

  return (
    <details ref={detailsRef} className="data-connection-vault mt-5 overflow-hidden rounded-[18px] border border-[#dfd2cb] bg-[#fffaf6]/88">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-4 py-3 text-[#4a3b35] sm:px-5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f1dfdc] text-[#a96372]">
          <Database size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-semibold tracking-[.08em]">ALL DATA + CONNECTIONS</span>
          <span className="mt-0.5 block text-[9px] leading-4 text-[#8b7770]">Nothing was deleted. Open this only when you need an existing advanced tool that has not yet been remapped into the new room surface.</span>
        </span>
        <ShieldCheck size={15} className="text-[#8b9d78]" />
        <ChevronDown size={16} className="vault-chevron text-[#9c8880] transition-transform" />
      </summary>
      <div className="border-t border-[#eaded8] bg-[#fffdfb] p-3 sm:p-5">
        <div className="max-h-[72vh] overflow-auto rounded-[14px] border border-[#eee4df] bg-white p-2 sm:p-4">
          {children}
        </div>
      </div>
    </details>
  );
}
