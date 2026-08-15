'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { BellRing, Bot, Download, Palette, RotateCcw, ShieldCheck, Sparkles } from 'lucide-react';
import { applyTheme, THEMES, type ThemeId } from '@/lib/themes';
import { VisualSettingsPanel } from '@/components/ui/visual-settings-panel';

const STORAGE_KEY = 'glow-settings-v1';

type GlowSettings = {
  theme: ThemeId;
  density: 'airy' | 'balanced' | 'compact';
};

const defaults: GlowSettings = {
  theme: 'modern-princess',
  density: 'airy',
};

function loadSettings(): GlowSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<GlowSettings>;
    return {
      theme: THEMES.some((theme) => theme.id === parsed.theme) ? parsed.theme as ThemeId : defaults.theme,
      density: ['airy', 'balanced', 'compact'].includes(String(parsed.density)) ? parsed.density as GlowSettings['density'] : defaults.density,
    };
  } catch {
    return defaults;
  }
}

export function SettingsControlCenter() {
  const [settings, setSettings] = useState<GlowSettings>(defaults);
  const [ready, setReady] = useState(false);
  const [visualPanelOpen, setVisualPanelOpen] = useState(false);

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
    `${settings.density} density`,
    'saved on this browser',
  ].join(' · '), [settings]);

  function update<K extends keyof GlowSettings>(key: K, value: GlowSettings[K]) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function exportSettings() {
    const payload = JSON.stringify({ exportedAt: new Date().toISOString(), scope: 'visual-personalization', settings }, null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'glow-os-visual-settings.json';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function resetSettings() {
    if (!window.confirm('Reset this browser’s Glow OS visual personalization to the defaults? Your life data will not be deleted.')) return;
    setSettings(defaults);
    window.localStorage.removeItem(STORAGE_KEY);
    applyTheme(defaults.theme);
    document.documentElement.dataset.glowDensity = defaults.density;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-[#F1E7E3] bg-[#FDF8F6] p-4">
        <p className="text-[11.5px] text-[#8A6068]">{summary}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center gap-1.5"><Palette size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Appearance + Personalization</p></div>
          <label className="mt-4 block text-[10.5px] font-medium text-[#8A8078]">Theme</label>
          <select value={settings.theme} onChange={(event) => update('theme', event.target.value as ThemeId)} className="mt-1.5 w-full rounded-lg border border-[#F1E7E3] px-3 py-2 text-[12px] text-[#2B2420]">
            {THEMES.map((theme) => <option key={theme.id} value={theme.id}>{theme.name}</option>)}
          </select>
          <label className="mt-3 block text-[10.5px] font-medium text-[#8A8078]">Information density</label>
          <select value={settings.density} onChange={(event) => update('density', event.target.value as GlowSettings['density'])} className="mt-1.5 w-full rounded-lg border border-[#F1E7E3] px-3 py-2 text-[12px] text-[#2B2420]">
            <option value="airy">Airy</option>
            <option value="balanced">Balanced</option>
            <option value="compact">Compact</option>
          </select>
          <button type="button" onClick={() => setVisualPanelOpen(true)} className="mt-3 inline-flex text-[11px] font-medium text-[#C9727E]">Open visual customization →</button>
          <p className="mt-3 text-[10px] leading-4 text-[#A79D96]">These visual preferences are browser-local and immediately change the interface on this device.</p>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center gap-1.5"><Bot size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Glow Intelligence</p></div>
          <p className="mt-3 text-[11px] leading-5 text-[#8A8078]">Intelligence activation and permissions are managed by the real server-backed intelligence control page. No decorative local toggle can grant or revoke those capabilities.</p>
          <Link href="/settings/intelligence" className="mt-4 inline-flex rounded-full bg-[#2B2420] px-4 py-2.5 text-[11px] font-medium text-white">Open Intelligence Controls →</Link>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center gap-1.5"><BellRing size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Reminders + Notifications</p></div>
          <p className="mt-3 text-[11px] leading-5 text-[#8A8078]">Use the actual Reminders system to manage reminder timing and connected Apple reminder data. Glow does not pretend a browser-only preference changes device notification permissions.</p>
          <Link href="/reminders" className="mt-4 inline-flex rounded-full border border-[#F1E7E3] px-4 py-2.5 text-[11px] font-medium text-[#4A4440]">Open Reminders →</Link>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Data + Privacy</p></div>
          <p className="mt-3 text-[11px] leading-5 text-[#8A8078]">Connection permissions are controlled by the providers and Glow’s authenticated connection layer. Review the live state instead of relying on a cosmetic privacy switch.</p>
          <div className="mt-4 flex flex-wrap gap-2"><Link href="/connections" className="rounded-full border border-[#F1E7E3] px-4 py-2.5 text-[11px] font-medium text-[#4A4440]">Manage Connections</Link><Link href="/settings/intelligence" className="rounded-full border border-[#F1E7E3] px-4 py-2.5 text-[11px] font-medium text-[#4A4440]">Intelligence Permissions</Link></div>
        </div>
      </div>

      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
        <p className="text-[13px] font-medium text-[#2B2420]">Import / Export</p>
        <p className="mt-2 max-w-2xl text-[11px] leading-4 text-[#8A8078]">Export the visual settings that are actually stored on this browser. Life-data import uses the real Import/Intake workflows.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={exportSettings} className="inline-flex items-center gap-1.5 rounded-full border border-[#F1E7E3] px-4 py-2 text-[11px] font-medium text-[#4A4440]"><Download size={13} />Export visual settings</button>
          <button type="button" onClick={resetSettings} className="inline-flex items-center gap-1.5 rounded-full border border-[#F1E7E3] bg-[#FDF3F2] px-4 py-2 text-[11px] font-medium text-[#A2505E]"><RotateCcw size={13} />Reset visual personalization</button>
          <Link href="/import" className="inline-flex items-center gap-1.5 rounded-full border border-[#F1E7E3] px-4 py-2 text-[11px] font-medium text-[#4A4440]"><Sparkles size={13} />Open Import Center</Link>
        </div>
      </div>

      <VisualSettingsPanel open={visualPanelOpen} onClose={() => setVisualPanelOpen(false)} />
    </div>
  );
}
