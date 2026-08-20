'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { CheckCircle2, FileImage, Inbox, Paperclip, Plus, Send, Sparkles, X, XCircle } from 'lucide-react';

const MAX_FILE_BYTES = 3 * 1024 * 1024;
type IntakeState = { status: 'idle' | 'success' | 'error'; message: string };

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function UniversalCaptureDock() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<{ name: string; size: number } | null>(null);
  const [clientError, setClientError] = useState('');
  const [state, setState] = useState<IntakeState>({ status: 'idle', message: '' });
  const [pending, setPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setClientError('');
    setState({ status: 'idle', message: '' });
    if (file && file.size > MAX_FILE_BYTES) {
      setSelected(null);
      event.target.value = '';
      setClientError(`${file.name} is larger than 3 MB. Choose a smaller file so Glow can safely understand it.`);
      return;
    }
    setSelected(file ? { name: file.name, size: file.size } : null);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || clientError) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    const text = String(data.get('text') ?? '').trim();
    const file = data.get('file');
    if (!text && (!(file instanceof File) || file.size === 0)) {
      setState({ status: 'error', message: 'Choose a photo/file or type something first.' });
      return;
    }
    setPending(true);
    setState({ status: 'idle', message: '' });
    try {
      const response = await fetch('/api/intake', { method: 'POST', body: data, credentials: 'same-origin' });
      const payload = await response.json().catch(() => ({ ok: false, message: 'Glow could not read the upload response.' })) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) throw new Error(payload.message || `Upload failed (${response.status}).`);
      setState({ status: 'success', message: payload.message || 'Added to Glow.' });
      formRef.current?.reset();
      setSelected(null);
      setClientError('');
      router.refresh();
    } catch (error) {
      setState({ status: 'error', message: error instanceof Error ? error.message : 'Glow could not save that item. Please try again.' });
    } finally { setPending(false); }
  }

  return (
    <div className="glow-capture-dock fixed bottom-4 left-4 z-[80] flex max-w-[calc(100vw-2rem)] flex-col items-start gap-2 sm:bottom-5 sm:left-5">
      {open ? (
        <div className="glow-capture-panel w-[min(410px,calc(100vw-2rem))] overflow-hidden rounded-[20px] border border-[#F1E7E3] bg-white shadow-[0_24px_70px_rgba(66,45,38,.18)]">
          <div className="flex items-start justify-between gap-3 border-b border-[#F1E7E3] bg-[linear-gradient(120deg,#FBE4E8,#FDF8F6)] px-4 py-3.5">
            <div>
              <div className="flex items-center gap-1.5 text-[#C9727E]"><Sparkles size={13} /><p className="text-[10px] font-semibold uppercase tracking-[.12em]">Add Anything · From {pathname === '/' ? 'Dashboard' : pathname.replace('/', '')}</p></div>
              <p className="glow-display mt-1 text-[18px] text-[#2B2420]">Send it to Glow once.</p>
              <p className="mt-1 text-[11px] leading-4 text-[#8A8078]">Text, photo, screenshot, PDF, receipt, recipe, outfit, reminder, schedule or file. Glow analyzes it and proposes where it belongs.</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Add Anything" className="rounded-full border border-[#F1E7E3] bg-white p-1.5 text-[#8A8078] hover:bg-[#FDF8F6]"><X size={14} /></button>
          </div>
          <form ref={formRef} onSubmit={submit} className="space-y-3 p-4" encType="multipart/form-data">
            <input type="hidden" name="sourceRoute" value={pathname} />
            <textarea name="text" rows={3} placeholder="Paste or type anything…" className="w-full resize-none rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] px-3 py-2.5 text-[12px] text-[#2B2420] outline-none placeholder:text-[#B5ACA5] focus:border-[#C9727E]" />
            <label className="flex cursor-pointer items-center gap-3 rounded-[14px] border border-dashed border-[#F1E7E3] bg-[#FDF8F6] px-3 py-3 transition hover:bg-[#FBE4E8]">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-white text-[#C9727E]"><FileImage size={16} /></div>
              <div className="min-w-0 flex-1"><p className="truncate text-[11.5px] font-medium text-[#2B2420]">{selected?.name ?? 'Choose photo or file'}</p><p className="mt-0.5 text-[10px] text-[#B5ACA5]">{selected ? `${formatBytes(selected.size)} selected and ready` : 'Images, PDFs, text, CSV, JSON and more · up to 3 MB'}</p></div>
              {selected ? <CheckCircle2 size={14} className="text-[#5A6E52]" /> : <Paperclip size={14} className="text-[#8A8078]" />}
              <input name="file" type="file" className="sr-only" onChange={onFileChange} accept="image/*,.pdf,.txt,.csv,.json,.md,audio/*,video/*,application/*" />
            </label>
            <input name="note" placeholder="Optional context: what is this or why does it matter?" className="w-full rounded-[14px] border border-[#F1E7E3] bg-[#FDF8F6] px-3 py-2.5 text-[11.5px] text-[#2B2420] outline-none placeholder:text-[#B5ACA5] focus:border-[#C9727E]" />
            {clientError ? <div role="alert" className="flex items-start gap-2 rounded-[12px] bg-[#FDF3F2] px-3 py-2 text-[11px] leading-4 text-[#B15A68]"><XCircle size={12} className="mt-0.5 shrink-0" />{clientError}</div> : null}
            {state.status !== 'idle' ? <div role="status" className={`flex items-start gap-2 rounded-[12px] px-3 py-2 text-[11px] leading-4 ${state.status === 'success' ? 'bg-[#E4EBDD] text-[#5A6E52]' : 'bg-[#FDF3F2] text-[#B15A68]'}`}>{state.status === 'success' ? <CheckCircle2 size={12} className="mt-0.5 shrink-0" /> : <XCircle size={12} className="mt-0.5 shrink-0" />}{state.message}</div> : null}
            <button type="submit" disabled={pending || Boolean(clientError)} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2B2420] px-4 py-3 text-[12px] font-medium text-white transition hover:bg-[#B15A68] disabled:cursor-wait disabled:opacity-60"><Send size={12} />{pending ? 'Uploading + understanding…' : 'Understand + send to Glow Inbox'}</button>
            <div className="flex items-center justify-between gap-2 border-t border-[#F1E7E3] pt-3"><Link href="/intake" className="text-[11px] font-medium text-[#C9727E]">Open full Intake</Link><Link href="/inbox" className="inline-flex items-center gap-1 text-[11px] font-medium text-[#8A8078]"><Inbox size={10} />Glow Inbox</Link></div>
          </form>
        </div>
      ) : null}
      <button type="button" onClick={() => setOpen((current) => !current)} className="glow-capture-fab group inline-flex items-center gap-2 rounded-full border border-white/70 bg-[#C9727E] px-4 py-3 text-[12px] font-medium text-white shadow-[0_14px_38px_rgba(121,70,76,.2)] transition hover:-translate-y-0.5 hover:bg-[#B15A68]" aria-expanded={open} aria-label="Add anything to Glow OS"><Plus size={14} /><span>Add Anything</span><Sparkles size={11} className="opacity-80" /></button>
    </div>
  );
}
