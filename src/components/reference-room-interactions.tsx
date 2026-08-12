'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export function ReferenceRoomInteractions(){
  const router=useRouter();
  const pathname=usePathname();

  useEffect(()=>{
    try{
      const saved=window.localStorage.getItem(`glow:last-view:${pathname}`);
      const current=new URLSearchParams(window.location.search).get('view');
      if(saved&&!current){router.replace(`${pathname}?view=${encodeURIComponent(saved)}`);}
    }catch{/* local storage unavailable */}
  },[pathname,router]);

  useEffect(()=>{
    function handleClick(event:MouseEvent){
      const target=event.target;
      if(!(target instanceof Element)) return;
      if(!target.closest('.reference-room')) return;
      const button=target.closest('button');
      if(!(button instanceof HTMLButtonElement)) return;
      if(button.hasAttribute('data-glow-voice-open')) return;
      const aria=button.getAttribute('aria-label')||'';
      if(aria.startsWith('Change ')||aria.startsWith('Reset ')||aria.startsWith('Upload replacement')) return;
      const action=button.getAttribute('data-ref-action');
      if(!action) return;
      event.preventDefault();

      if(action.startsWith('navigate:')){router.push(action.substring('navigate:'.length));return;}
      if(action.startsWith('quick:')){document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:{module:action.substring('quick:'.length)}}));return;}
      if(action.startsWith('view:')){
        const view=action.substring('view:'.length);
        try{window.localStorage.setItem(`glow:last-view:${pathname}`,view);}catch{/* ignore */}
        router.push(`${pathname}?view=${encodeURIComponent(view)}`);
        document.dispatchEvent(new Event('glow:vault-open'));
        return;
      }
      if(action==='voice'){document.dispatchEvent(new Event('glow:voice-open'));return;}
      document.dispatchEvent(new Event('glow:vault-open'));
    }
    document.addEventListener('click',handleClick);
    return()=>document.removeEventListener('click',handleClick);
  },[pathname,router]);
  return null;
}
