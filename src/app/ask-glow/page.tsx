'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowDownToLine,
  Camera,
  Check,
  File,
  FileAudio,
  FileImage,
  FileText,
  Image as ImageIcon,
  Mic,
  Paperclip,
  Plus,
  Send,
  Sparkles,
  Square,
  Video,
  X,
} from 'lucide-react';
import { GlowAuraMark } from '@/components/glow/glow-aura-mark';
import { glowRiskForText, isVisualCreationRequest } from '@/lib/intelligence/glow-operating-model';

type AttachmentSummary = {
  name: string;
  type: string;
  size: number;
  status: 'understood' | 'transcribed' | 'metadata-only' | 'too-large';
  note?: string;
};

type LocalAttachment = {
  id: string;
  file: File;
  previewUrl?: string;
};

type Turn = {
  id: string;
  role: 'user' | 'glow';
  text: string;
  meta?: string;
  image?: { dataUrl: string; mediaType: string };
  attachments?: AttachmentSummary[];
};

type ProposalAction = {
  title: string;
  type: string;
  destinations: string[];
  confidence: number;
  executor?: 'verified' | 'review-queue';
};

type Proposal = {
  text: string;
  actions: ProposalAction[];
};

type CommandResponse = {
  ok?: boolean;
  mode?: 'answer' | 'proposal' | 'completed';
  message?: string;
  requiresConfirmation?: boolean;
  actions?: ProposalAction[];
  receipt?: {
    summary?: string;
    status?: string;
    completed?: string[];
    queued?: string[];
    destinations?: string[];
    queuedDestinations?: string[];
    needsAttention?: boolean;
  };
};

type MultimodalResponse = {
  ok?: boolean;
  mode?: 'answer' | 'created';
  message?: string;
  image?: { dataUrl: string; base64?: string; mediaType: string } | null;
  attachments?: AttachmentSummary[];
};

type TranscriptionResponse = { ok?: boolean; text?: string; message?: string };

type StoredTurn = { role: 'user' | 'glow'; text: string; meta?: string };
type SelectedContext = { label: string; type?: string; id?: string; route: string; capturedAt: number };

type AudioWindow = Window & { webkitAudioContext?: typeof AudioContext };

const SUGGESTIONS = [
  'Tell me what I should do next.',
  'Help me organize what is on my mind.',
  'Make me a routine and a visual for it.',
  'Analyze what I attach and tell me what matters.',
];

const ACCEPTED_FILES = 'image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.md,.csv,.xls,.xlsx,.ppt,.pptx,.json,.zip';

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function humanBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

function iconFor(file: File) {
  if (file.type.startsWith('image/')) return <FileImage size={17} />;
  if (file.type.startsWith('video/')) return <Video size={17} />;
  if (file.type.startsWith('audio/')) return <FileAudio size={17} />;
  if (file.type.startsWith('text/') || /\.(pdf|docx?|md|txt|csv)$/i.test(file.name)) return <FileText size={17} />;
  return <File size={17} />;
}

function recordingMimeType() {
  if (typeof MediaRecorder === 'undefined') return '';
  const choices = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'];
  return choices.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
}

function extensionForMime(mime: string) {
  if (mime.includes('mp4')) return 'm4a';
  if (mime.includes('ogg')) return 'ogg';
  return 'webm';
}

