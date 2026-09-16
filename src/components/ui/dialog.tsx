'use client';

import { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function Dialog({ open, onClose, title, description, children, className }: { open:boolean; onClose:()=>void; title:string; description?:string; children:React.ReactNode; className?:string; }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusFrame = window.requestAnimationFrame(() => {
      const panel = panelRef.current;
      const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? panel)?.focus({ preventScroll: true });
    });

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((element) => element.getAttribute('aria-hidden') !== 'true');
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open) return null;

  return <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby={titleId} data-glow-overlay-root="true">
    <div className="absolute inset-0 animate-fade-in bg-[#332824]/35 backdrop-blur-[3px]" onClick={onClose} aria-hidden="true" />
    <div ref={panelRef} tabIndex={-1} data-glow-overlay-panel="true" className={cn('paper-card relative w-full overflow-y-auto rounded-t-[18px] p-5 shadow-[0_30px_80px_rgba(52,37,31,.18)] animate-fade-in sm:max-w-lg sm:rounded-[12px] sm:p-6',className)}>
      <div className="tape mb-5 border-b border-[#dfd1c7] pb-4 pt-1">
        <div className="flex items-start justify-between gap-3"><div><p className="glow-eyebrow">Glow OS entry</p><h2 id={titleId} className="glow-display mt-1 text-[23px] font-medium text-[#392e2a]">{title}</h2>{description?<p className="mt-1 text-[9px] leading-4 text-[#806e67]">{description}</p>:null}</div><button type="button" onClick={onClose} aria-label="Close dialog" className="shrink-0 rounded-full border border-[#ddcfc6] bg-white/45 p-1.5 text-[#806e67]"><X size={14}/></button></div>
      </div>
      {children}
    </div>
  </div>;
}
