'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { WellnessEntryForm } from '@/components/wellness/wellness-entry-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteWellnessEntryAction } from '@/app/actions/wellness-entries';
import type { WellnessEntry } from '@/lib/types';

export function WellnessEntryManager({ initialEntries }: { initialEntries: WellnessEntry[] }) {
  const [entries, setEntries] = useState<WellnessEntry[]>(initialEntries);
  const [dialogEntry, setDialogEntry] = useState<WellnessEntry | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<WellnessEntry | null>(null);
  const del = useServerAction((id: string) => deleteWellnessEntryAction(id));

  const latest = entries[0] ?? null;

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
      <div className="flex justify-end">
        <Button onClick={() => setDialogEntry('new')} className="flex items-center gap-1.5">
          <Plus size={14} /> Log check-in
        </Button>
      </div>

      {latest ? (
        <Card className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[20px] border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
            <p className="font-medium" style={{ color: 'var(--glow-text)' }}>Mood</p>
            <p className="mt-2 text-lg font-semibold capitalize text-rose-600 dark:text-rose-400">{latest.mood ?? '–'}</p>
            <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>Latest entry · {latest.entryDate}</p>
          </div>
          <div className="rounded-[20px] border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
            <p className="font-medium" style={{ color: 'var(--glow-text)' }}>Energy</p>
            <p className="mt-2 text-lg font-semibold capitalize text-amber-600 dark:text-amber-400">{latest.energy ?? '–'}</p>
            {latest.waterGlasses !== null && (
              <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>{latest.waterGlasses} glasses of water</p>
            )}
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
          <p className="py-4 text-center text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            No wellness entries yet. Log your first check-in.
          </p>
        </Card>
      )}

      {entries.length > 1 && (
        <Card className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--glow-text-muted)' }}>
            Recent entries
          </p>
          {entries.slice(1, 6).map((entry) => (
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
