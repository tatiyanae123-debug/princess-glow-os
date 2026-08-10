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
    <header className="flex flex-col gap-3 rounded-[20px] border border-white/70 bg-white/55 p-3 shadow-[0_10px_35px_rgba(110,83,63,.05)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
      <div className="hidden min-w-[190px] sm:block">
        <p className="text-[9px] uppercase tracking-[0.24em] text-stone-400">{dateTime.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        <p className="mt-0.5 text-lg font-semibold text-stone-800" style={{ fontFamily: 'var(--glow-font-display)' }}>{dateTime.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}</p>
      </div>

      <form action="/search" className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-stone-200/80 bg-white/70 px-4 py-2.5 sm:max-w-xl">
        <Search size={14} className="shrink-0 text-stone-400" />
        <input name="q" className="min-w-0 flex-1 bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-400" placeholder="Search your whole world…" />
        <span className="hidden text-[8px] font-bold uppercase tracking-[.12em] text-stone-300 lg:block">Universal</span>
      </form>

      <div className="flex items-center justify-end gap-2">
        <Link href="/intake" className="flex items-center gap-1.5 rounded-full bg-stone-950 px-3 py-2.5 text-[10px] font-medium text-white transition hover:bg-rose-950"><UploadCloud size={13}/><span className="hidden md:inline">Add Anything</span></Link>
        <button type="button" aria-label="Notifications" className="rounded-full border border-stone-200 bg-white/65 p-2.5 text-stone-500 transition hover:bg-white"><BellRing size={14}/></button>
        {isCustomizing ? <div className="flex items-center gap-1.5"><Button variant="primary" className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs" style={{ background: 'var(--glow-accent)', color: '#fff', border: 'none' }} onClick={saveCustomize}><Save size={13}/>Save</Button><Button variant="ghost" className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs" onClick={handleDiscard}><X size={13}/>Exit</Button></div> : <Button variant="secondary" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs" style={{ borderColor: 'var(--glow-border)', background: 'rgba(255,255,255,.55)', color: 'var(--glow-text-muted)' }} onClick={() => setSettingsOpen(true)}><Palette size={13}/><span className="hidden lg:inline">Customize</span></Button>}
      </div>
    </header>
    <VisualSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
  </>;
}
