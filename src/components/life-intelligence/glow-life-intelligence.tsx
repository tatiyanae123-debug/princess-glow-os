'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowRight, ArrowUp, Mic, MicOff, Plus, Sparkles, Volume2, VolumeX, X } from 'lucide-react';

type PulseStatus='good'|'watch'|'pressure'|'unknown';
type SurfaceItem={label:string;detail:string;href:string};
type Surface={kind:'life-state'|'next-move'|'future-you'|'attention'|'correction';eyebrow:string;title:string;summary?:string;metrics?:Array<{label:string;value:string;status?:PulseStatus}>;sections?:Array<{label:string;items:SurfaceItem[]}>;timeline?:Array<{time:string;title:string;detail?:string;href?:string}>;confidence?:'high'|'medium'|'low'};
type Message={id:string;role:'user'|'assistant';content:string;actions?:{label:string;href:string}[];surface?:Surface};
type RecognitionAlternativeLike={transcript:string};
type RecognitionResultLike={isFinal:boolean;[index:number]:RecognitionAlternativeLike};
type RecognitionResultListLike={length:number;[index:number]:RecognitionResultLike};
type RecognitionEventLike={resultIndex:number;results:RecognitionResultListLike};
type RecognitionErrorLike={error?:string};
type RecognitionLike={continuous:boolean;interimResults:boolean;lang:string;start:()=>void;stop:()=>void;onresult:((event:RecognitionEventLike)=>void)|null;onend:(()=>void)|null;onerror:((event:RecognitionErrorLike)=>void)|null};
type RecognitionCtor=new()=>RecognitionLike;
type SpeechWindow=Window&{SpeechRecognition?:RecognitionCtor;webkitSpeechRecognition?:RecognitionCtor};

const STORAGE='glow-os:life-conversation:v1';
const VOICE_STORAGE='glow-os:human-voice:v1';
const STARTERS=['What should I do right now?','Show my Life Pulse','What can wait?','What happens if I skip the next thing?','Plan my next hour'];
const hello:Message={id:'hello',role:'assistant',content:'I’m here. Talk to me normally. I can help you decide, plan, compare options, or figure out what can wait.'};

function normalized(value:string){return value.trim().toLowerCase().replace(/\s+/g,' ')}
function dedupe(messages:Message[]){return messages.reduce<Message[]>((out,message)=>{const previous=out[out.length-1];if(message.role==='assistant'&&previous?.role==='assistant'&&normalized(message.content)===normalized(previous.content)){out[out.length-1]=message;return out}out.push(message);return out},[])}
function readConversation(){try{const value=JSON.parse(localStorage.getItem(STORAGE)??'[]') as Message[];return Array.isArray(value)&&value.length?dedupe(value).slice(-24):[hello]}catch{return[hello]}}
function saveConversation(messages:Message[]){try{localStorage.setItem(STORAGE,JSON.stringify(dedupe(messages).slice(-24)))}catch{/* storage can be unavailable */}}
function readOpenAiKey(){try{const value=JSON.parse(localStorage.getItem(VOICE_STORAGE)??'{}') as {openAiKey?:unknown};return typeof value.openAiKey==='string'?value.openAiKey.trim():''}catch{return''}}
function id(){return`${Date.now()}-${Math.random().toString(36).slice(2,7)}`}
function statusClass(status?:PulseStatus){if(status==='pressure')return'bg-[#f2d7d4] text-[#81534f]';if(status==='watch')return'bg-[#f2ead4] text-[#74633d]';if(status==='good')return'bg-[#dfeade] text-[#4f684e]';return'bg-[#eee9e7] text-[#766c70]'}

