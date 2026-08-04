'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="glow-dialog-title"
    >
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={cn(
          'relative max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] p-5 shadow-xl animate-fade-in sm:max-w-lg sm:rounded-[28px] sm:p-6',
          className
        )}
        style={{
          background: 'var(--glow-surface)',
          border: '1px solid var(--glow-border)',
        }}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2
              id="glow-dialog-title"
              className="text-lg font-semibold"
              style={{ fontFamily: 'var(--glow-font-display)', color: 'var(--glow-text)' }}
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="shrink-0 rounded-full p-1.5 transition hover:opacity-70"
            style={{ background: 'var(--glow-surface-muted)', color: 'var(--glow-text-muted)' }}
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
