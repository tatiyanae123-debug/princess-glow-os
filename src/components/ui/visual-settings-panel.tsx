'use client';

import { useState } from 'react';
import { X, RotateCcw, Check, Palette, ImageIcon, User, Layout, Sliders, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGlow } from '@/lib/context/glow-provider';
import { THEMES, type ThemeId } from '@/lib/themes';
import { Button } from '@/components/ui/button';
import { CustomizableVisual } from '@/components/ui/customizable-visual';

type PanelSection = 'theme' | 'background' | 'profile' | 'widgets' | 'dynamic' | 'accessibility' | 'reset';

const SECTIONS: { id: PanelSection; label: string; icon: React.ReactNode }[] = [
  { id: 'theme',         label: 'Theme',            icon: <Palette size={14} /> },
  { id: 'background',    label: 'Background',        icon: <Layout size={14} /> },
  { id: 'profile',       label: 'Profile',           icon: <User size={14} /> },
  { id: 'widgets',       label: 'Widget Images',     icon: <ImageIcon size={14} /> },
  { id: 'dynamic',       label: 'Dynamic Visuals',   icon: <Sliders size={14} /> },
  { id: 'reset',         label: 'Reset',             icon: <RotateCcw size={14} /> },
];

export function VisualSettingsPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    themeId, setTheme,
    prefs, updateVisual, setBackgroundImage, createObjectUrl, resetAll,
    setAutomaticVisuals, setSuggestionMode,
  } = useGlow();

  const [activeSection, setActiveSection] = useState<PanelSection>('theme');
  const [saved, setSaved] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleClose = () => {
    if (hasChanges && !window.confirm('Discard unsaved changes?')) return;
    setHasChanges(false);
    onClose();
  };

  const handleSave = () => {
    setSaved(true);
    setHasChanges(false);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const handleReset = () => {
    if (!window.confirm('Reset all visual preferences to defaults?')) return;
    resetAll();
    setHasChanges(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  };

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
        aria-hidden
      />

      {/* Panel — desktop: right drawer, mobile: bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Visual Settings"
        className={cn(
          'fixed z-50 flex flex-col overflow-hidden animate-scale-in',
          // Mobile: bottom sheet
          'inset-x-0 bottom-0 max-h-[85dvh] rounded-t-[28px]',
          // Desktop: right drawer
          'lg:inset-x-auto lg:inset-y-4 lg:right-4 lg:w-96 lg:rounded-[28px] lg:max-h-none lg:h-[calc(100dvh-2rem)]'
        )}
        style={{
          background: 'var(--glow-surface)',
          border: '1px solid var(--glow-border)',
          boxShadow: 'var(--glow-shadow)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--glow-border)' }}
        >
          <div>
            <h2
              className="text-base font-semibold"
              style={{ fontFamily: 'var(--glow-font-display)', color: 'var(--glow-text)' }}
            >
              Customize
            </h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--glow-text-muted)' }}>
              Visual preferences
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close settings"
            className="rounded-full p-2 transition hover:opacity-70"
            style={{ color: 'var(--glow-text-muted)' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Sections nav */}
        <div
          className="flex gap-1 overflow-x-auto px-4 py-2 shrink-0 border-b"
          style={{ borderColor: 'var(--glow-border)' }}
        >
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveSection(s.id)}
              className={cn(
                'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-all',
                activeSection === s.id ? 'font-medium' : 'opacity-60 hover:opacity-80'
              )}
              style={
                activeSection === s.id
                  ? { background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }
                  : { color: 'var(--glow-text-muted)' }
              }
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {activeSection === 'theme' && (
            <ThemeSection themeId={themeId} setTheme={(id) => { setTheme(id); setHasChanges(true); }} />
          )}
          {activeSection === 'background' && (
            <BackgroundSection
              bgImage={prefs.backgroundImage}
              onChange={(url) => { setBackgroundImage(url); setHasChanges(true); }}
              createObjectUrl={createObjectUrl}
            />
          )}
          {activeSection === 'profile' && (
            <ProfileSection
              src={prefs.visuals['profile']?.imageUrl}
              onChange={(url) => {
                updateVisual({ visualId: 'profile', mode: url ? 'photo' : 'none', imageUrl: url });
                setHasChanges(true);
              }}
              createObjectUrl={createObjectUrl}
            />
          )}
          {activeSection === 'widgets' && (
            <WidgetsSection
              prefs={prefs.visuals}
              updateVisual={(v) => { updateVisual(v); setHasChanges(true); }}
              createObjectUrl={createObjectUrl}
            />
          )}
          {activeSection === 'dynamic' && (
            <DynamicSection
              automaticVisuals={prefs.automaticVisuals}
              suggestionMode={prefs.suggestionMode}
              onAutoChange={(v) => { setAutomaticVisuals(v); setHasChanges(true); }}
              onSuggestionChange={(v) => { setSuggestionMode(v); setHasChanges(true); }}
            />
          )}
          {activeSection === 'reset' && (
            <ResetSection onReset={handleReset} />
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 border-t shrink-0"
          style={{ borderColor: 'var(--glow-border)' }}
        >
          {saved ? (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--glow-accent)' }}>
              <Check size={13} /> Saved
            </span>
          ) : hasChanges ? (
            <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--glow-text-muted)' }}>
              <AlertCircle size={13} /> Unsaved changes
            </span>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button variant="ghost" className="text-xs px-3 py-1.5" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="text-xs px-3 py-1.5"
              style={{ background: 'var(--glow-accent)', border: 'none', color: '#fff' }}
              onClick={handleSave}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Section: Theme ─────────────────────────────────────────────────────── */
function ThemeSection({ themeId, setTheme }: { themeId: string; setTheme: (id: ThemeId) => void }) {
  return (
    <div className="space-y-3">
      <SectionHeading>Choose your theme</SectionHeading>
      <div className="grid grid-cols-2 gap-2">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={cn(
              'rounded-2xl border p-3 text-left transition-all hover:opacity-90',
              themeId === t.id ? 'ring-2' : ''
            )}
            style={{
              background: t.tokens.surface,
              borderColor: themeId === t.id ? t.tokens.accent : t.tokens.border,
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="h-4 w-4 rounded-full" style={{ background: t.tokens.accent }} />
              <span className="text-xs font-medium" style={{ color: t.tokens.text }}>{t.name}</span>
              {themeId === t.id && <Check size={11} className="ml-auto" style={{ color: t.tokens.accent }} />}
            </div>
            <p className="text-[10px] leading-4 opacity-60" style={{ color: t.tokens.text }}>
              {t.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ─── Section: Background ────────────────────────────────────────────────── */
function BackgroundSection({
  bgImage,
  onChange,
  createObjectUrl,
}: {
  bgImage?: string;
  onChange: (url: string | undefined) => void;
  createObjectUrl: (f: File) => string;
}) {
  return (
    <div className="space-y-3">
      <SectionHeading>Dashboard background</SectionHeading>
      <CustomizableVisual
        id="settings-background"
        src={bgImage}
        alt="Dashboard background"
        aspectRatio="wide"
        editable
        onFileUpload={(f) => { const url = createObjectUrl(f); onChange(url); return url; }}
        onChange={(v) => onChange(v.imageUrl)}
      />
      {bgImage && (
        <button
          type="button"
          className="text-xs transition hover:opacity-70"
          style={{ color: 'var(--glow-text-muted)' }}
          onClick={() => onChange(undefined)}
        >
          Remove background image
        </button>
      )}
    </div>
  );
}

/* ─── Section: Profile ───────────────────────────────────────────────────── */
function ProfileSection({
  src,
  onChange,
  createObjectUrl,
}: {
  src?: string;
  onChange: (url: string | undefined) => void;
  createObjectUrl: (f: File) => string;
}) {
  return (
    <div className="space-y-3">
      <SectionHeading>Profile photo</SectionHeading>
      <div className="flex justify-center">
        <div className="w-32">
          <CustomizableVisual
            id="settings-profile"
            src={src}
            alt="Profile photo"
            aspectRatio="square"
            editable
            className="rounded-full overflow-hidden"
            onFileUpload={(f) => { const url = createObjectUrl(f); onChange(url); return url; }}
            onChange={(v) => onChange(v.imageUrl)}
          />
        </div>
      </div>
    </div>
  );
}

/* ─── Section: Widgets ───────────────────────────────────────────────────── */
const WIDGET_VISUALS = [
  { id: 'hero',        label: 'Hero / Featured' },
  { id: 'affirmation', label: 'Affirmation Card' },
  { id: 'workout',     label: 'Workout Card' },
  { id: 'beauty',      label: 'Beauty Routine' },
  { id: 'weekly-theme',label: 'Weekly Theme' },
];

function WidgetsSection({
  prefs,
  updateVisual,
  createObjectUrl,
}: {
  prefs: Record<string, import('@/lib/visual-preferences/types').VisualPreference>;
  updateVisual: (v: import('@/lib/visual-preferences/types').VisualPreference) => void;
  createObjectUrl: (f: File) => string;
}) {
  return (
    <div className="space-y-4">
      <SectionHeading>Widget images</SectionHeading>
      {WIDGET_VISUALS.map((w) => (
        <div key={w.id} className="space-y-1">
          <p className="text-xs font-medium" style={{ color: 'var(--glow-text-muted)' }}>{w.label}</p>
          <CustomizableVisual
            id={`settings-widget-${w.id}`}
            src={prefs[w.id]?.imageUrl}
            alt={w.label}
            aspectRatio="wide"
            editable
            onFileUpload={(f) => {
              const url = createObjectUrl(f);
              updateVisual({ visualId: w.id, mode: 'photo', imageUrl: url });
              return url;
            }}
            onChange={(v) => updateVisual({ visualId: w.id, mode: v.mode, imageUrl: v.imageUrl, position: v.position })}
          />
        </div>
      ))}
    </div>
  );
}

/* ─── Section: Dynamic ───────────────────────────────────────────────────── */
function DynamicSection({
  automaticVisuals,
  suggestionMode,
  onAutoChange,
  onSuggestionChange,
}: {
  automaticVisuals: boolean;
  suggestionMode: boolean;
  onAutoChange: (v: boolean) => void;
  onSuggestionChange: (v: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <SectionHeading>Dynamic visual behavior</SectionHeading>
      <ToggleRow
        label="Automatic visual changes"
        description="Theme and imagery adapt to time of day and season"
        checked={automaticVisuals}
        onChange={onAutoChange}
      />
      <ToggleRow
        label="Suggestions only"
        description="Receive suggestions without auto-applying them"
        checked={suggestionMode}
        onChange={onSuggestionChange}
      />
    </div>
  );
}

/* ─── Section: Reset ─────────────────────────────────────────────────────── */
function ResetSection({ onReset }: { onReset: () => void }) {
  return (
    <div className="space-y-3">
      <SectionHeading>Reset preferences</SectionHeading>
      <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>
        This will reset all visual preferences, theme selection, and widget images to their defaults.
      </p>
      <Button
        variant="secondary"
        className="w-full text-sm py-2.5"
        onClick={onReset}
      >
        <RotateCcw size={14} className="mr-2" />
        Reset all to defaults
      </Button>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-sm font-semibold"
      style={{ fontFamily: 'var(--glow-font-display)', color: 'var(--glow-text)' }}
    >
      {children}
    </h3>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-3 cursor-pointer">
      <div>
        <p className="text-sm font-medium" style={{ color: 'var(--glow-text)' }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--glow-text-muted)' }}>{description}</p>
      </div>
      <div
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') onChange(!checked); }}
        className={cn(
          'relative mt-0.5 h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border transition-all duration-200',
          checked ? 'bg-[var(--glow-accent)] border-transparent' : 'bg-[var(--glow-surface-muted)] border-[var(--glow-border)]'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all duration-200',
            checked ? 'left-4' : 'left-0.5'
          )}
        />
      </div>
    </label>
  );
}