function SurfaceView({surface,onPrepare,preparing}:{surface:Surface;onPrepare:(surface:Surface)=>void;preparing:boolean}){
 return <div className="mt-3 overflow-hidden rounded-[22px] border border-[#e6dcda] bg-[linear-gradient(145deg,#fffdfb,#f8f2f2)] shadow-[0_14px_40px_rgba(70,50,60,.07)]">
  <div className="p-4"><p className="text-[8px] font-semibold uppercase tracking-[.18em] text-[#9a7683]">{surface.eyebrow}</p><h3 className="mt-1 font-serif text-[20px] leading-tight text-[#393136]">{surface.title}</h3>{surface.summary?<p className="mt-2 text-[10.5px] leading-5 text-[#756a70]">{surface.summary}</p>:null}</div>
  {surface.metrics?.length?<div className="grid grid-cols-2 gap-px border-y border-[#e9dfdd] bg-[#e9dfdd] sm:grid-cols-3">{surface.metrics.map(metric=><div key={`${metric.label}-${metric.value}`} className="bg-white/90 p-3"><div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${metric.status==='pressure'?'bg-[#b86e67]':metric.status==='watch'?'bg-[#b49a58]':metric.status==='good'?'bg-[#739070]':'bg-[#a49a9d]'}`}/><p className="text-[8px] font-semibold uppercase tracking-[.12em] text-[#968b90]">{metric.label}</p></div><p className="mt-1.5 text-[10px] leading-4 text-[#4f464b]">{metric.value}</p></div>)}</div>:null}
  {surface.timeline?.length?<div className="border-t border-[#ebe1df] px-4 py-3">{surface.timeline.map(item=><div key={`${item.time}-${item.title}`} className="flex gap-3 py-2"><div className="w-11 shrink-0 text-[8px] font-semibold uppercase tracking-[.08em] text-[#a0848f]">{item.time}</div><div className="relative flex-1 border-l border-[#e2d5d2] pl-3"><p className="text-[11px] font-semibold text-[#453b41]">{item.title}</p>{item.detail?<p className="mt-0.5 text-[9px] leading-4 text-[#84787d]">{item.detail}</p>:null}{item.href?<Link href={item.href} className="mt-1 inline-flex items-center gap-1 text-[8px] font-semibold text-[#765967]">Open <ArrowRight size={9}/></Link>:null}</div></div>)}</div>:null}
  {surface.sections?.map(section=>section.items.length?<div key={section.label} className="border-t border-[#ebe1df] px-4 py-3"><p className="text-[8px] font-semibold uppercase tracking-[.14em] text-[#9b8c91]">{section.label}</p><div className="mt-2 space-y-2">{section.items.map(item=><Link key={`${section.label}-${item.label}`} href={item.href} className="block rounded-[14px] border border-[#eee5e2] bg-white/85 p-3"><div className="flex items-start justify-between gap-2"><div><p className="text-[10.5px] font-semibold text-[#4a4045]">{item.label}</p><p className="mt-1 text-[9px] leading-4 text-[#81757b]">{item.detail}</p></div><ArrowRight size={12} className="mt-1 shrink-0 text-[#9a858d]"/></div></Link>)}</div></div>:null)}
  {surface.kind==='next-move'?<div className="border-t border-[#e8ddda] p-3"><button type="button" disabled={preparing} onClick={()=>onPrepare(surface)} className="w-full rounded-full bg-[#544957] px-4 py-3 text-[9px] font-semibold uppercase tracking-[.08em] text-white disabled:opacity-50">{preparing?'Preparing…':'Do this for me'}</button></div>:null}
  {surface.confidence?<div className="border-t border-[#eee5e2] px-4 py-2"><span className={`rounded-full px-2 py-1 text-[7px] font-semibold uppercase tracking-[.1em] ${statusClass(surface.confidence==='high'?'good':surface.confidence==='medium'?'watch':'unknown')}`}>{surface.confidence} confidence</span></div>:null}
 </div>
}

function SpeakingPresence({message,onClose}:{message:Message;onClose:()=>void}){
 const rays=Array.from({length:8},(_,index)=>index*45);
 return <div className="glow-speaking-presence" role="status" aria-live="polite">
  <div className="glow-speaking-presence__shell">
   <div className="glow-speaking-presence__being" aria-hidden="true">
    <div className="glow-speaking-presence__halo"/>
    <div className="glow-speaking-presence__prism"/>
    <div className="glow-speaking-presence__wing glow-speaking-presence__wing--left"/>
    <div className="glow-speaking-presence__wing glow-speaking-presence__wing--right"/>
    {rays.map(angle=><div key={angle} className="glow-speaking-presence__ray" style={{'--ray-angle':`${angle}deg`} as CSSProperties}/>) }
    <div className="glow-speaking-presence__core"/>
    <div className="glow-speaking-presence__sound"><span/><span/><span/><span/></div>
   </div>
   <div className="glow-speaking-presence__caption">
    <button type="button" className="glow-speaking-presence__close" onClick={onClose} aria-label="Dismiss Glow speaking presence"><X size={14}/></button>
    <p className="glow-speaking-presence__eyebrow">Glow · speaking</p>
    <p className="glow-speaking-presence__text">{message.content}</p>
   </div>
  </div>
 </div>
}

export function GlowLifeIntelligence(){
 const pathname=usePathname();const[open,setOpen]=useState(false);const[messages,setMessages]=useState<Message[]>([hello]);const[input,setInput]=useState('');const[thinking,setThinking]=useState(false);const[listening,setListening]=useState(false);const[speakBack,setSpeakBack]=useState(true);const[preparing,setPreparing]=useState(false);const[speakingPresence,setSpeakingPresence]=useState<Message|null>(null);const recognition=useRef<RecognitionLike|null>(null);const scroller=useRef<HTMLDivElement|null>(null);const presenceTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 useEffect(()=>{setMessages(readConversation())},[]);
 useEffect(()=>{saveConversation(messages);if(open)requestAnimationFrame(()=>scroller.current?.scrollTo({top:scroller.current.scrollHeight,behavior:'smooth'}))},[messages,open]);
 useEffect(()=>{const handler=()=>setOpen(true);document.addEventListener('glow:open-conversation',handler);return()=>document.removeEventListener('glow:open-conversation',handler)},[]);
 useEffect(()=>()=>{if(presenceTimer.current)clearTimeout(presenceTimer.current)},[]);
 const canListen=useMemo(()=>{if(typeof window==='undefined')return false;const speechWindow=window as SpeechWindow;return Boolean(speechWindow.SpeechRecognition||speechWindow.webkitSpeechRecognition)},[]);
 function showPresence(message:Message){if(presenceTimer.current)clearTimeout(presenceTimer.current);setSpeakingPresence(message);const wordCount=Math.max(1,message.content.trim().split(/\s+/).length);const duration=Math.min(18000,Math.max(5200,wordCount*390));presenceTimer.current=setTimeout(()=>setSpeakingPresence(null),duration)}
 function speak(text:string){if(!speakBack||typeof document==='undefined')return;document.dispatchEvent(new CustomEvent('glow:speak',{detail:{text}}))}
 function appendAssistant(message:Message){setMessages(current=>{const previous=current[current.length-1];if(previous?.role==='assistant'&&normalized(previous.content)===normalized(message.content))return current;return[...current,message]});showPresence(message)}
 async function prepare(surface:Surface){if(preparing)return;setPreparing(true);try{const response=await fetch('/api/glow/action-proposal',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:`Coordinate the next move: ${surface.title}`,risk:'medium',sourceRoute:pathname})});const payload=await response.json();const reply=response.ok&&payload?.message?String(payload.message):'I could not prepare that action just then.';const assistant:Message={id:id(),role:'assistant',content:reply,actions:payload?.href?[{label:'Review action',href:String(payload.href)}]:undefined};appendAssistant(assistant);speak(reply)}catch{appendAssistant({id:id(),role:'assistant',content:'I could not prepare that action just then. Nothing was changed.'})}finally{setPreparing(false)}}
 async function send(raw=input){const text=raw.trim();if(!text||thinking)return;const user:Message={id:id(),role:'user',content:text};const history=[...messages,user];setMessages(history);setInput('');setThinking(true);
  try{const openAiKey=readOpenAiKey();const response=await fetch('/api/glow/conversation',{method:'POST',headers:{'Content-Type':'application/json',...(openAiKey?{'x-glow-openai-key':openAiKey}:{})},body:JSON.stringify({messages:history.map(({role,content})=>({role,content})),page:pathname})});const payload=await response.json();const reply=response.ok&&payload?.reply?String(payload.reply):'I hit a connection problem, but I’m still here. Try that again.';const assistant:Message={id:id(),role:'assistant',content:reply,actions:Array.isArray(payload?.actions)?payload.actions:undefined,surface:payload?.surface??undefined};appendAssistant(assistant);speak(reply)}catch{const reply='I could not reach the Glow intelligence service just then. Your information is still safe. Try the request again.';appendAssistant({id:id(),role:'assistant',content:reply});speak(reply)}finally{setThinking(false)}}
 function toggleListen(){if(!canListen)return;if(listening){recognition.current?.stop();setListening(false);return}const speechWindow=window as SpeechWindow;const Ctor=speechWindow.SpeechRecognition||speechWindow.webkitSpeechRecognition;if(!Ctor)return;const rec=new Ctor();rec.continuous=false;rec.interimResults=true;rec.lang='en-US';rec.onresult=(event:RecognitionEventLike)=>{let transcript='';for(let i=event.resultIndex;i<event.results.length;i++)transcript+=event.results[i][0]?.transcript??'';setInput(transcript);if(event.results[event.results.length-1]?.isFinal){setListening(false);void send(transcript)}};rec.onend=()=>setListening(false);rec.onerror=()=>setListening(false);recognition.current=rec;setListening(true);rec.start()}
 return <>
  <button type="button" onClick={()=>setOpen(true)} className="fixed bottom-[calc(env(safe-area-inset-bottom)+82px)] right-4 z-[2147483050] flex h-14 items-center gap-2 rounded-full border border-white/80 bg-[#4f4552]/95 px-4 text-white shadow-[0_18px_50px_rgba(45,34,43,.25)] backdrop-blur-xl lg:bottom-5 lg:right-5" aria-label="Talk to Glow"><span className="grid h-8 w-8 place-items-center rounded-full bg-white/14"><Sparkles size={16}/></span><span className="hidden text-[11px] font-semibold tracking-[.01em] sm:block">Talk to Glow</span></button>
  {speakingPresence?<SpeakingPresence message={speakingPresence} onClose={()=>setSpeakingPresence(null)}/>:null}
  {open?<div className="fixed inset-0 z-[2147483640] bg-[#1d171c]/20 p-2 backdrop-blur-[6px] sm:p-4" onMouseDown={event=>{if(event.target===event.currentTarget)setOpen(false)}}><section className="ml-auto flex h-[min(800px,calc(100vh-1rem))] w-full max-w-[500px] flex-col overflow-hidden rounded-[30px] border border-white/70 bg-[rgba(255,252,250,.97)] shadow-[0_28px_100px_rgba(42,30,38,.28)] sm:h-[min(800px,calc(100vh-2rem))]">
   <header className="flex items-center justify-between border-b border-[#eee5e2] px-5 py-4"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#5f5260] text-white shadow-sm"><Sparkles size={17}/></span><div><p className="font-serif text-[21px] leading-none text-[#373036]">Glow</p><p className="mt-1 text-[8px] uppercase tracking-[.14em] text-[#96888f]">Life Intelligence · {pathname.replace('/','')||'today'}</p></div></div><div className="flex items-center gap-1"><button type="button" onClick={()=>setSpeakBack(value=>!value)} className="grid h-9 w-9 place-items-center rounded-full border border-[#eadfdb] bg-white text-[#645961]" aria-label={speakBack?'Turn spoken replies off':'Turn spoken replies on'}>{speakBack?<Volume2 size={14}/>:<VolumeX size={14}/>}</button><button type="button" onClick={()=>setOpen(false)} className="grid h-9 w-9 place-items-center rounded-full border border-[#eadfdb] bg-white text-[#645961]" aria-label="Close Glow"><X size={15}/></button></div></header>
   <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-5">{messages.map(message=><div key={message.id} className={`mb-5 flex ${message.role==='user'?'justify-end':'justify-start'}`}><div className={`${message.role==='user'?'max-w-[88%] rounded-[22px_22px_7px_22px] bg-[#554957] px-4 py-3 text-white':'w-full max-w-[94%] text-[#40383d]'}`}><p className="whitespace-pre-wrap text-[12px] leading-[1.7]">{message.content}</p>{message.surface?<SurfaceView surface={message.surface} onPrepare={prepare} preparing={preparing}/>:null}{message.actions?.length?<div className="mt-3 flex flex-wrap gap-2">{message.actions.map(action=><Link key={`${message.id}-${action.href}`} href={action.href} onClick={()=>setOpen(false)} className="rounded-full border border-[#e6d9d7] bg-white px-3 py-2 text-[8px] font-semibold text-[#604e58] shadow-sm">{action.label}</Link>)}</div>:null}</div></div>)}{thinking?<div className="mb-4 flex justify-start"><div className="rounded-full border border-[#eadfdb] bg-white px-4 py-2 text-[9px] text-[#887b82]">Glow is comparing the whole life state…</div></div>:null}</div>
   {messages.length<=2?<div className="px-4 pb-2 sm:px-5"><div className="flex gap-2 overflow-x-auto pb-1">{STARTERS.map(item=><button key={item} type="button" onClick={()=>void send(item)} className="shrink-0 rounded-full border border-[#e8ddda] bg-[#fffaf8] px-3 py-2 text-[8px] text-[#6e6067]">{item}</button>)}</div></div>:null}
   <footer className="border-t border-[#eee5e2] bg-white/75 p-3 sm:p-4"><div className="flex items-end gap-2 rounded-[24px] border border-[#ded3d1] bg-white p-2 shadow-[0_10px_30px_rgba(74,57,64,.06)]"><Link href="/intake" onClick={()=>setOpen(false)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f5efed] text-[#655960]" aria-label="Add photo, file, or anything"><Plus size={16}/></Link><textarea value={input} onChange={event=>setInput(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();void send()}}} rows={1} placeholder="Say anything…" className="max-h-28 min-h-[38px] flex-1 resize-none bg-transparent py-2 text-[11px] leading-5 text-[#3c3539] outline-none placeholder:text-[#a89ca1]"/><button type="button" onClick={toggleListen} disabled={!canListen} className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${listening?'bg-[#8f5266] text-white':'bg-[#f5efed] text-[#655960]'} disabled:opacity-30`} aria-label={listening?'Stop listening':'Speak to Glow'}>{listening?<MicOff size={15}/>:<Mic size={15}/>}</button><button type="button" onClick={()=>void send()} disabled={!input.trim()||thinking} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#4f4552] text-white disabled:opacity-35" aria-label="Send to Glow"><ArrowUp size={16}/></button></div><p className="mt-2 px-2 text-[7.5px] leading-4 text-[#9a8f94]">Glow checks live evidence, reasons across systems, and should correct itself when new information changes the answer.</p></footer>
  </section></div>:null}
 </>;
}
