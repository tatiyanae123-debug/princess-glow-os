'use client';

import { useMemo, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { FinanceEntryForm } from '@/components/finance/finance-entry-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteFinanceEntryAction } from '@/app/actions/finance-entries';
import type { FinanceEntry } from '@/lib/types';

export function FinanceEntryManager({ initialEntries }: { initialEntries: FinanceEntry[] }) {
  const [entries, setEntries] = useState<FinanceEntry[]>(initialEntries);
  const [dialogEntry, setDialogEntry] = useState<FinanceEntry | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FinanceEntry | null>(null);
  const del = useServerAction((id: string) => deleteFinanceEntryAction(id));

  const totals = useMemo(() => {
    const income = entries.filter((e) => e.type === 'income').reduce((sum, e) => sum + Number(e.amount), 0);
    const expenses = entries.filter((e) => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0);
    const savings = entries.filter((e) => e.type === 'saving').reduce((sum, e) => sum + Number(e.amount), 0);
    return { income, expenses, savings };
  }, [entries]);

  function handleSaved(entry: FinanceEntry) {
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
          <Plus size={14} /> Add entry
        </Button>
      </div>

      <Card className="grid gap-3 md:grid-cols-3">
        <div className="rounded-[20px] border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
          <p className="font-medium" style={{ color: 'var(--glow-text)' }}>Income</p>
          <p className="mt-2 text-xl font-semibold text-emerald-600 dark:text-emerald-400">
            ${totals.income.toLocaleString('en', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-[20px] border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
          <p className="font-medium" style={{ color: 'var(--glow-text)' }}>Expenses</p>
          <p className="mt-2 text-xl font-semibold text-rose-600 dark:text-rose-400">
            ${totals.expenses.toLocaleString('en', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-[20px] border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
          <p className="font-medium" style={{ color: 'var(--glow-text)' }}>Savings</p>
          <p className="mt-2 text-xl font-semibold text-amber-600 dark:text-amber-400">
            ${totals.savings.toLocaleString('en', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </Card>

      {entries.length > 0 ? (
        <Card className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--glow-text-muted)' }}>
            Recent entries
          </p>
          {entries.slice(0, 8).map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between rounded-[16px] border px-4 py-3"
              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" style={{ color: 'var(--glow-text)' }}>{entry.title}</p>
                <p className="text-xs" style={{ color: 'var(--glow-text-muted)' }}>{entry.category} · {entry.entryDate}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`text-sm font-semibold ${entry.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {entry.type === 'income' ? '+' : '−'}${Number(entry.amount).toLocaleString('en', { minimumFractionDigits: 2 })}
                </span>
                <button type="button" onClick={() => setDialogEntry(entry)} aria-label="Edit entry" className="rounded-full p-1 transition hover:opacity-70" style={{ color: 'var(--glow-text-muted)' }}>
                  <Pencil size={13} />
                </button>
                <button type="button" onClick={() => setDeleteTarget(entry)} aria-label="Delete entry" className="rounded-full p-1 transition hover:opacity-70" style={{ color: 'var(--glow-text-muted)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <p className="py-4 text-center text-sm" style={{ color: 'var(--glow-text-muted)' }}>
          No entries yet. Add your first financial record.
        </p>
      )}

      <Dialog open={dialogEntry !== null} onClose={() => setDialogEntry(null)} title={dialogEntry === 'new' ? 'Add entry' : 'Edit entry'}>
        <FinanceEntryForm entry={dialogEntry === 'new' ? null : dialogEntry} onSaved={handleSaved} onCancel={() => setDialogEntry(null)} />
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this entry?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : undefined}
        pending={del.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
