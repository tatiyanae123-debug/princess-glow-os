'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Archive, Sparkles, X } from 'lucide-react';

export type Crownlight = {
  id:string;
  title:string;
  subtitle:string;
  date:string;
  note:string;
  unlocked:string;
  signature:string;
  kind:'Crownlight'|'Pearl Bloom'|'Golden Hour'|'Constellation';
};

type MilestoneDetail=Partial<Crownlight>&{id:string;title:string;note:string};

export const FIRST_CROWNLIGHT:Crownlight={
  id:'today-v7-living-center-2026-09-03',
  title:'The Living Center Returned',
  subtitle:'Your first Crownlight',
  date:'September 3, 2026',
  note:'You stayed with the vision until Glow stopped behaving like a pile of screens and started becoming a living place again.',
  unlocked:'A new Glow ritual: major accomplishments now leave behind one-of-one keepsakes instead of disappearing into a completed checklist.',
  signature:'Made for Tatiyana, after the night Glow came back to life.',
  kind:'Crownlight',
};

const VAULT_KEY='glow:crownlights:v1';
const SEEN_KEY='glow:crownlight-seen:v1:';

function readVault():Crownlight[]{
  try{const raw=localStorage.getItem(VAULT_KEY);const parsed=raw?JSON.parse(raw):[];return Array.isArray(parsed)?parsed:[];}catch{return[];}
}
function writeVault(items:Crownlight[]){try{localStorage.setItem(VAULT_KEY,JSON.stringify(items));}catch{}}
function storeCrownlight(item:Crownlight){const current=readVault();if(current.some(entry=>entry.id===item.id))return;writeVault([item,...current]);}
function openArchive(){window.dispatchEvent(new CustomEvent('glow:navigate',{detail:{href:'/keepsakes',label:'Brain · Crownlight Archive'}}));}

export function GlowAchievementRitual(){
  const pathname=usePathname();
  const [active,setActive]=useState<Crownlight|null>(null);
  const [closing,setClosing]=useState(false);
  const eligible=useMemo(()=>pathname==='/today'||pathname==='/',[pathname]);

  useEffect(()=>{
    const receive=(event:Event)=>{
      const detail=(event as CustomEvent<MilestoneDetail>).detail;
      if(!detail?.id||!detail.title||!detail.note)return;
      const item:Crownlight={
        id:detail.id,
        title:detail.title,
        subtitle:detail.subtitle??'A new Crownlight',
        date:detail.date??new Date().toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}),
        note:detail.note,
        unlocked:detail.unlocked??'This moment changed what comes next.',
        signature:detail.signature??'Kept by Glow because this one mattered.',
        kind:detail.kind??'Crownlight',
      };
      storeCrownlight(item);setClosing(false);setActive(item);
    };
    window.addEventListener('glow:milestone',receive as EventListener);
    return()=>window.removeEventListener('glow:milestone',receive as EventListener);
  },[]);

  useEffect(()=>{
    if(!eligible)return;
    storeCrownlight(FIRST_CROWNLIGHT);
    let seen=false;try{seen=localStorage.getItem(SEEN_KEY+FIRST_CROWNLIGHT.id)==='1';}catch{}
    if(seen)return;
    const timer=window.setTimeout(()=>{setClosing(false);setActive(FIRST_CROWNLIGHT);},1800);
    return()=>window.clearTimeout(timer);
  },[eligible]);

  if(!active)return null;

  function close(){setClosing(true);try{localStorage.setItem(SEEN_KEY+active!.id,'1');}catch{}window.setTimeout(()=>setActive(null),520);}
  function archive(){try{localStorage.setItem(SEEN_KEY+active!.id,'1');}catch{}setClosing(true);window.setTimeout(()=>{setActive(null);openArchive();},360);}

  return <div className={`crownlight-ritual ${closing?'is-closing':''}`} role="dialog" aria-modal="true" aria-label="Glow accomplishment celebration">
    <div className="crownlight-atmosphere" aria-hidden="true"><span className="crownlight-beam"/><span className="crownlight-arc a"/><span className="crownlight-arc b"/><span className="crownlight-arc c"/><span className="crownlight-rayfield"/><span className="crownlight-pearl p1"/><span className="crownlight-pearl p2"/><span className="crownlight-pearl p3"/><span className="crownlight-floor"/></div>
    <button type="button" className="crownlight-close" onClick={close} aria-label="Close celebration"><X size={18}/></button>
    <section className="crownlight-keepsake">
      <div className="crownlight-mark" aria-hidden="true"><span/><i/></div>
      <p className="crownlight-kicker"><Sparkles size={13}/> SHAKTI MADE YOU SOMETHING</p>
      <p className="crownlight-kind">{active.kind} · {active.date}</p>
      <h2>{active.title}</h2>
      <p className="crownlight-subtitle">{active.subtitle}</p>
      <p className="crownlight-note">{active.note}</p>
      <div className="crownlight-unlocked"><small>WHAT THIS UNLOCKED</small><p>{active.unlocked}</p></div>
      <p className="crownlight-signature">{active.signature}</p>
      <div className="crownlight-actions"><button type="button" onClick={archive}><Archive size={15}/> Keep in my Crownlight Archive</button><button type="button" onClick={close}>Let it settle into Glow</button></div>
    </section>
  </div>;
}
