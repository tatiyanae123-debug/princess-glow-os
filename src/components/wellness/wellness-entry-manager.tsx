'use client';

import { useMemo, useState } from 'react';
import { Activity, BedDouble, Droplets, HeartPulse, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { WellnessEntryForm } from '@/components/wellness/wellness-entry-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteWellnessEntryAction } from '@/app/actions/wellness-entries';
import type { WellnessEntry } from '@/lib/types';

const moodScore: Record<NonNullable<WellnessEntry['mood']>, number> = {
  great: 5,
  good: 4,
  okay: 3,
  low: 2,
  rough: 1,
};

const energyScore: Record<NonNullable<WellnessEntry['energy']>, number> = {
  high: 4,
  medium: 3,
  low: 2,
  exhausted: 1,
};

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}

function signedDelta(value: number | null) {
  if (value == null) return null;
  const rounded = Math.round(value * 10) / 10;
  return `${rounded > 0 ? '+' : ''}${rounded.toFixed(1)}`;
}

function toolkitForLatest(latest: WellnessEntry | null) {
  if (!latest) {
    return {
      title: 'Start with one check-in',
      detail: 'Log mood, energy, sleep, and hydration. Glow OS needs a few real days before it can surface useful patterns.',
      label: 'Begin baseline',
    };
  }
  if (latest.sleepHours != null && latest.sleepHours < 6.5) {
    return {
      title: 'Recovery-first reset',
      detail: 'Sleep is running light. Protect the next block of your day, lower optional intensity, and make tonight easier to start.',
      label: 'Sleep support',
    };
  }
  if (latest.waterGlasses != null && latest.waterGlasses < 5) {
    return {
      title: 'Hydration catch-up',
      detail: 'Hydration is the clearest low signal in your latest check-in. Pair water with the next meal or routine instead of relying on memory.',
      label: 'Hydration support',
    };
  }
  if (latest.mood === 'rough' || latest.mood === 'low' || latest.energy === 'exhausted' || latest.energy === 'low') {
    return {
      title: 'Lighter-day toolkit',
      detail: 'Your latest mood or energy signal suggests reducing friction. Keep essentials visible, defer low-value extras, and choose one restorative action.',
      label: 'Gentle mode',
    };
  }
  return {
    title: 'Steady-day toolkit',
    detail: 'Your latest signals look stable. Keep the basics consistent and use the check-in history to protect what is already working.',
    label: 'Maintain rhythm',
  };
}

