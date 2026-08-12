'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BellRing, Search, Palette, Save, X, UploadCloud } from 'lucide-react';
import { useGlow } from '@/lib/context/glow-provider';
import { Button } from '@/components/ui/button';
import { VisualSettingsPanel } from '@/components/ui/visual-settings-panel';

export function EditorialTopNav() {
  const [dateTime, setDateTime] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isCustomizing, hasPendingChanges, saveCustomize, discardCustomize } = useGlow();

  useEffect(() => { const interval = window.setInterval(() => setDateTime(new Date()), 1000); return () => window.clearInterval(interval); }, []);
  const handleDiscard = () => { if (hasPendingChanges && !window.confirm('You have unsaved changes. Exit without saving?')) return; discardCustomize(); };

  return <>
    <header className="editorial-topnav">
      <div className="editorial-clock">
        <p>{dateTime.toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric',year:'numeric'})}</p>
        <strong>{dateTime.toLocaleTimeString('en',{hour:'numeric',minute:'2-digit'})}</strong>
      </div>
      <form action="/search" className="flex min-w-[180px] items-center gap-2 rounded-full border border-[#dfd2c9] bg-white/55 px-3 py-2">
        <Search size={12} className="shrink-0 text-[#9d8880]" />
        <input name="q" className="min-w-0 flex-1 bg-transparent text-[10px] text-[#4e403a] outline-none placeholder:text-[#a18e87]" placeholder="Search…" />
      </form>
      <div className="flex items-center gap-1.5">
        <Link href="/intake" title="Add anything" className="rounded-full border border-[#d9cbc2] bg-[#3d302c] p-2 text-white transition hover:bg-[#6d4b4f]"><UploadCloud size={12}/></Link>
        <Link href="/notices" aria-label="Glow Notices" title="Glow Notices" className="rounded-full border border-[#dfd2c9] bg-white/55 p-2 text-[#7b6962]"><BellRing size={12}/></Link>
        {isCustomizing ? <div className="flex items-center gap-1"><Button variant="primary" className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px]" style={{background:'var(--glow-accent)',color:'#fff',border:'none'}} onClick={saveCustomize}><Save size={11}/>Save</Button><Button variant="ghost" className="rounded-full p-1.5" onClick={handleDiscard}><X size={12}/></Button></div> : <Button variant="secondary" className="rounded-full p-1.5" style={{borderColor:'var(--glow-border)',background:'rgba(255,255,255,.55)',color:'var(--glow-text-muted)'}} onClick={()=>setSettingsOpen(true)} aria-label="Customize"><Palette size={12}/></Button>}
      </div>
    </header>
    <VisualSettingsPanel open={settingsOpen} onClose={()=>setSettingsOpen(false)} />
  </>;
}
