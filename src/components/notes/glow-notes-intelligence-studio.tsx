'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import {
  AudioLines,
  Bookmark,
  Check,
  FileAudio,
  FileText,
  Highlighter,
  Import,
  Lightbulb,
  Mic,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  Square,
  Upload,
  WandSparkles,
  X,
} from 'lucide-react';
import type { Note } from '@/lib/types';
import { Dialog } from '@/components/ui/dialog';
import { NoteForm } from '@/components/notes/note-form';
import { createNoteAction } from '@/app/actions/notes';
import { createTaskAction } from '@/app/actions/tasks';
import { createCalendarEventAction } from '@/app/actions/calendar-events';
import {
  appendRecordingChunk,
  buildRecordingBlob,
  buildSmartNoteContent,
  cleanTranscript,
  extractActions,
  formatDuration,
  inferCaptureType,
  saveImportedMedia,
  saveRecordingMeta,
  type DetectedAction,
  type NoteCaptureType,
  type RecordingMeta,
} from '@/lib/notes/listener-engine';

type SpeechAlternative = { transcript: string };
type SpeechResult = { 0: SpeechAlternative; isFinal: boolean; length: number };
type SpeechResultList = { [index: number]: SpeechResult; length: number };
type SpeechEvent = { resultIndex: number; results: SpeechResultList };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechCtor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  }
}

const CAPTURE_TYPES: NoteCaptureType[] = [
  'Meeting',
  'Interview',
  'Lecture',
  'Brain Dump',
  'Planning Session',
  'Appointment',
  'Conversation',
  'Voice Journal',
  'General',
];

const SMART_COLLECTIONS = ['Needs Action', 'Unreviewed', 'This Week', 'Important', 'Decisions', 'Ideas', 'People', 'Audio Notes'];

