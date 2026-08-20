'use client';

import { useEffect, useMemo, useState } from 'react';
import { HardDrive, Play, RefreshCw, Trash2 } from 'lucide-react';
import type { Note } from '@/lib/types';
import {
  buildRecordingBlob,
  deleteRecording,
  formatDuration,
  listRecordingMetas,
  localStorageEstimate,
  type RecordingMeta,
} from '@/lib/notes/listener-engine';

function bytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return '0 MB';
  const mb = value / 1024 / 1024;
  if (mb < 1024) return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  return `${(mb / 1024).toFixed(1)} GB`;
}

function duration(meta: RecordingMeta) {
  const end = meta.endedAt ?? Date.now();
  return Math.max(0, Math.floor((end - meta.startedAt) / 1000));
}

export function NotesLocalRecoveryPanel({ notes }: { notes: Note[] }) {
  const [sessions, setSessions] = useState<RecordingMeta[]>([]);
  const [storage, setStorage] = useState<{ usage: number; quota: number; remaining: number } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const noteTitles = useMemo(() => new Set(notes.map((note) => note.title)), [notes]);

  async function refresh() {
    try {
      const [rows, estimate] = await Promise.all([listRecordingMetas(), localStorageEstimate()]);
      setSessions(rows);
      setStorage(estimate);
    } catch {
      setNotice('Local recording storage could not be read on this device.');
    }
  }

  useEffect(() => { void refresh(); }, []);
  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(''), 4500);
    return () => window.clearTimeout(id);
  }, [notice]);

  async function play(meta: RecordingMeta) {
    setBusyId(meta.id);
    try {
      const blob = await buildRecordingBlob(meta.id, meta.mimeType);
      if (!blob.size) { setNotice('No saved audio chunks were found for this session.'); return; }
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => URL.revokeObjectURL(url);
      audio.onerror = () => { URL.revokeObjectURL(url); setNotice('This browser could not play that locally stored recording format.'); };
      await audio.play();
    } catch {
      setNotice('Glow could not rebuild that local recording. The Smart Note transcript, if saved, is unaffected.');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(meta: RecordingMeta) {
    if (!window.confirm(`Delete the local audio for “${meta.title}”? This does not delete a saved Smart Note.`)) return;
    setBusyId(meta.id);
    try {
      await deleteRecording(meta.id);
      setSessions((current) => current.filter((row) => row.id !== meta.id));
      setStorage(await localStorageEstimate());
      setNotice('Local audio removed. Any saved Smart Note remains in Glow.');
    } catch {
      setNotice('Glow could not remove that local recording.');
    } finally {
      setBusyId(null);
    }
  }

  return <section className="rounded-[30px] border border-[#e8e2d9] bg-white/75 p-5 shadow-[0_20px_70px_rgba(76,63,52,.05)]">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#9a9086]">Local Recordings & Recovery</p>
        <h2 className="mt-2 font-serif text-3xl tracking-[-.03em] text-[#37312d]">Your device-side audio vault</h2>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-[#81776f]">Long recordings are chunked locally. This recovery area lets you find them again after a refresh. Audio is still device-local until server media storage is added.</p>
      </div>
      <button type="button" onClick={() => void refresh()} className="rounded-full border border-[#e6dfd6] bg-white px-3 py-2 text-[10px] text-[#675f58]"><RefreshCw size={12} className="mr-1 inline"/>Refresh</button>
    </div>

    {storage ? <div className="mt-4 grid gap-2 sm:grid-cols-3"><div className="rounded-[18px] bg-[#faf7f2] p-3 text-xs"><HardDrive size={13} className="mb-2"/>Used<br/><b>{bytes(storage.usage)}</b></div><div className="rounded-[18px] bg-[#f2f5ee] p-3 text-xs">Available estimate<br/><b>{bytes(storage.remaining)}</b></div><div className="rounded-[18px] bg-[#f7f3f8] p-3 text-xs">Browser quota<br/><b>{bytes(storage.quota)}</b></div></div> : null}

    <div className="mt-4 space-y-2">
      {sessions.length ? sessions.slice(0, 12).map((meta) => {
        const linked = noteTitles.has(meta.title);
        const unfinished = !meta.endedAt;
        return <div key={meta.id} className="rounded-[20px] border border-[#ece5dc] bg-[#fffdf9] p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><p className="break-words text-sm font-medium text-[#3e3834]">{meta.title}</p>{unfinished ? <span className="rounded-full bg-[#f8e8e6] px-2 py-1 text-[9px] text-[#9b5f62]">Interrupted / unfinished</span> : <span className="rounded-full bg-[#edf3e9] px-2 py-1 text-[9px] text-[#64745f]">Saved locally</span>}{linked ? <span className="rounded-full bg-[#f3eef5] px-2 py-1 text-[9px] text-[#75677c]">Matching Smart Note exists</span> : null}</div>
              <p className="mt-1 break-words text-[10px] text-[#948a81]">{meta.type} · {formatDuration(duration(meta))} · {meta.chunkCount} saved chunk{meta.chunkCount === 1 ? '' : 's'} · {new Date(meta.startedAt).toLocaleString()}</p>
            </div>
            <div className="flex flex-wrap gap-2"><button type="button" disabled={busyId === meta.id || meta.chunkCount === 0} onClick={() => void play(meta)} className="rounded-full border px-3 py-2 text-[10px] disabled:opacity-40"><Play size={11} className="mr-1 inline"/>Play</button><button type="button" disabled={busyId === meta.id} onClick={() => void remove(meta)} className="rounded-full border px-3 py-2 text-[10px] text-[#98656a] disabled:opacity-40"><Trash2 size={11} className="mr-1 inline"/>Delete audio</button></div>
          </div>
          {unfinished ? <p className="mt-3 rounded-[14px] bg-[#fbf5ee] p-3 text-[10px] leading-5 text-[#826f61]">Glow found audio chunks from a session that did not receive a normal Finish timestamp. The saved chunks can still be replayed. The transcript may be incomplete if the page closed before it was saved as a Smart Note.</p> : null}
        </div>;
      }) : <div className="rounded-[20px] border border-dashed p-6 text-center text-xs text-[#948a81]">No local recordings are stored on this device yet.</div>}
    </div>
    {sessions.length > 12 ? <p className="mt-3 text-[10px] text-[#948a81]">Showing the 12 most recent local recordings. Older recordings remain stored locally.</p> : null}
    {notice ? <div role="status" className="mt-3 rounded-[16px] bg-[#f8f4ef] px-3 py-2 text-[10px] text-[#756b63]">{notice}</div> : null}
  </section>;
}
