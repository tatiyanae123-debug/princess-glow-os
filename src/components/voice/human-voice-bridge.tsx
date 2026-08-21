'use client';

import { useEffect, useMemo, useState } from 'react';
import { Headphones, Play, Volume2, X } from 'lucide-react';

type Provider='auto'|'elevenlabs'|'openai'|'browser';
type Quality='balanced'|'expressive'|'fast';
type VoiceOption={id:string;name:string;category?:string;description?:string};
type Settings={enabled:boolean;provider:Provider;voice:string;quality:Quality;speed:number;style:number;elevenKey:string;openAiKey:string};

const KEY='glow-os:human-voice:v1';
const DEFAULTS:Settings={enabled:true,provider:'auto',voice:'',quality:'balanced',speed:.98,style:.35,elevenKey:'',openAiKey:''};

function readSettings():Settings{try{const parsed=JSON.parse(localStorage.getItem(KEY)??'{}') as Partial<Settings>;return{...DEFAULTS,...parsed}}catch{return DEFAULTS}}
function writeSettings(value:Settings){try{localStorage.setItem(KEY,JSON.stringify(value));document.dispatchEvent(new CustomEvent('glow:voice-settings-changed'))}catch{/* private mode */}}

export function HumanVoiceBridge(){
 const [open,setOpen]=useState(false);const [settings,setSettings]=useState<Settings>(DEFAULTS);const [voices,setVoices]=useState<{providers:{elevenlabs:boolean;openai:boolean;browser:boolean};elevenlabs:VoiceOption[];openai:VoiceOption[]}>({providers:{elevenlabs:false,openai:false,browser:true},elevenlabs:[],openai:[]});const [notice,setNotice]=useState('');
 const options=useMemo(()=>settings.provider==='openai'?voices.openai:settings.provider==='elevenlabs'?voices.elevenlabs:[],[settings.provider,voices]);
 useEffect(()=>{setSettings(readSettings())},[]);
 useEffect(()=>{if(!open)return;const s=readSettings();setSettings(s);void fetch('/api/voice/voices',{headers:{...(s.elevenKey?{'x-glow-eleven-key':s.elevenKey}:{}),...(s.openAiKey?{'x-glow-openai-key':s.openAiKey}:{})},cache:'no-store'}).then(async r=>{if(!r.ok)return;const j=await r.json();setVoices(j.data)}).catch(()=>{})},[open]);
 useEffect(()=>{if(!notice)return;const id=window.setTimeout(()=>setNotice(''),3500);return()=>window.clearTimeout(id)},[notice]);
 useEffect(()=>{
  if(typeof window==='undefined'||!window.speechSynthesis)return;
  const synth=window.speechSynthesis;const originalSpeak=synth.speak.bind(synth);const originalCancel=synth.cancel.bind(synth);let audio:HTMLAudioElement|null=null;let objectUrl:string|null=null;let generation=0;
  const cleanup=()=>{generation+=1;if(audio){audio.pause();audio.src='';audio=null}if(objectUrl){URL.revokeObjectURL(objectUrl);objectUrl=null}};
  const browserFallback=(utterance:SpeechSynthesisUtterance)=>{cleanup();originalCancel();originalSpeak(utterance)};
  const patchedSpeak=(utterance:SpeechSynthesisUtterance)=>{
   const current=readSettings();if(!current.enabled||current.provider==='browser'||!utterance.text.trim()){browserFallback(utterance);return}
   cleanup();originalCancel();const token=generation;const headers:Record<string,string>={'Content-Type':'application/json'};if(current.elevenKey)headers['x-glow-eleven-key']=current.elevenKey;if(current.openAiKey)headers['x-glow-openai-key']=current.openAiKey;
   void fetch('/api/voice/speak',{method:'POST',headers,body:JSON.stringify({text:utterance.text,provider:current.provider,voice:current.voice||undefined,quality:current.quality,speed:current.speed,style:current.style})}).then(async response=>{if(token!==generation)return;if(!response.ok){browserFallback(utterance);return}const blob=await response.blob();if(token!==generation)return;objectUrl=URL.createObjectURL(blob);audio=new Audio(objectUrl);audio.volume=utterance.volume??1;audio.onended=()=>{if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;audio=null;try{utterance.onend?.(new SpeechSynthesisEvent('end',{utterance}))}catch{/* optional event */}};try{utterance.onstart?.(new SpeechSynthesisEvent('start',{utterance}))}catch{/* optional event */}await audio.play()}).catch(()=>browserFallback(utterance));
  };
  const patchedCancel=()=>{cleanup();originalCancel()};
  let patched=false;try{Object.defineProperty(synth,'speak',{configurable:true,value:patchedSpeak});Object.defineProperty(synth,'cancel',{configurable:true,value:patchedCancel});patched=true}catch{/* some browsers lock native methods */}
  const eventSpeak=(event:Event)=>{const detail=(event as CustomEvent<{text?:string}>).detail;if(!detail?.text)return;const utterance=new SpeechSynthesisUtterance(detail.text);patchedSpeak(utterance)};document.addEventListener('glow:speak',eventSpeak);
  return()=>{document.removeEventListener('glow:speak',eventSpeak);cleanup();if(patched){try{Object.defineProperty(synth,'speak',{configurable:true,value:originalSpeak});Object.defineProperty(synth,'cancel',{configurable:true,value:originalCancel})}catch{/* page is leaving */}}};
 },[]);
 function update(patch:Partial<Settings>){const next={...settings,...patch};setSettings(next);writeSettings(next)}
 function preview(){const u=new SpeechSynthesisUtterance('Hi. I’m Glow. I’ll speak naturally, keep pace with you, and stay calm when you need clarity.');window.speechSynthesis.cancel();window.speechSynthesis.speak(u)}
 return <>
  <button type="button" onClick={()=>setOpen(true)} aria-label="Voice settings" className="fixed bottom-[5.7rem] left-4 z-[88] inline-flex items-center gap-2 rounded-full border border-[#e5ddd6] bg-white/90 px-3 py-2 text-[9px] font-semibold text-[#5b514b] shadow-[0_8px_28px_rgba(70,52,44,.08)] backdrop-blur md:bottom-5 md:left-[252px]"><Headphones size={13}/>Voice</button>
  {open?<div className="fixed inset-0 z-[320] overflow-y-auto bg-black/20 p-4 backdrop-blur-sm"><div className="mx-auto mt-10 max-w-xl rounded-[30px] border border-white/70 bg-[#fffdf9] p-5 shadow-2xl sm:p-7"><div className="flex items-start justify-between gap-4"><div><p className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#8f8179]">Glow Voice Studio</p><h2 className="mt-1 font-serif text-3xl text-[#3f3935]">Make Glow sound human.</h2><p className="mt-2 text-[9px] leading-5 text-[#82766e]">One voice setting controls Conversation, Routines, Fitness, Habits, Notes, and any Glow surface that speaks.</p></div><button onClick={()=>setOpen(false)} aria-label="Close voice settings" className="rounded-full border p-2"><X size={14}/></button></div>
   <div className="mt-5 grid gap-3 sm:grid-cols-2"><label className="text-[9px]">Provider<select value={settings.provider} onChange={e=>update({provider:e.target.value as Provider,voice:''})} className="mt-1 w-full rounded-xl border bg-white p-2.5"><option value="auto">Auto · best available</option><option value="elevenlabs">ElevenLabs</option><option value="openai">OpenAI</option><option value="browser">Device voice</option></select></label><label className="text-[9px]">Delivery<select value={settings.quality} onChange={e=>update({quality:e.target.value as Quality})} className="mt-1 w-full rounded-xl border bg-white p-2.5"><option value="balanced">Balanced conversation</option><option value="expressive">Most expressive</option><option value="fast">Fastest response</option></select></label></div>
   {settings.provider==='elevenlabs'||settings.provider==='openai'?<label className="mt-3 block text-[9px]">Voice<select value={settings.voice} onChange={e=>update({voice:e.target.value})} className="mt-1 w-full rounded-xl border bg-white p-2.5"><option value="">Default</option>{options.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label>:null}
   <div className="mt-4 grid gap-3 sm:grid-cols-2"><label className="text-[9px]">Speed · {settings.speed.toFixed(2)}×<input className="mt-2 w-full" type="range" min="0.8" max="1.12" step="0.01" value={settings.speed} onChange={e=>update({speed:Number(e.target.value)})}/></label><label className="text-[9px]">Expression · {Math.round(settings.style*100)}%<input className="mt-2 w-full" type="range" min="0" max="0.8" step="0.05" value={settings.style} onChange={e=>update({style:Number(e.target.value)})}/></label></div>
   <details className="mt-4 rounded-[18px] border bg-[#faf7f3] p-3"><summary className="cursor-pointer text-[9px] font-semibold">Provider keys on this device</summary><p className="mt-2 text-[8px] leading-4 text-[#897d74]">Leave blank if Glow already has server keys. Device keys stay in this browser and are sent only to Glow’s authenticated voice endpoint.</p><input type="password" value={settings.elevenKey} onChange={e=>update({elevenKey:e.target.value.trim()})} placeholder="ElevenLabs API key" className="mt-2 w-full rounded-xl border bg-white p-2.5 text-[9px]"/><input type="password" value={settings.openAiKey} onChange={e=>update({openAiKey:e.target.value.trim()})} placeholder="OpenAI API key" className="mt-2 w-full rounded-xl border bg-white p-2.5 text-[9px]"/></details>
   <div className="mt-5 flex flex-wrap items-center gap-2"><button onClick={()=>update({enabled:!settings.enabled})} className={`rounded-full px-4 py-2.5 text-[9px] ${settings.enabled?'bg-[#5f5865] text-white':'border'}`}><Volume2 size={11} className="mr-1 inline"/>{settings.enabled?'Human voice on':'Human voice off'}</button><button onClick={preview} className="rounded-full border px-4 py-2.5 text-[9px]"><Play size={11} className="mr-1 inline"/>Preview voice</button><span className="text-[8px] text-[#8d8178]">ElevenLabs available: {voices.providers.elevenlabs?'yes':'not detected'} · OpenAI: {voices.providers.openai?'yes':'not detected'}</span></div>
  </div></div>:null}
  {notice?<div className="fixed bottom-24 left-1/2 z-[340] -translate-x-1/2 rounded-full border bg-white px-4 py-2 text-[9px] shadow-xl">{notice}</div>:null}
 </>;
}
