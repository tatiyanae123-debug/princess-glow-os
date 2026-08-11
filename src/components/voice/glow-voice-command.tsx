'use client';

import { usePathname, useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle2, Mic, Mic2, Send, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type RecognitionEvent = { results: ArrayLike<{ 0: { transcript: string } }> };
type RecognitionError = { error: string };
type Recognition = { continuous: boolean; interimResults: boolean; lang: string; start(): void; stop(): void; onresult: ((event: RecognitionEvent) => void) | null; onend: (() => void) | null; onerror: ((event: RecognitionError) => void) | null };
type RecognitionCtor = new () => Recognition;
type Risk = 'low' | 'medium' | 'high';

const NAV: Record<string,string> = { dashboard:'/dashboard',tasks:'/tasks',planner:'/tasks',calendar:'/calendar',planning:'/planning',routines:'/routines',habits:'/habits',fitness:'/fitness',wellness:'/wellness',food:'/food',nutrition:'/food',beauty:'/beauty','beauty lab':'/beauty/lab',hair:'/hair',finance:'/finance','financial brain':'/finance/brain',goals:'/goals',notes:'/notes',settings:'/settings',world:'/world' };

function commandRisk(text:string):Risk {
  const value=text.toLowerCase();
  if(/delete|remove all|erase|cancel appointment|cancel event|clear all|archive all|send email|purchase|pay bill|transfer|external account/.test(value)) return 'high';
  if(/move|reschedule|change|edit|update|replace|bulk|everything|all unfinished|budget|financial/.test(value)) return 'medium';
  return 'low';
}

function navigationTarget(text:string){
  const value=text.toLowerCase().replace(/[^a-z ]/g,' ');
  if(!/^(open|go to|show me|take me to|navigate to)\b/.test(value.trim())) return null;
  return Object.entries(NAV).sort((a,b)=>b[0].length-a[0].length).find(([label])=>value.includes(label))?.[1] ?? null;
}

export function GlowVoiceCommand(){
  const pathname=usePathname();
  const router=useRouter();
  const recognitionRef=useRef<Recognition|null>(null);
  const [open,setOpen]=useState(false);
  const [listening,setListening]=useState(false);
  const [text,setText]=useState('');
  const [status,setStatus]=useState('');
  const [pending,setPending]=useState(false);
  const risk=commandRisk(text);

  useEffect(()=>{
    const openVoice=()=>setOpen(true);
    document.addEventListener('glow:voice-open',openVoice);
    const click=(event:MouseEvent)=>{
      const target=event.target instanceof Element?event.target.closest('[data-glow-voice-open]'):null;
      if(target){ event.preventDefault(); setOpen(true); }
    };
    document.addEventListener('click',click);
    return()=>{document.removeEventListener('glow:voice-open',openVoice);document.removeEventListener('click',click);};
  },[]);

  function startListening(){
    setStatus('');
    const browser=window as Window & { SpeechRecognition?:RecognitionCtor; webkitSpeechRecognition?:RecognitionCtor };
    const Ctor=browser.SpeechRecognition??browser.webkitSpeechRecognition;
    if(!Ctor){setStatus('Voice recognition is not available in this browser. You can still type the command here.');return;}
    const recognition=new Ctor();
    recognition.continuous=false; recognition.interimResults=false; recognition.lang='en-US';
    recognition.onresult=(event)=>{const transcript=Array.from(event.results).map(result=>result[0]?.transcript??'').join(' ').trim();setText(transcript);setListening(false);};
    recognition.onend=()=>setListening(false);
    recognition.onerror=(event)=>{setListening(false);setStatus(`Glow could not hear that clearly (${event.error}). Try again or type it.`);};
    recognitionRef.current=recognition; setListening(true); recognition.start();
  }

  function stopListening(){recognitionRef.current?.stop();setListening(false);}

  async function runCommand(){
    const command=text.trim(); if(!command||pending)return;
    const destination=navigationTarget(command);
    if(destination){router.push(destination);setStatus(`Opened ${destination.replaceAll('/',' ')}.`);setText('');setTimeout(()=>setOpen(false),450);return;}
    setPending(true); setStatus('Glow is understanding the command and routing each action…');
    try{
      const response=await fetch('/api/voice/command',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({text:command,sourceRoute:pathname,risk})});
      const payload=await response.json() as {ok?:boolean;message?:string;actions?:Array<{title:string;destinations:string[]}>};
      if(!response.ok||!payload.ok)throw new Error(payload.message||'Glow could not run that command.');
      const count=payload.actions?.length??1;
      setStatus(payload.message||`Glow routed ${count} action${count===1?'':'s'} to the right systems.`);
      setText(''); router.refresh();
    }catch(error){setStatus(error instanceof Error?error.message:'Glow could not run that command.');}
    finally{setPending(false);}
  }

  return <div className="fixed bottom-4 left-1/2 z-[95] -translate-x-1/2 sm:bottom-5 lg:left-auto lg:right-[156px] lg:translate-x-0">
    {open?<div className="mb-2 w-[min(520px,calc(100vw-1.5rem))] overflow-hidden rounded-[24px] border border-[#e3d5ce] bg-[#fffaf6]/96 shadow-[0_28px_90px_rgba(64,43,38,.25)] backdrop-blur-xl">
      <div className="flex items-start justify-between border-b border-[#ebded7] bg-[linear-gradient(120deg,#f8e6e5,#fffaf6)] px-4 py-4"><div><div className="flex items-center gap-2 text-[#ad707b]"><Sparkles size={13}/><p className="text-[8px] font-bold uppercase tracking-[.19em]">Glow Voice · {pathname==='/'?'Dashboard':pathname.replaceAll('/',' · ')}</p></div><h2 className="glow-display mt-1 text-[21px]">Speak to your whole life.</h2><p className="mt-1 max-w-[410px] text-[8px] leading-4 text-[#846f68]">Create, update, move, schedule, log, search, plan, navigate or brain-dump naturally. Glow uses the page you are on as context.</p></div><button type="button" onClick={()=>setOpen(false)} aria-label="Close Glow Voice" className="rounded-full border border-[#e1d3cc] bg-white/70 p-1.5"><X size={14}/></button></div>
      <div className="space-y-3 p-4"><div className="flex items-center justify-center py-2"><button type="button" onClick={listening?stopListening:startListening} className={`flex h-20 w-20 items-center justify-center rounded-full border-[5px] transition ${listening?'animate-pulse border-[#efc8cf] bg-[#bb7380] text-white':'border-[#f2dfdf] bg-[#cf8994] text-white shadow-[0_10px_30px_rgba(159,91,101,.23)]'}`} aria-label={listening?'Stop listening':'Start voice command'}>{listening?<Mic2 size={29}/>:<Mic size={29}/>}</button></div><p className="text-center text-[8px] text-[#8e7770]">{listening?'Listening… speak naturally.':'Tap the microphone, or type below.'}</p>
        <textarea value={text} onChange={event=>setText(event.target.value)} rows={3} placeholder="Example: I’m exhausted. Move my workout to tomorrow, keep my appointment, and make tonight lighter." className="w-full resize-none rounded-[14px] border border-[#e4d5ce] bg-white/75 px-3 py-3 text-[10px] leading-5 outline-none focus:border-[#ce959d]"/>
        {text?<div className={`flex items-start gap-2 rounded-[11px] px-3 py-2 text-[8px] leading-4 ${risk==='high'?'bg-amber-50 text-amber-900':risk==='medium'?'bg-[#f8eee4] text-[#785f4e]':'bg-emerald-50 text-emerald-900'}`}>{risk==='high'?<AlertTriangle size={12}/>:risk==='medium'?<ShieldCheck size={12}/>:<CheckCircle2 size={12}/>}<span><b>{risk==='high'?'Confirmation required':risk==='medium'?'Preview before sensitive changes':'Low-risk command'}.</b> {risk==='high'?'Glow will route this as a proposal and require review before destructive or external changes.':risk==='medium'?'Glow preserves the command context so changes can be reviewed and undone.':'Glow can route this immediately to the appropriate systems.'}</span></div>:null}
        {status?<div role="status" className="rounded-[11px] bg-[#f4ece8] px-3 py-2 text-[8px] leading-4 text-[#6f5d57]">{status}</div>:null}
        <button type="button" disabled={!text.trim()||pending} onClick={runCommand} className="inline-flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#342927] px-4 py-3 text-[9px] font-semibold text-white disabled:opacity-50"><Send size={12}/>{pending?'Understanding + routing…':risk==='high'?'Create safe action proposal':'Run voice command'}</button>
        <div className="grid grid-cols-2 gap-2 text-[7px] text-[#89746d] sm:grid-cols-4">{['Add dentist Tue 2','I spent $42 at Sephora','Move workout tomorrow','Prepare me for tomorrow'].map(example=><button type="button" key={example} onClick={()=>setText(example)} className="rounded-[9px] border border-[#eaded8] bg-white/55 px-2 py-2 text-left hover:bg-white">{example}</button>)}</div>
      </div>
    </div>:null}
    <button type="button" onClick={()=>setOpen(value=>!value)} className="inline-flex h-12 items-center gap-2 rounded-full border border-white/70 bg-[#342927] px-4 text-[9px] font-semibold text-white shadow-[0_14px_38px_rgba(62,42,37,.22)]" aria-expanded={open} aria-label="Open Glow Voice"><Mic2 size={15}/><span>Glow Voice</span></button>
  </div>;
}
