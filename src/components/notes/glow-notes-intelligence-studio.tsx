'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { AudioLines, Bookmark, FileText, Highlighter, Mic, Pause, Play, Search, Sparkles, Square, Upload, WandSparkles, X } from 'lucide-react';
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
type SpeechResult = { 0?: SpeechAlternative; isFinal?: boolean };
type SpeechResultList = ArrayLike<SpeechResult>;
type SpeechEvent = { resultIndex?: number; results: SpeechResultList };
type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type SpeechCtor = new () => SpeechRecognitionLike;

const CAPTURE_TYPES: NoteCaptureType[] = ['Meeting','Interview','Lecture','Brain Dump','Planning Session','Appointment','Conversation','Voice Journal','General'];
const COLLECTIONS = ['Needs Action','Unreviewed','This Week','Important','Decisions','Ideas','People','Audio Notes'];

function excerpt(note: Note) {
  const text = (note.content ?? '').replace(/^#+\s.*$/gm, '').replace(/\s+/g, ' ').trim();
  return text ? `${text.slice(0, 170)}${text.length > 170 ? '…' : ''}` : 'No note text yet.';
}
function kind(note: Note) {
  const listener = (note.tags ?? []).find((tag) => tag.startsWith('listener:'));
  return listener?.replace('listener:', '') ?? note.tags?.[0] ?? 'Note';
}
function score(note: Note, query: string) {
  const words = query.toLowerCase().split(/\W+/).filter((word) => word.length > 2);
  const haystack = `${note.title} ${note.content ?? ''} ${(note.tags ?? []).join(' ')}`.toLowerCase();
  return words.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0);
}

