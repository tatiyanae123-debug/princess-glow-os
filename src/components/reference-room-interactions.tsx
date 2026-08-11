'use client';

import { useEffect } from 'react';

export function ReferenceRoomInteractions(){
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

      event.preventDefault();
      const action=button.dataset.refAction||'vault';

      if(action==='vault'){
        document.dispatchEvent(new Event('glow:vault-open'));
        return;
      }
      if(action==='voice'){
        document.dispatchEvent(new Event('glow:voice-open'));
        return;
      }
      if(action==='quick'){
        const quick=document.querySelector('button[aria-label="Quick add"]');
        if(quick instanceof HTMLButtonElement) quick.click();
        return;
      }
      if(action.startsWith('quick:')){
        const module=action.slice(6);
        document.dispatchEvent(new Event(`glow:quick-add-${module}`));
        return;
      }
      if(action.startsWith('navigate:')){
        window.location.assign(action.slice(9));
        return;
      }
      if(action.startsWith('view:')){
        const view=encodeURIComponent(action.slice(5));
        window.history.replaceState(null,'',`${window.location.pathname}?view=${view}`);
        document.dispatchEvent(new Event('glow:vault-open'));
        return;
      }
      document.dispatchEvent(new Event('glow:vault-open'));
    }
    document.addEventListener('click',handleClick);
    return()=>document.removeEventListener('click',handleClick);
  },[]);
  return null;
}
