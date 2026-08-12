'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  CalendarDays,
  FolderKanban,
  Hash,
  ListTodo,
  NotebookPen,
  Pencil,
  Pin,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { NoteForm } from '@/components/notes/note-form';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { deleteNoteAction } from '@/app/actions/notes';
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
  const [promotedTasks, setPromotedTasks] = useState<Record<string, boolean>>({});
  const del = useServerAction((id: string) => deleteNoteAction(id));
  const promoteTask = useServerAction(createTaskAction);

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
  const datedNotes = notes.filter((note) => extractDates(note).length > 0).length;

  function promoteCandidate(note: Note, candidate: string, candidateIndex: number) {
    const key = `${note.id}:${candidateIndex}`;
    if (promotedTasks[key]) return;
    promoteTask.run(
      {
        title: candidate,
        description: `Promoted from Notes: ${note.title}`,
        status: 'pending',
        priority: 'medium',
      },
      () => setPromotedTasks((current) => ({ ...current, [key]: true })),
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1.2fr_.8fr]">
        <Card className="relative overflow-hidden bg-[linear-gradient(145deg,#f3eadf,#f7f0ea)] p-5">
          <NotebookPen size={52} strokeWidth={0.75} className="absolute right-5 top-3 text-[#8a7764]/15" />
          <p className="glow-eyebrow">Knowledge desk</p>
          <p className="glow-display mt-2 text-[24px] text-[#4b4034]">Thoughts can stay loose without getting lost.</p>
          <p className="mt-2 max-w-xl text-[9px] leading-4 text-[#7d7064]">
            Capture first. Search everything. Use #tags, “Project: …”, dates, and TODO lines to let Glow OS surface relationships and next actions without changing your original note.
          </p>
        </Card>
        <Card className="p-5">
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-[7px] uppercase tracking-[.12em] text-[#927f74]">Notes</p><p className="glow-display mt-1 text-[25px] text-[#4b4034]">{notes.length}</p></div>
            <div><p className="text-[7px] uppercase tracking-[.12em] text-[#927f74]">Pinned</p><p className="glow-display mt-1 text-[25px] text-[#4b4034]">{pinned}</p></div>
            <div><p className="text-[7px] uppercase tracking-[.12em] text-[#927f74]">Actions</p><p className="glow-display mt-1 text-[25px] text-[#4b4034]">{extractedActions}</p></div>
          </div>
          <Button onClick={() => setDialogNote('new')} className="mt-4 flex items-center gap-1.5"><Plus size={12} />New note</Button>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-2xl border border-[#d9cdc3] bg-white/65 px-3 py-2 text-[#73665d]">
            <Search size={13} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search titles, note text, or tags"
              className="min-w-0 flex-1 bg-transparent text-[10px] outline-none placeholder:text-[#a5968c]"
            />
          </label>
          <div className="flex flex-wrap gap-1.5">
            <button type="button" onClick={() => setActiveTag(null)} className={`rounded-full border px-2.5 py-1 text-[7px] uppercase tracking-[.1em] ${activeTag === null ? 'border-[#9e7f72] bg-[#9e7f72] text-white' : 'border-[#d8ccc3] text-[#827267]'}`}>All notes</button>
            {allTags.map(([tag, count]) => (
              <button key={tag} type="button" onClick={() => setActiveTag(tag === activeTag ? null : tag)} className={`rounded-full border px-2.5 py-1 text-[7px] ${activeTag === tag ? 'border-[#9e7f72] bg-[#9e7f72] text-white' : 'border-[#d8ccc3] text-[#827267]'}`}>
                #{tag} · {count}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-4 border-t border-[#e4d9d1] pt-3 text-[8px] text-[#88786d]">
          <span className="flex items-center gap-1"><Hash size={10} />{allTags.length} active tags</span>
          <span className="flex items-center gap-1"><CalendarDays size={10} />{datedNotes} notes with dates</span>
          <span className="flex items-center gap-1"><Sparkles size={10} />Related notes are matched automatically</span>
        </div>
      </Card>

      {filteredNotes.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="glow-display text-[18px] text-[#4b4034]">No notes match this view.</p>
          <p className="mt-1 text-[9px] text-[#897a70]">Clear the search or tag filter, or capture a new note.</p>
          <div className="mt-4 flex justify-center gap-2">
            {(query || activeTag) ? <Button variant="secondary" onClick={() => { setQuery(''); setActiveTag(null); }}>Clear filters</Button> : null}
            <Button onClick={() => setDialogNote('new')}><Plus size={12} />New note</Button>
          </div>
        </Card>
      ) : (
        <div className="columns-1 gap-3 md:columns-2 xl:columns-3">
          {filteredNotes.map((note, index) => {
            const tags = extractTags(note);
            const dates = extractDates(note);
            const projects = extractProjects(note);
            const tasks = extractTaskCandidates(note);
            const related = relatedNotes(note, notes);
            const hasIntelligence = dates.length > 0 || projects.length > 0 || tasks.length > 0 || related.length > 0;

            return (
              <div key={note.id} className={`paper-card tape mb-3 break-inside-avoid p-4 ${index % 3 === 1 ? 'rotate-[.4deg]' : index % 3 === 2 ? 'rotate-[-.35deg]' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">{note.pinned ? <Pin size={10} className="text-[#a36d75]" /> : null}<p className="glow-display text-[15px] text-[#4b4034]">{note.title}</p></div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => setDialogNote(note)} aria-label="Edit note" className="rounded-full p-1.5 text-[#8d7b70] hover:bg-white/50"><Pencil size={10} /></button>
                    <button type="button" onClick={() => setDeleteTarget(note)} aria-label="Delete note" className="rounded-full p-1.5 text-[#8d7b70] hover:bg-white/50"><Trash2 size={10} /></button>
                  </div>
                </div>

                {tags.length > 0 ? <div className="mt-2 flex flex-wrap gap-1">{tags.map((tag) => <button key={tag} type="button" onClick={() => setActiveTag(tag)} className="rounded-full bg-[#eadfd6] px-2 py-0.5 text-[7px] text-[#806f64]">#{tag}</button>)}</div> : null}
                {note.content ? <p className="mt-3 whitespace-pre-wrap text-[8px] leading-4 text-[#74665d]">{note.content}</p> : null}
                {note.pinned ? <p className="mt-4 text-[7px] uppercase tracking-[.13em] text-[#a17878]">Pinned inspiration</p> : null}

                {hasIntelligence ? (
                  <div className="mt-4 space-y-2 border-t border-[#ded1c8] pt-3">
                    <div className="flex items-center gap-1 text-[7px] uppercase tracking-[.12em] text-[#9a7c72]"><Sparkles size={9} />Knowledge signals</div>
                    {tasks.map((task, taskIndex) => {
                      const key = `${note.id}:${taskIndex}`;
                      return (
                        <div key={key} className="flex items-center justify-between gap-2 rounded-xl bg-white/45 px-2.5 py-2">
                          <span className="flex min-w-0 items-center gap-1.5 text-[8px] text-[#6f625a]"><ListTodo size={10} className="shrink-0" /><span className="truncate">{task}</span></span>
                          <button type="button" disabled={Boolean(promotedTasks[key]) || promoteTask.isPending} onClick={() => promoteCandidate(note, task, taskIndex)} className="shrink-0 text-[7px] font-medium text-[#956b72] disabled:opacity-50">
                            {promotedTasks[key] ? 'Added' : 'Make task'}
                          </button>
                        </div>
                      );
                    })}
                    {dates.length > 0 ? <div className="flex flex-wrap items-center gap-1.5 text-[8px] text-[#6f625a]"><CalendarDays size={10} />{dates.map((date) => <span key={date} className="rounded-full bg-white/45 px-2 py-1">{date}</span>)}<Link href="/calendar" className="ml-auto text-[7px] font-medium text-[#956b72]">Open calendar</Link></div> : null}
                    {projects.length > 0 ? <div className="flex flex-wrap items-center gap-1.5 text-[8px] text-[#6f625a]"><FolderKanban size={10} />{projects.map((project) => <span key={project} className="rounded-full bg-white/45 px-2 py-1">{project}</span>)}<Link href="/projects" className="ml-auto text-[7px] font-medium text-[#956b72]">Open projects</Link></div> : null}
                    {related.length > 0 ? (
                      <div>
                        <p className="text-[7px] uppercase tracking-[.1em] text-[#9a897e]">Related notes</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">{related.map((relatedNote) => <button key={relatedNote.id} type="button" onClick={() => setQuery(relatedNote.title)} className="rounded-full border border-[#d8ccc3] px-2 py-1 text-[7px] text-[#77685f]">{relatedNote.title}</button>)}</div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={dialogNote !== null} onClose={() => setDialogNote(null)} title={dialogNote === 'new' ? 'Add note' : 'Edit note'}>
        <NoteForm note={dialogNote === 'new' ? null : dialogNote} onSaved={handleSaved} onCancel={() => setDialogNote(null)} />
      </Dialog>
      <ConfirmDialog open={deleteTarget !== null} title="Delete this note?" description={deleteTarget ? `"${deleteTarget.title}" will be removed.` : undefined} pending={del.isPending} onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} />
    </div>
  );
}
