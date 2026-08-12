'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, FileJson, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { confirmImportAction, previewUploadedImportAction } from '@/app/actions/importer';
import { useServerAction } from '@/lib/hooks/use-server-action';
import type { ImportItemInput } from '@/lib/validations/importer';

type UploadedPreviewItem = { item: ImportItemInput; duplicate: boolean };
type Stage = 'upload' | 'organize' | 'review' | 'done';

const STEP_LABELS: Array<{ id: Exclude<Stage, 'done'>; label: string }> = [
  { id: 'upload', label: '1 Upload' },
  { id: 'organize', label: '2 Preview & organize' },
  { id: 'review', label: '3 Review & confirm' },
];

function itemLabel(item: ImportItemInput) {
  return 'name' in item ? item.name : item.title;
}

function normalizeUploadedItems(value: unknown): unknown[] {
  const source = Array.isArray(value)
    ? value
    : value && typeof value === 'object' && Array.isArray((value as { items?: unknown[] }).items)
      ? (value as { items: unknown[] }).items
      : [];

  return source.map((entry, index) => {
    if (!entry || typeof entry !== 'object') return entry;
    const candidate = entry as Record<string, unknown>;
    return {
      ...candidate,
      key: typeof candidate.key === 'string' && candidate.key.trim() ? candidate.key : `upload-${index + 1}-${String(candidate.category ?? 'item')}`,
    };
  });
}

export function UploadedImporter() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>('upload');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [preview, setPreview] = useState<UploadedPreviewItem[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [success, setSuccess] = useState<string | null>(null);
  const previewAction = useServerAction(previewUploadedImportAction);
  const confirmAction = useServerAction(confirmImportAction);

  const chosen = useMemo(() => preview.filter(({ item }) => selectedKeys.has(item.key)), [preview, selectedKeys]);
  const duplicateCount = preview.filter((entry) => entry.duplicate).length;

  async function handleFile(file: File | null) {
    if (!file) return;
    setParseError(null);
    setSuccess(null);
    setFileName(file.name);
    setStage('upload');
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const items = normalizeUploadedItems(parsed);
      if (items.length === 0) {
        setParseError('This JSON file does not contain an item array. Use an array or an object with an items array.');
        return;
      }
      previewAction.run(items, (result) => {
        const typed = result as UploadedPreviewItem[];
        setPreview(typed);
        setSelectedKeys(new Set(typed.filter((entry) => !entry.duplicate).map((entry) => entry.item.key)));
        setStage('organize');
      });
    } catch {
      setParseError('Glow OS could not read this file as JSON. Check the file and try again.');
    }
  }

  function toggle(key: string) {
    setSelectedKeys((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
    if (stage === 'review') setStage('organize');
  }

  function confirmUpload() {
    if (chosen.length === 0) return;
    confirmAction.run(
      { batchCategory: 'uploaded-json', items: chosen.map(({ item }) => item) },
      (batch) => {
        setSuccess(`${chosen.length} uploaded item${chosen.length === 1 ? '' : 's'} imported in batch ${batch.id.slice(0, 8)}.`);
        setStage('done');
        setPreview([]);
        setSelectedKeys(new Set());
        router.refresh();
      },
    );
  }

  return (
    <Card className="space-y-4 border-dashed">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="glow-eyebrow">Upload your own data</p>
          <h3 className="mt-1 text-lg font-semibold" style={{ color: 'var(--glow-text)' }}>JSON import desk</h3>
          <p className="mt-1 max-w-2xl text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            Upload a JSON array, or an object with an <code>items</code> array. Glow OS validates it, checks duplicates, lets you organize the selection, then requires a final review before writing anything.
          </p>
        </div>
        <FileJson size={28} style={{ color: 'var(--glow-accent)' }} />
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {STEP_LABELS.map((step) => {
          const active = stage === step.id || (stage === 'done' && step.id === 'review');
          const complete = step.id === 'upload' ? stage !== 'upload' : step.id === 'organize' ? stage === 'review' || stage === 'done' : stage === 'done';
          return (
            <div key={step.id} className="rounded-xl border px-3 py-2 text-xs font-medium" style={{ borderColor: active ? 'var(--glow-accent)' : 'var(--glow-border)', color: active || complete ? 'var(--glow-text)' : 'var(--glow-text-muted)' }}>
              {complete ? '✓ ' : ''}{step.label}
            </div>
          );
        })}
      </div>

      <label className="block rounded-2xl border p-4" style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
        <span className="text-sm font-medium" style={{ color: 'var(--glow-text)' }}>{fileName ?? 'Choose a .json file'}</span>
        <input className="mt-2 block w-full text-xs" type="file" accept="application/json,.json" onChange={(event) => void handleFile(event.target.files?.[0] ?? null)} />
      </label>

      {(parseError || previewAction.error) && <p className="text-sm text-rose-500">{parseError ?? previewAction.error}</p>}
      {previewAction.isPending && <p className="text-sm" style={{ color: 'var(--glow-text-muted)' }}>Validating file and checking for duplicates…</p>}

      {preview.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>{chosen.length} of {preview.length} selected</p>
            <p className="text-xs" style={{ color: 'var(--glow-text-muted)' }}>{duplicateCount} possible duplicate{duplicateCount === 1 ? '' : 's'} found</p>
          </div>
          {preview.map(({ item, duplicate }) => (
            <label key={item.key} className="flex items-start gap-3 rounded-2xl border p-3" style={{ borderColor: duplicate ? '#f59e0b66' : 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}>
              <input type="checkbox" className="mt-1 h-4 w-4" checked={selectedKeys.has(item.key)} onChange={() => toggle(item.key)} />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2 text-sm font-medium" style={{ color: 'var(--glow-text)' }}>
                  {itemLabel(item)}
                  {duplicate && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700"><AlertTriangle size={10} /> Possible duplicate</span>}
                </span>
                <span className="mt-1 block text-xs" style={{ color: 'var(--glow-text-muted)' }}>{item.category} · key {item.key}</span>
              </span>
            </label>
          ))}

          {stage === 'organize' && (
            <Button type="button" onClick={() => setStage('review')} disabled={chosen.length === 0}>Review {chosen.length} selected</Button>
          )}

          {stage === 'review' && (
            <div className="space-y-3 rounded-2xl border p-4" style={{ borderColor: 'var(--glow-accent)', background: 'var(--glow-surface)' }}>
              <div className="flex items-start gap-2">
                <ShieldCheck size={18} style={{ color: 'var(--glow-accent)' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--glow-text)' }}>Final review</p>
                  <p className="text-xs" style={{ color: 'var(--glow-text-muted)' }}>Confirming will create exactly {chosen.length} selected item{chosen.length === 1 ? '' : 's'}. You can undo this batch later from Import history.</p>
                </div>
              </div>
              {confirmAction.error && <p className="text-sm text-rose-500">{confirmAction.error}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="secondary" onClick={() => setStage('organize')}>Back to organize</Button>
                <Button type="button" onClick={confirmUpload} disabled={confirmAction.isPending}>{confirmAction.isPending ? 'Importing…' : `Confirm import of ${chosen.length}`}</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {stage === 'done' && success && (
        <div className="flex items-start gap-2 rounded-2xl border p-4 text-sm text-emerald-700" style={{ borderColor: '#10b98155' }}>
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" /> {success} The batch is now in Import history and can be undone there.
        </div>
      )}
    </Card>
  );
}
