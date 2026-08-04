'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NoteForm } from '@/components/notes/note-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteNoteAction } from '@/app/actions/notes';
import type { Note } from '@/lib/types';

export function NoteManager({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [dialogNote, setDialogNote] = useState<Note | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const del = useServerAction((id: string) => deleteNoteAction(id));

  function handleSaved(note: Note) {
    setNotes((current) => {
      const exists = current.some((n) => n.id === note.id);
      return exists ? current.map((n) => (n.id === note.id ? note : n)) : [note, ...current];
    });
    setDialogNote(null);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setNotes((current) => current.filter((n) => n.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setDialogNote('new')} className="flex items-center gap-1.5">
          <Plus size={14} /> Add note
        </Button>
      </div>
      <Card className="space-y-3">
        {notes.length === 0 ? (
          <p className="py-4 text-center text-sm" style={{ color: 'var(--glow-text-muted)' }}>
            No notes yet. Capture your first idea.
          </p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className="rounded-[20px] border px-4 py-3"
              style={{ borderColor: 'var(--glow-border)', background: 'var(--glow-surface-muted)' }}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-medium" style={{ color: 'var(--glow-text)' }}>
                  {note.title}
                </p>
                <div className="flex shrink-0 items-center gap-1.5">
                  {note.pinned && (
                    <span
                      className="rounded-full px-2 py-0.5 text-xs"
                      style={{ background: 'var(--glow-accent-soft)', color: 'var(--glow-accent)' }}
                    >
                      Pinned
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setDialogNote(note)}
                    aria-label="Edit note"
                    className="rounded-full p-1.5 transition hover:opacity-70"
                    style={{ color: 'var(--glow-text-muted)' }}
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(note)}
                    aria-label="Delete note"
                    className="rounded-full p-1.5 transition hover:opacity-70"
                    style={{ color: 'var(--glow-text-muted)' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {note.content && (
                <p className="mt-1 text-sm" style={{ color: 'var(--glow-text-muted)' }}>
                  {note.content}
                </p>
              )}
            </div>
          ))
        )}
      </Card>

      <Dialog open={dialogNote !== null} onClose={() => setDialogNote(null)} title={dialogNote === 'new' ? 'Add note' : 'Edit note'}>
        <NoteForm note={dialogNote === 'new' ? null : dialogNote} onSaved={handleSaved} onCancel={() => setDialogNote(null)} />
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this note?"
        description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : undefined}
        pending={del.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
