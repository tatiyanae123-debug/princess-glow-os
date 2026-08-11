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
      const action=button.getAttribute('data-ref-action')||'vault';
      if(action.startsWith('quick:')){
        const name=action.substring(6);
        document.dispatchEvent(new Event('glow:quick-add-'+name));
        return;
      }
      document.dispatchEvent(new Event('glow:vault-open'));
    }
    document.addEventListener('click',handleClick);
    return()=>document.removeEventListener('click',handleClick);
  },[]);
  return null;
}
