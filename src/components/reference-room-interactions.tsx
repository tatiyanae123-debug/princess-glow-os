'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

function slug(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}

function inferredDestination(pathname:string,label:string){
  const text=label.trim().replace(/\s+/g,' ').toLowerCase();
  if(!text) return null;
  if(text.includes('view all task')||text==='tasks') return '/tasks';
  if(text.includes('view calendar')||text==='calendar') return '/calendar';
  if(text.includes('brief')) return '/briefings';
  if(text.includes('goal')) return '/goals';
  if(text.includes('project')) return '/projects';
  if(text.includes('finance')||text.includes('budget')||text.includes('spending')) return '/finance';
  if(text.includes('financial brain')||text.includes('forecast')||text.includes('scenario')) return '/finance/brain';
  if(text.includes('beauty lab')||text.includes('ingredient')||text.includes('product')) return '/beauty/lab';
  if(text.includes('beauty')) return '/beauty';
  if(text.includes('hair')||text.includes('wash day')) return '/hair';
  if(text.includes('wellness')||text.includes('meditat')||text.includes('breathe')) return '/wellness';
  if(text.includes('meal')||text.includes('grocery')||text.includes('pantry')||text.includes('recipe')) return '/food';
  if(text.includes('habit')) return '/habits';
  if(text.includes('routine')||text.includes('ritual')||text.includes('reset')) return '/routines';
  if(text.includes('plan')) return '/planning';
  if(text.includes('note')||text.includes('journal')) return '/notes';
  if(text.includes('setting')||text.includes('preference')||text.includes('appearance')||text.includes('notification')||text.includes('privacy')) return '/settings';
  if(text.includes('inbox')) return '/inbox';
  if(text.includes('life world')||text.includes('enter your world')||text.includes('world')) return '/world';
  if(text.includes('glow')||text.includes('ask')) return '/brain';
  if(text.includes('new task')||text.includes('add task')) return 'quick:task';
  if(text.includes('new event')||text.includes('add event')) return 'quick:event';
  if(text.includes('add meal')) return 'quick:meal';
  if(text.includes('add habit')) return 'quick:habit';
  if(text.includes('add note')||text.includes('new note')) return 'quick:note';
  if(text.includes('add product')) return 'quick:beauty';
  if(text.includes('add')||text.includes('create')||text.includes('new ')) return 'quick:task';
  return `${pathname}?view=${encodeURIComponent(slug(text).slice(0,60)||'details')}`;
}

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
        return;
      }
      if(action==='voice'){document.dispatchEvent(new Event('glow:voice-open'));return;}
      if(action==='advanced'){document.dispatchEvent(new Event('glow:vault-open'));return;}

      const destination=inferredDestination(pathname,button.innerText||button.textContent||'');
      if(!destination) return;
      if(destination.startsWith('quick:')){
        document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:{module:destination.substring('quick:'.length)}}));
        return;
      }
      router.push(destination);
    }
    document.addEventListener('click',handleClick);
    return()=>document.removeEventListener('click',handleClick);
  },[pathname,router]);
  return null;
}
