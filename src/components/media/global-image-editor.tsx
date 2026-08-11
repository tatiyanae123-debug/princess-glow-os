'use client';

import { Check, ImagePlus, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

function keyFor(pathname:string, image:HTMLImageElement){
  const images=Array.from(document.images);
  const index=images.indexOf(image);
  const original=image.dataset.glowOriginalSrc||image.getAttribute('src')||`image-${index}`;
  return `glow:any-image:${pathname}:${index}:${original.slice(0,90)}`;
}

export function GlobalImageEditor(){
  const pathname=usePathname();
  const [enabled,setEnabled]=useState(false);
  const [message,setMessage]=useState('');
  const targetRef=useRef<HTMLImageElement|null>(null);
  const inputRef=useRef<HTMLInputElement>(null);

  useEffect(()=>{
    const images=Array.from(document.images);
    images.forEach((image)=>{
      if(!image.dataset.glowOriginalSrc) image.dataset.glowOriginalSrc=image.getAttribute('src')||'';
      try{const override=window.localStorage.getItem(keyFor(pathname,image));if(override)image.src=override;}catch{/* ignore */}
    });
  },[pathname]);

  useEffect(()=>{
    if(!enabled)return;
    const onClick=(event:MouseEvent)=>{
      const image=event.target instanceof HTMLImageElement?event.target:null;
      if(!image)return;
      event.preventDefault(); event.stopPropagation();
      targetRef.current=image; inputRef.current?.click();
    };
    const onOver=(event:MouseEvent)=>{if(event.target instanceof HTMLImageElement)event.target.classList.add('glow-image-edit-target');};
    const onOut=(event:MouseEvent)=>{if(event.target instanceof HTMLImageElement)event.target.classList.remove('glow-image-edit-target');};
    document.addEventListener('click',onClick,true);document.addEventListener('mouseover',onOver,true);document.addEventListener('mouseout',onOut,true);
    return()=>{document.removeEventListener('click',onClick,true);document.removeEventListener('mouseover',onOver,true);document.removeEventListener('mouseout',onOut,true);document.querySelectorAll('.glow-image-edit-target').forEach(node=>node.classList.remove('glow-image-edit-target'));};
  },[enabled]);

  function replace(event:React.ChangeEvent<HTMLInputElement>){
    const file=event.target.files?.[0];const image=targetRef.current;if(!file||!image||!file.type.startsWith('image/'))return;
    const reader=new FileReader();reader.onload=()=>{if(typeof reader.result!=='string')return;try{window.localStorage.setItem(keyFor(pathname,image),reader.result);}catch{/* local quota */}image.src=reader.result;setMessage('Image changed.');setTimeout(()=>setMessage(''),1400);};reader.readAsDataURL(file);event.target.value='';
  }

  return <div className="fixed bottom-[76px] right-4 z-[92] sm:right-5 lg:bottom-5 lg:right-[292px]">
    {message?<div className="mb-2 rounded-full border border-[#ded2cb] bg-[#fffaf6]/95 px-3 py-2 text-[8px] shadow-lg"><Check size={11} className="mr-1 inline text-emerald-700"/>{message}</div>:null}
    <button type="button" onClick={()=>setEnabled(value=>!value)} className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-[8px] font-semibold shadow-[0_12px_28px_rgba(70,50,42,.15)] backdrop-blur ${enabled?'border-[#c88992] bg-[#c88992] text-white':'border-[#e2d5cf] bg-[#fffaf6]/92 text-[#765f58]'}`} aria-pressed={enabled}>{enabled?<X size={12}/>:<ImagePlus size={12}/>} {enabled?'Done changing images':'Change Images'}</button>
    <input ref={inputRef} type="file" accept="image/*" onChange={replace} className="sr-only" aria-label="Choose replacement image"/>
  </div>;
}
