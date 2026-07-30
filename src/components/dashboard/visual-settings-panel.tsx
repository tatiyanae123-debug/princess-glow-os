'use client';

import { useEffect, useRef } from 'react';
import { Check, RefreshCw, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEMES } from '@/lib/visual/themes';
import { GALLERY_ITEMS } from '@/lib/visual/mock-gallery';
import { ACCENT_COLORS, WIDGET_SIZES, type AccentColor, type WidgetSize } from '@/lib/visual/types';
import { useCustomization } from './customization-context';
import { Button } from '@/components/ui/button';

// ── Reusable section heading ──────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">{children}</p>
  );
}

// ── Accent colour labels ──────────────────────────────────────────────────────

const ACCENT_LABELS: Record<AccentColor, string> = {
  default: 'Default',
  rose: 'Rose',
  violet: 'Violet',
  sky: 'Sky',
  emerald: 'Emerald',
  amber: 'Amber',
};

const ACCENT_BG: Record<AccentColor, string> = {
  default: 'bg-slate-300 dark:bg-slate-600',
  rose: 'bg-rose-400',
  violet: 'bg-violet-400',
  sky: 'bg-sky-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
};

// ── Widget labels ────────────────────────────────────────────────────────────

const WIDGET_LABELS: Record<string, string> = {
  'today-overview': 'Today overview',
  'daily-focus': 'Daily focus',
  'top-priority': 'Top priority',
  'routine-summary': 'Routine summary',
  'schedule-summary': 'Schedule summary',
  'project-status': 'Project status',
};

// ── Panel ─────────────────────────────────────────────────────────────────────

