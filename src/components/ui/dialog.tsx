'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Dialog({ open, onClose, title, description, children, className }: { open:boolean; onClose:()=>void; title:string; description?:string; children:React.ReactNode; className?:string; }) {
  useEffect(()=>{if(!open)return;const handleKey=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose();};document.addEventListener('keydown',handleKey);const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.removeEventListener('keydown',handleKey);document.body.style.overflow=previousOverflow;};},[open,onClose]);
  if(!open)return null;

  return <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="glow-dialog-title">
    <div className="absolute inset-0 animate-fade-in bg-[#332824]/35 backdrop-blur-[3px]" onClick={onClose}/>
    <div className={cn('paper-card relative max-h-[92vh] w-full overflow-y-auto rounded-t-[18px] p-5 shadow-[0_30px_80px_rgba(52,37,31,.18)] animate-fade-in sm:max-w-lg sm:rounded-[16px] sm:p-6',className)}>
      <div className="mb-5 border-b border-[#F1E7E3] pb-4 pt-1">
        <div className="flex items-start justify-between gap-3"><div><p className="glow-eyebrow">Glow OS entry</p><h2 id="glow-dialog-title" className="glow-display mt-1 text-[23px] font-medium text-[#2B2420]">{title}</h2>{description?<p className="mt-1 text-[11px] leading-4 text-[#8A8078]">{description}</p>:null}</div><button type="button" onClick={onClose} aria-label="Close dialog" className="shrink-0 rounded-full border border-[#F1E7E3] bg-white p-1.5 text-[#8A8078] hover:bg-[#FDF8F6]"><X size={14}/></button></div>
      </div>
      {children}
    </div>
  </div>;
}