export function WellnessEntryManager({ initialEntries }: { initialEntries: WellnessEntry[] }) {
  const [entries, setEntries] = useState<WellnessEntry[]>(initialEntries);
  const [dialogEntry, setDialogEntry] = useState<WellnessEntry | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WellnessEntry | null>(null);
  const del = useServerAction((id: string) => deleteWellnessEntryAction(id));

  const latest = entries[0] ?? null;
  const toolkit = toolkitForLatest(latest);

  const insights = useMemo(() => {
    const recent = entries.slice(0, 28);
    const hydrated = recent.filter((entry) => (entry.waterGlasses ?? 0) >= 8 && entry.mood);
    const lessHydrated = recent.filter((entry) => entry.waterGlasses != null && entry.waterGlasses < 8 && entry.mood);
    const rested = recent.filter((entry) => (entry.sleepHours ?? 0) >= 7 && entry.energy);
    const lessRested = recent.filter((entry) => entry.sleepHours != null && entry.sleepHours < 7 && entry.energy);

    const hydrationMoodDelta = hydrated.length >= 2 && lessHydrated.length >= 2
      ? (average(hydrated.map((entry) => moodScore[entry.mood!])) ?? 0) - (average(lessHydrated.map((entry) => moodScore[entry.mood!])) ?? 0)
      : null;
    const sleepEnergyDelta = rested.length >= 2 && lessRested.length >= 2
      ? (average(rested.map((entry) => energyScore[entry.energy!])) ?? 0) - (average(lessRested.map((entry) => energyScore[entry.energy!])) ?? 0)
      : null;

    const sleepValues = recent.flatMap((entry) => entry.sleepHours == null ? [] : [entry.sleepHours]);
    const waterValues = recent.flatMap((entry) => entry.waterGlasses == null ? [] : [entry.waterGlasses]);

    return {
      hydrationMoodDelta,
      sleepEnergyDelta,
      averageSleep: average(sleepValues),
      averageWater: average(waterValues),
      sampleSize: recent.length,
    };
  }, [entries]);

  function handleSaved(entry: WellnessEntry) {
    setEntries((current) => {
      const exists = current.some((e) => e.id === entry.id);
      const next = exists ? current.map((e) => (e.id === entry.id ? entry : e)) : [entry, ...current];
      return [...next].sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1));
    });
    setDialogEntry(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setEntries((current) => current.filter((e) => e.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="glow-eyebrow">Daily check-in</p>
          <p className="mt-1 text-[9px] text-[#758074]">Mood, energy, sleep, and hydration become more useful when Glow can see them together over time.</p>
        </div>
        <Button onClick={() => setDialogEntry('new')} className="flex items-center gap-1.5">
          <Plus size={14} /> Log check-in
        </Button>
      </div>

      {latest ? (
        <Card className="grid gap-3 md:grid-cols-4">
          <div className="rounded-[20px] border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
            <p className="font-medium" style={{ color: 'var(--glow-text)' }}>Mood</p>
            <p className="mt-2 text-lg font-semibold capitalize text-rose-600 dark:text-rose-400">{latest.mood ?? '–'}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>Latest entry · {latest.entryDate}</p>
          </div>
          <div className="rounded-[20px] border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
            <p className="font-medium" style={{ color: 'var(--glow-text)' }}>Energy</p>
            <p className="mt-2 text-lg font-semibold capitalize text-amber-600 dark:text-amber-400">{latest.energy ?? '–'}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>Current body signal</p>
          </div>
          <div className="rounded-[20px] border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
            <p className="font-medium" style={{ color: 'var(--glow-text)' }}>Hydration</p>
            <p className="mt-2 text-lg font-semibold text-cyan-600 dark:text-cyan-400">{latest.waterGlasses != null ? `${latest.waterGlasses} glasses` : '–'}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>Latest check-in</p>
          </div>
          <div className="rounded-[20px] border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium" style={{ color: 'var(--glow-text)' }}>Sleep</p>
              <div className="flex shrink-0 items-center gap-1">
                <button type="button" onClick={() => setDialogEntry(latest)} aria-label="Edit entry" className="rounded-full p-1 transition hover:opacity-70" style={{ color: 'var(--glow-text-muted)' }}>
                  <Pencil size={13} />
                </button>
                <button type="button" onClick={() => setDeleteTarget(latest)} aria-label="Delete entry" className="rounded-full p-1 transition hover:opacity-70" style={{ color: 'var(--glow-text-muted)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <p className="mt-2 text-lg font-semibold text-sky-600 dark:text-sky-400">{latest.sleepHours != null ? `${latest.sleepHours}h` : '–'}</p>
            {latest.notes && <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>{latest.notes}</p>}
          </div>
        </Card>
      ) : (
        <Card>
          <div className="py-6 text-center">
            <p className="text-sm font-medium" style={{ color: 'var(--glow-text)' }}>No wellness entries yet.</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>Log your first check-in to create a private baseline Glow can learn from.</p>
            <Button onClick={() => setDialogEntry('new')} className="mt-4 inline-flex items-center gap-1.5"><Plus size={14}/> Log first check-in</Button>
          </div>
        </Card>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]">
        <Card className="paper-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="glow-eyebrow">Wellness correlations</p>
              <h3 className="glow-display mt-1 text-[20px] text-[#455247]">What your check-ins are beginning to show</h3>
            </div>
            <Activity size={18} className="text-[#82917f]" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[12px] border border-[#dfe5db] bg-white/45 p-4">
              <div className="flex items-center gap-2 text-[9px] font-medium text-[#596657]"><BedDouble size={13}/> Sleep → energy</div>
              <p className="glow-display mt-2 text-[22px] text-[#455247]">{signedDelta(insights.sleepEnergyDelta) ?? 'Learning'}</p>
              <p className="mt-1 text-[8px] leading-4 text-[#788477]">{insights.sleepEnergyDelta == null ? 'Glow needs at least two rested and two shorter-sleep days with energy logged before comparing them.' : `${insights.sleepEnergyDelta >= 0 ? 'Energy has been higher' : 'Energy has not been higher'} on 7h+ sleep days in this recent sample.`}</p>
            </div>
            <div className="rounded-[12px] border border-[#dfe5db] bg-white/45 p-4">
              <div className="flex items-center gap-2 text-[9px] font-medium text-[#596657]"><Droplets size={13}/> Hydration → mood</div>
              <p className="glow-display mt-2 text-[22px] text-[#455247]">{signedDelta(insights.hydrationMoodDelta) ?? 'Learning'}</p>
              <p className="mt-1 text-[8px] leading-4 text-[#788477]">{insights.hydrationMoodDelta == null ? 'Glow needs at least two 8+ glass days and two lower-hydration days with mood logged before comparing them.' : `${insights.hydrationMoodDelta >= 0 ? 'Mood has been higher' : 'Mood has not been higher'} on 8+ glass days in this recent sample.`}</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-[8px] text-[#7b8778]">
            <span className="rounded-full bg-[#edf1ea] px-3 py-1.5">{insights.sampleSize} recent check-ins</span>
            <span className="rounded-full bg-[#edf1ea] px-3 py-1.5">Avg sleep {insights.averageSleep == null ? '—' : `${insights.averageSleep.toFixed(1)}h`}</span>
            <span className="rounded-full bg-[#edf1ea] px-3 py-1.5">Avg water {insights.averageWater == null ? '—' : `${insights.averageWater.toFixed(1)} glasses`}</span>
          </div>
        </Card>

        <Card className="paper-card bg-[linear-gradient(145deg,#edf2e9,#f8f0eb)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="glow-eyebrow">Support toolkit</p>
              <h3 className="glow-display mt-1 text-[20px] text-[#455247]">{toolkit.title}</h3>
            </div>
            <Sparkles size={18} className="text-[#82917f]" />
          </div>
          <p className="mt-3 text-[9px] leading-5 text-[#6f7b6d]">{toolkit.detail}</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <div className="rounded-[10px] border border-white/70 bg-white/45 p-3"><HeartPulse size={13} className="text-[#758573]"/><p className="mt-2 text-[9px] font-medium text-[#566354]">2-minute reset</p><p className="mt-1 text-[7px] leading-4 text-[#7a8678]">Pause, unclench, breathe slowly, then choose the next smallest useful action.</p></div>
            <div className="rounded-[10px] border border-white/70 bg-white/45 p-3"><Droplets size={13} className="text-[#758573]"/><p className="mt-2 text-[9px] font-medium text-[#566354]">Hydration anchor</p><p className="mt-1 text-[7px] leading-4 text-[#7a8678]">Pair water with meals, medication, or a routine you already complete.</p></div>
            <div className="rounded-[10px] border border-white/70 bg-white/45 p-3"><BedDouble size={13} className="text-[#758573]"/><p className="mt-2 text-[9px] font-medium text-[#566354]">Tonight setup</p><p className="mt-1 text-[7px] leading-4 text-[#7a8678]">Reduce tomorrow friction before bed: charge devices, prep essentials, and protect wind-down time.</p></div>
          </div>
          <span className="mt-4 inline-flex rounded-full bg-white/60 px-3 py-1 text-[8px] font-medium text-[#62715f]">{toolkit.label}</span>
        </Card>
      </section>

      {entries.length > 1 && (
        <Card className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--glow-text-muted)' }}>
            Recent entries
          </p>
          {entries.slice(1, 8).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-[16px] border px-4 py-3"
              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}
            >
              <p className="text-sm" style={{ color: 'var(--glow-text)' }}>{entry.entryDate}</p>
              <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--glow-text-muted)' }}>
                {entry.mood && <span className="capitalize">{entry.mood}</span>}
                {entry.energy && <span className="capitalize">{entry.energy}</span>}
                {entry.sleepHours != null && <span>{entry.sleepHours}h sleep</span>}
                {entry.waterGlasses != null && <span>{entry.waterGlasses} glasses</span>}
                <button type="button" onClick={() => setDialogEntry(entry)} aria-label="Edit entry" className="rounded-full p-1 transition hover:opacity-70">
                  <Pencil size={13} />
                </button>
                <button type="button" onClick={() => setDeleteTarget(entry)} aria-label="Delete entry" className="rounded-full p-1 transition hover:opacity-70">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </Card>
      )}

      <Dialog
        open={dialogEntry !== null}
        onClose={() => setDialogEntry(null)}
        title={dialogEntry === 'new' ? 'Log check-in' : 'Edit check-in'}
      >
        <WellnessEntryForm
          entry={dialogEntry === 'new' ? null : dialogEntry}
          onSaved={handleSaved}
          onCancel={() => setDialogEntry(null)}
        />
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this entry?"
        description={deleteTarget ? `The ${deleteTarget.entryDate} check-in will be removed.` : undefined}
        pending={del.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
