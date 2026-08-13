'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Camera, Link2, Mic, NotebookPen } from 'lucide-react';
import { useServerAction } from '@/lib/hooks/use-server-action';
import { createNoteAction } from '@/app/actions/notes';
import type { Note } from '@/lib/types';

export function BrainQuickCapture({ onCaptured }: { onCaptured?: (note: Note) => void }) {
  const [thought, setThought] = useState('');
  const capture = useServerAction(createNoteAction);

  function submit() {
    const text = thought.trim();
    if (!text) return;
    const title = text.split('\n')[0].slice(0, 80) || `Thought · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    capture.run({ title, content: text, pinned: false }, (saved) => {
      if (saved) onCaptured?.(saved);
      setThought('');
    });
  }

  return (
    <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-medium text-[#2B2420]">Quick Capture</p>
      </div>
      <textarea
        value={thought}
        onChange={(event) => setThought(event.target.value)}
        rows={3}
        placeholder="Capture a thought, idea, task, or inspiration…"
        className="mt-2.5 w-full resize-none rounded-lg border border-[#F1E7E3] px-3 py-2.5 text-[12.5px] text-[#2B2420] placeholder:text-[#B5ACA5] outline-none focus:border-[#C9727E]"
      />
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button type="button" onClick={submit} disabled={!thought.trim() || capture.isPending} className="flex flex-col items-center gap-1 text-[#8A8078] hover:text-[#C9727E] disabled:opacity-40">
            <NotebookPen size={16} /><span className="text-[9.5px] font-medium">Note</span>
          </button>
          <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:voice-open'))} className="flex flex-col items-center gap-1 text-[#8A8078] hover:text-[#C9727E]">
            <Mic size={16} /><span className="text-[9.5px] font-medium">Voice</span>
          </button>
          <Link href="/intake" className="flex flex-col items-center gap-1 text-[#8A8078] hover:text-[#C9727E]">
            <Camera size={16} /><span className="text-[9.5px] font-medium">Photo</span>
          </Link>
          <Link href="/intake" className="flex flex-col items-center gap-1 text-[#8A8078] hover:text-[#C9727E]">
            <Link2 size={16} /><span className="text-[9.5px] font-medium">Link</span>
          </Link>
        </div>
        {capture.isPending ? <span className="text-[10px] text-[#B5ACA5]">Saving…</span> : null}
      </div>
      {capture.error ? <p className="mt-2 text-[10.5px] text-[#B15A68]">{capture.error}</p> : null}
    </div>
  );
}
