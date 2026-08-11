'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function ReferenceRoomInteractions(){
  const router=useRouter();

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

      if(action.startsWith('navigate:')){
        router.push(action.substring('navigate:'.length));
        return;
      }
      if(action.startsWith('quick:')){
        const name=action.substring('quick:'.length);
        document.dispatchEvent(new Event('glow:quick-add-'+name));
        return;
      }
      if(action.startsWith('view:')){
        document.dispatchEvent(new CustomEvent('glow:reference-view',{detail:{view:action.substring('view:'.length)}}));
        return;
      }
      if(action==='voice'){
        document.dispatchEvent(new Event('glow:voice-open'));
        return;
      }
      document.dispatchEvent(new Event('glow:vault-open'));
    }
    document.addEventListener('click',handleClick);
    return()=>document.removeEventListener('click',handleClick);
  },[router]);
  return null;
}
