'use client';

import { useRouter } from 'next/navigation';
import { Bell, Mic2, Plus, Search, UserRound } from 'lucide-react';

function openShakti(prefill?: string) {
  document.dispatchEvent(new CustomEvent('shakti:open', { detail: { prefill } }));
}

export function GlobalHeader() {
  const router = useRouter();

  return <header className="glow-global-header sticky top-0 z-40 flex h-[54px] items-center justify-end border-b border-[#F0F0F0] bg-white/96 px-4 sm:px-5 lg:px-6">
    <div className="flex items-center gap-1.5">
      <button type="button" onClick={() => router.push('/search')} className="glow-header-action" aria-label="Search Glow OS"><Search size={16}/></button>
      <button type="button" onClick={() => openShakti()} className="glow-header-action" aria-label="Speak to Shakti"><Mic2 size={16}/></button>
      <button type="button" onClick={() => openShakti('Create ')} className="glow-header-action glow-header-create" aria-label="Create with Shakti"><Plus size={17}/></button>
      <button type="button" onClick={() => router.push('/inbox')} className="glow-header-action" aria-label="Open notifications"><Bell size={16}/></button>
      <button type="button" onClick={() => router.push('/settings?section=profile')} className="glow-header-action glow-profile-action" aria-label="Open profile"><UserRound size={15}/></button>
    </div>
  </header>;
}
