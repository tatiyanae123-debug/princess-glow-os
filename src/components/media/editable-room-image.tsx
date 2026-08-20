'use client';

import { Camera, ImagePlus, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  slot: string;
  label: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
  fallbackUrl?: string;
};

const storageKey = (slot: string) => `glow:image:${slot}`;

export function EditableRoomImage({ slot, label, className = '', children, overlay = true, fallbackUrl }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    try { setSrc(window.localStorage.getItem(storageKey(slot))); } catch { setSrc(null); }
  }, [slot]);

  function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = typeof reader.result === 'string' ? reader.result : null;
      if (!next) return;
      try { window.localStorage.setItem(storageKey(slot), next); } catch { /* local browser quota */ }
      setSrc(next);
    };
    reader.readAsDataURL(file);
  }

  function reset() {
    try { window.localStorage.removeItem(storageKey(slot)); } catch { /* ignore */ }
    setSrc(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  const visibleSrc = src || fallbackUrl || null;

  return (
    <div className={`group relative overflow-hidden bg-[linear-gradient(145deg,#ead9ce,#d7bdb0_48%,#9b8177)] ${className}`}>
      {visibleSrc ? <img src={visibleSrc} alt={label} className="absolute inset-0 h-full w-full object-cover" /> : null}
      {!visibleSrc ? <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_70%_25%,rgba(255,255,255,.5),transparent_24%),linear-gradient(145deg,rgba(255,248,242,.35),rgba(149,112,98,.18))]" /> : null}
      {fallbackUrl && !src ? <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(145deg,rgba(255,250,246,.04),rgba(85,65,55,.07))]" /> : null}
      {children ? <div className="relative z-10 h-full">{children}</div> : null}
      {overlay ? <div className="absolute right-2 top-2 z-20 flex gap-1 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
        <button type="button" onClick={() => inputRef.current?.click()} aria-label={`Change ${label}`} title={`Change ${label}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-[#fffaf6]/90 text-[#805c5f] shadow-sm backdrop-blur"><ImagePlus size={14}/></button>
        {src ? <button type="button" onClick={reset} aria-label={`Reset ${label}`} title={`Reset ${label}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-[#fffaf6]/90 text-[#805c5f] shadow-sm backdrop-blur"><RotateCcw size={13}/></button> : null}
      </div> : null}
      {!src ? <button type="button" onClick={() => inputRef.current?.click()} className="absolute bottom-2 right-2 z-20 inline-flex items-center gap-1 rounded-full border border-white/70 bg-[#fffaf6]/80 px-2.5 py-1.5 text-[8px] font-medium text-[#795c58] opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-within:opacity-100"><Camera size={11}/>Change image</button> : null}
      <input ref={inputRef} type="file" accept="image/*" onChange={choose} className="sr-only" aria-label={`Upload replacement for ${label}`} />
    </div>
  );
}
