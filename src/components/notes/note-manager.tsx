'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  CalendarDays,
  FolderKanban,
  ListTodo,
  NotebookPen,
  Pencil,
  Pin,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NoteForm } from '@/components/notes/note-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createNoteAction, deleteNoteAction } from '@/app/actions/notes';
import { createTaskAction } from '@/app/actions/tasks';
import type { Note } from '@/lib/types';

const STOP_WORDS = new Set([
  'about', 'after', 'again', 'also', 'because', 'before', 'being', 'could', 'from', 'have', 'into', 'just',
  'more', 'note', 'that', 'their', 'there', 'these', 'they', 'this', 'with', 'would', 'your',
]);

function noteText(note: Note) {
  return `${note.title} ${note.content ?? ''}`.trim();
}

function extractTags(note: Note) {
  const matches = noteText(note).match(/(^|\s)#([a-z0-9][\w-]*)/gi) ?? [];
  return Array.from(new Set(matches.map((match) => match.trim().slice(1).toLowerCase())));
}

function extractDates(note: Note) {
  const text = noteText(note);
  const matches = [
    ...(text.match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? []),
    ...(text.match(/\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\s+\d{1,2}(?:,\s*\d{4})?\b/gi) ?? []),
  ];
  return Array.from(new Set(matches)).slice(0, 3);
}

function extractProjects(note: Note) {
  const text = noteText(note);
  const projects = Array.from(text.matchAll(/\bproject\s*:\s*([^\n,.;]+)/gi)).map((match) => match[1].trim());
  return Array.from(new Set(projects)).slice(0, 3);
}

function extractTaskCandidates(note: Note) {
  const lines = (note.content ?? '').split('\n').map((line) => line.trim()).filter(Boolean);
  const candidates = lines
    .filter((line) => /^(?:[-*]\s*\[\s\]|todo\s*:|next action\s*:|action\s*:)/i.test(line))
    .map((line) => line.replace(/^(?:[-*]\s*\[\s\]|todo\s*:|next action\s*:|action\s*:)/i, '').trim())
    .filter(Boolean);
  return Array.from(new Set(candidates)).slice(0, 3);
}

function keywords(note: Note) {
  return new Set(
    noteText(note)
      .toLowerCase()
      .replace(/[^a-z0-9#\s-]/g, ' ')
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !STOP_WORDS.has(word) && !word.startsWith('#')),
  );
}

function relatedNotes(note: Note, notes: Note[]) {
  const sourceTags = new Set(extractTags(note));
  const sourceWords = keywords(note);

  return notes
    .filter((candidate) => candidate.id !== note.id)
    .map((candidate) => {
      const candidateTags = extractTags(candidate);
      const candidateWords = keywords(candidate);
      const sharedTags = candidateTags.filter((tag) => sourceTags.has(tag)).length;
      let sharedWords = 0;
      candidateWords.forEach((word) => {
        if (sourceWords.has(word)) sharedWords += 1;
      });
      return { note: candidate, score: sharedTags * 4 + Math.min(sharedWords, 4) };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((entry) => entry.note);
}

export function NoteManager({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [dialogNote, setDialogNote] = useState<Note | 'new' | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [thought, setThought] = useState('');
  const [promotedTasks, setPromotedTasks] = useState<Record<string, boolean>>({});
  const del = useServerAction((id: string) => deleteNoteAction(id));
  const promoteTask = useServerAction(createTaskAction);
  const quickCapture = useServerAction(createNoteAction);

  const handleSaved = (note: Note) => {
    setNotes((current) => {
      const exists = current.some((n) => n.id === note.id);
      return exists ? current.map((n) => (n.id === note.id ? note : n)) : [note, ...current];
    });
    setDialogNote(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    del.run(deleteTarget.id, () => {
      setNotes((current) => current.filter((n) => n.id !== deleteTarget.id));
      setDeleteTarget(null);
    });
  };

  function captureThought() {
    const text = thought.trim();
    if (!text) return;
    const title = text.split('\n')[0].slice(0, 80) || `Thought · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    quickCapture.run({ title, content: text, pinned: false }, (saved) => {
      if (saved) setNotes((current) => [saved, ...current]);
      setThought('');
    });
  }

  const allTags = useMemo(() => {
    const counts = new Map<string, number>();
    notes.forEach((note) => extractTags(note).forEach((tag) => counts.set(tag, (counts.get(tag) ?? 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12);
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesTag = !activeTag || extractTags(note).includes(activeTag);
      const matchesQuery = !normalizedQuery || noteText(note).toLowerCase().includes(normalizedQuery) || extractTags(note).some((tag) => tag.includes(normalizedQuery));
      return matchesTag && matchesQuery;
    });
  }, [activeTag, notes, query]);

  const pinned = notes.filter((note) => note.pinned).length;
  const extractedActions = notes.reduce((count, note) => count + extractTaskCandidates(note).length, 0);
  const featured = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.updatedAt.getTime() - a.updatedAt.getTime())[0] ?? null;
  const libraryNotes = filteredNotes.filter((note) => note.id !== featured?.id);

  function promoteCandidate(note: Note, candidate: string, candidateIndex: number) {
    const key = `${note.id}:${candidateIndex}`;
    if (promotedTasks[key]) return;
    promoteTask.run(
      { title: candidate, description: `Promoted from Notes: ${note.title}`, status: 'pending', priority: 'medium' },
      () => setPromotedTasks((current) => ({ ...current, [key]: true })),
    );
  }

  function knowledgeSignals(note: Note) {
    const tags = extractTags(note);
    const dates = extractDates(note);
    const projects = extractProjects(note);
    const tasks = extractTaskCandidates(note);
    const related = relatedNotes(note, notes);
    return { tags, dates, projects, tasks, related, has: dates.length > 0 || projects.length > 0 || tasks.length > 0 || related.length > 0 };
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-5 lg:grid-cols-[1fr_1.05fr]">
        <div className="flex flex-col justify-center">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#C9727E]">Notes</p>
          <h1 className="glow-display mt-1 text-[38px] leading-[1.05] text-[#2B2420] sm:text-[44px]">A place for everything<br />worth remembering.</h1>
          <p className="mt-3 max-w-md text-[13px] text-[#8A8078]">Capture first. Search everything. Glow finds the tasks, dates, and connections hiding inside your own words.</p>
        </div>
        <EditableRoomImage slot="notes:hero" label="Notes hero" className="min-h-[170px] overflow-hidden rounded-[20px] border border-[#F1E7E3] sm:min-h-[210px]" />
      </div>

      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
        <div className="flex items-center gap-1.5 text-[12px] font-medium text-[#2B2420]"><NotebookPen size={14} className="text-[#C9727E]" />Today&apos;s Thought</div>
        <textarea
          value={thought}
          onChange={(event) => setThought(event.target.value)}
          rows={2}
          placeholder="What's on your mind right now?"
          className="mt-2 w-full resize-none rounded-lg border border-[#F1E7E3] px-3 py-2.5 text-[12.5px] outline-none focus:border-[#E6D9D2]"
        />
        <div className="mt-2 flex justify-end">
          <button type="button" onClick={captureThought} disabled={!thought.trim() || quickCapture.isPending} className="rounded-full bg-[#C9727E] px-4 py-1.5 text-[11.5px] font-medium text-white disabled:opacity-40">Capture</button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[16px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10px] uppercase tracking-[.1em] text-[#9A9088]">Notes</p><p className="glow-display mt-1 text-[24px] text-[#2B2420]">{notes.length}</p></div>
        <div className="rounded-[16px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10px] uppercase tracking-[.1em] text-[#9A9088]">Pinned</p><p className="glow-display mt-1 text-[24px] text-[#2B2420]">{pinned}</p></div>
        <div className="rounded-[16px] border border-[#F1E7E3] bg-white p-4"><p className="text-[10px] uppercase tracking-[.1em] text-[#9A9088]">Actions found</p><p className="glow-display mt-1 text-[24px] text-[#2B2420]">{extractedActions}</p></div>
      </div>

      {featured ? (
        <div className="overflow-hidden rounded-[20px] border border-[#F1E7E3] bg-white">
          <div className="flex items-center justify-between border-b border-[#F1E7E3] px-5 py-3.5">
            <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#9A9088]">{featured.pinned ? 'Pinned Note' : 'Recent Note'}</p>
            <button type="button" onClick={() => setDialogNote(featured)} className="text-[11px] font-medium text-[#C9727E]">Open →</button>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2">{featured.pinned ? <Pin size={13} className="text-[#C9727E]" /> : null}<h2 className="glow-display text-[26px] text-[#2B2420]">{featured.title}</h2></div>
            {featured.content ? <p className="mt-3 max-w-2xl whitespace-pre-wrap text-[13px] leading-6 text-[#4A4440]">{featured.content.slice(0, 320)}{featured.content.length > 320 ? '…' : ''}</p> : null}
            <p className="mt-3 text-[10.5px] text-[#9A9088]">Updated {featured.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
          </div>
        </div>
      ) : null}

      <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-[#F1E7E3] bg-[#FDFAF8] px-3.5 py-2">
            <Search size={13} className="text-[#B5ACA5]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search titles, note text, or tags" className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#B5ACA5]" />
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setActiveTag(null)} className={`rounded-full border px-2.5 py-1 text-[10.5px] font-medium ${activeTag === null ? 'border-[#C9727E] bg-[#FBE4E8] text-[#B15A68]' : 'border-[#F1E7E3] text-[#8A8078]'}`}>All notes</button>
            {allTags.map(([tag, count]) => (
              <button key={tag} type="button" onClick={() => setActiveTag(tag === activeTag ? null : tag)} className={`rounded-full border px-2.5 py-1 text-[10.5px] ${activeTag === tag ? 'border-[#C9727E] bg-[#FBE4E8] text-[#B15A68]' : 'border-[#F1E7E3] text-[#8A8078]'}`}>#{tag} · {count}</button>
            ))}
          </div>
          <button type="button" onClick={() => setDialogNote('new')} className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#C9727E] px-4 py-2 text-[12px] font-medium text-white"><Plus size={13} />New note</button>
        </div>
      </div>

      {libraryNotes.length === 0 ? (
        <div className="rounded-[18px] border border-dashed border-[#F1E7E3] bg-white p-8 text-center">
          <p className="glow-display text-[17px] text-[#2B2420]">No notes match this view.</p>
          <p className="mt-1 text-[12px] text-[#9A9088]">Clear the search or tag filter, or capture a new note.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {libraryNotes.map((note) => {
            const signals = knowledgeSignals(note);
            return (
              <div key={note.id} className="flex flex-col rounded-[18px] border border-[#F1E7E3] bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-1.5">{note.pinned ? <Pin size={11} className="shrink-0 text-[#C9727E]" /> : null}<p className="glow-display truncate text-[15px] text-[#2B2420]">{note.title}</p></div>
                  <div className="flex shrink-0 gap-0.5">
                    <button type="button" onClick={() => setDialogNote(note)} aria-label="Edit note" className="rounded-full p-1.5 text-[#9A9088] hover:bg-[#FDFAF8]"><Pencil size={11} /></button>
                    <button type="button" onClick={() => setDeleteTarget(note)} aria-label="Delete note" className="rounded-full p-1.5 text-[#9A9088] hover:bg-[#FDFAF8]"><Trash2 size={11} /></button>
                  </div>
                </div>
                {signals.tags.length > 0 ? <div className="mt-2 flex flex-wrap gap-1">{signals.tags.map((tag) => <button key={tag} type="button" onClick={() => setActiveTag(tag)} className="rounded-full bg-[#F4ECE8] px-2 py-0.5 text-[9.5px] text-[#8A8078]">#{tag}</button>)}</div> : null}
                {note.content ? <p className="mt-2.5 line-clamp-4 whitespace-pre-wrap text-[11.5px] leading-5 text-[#6B6560]">{note.content}</p> : null}

                {signals.has ? (
                  <div className="mt-3 space-y-1.5 border-t border-[#F4ECE8] pt-3">
                    {signals.tasks.map((task, taskIndex) => {
                      const key = `${note.id}:${taskIndex}`;
                      return (
                        <div key={key} className="flex items-center justify-between gap-2 rounded-lg bg-[#FDFAF8] px-2.5 py-1.5">
                          <span className="flex min-w-0 items-center gap-1.5 text-[10.5px] text-[#4A4440]"><ListTodo size={10} className="shrink-0" /><span className="truncate">{task}</span></span>
                          <button type="button" disabled={Boolean(promotedTasks[key]) || promoteTask.isPending} onClick={() => promoteCandidate(note, task, taskIndex)} className="shrink-0 text-[9.5px] font-medium text-[#C9727E] disabled:opacity-50">{promotedTasks[key] ? 'Added' : 'Make task'}</button>
                        </div>
                      );
                    })}
                    {signals.dates.length > 0 ? <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#8A8078]"><CalendarDays size={10} />{signals.dates.map((date) => <span key={date} className="rounded-full bg-[#FDFAF8] px-2 py-0.5">{date}</span>)}<Link href="/calendar" className="ml-auto text-[10px] font-medium text-[#C9727E]">Calendar</Link></div> : null}
                    {signals.projects.length > 0 ? <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#8A8078]"><FolderKanban size={10} />{signals.projects.map((project) => <span key={project} className="rounded-full bg-[#FDFAF8] px-2 py-0.5">{project}</span>)}<Link href="/projects" className="ml-auto text-[10px] font-medium text-[#C9727E]">Projects</Link></div> : null}
                    {signals.related.length > 0 ? (
                      <div>
                        <p className="flex items-center gap-1 text-[9.5px] uppercase tracking-[.08em] text-[#9A9088]"><Sparkles size={9} />Related</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">{signals.related.map((relatedNote) => <button key={relatedNote.id} type="button" onClick={() => setDialogNote(relatedNote)} className="rounded-full border border-[#F1E7E3] px-2 py-0.5 text-[9.5px] text-[#8A8078]">{relatedNote.title}</button>)}</div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogNote !== null} onClose={() => setDialogNote(null)} title={dialogNote === 'new' ? 'New note' : 'Edit note'}>
        <NoteForm note={dialogNote === 'new' ? null : dialogNote} onSaved={handleSaved} onCancel={() => setDialogNote(null)} />
      </Dialog>
      <ConfirmDialog open={deleteTarget !== null} title="Delete this note?" description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
