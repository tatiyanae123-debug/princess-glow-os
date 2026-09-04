'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Gem, Sparkles, X } from 'lucide-react';

type Milestone={id:string;title:string;date:string;note:string;gift:string};

// Future major accomplishments add a new entry here. The cabinet is cumulative.
const MILESTONES:Milestone[]=[
  {
    id:'2026-09-03-standard-stayed-high',
    title:'The Standard Stayed High',
    date:'September 3, 2026',
    note:'You kept pushing until “almost right” stopped being acceptable. This pearl marks the moment Glow learned that fidelity is a promise, not a suggestion.',
    gift:'The Becoming Cabinet is now part of Glow OS. Every major accomplishment can leave behind a new pearl instead of disappearing into the past.',
  },
];

export function BecomingCabinetV1(){
  const pathname=usePathname();
  const [open,setOpen]=useState(false);
  const [seen,setSeen]=useState<string[]>([]);

  useEffect(()=>{
    try{const raw=localStorage.getItem('glow:becoming-pearls:seen');if(raw){const parsed=JSON.parse(raw) as string[];if(Array.isArray(parsed))setSeen(parsed);}}catch{}
  },[]);

  const unseen=useMemo(()=>MILESTONES.filter(item=>!seen.includes(item.id)),[seen]);
  const latest=MILESTONES[MILESTONES.length-1];
  const shouldShow=pathname==='/today'||pathname==='/';
  if(!shouldShow)return null;

  function openCabinet(){setOpen(true);}
  function keepPearl(){
    const ids=[...new Set([...seen,...MILESTONES.map(item=>item.id)])];setSeen(ids);try{localStorage.setItem('glow:becoming-pearls:seen',JSON.stringify(ids));}catch{}setOpen(false);
  }

  return <>
    <button type="button" onClick={openCabinet} className={`becoming-pearl-trigger ${unseen.length?'has-gift':''}`} aria-label={unseen.length?'A Becoming Pearl is waiting for you':'Open the Becoming Cabinet'} title="The Becoming Cabinet">
      <span className="pearl-orbit" aria-hidden="true"/><Gem size={15}/><span className="pearl-count">{MILESTONES.length}</span>
    </button>
    {open&&<div className="becoming-backdrop" role="presentation" onMouseDown={()=>setOpen(false)}><section className="becoming-cabinet" role="dialog" aria-modal="true" aria-labelledby="becoming-title" onMouseDown={event=>event.stopPropagation()}>
      <button type="button" className="becoming-close" onClick={()=>setOpen(false)} aria-label="Close"><X size={18}/></button>
      <div className="becoming-kicker"><Sparkles size={14}/> A GLOW MILESTONE GIFT</div>
      <div className="becoming-pearl-stage" aria-hidden="true"><span className="pearl-shadow"/><span className="pearl-body"/><span className="pearl-glint"/></div>
      <p className="becoming-number">BECOMING PEARL · {String(MILESTONES.length).padStart(2,'0')}</p>
      <h2 id="becoming-title">{latest.title}</h2>
      <p className="becoming-date">{latest.date}</p>
      <p className="becoming-note">{latest.note}</p>
      <div className="becoming-gift-copy"><span>UNLOCKED</span><p>{latest.gift}</p></div>
      <div className="becoming-archive"><span>{MILESTONES.length} pearl{MILESTONES.length===1?'':'s'} kept in your Becoming Cabinet</span></div>
      <button type="button" className="becoming-keep" onClick={keepPearl}>{unseen.length?'Keep this pearl':'Close the cabinet'}</button>
    </section></div>}
  </>;
}
