'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { BellRing, Bot, Download, Eye, Palette, RotateCcw, ShieldCheck, Sparkles, Trash2 } from 'lucide-react';
import { applyTheme, THEMES, type ThemeId } from '@/lib/themes';
import { VisualSettingsPanel } from '@/components/ui/visual-settings-panel';

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
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5"><Bot size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Glow Intelligence</p></div>
            <Link href="/settings/intelligence" className="text-[11px] font-medium text-[#C9727E]">Activation →</Link>
          </div>
          <ToggleRow label="Suggestions" note="Allow Glow to surface recommendations from your existing context." checked={settings.suggestions} onChange={(value) => update('suggestions', value)} />
          <ToggleRow label="Proactive Brain" note="Allow attention signals and cross-system patterns to appear before you ask." checked={settings.proactiveBrain} onChange={(value) => update('proactiveBrain', value)} />
          <p className="mt-3 rounded-lg bg-[#FDFAF8] p-3 text-[10.5px] leading-4 text-[#8A8078]">High-impact or destructive AI actions still require explicit approval. These preferences do not grant extra permissions.</p>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center gap-1.5"><BellRing size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Notifications</p></div>
          <p className="mt-2 text-[11px] text-[#8A8078]">Choose how strongly Glow should surface reminders and intelligence inside the app.</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {(['quiet', 'gentle', 'active'] as const).map((level) => (
              <button key={level} type="button" onClick={() => update('notificationLevel', level)} className={`rounded-lg border px-3 py-2 text-[10.5px] font-medium capitalize transition ${settings.notificationLevel === level ? 'border-[#C9727E] bg-[#FBE4E8] text-[#B15A68]' : 'border-[#F1E7E3] text-[#8A8078]'}`}>{level}</button>
            ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <div className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#C9727E]" /><p className="text-[13px] font-medium text-[#2B2420]">Data &amp; Privacy</p></div>
          <ToggleRow label="Private mode" note="Reduce optional intelligence surfacing on shared screens." checked={settings.privateMode} onChange={(value) => update('privateMode', value)} icon={<Eye size={13} className="text-[#9A9088]" />} />
          <ToggleRow label="Sensitive Memory safeguards" note="Keep sensitive-memory protections enabled in the experience." checked={settings.sensitiveMemory} onChange={(value) => update('sensitiveMemory', value)} />
        </div>
      </div>

      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
        <p className="text-[13px] font-medium text-[#2B2420]">Import / Export</p>
        <p className="mt-2 max-w-2xl text-[11px] leading-4 text-[#8A8078]">Export your Settings preferences any time. Reset only removes local personalization from this browser; it does not delete account, Neon, Calendar, Gmail, Reminders, or life-system data.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={exportSettings} className="inline-flex items-center gap-1.5 rounded-full border border-[#F1E7E3] px-4 py-2 text-[11px] font-medium text-[#4A4440]"><Download size={13} />Export settings</button>
          <button type="button" onClick={resetSettings} className="inline-flex items-center gap-1.5 rounded-full border border-[#F1E7E3] bg-[#FDF3F2] px-4 py-2 text-[11px] font-medium text-[#A2505E]"><RotateCcw size={13} />Reset personalization</button>
          <Link href="/import" className="inline-flex items-center gap-1.5 rounded-full border border-[#F1E7E3] px-4 py-2 text-[11px] font-medium text-[#4A4440]"><Sparkles size={13} />Import / restore data</Link>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#F1E7E3] bg-[#FDFAF8] p-3 text-[10.5px] leading-4 text-[#8A8078]"><Trash2 size={13} className="mt-0.5 shrink-0" />Account-level deletion is deliberately not automated here. Destructive life-data deletion must remain a separate, explicit, authenticated flow with confirmation rather than a one-click Settings action.</div>
      </div>

      <VisualSettingsPanel open={visualPanelOpen} onClose={() => setVisualPanelOpen(false)} />
    </div>
  );
}

function ToggleRow({ label, note, checked, onChange, icon }: { label: string; note: string; checked: boolean; onChange: (value: boolean) => void; icon?: ReactNode }) {
  return (
    <label className="mt-3 flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-[#F1E7E3] bg-[#FDFAF8] p-3">
      <span className="flex gap-2">
        {icon}
        <span><span className="block text-[11.5px] font-medium text-[#2B2420]">{label}</span><span className="mt-0.5 block text-[10.5px] leading-4 text-[#8A8078]">{note}</span></span>
      </span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="mt-1 h-4 w-4 accent-[#C9727E]" />
    </label>
  );
}
