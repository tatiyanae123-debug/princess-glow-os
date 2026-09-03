'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRight, Check, Mic, ShieldCheck, Sparkles, Volume2, VolumeX, X } from 'lucide-react';

type GlowState='resting'|'waking'|'listening'|'understanding'|'speaking'|'acting'|'complete';
type ConversationItem={role:'user'|'glow';text:string};
type GlowAction={title?:string;type?:string;destinations?:string[];confidence?:number};
type TravelState={href:string;label:string;from:string;phase:'gather'|'cross'|'settle'};
type GlowOpenDetail={prompt?:string;activeObject?:string;listen?:boolean};
type TravelDetail={href?:string;label?:string};

type RecognitionAlternative={transcript?:string};
type RecognitionResult={isFinal:boolean;length:number;[index:number]:RecognitionAlternative};
type RecognitionEvent={resultIndex:number;results:ArrayLike<RecognitionResult>};
type RecognitionInstance={
  continuous:boolean;interimResults:boolean;lang:string;
  onstart:(()=>void)|null;onresult:((event:RecognitionEvent)=>void)|null;
  onerror:(()=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;
};
type RecognitionConstructor=new()=>RecognitionInstance;
type SpeechWindow=Window&{SpeechRecognition?:RecognitionConstructor;webkitSpeechRecognition?:RecognitionConstructor};

const LABEL:Record<GlowState,string>={resting:'present',waking:'arriving',listening:'listening',understanding:'understanding',speaking:'speaking',acting:'taking action',complete:'complete'};
const CLIMATES:Array<[RegExp,string]>=[
  [/^\/(planning|calendar|tasks|reminders|routines|habits|goals|projects)/,'rgba(196,208,244,.40)'],
  [/^\/(brain|memory|timeline|notes|observations)/,'rgba(88,78,132,.31)'],
  [/^\/(beauty|hair|closet|fitness|wellness|home|finance|work|world)/,'rgba(242,205,194,.29)'],
  [/^\/(create|capture|inbox|import)/,'rgba(255,255,255,.31)'],
];

function sourceLabel(path:string){
  if(path==='/'||path==='/today')return'Today · The Living Center';
  if(/^\/(planning|calendar|tasks|reminders|routines|habits|goals|projects)/.test(path))return'Plan · The Time Observatory';
  if(/^\/(brain|memory|timeline|notes|observations)/.test(path))return'Brain · The Inner Universe';
  if(/^\/(world|beauty|hair|closet|fitness|wellness|home|finance|work)/.test(path))return'Life · The Personal House';
  if(/^\/(create|capture|inbox|import)/.test(path))return'Create · The Transformation Studio';
  return'Glow OS';
}
function climateFor(path:string){return CLIMATES.find(([pattern])=>pattern.test(path))?.[1]??'rgba(241,218,211,.27)';}
function riskFor(text:string):'low'|'medium'|'high'{
  if(/\b(delete|erase|remove all|cancel|pay|purchase|transfer|send email|external account)\b/i.test(text))return'high';
  if(/\b(move|reschedule|schedule|change|update|replan|mark|complete|create|add)\b/i.test(text))return'medium';
  return'low';
}

function Aura({state,compact=false}:{state:GlowState;compact?:boolean}){
  return <div className={`gwr-aura gwr-${state} ${compact?'gwr-compact':''}`} aria-hidden="true">
    <i className="gwr-haze"/><i className="gwr-beam"/><i className="gwr-fan gwr-left"/><i className="gwr-fan gwr-right"/><i className="gwr-rays"/><i className="gwr-ring gwr-ring1"/><i className="gwr-ring gwr-ring2"/><i className="gwr-core"/>
  </div>;
}

export function GlowWorldRuntime(){
  const router=useRouter();
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const [state,setState]=useState<GlowState>('resting');
  const [query,setQuery]=useState('');
  const [activeObject,setActiveObject]=useState('');
  const [conversation,setConversation]=useState<ConversationItem[]>([]);
  const [actions,setActions]=useState<GlowAction[]>([]);
  const [actionSuggested,setActionSuggested]=useState(false);
  const [requiresConfirmation,setRequiresConfirmation]=useState(false);
  const [voiceEnabled,setVoiceEnabled]=useState(false);
  const [travel,setTravel]=useState<TravelState|null>(null);
  const [error,setError]=useState('');
  const recognitionRef=useRef<RecognitionInstance|null>(null);
  const travelTimerRef=useRef<number|null>(null);
  const roomLabel=useMemo(()=>sourceLabel(pathname),[pathname]);

  useEffect(()=>{
    try{
      const raw=window.sessionStorage.getItem('glow:conversation');
      if(raw){const parsed=JSON.parse(raw) as ConversationItem[];if(Array.isArray(parsed))setConversation(parsed.slice(-12));}
      setVoiceEnabled(window.sessionStorage.getItem('glow:voice')==='on');
    }catch{/* optional continuity storage */}
  },[]);
  useEffect(()=>{try{window.sessionStorage.setItem('glow:conversation',JSON.stringify(conversation.slice(-12)));}catch{/* optional */}},[conversation]);
  useEffect(()=>()=>{if(travelTimerRef.current)window.clearTimeout(travelTimerRef.current);try{recognitionRef.current?.stop();}catch{/* ignore */}},[]);

  const beginTravel=useCallback((href:string,label:string)=>{
    if(!href||href===pathname)return;
    if(travelTimerRef.current)window.clearTimeout(travelTimerRef.current);
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try{window.sessionStorage.setItem('glow:last-context',JSON.stringify({from:pathname,to:href,label,activeObject,at:Date.now()}));}catch{/* optional */}
    window.dispatchEvent(new CustomEvent('glow:ripple',{detail:{href,label}}));
    if(reduced){router.push(href);return;}
    setTravel({href,label,from:pathname,phase:'gather'});
    travelTimerRef.current=window.setTimeout(()=>{setTravel(current=>current?{...current,phase:'cross'}:current);router.push(href);},340);
  },[activeObject,pathname,router]);

  useEffect(()=>{
    if(!travel)return;
    const target=travel.href.split('?')[0].split('#')[0];
    if(pathname===target){setTravel(current=>current?{...current,phase:'settle'}:current);const timer=window.setTimeout(()=>setTravel(null),430);return()=>window.clearTimeout(timer);}
  },[pathname,travel]);

  const speak=useCallback((text:string)=>{
    if(!voiceEnabled||!('speechSynthesis'in window))return;
    window.speechSynthesis.cancel();
    const voice=new SpeechSynthesisUtterance(text.replace(/\s+/g,' ').slice(0,1200));
    voice.rate=.96;voice.pitch=1.02;voice.volume=.82;window.speechSynthesis.speak(voice);
  },[voiceEnabled]);

  const runChat=useCallback(async(text:string)=>{
    const clean=text.trim();if(!clean)return;
    setOpen(true);setError('');setQuery('');setActions([]);setRequiresConfirmation(false);setActionSuggested(false);setState('understanding');
    const history:ConversationItem[]=[...conversation,{role:'user',text:clean}].slice(-12);
    setConversation(history);window.dispatchEvent(new CustomEvent('glow:ripple',{detail:{label:'understanding'}}));
    try{
      const response=await fetch('/api/glow/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:clean,sourceRoute:pathname,activeObject,history})});
      const payload=await response.json() as {ok?:boolean;message?:string;actionSuggested?:boolean};
      if(!response.ok||!payload.ok)throw new Error(payload.message||'Glow could not answer yet.');
      const message=payload.message||'I’m here.';
      setActionSuggested(Boolean(payload.actionSuggested));
      setConversation(items=>[...items,{role:'glow' as const,text:message}].slice(-12));
      setState('speaking');speak(message);window.setTimeout(()=>setState(current=>current==='speaking'?'resting':current),900);
    }catch(caught){setState('resting');setError(caught instanceof Error?caught.message:'Glow could not answer yet.');}
  },[activeObject,conversation,pathname,speak]);

  const startListening=useCallback(()=>{
    const speechWindow=window as SpeechWindow;
    const Recognition=speechWindow.SpeechRecognition??speechWindow.webkitSpeechRecognition;
    if(!Recognition){setError('Voice recognition is not available in this browser yet. You can still type to Glow.');setState('resting');return;}
    try{recognitionRef.current?.stop();}catch{/* ignore */}
    const recognition=new Recognition();recognition.continuous=false;recognition.interimResults=true;recognition.lang='en-US';
    recognition.onstart=()=>{setOpen(true);setError('');setState('listening');};
    recognition.onresult=(event:RecognitionEvent)=>{
      let transcript='';let isFinal=false;
      for(let i=event.resultIndex;i<event.results.length;i+=1){const result=event.results[i];transcript+=result?.[0]?.transcript??'';isFinal=isFinal||Boolean(result?.isFinal);}
      setQuery(transcript.trim());if(isFinal&&transcript.trim())void runChat(transcript.trim());
    };
    recognition.onerror=()=>{setError('I could not hear that clearly. Try again or type instead.');setState('resting');};
    recognition.onend=()=>setState(current=>current==='listening'?'resting':current);
    recognitionRef.current=recognition;recognition.start();
  },[runChat]);

  useEffect(()=>{
    const openGlow=(event:Event)=>{
      const detail=(event as CustomEvent<GlowOpenDetail>).detail??{};setActiveObject(detail.activeObject??'');if(detail.prompt)setQuery(detail.prompt);setOpen(true);setError('');setState('waking');
      window.setTimeout(()=>{if(detail.listen)startListening();else setState(current=>current==='waking'?'resting':current);},620);
    };
    const navigate=(event:Event)=>{const detail=(event as CustomEvent<TravelDetail>).detail??{};if(detail.href)beginTravel(detail.href,detail.label??'Connected room');};
    window.addEventListener('glow:open',openGlow as EventListener);window.addEventListener('glow:navigate',navigate as EventListener);
    return()=>{window.removeEventListener('glow:open',openGlow as EventListener);window.removeEventListener('glow:navigate',navigate as EventListener);};
  },[beginTravel,startListening]);

  useEffect(()=>{
    const intercept=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const element=event.target instanceof Element?event.target:null;const anchor=element?.closest('a[href]') as HTMLAnchorElement|null;
      if(!anchor||anchor.target||anchor.hasAttribute('download')||anchor.dataset.noWorldTransition==='true')return;
      const url=new URL(anchor.href,window.location.href);if(url.origin!==window.location.origin||url.pathname.startsWith('/api/')||url.pathname==='/sign-in')return;
      const href=`${url.pathname}${url.search}${url.hash}`;if(href===`${window.location.pathname}${window.location.search}${window.location.hash}`)return;
      event.preventDefault();beginTravel(href,anchor.getAttribute('aria-label')||anchor.textContent?.trim()||'Connected room');
    };
    document.addEventListener('click',intercept,true);return()=>document.removeEventListener('click',intercept,true);
  },[beginTravel]);

  async function prepareAction(){
    const request=[...conversation].reverse().find(item=>item.role==='user')?.text;if(!request)return;
    setState('acting');setError('');window.dispatchEvent(new CustomEvent('glow:ripple',{detail:{label:'taking-action'}}));
    try{
      const response=await fetch('/api/voice/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:request,sourceRoute:pathname,risk:riskFor(request)})});
      const payload=await response.json() as {ok?:boolean;message?:string;actions?:GlowAction[];requiresConfirmation?:boolean};
      if(!response.ok||!payload.ok)throw new Error(payload.message||'Glow could not route that action yet.');
      const message=payload.message||'Glow prepared the action.';setActions(Array.isArray(payload.actions)?payload.actions:[]);setRequiresConfirmation(Boolean(payload.requiresConfirmation));
      setConversation(items=>[...items,{role:'glow' as const,text:message}].slice(-12));setState('complete');speak(message);
    }catch(caught){setState('resting');setError(caught instanceof Error?caught.message:'Glow could not route that action yet.');}
  }

  function submit(event:FormEvent){event.preventDefault();void runChat(query);}
  function toggleVoice(){setVoiceEnabled(current=>{const next=!current;try{window.sessionStorage.setItem('glow:voice',next?'on':'off');}catch{/* optional */}if(!next&&'speechSynthesis'in window)window.speechSynthesis.cancel();return next;});}

  return <>
    <style>{`
      @keyframes gwrBreath{0%,100%{transform:translate(-50%,-50%) scale(.96);filter:brightness(.98)}50%{transform:translate(-50%,-50%) scale(1.035);filter:brightness(1.08)}}
      @keyframes gwrRays{0%,100%{opacity:.34;transform:translate(-50%,-50%) scale(.96)}50%{opacity:.78;transform:translate(-50%,-50%) scale(1.06)}}
      @keyframes gwrWake{0%{opacity:.1;transform:translate(-50%,-50%) scale(.16)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
      @keyframes gwrListen{0%,100%{transform:translate(-50%,-50%) scale(.93)}50%{transform:translate(-50%,-50%) scale(1.08)}}
      @keyframes gwrSweep{0%{transform:translateX(-118%) skewX(-12deg);opacity:0}24%{opacity:.7}70%{opacity:.46}100%{transform:translateX(118%) skewX(-12deg);opacity:0}}
      @keyframes gwrSettle{0%{opacity:.78;transform:scale(1.04)}100%{opacity:0;transform:scale(1)}}
      .gwr-aura{position:absolute;left:50%;top:50%;width:100%;height:100%;transform:translate(-50%,-50%);pointer-events:none;isolation:isolate;animation:gwrBreath 5.8s ease-in-out infinite}.gwr-aura i{position:absolute;display:block}
      .gwr-haze{inset:4%;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.98) 0 5%,rgba(255,232,234,.43) 13%,rgba(205,225,255,.21) 28%,rgba(233,208,247,.14) 43%,transparent 68%);filter:blur(12px)}
      .gwr-beam{left:48.7%;top:-24%;width:2.6%;height:148%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),rgba(250,226,220,.5),rgba(221,235,255,.56),rgba(255,255,255,.95),transparent);filter:blur(3px);opacity:.82}
      .gwr-fan{top:20%;width:45%;height:60%;filter:blur(1.5px) drop-shadow(0 0 12px rgba(255,255,255,.74));opacity:.76;background:repeating-conic-gradient(from 86deg at 100% 50%,rgba(255,255,255,.9) 0deg 1.1deg,rgba(249,213,225,.26) 1.7deg 2.4deg,rgba(205,226,255,.2) 3deg 3.8deg,transparent 4.4deg 8.2deg);-webkit-mask-image:radial-gradient(ellipse at 100% 50%,#000 0 10%,rgba(0,0,0,.88) 22%,rgba(0,0,0,.46) 51%,transparent 74%);mask-image:radial-gradient(ellipse at 100% 50%,#000 0 10%,rgba(0,0,0,.88) 22%,rgba(0,0,0,.46) 51%,transparent 74%)}.gwr-left{left:2%;transform:scaleX(-1)}.gwr-right{right:2%}
      .gwr-rays{left:50%;top:50%;width:78%;height:78%;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.78) 0deg .35deg,transparent .6deg 5.8deg,rgba(243,202,219,.25) 6.1deg 6.35deg,transparent 6.6deg 11deg);-webkit-mask-image:radial-gradient(circle,transparent 0 16%,#000 21%,rgba(0,0,0,.8) 46%,transparent 72%);mask-image:radial-gradient(circle,transparent 0 16%,#000 21%,rgba(0,0,0,.8) 46%,transparent 72%);animation:gwrRays 4.4s ease-in-out infinite}
      .gwr-core{left:50%;top:50%;width:17%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#fff 0 18%,rgba(255,255,255,.99) 28%,rgba(255,242,237,.9) 45%,rgba(226,235,255,.5) 60%,rgba(250,211,225,.2) 72%,transparent 78%);box-shadow:0 0 12px 5px #fff,0 0 38px 14px rgba(255,238,235,.86),0 0 90px 28px rgba(214,229,255,.36),0 0 120px 42px rgba(242,200,218,.21)}
      .gwr-ring{left:50%;top:50%;border-radius:50%;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.82);box-shadow:0 0 14px rgba(255,255,255,.54),inset 0 0 14px rgba(255,255,255,.36)}.gwr-ring1{width:29%;aspect-ratio:1}.gwr-ring2{width:41%;aspect-ratio:1;border-color:rgba(224,215,255,.31)}
      .gwr-waking{animation:gwrWake .68s cubic-bezier(.16,.75,.2,1) both}.gwr-listening .gwr-core{animation:gwrListen 1.25s ease-in-out infinite}.gwr-understanding .gwr-rays{animation-duration:2.4s;opacity:.88}.gwr-speaking .gwr-rays{animation-duration:1.8s}.gwr-acting .gwr-beam{opacity:1;filter:blur(1px)}.gwr-complete .gwr-core{box-shadow:0 0 18px 8px #fff,0 0 54px 20px rgba(255,226,214,.92),0 0 120px 42px rgba(255,236,207,.4)}
      .gwr-compact{width:74px;height:74px}.gwr-compact .gwr-fan{opacity:.38}.gwr-compact .gwr-beam{height:110%;top:-5%}.gwr-compact .gwr-rays{width:92%;height:92%}
      .gwr-sweep{animation:gwrSweep .84s cubic-bezier(.18,.76,.2,1) both}.gwr-settle{animation:gwrSettle .43s ease-out both}
      @media(prefers-reduced-motion:reduce){.gwr-aura,.gwr-rays,.gwr-core,.gwr-sweep,.gwr-settle{animation:none!important}}
    `}</style>

    {!open&&pathname!=='/today'&&<button type="button" onClick={()=>{setOpen(true);setState('waking');window.setTimeout(()=>setState(current=>current==='waking'?'resting':current),620);}} aria-label="Ask Glow" title="Ask Glow" className="fixed bottom-5 left-5 z-[4900] grid h-16 w-16 place-items-center rounded-full border border-white/75 bg-white/25 shadow-[0_10px_34px_rgba(98,69,64,.18),0_0_30px_rgba(255,230,231,.76)] backdrop-blur-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c89f99]"><div className="relative h-[58px] w-[58px]"><Aura state="resting" compact/></div></button>}

    {travel&&<div className="pointer-events-none fixed inset-0 z-[4950] overflow-hidden" aria-hidden="true"><div className={`${travel.phase==='settle'?'gwr-settle':'gwr-sweep'} absolute -left-[20%] top-0 h-full w-[140%]`} style={{background:`linear-gradient(104deg,transparent 18%,rgba(255,255,255,.14) 31%,${climateFor(travel.href)} 46%,rgba(255,255,255,.58) 52%,${climateFor(travel.href)} 58%,rgba(255,255,255,.10) 70%,transparent 82%)`,backdropFilter:'blur(3px)',WebkitBackdropFilter:'blur(3px)',WebkitMaskImage:'linear-gradient(90deg,transparent 0%,#000 28%,#000 72%,transparent 100%)',maskImage:'linear-gradient(90deg,transparent 0%,#000 28%,#000 72%,transparent 100%)'}}/><div className="absolute bottom-7 left-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-white/58 px-5 py-2 text-xs text-[#4c3e3a] shadow-lg backdrop-blur-xl"><span className="opacity-60">{sourceLabel(travel.from)}</span><span className="mx-2">→</span><span className="font-medium">{travel.label}</span></div></div>}

    {open&&<div className="fixed inset-0 z-[5000] overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.18),rgba(237,216,214,.18)_42%,rgba(41,32,39,.32)_100%)] backdrop-blur-[7px]">
      <button type="button" onClick={()=>setOpen(false)} aria-label="Close Glow" className="absolute right-5 top-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/65 bg-white/45 text-[#433431] shadow-lg backdrop-blur-xl"><X size={18}/></button>
      <button type="button" onClick={toggleVoice} aria-pressed={voiceEnabled} aria-label={voiceEnabled?'Turn Glow voice off':'Turn Glow voice on'} className="absolute right-[72px] top-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/65 bg-white/45 text-[#433431] shadow-lg backdrop-blur-xl">{voiceEnabled?<Volume2 size={17}/>:<VolumeX size={17}/>}</button>
      <div className="absolute left-1/2 top-[29%] h-[min(58vw,520px)] w-[min(58vw,520px)] -translate-x-1/2 -translate-y-1/2"><Aura state={state}/></div>
      <div className="absolute left-1/2 top-[8%] -translate-x-1/2 text-center text-white drop-shadow-[0_2px_12px_rgba(42,29,38,.35)]"><p className="text-[10px] font-semibold uppercase tracking-[.28em]">Glow · {LABEL[state]}</p><p className="mt-2 font-serif text-[clamp(20px,2.2vw,34px)] italic">Your life. Your timing. Your becoming.</p><p className="mt-2 text-[11px] opacity-75">{roomLabel}</p></div>

      <section className="absolute bottom-[3.5%] left-1/2 flex max-h-[55dvh] w-[min(92vw,760px)] -translate-x-1/2 flex-col overflow-hidden rounded-[30px] border border-white/75 bg-[linear-gradient(145deg,rgba(255,252,249,.89),rgba(244,226,224,.82))] text-[#342825] shadow-[0_28px_100px_rgba(49,33,40,.28),inset_0_1px_0_rgba(255,255,255,.98)] backdrop-blur-[24px]">
        <div className="overflow-y-auto px-5 pt-5 sm:px-7 sm:pt-6">
          {conversation.length===0?<div className="pb-4 text-center"><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#8e736d]">ASK GLOW</p><h2 className="mt-2 font-serif text-2xl sm:text-3xl">What should the world help you with?</h2><div className="mt-4 flex flex-wrap justify-center gap-2">{['Show me what I need to do next.','I’m overwhelmed. Fix the rest of today.','Pull up what matters for this room.'].map(prompt=><button key={prompt} type="button" onClick={()=>void runChat(prompt)} className="rounded-full border border-[#dbc7c1] bg-white/45 px-3 py-2 text-xs hover:bg-white/70">{prompt}</button>)}</div></div>:<div className="space-y-3 pb-4">{conversation.slice(-6).map((item,index)=><div key={`${item.role}-${index}`} className={item.role==='user'?'ml-auto max-w-[86%] rounded-[20px_20px_5px_20px] bg-[#3d302c]/90 px-4 py-3 text-sm leading-relaxed text-white':'mr-auto max-w-[92%] rounded-[20px_20px_20px_5px] border border-white/70 bg-white/45 px-4 py-3 text-sm leading-relaxed'}>{item.text}</div>)}</div>}
          {actions.length>0&&<div className="mb-4 grid gap-2 sm:grid-cols-2">{actions.map((action,index)=><div key={`${action.title}-${index}`} className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/42 p-4"><span className="absolute left-0 top-0 h-full w-[2px] bg-[linear-gradient(#fff,#dfb8b4,#cbd8f7,#fff)]"/><p className="text-[9px] font-semibold uppercase tracking-[.18em] opacity-55">{action.type||'Glow action'}</p><p className="mt-1 font-serif text-lg">{action.title||'Prepared action'}</p>{action.destinations?.length?<p className="mt-2 text-xs opacity-60">Flows to {action.destinations.join(' · ')}</p>:null}</div>)}</div>}
          {requiresConfirmation&&<div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#d9beb7] bg-[#fff8f5]/72 p-4 text-sm"><ShieldCheck className="mt-0.5 shrink-0" size={18}/><div><p className="font-medium">Protected action</p><p className="mt-1 text-xs leading-relaxed opacity-70">Glow prepared this for review. Destructive, external, financial, or sensitive changes are never silently committed.</p></div></div>}
          {error&&<div className="mb-4 rounded-2xl border border-[#d8b1aa] bg-white/58 p-4 text-sm">{error}</div>}
        </div>
        <form onSubmit={submit} className="border-t border-white/60 bg-white/30 p-4 sm:p-5"><div className="flex items-end gap-2 rounded-[22px] border border-[#dac6c0] bg-white/58 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,.9)]"><textarea value={query} onChange={event=>setQuery(event.target.value)} placeholder={state==='listening'?'Listening…':'Talk to Glow naturally…'} rows={1} className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none"/><button type="button" onClick={startListening} aria-label="Speak to Glow" className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/75 shadow-[0_0_24px_rgba(255,221,225,.66)] ${state==='listening'?'bg-white text-[#9d7069]':'bg-[radial-gradient(circle,#fff,#f1cfce)] text-[#6f514b]'}`}><Mic size={17}/></button><button type="submit" disabled={!query.trim()||state==='understanding'||state==='acting'} aria-label="Send to Glow" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#3e312d] text-white disabled:opacity-35"><ArrowUpRight size={17}/></button></div><div className="mt-3 flex min-h-8 flex-wrap items-center justify-between gap-2"><span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[.16em] opacity-55"><Sparkles size={11}/> Context stays connected</span>{actionSuggested&&!actions.length&&<button type="button" onClick={()=>void prepareAction()} className="inline-flex items-center gap-2 rounded-full border border-[#d1b7b0] bg-white/55 px-4 py-2 text-xs font-medium"><Sparkles size={13}/> Prepare the action</button>}{state==='complete'&&!requiresConfirmation&&<span className="inline-flex items-center gap-2 text-xs font-medium text-[#66745f]"><Check size={14}/> Glow returned an action receipt</span>}</div></form>
      </section>
    </div>}
  </>;
}
