'use client';

import { useEffect } from 'react';

function isPrimaryBottomAsk(button:HTMLButtonElement){
  const fixed=button.closest('div.fixed');
  const text=fixed?.textContent?.replace(/\s+/g,' ').trim().toLowerCase()??'';
  return text.includes('home')&&text.includes('ask glow')&&text.includes('search')&&text.includes('worlds');
}

function cleanupLegacyGlowControls(){
  document.querySelectorAll<HTMLButtonElement>('button').forEach(button=>{
    const text=button.textContent?.replace(/\s+/g,' ').trim().toLowerCase()??'';
    const aria=(button.getAttribute('aria-label')??'').toLowerCase();
    if(text==='ask glow'&&!isPrimaryBottomAsk(button))button.style.display='none';
    if(text.includes('speak or type anything'))button.style.display='none';
    if(aria.includes('open glow assistant'))button.style.display='none';
    if(aria.includes('open glow voice')||aria==='ask glow'){
      if(!isPrimaryBottomAsk(button))button.style.display='none';
    }
  });
}

export function LegacyGlowUiCleanup(){
  useEffect(()=>{
    cleanupLegacyGlowControls();
    const observer=new MutationObserver(cleanupLegacyGlowControls);
    observer.observe(document.body,{childList:true,subtree:true});
    return()=>observer.disconnect();
  },[]);
  return null;
}
