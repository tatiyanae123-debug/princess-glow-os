'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BellRing, Search, Palette, Save, X, UploadCloud } from 'lucide-react';
import { useGlow } from '@/lib/context/glow-provider';
import { Button } from '@/components/ui/button';
import { VisualSettingsPanel } from '@/components/ui/visual-settings-panel';

export function TopNav() {
  const [dateTime, setDateTime] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isCustomizing, hasPendingChanges, saveCustomize, discardCustomize } = useGlow();

  useEffect(() => { const interval = window.setInterval(() => setDateTime(new Date()), 1000); return () => window.clearInterval(interval); }, []);

  const handleDiscard = () => {
    if (hasPendingChanges && !window.confirm('You have unsaved changes. Exit without saving?')) return;
    discardCustomize();
  };

  return <>
    <header className="flex flex-col gap-2 border-b border-[#eadfd6]/80 bg-transparent pb-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="hidden min-w-[190px] sm:block">
        <p className="text-[8px] font-medium uppercase tracking-[0.18em] text-[#9a857d]">{dateTime.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        <p className="mt-0.5 text-[21px] font-medium tracking-[-.02em] text-[#2d2421]" style={{ fontFamily: 'var(--glow-font-display)' }}>{dateTime.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</p>
      </div>

      <form action="/search" className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#e8dcd4] bg-[#fffaf6]/80 px-4 py-2 sm:max-w-lg">
        <Search size={13} className="shrink-0 text-[#a88f87]" />
        <input name="q" className="min-w-0 flex-1 bg-transparent text-[12px] text-[#403431] outline-none placeholder:text-[#aa9992]" placeholder="Search your world or ask Glow…" />
        <span className="hidden text-[7px] font-bold uppercase tracking-[.14em] text-[#c3b3ab] lg:block">Universal</span>
      </form>

      <div className="flex items-center justify-end gap-2">
        <Link href="/intake" className="flex items-center gap-1.5 rounded-full bg-[#2f2522] px-3 py-2 text-[9px] font-medium text-white transition hover:bg-[#6a3d44]"><UploadCloud size={12}/><span className="hidden md:inline">Add Anything</span></Link>
        <button type="button" aria-label="Notifications" className="rounded-full border border-[#e8dcd4] bg-[#fffaf6]/70 p-2 text-[#8e7770] transition hover:bg-white"><BellRing size={13}/></button>
        {isCustomizing ? <div className="flex items-center gap-1.5"><Button variant="primary" className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs" style={{ background: 'var(--glow-accent)', color: '#fff', border: 'none' }} onClick={saveCustomize}><Save size={13}/>Save</Button><Button variant="ghost" className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs" onClick={handleDiscard}><X size={13}/>Exit</Button></div> : <Button variant="secondary" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs" style={{ borderColor: '#e8dcd4', background: 'rgba(255,250,246,.72)', color: '#8e7770' }} onClick={() => setSettingsOpen(true)}><Palette size={12}/><span className="hidden lg:inline">Customize</span></Button>}
      </div>
    </header>
    <VisualSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
  </>;
}
