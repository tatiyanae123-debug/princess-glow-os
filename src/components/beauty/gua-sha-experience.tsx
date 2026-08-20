'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Clock3, ExternalLink, Pause, Play, RotateCcw, Sparkles, Volume2, Video, FileText, WandSparkles } from 'lucide-react';

type Mode = 'Quick' | 'Full' | 'Slow';
type Side = 'Left' | 'Right';
type SourceId = 'source-1' | 'source-2' | 'source-3' | 'source-4';
type Step = { title:string; area:string; seconds:number; instruction:string; cue:string; why:string };
type Source = { id:SourceId; label:string; url:string; status:'verified-base'|'awaiting-transcript'; note:string };

const SOURCES: Source[] = [
  { id:'source-1', label:'Video 1', url:'https://www.tiktok.com/t/ZP8WThCrD/', status:'verified-base', note:'Original Gua Sha source added first. The player uses the current conservative Glow technique sequence until exact transcript wording is available.' },
  { id:'source-2', label:'Video 2', url:'https://www.tiktok.com/t/ZP8WTS7Vc/', status:'awaiting-transcript', note:'Source saved. Exact spoken/written instructions will replace this placeholder after transcription.' },
  { id:'source-3', label:'Video 3', url:'https://www.tiktok.com/t/ZP8WTYMoT/', status:'awaiting-transcript', note:'Source saved. Exact spoken/written instructions will replace this placeholder after transcription.' },
  { id:'source-4', label:'Video 4', url:'https://www.tiktok.com/t/ZP8WTSQ5f/', status:'awaiting-transcript', note:'Source saved. Exact spoken/written instructions will replace this placeholder after transcription.' },
];

const BASE_STEPS: Step[] = [
  { title:'Prep your skin', area:'Face + neck', seconds:45, instruction:'Apply enough facial oil or another compatible slip product so the tool glides without tugging.', cue:'The skin should feel slippery, never dragged.', why:'Slip helps reduce friction while you move the tool across the skin.' },
  { title:'Open the collarbone area', area:'Collarbones', seconds:45, instruction:'Use very light, slow strokes across the upper chest and collarbone area. Keep the tool almost flat.', cue:'Light pressure only.', why:'This creates a gentle starting point before moving upward to the face.' },
  { title:'Sweep the side of the neck', area:'Neck', seconds:60, instruction:'Glide slowly along the side of the neck. Avoid pressing directly over the front of the throat.', cue:'Slow, comfortable strokes.', why:'The neck is treated gently before facial passes.' },
  { title:'Define the jaw path', area:'Jaw', seconds:75, instruction:'Place the tool near the center of the chin and glide outward toward the ear. Keep the tool low and nearly flat against the skin.', cue:'Center to outside.', why:'This follows the natural contour of the jaw without scraping aggressively.' },
  { title:'Lift across the cheek', area:'Cheek', seconds:75, instruction:'Start beside the nose and glide outward across the cheek toward the ear using gentle, even pressure.', cue:'Outward, not back and forth.', why:'A consistent outward pass is easier to repeat and track in a guided routine.' },
  { title:'Treat the under-eye delicately', area:'Under-eye', seconds:45, instruction:'If you choose to work near the under-eye, use extremely light pressure and stay on the bony orbital area rather than pressing into the eye.', cue:'Feather-light pressure.', why:'The skin around the eye is delicate and should never be scraped or pressed firmly.' },
  { title:'Sweep the brow area', area:'Brow', seconds:45, instruction:'Glide from the inner brow area toward the temple with light pressure.', cue:'Inner brow to temple.', why:'This gives the routine a consistent outward direction.' },
  { title:'Finish the forehead', area:'Forehead', seconds:60, instruction:'Start near the center of the forehead and glide outward toward the hairline or temples.', cue:'Keep the tool nearly flat.', why:'The forehead completes the facial sequence with slow outward passes.' },
  { title:'Finish gently', area:'Face + neck', seconds:30, instruction:'Stop, breathe, and notice how your skin feels. Wipe or wash the tool before storing it.', cue:'No pain, sharp tenderness, or bruising.', why:'A quick check-in helps Glow learn whether the routine felt comfortable for you.' },
];

