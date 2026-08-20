'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Palette, RotateCcw, SlidersHorizontal, X } from 'lucide-react';

const KEY='glow:customization:v2';
type Prefs={accent:string;surface:string;background:string;text:string;radius:number;density:number;fontScale:number;shadow:number;font:'serif'|'system'|'soft';};
const DEFAULTS:Prefs={accent:'#c7657a',surface:'#ffffff',background:'#fffdfb',text:'#2a2522',radius:12,density:1,fontScale:1,shadow:1,font:'soft'};

function apply(p:Prefs){
  const r=document.documentElement.style;
  r.setProperty('--glow-user-accent',p.accent);r.setProperty('--glow-user-surface',p.surface);r.setProperty('--glow-user-bg',p.background);r.setProperty('--glow-user-text',p.text);
  r.setProperty('--glow-user-radius',`${p.radius}px`);r.setProperty('--glow-user-density',String(p.density));r.setProperty('--glow-user-font-scale',String(p.fontScale));r.setProperty('--glow-user-shadow',String(p.shadow));
  r.setProperty('--glow-user-font',p.font==='serif'?'Georgia, Cambria, serif':p.font==='system'?'-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif':'Avenir Next,Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif');
}

export function GlowCustomizationStudio(){
  const [open,setOpen]=useState(false);const [imageMode,setImageMode]=useState(false);const [prefs,setPrefs]=useState<Prefs>(DEFAULTS);const input=useRef<HTMLInputElement>(null);const target=useRef<HTMLImageElement|null>(null);
  useEffect(()=>{try{const raw=localStorage.getItem(KEY);const next=raw?{...DEFAULTS,...JSON.parse(raw)}:DEFAULTS;setPrefs(next);apply(next);}catch{apply(DEFAULTS)}},[]);
  useEffect(()=>{apply(prefs);try{localStorage.setItem(KEY,JSON.stringify(prefs));}catch{}},[prefs]);
  useEffect(()=>{if(!imageMode)return;const handler=(e:MouseEvent)=>{const el=(e.target as HTMLElement)?.closest('img') as HTMLImageElement|null;if(!el)return;e.preventDefault();e.stopPropagation();target.current=el;input.current?.click();};document.addEventListener('click',handler,true);document.documentElement.dataset.glowImageEdit='true';return()=>{document.removeEventListener('click',handler,true);delete document.documentElement.dataset.glowImageEdit;};},[imageMode]);
  const style=useMemo(()=>({accentColor:prefs.accent}),[prefs.accent]);
  function choose(e:React.ChangeEvent<HTMLInputElement>){const file=e.target.files?.[0];const img=target.current;if(!file||!img)return;const reader=new FileReader();reader.onload=()=>{if(typeof reader.result!=='string')return;const key=`glow:image-any:${location.pathname}:${img.dataset.glowImageKey||Array.from(document.images).indexOf(img)}`;try{localStorage.setItem(key,reader.result);}catch{}img.src=reader.result;};reader.readAsDataURL(file);e.target.value='';}
  useEffect(()=>{Array.from(document.images).forEach((img,index)=>{const key=`glow:image-any:${location.pathname}:${img.dataset.glowImageKey||index}`;try{const saved=localStorage.getItem(key);if(saved)img.src=saved;}catch{}})},[]);
  function reset(){setPrefs(DEFAULTS);try{localStorage.removeItem(KEY);Object.keys(localStorage).filter(k=>k.startsWith(`glow:image-any:${location.pathname}:`)).forEach(k=>localStorage.removeItem(k));}catch{}location.reload();}
  return <>
    <button type="button" className="glow-customize-fab" onClick={()=>setOpen(true)} aria-label="Customize Glow OS"><Palette size={16}/></button>
    {open?<div className="glow-customize-panel" style={style}><div className="glow-customize-head"><div><strong>Customize Glow OS</strong><span>Images, color, type, density, depth</span></div><button onClick={()=>setOpen(false)} aria-label="Close"><X size={15}/></button></div>
      <div className="glow-customize-grid">{[['Accent','accent'],['Surface','surface'],['Background','background'],['Text','text']].map(([label,key])=><label key={key}><span>{label}</span><input type="color" value={prefs[key as keyof Prefs] as string} onChange={e=>setPrefs({...prefs,[key]:e.target.value})}/></label>)}</div>
      <label className="glow-customize-range"><span>Corner radius</span><input type="range" min="4" max="28" value={prefs.radius} onChange={e=>setPrefs({...prefs,radius:+e.target.value})}/><b>{prefs.radius}px</b></label>
      <label className="glow-customize-range"><span>Density</span><input type="range" min="0.82" max="1.18" step="0.02" value={prefs.density} onChange={e=>setPrefs({...prefs,density:+e.target.value})}/><b>{prefs.density.toFixed(2)}</b></label>
      <label className="glow-customize-range"><span>Type scale</span><input type="range" min="0.9" max="1.15" step="0.01" value={prefs.fontScale} onChange={e=>setPrefs({...prefs,fontScale:+e.target.value})}/><b>{Math.round(prefs.fontScale*100)}%</b></label>
      <label className="glow-customize-range"><span>Depth</span><input type="range" min="0" max="1.8" step="0.1" value={prefs.shadow} onChange={e=>setPrefs({...prefs,shadow:+e.target.value})}/><b>{prefs.shadow.toFixed(1)}</b></label>
      <div className="glow-customize-font"><span>Typography</span>{(['soft','serif','system'] as const).map(v=><button key={v} className={prefs.font===v?'active':''} onClick={()=>setPrefs({...prefs,font:v})}>{v}</button>)}</div>
      <button className={imageMode?'glow-customize-image active':'glow-customize-image'} onClick={()=>setImageMode(v=>!v)}><ImagePlus size={14}/>{imageMode?'Click any image to replace it':'Replace any image'}</button>
      <button className="glow-customize-reset" onClick={reset}><RotateCcw size={13}/>Reset this room</button>
      <div className="glow-customize-note"><SlidersHorizontal size={12}/>Changes save on this device automatically.</div>
      <input ref={input} type="file" accept="image/*" className="sr-only" onChange={choose}/>
    </div>:null}
  </>;
}