export function GlowNotesIntelligenceStudio({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [editing, setEditing] = useState<Note | 'new' | null>(null);
  const [selected, setSelected] = useState<Note | null>(null);
  const [captureType, setCaptureType] = useState<NoteCaptureType>('General');
  const [typePicker, setTypePicker] = useState(false);
  const [listenerOpen, setListenerOpen] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [transcript, setTranscript] = useState('');
  const [interim, setInterim] = useState('');
  const [cleanMode, setCleanMode] = useState(false);
  const [bookmarks, setBookmarks] = useState<Array<{ at: number; label: string }>>([]);
  const [actions, setActions] = useState<DetectedAction[]>([]);
  const [actionStatus, setActionStatus] = useState<Record<string,string>>({});
  const [recordingMeta, setRecordingMeta] = useState<RecordingMeta | null>(null);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [quickText, setQuickText] = useState('');
  const [notice, setNotice] = useState('');
  const [pending, startTransition] = useTransition();

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const sessionRef = useRef<string | null>(null);
  const chunkRef = useRef(0);
  const transcriptRef = useRef('');
  const restartSpeechRef = useRef(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);
  useEffect(() => {
    if (!recording || paused || !startedAt) return;
    const tick = () => setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [recording, paused, startedAt]);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 4200);
    return () => window.clearTimeout(id);
  }, [notice]);
  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    recognitionRef.current?.stop();
  }, []);

  const sorted = useMemo(() => [...notes].sort((a,b) => b.updatedAt.getTime() - a.updatedAt.getTime()), [notes]);
  const results = useMemo(() => query.trim() ? sorted.map((note) => ({ note, score: score(note, query) })).filter((row) => row.score > 0).sort((a,b) => b.score - a.score).map((row) => row.note) : sorted.slice(0, 9), [sorted, query]);
  const openLoops = useMemo(() => notes.reduce((sum, note) => sum + extractActions(note.content ?? '').filter((item) => item.kind === 'task' || item.kind === 'reminder').length, 0), [notes]);
  const audioNotes = useMemo(() => notes.filter((note) => (note.tags ?? []).some((tag) => tag.startsWith('listener:'))).length, [notes]);
  const shownTranscript = cleanMode ? cleanTranscript(`${transcript} ${interim}`) : `${transcript}${interim ? ` ${interim}` : ''}`.trim();

  function addLocal(note: Note) {
    setNotes((current) => current.some((item) => item.id === note.id) ? current.map((item) => item.id === note.id ? note : item) : [note, ...current]);
  }
  function resetCapture() {
    setTranscript(''); setInterim(''); setBookmarks([]); setActions([]); setActionStatus({}); setElapsed(0); setStartedAt(null); setRecordingMeta(null); chunkRef.current = 0; transcriptRef.current = ''; sessionRef.current = null;
    if (playbackUrl) URL.revokeObjectURL(playbackUrl);
    setPlaybackUrl(null);
  }
  function startSpeech() {
    const browser = window as Window & { SpeechRecognition?: SpeechCtor; webkitSpeechRecognition?: SpeechCtor };
    const Ctor = browser.SpeechRecognition ?? browser.webkitSpeechRecognition;
    if (!Ctor) { setNotice('Audio is recording. Live transcription is unavailable in this browser, so Glow will not invent transcript text.'); return; }
    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      let finalText = ''; let interimText = '';
      for (let index = event.resultIndex ?? 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result?.[0]?.transcript ?? '';
        if (result?.isFinal === false) interimText += text;
        else finalText += `${text.trim()} `;
      }
      if (finalText.trim()) { setTranscript((current) => `${current}${current ? ' ' : ''}${finalText.trim()}`); setInterim(''); }
      else setInterim(interimText.trim());
    };
    recognition.onerror = (event) => { if (event.error && !['aborted','no-speech'].includes(event.error)) setNotice(`Live transcription paused: ${event.error}. Audio can continue recording.`); };
    recognition.onend = () => { if (restartSpeechRef.current) { try { recognition.start(); } catch { /* browser may already be restarting */ } } };
    recognitionRef.current = recognition;
    restartSpeechRef.current = true;
    try { recognition.start(); } catch { setNotice('Audio started, but live transcription could not start on this device.'); }
  }
  async function startListening(type: NoteCaptureType) {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') { setNotice('This browser does not expose microphone recording. Write or Import still works.'); return; }
    try {
      resetCapture(); setCaptureType(type);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferred = ['audio/mp4','audio/webm;codecs=opus','audio/webm'].find((mime) => MediaRecorder.isTypeSupported(mime));
      const recorder = preferred ? new MediaRecorder(stream, { mimeType: preferred }) : new MediaRecorder(stream);
      const id = crypto.randomUUID();
      const meta: RecordingMeta = { id, title: `${type} · ${new Date().toLocaleString('en-US',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'})}`, type, mimeType: recorder.mimeType || preferred || 'audio/webm', startedAt: Date.now(), chunkCount: 0 };
      sessionRef.current = id; setRecordingMeta(meta); await saveRecordingMeta(meta);
      recorder.ondataavailable = async (event) => {
        if (!event.data.size || !sessionRef.current) return;
        const index = chunkRef.current++;
        try { await appendRecordingChunk(sessionRef.current, index, event.data); }
        catch { setNotice('One local audio chunk could not be saved. Check available device storage before continuing a very long session.'); }
      };
      recorder.onerror = () => setNotice('The browser reported a recording error. Saved transcript text is still safe.');
      recorderRef.current = recorder; streamRef.current = stream; recorder.start(5000);
      setStartedAt(Date.now()); setRecording(true); setPaused(false); setListenerOpen(true); startSpeech();
    } catch { setNotice('Microphone access was not granted. Write, Quick Capture, and Import are still available.'); }
  }
  function pauseListening() {
    const recorder = recorderRef.current; if (!recorder) return;
    if (recorder.state === 'recording') { recorder.pause(); restartSpeechRef.current = false; recognitionRef.current?.stop(); setPaused(true); }
    else if (recorder.state === 'paused') { recorder.resume(); setPaused(false); setStartedAt(Date.now() - elapsed * 1000); startSpeech(); }
  }
  async function finishListening() {
    const recorder = recorderRef.current; const meta = recordingMeta; if (!recorder || !meta) return;
    restartSpeechRef.current = false; recognitionRef.current?.stop(); recognitionRef.current = null;
    await new Promise<void>((resolve) => { if (recorder.state === 'inactive') resolve(); else { recorder.addEventListener('stop', () => resolve(), { once: true }); recorder.stop(); } });
    streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; setRecording(false); setPaused(false);
    const finalMeta = { ...meta, endedAt: Date.now(), chunkCount: chunkRef.current }; setRecordingMeta(finalMeta);
    try { await saveRecordingMeta(finalMeta); const blob = await buildRecordingBlob(meta.id, meta.mimeType); if (playbackUrl) URL.revokeObjectURL(playbackUrl); setPlaybackUrl(URL.createObjectURL(blob)); }
    catch { setNotice('The transcript can still be saved, but Glow could not rebuild the local audio preview.'); }
    setActions(extractActions(transcriptRef.current)); setListenerOpen(false); setReviewOpen(true);
  }
  function bookmark(label: string) { setBookmarks((current) => [...current,{ at: elapsed, label }]); setNotice(`${label} marked at ${formatDuration(elapsed)}.`); }
  function saveSmartNote() {
    if (!recordingMeta) return;
    const content = buildSmartNoteContent({ transcript, type: captureType, durationSeconds: elapsed, actions, bookmarks });
    startTransition(async () => {
      const result = await createNoteAction({ title: recordingMeta.title, content, tags: [`listener:${captureType}`,'smart-note','audio-capture'], pinned: false });
      if (result.data) { addLocal(result.data); setSelected(result.data); setReviewOpen(false); setNotice('Smart Note saved. Transcript is in Glow; audio remains local on this device.'); }
      else setNotice('Glow could not save the Smart Note. Local recording data has not been deleted.');
    });
  }
  async function approveAction(item: DetectedAction) {
    setActionStatus((current) => ({ ...current, [item.id]: 'Saving…' }));
    try {
      if (item.kind === 'task') {
        const result = await createTaskAction({ title: item.text.slice(0,255), status:'pending', priority:'medium', dueDate:item.date });
        setActionStatus((current) => ({ ...current, [item.id]: result.data ? 'Added to Tasks' : 'Could not add' }));
      } else if (item.kind === 'calendar' && item.date) {
        const result = await createCalendarEventAction({ title:item.text.slice(0,255), startAt:item.date, endAt:new Date(+item.date + 3600000), allDay:false, color:'#e6d8dc' });
        setActionStatus((current) => ({ ...current, [item.id]: result.data ? 'Added to Calendar' : 'Could not add' }));
      } else if (item.kind === 'reminder') {
        setActionStatus((current) => ({ ...current, [item.id]: 'Review in Reminders' }));
        setNotice('Reminder detected. Notes will not silently turn it into a Task; review it in Reminders.');
      } else setActionStatus((current) => ({ ...current, [item.id]: 'Kept in Smart Note' }));
    } catch { setActionStatus((current) => ({ ...current, [item.id]: 'Could not add' })); }
  }
  function saveQuick() {
    const text = quickText.trim(); if (!text) return; const type = inferCaptureType(text,'Brain Dump');
    startTransition(async () => {
      const result = await createNoteAction({ title:`Quick Capture · ${new Date().toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`, content:text, tags:[`listener:${type}`,'quick-capture'], pinned:false });
      if (result.data) { addLocal(result.data); setQuickText(''); setQuickOpen(false); setNotice('Quick capture saved.'); } else setNotice('Quick capture could not be saved.');
    });
  }
  async function importFile(file: File) {
    const id = crypto.randomUUID(); const type = inferCaptureType(file.name,captureType);
    if (file.type.startsWith('text/') || /\.(txt|md)$/i.test(file.name)) {
      const text = await file.text(); const detected = extractActions(text); setTranscript(text); setActions(detected); setCaptureType(type); setRecordingMeta({ id, title:file.name.replace(/\.[^.]+$/,''), type, mimeType:file.type || 'text/plain', startedAt:Date.now(), endedAt:Date.now(), chunkCount:0 }); setElapsed(0); setImportOpen(false); setReviewOpen(true); return;
    }
    if (!file.type.startsWith('audio/') && !file.type.startsWith('video/')) { setNotice('Choose audio, video, TXT, or Markdown.'); return; }
    try { const meta = await saveImportedMedia(id,file,type); setRecordingMeta(meta); setCaptureType(type); setTranscript(''); setActions([]); if (playbackUrl) URL.revokeObjectURL(playbackUrl); setPlaybackUrl(URL.createObjectURL(file)); setImportOpen(false); setReviewOpen(true); setNotice('Media imported locally with no minute-based rejection. Server transcription is not configured yet, so Glow is not inventing a transcript.'); }
    catch { setNotice('The device could not store that file locally. Very large files are limited by browser/device storage, not a Glow minute cap.'); }
  }

  return <div className="mx-auto max-w-[1380px] space-y-6 pb-24">
    <section className="rounded-[38px] border border-[#e8e1d7] bg-[radial-gradient(circle_at_83%_3%,rgba(220,232,213,.82),transparent_27%),radial-gradient(circle_at_58%_0%,rgba(249,225,218,.72),transparent_31%),linear-gradient(135deg,#fffdf8,#f7f3ed)] p-6 shadow-[0_30px_100px_rgba(76,63,52,.07)] sm:p-9"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#9a8e80]">Glow Notes + Listener</p><div className="mt-3 grid gap-7 lg:grid-cols-[1.15fr_.85fr] lg:items-end"><div><h1 className="font-serif text-5xl tracking-[-.045em] text-[#312d29] sm:text-6xl">Think out loud.</h1><p className="mt-3 max-w-2xl text-[15px] leading-7 text-[#6d645d]">Capture anything. Understand everything. Turn it into action. Notes is now a listening, thinking, and connection space instead of a static journal.</p><div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={() => setTypePicker(true)} className="rounded-full bg-[#3d3934] px-5 py-3 text-sm text-white"><Mic size={14} className="mr-2 inline"/>Start Listening</button><button type="button" onClick={() => setEditing('new')} className="rounded-full border bg-white/70 px-5 py-3 text-sm">Write</button><button type="button" onClick={() => setImportOpen(true)} className="rounded-full border bg-white/70 px-5 py-3 text-sm">Import</button><button type="button" onClick={() => setQuickOpen(true)} className="rounded-full border bg-white/70 px-5 py-3 text-sm">Quick Capture</button></div></div><div className="rounded-[28px] border border-white/80 bg-white/65 p-5 backdrop-blur-xl"><p className="text-[10px] uppercase tracking-[.14em] text-[#998e84]">Long-session design</p><p className="mt-2 font-serif text-2xl">No artificial minute cap.</p><p className="mt-3 text-xs leading-5 text-[#7f756d]">Recording is chunked locally instead of stopping at a preset duration. Real-world limits can still come from device storage, battery, browser stability, permissions, and future transcription-service limits.</p></div></div></section>

    <section><p className="text-[10px] uppercase tracking-[.14em] text-[#9a9086]">What do you want Glow to capture?</p><div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[[Mic,'Listen','Live recording + transcript when supported',() => setTypePicker(true)],[FileText,'Write','Normal intelligent note',() => setEditing('new')],[Upload,'Import','Long audio, video, Voice Memo or text',() => setImportOpen(true)],[Sparkles,'Quick Capture','One thought without organizing it',() => setQuickOpen(true)]].map(([Icon,name,detail,action]) => { const I = Icon as typeof Mic; return <button key={String(name)} type="button" onClick={action as () => void} className="rounded-[26px] border border-[#e8e2d9] bg-white p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f6f0ea] text-[#9e6972]"><I size={17}/></span><p className="mt-5 font-serif text-2xl">{String(name)}</p><p className="mt-2 text-xs leading-5 text-[#8b8178]">{String(detail)}</p></button>; })}</div></section>

    <section className="grid gap-4 lg:grid-cols-[1fr_.8fr]"><div className="rounded-[30px] border border-[#e8e2d9] bg-white p-5"><p className="text-[10px] uppercase tracking-[.14em] text-[#9a9086]">Needs your attention</p><div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"><div className="rounded-[18px] bg-[#faf7f2] p-4"><p className="text-[9px] uppercase">Audio notes</p><p className="mt-2 font-serif text-3xl">{audioNotes}</p></div><div className="rounded-[18px] bg-[#f7f3f8] p-4"><p className="text-[9px] uppercase">Open loops</p><p className="mt-2 font-serif text-3xl">{openLoops}</p></div><div className="rounded-[18px] bg-[#f1f5ed] p-4"><p className="text-[9px] uppercase">Recent</p><p className="mt-2 font-serif text-3xl">{Math.min(9,sorted.length)}</p></div></div></div><div className="rounded-[30px] border border-[#e8e2d9] bg-white p-5"><div className="flex items-center gap-2"><WandSparkles size={15}/><p className="text-[10px] uppercase tracking-[.14em] text-[#9a9086]">Glow principle</p></div><p className="mt-4 text-sm leading-6 text-[#675f58]">A transcript is not the finish line. Glow should surface tasks, dates, decisions, ideas, and things worth remembering, then let you approve what belongs elsewhere.</p></div></section>

    <section className="rounded-[30px] border border-[#e8e2d9] bg-white p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[10px] uppercase tracking-[.14em] text-[#9a9086]">Ask / Search all notes</p><h2 className="mt-1 font-serif text-3xl">Find the thought again.</h2></div><div className="relative sm:w-[420px]"><Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a3988e]"/><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Victoria, salary, Glow Calendar…" className="w-full rounded-full border bg-[#fbf9f5] py-3 pl-10 pr-4 text-xs outline-none"/></div></div><div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{results.map((note) => <button key={note.id} type="button" onClick={() => setSelected(note)} className="rounded-[22px] border border-[#ebe5dc] bg-[#fffdf9] p-5 text-left"><span className="rounded-full bg-[#f4efea] px-2.5 py-1 text-[9px]">{kind(note)}</span><p className="mt-4 font-serif text-2xl">{note.title}</p><p className="mt-3 line-clamp-4 text-xs leading-5 text-[#827970]">{excerpt(note)}</p></button>)}{query.trim() && !results.length ? <p className="text-xs text-[#91877e]">No saved note contains those terms. Glow will not invent a match.</p> : null}</div></section>

    <section><p className="text-[10px] uppercase tracking-[.14em] text-[#9a9086]">Smart collections</p><div className="mt-3 flex gap-2 overflow-x-auto pb-1">{COLLECTIONS.map((item) => <button key={item} type="button" onClick={() => setQuery(item === 'Audio Notes' ? 'listener' : item.replace('Needs Action','need should remind').replace('Decisions','decided agreed').replace('Ideas','idea'))} className="shrink-0 rounded-full border bg-white px-4 py-2.5 text-xs">{item}</button>)}</div></section>

    <Dialog open={typePicker} onClose={() => setTypePicker(false)} title="What are you capturing?"><div className="grid gap-2 sm:grid-cols-2">{CAPTURE_TYPES.map((type) => <button key={type} type="button" onClick={() => { setTypePicker(false); void startListening(type); }} className="rounded-[18px] border bg-[#fffdf9] p-4 text-left text-sm"><b>{type}</b><span className="mt-1 block text-[10px] text-[#92877e]">Glow changes what it looks for when organizing the transcript.</span></button>)}</div></Dialog>
    <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} title={editing === 'new' ? 'Write a note' : 'Edit note'}>{editing ? <NoteForm note={editing === 'new' ? undefined : editing} onSaved={(note) => { addLocal(note); setEditing(null); setSelected(note); }} onCancel={() => setEditing(null)}/> : null}</Dialog>
    <Dialog open={quickOpen} onClose={() => setQuickOpen(false)} title="Quick Capture"><div className="space-y-4"><textarea value={quickText} onChange={(event) => setQuickText(event.target.value)} rows={7} placeholder="Type the thought exactly as it comes…" className="w-full rounded-[20px] border bg-[#fffdf9] p-4 text-sm leading-6 outline-none"/><button type="button" disabled={!quickText.trim() || pending} onClick={saveQuick} className="rounded-full bg-[#3d3934] px-4 py-2.5 text-xs text-white disabled:opacity-40">Save Capture</button></div></Dialog>
    <Dialog open={importOpen} onClose={() => setImportOpen(false)} title="Import into Listener"><div className="rounded-[20px] border border-dashed bg-[#faf7f2] p-6 text-center"><Upload size={22} className="mx-auto"/><p className="mt-3 font-serif text-2xl">Audio, video, Voice Memo, TXT or Markdown</p><p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#847a72]">There is no Glow minute-count rejection. Very large files can still exceed browser/device storage. Audio/video transcription needs a server transcription service before Glow can truthfully generate text from the file.</p><input ref={fileRef} type="file" accept="audio/*,video/*,.txt,.md,text/plain,text/markdown" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importFile(file); event.currentTarget.value = ''; }}/><button type="button" onClick={() => fileRef.current?.click()} className="mt-5 rounded-full bg-[#3d3934] px-5 py-3 text-xs text-white">Choose File</button></div></Dialog>

    <Dialog open={reviewOpen} onClose={() => setReviewOpen(false)} title="Conversation Intelligence"><div className="space-y-5">{playbackUrl ? <audio controls src={playbackUrl} className="w-full"/> : null}<div className="grid grid-cols-3 gap-2"><div className="rounded-[16px] bg-[#faf7f2] p-3 text-xs">Type<br/><b>{captureType}</b></div><div className="rounded-[16px] bg-[#f2f5ee] p-3 text-xs">Duration<br/><b>{formatDuration(elapsed)}</b></div><div className="rounded-[16px] bg-[#f7f3f8] p-3 text-xs">Found<br/><b>{actions.length}</b></div></div><div><div className="flex items-center justify-between"><p className="text-[10px] uppercase">Transcript</p><button type="button" onClick={() => setCleanMode((value) => !value)} className="rounded-full border px-3 py-1.5 text-[10px]">{cleanMode ? 'Clean' : 'Exact'} view</button></div><div className="mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-[18px] bg-[#fcfaf6] p-4 text-xs leading-6">{shownTranscript || 'No transcript text is available. Imported media can still be stored locally, but Glow will not invent a transcript without a transcription engine.'}</div></div>{actions.length ? <div className="space-y-2">{actions.map((item) => <div key={item.id} className="rounded-[16px] border p-3"><p className="text-[9px] uppercase text-[#9a9086]">{item.kind}</p><div className="mt-1 flex items-start justify-between gap-3"><p className="text-xs">{item.text}</p><button type="button" onClick={() => void approveAction(item)} className="shrink-0 rounded-full bg-[#f4f0ea] px-3 py-1.5 text-[9px]">{actionStatus[item.id] ?? 'Review'}</button></div>{item.date ? <p className="mt-1 text-[9px] text-[#91877e]">Suggested: {item.date.toLocaleString()}</p> : null}</div>)}</div> : null}<button type="button" disabled={pending || !recordingMeta} onClick={saveSmartNote} className="rounded-full bg-[#3d3934] px-5 py-3 text-xs text-white disabled:opacity-40">Save Smart Note</button></div></Dialog>

    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? 'Note'}>{selected ? <div className="space-y-4"><div className="rounded-[20px] bg-[#faf7f2] p-4"><span className="rounded-full bg-white px-2 py-1 text-[9px]">{kind(selected)}</span><h3 className="mt-4 font-serif text-3xl">{selected.title}</h3></div><div className="max-h-[52vh] overflow-y-auto whitespace-pre-wrap rounded-[18px] border p-4 text-xs leading-6">{selected.content || 'No content yet.'}</div><div className="flex gap-2"><button type="button" onClick={() => setEditing(selected)} className="rounded-full border px-4 py-2.5 text-xs">Edit</button><button type="button" onClick={() => { setQuery(selected.title); setSelected(null); }} className="rounded-full border px-4 py-2.5 text-xs">Find Related</button></div></div> : null}</Dialog>

    {listenerOpen ? <div className="fixed inset-0 z-[230] overflow-y-auto bg-[radial-gradient(circle_at_top,#f5ede6,#fbfaf6_48%,#eee9e3)] p-5 sm:p-10"><button type="button" onClick={() => setNotice('Finish the recording before closing Listener so the final chunk is saved safely.')} aria-label="Close Listener" className="fixed right-5 top-5 rounded-full bg-white/80 p-3 shadow"><X size={17}/></button><div className="mx-auto max-w-4xl"><p className="text-center text-[10px] uppercase tracking-[.2em]">{paused ? 'Paused' : 'Listening'} · {captureType}</p><p className="mt-4 text-center font-serif text-6xl tabular-nums">{formatDuration(elapsed)}</p><p className="mt-2 text-center text-[10px] text-[#8e837b]">No preset minute cutoff · local chunk recording</p><div className="mx-auto mt-8 flex h-20 max-w-2xl items-center justify-center gap-1 rounded-[28px] border bg-white/55 px-4">{Array.from({length:48}).map((_,index) => <span key={index} className="w-1 rounded-full bg-[#b38188]" style={{height:`${recording && !paused ? 14 + ((index * 17 + elapsed * 7) % 52) : 10}px`,opacity:recording && !paused ? .55 : .18}}/>)}</div><div className="mt-7 rounded-[28px] border bg-white/70 p-5"><p className="text-[10px] uppercase">Live transcript</p><div className="mt-4 min-h-[220px] whitespace-pre-wrap text-[15px] leading-8">{shownTranscript || <span className="text-[#9b9188]">Start speaking. If this browser supports live speech recognition, your words will appear here while audio continues recording.</span>}</div></div><div className="sticky bottom-4 mt-6 flex flex-wrap justify-center gap-2 rounded-[24px] border bg-white/85 p-3 shadow-xl"><button type="button" onClick={() => bookmark('Highlight')} className="rounded-full border px-4 py-2.5 text-xs"><Highlighter size={13} className="mr-1 inline"/>Highlight</button><button type="button" onClick={() => bookmark('Bookmark')} className="rounded-full border px-4 py-2.5 text-xs"><Bookmark size={13} className="mr-1 inline"/>Bookmark</button><button type="button" onClick={pauseListening} className="rounded-full border px-4 py-2.5 text-xs">{paused ? <Play size={13} className="mr-1 inline"/> : <Pause size={13} className="mr-1 inline"/>}{paused ? 'Resume' : 'Pause'}</button><button type="button" onClick={() => void finishListening()} className="rounded-full bg-[#3d3934] px-5 py-2.5 text-xs text-white"><Square size={12} className="mr-1 inline"/>Finish</button></div>{bookmarks.length ? <div className="mt-4 flex flex-wrap gap-2">{bookmarks.map((item,index) => <span key={`${item.at}-${index}`} className="rounded-full bg-white px-3 py-2 text-[9px]">{item.label} · {formatDuration(item.at)}</span>)}</div> : null}</div></div> : null}

    <button type="button" onClick={() => setTypePicker(true)} aria-label="Start a new listening note" className="fixed bottom-24 right-5 z-40 rounded-full bg-[#3d3934] p-4 text-white shadow-xl sm:bottom-8"><AudioLines size={19}/></button>
    {notice ? <div role="status" className="fixed bottom-24 left-1/2 z-[260] max-w-[90vw] -translate-x-1/2 rounded-full border bg-white px-4 py-2.5 text-center text-[10px] shadow-xl sm:bottom-7">{notice}</div> : null}
  </div>;
}
