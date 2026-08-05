'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Undo2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { previewImportAction, confirmImportAction, undoImportAction } from '@/app/actions/importer';
import type { ImportCategory } from '@/lib/glow-content/library';
import type { PreviewItem } from '@/lib/importer/preview';
import type { ImportItemInput } from '@/lib/validations/importer';

const CATEGORY_LABELS: Record<ImportCategory, string> = {
  routines: 'Core daily routines',
  habits: 'Core daily habits',
  tasks: 'Tasks & reusable templates',
  weekly_themes: 'Weekly themes (reference only)',
  beauty_routines: 'Beauty routines',
  hair_routines: 'Hair routines',
  wellness_routines: 'Wellness routines',
  workout_plans: 'Workout plans (reference only)',
  home_resets: 'Home resets',
  finance_reviews: 'Finance reviews',
  planning_rituals: 'Planning rituals',
  saint_care: 'Saint care',
  calendar_templates: 'Recurring calendar templates',
  monthly_resets: 'Monthly resets',
  seasonal_resets: 'Seasonal resets',
  yearly_resets: 'Yearly resets',
};

const IMPORTABLE_CATEGORIES = (Object.keys(CATEGORY_LABELS) as ImportCategory[]).filter(
  (c) => c !== 'weekly_themes' && c !== 'workout_plans',
);

function itemLabel(template: PreviewItem['template']) {
  return 'name' in template ? template.name : template.title;
}

function toImportItem(item: PreviewItem, overrides: { startTime?: string }): ImportItemInput {
  const t = item.template;
  if (t.category === 'routines') return { category: 'routines', key: item.key, name: t.name, description: t.description, timeOfDay: t.timeOfDay, daysOfWeek: t.daysOfWeek };
  if (t.category === 'habits') return { category: 'habits', key: item.key, name: t.name, description: t.description, frequency: t.frequency };
  if (t.category === 'tasks') return { category: 'tasks', key: item.key, title: t.title, description: t.description };
  if (t.category === 'beauty_routines') return { category: 'beauty_routines', key: item.key, name: t.name, timeOfDay: t.timeOfDay, products: t.products };
  return { category: 'calendar_templates', key: item.key, title: t.title, description: t.description, startTime: overrides.startTime ?? t.startTime, durationMinutes: t.durationMinutes, daysOfWeek: t.daysOfWeek };
}

type BatchSummary = { id: string; category: string; status: string; summary: string | null; createdAt: Date };

