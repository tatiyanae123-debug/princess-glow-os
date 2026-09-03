'use client';

import { useEffect } from 'react';

type GlowNavigateDetail = {
  href?: string;
  label?: string;
};

export function GlowNavigationNormalizer(){
  useEffect(()=>{
    const normalize=(event:Event)=>{
      const custom=event as CustomEvent<GlowNavigateDetail>;
      const detail=custom.detail;
      if(!detail)return;
      const label=detail.label??'';
      if(/^Create(?:\s|·|$)/i.test(label)) detail.href='/create';
      if(/^Today(?:\s|·|$)/i.test(label)&&detail.href==='/dashboard') detail.href='/today';
      if(/^Life(?:\s|·|$)/i.test(label)&&detail.href==='/life') detail.href='/world';
    };
    window.addEventListener('glow:navigate',normalize,true);
    return()=>window.removeEventListener('glow:navigate',normalize,true);
  },[]);
  return null;
}
