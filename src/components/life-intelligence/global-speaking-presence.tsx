'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { X } from 'lucide-react';

type SpeakDetail={text?:unknown};

type PresenceMessage={id:string;text:string};

function displayDuration(text:string){
 const words=Math.max(1,text.trim().split(/\s+/).length);
 return Math.min(22000,Math.max(6000,words*420));
}

export function GlobalSpeakingPresence(){
 const[presence,setPresence]=useState<PresenceMessage|null>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const pendingFrame=useRef<number|null>(null);

 useEffect(()=>{
  const clear=()=>{if(timer.current){clearTimeout(timer.current);timer.current=null}if(pendingFrame.current!==null){cancelAnimationFrame(pendingFrame.current);pendingFrame.current=null}};
  const handler=(event:Event)=>{
   const detail=(event as CustomEvent<SpeakDetail>).detail;
   const text=typeof detail?.text==='string'?detail.text.trim():'';
   if(!text)return;
   if(pendingFrame.current!==null)cancelAnimationFrame(pendingFrame.current);
   pendingFrame.current=requestAnimationFrame(()=>{
    pendingFrame.current=null;
    // The conversation component has its own presence for direct replies. If it rendered successfully,
    // do not stack a second copy. Otherwise this root listener becomes the reliable fallback.
    if(document.querySelector('.glow-speaking-presence'))return;
    if(timer.current)clearTimeout(timer.current);
    setPresence({id:`${Date.now()}-${Math.random().toString(36).slice(2,7)}`,text});
    timer.current=setTimeout(()=>setPresence(null),displayDuration(text));
   });
  };
  document.addEventListener('glow:speak',handler as EventListener);
  return()=>{document.removeEventListener('glow:speak',handler as EventListener);clear()};
 },[]);

 if(!presence)return null;
 const rays=Array.from({length:8},(_,index)=>index*45);
 return <div className="glow-speaking-presence" role="status" aria-live="polite" data-global-speaking-presence="true">
  <div className="glow-speaking-presence__shell">
   <div className="glow-speaking-presence__being" aria-hidden="true">
    <div className="glow-speaking-presence__halo"/>
    <div className="glow-speaking-presence__prism"/>
    <div className="glow-speaking-presence__wing glow-speaking-presence__wing--left"/>
    <div className="glow-speaking-presence__wing glow-speaking-presence__wing--right"/>
    {rays.map(angle=><div key={`${presence.id}-${angle}`} className="glow-speaking-presence__ray" style={{'--ray-angle':`${angle}deg`} as CSSProperties}/>) }
    <div className="glow-speaking-presence__core"/>
    <div className="glow-speaking-presence__sound"><span/><span/><span/><span/></div>
   </div>
   <div className="glow-speaking-presence__caption">
    <button type="button" className="glow-speaking-presence__close" onClick={()=>setPresence(null)} aria-label="Dismiss Glow speaking presence"><X size={14}/></button>
    <p className="glow-speaking-presence__eyebrow">Glow · speaking</p>
    <p className="glow-speaking-presence__text">{presence.text}</p>
   </div>
  </div>
 </div>;
}