export function MasterImporter({ initialBatches }: { initialBatches: BatchSummary[] }) {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<Set<ImportCategory>>(new Set());
  const [preview, setPreview] = useState<PreviewItem[] | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<Record<string, { startTime?: string }>>({});
  const [batches, setBatches] = useState<BatchSummary[]>(initialBatches);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const previewAction = useServerAction(previewImportAction);
  const confirmAction = useServerAction(confirmImportAction);
  const undoAction = useServerAction((id: string) => undoImportAction(id));

  const grouped = useMemo(() => {
    if (!preview) return new Map<ImportCategory, PreviewItem[]>();
    const map = new Map<ImportCategory, PreviewItem[]>();
    for (const item of preview) {
      const list = map.get(item.template.category) ?? [];
      list.push(item);
      map.set(item.template.category, list);
    }
    return map;
  }, [preview]);

  function toggleCategoryFilter(category: ImportCategory) {
    setSelectedCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  }

  function runPreview() {
    setSuccessMessage(null);
    previewAction.run(Array.from(selectedCategories), (items) => {
      setPreview(items);
      setSelectedKeys(new Set(items.filter((i) => !i.duplicate).map((i) => i.key)));
      setOverrides({});
    });
  }

  function toggleItem(key: string) {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleCategoryItems(category: ImportCategory, items: PreviewItem[]) {
    setSelectedKeys((current) => {
      const next = new Set(current);
      const allSelected = items.every((i) => next.has(i.key));
      for (const item of items) {
        if (allSelected) next.delete(item.key);
        else next.add(item.key);
      }
      return next;
    });
  }

  function selectAll() {
    if (!preview) return;
    setSelectedKeys(new Set(preview.map((i) => i.key)));
  }

  function selectNone() {
    setSelectedKeys(new Set());
  }

  function handleConfirm() {
    if (!preview) return;
    const chosen = preview.filter((i) => selectedKeys.has(i.key));
    if (chosen.length === 0) return;
    const items = chosen.map((i) => toImportItem(i, overrides[i.key] ?? {}));
    const batchCategory = selectedCategories.size === 1 ? Array.from(selectedCategories)[0] : 'mixed';
    confirmAction.run({ batchCategory, items }, (batch) => {
      setSuccessMessage(`Imported ${items.length} item(s).`);
      setBatches((current) => [{ id: batch.id, category: batch.category, status: batch.status, summary: batch.summary, createdAt: batch.createdAt }, ...current]);
      setPreview(null);
      setSelectedKeys(new Set());
      router.refresh();
    });
  }

  function handleUndo(batchId: string) {
    undoAction.run(batchId, () => {
      setBatches((current) => current.map((b) => (b.id === batchId ? { ...b, status: 'undone' } : b)));
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--glow-accent)' }}>
            Master Importer
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            Nothing is created until you review the preview and confirm. Choose categories to preview.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {IMPORTABLE_CATEGORIES.map((category) => {
            const active = selectedCategories.has(category);
            return (
              <button
                key={category}
                type="button"
                onClick={() => toggleCategoryFilter(category)}
                className="rounded-full px-3 py-1.5 text-xs font-medium transition"
                style={{
                  background: active ? 'var(--glow-accent)' : 'var(--glow-surface-muted)',
                  color: active ? '#fff' : 'var(--glow-text-muted)',
                  border: '1px solid var(--glow-border)',
                }}
              >
                {CATEGORY_LABELS[category]}
              </button>
            );
          })}
        </div>
        {previewAction.error && <p className="text-sm text-rose-500">{previewAction.error}</p>}
        <Button onClick={runPreview} disabled={selectedCategories.size === 0 || previewAction.isPending}>
          {previewAction.isPending ? 'Building preview…' : 'Preview import'}
        </Button>
      </Card>

      {preview && preview.length > 0 && (
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>
              {selectedKeys.size} of {preview.length} selected
            </p>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={selectAll}>Select all</Button>
              <Button type="button" variant="ghost" onClick={selectNone}>Select none</Button>
            </div>
          </div>

          {[...grouped.entries()].map(([category, items]) => (
            <div key={category} className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--glow-text-muted)' }}>
                  {CATEGORY_LABELS[category]}
                </p>
                <button
                  type="button"
                  onClick={() => toggleCategoryItems(category, items)}
                  className="text-xs underline"
                  style={{ color: 'var(--glow-accent)' }}
                >
                  toggle all in category
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-start gap-3 rounded-2xl border p-3"
                    style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedKeys.has(item.key)}
                      onChange={() => toggleItem(item.key)}
                      className="mt-1 h-4 w-4 shrink-0 rounded"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium" style={{ color: 'var(--glow-text)' }}>{itemLabel(item.template)}</p>
                        {item.duplicate && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                            <AlertTriangle size={10} /> Possible duplicate
                          </span>
                        )}
                      </div>
                      {item.template.category === 'calendar_templates' && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs" style={{ color: 'var(--glow-text-muted)' }}>
                          <label className="flex items-center gap-1.5">
                            Time
                            <input
                              type="time"
                              defaultValue={item.template.startTime}
                              onChange={(e) =>
                                setOverrides((current) => ({ ...current, [item.key]: { ...current[item.key], startTime: e.target.value } }))
                              }
                              className="rounded-lg border px-2 py-1"
                              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface)' }}
                            />
                          </label>
                          <span>{item.template.daysOfWeek.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {confirmAction.error && <p className="text-sm text-rose-500">{confirmAction.error}</p>}
          {successMessage && <p className="text-sm text-emerald-600 dark:text-emerald-400">{successMessage}</p>}

          <Button onClick={handleConfirm} disabled={selectedKeys.size === 0 || confirmAction.isPending}>
            {confirmAction.isPending ? 'Importing…' : `Import ${selectedKeys.size} selected`}
          </Button>
        </Card>
      )}

      {preview && preview.length === 0 && (
        <Card>
          <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>Nothing to preview for the selected categories yet.</p>
        </Card>
      )}

      <Card className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.25em]" style={{ color: 'var(--glow-text-muted)' }}>
          Import history
        </p>
        {batches.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>No imports yet.</p>
        ) : (
          batches.map((batch) => (
            <div
              key={batch.id}
              className="flex items-center justify-between rounded-2xl border px-4 py-3"
              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--glow-text)' }}>{batch.category}</p>
                <p className="text-xs" style={{ color: 'var(--glow-text-muted)' }}>
                  {batch.summary} · {batch.status} · {new Date(batch.createdAt).toLocaleDateString('en')}
                </p>
              </div>
              {batch.status === 'confirmed' && (
                <Button type="button" variant="ghost" className="flex items-center gap-1.5" onClick={() => handleUndo(batch.id)} disabled={undoAction.isPending}>
                  <Undo2 size={13} /> Undo
                </Button>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
