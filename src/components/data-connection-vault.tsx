'use client';

import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Every real, data-bound room workspace renders here, always visible, directly
 * beneath the editorial reference hero. This used to be a hidden modal that no
 * visible control ever opened — real functionality must always be reachable,
 * so it now renders inline as the room's live workspace.
 */
export function DataConnectionVault({ children }: { children: React.ReactNode }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const openVault = () => {
      setPulse(true);
      document.getElementById('glow-room-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.setTimeout(() => setPulse(false), 900);
    };
    document.addEventListener('glow:vault-open', openVault);
    return () => document.removeEventListener('glow:vault-open', openVault);
  }, []);

  return (
    <section
      id="glow-room-workspace"
      data-connection-vault
      className={`mt-6 scroll-mt-20 rounded-[18px] border border-[#ECECEC] bg-white transition-shadow ${pulse ? 'ring-2 ring-[#EACED4]' : ''}`}
    >
      <header className="flex min-h-14 items-center gap-3 border-b border-[#ECECEC] px-5 py-3.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F8EFF1] text-[#B86F7D]"><ShieldCheck size={16}/></span>
        <span className="min-w-0 flex-1">
          <span className="block text-[12px] font-semibold tracking-[.05em] text-[#28282B]">YOUR WORKSPACE</span>
          <span className="mt-0.5 block text-[11px] leading-4 text-[#77777C]">Real, connected data and every control for this room lives below.</span>
        </span>
      </header>
      <div className="p-3 sm:p-5">{children}</div>
    </section>
  );
}