const MODE_MULTIPLIER: Record<Mode, number> = { Quick:0.55, Full:1, Slow:1.45 };
function formatTime(seconds:number){const minutes=Math.floor(seconds/60);return `${minutes}:${String(seconds%60).padStart(2,'0')}`}

export function GuaShaExperience(){
  const [mode,setMode]=useState<Mode>('Full');
  const [side,setSide]=useState<Side>('Left');
  const [sourceId,setSourceId]=useState<SourceId>('source-1');
  const [index,setIndex]=useState(0);
  const [running,setRunning]=useState(false);
  const [secondsLeft,setSecondsLeft]=useState(BASE_STEPS[0].seconds);
  const [completed,setCompleted]=useState<number[]>([]);
  const [showWhy,setShowWhy]=useState(false);
  const [feeling,setFeeling]=useState<string|null>(null);
  const source=SOURCES.find(item=>item.id===sourceId)??SOURCES[0];
  const steps=useMemo(()=>BASE_STEPS.map(step=>({...step,seconds:Math.max(20,Math.round(step.seconds*MODE_MULTIPLIER[mode]))})),[mode]);
  const step=steps[index];
  const totalSeconds=steps.reduce((sum,item)=>sum+item.seconds,0);
  const progress=Math.round((completed.length/steps.length)*100);

  useEffect(()=>{setSecondsLeft(steps[index].seconds);setRunning(false);setShowWhy(false)},[index,steps]);
  useEffect(()=>{if(!running||secondsLeft<=0)return;const timer=window.setInterval(()=>setSecondsLeft(value=>Math.max(0,value-1)),1000);return()=>window.clearInterval(timer)},[running,secondsLeft]);
  useEffect(()=>{if(secondsLeft===0)setRunning(false)},[secondsLeft]);

  function speakStep(){if(!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(`${step.title}. ${step.instruction}. ${step.cue}`);utterance.rate=.92;window.speechSynthesis.speak(utterance)}
  function completeStep(){setCompleted(current=>current.includes(index)?current:[...current,index]);if(index<steps.length-1)setIndex(value=>value+1)}
  function resetRoutine(){setIndex(0);setCompleted([]);setRunning(false);setFeeling(null)}
  function selectSource(id:SourceId){setSourceId(id);resetRoutine()}

  return <div className="mx-auto max-w-6xl space-y-6 pb-16">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/beauty" className="inline-flex items-center gap-2 text-sm text-[#766773]"><ArrowLeft size={15}/>Beauty</Link>
      <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-[#eadfe7] bg-white px-4 py-2 text-xs text-[#766773]">Open {source.label} <ExternalLink size={12}/></a>
    </div>

    <section className="overflow-hidden rounded-[34px] border border-[#eadfe7] bg-[radial-gradient(circle_at_top_left,#fff8fb_0,#f3e9f0_52%,#ede4e8_100%)] p-6 shadow-[0_28px_90px_rgba(72,51,69,.08)] sm:p-9">
      <p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#9a8292]">Beauty · Gua Sha</p>
      <div className="mt-3 grid gap-7 lg:grid-cols-[1.15fr_.85fr] lg:items-end">
        <div><h1 className="font-serif text-5xl leading-none tracking-[-.04em] text-[#322a31] sm:text-6xl">Gua Sha library + guided ritual</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-[#756a72]">One Beauty destination for every source video, exact transcript-derived techniques, timed routines, spoken cues, side tracking, and safe technique notes.</p></div>
        <div className="rounded-[24px] border border-white/80 bg-white/70 p-4 backdrop-blur-xl"><div className="flex items-center justify-between text-xs text-[#867983]"><span>{mode} mode</span><span>{Math.round(totalSeconds/60)} min</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-[#9c8195] transition-all" style={{width:`${progress}%`}}/></div><p className="mt-2 text-[11px] text-[#9a8d96]">{completed.length} of {steps.length} steps complete</p></div>
      </div>
    </section>

    <section className="rounded-[28px] border border-[#eadfe7] bg-white p-5 sm:p-7">
      <div className="flex items-center gap-2"><Video size={15} className="text-[#8e7188]"/><p className="text-[10px] font-semibold uppercase tracking-[.16em] text-[#9a8794]">Source video library</p></div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{SOURCES.map(item=><button type="button" key={item.id} onClick={()=>selectSource(item.id)} className={`rounded-[20px] border p-4 text-left transition ${sourceId===item.id?'border-[#bda7b7] bg-[#f4ebf1]':'border-[#ece3e9] bg-[#fbf9fa]'}`}><div className="flex items-center justify-between"><strong className="text-sm text-[#433941]">{item.label}</strong><span className={`rounded-full px-2 py-1 text-[9px] ${item.status==='awaiting-transcript'?'bg-[#fff4df] text-[#8f6c2d]':'bg-[#eaf3e7] text-[#5f7959]'}`}>{item.status==='awaiting-transcript'?'Needs transcript':'Base ready'}</span></div><p className="mt-3 text-[11px] leading-4 text-[#827680]">{item.note}</p></button>)}</div>
      <div className="mt-4 rounded-[18px] bg-[#faf6f8] p-4"><div className="flex items-start gap-3"><FileText size={16} className="mt-0.5 shrink-0 text-[#8e7188]"/><p className="text-xs leading-5 text-[#746873]">When the exact transcript is available, Glow should convert every sentence into structured fields: <strong>action, face area, direction, repetitions, tool edge/angle, pressure, prep product, timing, left/right side, warning, purpose, spoken cue, visual diagram, and whether it becomes a timer or reusable routine rule.</strong></p></div></div>
    </section>

    {source.status==='awaiting-transcript'?<section className="rounded-[26px] border border-[#ead7aa] bg-[#fffaf0] p-5"><div className="flex gap-3"><WandSparkles size={16} className="mt-1 text-[#9a783c]"/><div><p className="text-[10px] font-semibold uppercase tracking-[.15em] text-[#9a783c]">Exact-source mode pending</p><h2 className="mt-1 font-serif text-2xl text-[#4d4030]">{source.label} is saved, not guessed.</h2><p className="mt-2 text-sm leading-6 text-[#7b6b56]">TikTok is blocking direct transcript access for this short link. Until its media is transcribed, Glow keeps the safe base ritual below and clearly separates it from creator-specific instructions.</p></div></div></section>:null}

    <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,.6fr)]">
      <div className="rounded-[30px] border border-[#eadfe7] bg-white p-5 shadow-[0_20px_70px_rgba(72,51,69,.06)] sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-[10px] uppercase tracking-[.16em] text-[#9a8794]">{source.label} · Step {index+1} of {steps.length} · {step.area}</p><h2 className="mt-2 font-serif text-3xl text-[#352d34]">{step.title}</h2></div><div className="font-serif text-4xl text-[#3c323a]">{formatTime(secondsLeft)}</div></div>
        <div className="mt-6 rounded-[24px] bg-[#faf6f8] p-5"><p className="text-base leading-7 text-[#51464e]">{step.instruction}</p><p className="mt-4 rounded-[16px] bg-white px-4 py-3 text-sm font-medium text-[#765e70]">Cue: {step.cue}</p>{showWhy?<p className="mt-4 text-sm leading-6 text-[#7c7078]">{step.why}</p>:null}</div>
        <div className="mt-6 flex flex-wrap gap-2"><button type="button" onClick={()=>setRunning(value=>!value)} className="inline-flex items-center gap-2 rounded-full bg-[#342c35] px-5 py-3 text-sm text-white">{running?<Pause size={14}/>:<Play size={14}/>} {running?'Pause':'Start timer'}</button><button type="button" onClick={completeStep} className="inline-flex items-center gap-2 rounded-full border border-[#e4d9e2] px-5 py-3 text-sm text-[#625660]"><Check size={14}/>Done</button><button type="button" onClick={speakStep} className="inline-flex items-center gap-2 rounded-full border border-[#e4d9e2] px-5 py-3 text-sm text-[#625660]"><Volume2 size={14}/>Speak</button><button type="button" onClick={()=>setShowWhy(value=>!value)} className="rounded-full border border-[#e4d9e2] px-5 py-3 text-sm text-[#625660]">{showWhy?'Hide why':'Why this step?'}</button></div>
        <div className="mt-7 flex items-center justify-between border-t border-[#eee6eb] pt-5"><button type="button" onClick={()=>setIndex(value=>Math.max(0,value-1))} disabled={index===0} className="text-xs text-[#776b74] disabled:opacity-35">Previous</button><div className="flex gap-2">{(['Left','Right'] as Side[]).map(item=><button type="button" key={item} onClick={()=>setSide(item)} className={`rounded-full px-3 py-1.5 text-xs ${side===item?'bg-[#ece1e9] text-[#5d4d59]':'text-[#938791]'}`}>{item} side</button>)}</div><button type="button" onClick={()=>setIndex(value=>Math.min(steps.length-1,value+1))} disabled={index===steps.length-1} className="text-xs text-[#776b74] disabled:opacity-35">Next</button></div>
      </div>
      <aside className="space-y-4"><div className="rounded-[26px] border border-[#eadfe7] bg-white p-5"><p className="text-[10px] uppercase tracking-[.16em] text-[#9a8794]">Routine mode</p><div className="mt-3 grid gap-2">{(['Quick','Full','Slow'] as Mode[]).map(item=><button type="button" key={item} onClick={()=>{setMode(item);setIndex(0);setCompleted([])}} className={`flex items-center justify-between rounded-[16px] px-4 py-3 text-left text-sm ${mode===item?'bg-[#f0e6ed] text-[#4f414b]':'bg-[#faf8f9] text-[#756a72]'}`}><span>{item}</span><Clock3 size={13}/></button>)}</div></div><div className="rounded-[26px] border border-[#eadfe7] bg-white p-5"><div className="flex items-center gap-2"><Sparkles size={14} className="text-[#8f7085]"/><p className="text-[10px] uppercase tracking-[.16em] text-[#9a8794]">Technique guardrails</p></div><ul className="mt-4 space-y-2 text-xs leading-5 text-[#776b74]"><li>• Use slip. Do not drag dry skin.</li><li>• Keep pressure gentle and comfortable.</li><li>• Avoid broken, sunburned, infected, or very irritated skin.</li><li>• Stop if a stroke causes pain, sharp tenderness, or significant bruising.</li><li>• Clean the tool after use.</li></ul></div><button type="button" onClick={resetRoutine} className="flex w-full items-center justify-center gap-2 rounded-full border border-[#e4d9e2] bg-white px-4 py-3 text-sm text-[#665a63]"><RotateCcw size={14}/>Reset ritual</button></aside>
    </section>

    <section className="rounded-[28px] border border-[#eadfe7] bg-white p-5 sm:p-7"><p className="text-[10px] uppercase tracking-[.16em] text-[#9a8794]">After-routine check-in</p><h2 className="mt-2 font-serif text-2xl text-[#342c34]">How did it feel?</h2><div className="mt-4 flex flex-wrap gap-2">{['Relaxing','Comfortable','Too much pressure','Sensitive today'].map(option=><button type="button" key={option} onClick={()=>setFeeling(option)} className={`rounded-full px-4 py-2 text-sm ${feeling===option?'bg-[#382f39] text-white':'border border-[#e5dce3] text-[#6d6069]'}`}>{option}</button>)}</div><p className="mt-4 text-xs leading-5 text-[#8a7d86]">Glow can use these check-ins to adapt duration, pressure reminders, and preferred areas. This is beauty tracking, not a medical diagnosis.</p></section>
  </div>
}
