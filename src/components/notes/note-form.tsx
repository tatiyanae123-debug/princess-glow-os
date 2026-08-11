'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FieldWrapper, TextInput, TextArea } from '@/components/ui/form-field';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createNoteAction, updateNoteAction } from '@/app/actions/notes';
import type { Note } from '@/lib/types';

type NoteFormValues = {
  title: string;
  content: string;
  tags: string;
  pinned: boolean;
};

function toFormValues(note?: Note | null): NoteFormValues {
  return {
    title: note?.title ?? '',
    content: note?.content ?? '',
    tags: note?.tags?.join(', ') ?? '',
    pinned: note?.pinned ?? false,
  };
}

export function NoteForm({
  note,
  onSaved,
  onCancel,
}: {
  note?: Note | null;
  onSaved: (note: Note) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<NoteFormValues>(() => toFormValues(note));
  const create = useServerAction(createNoteAction);
  const update = useServerAction((input: Record<string, unknown>) => updateNoteAction(note?.id ?? '', input));
  const active = note ? update : create;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const payload = {
      title: values.title,
      content: values.content || undefined,
      tags: values.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      pinned: values.pinned,
    };
    if (note) {
      update.run(payload, (data) => onSaved(data as Note));
    } else {
      create.run(payload, (data) => onSaved(data as Note));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FieldWrapper label="Title">
        <TextInput
          value={values.title}
          onChange={(e) => setValues((v) => ({ ...v, title: e.target.value }))}
          placeholder="Give this note a title"
          required
        />
      </FieldWrapper>
      <FieldWrapper label="Content">
        <TextArea
          value={values.content}
          onChange={(e) => setValues((v) => ({ ...v, content: e.target.value }))}
          placeholder="Write it down before it slips away"
        />
      </FieldWrapper>
      <FieldWrapper label="Tags">
        <TextInput
          value={values.tags}
          onChange={(e) => setValues((v) => ({ ...v, tags: e.target.value }))}
          placeholder="ideas, planning, inspiration"
        />
        <p className="mt-1 text-xs" style={{ color: 'var(--glow-text-muted)' }}>Separate tags with commas.</p>
      </FieldWrapper>
      <label className="flex items-center gap-2 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
        <input
          type="checkbox"
          checked={values.pinned}
          onChange={(e) => setValues((v) => ({ ...v, pinned: e.target.checked }))}
          className="h-4 w-4 rounded"
        />
        Pin this note
      </label>
      {active.error && <p className="text-sm text-rose-500">{active.error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={active.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={active.isPending}>
          {active.isPending ? 'Saving…' : note ? 'Save changes' : 'Add note'}
        </Button>
      </div>
    </form>
  );
}