export function VisualSettingsPanel() {
  const ctx = useCustomization();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ctx?.isCustomizing) {
      closeButtonRef.current?.focus();
    }
  }, [ctx?.isCustomizing]);

  // Trap focus inside panel while open
  useEffect(() => {
    if (!ctx?.isCustomizing) return;
    const panel = panelRef.current;
    if (!panel) return;

    const focusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled'));

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const els = focusable();
      if (els.length === 0) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [ctx?.isCustomizing]);

  if (!ctx) return null;

  const { isCustomizing, prefs, saveStatus, toggleCustomizing, updateTheme, updateBackground, updateWidgetPref, updateReducedMotion, updateShowDecorativeImages, resetPrefs } = ctx;

  if (!isCustomizing) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        aria-hidden="true"
        onClick={toggleCustomizing}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Visual settings"
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto bg-white shadow-2xl dark:bg-slate-900 sm:w-96"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">Visual settings</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Preferences saved locally to your browser</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Save status indicator */}
            {saveStatus === 'saving' && (
              <span aria-live="polite" aria-label="Saving" className="text-slate-400">
                <RefreshCw size={14} className="animate-spin" aria-hidden="true" />
              </span>
            )}
            {saveStatus === 'saved' && (
              <span aria-live="polite" className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <Check size={13} aria-hidden="true" />
                Saved
              </span>
            )}
            {saveStatus === 'error' && (
              <span aria-live="assertive" className="text-xs text-red-500">
                Save failed
              </span>
            )}
            <button
              ref={closeButtonRef}
              type="button"
              onClick={toggleCustomizing}
              className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline focus:outline-2 focus:outline-rose-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              aria-label="Close visual settings"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6 p-5">

          {/* ── Theme packs ─────────────────────────────────────────────── */}
          <section aria-labelledby="theme-heading">
            <SectionHeading>
              <span id="theme-heading">Theme packs</span>
            </SectionHeading>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {Object.values(THEMES).map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => updateTheme(theme.id)}
                  aria-pressed={prefs.theme === theme.id}
                  aria-label={`${theme.name} theme — ${theme.description}`}
                  className={cn(
                    'group flex flex-col items-start gap-1 rounded-2xl border-2 p-3 text-left transition focus:outline focus:outline-2 focus:outline-rose-400',
                    prefs.theme === theme.id
                      ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10'
                      : 'border-transparent bg-slate-50 hover:border-slate-200 dark:bg-slate-800 dark:hover:border-slate-700',
                  )}
                >
                  {/* Swatch */}
                  <div
                    className="h-10 w-full rounded-xl"
                    style={{ background: theme.preview }}
                    aria-hidden="true"
                  />
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{theme.name}</p>
                  <p className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">{theme.description}</p>
                </button>
              ))}
            </div>
          </section>

          {/* ── Dashboard background ─────────────────────────────────────── */}
          <section aria-labelledby="bg-heading">
            <SectionHeading>
              <span id="bg-heading">Dashboard background</span>
            </SectionHeading>

            {/* Type selector */}
            <div className="mt-3 flex gap-2" role="group" aria-label="Background type">
              {(['gradient', 'solid', 'gallery'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateBackground({ type })}
                  aria-pressed={prefs.background.type === type}
                  className={cn(
                    'flex-1 rounded-full border py-1.5 text-xs font-medium transition focus:outline focus:outline-2 focus:outline-rose-400',
                    prefs.background.type === type
                      ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
                  )}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            {/* Solid color picker */}
            {prefs.background.type === 'solid' && (
              <div className="mt-3">
                <label htmlFor="bg-solid-color" className="text-xs text-slate-500 dark:text-slate-400">
                  Background colour
                </label>
                <input
                  id="bg-solid-color"
                  type="color"
                  value={prefs.background.value || '#ffffff'}
                  onChange={(e) => updateBackground({ value: e.target.value })}
                  className="mt-1 h-9 w-full cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700"
                  aria-label="Background solid colour picker"
                />
              </div>
            )}

            {/* Gallery */}
            {prefs.background.type === 'gallery' && (
              <div
                className="mt-3 grid grid-cols-4 gap-2"
                role="group"
                aria-label="Gallery background choices"
              >
                {GALLERY_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => updateBackground({ value: item.css })}
                    aria-pressed={prefs.background.value === item.css}
                    aria-label={item.label}
                    className={cn(
                      'h-12 w-full rounded-xl border-2 transition focus:outline focus:outline-2 focus:outline-rose-400',
                      prefs.background.value === item.css
                        ? 'border-rose-400'
                        : 'border-transparent hover:border-slate-300',
                    )}
                    style={{ background: item.css }}
                  />
                ))}
              </div>
            )}

            {/* Opacity slider */}
            <div className="mt-3">
              <label htmlFor="bg-opacity" className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Overlay opacity</span>
                <span>{Math.round(prefs.background.opacity * 100)}%</span>
              </label>
              <input
                id="bg-opacity"
                type="range"
                min={0.5}
                max={1}
                step={0.05}
                value={prefs.background.opacity}
                onChange={(e) => updateBackground({ opacity: Number(e.target.value) })}
                className="mt-1 w-full accent-rose-400"
                aria-label="Background overlay opacity"
              />
            </div>
          </section>

          {/* ── Widget customisation ─────────────────────────────────────── */}
          <section aria-labelledby="widget-heading">
            <SectionHeading>
              <span id="widget-heading">Widget customisation</span>
            </SectionHeading>
            <div className="mt-3 space-y-4">
              {Object.entries(WIDGET_LABELS).map(([widgetId, label]) => {
                const wpref = prefs.widgets[widgetId] ?? { visible: true, accentColor: 'default', size: 'default' };
                return (
                  <div
                    key={widgetId}
                    className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{label}</p>
                      {/* Visibility toggle */}
                      <button
                        type="button"
                        role="switch"
                        aria-checked={wpref.visible !== false}
                        aria-label={`${wpref.visible !== false ? 'Hide' : 'Show'} ${label} widget`}
                        onClick={() => updateWidgetPref(widgetId, { visible: !(wpref.visible !== false) })}
                        className={cn(
                          'relative h-5 w-9 rounded-full transition focus:outline focus:outline-2 focus:outline-rose-400',
                          wpref.visible !== false ? 'bg-rose-400' : 'bg-slate-300 dark:bg-slate-600',
                        )}
                      >
                        <span
                          className={cn(
                            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all',
                            wpref.visible !== false ? 'left-4' : 'left-0.5',
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    {/* Accent colour swatches */}
                    <div className="mt-2" role="group" aria-label={`Accent colour for ${label}`}>
                      <p className="mb-1.5 text-[10px] text-slate-400">Accent</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ACCENT_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => updateWidgetPref(widgetId, { accentColor: color })}
                            aria-pressed={(wpref.accentColor ?? 'default') === color}
                            aria-label={ACCENT_LABELS[color]}
                            className={cn(
                              'h-5 w-5 rounded-full border-2 transition focus:outline focus:outline-2 focus:outline-rose-400',
                              ACCENT_BG[color],
                              (wpref.accentColor ?? 'default') === color
                                ? 'border-slate-900 dark:border-white'
                                : 'border-transparent',
                            )}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Size selector */}
                    <div className="mt-2" role="group" aria-label={`Size for ${label}`}>
                      <p className="mb-1.5 text-[10px] text-slate-400">Size</p>
                      <div className="flex gap-1">
                        {WIDGET_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => updateWidgetPref(widgetId, { size: size as WidgetSize })}
                            aria-pressed={(wpref.size ?? 'default') === size}
                            className={cn(
                              'flex-1 rounded-full border py-1 text-[10px] font-medium transition focus:outline focus:outline-2 focus:outline-rose-400',
                              (wpref.size ?? 'default') === size
                                ? 'border-rose-400 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300'
                                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400',
                            )}
                          >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Accessibility ────────────────────────────────────────────── */}
          <section aria-labelledby="a11y-heading">
            <SectionHeading>
              <span id="a11y-heading">Accessibility</span>
            </SectionHeading>
            <div className="mt-3 space-y-3">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm text-slate-700 dark:text-slate-200">Reduce motion</span>
                <input
                  type="checkbox"
                  checked={prefs.reducedMotion}
                  onChange={(e) => updateReducedMotion(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-rose-400"
                  aria-label="Reduce motion"
                />
              </label>
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm text-slate-700 dark:text-slate-200">Show decorative images</span>
                <input
                  type="checkbox"
                  checked={prefs.showDecorativeImages}
                  onChange={(e) => updateShowDecorativeImages(e.target.checked)}
                  className="h-4 w-4 cursor-pointer accent-rose-400"
                  aria-label="Show decorative images"
                />
              </label>
            </div>
          </section>

          {/* ── Reset ───────────────────────────────────────────────────── */}
          <section>
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              onClick={resetPrefs}
              aria-label="Reset all visual settings to defaults"
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset to defaults
            </Button>
          </section>
        </div>
      </div>
    </>
  );
}
