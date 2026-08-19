'use client';

import { ImagePlus, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const STORAGE_KEY = 'glow:dashboard:hero-background';
const HERO_SELECTOR = '[data-room="dashboard"] .glow-dashboard-reference-shell > div > header';
const HERO_BG_SELECTOR = `${HERO_SELECTOR} > .absolute.inset-0`;
const OVERLAY = 'linear-gradient(90deg,rgba(255,255,255,.92) 0%,rgba(255,255,255,.68) 31%,rgba(255,255,255,.08) 57%,rgba(255,255,255,.13) 100%)';

export function DashboardHeroBackgroundEditor() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [customSrc, setCustomSrc] = useState<string | null>(null);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(HERO_SELECTOR);
    setHost(hero);

    let stored: string | null = null;
    try { stored = window.localStorage.getItem(STORAGE_KEY); } catch { /* ignore */ }
    setCustomSrc(stored);

    const background = document.querySelector<HTMLElement>(HERO_BG_SELECTOR);
    if (background && stored) {
      background.style.backgroundImage = `${OVERLAY},url("${stored}")`;
    }
  }, []);

  function apply(src: string | null) {
    const background = document.querySelector<HTMLElement>(HERO_BG_SELECTOR);
    if (!background) return;

    if (src) {
      background.style.backgroundImage = `${OVERLAY},url("${src}")`;
    } else {
      background.style.removeProperty('background-image');
    }
  }

  function choose(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = () => {
      const next = typeof reader.result === 'string' ? reader.result : null;
      if (!next) return;
      try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* browser quota */ }
      setCustomSrc(next);
      apply(next);
    };
    reader.readAsDataURL(file);
  }

  function reset() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    setCustomSrc(null);
    apply(null);
    if (inputRef.current) inputRef.current.value = '';
  }

  if (!host) return null;

  return createPortal(
    <>
      <div className="group absolute bottom-3 right-3 z-30 flex items-center gap-1.5 opacity-30 transition hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/80 bg-white/90 px-3 text-[10px] font-medium text-[#7b5c61] shadow-sm backdrop-blur-md transition hover:bg-white"
          aria-label="Change dashboard background"
          title="Change dashboard background"
        >
          <ImagePlus size={13} />
          Change background
        </button>
        {customSrc ? (
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/80 bg-white/90 text-[#7b5c61] shadow-sm backdrop-blur-md transition hover:bg-white"
            aria-label="Reset dashboard background"
            title="Reset dashboard background"
          >
            <RotateCcw size={13} />
          </button>
        ) : null}
      </div>
      <input ref={inputRef} type="file" accept="image/*" onChange={choose} className="sr-only" aria-label="Upload dashboard background image" />
    </>,
    host,
  );
}
