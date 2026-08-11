'use client';

import { useEffect } from 'react';

function quickModule(text:string){
  if(/add task|new task/i.test(text)) return 'task';
  if(/add event|new event/i.test(text)) return 'event';
  if(/add habit|new habit|build habit/i.test(text)) return 'habit';
  if(/create ritual|create routine|new ritual|new routine/i.test(text)) return 'routine';
  if(/add goal|new goal/i.test(text)) return 'goal';
  if(/new note|add note|journal note/i.test(text)) return 'note';
  if(/check in|wellness check/i.test(text)) return 'wellness';
  if(/finance entry|add transaction|new transaction/i.test(text)) return 'finance';
  if(/beauty step/i.test(text)) return 'beauty';
  return '';
}

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
      const text=`${aria} ${button.textContent||''}`.replace(/\s+/g,' ').trim();
      const module=quickModule(text);
      event.preventDefault();
      if(module){
        document.dispatchEvent(new Event(`glow:quick-add-${module}`));
        return;
      }
      document.dispatchEvent(new Event('glow:vault-open'));
    }
    document.addEventListener('click',handleClick);
    return()=>document.removeEventListener('click',handleClick);
  },[]);
  return null;
}
