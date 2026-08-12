'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { BellRing, Bot, Download, Eye, Palette, RotateCcw, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { applyTheme, THEMES, type ThemeId } from '@/lib/themes';

const STORAGE_KEY = 'glow-settings-v1';

type GlowSettings = {
  theme: ThemeId;
  density: 'airy' | 'balanced' | 'compact';
  suggestions: boolean;
  proactiveBrain: boolean;
  notificationLevel: 'quiet' | 'gentle' | 'active';
  privateMode: boolean;
  sensitiveMemory: boolean;
};

const defaults: GlowSettings = {
  theme: 'modern-princess',
  density: 'airy',
  suggestions: true,
  proactiveBrain: true,
  notificationLevel: 'gentle',
  privateMode: false,
  sensitiveMemory: true,
};

function loadSettings(): GlowSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
  } catch {
    return defaults;
  }
}

export function SettingsControlCenter() {
  const [settings, setSettings] = useState<GlowSettings>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    applyTheme(settings.theme);
    document.documentElement.dataset.glowDensity = settings.density;
  }, [settings, ready]);

  const summary = useMemo(() => [
    `${THEMES.find((theme) => theme.id === settings.theme)?.name ?? 'Glow'} theme`,
    `${settings.notificationLevel} notifications`,
    settings.proactiveBrain ? 'proactive Brain on' : 'proactive Brain off',
    settings.privateMode ? 'private mode on' : 'standard privacy',
  ].join(' · '), [settings]);

  function update<K extends keyof GlowSettings>(key: K, value: GlowSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function exportSettings() {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), settings }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'glow-os-settings.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function resetSettings() {
    if (!window.confirm('Reset local Glow OS personalization to the defaults? Your life data will not be deleted.')) return;
    setSettings(defaults);
    window.localStorage.removeItem(STORAGE_KEY);
    applyTheme(defaults.theme);
  }

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#eee9e5,#f7f1ec)] p-5">
        <Sparkles size={58} strokeWidth={0.75} className="absolute right-5 top-3 text-[#7e756d]/15" />
        <p className="glow-eyebrow">Personal control center</p>
        <p className="glow-display mt-2 text-[24px] text-[#4a413a]">Tune Glow without disturbing what already works.</p>
        <p className="mt-2 max-w-2xl text-[9px] leading-4 text-[#7c7169]">{summary}</p>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="p-5">
          <Palette size={18} className="text-[#8b746c]" />
          <p className="glow-display mt-3 text-[17px] text-[#4a413a]">Appearance + personalization</p>
          <label className="mt-4 block text-[8px] uppercase tracking-[.12em] text-[#8d7d74]">Theme</label>
          <select value={settings.theme} onChange={(event) => update('theme', event.target.value as ThemeId)} className="mt-2 w-full rounded-[8px] border border-[#e4d9d1] bg-[#fffaf6] px-3 py-2 text-[10px] text-[#554a43]">
            {THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
          </select>
          <label className="mt-4 block text-[8px] uppercase tracking-[.12em] text-[#8d7d74]">Information density</label>
          <select value={settings.density} onChange={(event) => update('density', event.target.value as GlowSettings['density'])} className="mt-2 w-full rounded-[8px] border border-[#e4d9d1] bg-[#fffaf6] px-3 py-2 text-[10px] text-[#554a43]">
            <option value="airy">Airy</option>
            <option value="balanced">Balanced</option>
            <option value="compact">Compact</option>
          </select>
          <Link href="/dashboard" className="mt-4 inline-flex text-[8px] font-medium text-[#735f57] underline underline-offset-4">Open visual customization</Link>
        </Card>

        <Card className="p-5">
          <Bot size={18} className="text-[#8b746c]" />
          <p className="glow-display mt-3 text-[17px] text-[#4a413a]">Glow Brain + AI</p>
          <ToggleRow label="Suggestions" note="Allow Glow to surface recommendations from your existing context." checked={settings.suggestions} onChange={(value) => update('suggestions', value)} />
          <ToggleRow label="Proactive Brain" note="Allow attention signals and cross-system patterns to appear before you ask." checked={settings.proactiveBrain} onChange={(value) => update('proactiveBrain', value)} />
          <p className="mt-4 rounded-[8px] bg-[#f8f0eb] p-3 text-[8px] leading-4 text-[#776b64]">High-impact or destructive AI actions still require explicit approval. These preferences do not grant extra permissions.</p>
        </Card>

        <Card className="p-5">
          <BellRing size={18} className="text-[#8b746c]" />
          <p className="glow-display mt-3 text-[17px] text-[#4a413a]">Notifications</p>
          <p className="mt-2 text-[8px] leading-4 text-[#7d7169]">Choose how strongly Glow should surface reminders and intelligence inside the app.</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(['quiet', 'gentle', 'active'] as const).map((level) => (
              <button key={level} type="button" onClick={() => update('notificationLevel', level)} className={`rounded-[8px] border px-3 py-2 text-[8px] uppercase tracking-[.1em] ${settings.notificationLevel === level ? 'border-[#9b7d73] bg-[#f3e5df] text-[#594841]' : 'border-[#e6dbd4] bg-[#fffaf6] text-[#8b7d75]'}`}>{level}</button>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <ShieldCheck size={18} className="text-[#8b746c]" />
          <p className="glow-display mt-3 text-[17px] text-[#4a413a]">Privacy</p>
          <ToggleRow label="Private mode" note="Reduce optional intelligence surfacing on shared screens." checked={settings.privateMode} onChange={(value) => update('privateMode', value)} icon={<Eye size={13} />} />
          <ToggleRow label="Sensitive Memory safeguards" note="Keep sensitive-memory protections enabled in the experience." checked={settings.sensitiveMemory} onChange={(value) => update('sensitiveMemory', value)} />
          <Link href="/connections" className="mt-4 inline-flex text-[8px] font-medium text-[#735f57] underline underline-offset-4">Review connected services and permissions</Link>
        </Card>
      </div>

      <Card className="p-5">
        <p className="glow-display text-[17px] text-[#4a413a]">Your data controls</p>
        <p className="mt-2 max-w-2xl text-[8px] leading-4 text-[#7d7169]">Export your Settings preferences any time. Reset only removes local personalization from this browser; it does not delete account, Neon, Calendar, Gmail, Reminders, or life-system data.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={exportSettings} className="inline-flex items-center gap-2 rounded-[8px] border border-[#dfd3cb] bg-[#fffaf6] px-4 py-2 text-[8px] font-medium text-[#62534c]"><Download size={13} /> Export settings</button>
          <button type="button" onClick={resetSettings} className="inline-flex items-center gap-2 rounded-[8px] border border-[#e1cfc9] bg-[#f8e8e4] px-4 py-2 text-[8px] font-medium text-[#74564e]"><RotateCcw size={13} /> Reset personalization</button>
          <Link href="/import" className="inline-flex items-center gap-2 rounded-[8px] border border-[#dfd3cb] bg-[#fffaf6] px-4 py-2 text-[8px] font-medium text-[#62534c]"><Download size={13} /> Import / restore</Link>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-[8px] border border-[#ead8d2] bg-[#fff8f5] p-3 text-[8px] leading-4 text-[#7a625a]"><Trash2 size={13} className="mt-0.5 shrink-0" /> Account-level deletion is deliberately not automated here. Destructive life-data deletion must remain a separate, explicit, authenticated flow with confirmation rather than a one-click Settings action.</div>
      </Card>
    </div>
  );
}

function ToggleRow({ label, note, checked, onChange, icon }: { label: string; note: string; checked: boolean; onChange: (value: boolean) => void; icon?: ReactNode }) {
  return (
    <label className="mt-4 flex cursor-pointer items-start justify-between gap-4 rounded-[8px] border border-[#eadfd8] bg-[#fffaf6] p-3">
      <span className="flex gap-2">
        {icon}
        <span><span className="block text-[9px] font-medium text-[#554942]">{label}</span><span className="mt-1 block text-[8px] leading-4 text-[#84766e]">{note}</span></span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-[#8b746c]" />
    </label>
  );
}
