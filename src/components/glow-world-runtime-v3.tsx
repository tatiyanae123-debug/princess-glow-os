'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowUpRight, Check, Mic, ShieldCheck, Sparkles, Volume2, VolumeX, X } from 'lucide-react';

type GlowState='resting'|'waking'|'listening'|'understanding'|'speaking'|'acting'|'complete';
type ConversationItem={role:'user'|'glow';text:string};
type GlowAction={title?:string;type?:string;destinations?:string[]};
type TravelState={href:string;label:string;from:string;phase:'moving'|'settling'};
type GlowOpenDetail={prompt?:string;activeObject?:string;listen?:boolean};
type TravelDetail={href?:string;label?:string};

type SpeechAlternative={transcript?:string};
type SpeechResult={isFinal:boolean;length:number;[index:number]:SpeechAlternative};
type SpeechEvent={resultIndex:number;results:ArrayLike<SpeechResult>};
type SpeechRecognitionLike={
  continuous:boolean;interimResults:boolean;lang:string;
  onstart:(()=>void)|null;onresult:((event:SpeechEvent)=>void)|null;
  onerror:(()=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;
};
type SpeechRecognitionCtor=new()=>SpeechRecognitionLike;
type SpeechCapableWindow=Window&{SpeechRecognition?:SpeechRecognitionCtor;webkitSpeechRecognition?:SpeechRecognitionCtor};

const stateLabel:Record<GlowState,string>={resting:'present',waking:'arriving',listening:'listening',understanding:'understanding',speaking:'speaking',acting:'taking action',complete:'complete'};

function worldLabel(path:string){
  if(path==='/'||path==='/today')return'Today · The Living Center';
  if(/^\/(planning|calendar|tasks|reminders|routines|habits|goals|projects)/.test(path))return'Plan · The Time Observatory';
  if(/^\/(world|beauty|hair|closet|fitness|wellness|home|finance|work)/.test(path))return'Life · The Personal House';
  if(/^\/(brain|memory|timeline|notes|observations)/.test(path))return'Brain · The Inner Universe';
  if(/^\/(create|capture|inbox|import)/.test(path))return'Create · The Transformation Studio';
  return'Glow OS';
}
function worldTint(path:string){
  if(/^\/(planning|calendar|tasks|reminders|routines|habits|goals|projects)/.test(path))return'rgba(191,207,245,.42)';
  if(/^\/(brain|memory|timeline|notes|observations)/.test(path))return'rgba(83,73,129,.34)';
  if(/^\/(world|beauty|hair|closet|fitness|wellness|home|finance|work)/.test(path))return'rgba(243,203,192,.32)';
  if(/^\/(create|capture|inbox|import)/.test(path))return'rgba(255,255,255,.34)';
  return'rgba(241,217,210,.30)';
}
function actionRisk(text:string):'low'|'medium'|'high'{
  if(/\b(delete|erase|remove all|cancel|pay|purchase|transfer|send email|external account)\b/i.test(text))return'high';
  if(/\b(move|reschedule|schedule|change|update|replan|mark|complete|create|add)\b/i.test(text))return'medium';
  return'low';
}

function LivingAura({state,small=false}:{state:GlowState;small?:boolean}){
  return <div className={`glow-presence glow-presence-${state} ${small?'glow-presence-small':''}`} aria-hidden="true">
    <span className="glow-presence-haze"/><span className="glow-presence-beam"/><span className="glow-presence-wing glow-presence-left"/><span className="glow-presence-wing glow-presence-right"/><span className="glow-presence-rays"/><span className="glow-presence-ring one"/><span className="glow-presence-ring two"/><span className="glow-presence-core"/>
  </div>;
}

export function GlowWorldRuntime(){
  const pathname=usePathname();
  const router=useRouter();
  const room=useMemo(()=>worldLabel(pathname),[pathname]);
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
  const speechRef=useRef<SpeechRecognitionLike|null>(null);
  const travelTimer=useRef<number|null>(null);

  useEffect(()=>{
    try{
      const stored=window.sessionStorage.getItem('glow:conversation');
      if(stored){const parsed=JSON.parse(stored) as ConversationItem[];if(Array.isArray(parsed))setConversation(parsed.slice(-12));}
      setVoiceEnabled(window.sessionStorage.getItem('glow:voice')==='on');
    }catch{/* optional */}
  },[]);
  useEffect(()=>{try{window.sessionStorage.setItem('glow:conversation',JSON.stringify(conversation.slice(-12)));}catch{/* optional */}},[conversation]);
  useEffect(()=>()=>{if(travelTimer.current)window.clearTimeout(travelTimer.current);try{speechRef.current?.stop();}catch{/* ignore */}},[]);

  const moveThroughWorld=useCallback((href:string,label:string)=>{
    if(!href||href===pathname)return;
    if(travelTimer.current)window.clearTimeout(travelTimer.current);
    try{window.sessionStorage.setItem('glow:last-context',JSON.stringify({from:pathname,to:href,label,activeObject,at:Date.now()}));}catch{/* optional */}
    window.dispatchEvent(new CustomEvent('glow:ripple',{detail:{href,label}}));
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){router.push(href);return;}
    setTravel({href,label,from:pathname,phase:'moving'});
    travelTimer.current=window.setTimeout(()=>router.push(href),340);
  },[activeObject,pathname,router]);

  useEffect(()=>{
    if(!travel)return;
    const target=travel.href.split('?')[0].split('#')[0];
    if(pathname===target){setTravel(current=>current?{...current,phase:'settling'}:current);const timer=window.setTimeout(()=>setTravel(null),430);return()=>window.clearTimeout(timer);}
  },[pathname,travel]);

  const speak=useCallback((text:string)=>{
    if(!voiceEnabled||!('speechSynthesis'in window))return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(text.replace(/\s+/g,' ').slice(0,1200));
    utterance.rate=.96;utterance.pitch=1.02;utterance.volume=.82;window.speechSynthesis.speak(utterance);
  },[voiceEnabled]);

  const askGlow=useCallback(async(text:string)=>{
    const clean=text.trim();if(!clean)return;
    const userItem:ConversationItem={role:'user',text:clean};
    const history:ConversationItem[]=[...conversation,userItem].slice(-12);
    setConversation(history);setOpen(true);setQuery('');setError('');setActions([]);setRequiresConfirmation(false);setActionSuggested(false);setState('understanding');
    window.dispatchEvent(new CustomEvent('glow:ripple',{detail:{label:'Glow understood'}}));
    try{
      const response=await fetch('/api/glow/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:clean,sourceRoute:pathname,activeObject,history})});
      const payload=await response.json() as {ok?:boolean;message?:string;actionSuggested?:boolean};
      if(!response.ok||!payload.ok)throw new Error(payload.message||'Glow could not answer yet.');
      const message=payload.message||'I’m here.';
      const glowItem:ConversationItem={role:'glow',text:message};
      setConversation(items=>[...items,glowItem].slice(-12));setActionSuggested(Boolean(payload.actionSuggested));setState('speaking');speak(message);
      window.setTimeout(()=>setState(current=>current==='speaking'?'resting':current),900);
    }catch(caught){setState('resting');setError(caught instanceof Error?caught.message:'Glow could not answer yet.');}
  },[activeObject,conversation,pathname,speak]);

  const listen=useCallback(()=>{
    const speechWindow=window as SpeechCapableWindow;
    const Recognition=speechWindow.SpeechRecognition??speechWindow.webkitSpeechRecognition;
    if(!Recognition){setError('Voice recognition is not available in this browser yet. You can still type to Glow.');setState('resting');return;}
    try{speechRef.current?.stop();}catch{/* ignore */}
    const recognition=new Recognition();
    recognition.continuous=false;recognition.interimResults=true;recognition.lang='en-US';
    recognition.onstart=()=>{setOpen(true);setError('');setState('listening');};
    recognition.onresult=(event:SpeechEvent)=>{
      let transcript='';let final=false;
      for(let i=event.resultIndex;i<event.results.length;i+=1){const result=event.results[i];transcript+=result?.[0]?.transcript??'';final=final||Boolean(result?.isFinal);}
      setQuery(transcript.trim());if(final&&transcript.trim())void askGlow(transcript.trim());
    };
    recognition.onerror=()=>{setError('I could not hear that clearly. Try again or type instead.');setState('resting');};
    recognition.onend=()=>setState(current=>current==='listening'?'resting':current);
    speechRef.current=recognition;recognition.start();
  },[askGlow]);

  useEffect(()=>{
    const show=(event:Event)=>{
      const detail=(event as CustomEvent<GlowOpenDetail>).detail??{};setActiveObject(detail.activeObject??'');if(detail.prompt)setQuery(detail.prompt);setOpen(true);setError('');setState('waking');
      window.setTimeout(()=>{if(detail.listen)listen();else setState(current=>current==='waking'?'resting':current);},620);
    };
    const travelEvent=(event:Event)=>{const detail=(event as CustomEvent<TravelDetail>).detail??{};if(detail.href)moveThroughWorld(detail.href,detail.label??'Connected room');};
    window.addEventListener('glow:open',show as EventListener);window.addEventListener('glow:navigate',travelEvent as EventListener);
    return()=>{window.removeEventListener('glow:open',show as EventListener);window.removeEventListener('glow:navigate',travelEvent as EventListener);};
  },[listen,moveThroughWorld]);

  useEffect(()=>{
    const intercept=(event:MouseEvent)=>{
      if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      const node=event.target instanceof Element?event.target:null;const anchor=node?.closest('a[href]') as HTMLAnchorElement|null;
      if(!anchor||anchor.target||anchor.hasAttribute('download')||anchor.dataset.noWorldTransition==='true')return;
      const url=new URL(anchor.href,window.location.href);if(url.origin!==window.location.origin||url.pathname.startsWith('/api/')||url.pathname==='/sign-in')return;
      const href=`${url.pathname}${url.search}${url.hash}`;if(href===`${window.location.pathname}${window.location.search}${window.location.hash}`)return;
      event.preventDefault();moveThroughWorld(href,anchor.getAttribute('aria-label')||anchor.textContent?.trim()||'Connected room');
    };
    document.addEventListener('click',intercept,true);return()=>document.removeEventListener('click',intercept,true);
  },[moveThroughWorld]);

  async function prepareAction(){
    const latest=[...conversation].reverse().find(item=>item.role==='user')?.text;if(!latest)return;
    setState('acting');setError('');window.dispatchEvent(new CustomEvent('glow:ripple',{detail:{label:'taking action'}}));
    try{
      const response=await fetch('/api/voice/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:latest,sourceRoute:pathname,risk:actionRisk(latest)})});
      const payload=await response.json() as {ok?:boolean;message?:string;actions?:GlowAction[];requiresConfirmation?:boolean};
      if(!response.ok||!payload.ok)throw new Error(payload.message||'Glow could not prepare that action yet.');
      const message=payload.message||'Glow prepared the action.';const glowItem:ConversationItem={role:'glow',text:message};
      setConversation(items=>[...items,glowItem].slice(-12));setActions(Array.isArray(payload.actions)?payload.actions:[]);setRequiresConfirmation(Boolean(payload.requiresConfirmation));setState('complete');speak(message);
    }catch(caught){setState('resting');setError(caught instanceof Error?caught.message:'Glow could not prepare that action yet.');}
  }

  function submit(event:FormEvent){event.preventDefault();void askGlow(query);}
  function toggleVoice(){setVoiceEnabled(current=>{const next=!current;try{window.sessionStorage.setItem('glow:voice',next?'on':'off');}catch{/* optional */}if(!next&&'speechSynthesis'in window)window.speechSynthesis.cancel();return next;});}

  return <>
    <style>{`
      @keyframes glowBreathe{0%,100%{transform:translate(-50%,-50%) scale(.96);filter:brightness(.98)}50%{transform:translate(-50%,-50%) scale(1.035);filter:brightness(1.09)}}
      @keyframes glowRayLife{0%,100%{opacity:.32;transform:translate(-50%,-50%) scale(.96)}50%{opacity:.8;transform:translate(-50%,-50%) scale(1.07)}}
      @keyframes glowArrive{0%{opacity:.08;transform:translate(-50%,-50%) scale(.14)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}
      @keyframes glowListen{0%,100%{transform:translate(-50%,-50%) scale(.93)}50%{transform:translate(-50%,-50%) scale(1.08)}}
      @keyframes glowWorldMove{0%{transform:translateX(-118%) skewX(-12deg);opacity:0}24%{opacity:.72}70%{opacity:.45}100%{transform:translateX(118%) skewX(-12deg);opacity:0}}
      @keyframes glowWorldSettle{0%{opacity:.76;transform:scale(1.035)}100%{opacity:0;transform:scale(1)}}
      .glow-presence{position:absolute;left:50%;top:50%;width:100%;height:100%;transform:translate(-50%,-50%);pointer-events:none;isolation:isolate;animation:glowBreathe 5.8s ease-in-out infinite}.glow-presence span{position:absolute;display:block}
      .glow-presence-haze{inset:3%;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.99) 0 5%,rgba(255,231,234,.44) 13%,rgba(206,226,255,.22) 28%,rgba(232,208,247,.15) 44%,transparent 69%);filter:blur(12px)}
      .glow-presence-beam{left:48.6%;top:-23%;width:2.8%;height:147%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.96),rgba(250,225,219,.51),rgba(219,235,255,.58),rgba(255,255,255,.96),transparent);filter:blur(3px);opacity:.84}
      .glow-presence-wing{top:20%;width:45%;height:60%;opacity:.76;filter:blur(1.4px) drop-shadow(0 0 12px rgba(255,255,255,.75));background:repeating-conic-gradient(from 86deg at 100% 50%,rgba(255,255,255,.91) 0deg 1.1deg,rgba(249,213,225,.27) 1.7deg 2.4deg,rgba(204,227,255,.21) 3deg 3.8deg,transparent 4.4deg 8.2deg);-webkit-mask-image:radial-gradient(ellipse at 100% 50%,#000 0 10%,rgba(0,0,0,.88) 22%,rgba(0,0,0,.46) 51%,transparent 74%);mask-image:radial-gradient(ellipse at 100% 50%,#000 0 10%,rgba(0,0,0,.88) 22%,rgba(0,0,0,.46) 51%,transparent 74%)}.glow-presence-left{left:2%;transform:scaleX(-1)}.glow-presence-right{right:2%}
      .glow-presence-rays{left:50%;top:50%;width:79%;height:79%;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.79) 0deg .35deg,transparent .6deg 5.8deg,rgba(243,202,219,.25) 6.1deg 6.35deg,transparent 6.6deg 11deg);-webkit-mask-image:radial-gradient(circle,transparent 0 16%,#000 21%,rgba(0,0,0,.8) 46%,transparent 72%);mask-image:radial-gradient(circle,transparent 0 16%,#000 21%,rgba(0,0,0,.8) 46%,transparent 72%);animation:glowRayLife 4.4s ease-in-out infinite}
      .glow-presence-core{left:50%;top:50%;width:17%;aspect-ratio:1;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#fff 0 18%,rgba(255,255,255,.99) 29%,rgba(255,242,237,.9) 45%,rgba(225,236,255,.51) 60%,rgba(250,211,225,.21) 72%,transparent 78%);box-shadow:0 0 12px 5px #fff,0 0 40px 14px rgba(255,238,235,.87),0 0 92px 29px rgba(214,229,255,.37),0 0 122px 43px rgba(242,200,218,.21)}
      .glow-presence-ring{left:50%;top:50%;border-radius:50%;transform:translate(-50%,-50%);border:1px solid rgba(255,255,255,.82);box-shadow:0 0 14px rgba(255,255,255,.54),inset 0 0 14px rgba(255,255,255,.36)}.glow-presence-ring.one{width:29%;aspect-ratio:1}.glow-presence-ring.two{width:42%;aspect-ratio:1;border-color:rgba(224,215,255,.31)}
      .glow-presence-waking{animation:glowArrive .68s cubic-bezier(.16,.75,.2,1) both}.glow-presence-listening .glow-presence-core{animation:glowListen 1.25s ease-in-out infinite}.glow-presence-understanding .glow-presence-rays{animation-duration:2.35s;opacity:.88}.glow-presence-speaking .glow-presence-rays{animation-duration:1.8s}.glow-presence-acting .glow-presence-beam{opacity:1;filter:blur(1px)}.glow-presence-complete .glow-presence-core{box-shadow:0 0 18px 8px #fff,0 0 55px 20px rgba(255,226,214,.92),0 0 120px 42px rgba(255,236,207,.4)}
      .glow-presence-small{width:74px;height:74px}.glow-presence-small .glow-presence-wing{opacity:.36}.glow-presence-small .glow-presence-beam{height:112%;top:-6%}.glow-presence-small .glow-presence-rays{width:94%;height:94%}
      .glow-route-moving{animation:glowWorldMove .84s cubic-bezier(.18,.76,.2,1) both}.glow-route-settling{animation:glowWorldSettle .43s ease-out both}
      @media(prefers-reduced-motion:reduce){.glow-presence,.glow-presence-rays,.glow-presence-core,.glow-route-moving,.glow-route-settling{animation:none!important}}
    `}</style>

    {!open&&pathname!=='/today'&&<button type="button" aria-label="Ask Glow" title="Ask Glow" onClick={()=>{setOpen(true);setState('waking');window.setTimeout(()=>setState(current=>current==='waking'?'resting':current),620);}} className="fixed bottom-5 left-5 z-[4900] grid h-16 w-16 place-items-center rounded-full border border-white/75 bg-white/24 shadow-[0_10px_34px_rgba(98,69,64,.18),0_0_30px_rgba(255,230,231,.78)] backdrop-blur-xl"><div className="relative h-[58px] w-[58px]"><LivingAura state="resting" small/></div></button>}

    {travel&&<div className="pointer-events-none fixed inset-0 z-[4950] overflow-hidden" aria-hidden="true"><div className={`${travel.phase==='settling'?'glow-route-settling':'glow-route-moving'} absolute -left-[20%] top-0 h-full w-[140%]`} style={{background:`linear-gradient(104deg,transparent 18%,rgba(255,255,255,.14) 31%,${worldTint(travel.href)} 46%,rgba(255,255,255,.59) 52%,${worldTint(travel.href)} 58%,rgba(255,255,255,.10) 70%,transparent 82%)`,backdropFilter:'blur(3px)',WebkitBackdropFilter:'blur(3px)',WebkitMaskImage:'linear-gradient(90deg,transparent 0%,#000 28%,#000 72%,transparent 100%)',maskImage:'linear-gradient(90deg,transparent 0%,#000 28%,#000 72%,transparent 100%)'}}/><div className="absolute bottom-7 left-1/2 -translate-x-1/2 rounded-full border border-white/70 bg-white/60 px-5 py-2 text-xs text-[#4c3e3a] shadow-lg backdrop-blur-xl"><span className="opacity-60">{worldLabel(travel.from)}</span><span className="mx-2">→</span><span className="font-medium">{travel.label}</span></div></div>}

    {open&&<div className="fixed inset-0 z-[5000] overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,.17),rgba(237,216,214,.18)_42%,rgba(41,32,39,.32)_100%)] backdrop-blur-[7px]">
      <button type="button" onClick={()=>setOpen(false)} aria-label="Close Glow" className="absolute right-5 top-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/65 bg-white/45 text-[#433431] shadow-lg backdrop-blur-xl"><X size={18}/></button>
      <button type="button" onClick={toggleVoice} aria-label={voiceEnabled?'Turn Glow voice off':'Turn Glow voice on'} aria-pressed={voiceEnabled} className="absolute right-[72px] top-5 z-20 grid h-11 w-11 place-items-center rounded-full border border-white/65 bg-white/45 text-[#433431] shadow-lg backdrop-blur-xl">{voiceEnabled?<Volume2 size={17}/>:<VolumeX size={17}/>}</button>
      <div className="absolute left-1/2 top-[29%] h-[min(58vw,520px)] w-[min(58vw,520px)] -translate-x-1/2 -translate-y-1/2"><LivingAura state={state}/></div>
      <div className="absolute left-1/2 top-[8%] -translate-x-1/2 text-center text-white drop-shadow-[0_2px_12px_rgba(42,29,38,.35)]"><p className="text-[10px] font-semibold uppercase tracking-[.28em]">Glow · {stateLabel[state]}</p><p className="mt-2 font-serif text-[clamp(20px,2.2vw,34px)] italic">Your life. Your timing. Your becoming.</p><p className="mt-2 text-[11px] opacity-75">{room}</p></div>
      <section className="absolute bottom-[3.5%] left-1/2 flex max-h-[55dvh] w-[min(92vw,760px)] -translate-x-1/2 flex-col overflow-hidden rounded-[30px] border border-white/75 bg-[linear-gradient(145deg,rgba(255,252,249,.90),rgba(244,226,224,.83))] text-[#342825] shadow-[0_28px_100px_rgba(49,33,40,.28),inset_0_1px_0_rgba(255,255,255,.98)] backdrop-blur-[24px]">
        <div className="overflow-y-auto px-5 pt-5 sm:px-7 sm:pt-6">
          {conversation.length===0?<div className="pb-4 text-center"><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-[#8e736d]">ASK GLOW</p><h2 className="mt-2 font-serif text-2xl sm:text-3xl">What should the world help you with?</h2><div className="mt-4 flex flex-wrap justify-center gap-2">{['Show me what I need to do next.','I’m overwhelmed. Fix the rest of today.','Pull up what matters for this room.'].map(prompt=><button key={prompt} type="button" onClick={()=>void askGlow(prompt)} className="rounded-full border border-[#dbc7c1] bg-white/45 px-3 py-2 text-xs hover:bg-white/70">{prompt}</button>)}</div></div>:<div className="space-y-3 pb-4">{conversation.slice(-6).map((item,index)=><div key={`${item.role}-${index}`} className={item.role==='user'?'ml-auto max-w-[86%] rounded-[20px_20px_5px_20px] bg-[#3d302c]/90 px-4 py-3 text-sm leading-relaxed text-white':'mr-auto max-w-[92%] rounded-[20px_20px_20px_5px] border border-white/70 bg-white/45 px-4 py-3 text-sm leading-relaxed'}>{item.text}</div>)}</div>}
          {actions.length>0&&<div className="mb-4 grid gap-2 sm:grid-cols-2">{actions.map((action,index)=><div key={`${action.title}-${index}`} className="relative overflow-hidden rounded-2xl border border-white/75 bg-white/42 p-4"><span className="absolute left-0 top-0 h-full w-[2px] bg-[linear-gradient(#fff,#dfb8b4,#cbd8f7,#fff)]"/><p className="text-[9px] font-semibold uppercase tracking-[.18em] opacity-55">{action.type||'Glow action'}</p><p className="mt-1 font-serif text-lg">{action.title||'Prepared action'}</p>{action.destinations?.length?<p className="mt-2 text-xs opacity-60">Flows to {action.destinations.join(' · ')}</p>:null}</div>)}</div>}
          {requiresConfirmation&&<div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#d9beb7] bg-[#fff8f5]/72 p-4 text-sm"><ShieldCheck className="mt-0.5 shrink-0" size={18}/><div><p className="font-medium">Protected action</p><p className="mt-1 text-xs leading-relaxed opacity-70">Glow prepared this for review. Destructive, external, financial, or sensitive changes are never silently committed.</p></div></div>}
          {error&&<div className="mb-4 rounded-2xl border border-[#d8b1aa] bg-white/58 p-4 text-sm">{error}</div>}
        </div>
        <form onSubmit={submit} className="border-t border-white/60 bg-white/30 p-4 sm:p-5"><div className="flex items-end gap-2 rounded-[22px] border border-[#dac6c0] bg-white/58 p-2"><textarea value={query} onChange={event=>setQuery(event.target.value)} placeholder={state==='listening'?'Listening…':'Talk to Glow naturally…'} rows={1} className="max-h-28 min-h-11 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none"/><button type="button" onClick={listen} aria-label="Speak to Glow" className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/75 shadow-[0_0_24px_rgba(255,221,225,.66)] ${state==='listening'?'bg-white text-[#9d7069]':'bg-[radial-gradient(circle,#fff,#f1cfce)] text-[#6f514b]'}`}><Mic size={17}/></button><button type="submit" disabled={!query.trim()||state==='understanding'||state==='acting'} aria-label="Send to Glow" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#3e312d] text-white disabled:opacity-35"><ArrowUpRight size={17}/></button></div><div className="mt-3 flex min-h-8 flex-wrap items-center justify-between gap-2"><span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[.16em] opacity-55"><Sparkles size={11}/> Context stays connected</span>{actionSuggested&&!actions.length&&<button type="button" onClick={()=>void prepareAction()} className="inline-flex items-center gap-2 rounded-full border border-[#d1b7b0] bg-white/55 px-4 py-2 text-xs font-medium"><Sparkles size={13}/> Prepare the action</button>}{state==='complete'&&!requiresConfirmation&&<span className="inline-flex items-center gap-2 text-xs font-medium text-[#66745f]"><Check size={14}/> Glow returned an action receipt</span>}</div></form>
      </section>
    </div>}
  </>;
}