export default function AskGlowPage() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const cameraVideoInputRef = useRef<HTMLInputElement | null>(null);
  const conversationEndRef = useRef<HTMLDivElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const [input, setInput] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [attachments, setAttachments] = useState<LocalAttachment[]>([]);
  const [selectedContext, setSelectedContext] = useState<SelectedContext | null>(null);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [pending, setPending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [status, setStatus] = useState('');
  const [attachmentMenu, setAttachmentMenu] = useState(false);
  const [dragging, setDragging] = useState(false);

  const cleanStoredTurns = useMemo<StoredTurn[]>(() => turns.slice(-32).map(({ role, text, meta }) => ({ role, text, meta })), [turns]);

  useEffect(() => {
    try {
      const savedTurns = window.sessionStorage.getItem('glow.presence.turns');
      const savedContext = window.sessionStorage.getItem('glow.presence.context');
      if (savedTurns) {
        const parsed = JSON.parse(savedTurns) as StoredTurn[];
        if (Array.isArray(parsed)) {
          setTurns(parsed.map((turn) => ({ id: uid(), role: turn.role, text: String(turn.text ?? ''), meta: turn.meta })));
        }
      }
      if (savedContext) setSelectedContext(JSON.parse(savedContext) as SelectedContext);
    } catch {}
  }, []);

  useEffect(() => {
    try { window.sessionStorage.setItem('glow.presence.turns', JSON.stringify(cleanStoredTurns)); } catch {}
  }, [cleanStoredTurns]);

  useEffect(() => {
    try {
      if (selectedContext) window.sessionStorage.setItem('glow.presence.context', JSON.stringify(selectedContext));
      else window.sessionStorage.removeItem('glow.presence.context');
    } catch {}
  }, [selectedContext]);

  useEffect(() => {
    const area = textareaRef.current;
    if (!area) return;
    area.style.height = 'auto';
    area.style.height = `${Math.min(Math.max(area.scrollHeight, 56), 220)}px`;
  }, [input]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns, proposal, pending]);

  useEffect(() => () => {
    attachments.forEach((item) => { if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); });
    if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current);
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    void audioContextRef.current?.close();
  }, [attachments]);

  const addFiles = useCallback((incoming: FileList | File[]) => {
    const files = Array.from(incoming).filter((file) => file.size > 0);
    if (!files.length) return;
    setAttachments((current) => {
      const room = Math.max(0, 24 - current.length);
      const next = files.slice(0, room).map((file) => ({
        id: uid(),
        file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      }));
      return [...current, ...next];
    });
    setAttachmentMenu(false);
  }, []);

  function removeAttachment(id: string) {
    setAttachments((current) => current.filter((item) => {
      if (item.id !== id) return true;
      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return false;
    }));
  }

  function addTurn(turn: Omit<Turn, 'id'>) {
    setTurns((current) => [...current, { ...turn, id: uid() }].slice(-48));
  }

  async function ensureAudioContext() {
    const Ctor = window.AudioContext ?? (window as AudioWindow).webkitAudioContext;
    if (!Ctor) return null;
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') audioContextRef.current = new Ctor();
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    return audioContextRef.current;
  }

  function clearComposerAttachments() {
    setAttachments((current) => {
      current.forEach((item) => { if (item.previewUrl) URL.revokeObjectURL(item.previewUrl); });
      return [];
    });
  }

  async function callCommand(text: string, approved = false) {
    const response = await fetch('/api/glow/command', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        text,
        sourceRoute: '/ask-glow',
        selectedContext: selectedContext ? JSON.stringify(selectedContext) : '',
        approved,
        risk: glowRiskForText(text),
        history: cleanStoredTurns.slice(-16),
      }),
    });
    const payload = await response.json() as CommandResponse;
    if (!response.ok || !payload.ok) throw new Error(payload.message || 'Glow could not complete that request.');
    return payload;
  }

  async function callMultimodal(text: string, files: LocalAttachment[]) {
    const form = new FormData();
    form.set('text', text);
    form.set('sourceRoute', '/ask-glow');
    form.set('selectedContext', selectedContext ? JSON.stringify(selectedContext) : '');
    form.set('history', JSON.stringify(cleanStoredTurns.slice(-16)));
    files.forEach(({ file }) => form.append('files', file, file.name));

    const response = await fetch('/api/glow/multimodal', {
      method: 'POST',
      credentials: 'same-origin',
      body: form,
    });
    const payload = await response.json() as MultimodalResponse;
    if (!response.ok || !payload.ok) throw new Error(payload.message || 'Glow could not understand that request.');
    return payload;
  }

  async function send(explicitText?: string) {
    const text = (explicitText ?? input).trim();
    const files = attachments;
    if ((!text && files.length === 0) || pending || proposal) return;

    const attachmentNames = files.map(({ file }) => ({ name: file.name, type: file.type || 'file', size: file.size, status: 'understood' as const }));
    addTurn({ role: 'user', text: text || 'Attached media', attachments: attachmentNames });
    setInput('');
    setPending(true);
    setStatus(files.length ? 'Shakti is reading and understanding your attachments…' : 'Shakti is understanding…');

    try {
      const needsMultimodal = files.length > 0 || isVisualCreationRequest(text);
      if (needsMultimodal) {
        const payload = await callMultimodal(text, files);
        addTurn({
          role: 'glow',
          text: payload.message || (payload.image ? 'I created that visual.' : 'I understood what you sent.'),
          image: payload.image?.dataUrl ? { dataUrl: payload.image.dataUrl, mediaType: payload.image.mediaType } : undefined,
          attachments: payload.attachments,
          meta: payload.image ? 'Created inline' : payload.attachments?.length ? 'Multimodal context understood' : undefined,
        });
        clearComposerAttachments();
      } else {
        const payload = await callCommand(text);
        if (payload.requiresConfirmation) {
          setProposal({ text, actions: payload.actions ?? [] });
          addTurn({ role: 'glow', text: payload.message || 'I have a proposed change ready for your approval.', meta: 'Approval required' });
        } else {
          addTurn({ role: 'glow', text: payload.message || 'Done.', meta: payload.receipt?.summary ? `Receipt · ${payload.receipt.summary}` : undefined });
        }
      }
      setStatus('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Glow could not complete that request.';
      addTurn({ role: 'glow', text: message, meta: 'Needs attention' });
      setStatus(message);
    } finally {
      setPending(false);
    }
  }

  async function approveProposal() {
    if (!proposal || pending) return;
    setPending(true);
    setStatus('Shakti is carrying out the approved change…');
    try {
      const payload = await callCommand(proposal.text, true);
      setProposal(null);
      addTurn({ role: 'glow', text: payload.message || 'Done.', meta: payload.receipt?.summary ? `Receipt · ${payload.receipt.summary}` : 'Completed' });
      router.refresh();
      setStatus('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Glow could not complete the approved action.';
      addTurn({ role: 'glow', text: message, meta: 'Needs attention' });
      setStatus(message);
    } finally {
      setPending(false);
    }
  }

  function cancelProposal() {
    setProposal(null);
    addTurn({ role: 'glow', text: 'Nothing changed.' });
  }

  function stopListening() {
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current);
      recordingTimeoutRef.current = null;
    }
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop();
  }

  async function startListening() {
    if (recording) {
      stopListening();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('Microphone recording is not available in this browser. You can still upload an audio file.');
      return;
    }

    try {
      await ensureAudioContext();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];
      const mimeType = recordingMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      recorder.onstop = async () => {
        setRecording(false);
        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
        mediaStreamRef.current = null;
        const type = recorder.mimeType || mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type });
        audioChunksRef.current = [];
        if (!blob.size) return;
        setStatus('Shakti is understanding what you said…');
        try {
          const form = new FormData();
          form.append('audio', blob, `ask-glow-voice.${extensionForMime(type)}`);
          const response = await fetch('/api/glow/transcribe', { method: 'POST', credentials: 'same-origin', body: form });
          const payload = await response.json() as TranscriptionResponse;
          if (!response.ok || !payload.ok || !payload.text?.trim()) throw new Error(payload.message || 'Glow could not understand that recording.');
          setStatus('');
          await send(payload.text.trim());
        } catch (error) {
          setStatus(error instanceof Error ? error.message : 'Glow could not understand that recording.');
        }
      };
      recorder.start(250);
      setRecording(true);
      setStatus('Listening… tap the microphone again when you are finished.');
      recordingTimeoutRef.current = window.setTimeout(() => stopListening(), 10 * 60 * 1000);
    } catch (error) {
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
      setRecording(false);
      setStatus(error instanceof Error ? error.message : 'Glow could not start the microphone.');
    }
  }

  function onPaste(event: React.ClipboardEvent<HTMLTextAreaElement>) {
    const pastedFiles = Array.from(event.clipboardData.files);
    if (pastedFiles.length) addFiles(pastedFiles);
  }

  function onDrop(event: React.DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) addFiles(event.dataTransfer.files);
  }

  const showSuggestions = turns.length === 0 && !input.trim() && attachments.length === 0;

  return (
    <main
      className="ask-glow-workspace min-h-[100dvh] bg-white text-[#1C1C1E]"
      onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false); }}
      onDrop={onDrop}
    >
      <style jsx global>{`
        .ask-glow-workspace ~ .glow-presence-trigger,
        body:has(.ask-glow-workspace) .glow-presence-trigger,
        body:has(.ask-glow-workspace) .glow-unfolded-surface { display: none !important; }
      `}</style>

      {dragging ? (
        <div className="fixed inset-3 z-[90] grid place-items-center rounded-[36px] border border-[#B86F7D]/35 bg-white/90 backdrop-blur-xl">
          <div className="text-center">
            <Paperclip className="mx-auto mb-3" size={24} />
            <p className="text-sm font-semibold">Drop anything into Ask Glow</p>
            <p className="mt-1 text-xs text-[#6E6E73]">Photos, video, audio, PDFs, documents, spreadsheets and more.</p>
          </div>
        </div>
      ) : null}

      <div className="mx-auto flex min-h-[100dvh] w-full max-w-5xl flex-col px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] sm:px-6 lg:px-8">
        <header className="flex items-center justify-between gap-4 border-b border-[#ECECEC] pb-4">
          <div className="flex min-w-0 items-center gap-3">
            <GlowAuraMark state={recording ? 'listening' : pending ? 'understanding' : 'resting'} world="Create" size="expanded" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#6E6E73]">Shakti · {recording ? 'listening' : pending ? 'understanding' : 'available'}</p>
              <h1 className="mt-0.5 font-serif text-[30px] leading-none tracking-[-.02em] sm:text-[36px]">Ask Glow</h1>
            </div>
          </div>
          <button type="button" onClick={() => router.back()} className="grid h-11 w-11 place-items-center rounded-full border border-[#ECECEC] bg-white transition hover:bg-[#FAFAFA]" aria-label="Close Ask Glow">
            <X size={17} />
          </button>
        </header>

        {selectedContext ? (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-[#ECECEC] bg-[#FAFAFA] px-4 py-3 text-xs text-[#6E6E73]">
            <span className="truncate"><span className="font-semibold text-[#1C1C1E]">Current context</span> · {selectedContext.type ? `${selectedContext.type} · ` : ''}{selectedContext.label}</span>
            <button type="button" onClick={() => setSelectedContext(null)} className="shrink-0 font-semibold text-[#1C1C1E]">Clear</button>
          </div>
        ) : null}

        <section className="min-h-0 flex-1 overflow-y-auto py-6" aria-label="Ask Glow conversation">
          {showSuggestions ? (
            <div className="mx-auto max-w-2xl py-[10vh] text-center">
              <p className="font-serif text-[32px] leading-tight tracking-[-.02em] sm:text-[42px]">Give Glow whatever is on your mind.</p>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-[#6E6E73]">Type naturally, talk, paste, or attach what you want Shakti to understand. Suggestions are optional.</p>
              <div className="mt-7 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button key={suggestion} type="button" onClick={() => { setInput(suggestion); textareaRef.current?.focus(); }} className="min-h-11 rounded-full border border-[#ECECEC] bg-white px-4 text-sm text-[#1C1C1E] transition hover:bg-[#FAFAFA]">
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mx-auto max-w-3xl space-y-5">
            {turns.map((turn) => (
              <article key={turn.id} className={turn.role === 'user' ? 'ml-auto max-w-[88%]' : 'mr-auto max-w-[94%]'}>
                <div className={turn.role === 'user'
                  ? 'rounded-[24px] rounded-br-[8px] bg-[#1C1C1E] px-4 py-3 text-sm leading-6 text-white'
                  : 'rounded-[26px] rounded-bl-[8px] border border-[#ECECEC] bg-white px-4 py-4 text-sm leading-6 text-[#1C1C1E] shadow-[0_12px_40px_rgba(28,28,30,.04)]'}>
                  <p className="whitespace-pre-wrap">{turn.text}</p>
                  {turn.attachments?.length ? (
                    <div className={`mt-3 space-y-2 border-t pt-3 ${turn.role === 'user' ? 'border-white/15' : 'border-[#ECECEC]'}`}>
                      {turn.attachments.map((item, index) => (
                        <div key={`${item.name}-${index}`} className="flex items-start gap-2 text-xs">
                          <Paperclip size={13} className="mt-0.5 shrink-0 opacity-65" />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{item.name}</p>
                            <p className="mt-0.5 opacity-60">{humanBytes(item.size)} · {item.status === 'understood' ? 'ready' : item.status.replace('-', ' ')}</p>
                            {item.note ? <p className="mt-1 opacity-65">{item.note}</p> : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {turn.image ? (
                    <div className="mt-4 overflow-hidden rounded-[22px] border border-[#ECECEC] bg-[#FAFAFA]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={turn.image.dataUrl} alt="Generated by Ask Glow" className="h-auto w-full object-contain" />
                      <div className="flex items-center justify-between gap-3 border-t border-[#ECECEC] px-3 py-2.5">
                        <span className="text-xs text-[#6E6E73]">Generated inline by Ask Glow</span>
                        <a href={turn.image.dataUrl} download={`glow-creation-${Date.now()}.${turn.image.mediaType.includes('jpeg') ? 'jpg' : 'png'}`} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-[#ECECEC] bg-white px-3 text-xs font-semibold">
                          <ArrowDownToLine size={13} /> Download
                        </a>
                      </div>
                    </div>
                  ) : null}
                </div>
                {turn.meta ? <p className="mt-1.5 px-1 text-[11px] text-[#6E6E73]">{turn.meta}</p> : null}
              </article>
            ))}

            {pending ? (
              <div className="mr-auto flex max-w-[90%] items-center gap-3 rounded-[24px] border border-[#ECECEC] bg-[#FAFAFA] px-4 py-3 text-sm text-[#6E6E73]">
                <GlowAuraMark state="understanding" world="Create" size="compact" />
                <span>{status || 'Shakti is understanding…'}</span>
              </div>
            ) : null}

            {proposal ? (
              <div className="mr-auto max-w-[94%] rounded-[26px] border border-[#ECECEC] bg-[#FAFAFA] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold"><Check size={15} /> Review before Glow acts</div>
                <p className="mt-1 text-xs leading-5 text-[#6E6E73]">Nothing changes until you approve.</p>
                {proposal.actions.length ? (
                  <div className="mt-3 space-y-2">
                    {proposal.actions.map((action, index) => (
                      <div key={`${action.type}-${index}`} className="rounded-[18px] border border-[#ECECEC] bg-white px-3 py-2.5 text-xs">
                        <p className="font-semibold">{action.title}</p>
                        <p className="mt-1 text-[#6E6E73]">{action.type}{action.destinations.length ? ` · ${action.destinations.join(', ')}` : ''}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button type="button" onClick={cancelProposal} disabled={pending} className="min-h-11 rounded-full border border-[#ECECEC] bg-white text-sm font-semibold disabled:opacity-50">Cancel</button>
                  <button type="button" onClick={() => void approveProposal()} disabled={pending} className="min-h-11 rounded-full bg-[#1C1C1E] text-sm font-semibold text-white disabled:opacity-50">Approve</button>
                </div>
              </div>
            ) : null}
            <div ref={conversationEndRef} />
          </div>
        </section>

        <section className="sticky bottom-0 z-20 mx-auto w-full max-w-3xl pb-1" aria-label="Ask Glow composer">
          <div className="relative rounded-[28px] border border-[#E4E4E6] bg-white/95 p-2.5 shadow-[0_20px_60px_rgba(28,28,30,.12),inset_0_1px_0_rgba(255,255,255,.9)] backdrop-blur-2xl">
            {attachments.length ? (
              <div className="mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
                {attachments.map((item) => (
                  <div key={item.id} className="relative flex min-w-[152px] max-w-[220px] items-center gap-2 rounded-[18px] border border-[#ECECEC] bg-[#FAFAFA] p-2 pr-8">
                    {item.previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.previewUrl} alt="" className="h-10 w-10 shrink-0 rounded-[12px] object-cover" />
                    ) : (
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white text-[#6E6E73]">{iconFor(item.file)}</div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold">{item.file.name}</p>
                      <p className="mt-0.5 text-[11px] text-[#6E6E73]">{humanBytes(item.file.size)}</p>
                    </div>
                    <button type="button" onClick={() => removeAttachment(item.id)} className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-white text-[#6E6E73]" aria-label={`Remove ${item.file.name}`}>
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onPaste={onPaste}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  void send();
                }
              }}
              placeholder="Ask Glow anything…"
              className="block min-h-14 w-full resize-none bg-transparent px-3 py-3 text-[16px] leading-6 text-[#1C1C1E] outline-none placeholder:text-[#9A9A9E]"
              aria-label="Message Ask Glow"
            />

            {status && !pending ? <div role="status" className="mx-2 mb-2 rounded-[14px] bg-[#FAFAFA] px-3 py-2 text-xs leading-5 text-[#6E6E73]">{status}</div> : null}

            <div className="flex items-center gap-2 px-1 pb-0.5">
              <div className="relative">
                <button type="button" onClick={() => setAttachmentMenu((current) => !current)} className="grid h-11 w-11 place-items-center rounded-full border border-[#ECECEC] bg-white" aria-label="Attach to Ask Glow" aria-expanded={attachmentMenu}>
                  {attachmentMenu ? <X size={17} /> : <Plus size={19} />}
                </button>
                {attachmentMenu ? (
                  <div className="absolute bottom-13 left-0 z-40 w-64 rounded-[22px] border border-[#ECECEC] bg-white p-2 shadow-[0_18px_60px_rgba(28,28,30,.16)]">
                    <button type="button" onClick={() => cameraInputRef.current?.click()} className="flex min-h-11 w-full items-center gap-3 rounded-[15px] px-3 text-left text-sm hover:bg-[#FAFAFA]"><Camera size={16} /> Take photo</button>
                    <button type="button" onClick={() => photoInputRef.current?.click()} className="flex min-h-11 w-full items-center gap-3 rounded-[15px] px-3 text-left text-sm hover:bg-[#FAFAFA]"><ImageIcon size={16} /> Choose photos</button>
                    <button type="button" onClick={() => cameraVideoInputRef.current?.click()} className="flex min-h-11 w-full items-center gap-3 rounded-[15px] px-3 text-left text-sm hover:bg-[#FAFAFA]"><Video size={16} /> Record video</button>
                    <button type="button" onClick={() => videoInputRef.current?.click()} className="flex min-h-11 w-full items-center gap-3 rounded-[15px] px-3 text-left text-sm hover:bg-[#FAFAFA]"><Video size={16} /> Choose video</button>
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="flex min-h-11 w-full items-center gap-3 rounded-[15px] px-3 text-left text-sm hover:bg-[#FAFAFA]"><Paperclip size={16} /> Files & audio</button>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => void startListening()}
                className={`grid h-11 w-11 place-items-center rounded-full border transition ${recording ? 'border-[#1C1C1E] bg-[#1C1C1E] text-white shadow-[0_0_0_6px_rgba(184,111,125,.12)]' : 'border-[#ECECEC] bg-white text-[#1C1C1E]'}`}
                aria-label={recording ? 'Stop recording and send to Ask Glow' : 'Talk to Ask Glow'}
                aria-pressed={recording}
              >
                {recording ? <Square size={14} fill="currentColor" /> : <Mic size={17} />}
              </button>

              <div className="min-w-0 flex-1" />
              {isVisualCreationRequest(input) ? <span className="hidden items-center gap-1.5 text-xs text-[#6E6E73] sm:inline-flex"><Sparkles size={13} /> Visual creation</span> : null}
              <button
                type="button"
                onClick={() => void send()}
                disabled={(!input.trim() && attachments.length === 0) || pending || Boolean(proposal) || recording}
                className="grid h-11 w-11 place-items-center rounded-full bg-[#1C1C1E] text-white transition disabled:opacity-30"
                aria-label="Send to Ask Glow"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
          <p className="mt-2 px-3 text-center text-[11px] leading-4 text-[#6E6E73]">Type, talk, paste, drag, or attach. Glow keeps conversation context across rooms. Large media may be processed in parts rather than silently rejected.</p>
        </section>
      </div>

      <input ref={fileInputRef} type="file" accept={ACCEPTED_FILES} multiple className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = ''; }} />
      <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = ''; }} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = ''; }} />
      <input ref={videoInputRef} type="file" accept="video/*" multiple className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = ''; }} />
      <input ref={cameraVideoInputRef} type="file" accept="video/*" capture="environment" className="hidden" onChange={(event) => { if (event.target.files) addFiles(event.target.files); event.currentTarget.value = ''; }} />
    </main>
  );
}
