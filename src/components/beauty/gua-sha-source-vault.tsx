'use client';

import { useState } from 'react';
import { ExternalLink, FileText, Sparkles, Video } from 'lucide-react';

type Source = { id:number; code:string; url:string };

const SOURCES: Source[] = [
  { id:1, code:'ZP8WThCrD', url:'https://www.tiktok.com/t/ZP8WThCrD/' },
  { id:2, code:'ZP8WTS7Vc', url:'https://www.tiktok.com/t/ZP8WTS7Vc/' },
  { id:3, code:'ZP8WTYMoT', url:'https://www.tiktok.com/t/ZP8WTYMoT/' },
  { id:4, code:'ZP8WTSQ5f', url:'https://www.tiktok.com/t/ZP8WTSQ5f/' },
  { id:5, code:'ZP8WTrDpr', url:'https://www.tiktok.com/t/ZP8WTrDpr/' },
  { id:6, code:'ZP8WTxgAf', url:'https://www.tiktok.com/t/ZP8WTxgAf/' },
  { id:7, code:'ZP8WTPe69', url:'https://www.tiktok.com/t/ZP8WTPe69/' },
  { id:8, code:'ZP8WTHpuq', url:'https://www.tiktok.com/t/ZP8WTHpuq/' },
  { id:9, code:'ZP8WT5pFM', url:'https://www.tiktok.com/t/ZP8WT5pFM/' },
  { id:10, code:'ZP8WT5ttU', url:'https://www.tiktok.com/t/ZP8WT5ttU/' },
  { id:11, code:'ZP8WTYCFK', url:'https://www.tiktok.com/t/ZP8WTYCFK/' },
  { id:12, code:'ZP8WTX2q3', url:'https://www.tiktok.com/t/ZP8WTX2q3/' },
  { id:13, code:'ZP8WT6H5u', url:'https://www.tiktok.com/t/ZP8WT6H5u/' },
  { id:14, code:'ZP8WTUC9b', url:'https://www.tiktok.com/t/ZP8WTUC9b/' },
];

const FIELDS = [
  ['Action','What the creator actually tells you to do.'],
  ['Face area','Neck, jaw, cheek, under-eye, brow, forehead, scalp, collarbone, or another named area.'],
  ['Direction','Exact start point → end point, including outward/upward/downward direction.'],
  ['Repetitions','Exact count, passes, sets, or “repeat until” rule.'],
  ['Tool position','Edge/notch used, angle, flatness, hand placement, and stabilizing hand.'],
  ['Pressure','Feather-light, light, medium only if explicitly stated and appropriate.'],
  ['Prep','Oil/serum/slip, clean skin, tool temperature, or other setup instruction.'],
  ['Timing','Seconds per pass, area, side, or total routine.'],
  ['Side logic','Left/right order and whether a step repeats on both sides.'],
  ['Warning','Anything the creator says to avoid or stop doing.'],
  ['Purpose','What the creator says the technique is intended to accomplish, kept separate from medical claims.'],
  ['Glow cue','A short spoken instruction Glow can read while your hands are busy.'],
  ['Visual guide','Arrow/face-map placement Glow can show for the movement.'],
  ['Automation','Whether the sentence becomes a timer, repetition counter, reminder, routine condition, preference, or reusable step.'],
] as const;

export function GuaShaSourceVault(){
  const [selected,setSelected]=useState(1);
  const source=SOURCES.find(item=>item.id===selected) ?? SOURCES[0];

  return <section className="space-y-5 rounded-[30px] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(72,51,69,.05)] sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2"><Video size={15} className="text-[#8d6f84]"/><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#9a8794]">Complete Gua Sha source vault</p></div>
        <h2 className="mt-2 font-serif text-3xl text-[#352d34]">14 videos, kept separate and traceable</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[#786c75]">Each TikTok stays attached to its own future transcript and technique set. Glow should never blend creator-specific instructions together until the exact wording has been reviewed.</p>
      </div>
      <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#e4d9e2] px-4 py-2.5 text-xs text-[#675b64]">Open selected source <ExternalLink size={12}/></a>
    </div>

    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {SOURCES.map(item=><button type="button" key={item.id} onClick={()=>setSelected(item.id)} className={`rounded-[18px] border p-4 text-left transition ${selected===item.id?'border-[#bba5b6] bg-[#f3e9f0]':'border-[#ece3e9] bg-[#fbf9fa]'}`}>
        <div className="flex items-center justify-between gap-2"><strong className="text-sm text-[#433941]">Video {item.id}</strong><span className="rounded-full bg-[#fff3dd] px-2 py-1 text-[9px] font-medium text-[#8c692b]">Transcript needed</span></div>
        <p className="mt-2 font-mono text-[10px] text-[#8f818b]">{item.code}</p>
      </button>)}
    </div>

    <div className="rounded-[22px] bg-[#faf6f8] p-5">
      <div className="flex items-start gap-3"><FileText size={16} className="mt-0.5 shrink-0 text-[#8e7188]"/><div><p className="text-sm font-medium text-[#4c414a]">Sentence-by-sentence conversion blueprint</p><p className="mt-1 text-xs leading-5 text-[#786c75]">When a transcript is available, Glow should create one evidence-linked record per meaningful sentence or demonstration cue, then map it into the fields below. Contradictory advice stays separated by source rather than silently merged.</p></div></div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{FIELDS.map(([label,description])=><div key={label} className="rounded-[16px] border border-white bg-white p-3"><div className="flex items-center gap-2"><Sparkles size={11} className="text-[#9a7d91]"/><strong className="text-xs text-[#50444d]">{label}</strong></div><p className="mt-1.5 text-[11px] leading-4 text-[#81757e]">{description}</p></div>)}</div>
    </div>

    <div className="rounded-[20px] border border-[#ead7aa] bg-[#fffaf0] p-4 text-xs leading-5 text-[#786851]">
      <strong className="text-[#54452f]">Why the transcripts are still required:</strong> these TikTok short links do not expose their audio or captions to Glow’s web fetch. The source URLs are saved now, but creator-specific steps remain intentionally unfilled rather than guessed.
    </div>
  </section>
}
