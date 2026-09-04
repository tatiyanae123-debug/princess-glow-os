'use client';

import { Camera, ImagePlus, Move, RotateCcw, Scan, ZoomIn, ZoomOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type Props = {
  slot: string;
  label: string;
  className?: string;
  children?: React.ReactNode;
  overlay?: boolean;
};

type ImageView = {
  fit: 'cover' | 'contain';
  x: number;
  y: number;
  zoom: number;
};

const DEFAULT_VIEW: ImageView = { fit: 'cover', x: 50, y: 50, zoom: 1 };
const storageKey = (slot: string) => `glow:image:${slot}`;
const viewKey = (slot: string) => `glow:image-view:${slot}`;
const focalStops = [
  { x: 50, y: 50 },
  { x: 50, y: 28 },
  { x: 50, y: 72 },
  { x: 30, y: 50 },
  { x: 70, y: 50 },
];

export function EditableRoomImage({ slot, label, className = '', children, overlay = true }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [view, setView] = useState<ImageView>(DEFAULT_VIEW);

  useEffect(() => {
    try {
      setSrc(window.localStorage.getItem(storageKey(slot)));
      const storedView = window.localStorage.getItem(viewKey(slot));
      if (storedView) {
        const parsed = JSON.parse(storedView) as Partial<ImageView>;
        setView({
          fit: parsed.fit === 'contain' ? 'contain' : 'cover',
          x: typeof parsed.x === 'number' ? Math.max(0, Math.min(100, parsed.x)) : 50,
          y: typeof parsed.y === 'number' ? Math.max(0, Math.min(100, parsed.y)) : 50,
          zoom: typeof parsed.zoom === 'number' ? Math.max(1, Math.min(2, parsed.zoom)) : 1,
        });
      } else {
        setView(DEFAULT_VIEW);
      }
    } catch {
      setSrc(null);
      setView(DEFAULT_VIEW);
    }
  }, [slot]);

  function persistView(next: ImageView) {
    setView(next);
    try { window.localStorage.setItem(viewKey(slot), JSON.stringify(next)); } catch { /* local browser quota */ }
  }

  function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const next = typeof reader.result === 'string' ? reader.result : null;
      if (!next) return;
      try { window.localStorage.setItem(storageKey(slot), next); } catch { /* local browser quota */ }
      setSrc(next);
      persistView(DEFAULT_VIEW);
    };
    reader.readAsDataURL(file);
  }

  function reset() {
    try {
      window.localStorage.removeItem(storageKey(slot));
      window.localStorage.removeItem(viewKey(slot));
    } catch { /* ignore */ }
    setSrc(null);
    setView(DEFAULT_VIEW);
    if (inputRef.current) inputRef.current.value = '';
  }

  function toggleFit() {
    persistView({ ...view, fit: view.fit === 'cover' ? 'contain' : 'cover', zoom: 1 });
  }

  function cycleFocus() {
    const currentIndex = focalStops.findIndex((point) => point.x === view.x && point.y === view.y);
    const next = focalStops[(currentIndex + 1 + focalStops.length) % focalStops.length];
    persistView({ ...view, ...next });
  }

  function zoom(delta: number) {
    persistView({ ...view, zoom: Math.max(1, Math.min(2, Number((view.zoom + delta).toFixed(2)))) });
  }

  return (
    <div
      className={`group glow-image-surface relative bg-[linear-gradient(145deg,#ead9ce,#d7bdb0_48%,#9b8177)] ${className}`}
      style={{ '--glow-image-x': `${view.x}%`, '--glow-image-y': `${view.y}%` } as React.CSSProperties}
    >
      {src ? (
        <img
          src={src}
          alt={label}
          className="glow-image-media absolute inset-0"
          style={{
            objectFit: view.fit,
            objectPosition: `${view.x}% ${view.y}%`,
            transform: `scale(${view.zoom}) translateZ(0)`,
            transformOrigin: `${view.x}% ${view.y}%`,
          }}
          decoding="async"
          draggable={false}
        />
      ) : null}
      {!src ? <div className="absolute inset-0 z-0 opacity-80 [background:radial-gradient(circle_at_70%_25%,rgba(255,255,255,.5),transparent_24%),linear-gradient(145deg,rgba(255,248,242,.35),rgba(149,112,98,.18))]" /> : null}
      {children ? <div className="glow-image-content">{children}</div> : null}

      {overlay ? (
        <div className="glow-image-controls right-2 top-2 flex max-w-[calc(100%-16px)] flex-wrap justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
          <button type="button" onClick={() => inputRef.current?.click()} aria-label={`Change ${label}`} title={`Change ${label}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/75 bg-[#fffaf6]/92 text-[#6e5955] shadow-[0_4px_14px_rgba(55,43,38,.12)] backdrop-blur-md"><ImagePlus size={13}/></button>
          {src ? <>
            <button type="button" onClick={toggleFit} aria-label={`Toggle crop mode for ${label}`} title={view.fit === 'cover' ? 'Show full image' : 'Fill image surface'} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/75 bg-[#fffaf6]/92 text-[#6e5955] shadow-[0_4px_14px_rgba(55,43,38,.12)] backdrop-blur-md"><Scan size={13}/></button>
            <button type="button" onClick={cycleFocus} aria-label={`Change focal point for ${label}`} title="Move focal point" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/75 bg-[#fffaf6]/92 text-[#6e5955] shadow-[0_4px_14px_rgba(55,43,38,.12)] backdrop-blur-md"><Move size={13}/></button>
            <button type="button" onClick={() => zoom(.1)} aria-label={`Zoom in ${label}`} title="Zoom in" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/75 bg-[#fffaf6]/92 text-[#6e5955] shadow-[0_4px_14px_rgba(55,43,38,.12)] backdrop-blur-md"><ZoomIn size={13}/></button>
            <button type="button" onClick={() => zoom(-.1)} aria-label={`Zoom out ${label}`} title="Zoom out" className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/75 bg-[#fffaf6]/92 text-[#6e5955] shadow-[0_4px_14px_rgba(55,43,38,.12)] backdrop-blur-md"><ZoomOut size={13}/></button>
            <button type="button" onClick={reset} aria-label={`Reset ${label}`} title={`Reset ${label}`} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/75 bg-[#fffaf6]/92 text-[#6e5955] shadow-[0_4px_14px_rgba(55,43,38,.12)] backdrop-blur-md"><RotateCcw size={13}/></button>
          </> : null}
        </div>
      ) : null}

      {!src ? <button type="button" onClick={() => inputRef.current?.click()} className="glow-image-controls bottom-2 right-2 inline-flex items-center gap-1 rounded-full border border-white/75 bg-[#fffaf6]/90 px-2.5 py-1.5 text-[8px] font-medium text-[#695652] opacity-0 shadow-[0_4px_14px_rgba(55,43,38,.10)] backdrop-blur-md transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"><Camera size={11}/>Change image</button> : null}
      <input ref={inputRef} type="file" accept="image/*" onChange={choose} className="sr-only" aria-label={`Upload replacement for ${label}`} />
    </div>
  );
}
