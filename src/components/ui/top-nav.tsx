'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BellRing, Search, Palette, Save, X } from 'lucide-react';
import { useGlow } from '@/lib/context/glow-provider';
import { Button } from '@/components/ui/button';
import { VisualSettingsPanel } from '@/components/ui/visual-settings-panel';
import { isEditorialRoute } from '@/lib/editorial-routes';

export function TopNav() {
  const pathname = usePathname();
  const editorial = isEditorialRoute(pathname);
  const [dateTime, setDateTime] = useState(new Date());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { isCustomizing, hasPendingChanges, saveCustomize, discardCustomize } = useGlow();

  useEffect(() => {
    const interval = window.setInterval(() => setDateTime(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const handleDiscard = () => {
    if (hasPendingChanges) {
      if (!window.confirm('You have unsaved changes. Exit without saving?')) return;
    }
    discardCustomize();
  };

  return (
    <>
      <header
        className={editorial ? 'editorial-topnav' : 'flex flex-col gap-3 p-4 animate-fade-in sm:flex-row sm:items-center sm:justify-between'}
        style={{
          background: 'var(--glow-surface)',
          borderRadius: 'var(--glow-radius)',
          border: '1px solid var(--glow-border)',
          boxShadow: 'var(--glow-shadow)',
        }}
      >
        {/* Date & Time */}
        <div className={editorial ? 'editorial-clock' : ''}>
          <p className="text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--glow-text-muted)' }}>
            {dateTime.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p
            className="mt-0.5 text-xl font-semibold"
            style={{ fontFamily: 'var(--glow-font-display)', color: 'var(--glow-text)' }}
          >
            {dateTime.toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' })}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Search */}
          <label
            className="hidden items-center gap-2 rounded-full border px-3 py-2 text-sm transition sm:flex"
            style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)', color: 'var(--glow-text-muted)' }}
          >
            <Search size={14} />
            <input
              className="w-32 bg-transparent outline-none sm:w-40"
              placeholder="Search unavailable"
              aria-label="Global Search is not installed on this branch"
              disabled
              style={{ color: 'var(--glow-text)' }}
            />
          </label>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            title="Notifications are not connected on this branch"
            disabled
            className="rounded-full border p-2.5 transition hover:opacity-80"
            style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)', color: 'var(--glow-text-muted)' }}
          >
            <BellRing size={15} />
          </button>

          {/* Customize controls */}
          {isCustomizing ? (
            <div className="flex items-center gap-1.5">
              <span
                className="hidden rounded-full px-2.5 py-1 text-xs font-medium sm:block"
                style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}
              >
                Editing Dashboard
              </span>
              <Button
                variant="primary"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
                style={{ background: 'var(--glow-accent)', color: '#fff', border: 'none' }}
                onClick={saveCustomize}
              >
                <Save size={13} />
                Save
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
                onClick={handleDiscard}
              >
                <X size={13} />
                Exit
              </Button>
            </div>
          ) : (
            <Button
              variant="secondary"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs"
              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)', color: 'var(--glow-text-muted)' }}
              onClick={() => setSettingsOpen(true)}
            >
              <Palette size={13} />
              <span className="hidden sm:inline">Customize</span>
            </Button>
          )}
        </div>
      </header>

      <VisualSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