function noteExcerpt(note: Note) {
  const text = (note.content ?? '').replace(/^#+\s.*$/gm, '').replace(/\s+/g, ' ').trim();
  return text ? `${text.slice(0, 165)}${text.length > 165 ? '…' : ''}` : 'No note text yet.';
}

function noteKind(note: Note) {
  const tags = note.tags ?? [];
  const listener = tags.find((tag) => tag.startsWith('listener:'));
  return listener ? listener.replace('listener:', '') : tags[0] ?? 'Note';
}

function relativeDate(date: Date) {
  const now = new Date();
  const diff = Math.floor((+now - +date) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function keywordScore(note: Note, query: string) {
  const words = query.toLowerCase().split(/\W+/).filter((word) => word.length > 2);
  if (!words.length) return 0;
  const haystack = `${note.title} ${note.content ?? ''} ${(note.tags ?? []).join(' ')}`.toLowerCase();
  return words.reduce((score, word) => score + (haystack.includes(word) ? 1 : 0), 0);
}

function commonTheme(notes: Note[]) {
  const stop = new Set(['this', 'that', 'with', 'have', 'from', 'your', 'what', 'about', 'will', 'into', 'then', 'they', 'them', 'when', 'where', 'there', 'note', 'notes', 'glow']);
  const counts = new Map<string, number>();
  notes.slice(0, 30).forEach((note) => {
    const unique = new Set(`${note.title} ${note.content ?? ''}`.toLowerCase().match(/[a-z][a-z'-]{3,}/g) ?? []);
    unique.forEach((word) => {
      if (!stop.has(word)) counts.set(word, (counts.get(word) ?? 0) + 1);
    });
  });
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0] ?? null;
}

export function GlowNotesIntelligenceStudio({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [editing, setEditing] = useState<Note | 'new' | null>(null);
  const [selected, setSelected] = useState<Note | null>(null);
  const [captureType, setCaptureType] = useState<NoteCaptureType>('General');
  const [typePicker, setTypePicker] = useState(false);
  const [listenerOpen, setListenerOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [cleanMode, setCleanMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<Array<{ at: number; label: string }>>([]);
  const [actions, setActions] = useState<DetectedAction[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [recordingMeta, setRecordingMeta] = useState<RecordingMeta | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [quickCapture, setQuickCapture] = useState('');
  const [quickOpen, setQuickOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [selectedActionIds, setSelectedActionIds] = useState<Set<string>>(new Set());
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});
  const [noteQuestion, setNoteQuestion] = useState('');
  const [noteAnswer, setNoteAnswer] = useState('');
  const [pending, startTransition] = useTransition();

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const shouldRestartSpeechRef = useRef(false);
  const chunkIndexRef = useRef(0);
  const transcriptRef = useRef('');
  const currentSessionRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    if (!startedAt || !recording || paused) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [startedAt, recording, paused]);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 4200);
    return () => window.clearTimeout(id);
  }, [notice]);

  useEffect(() => () => {
    if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recognitionRef.current?.stop();
  }, [playbackUrl]);

  const sorted = useMemo(() => [...notes].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()), [notes]);
  const recent = sorted.slice(0, 8);
  const filtered = useMemo(() => {
    if (!search.trim()) return sorted;
    return sorted
      .map((note) => ({ note, score: keywordScore(note, search) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((row) => row.note);
  }, [sorted, search]);
  const openLoops = useMemo(() => notes.reduce((sum, note) => sum + extractActions(note.content ?? '').filter((item) => item.kind === 'task' || item.kind === 'reminder').length, 0), [notes]);
  const listenerNotes = useMemo(() => notes.filter((note) => (note.tags ?? []).some((tag) => tag.startsWith('listener:'))), [notes]);
  const theme = useMemo(() => commonTheme(notes), [notes]);
  const displayedTranscript = cleanMode ? cleanTranscript(`${transcript} ${interim}`) : `${transcript}${interim ? ` ${interim}` : ''}`.trim();

  function updateLocal(note: Note) {
    setNotes((current) => current.some((item) => item.id === note.id) ? current.map((item) => item.id === note.id ? note : item) : [note, ...current]);
  }

  function resetListener() {
    setTranscript('');
    setInterim('');
    setBookmarks([]);
    setActions([]);
    setSelectedActionIds(new Set());
    setRecordingMeta(null);
    setElapsed(0);
    setStartedAt(null);
    setPaused(false);
    chunkIndexRef.current = 0;
    transcriptRef.current = '';
    currentSessionRef.current = null;
    if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    setPlaybackUrl(null);
  }

  function startSpeechRecognition() {
    const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!Ctor) {
      setNotice('Audio is recording. Live transcription is not available in this browser, so Glow will not invent a transcript.');
      return;
    }
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result?.[0]?.transcript ?? '';
        if (result?.isFinal) finalText += `${text.trim()} `;
        else interimText += text;
      }
      if (finalText.trim()) {
        setTranscript((current) => `${current}${current ? ' ' : ''}${finalText.trim()}`);
        setInterim('');
      } else setInterim(interimText.trim());
    };
    recognition.onerror = (event) => {
      if (event.error && !['aborted', 'no-speech'].includes(event.error)) setNotice(`Live transcription paused: ${event.error}. Audio recording can continue.`);
    };
    recognition.onend = () => {
      if (shouldRestartSpeechRef.current) {
        try { recognition.start(); } catch { /* browser may already be restarting */ }
      }
    };
    recognitionRef.current = recognition;
    shouldRestartSpeechRef.current = true;
    try { recognition.start(); } catch { setNotice('Audio recording started, but live transcription could not start on this device.'); }
  }

  async function startListening(type = captureType) {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setNotice('This browser does not expose microphone recording to Glow. You can still write or import a file.');
      return;
    }
    try {
      resetListener();
      setCaptureType(type);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find((mime) => MediaRecorder.isTypeSupported(mime));
      const recorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream);
      const id = crypto.randomUUID();
      const meta: RecordingMeta = {
        id,
        title: `${type} · ${new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}`,
        type,
        mimeType: recorder.mimeType || preferred || 'audio/webm',
        startedAt: Date.now(),
        chunkCount: 0,
      };
      currentSessionRef.current = id;
      chunkIndexRef.current = 0;
      setRecordingMeta(meta);
      await saveRecordingMeta(meta);
      recorder.ondataavailable = async (event) => {
        if (!event.data.size || !currentSessionRef.current) return;
        const index = chunkIndexRef.current;
        chunkIndexRef.current += 1;
        try {
          await appendRecordingChunk(currentSessionRef.current, index, event.data);
        } catch {
          setNotice('Glow could not save one local audio chunk. Check device storage before continuing a very long session.');
        }
      };
      recorder.onerror = () => setNotice('The browser reported a recording error. Your saved transcript text is still safe.');
      recorderRef.current = recorder;
      streamRef.current = stream;
      recorder.start(5000);
      setStartedAt(Date.now());
      setRecording(true);
      setPaused(false);
      setListenerOpen(true);
      startSpeechRecognition();
    } catch {
      setNotice('Microphone access was not granted. You can still Write, Quick Capture, or Import.');
    }
  }

  function pauseListening() {
    const recorder = recorderRef.current;
    if (!recorder) return;
    if (recorder.state === 'recording') {
      recorder.pause();
      recognitionRef.current?.stop();
      shouldRestartSpeechRef.current = false;
      setPaused(true);
    } else if (recorder.state === 'paused') {
      recorder.resume();
      shouldRestartSpeechRef.current = true;
      startSpeechRecognition();
      setPaused(false);
      setStartedAt(Date.now() - elapsed * 1000);
    }
  }

  async function finishListening() {
    const recorder = recorderRef.current;
    const meta = recordingMeta;
    if (!recorder || !meta) return;
    shouldRestartSpeechRef.current = false;
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    const finalElapsed = elapsed;
    await new Promise<void>((resolve) => {
      const finish = () => resolve();
      recorder.addEventListener('stop', finish, { once: true });
      if (recorder.state !== 'inactive') recorder.stop();
      else resolve();
    });
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setRecording(false);
    setPaused(false);
    const finalMeta = { ...meta, endedAt: Date.now(), chunkCount: chunkIndexRef.current };
    setRecordingMeta(finalMeta);
    try {
      await saveRecordingMeta(finalMeta);
      const blob = await buildRecordingBlob(meta.id, meta.mimeType);
      const url = URL.createObjectURL(blob);
      setPlaybackUrl(url);
    } catch {
      setNotice('The transcript can still be saved, but Glow could not rebuild the local audio preview.');
    }
    const detected = extractActions(transcriptRef.current);
    setActions(detected);
    setSelectedActionIds(new Set(detected.map((item) => item.id)));
    setElapsed(finalElapsed);
    setListenerOpen(false);
    setReviewOpen(true);
  }

  function bookmark(label = 'Important') {
    setBookmarks((current) => [...current, { at: elapsed, label }]);
    setNotice(`${label} bookmark added at ${formatDuration(elapsed)}.`);
  }

  async function saveSmartNote() {
    const meta = recordingMeta;
    if (!meta) return;
    const detected = actions.length ? actions : extractActions(transcript);
    const content = buildSmartNoteContent({ transcript, type: captureType, durationSeconds: elapsed, actions: detected, bookmarks });
    startTransition(async () => {
      const result = await createNoteAction({
        title: meta.title,
        content,
        tags: [`listener:${captureType}`, 'smart-note', 'audio-capture'],
        pinned: false,
      });
      if (result.data) {
        updateLocal(result.data);
        setSelected(result.data);
        setReviewOpen(false);
        setNotice('Smart Note saved. Local audio remains on this device; the transcript is saved to Glow.');
      } else setNotice('Glow could not save this Smart Note. Your local recording has not been deleted.');
    });
  }

  async function approveAction(item: DetectedAction) {
    setActionStatus((current) => ({ ...current, [item.id]: 'Saving…' }));
    try {
      if (item.kind === 'task') {
        const result = await createTaskAction({ title: item.text.slice(0, 255), status: 'pending', priority: 'medium', dueDate: item.date });
        setActionStatus((current) => ({ ...current, [item.id]: result.data ? 'Added to Tasks' : 'Could not add' }));
      } else if (item.kind === 'calendar' && item.date) {
        const startAt = item.date;
        const endAt = new Date(+startAt + 60 * 60 * 1000);
        const result = await createCalendarEventAction({ title: item.text.slice(0, 255), startAt, endAt, allDay: false, color: '#e6d8dc' });
        setActionStatus((current) => ({ ...current, [item.id]: result.data ? 'Added to Calendar' : 'Could not add' }));
      } else if (item.kind === 'reminder') {
        setActionStatus((current) => ({ ...current, [item.id]: 'Review in Reminders' }));
        setNotice('Glow detected a reminder, but this Notes build does not silently convert it into a Task. Open Reminders to place it correctly.');
      } else {
        setActionStatus((current) => ({ ...current, [item.id]: 'Kept in Smart Note' }));
      }
    } catch {
      setActionStatus((current) => ({ ...current, [item.id]: 'Could not add' }));
    }
  }

  function approveSelected() {
    const chosen = actions.filter((item) => selectedActionIds.has(item.id));
    chosen.forEach((item) => void approveAction(item));
  }

  function saveQuickCapture() {
    const text = quickCapture.trim();
    if (!text) return;
    const type = inferCaptureType(text, 'Brain Dump');
    startTransition(async () => {
      const result = await createNoteAction({ title: `Quick Capture · ${new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`, content: text, tags: [`listener:${type}`, 'quick-capture'], pinned: false });
      if (result.data) {
        updateLocal(result.data);
        setQuickCapture('');
        setQuickOpen(false);
        setNotice('Quick capture saved.');
      } else setNotice('Quick capture could not be saved.');
    });
  }

  async function importFile(file: File) {
    const id = crypto.randomUUID();
    const type = inferCaptureType(file.name, captureType);
    if (file.type.startsWith('text/') || /\.(txt|md)$/i.test(file.name)) {
      const text = await file.text();
      const detected = extractActions(text);
      setTranscript(text);
      setActions(detected);
      setSelectedActionIds(new Set(detected.map((item) => item.id)));
      setCaptureType(type);
      setRecordingMeta({ id, title: file.name.replace(/\.[^.]+$/, ''), type, mimeType: file.type || 'text/plain', startedAt: Date.now(), endedAt: Date.now(), chunkCount: 0 });
      setElapsed(0);
      setImportOpen(false);
      setReviewOpen(true);
      return;
    }
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) {
      setNotice('Choose an audio, video, TXT, or Markdown file.');
      return;
    }
    try {
      const meta = await saveImportedMedia(id, file, type);
      setRecordingMeta(meta);
      setCaptureType(type);
      setTranscript('');
      setActions([]);
      const url = URL.createObjectURL(file);
      if (playbackUrl) URL.revokeObjectURL(playbackUrl);
      setPlaybackUrl(url);
      setElapsed(0);
      setImportOpen(false);
      setReviewOpen(true);
      setNotice('Media imported locally with no minute-based rejection. Server transcription is not configured yet, so Glow is not inventing transcript text.');
    } catch {
      setNotice('The device could not store that file locally. Very large files are limited by available browser/device storage, not by a Glow minute cap.');
    }
  }

  function askSelectedNote() {
    if (!selected || !noteQuestion.trim()) return;
    const words = noteQuestion.toLowerCase().split(/\W+/).filter((word) => word.length > 2);
    const sentences = (selected.content ?? '').split(/(?<=[.!?])\s+|\n+/).filter(Boolean);
    const matches = sentences
      .map((sentence) => ({ sentence, score: words.reduce((sum, word) => sum + (sentence.toLowerCase().includes(word) ? 1 : 0), 0) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map((row) => row.sentence);
    setNoteAnswer(matches.length ? matches.join(' ') : 'I could not find that in this saved note. This build uses grounded note search here rather than inventing an answer.');
  }

  const captureCards = [
    { name: 'Listen', detail: 'Live recording + transcription when supported', icon: Mic, action: () => setTypePicker(true) },
    { name: 'Write', detail: 'A normal intelligent note', icon: FileText, action: () => setEditing('new') },
    { name: 'Import', detail: 'Audio, video, Voice Memo, TXT or Markdown', icon: Upload, action: () => setImportOpen(true) },
    { name: 'Quick Capture', detail: 'Speak or type one thought', icon: Sparkles, action: () => setQuickOpen(true) },
  ];

  return <div className="mx-auto max-w-[1380px] space-y-6 pb-24">
    <section className="relative overflow-hidden rounded-[38px] border border-[#e8e1d7] bg-[radial-gradient(circle_at_83%_3%,rgba(220,232,213,.82),transparent_27%),radial-gradient(circle_at_58%_0%,rgba(249,225,218,.72),transparent_31%),linear-gradient(135deg,#fffdf8,#f7f3ed)] p-6 shadow-[0_30px_100px_rgba(76,63,52,.07)] sm:p-9">
      <div className="absolute -right-8 top-3 h-40 w-40 rounded-full border border-white/60 bg-white/20 blur-sm" />
      <p className="relative text-[10px] font-semibold uppercase tracking-[.18em] text-[#9a8e80]">Glow Notes + Listener</p>
      <div className="relative mt-3 grid gap-8 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div>
          <h1 className="font-serif text-5xl tracking-[-.045em] text-[#312d29] sm:text-6xl">Think out loud.</h1>
          <p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#6d645d]">Capture anything. Understand everything. Turn it into action. Notes is now Glow’s listening, thinking, and connection space instead of a static journal.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <button type="button" onClick={() => setTypePicker(true)} className="rounded-full bg-[#3d3934] px-5 py-3 text-sm text-white"><Mic size={14} className="mr-2 inline" />Start Listening</button>
            <button type="button" onClick={() => setEditing('new')} className="rounded-full border border-[#ddd4ca] bg-white/70 px-5 py-3 text-sm">Write</button>
            <button type="button" onClick={() => setImportOpen(true)} className="rounded-full border border-[#ddd4ca] bg-white/70 px-5 py-3 text-sm">Import</button>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-white/65 p-5 backdrop-blur-xl">
          <p className="text-[10px] uppercase tracking-[.14em] text-[#998e84]">Long-session design</p>
          <p className="mt-2 font-serif text-2xl text-[#3e3934]">No artificial minute cap.</p>
          <p className="mt-3 text-xs leading-5 text-[#7f756d]">Glow records in browser chunks instead of stopping at a preset duration. Very long sessions and files are still constrained by microphone permissions, browser stability, device storage, battery, available storage quota, and the transcription service once server transcription is added.</p>
        </div>
      </div>
    </section>

    <section>
      <div className="mb-3 flex items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.15em] text-[#9b9188]">Capture</p><h2 className="mt-1 font-serif text-3xl text-[#3e3934]">What do you want Glow to capture?</h2></div></div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{captureCards.map(({ name, detail, icon: Icon, action }) => <button key={name} type="button" onClick={action} className="group rounded-[26px] border border-[#e8e2d9] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6f0ea] text-[#9e6972]"><Icon size={17} /></span><p className="mt-5 font-serif text-2xl text-[#3f3934]">{name}</p><p className="mt-2 text-xs leading-5 text-[#8b8178]">{detail}</p></button>)}</div>
    </section>

    <section className="grid gap-4 lg:grid-cols-[1.15fr_.85fr]">
      <div className="rounded-[30px] border border-[#e8e2d9] bg-white p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.14em] text-[#9a9086]">Right now</p><h2 className="mt-1 font-serif text-3xl">Needs your attention</h2></div><div className="rounded-full bg-[#f7f3ee] px-3 py-2 text-[10px] text-[#7f756d]">{openLoops} open loop{openLoops === 1 ? '' : 's'} detected in saved text</div></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-[20px] bg-[#faf7f3] p-4"><p className="text-[10px] uppercase text-[#9b9188]">Audio notes</p><p className="mt-2 font-serif text-3xl">{listenerNotes.length}</p><p className="mt-2 text-[10px] text-[#8e847b]">Smart Notes captured through Listener.</p></div><div className="rounded-[20px] bg-[#f7f5f9] p-4"><p className="text-[10px] uppercase text-[#93889e]">Open loops</p><p className="mt-2 font-serif text-3xl">{openLoops}</p><p className="mt-2 text-[10px] text-[#8e847b]">Possible “need to / should / remind me” language.</p></div><div className="rounded-[20px] bg-[#f1f5ed] p-4"><p className="text-[10px] uppercase text-[#7e8b74]">Recent</p><p className="mt-2 font-serif text-3xl">{recent.length}</p><p className="mt-2 text-[10px] text-[#8e847b]">Notes ready to revisit.</p></div></div>
      </div>
      <div className="rounded-[30px] border border-[#e8e2d9] bg-white p-5 sm:p-6"><div className="flex items-center gap-2"><WandSparkles size={16} className="text-[#9b6b74]"/><p className="text-[10px] uppercase tracking-[.14em] text-[#9a9086]">Glow noticed</p></div><p className="mt-4 text-sm leading-6 text-[#675f58]">{theme && theme[1] >= 2 ? `“${theme[0]}” appears across ${theme[1]} recent notes. That may be a recurring topic worth connecting to a project, task, or decision.` : 'Your recent notes do not yet show a strong repeated theme. Glow will surface one when the saved text supports it.'}</p></div>
    </section>

    <section className="rounded-[30px] border border-[#e8e2d9] bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] uppercase tracking-[.14em] text-[#9a9086]">Ask / Search all notes</p><h2 className="mt-1 font-serif text-3xl">Find the thought again.</h2></div><div className="flex min-w-0 gap-2 sm:w-[420px]"><div className="relative min-w-0 flex-1"><Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3988e]"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Victoria, salary, Glow Calendar…" className="w-full rounded-full border border-[#e2dcd4] bg-[#fbf9f5] py-3 pl-10 pr-4 text-xs outline-none"/></div></div></div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{(search.trim() ? filtered : recent).slice(0, 9).map((note) => <button key={note.id} type="button" onClick={() => setSelected(note)} className="rounded-[22px] border border-[#ebe5dc] bg-[#fffdf9] p-5 text-left"><div className="flex items-start justify-between gap-2"><span className="rounded-full bg-[#f4efea] px-2.5 py-1 text-[9px] text-[#897f76]">{noteKind(note)}</span><span className="text-[9px] text-[#aaa096]">{relativeDate(note.updatedAt)}</span></div><p className="mt-4 font-serif text-2xl leading-tight text-[#403a35]">{note.title}</p><p className="mt-3 line-clamp-4 text-xs leading-5 text-[#827970]">{noteExcerpt(note)}</p></button>)}{search.trim() && !filtered.length ? <p className="text-xs text-[#91877e]">No saved note contains those terms. Glow will not invent a match.</p> : null}</div>
    </section>

    <section><p className="text-[10px] uppercase tracking-[.14em] text-[#9a9086]">Smart collections</p><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{SMART_COLLECTIONS.map((collection) => <button key={collection} type="button" onClick={() => setSearch(collection === 'Audio Notes' ? 'listener' : collection.replace('Needs Action', 'need should remind').replace('Decisions', 'decided agreed').replace('Ideas', 'idea'))} className="shrink-0 rounded-full border border-[#e5ded5] bg-white px-4 py-2.5 text-xs text-[#766d65]">{collection}</button>)}</div></section>

    <Dialog open={typePicker} onClose={() => setTypePicker(false)} title="What are you capturing?"><div className="grid gap-2 sm:grid-cols-2">{CAPTURE_TYPES.map((type) => <button key={type} type="button" disabled={pending} onClick={() => { setTypePicker(false); void startListening(type); }} className="rounded-[18px] border border-[#e7e0d7] bg-[#fffdf9] p-4 text-left text-sm"><span className="font-medium">{type}</span><span className="mt-1 block text-[10px] leading-4 text-[#92877e]">Glow changes what it looks for when organizing the transcript.</span></button>)}</div></Dialog>

    <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Write a note' : 'Edit note'}>{editing ? <NoteForm note={editing === 'new' ? undefined : editing} onSaved={(note) => { updateLocal(note); setEditing(null); setSelected(note); }} onCancel={() => setEditing(null)} /> : null}</Dialog>

    <Dialog open={quickOpen} onClose={() => setQuickOpen(false)} title="Quick Capture"><div className="space-y-4"><textarea value={quickCapture} onChange={(event) => setQuickCapture(event.target.value)} rows={7} placeholder="Say or type the thought exactly as it comes…" className="w-full rounded-[20px] border border-[#e5ded5] bg-[#fffdf9] p-4 text-sm leading-6 outline-none"/><div className="flex gap-2"><button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:voice-open'))} className="rounded-full border px-4 py-2.5 text-xs"><Mic size={13} className="mr-1 inline"/>Speak</button><button type="button" disabled={!quickCapture.trim() || pending} onClick={saveQuickCapture} className="rounded-full bg-[#3d3934] px-4 py-2.5 text-xs text-white disabled:opacity-40">Save Capture</button></div></div></Dialog>

    <Dialog open={importOpen} onClose={() => setImportOpen(false)} title="Import into Listener"><div className="space-y-4"><div className="rounded-[20px] border border-dashed border-[#dcd3c9] bg-[#faf7f2] p-6 text-center"><Import size={22} className="mx-auto text-[#9c6e76]"/><p className="mt-3 font-serif text-2xl">Audio, video, Voice Memo, TXT or Markdown</p><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#847a72]">Glow does not reject media because it crosses a minute count. Very large files can still exceed browser/device storage. Imported audio/video is kept locally until a server media/transcription service is configured.</p><input ref={fileInputRef} type="file" accept="audio/*,video/*,.txt,.md,text/plain,text/markdown" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); event.currentTarget.value = ''; }}/><button type="button" onClick={() => fileInputRef.current?.click()} className="mt-5 rounded-full bg-[#3d3934] px-5 py-3 text-xs text-white"><Upload size={13} className="mr-1 inline"/>Choose File</button></div></div></Dialog>

    <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} title="Conversation Intelligence"><div className="space-y-5">{playbackUrl ? <audio controls src={playbackUrl} className="w-full" /> : null}<div className="grid gap-3 sm:grid-cols-3"><div className="rounded-[18px] bg-[#faf7f2] p-4"><p className="text-[9px] uppercase text-[#9b9188]">Type</p><p className="mt-1 font-serif text-xl">{captureType}</p></div><div className="rounded-[18px] bg-[#f3f6ef] p-4"><p className="text-[9px] uppercase text-[#87917f]">Duration</p><p className="mt-1 font-serif text-xl">{formatDuration(elapsed)}</p></div><div className="rounded-[18px] bg-[#f7f3f8] p-4"><p className="text-[9px] uppercase text-[#91839c]">Found</p><p className="mt-1 font-serif text-xl">{actions.length} items</p></div></div><div><div className="flex items-center justify-between gap-3"><p className="text-[10px] uppercase tracking-[.14em] text-[#958b82]">Transcript</p><button type="button" onClick={() => setCleanMode((value) => !value)} className="rounded-full border px-3 py-1.5 text-[10px]">{cleanMode ? 'Clean' : 'Exact'} view</button></div><div className="mt-2 max-h-56 overflow-y-auto rounded-[18px] bg-[#fcfaf6] p-4 text-xs leading-6 text-[#6e665f]">{displayedTranscript || 'No transcript text is available. If this was an imported recording, the media is local but server transcription is not configured yet.'}</div></div>{actions.length ? <div><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.14em] text-[#958b82]">Glow found</p><button type="button" onClick={approveSelected} className="text-[10px] text-[#9c626d]">Approve selected</button></div><div className="mt-3 space-y-2">{actions.map((item) => <div key={item.id} className="rounded-[18px] border border-[#ebe4dc] bg-white p-3"><div className="flex items-start gap-3"><input type="checkbox" checked={selectedActionIds.has(item.id)} onChange={(event) => setSelectedActionIds((current) => { const next = new Set(current); if (event.target.checked) next.add(item.id); else next.delete(item.id); return next; })} className="mt-1"/><div className="min-w-0 flex-1"><p className="text-[9px] uppercase text-[#9b9188]">{item.kind}</p><p className="mt-1 break-words text-xs">{item.text}</p>{item.date ? <p className="mt-1 text-[10px] text-[#91877e]">Suggested: {item.date.toLocaleString()}</p> : null}</div><button type="button" onClick={() => void approveAction(item)} className="shrink-0 rounded-full bg-[#f4f0ea] px-3 py-1.5 text-[9px]">{actionStatus[item.id] ?? 'Review'}</button></div></div>)}</div></div> : null}<div className="flex flex-wrap gap-2"><button type="button" disabled={pending || !recordingMeta} onClick={saveSmartNote} className="rounded-full bg-[#3d3934] px-5 py-3 text-xs text-white disabled:opacity-40">Save Smart Note</button>{recordingMeta && playbackUrl ? <span className="rounded-full bg-[#f3efe9] px-4 py-3 text-[10px] text-[#81776e]">Audio stored locally on this device</span> : null}</div></div></Dialog>

    <Dialog open={Boolean(selected)} onClose={() => { setSelected(null); setNoteQuestion(''); setNoteAnswer(''); }} title={selected?.title ?? 'Note'}>{selected ? <div className="space-y-5"><div className="rounded-[24px] bg-[linear-gradient(145deg,#fffaf4,#f4f1eb)] p-5"><div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-white px-2.5 py-1 text-[9px]">{noteKind(selected)}</span><span className="text-[9px] text-[#92887f]">{selected.updatedAt.toLocaleString()}</span></div><h3 className="mt-4 font-serif text-3xl">{selected.title}</h3></div><div className="max-h-[42vh] overflow-y-auto whitespace-pre-wrap rounded-[18px] border border-[#ebe5dc] bg-white p-4 text-xs leading-6 text-[#6d655e]">{selected.content || 'No content yet.'}</div><div className="rounded-[20px] bg-[#faf7f2] p-4"><p className="text-[10px] uppercase tracking-[.14em] text-[#958b82]">Ask this note</p><div className="mt-3 flex gap-2"><input value={noteQuestion} onChange={(event) => setNoteQuestion(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') askSelectedNote(); }} placeholder="What did we say about the start date?" className="min-w-0 flex-1 rounded-full border bg-white px-4 py-2.5 text-xs outline-none"/><button type="button" disabled={!noteQuestion.trim()} onClick={askSelectedNote} className="rounded-full bg-[#9d6871] px-4 text-xs text-white disabled:opacity-40">Ask</button></div>{noteAnswer ? <p className="mt-3 text-xs leading-6 text-[#746b63]">{noteAnswer}</p> : null}<p className="mt-2 text-[9px] text-[#9a9086]">This answer is grounded in saved note text. It does not invent details that are not in the note.</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setEditing(selected)} className="rounded-full border px-4 py-2.5 text-xs">Edit</button><button type="button" onClick={() => { setSearch(selected.title); setSelected(null); }} className="rounded-full border px-4 py-2.5 text-xs">Find Related</button></div></div> : null}</Dialog>

    {listenerOpen ? <div className="fixed inset-0 z-[230] overflow-y-auto bg-[radial-gradient(circle_at_top,#f5ede6,#fbfaf6_48%,#eee9e3)] px-4 py-6 sm:p-10"><button type="button" onClick={() => { if (!recording) setListenerOpen(false); else setNotice('Finish the recording before closing Listener so the final audio chunk is saved safely.'); }} aria-label="Close Listener" className="fixed right-5 top-5 z-10 rounded-full bg-white/80 p-3 shadow"><X size={17}/></button><div className="mx-auto max-w-4xl"><div className="text-center"><p className="text-[10px] uppercase tracking-[.2em] text-[#9e7179]">{paused ? 'Paused' : 'Listening'} · {captureType}</p><p className="mt-4 font-serif text-6xl tabular-nums sm:text-7xl">{formatDuration(elapsed)}</p><p className="mt-3 text-[10px] text-[#8e837b]">No preset minute cutoff · local chunk recording</p></div><div className="mx-auto mt-8 flex h-20 max-w-2xl items-center justify-center gap-1 overflow-hidden rounded-[28px] border border-white/70 bg-white/55 px-4 backdrop-blur">{Array.from({ length: 48 }).map((_, index) => <span key={index} className="w-1 rounded-full bg-[#b38188] transition-all" style={{ height: `${recording && !paused ? 14 + ((index * 17 + elapsed * 7) % 52) : 10}px`, opacity: recording && !paused ? .4 + ((index % 5) * .1) : .18 }} />)}</div><div className="mt-7 rounded-[28px] border border-white/80 bg-white/65 p-5 backdrop-blur-xl"><div className="flex items-center justify-between"><p className="text-[10px] uppercase tracking-[.14em] text-[#958a81]">Live transcript</p><span className="rounded-full bg-[#f5f0eb] px-2.5 py-1 text-[9px] text-[#8c8178]">You · live speech API</span></div><div className="mt-4 min-h-[220px] whitespace-pre-wrap text-[15px] leading-8 text-[#504943]">{displayedTranscript || <span className="text-[#9b9188]">Start speaking. If this browser supports live speech recognition, your words will appear here while the audio continues recording.</span>}</div></div><div className="sticky bottom-4 mt-6 flex flex-wrap justify-center gap-2 rounded-[24px] border border-white/80 bg-white/82 p-3 shadow-xl backdrop-blur-xl"><button type="button" onClick={() => bookmark('Highlight')} className="rounded-full border px-4 py-2.5 text-xs"><Highlighter size={13} className="mr-1 inline"/>Highlight</button><button type="button" onClick={() => bookmark('Bookmark')} className="rounded-full border px-4 py-2.5 text-xs"><Bookmark size={13} className="mr-1 inline"/>Bookmark</button><button type="button" onClick={pauseListening} className="rounded-full border px-4 py-2.5 text-xs">{paused ? <Play size={13} className="mr-1 inline"/> : <Pause size={13} className="mr-1 inline"/>}{paused ? 'Resume' : 'Pause'}</button><button type="button" onClick={() => void finishListening()} className="rounded-full bg-[#3d3934] px-5 py-2.5 text-xs text-white"><Square size={12} className="mr-1 inline"/>Finish</button></div>{bookmarks.length ? <div className="mt-5 flex flex-wrap gap-2">{bookmarks.map((item, index) => <span key={`${item.at}-${index}`} className="rounded-full bg-white px-3 py-2 text-[9px] shadow-sm">{item.label} · {formatDuration(item.at)}</span>)}</div> : null}</div></div> : null}

    <button type="button" onClick={() => setTypePicker(true)} aria-label="Start a new listening note" className="fixed bottom-24 right-5 z-40 flex h-13 w-13 items-center justify-center rounded-full bg-[#3d3934] p-4 text-white shadow-xl sm:bottom-8"><AudioLines size={19}/></button>
    {notice ? <div role="status" className="fixed bottom-24 left-1/2 z-[260] max-w-[90vw] -translate-x-1/2 rounded-full border border-[#e5ded6] bg-white px-4 py-2.5 text-center text-[10px] text-[#6f665e] shadow-xl sm:bottom-7">{notice}</div> : null}
  </div>;
}
