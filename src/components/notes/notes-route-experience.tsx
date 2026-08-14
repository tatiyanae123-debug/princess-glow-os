'use client';

import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog } from '@/components/ui/dialog';
import { NoteForm } from '@/components/notes/note-form';
import { NoteManager } from '@/components/notes/note-manager';
import type { Note } from '@/lib/types';

function withoutNoteParams(params: URLSearchParams) {
  const next = new URLSearchParams(params.toString());
  next.delete('noteId');
  next.delete('selected');
  return next;
}

export function NotesRouteExperience({ initialNotes }: { initialNotes: Note[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedId = searchParams.get('noteId') ?? searchParams.get('selected');
  const selectedNote = useMemo(
    () => (requestedId ? initialNotes.find((note) => note.id === requestedId) ?? null : null),
    [initialNotes, requestedId],
  );

  function closeRecord() {
    const next = withoutNoteParams(new URLSearchParams(searchParams.toString()));
    router.replace(next.toString() ? `/notes?${next.toString()}` : '/notes', { scroll: false });
  }

  return (
    <>
      <NoteManager initialNotes={initialNotes} />
      <Dialog open={Boolean(requestedId && selectedNote)} onClose={closeRecord} title={selectedNote ? `Note · ${selectedNote.title}` : 'Note'}>
        {selectedNote ? (
          <NoteForm
            note={selectedNote}
            onSaved={() => {
              closeRecord();
              router.refresh();
            }}
            onCancel={closeRecord}
          />
        ) : null}
      </Dialog>
      {requestedId && !selectedNote ? (
        <div role="status" className="fixed bottom-5 left-1/2 z-[170] -translate-x-1/2 rounded-full border border-[#F7D1D8] bg-white px-4 py-2 text-[11px] text-[#7b535c] shadow-lg">
          That note is no longer available.
        </div>
      ) : null}
    </>
  );
}
