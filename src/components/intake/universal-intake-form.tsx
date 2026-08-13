'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { CheckCircle2, FileText, LoaderCircle, Route, Sparkles, UploadCloud, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

const MAX_FILE_BYTES = 3 * 1024 * 1024;
type IntakeState = { status: 'idle' | 'success' | 'error'; message: string };
type IntakeClassification = { type: string; title: string; confidence: number; destinations: string[] };

export function UniversalIntakeForm() {
  const [state, setState] = useState<IntakeState>({ status: 'idle', message: '' });
  const [classification, setClassification] = useState<IntakeClassification | null>(null);
  const [pending, setPending] = useState(false);
  const [selected, setSelected] = useState<File | null>(null);
  const [clientError, setClientError] = useState('');
  const formRef = useRef<HTMLFormElement>(null);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setClientError('');
    setState({ status: 'idle', message: '' });
    setClassification(null);
    if (file && file.size > MAX_FILE_BYTES) {
      setSelected(null);
      event.target.value = '';
      setClientError(`${file.name} is larger than 3 MB. Choose a smaller file for Universal Intake.`);
      return;
    }
    setSelected(file);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || clientError) return;
    const data = new FormData(event.currentTarget);
    data.set('sourceRoute', '/intake');
    const text = String(data.get('text') ?? '').trim();
    const file = data.get('file');
    if (!text && (!(file instanceof File) || file.size === 0)) {
      setState({ status: 'error', message: 'Choose a file or paste something before sending it to Glow.' });
      return;
    }
    setPending(true);
    setState({ status: 'idle', message: '' });
    setClassification(null);
    try {
      const response = await fetch('/api/intake', { method: 'POST', body: data, credentials: 'same-origin' });
      const payload = await response.json().catch(() => ({ ok: false, message: 'Glow could not read the upload response.' })) as { ok?: boolean; message?: string; classification?: IntakeClassification };
      if (!response.ok || !payload.ok) throw new Error(payload.message || `Upload failed (${response.status}).`);
      setState({ status: 'success', message: payload.message || 'Added to Glow Inbox.' });
      setClassification(payload.classification ?? null);
      formRef.current?.reset();
      setSelected(null);
      setClientError('');
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Glow could not save that item.' });
    } finally {
      setPending(false);
    }
  }

  return (
    <Card className="p-6">
      <form ref={formRef} onSubmit={submit} encType="multipart/form-data" className="space-y-4">
        <div className="flex items-center gap-1.5 text-[#C9727E]"><Sparkles size={13} /><p className="glow-eyebrow">Add Anything</p></div>

        <textarea
          name="text"
          rows={6}
          placeholder="Paste anything here… a reminder, schedule, appointment, shopping list, project idea, receipt text, link, or brain dump."
          className="w-full resize-none rounded-[16px] border border-[#F1E7E3] bg-[#FDF8F6] p-4 text-[12.5px] leading-5 text-[#2B2420] outline-none placeholder:text-[#B5ACA5] focus:border-[#C9727E]"
        />

        <div className="flex items-center gap-3 text-[10px] uppercase tracking-[.15em] text-[#B5ACA5]"><span className="h-px flex-1 bg-[#F1E7E3]" />or upload<span className="h-px flex-1 bg-[#F1E7E3]" /></div>

        <label className="flex cursor-pointer flex-col items-center justify-center rounded-[16px] border border-dashed border-[#E5D5CD] bg-[#FDF8F6] px-5 py-8 text-center transition hover:bg-[#FBE4E8]">
          <UploadCloud className="text-[#C9727E]" />
          <span className="mt-2 text-[13px] font-medium text-[#2B2420]">{selected ? 'Change file' : 'Choose a file'}</span>
          <span className="mt-1 text-[10.5px] leading-4 text-[#8A8078]">Photos, screenshots, PDFs, documents, CSV/spreadsheets, text and JSON · up to 3 MB</span>
          <input
            name="file"
            type="file"
            className="sr-only"
            onChange={onFileChange}
            accept="image/*,.pdf,.txt,.csv,.xls,.xlsx,.numbers,.json,.md,.doc,.docx,.rtf,.pages,text/*,application/pdf,application/json,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          />
        </label>

        {selected ? (
          <div className="flex items-center gap-3 rounded-[14px] bg-[#E4EBDD] px-3.5 py-3">
            <FileText size={16} className="shrink-0 text-[#5A6E52]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-medium text-[#2B2420]">{selected.name}</p>
              <p className="mt-0.5 text-[10px] text-[#6E8064]">{(selected.size / 1024).toFixed(selected.size > 1024 * 1024 ? 0 : 1)} KB selected and ready to upload</p>
            </div>
            <CheckCircle2 size={16} className="shrink-0 text-[#5A6E52]" />
          </div>
        ) : null}

        <input name="note" placeholder="Optional: tell Glow what this is or why it matters" className="w-full rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] px-3.5 py-2.5 text-[11.5px] text-[#2B2420] outline-none placeholder:text-[#B5ACA5] focus:border-[#C9727E]" />

        {clientError ? (
          <div role="alert" className="flex items-start gap-2 rounded-[12px] bg-[#FDF3F2] px-3.5 py-2.5 text-[11px] leading-4 text-[#B15A68]"><XCircle size={13} className="mt-0.5 shrink-0" />{clientError}</div>
        ) : null}
        {state.message ? (
          <div role="status" className={`flex items-start gap-2 rounded-[12px] px-3.5 py-2.5 text-[11px] leading-4 ${state.status === 'success' ? 'bg-[#E4EBDD] text-[#5A6E52]' : 'bg-[#FDF3F2] text-[#B15A68]'}`}>
            {state.status === 'success' ? <CheckCircle2 size={13} className="mt-0.5 shrink-0" /> : <XCircle size={13} className="mt-0.5 shrink-0" />}
            {state.message}
          </div>
        ) : null}

        {classification ? (
          <div className="rounded-[16px] border border-[#F1E7E3] bg-[#FDF8F6] p-4">
            <div className="flex items-start gap-3">
              <Route size={16} className="mt-0.5 shrink-0 text-[#C9727E]" />
              <div className="min-w-0 flex-1">
                <p className="glow-eyebrow">Glow understood this as {classification.type}</p>
                <p className="mt-1 truncate text-[13px] font-medium text-[#2B2420]">{classification.title}</p>
                <p className="mt-1 text-[10.5px] text-[#9A9088]">{Math.round(classification.confidence * 100)}% confidence · proposed destinations</p>
                <div className="mt-2 flex flex-wrap gap-1">{classification.destinations.map((destination) => <span key={destination} className="rounded-full bg-[#FBE4E8] px-2.5 py-1 text-[10px] text-[#B15A68]">{destination}</span>)}</div>
              </div>
            </div>
            <Link href="/inbox" className="mt-3 flex w-full items-center justify-center rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2.5 text-[11px] font-medium text-[#4A4440] transition hover:border-[#C9727E] hover:text-[#B15A68]">Review + approve routing in Glow Inbox →</Link>
          </div>
        ) : null}

        <button disabled={pending || Boolean(clientError)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2B2420] py-3 text-[12px] font-medium text-white transition hover:bg-[#B15A68] disabled:cursor-not-allowed disabled:opacity-50" type="submit">
          {pending ? <><LoaderCircle size={14} className="animate-spin" />Uploading + understanding…</> : <>Understand + Send to Glow Inbox</>}
        </button>
        <p className="text-center text-[10.5px] leading-4 text-[#B5ACA5]">Glow proposes destinations first. Review and approve routing in Inbox before information is written into other systems.</p>
      </form>
    </Card>
  );
}
