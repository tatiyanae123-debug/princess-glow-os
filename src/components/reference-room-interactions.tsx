'use client';

import { useEffect } from 'react';

const ROUTES:Array<[RegExp,string]>=[
  [/build my day|fix my day|plan my day/i,'/today'],
  [/brain dump/i,'/intake?mode=brain-dump'],
  [/start focus/i,'/today?mode=focus'],
  [/start.*workout|progress photo|recovery|body stat|view program/i,'/fitness'],
  [/start.*ritual|start.*routine|continue ritual|start.*reset|prepare my reset|view ritual|view routine/i,'/routines'],
  [/review calendar|view calendar|calendar setup/i,'/calendar'],
  [/view habits|habit library|habit challenge/i,'/habits'],
  [/view finances|view budget|view cash flow|view net worth|view investments/i,'/finance'],
  [/cash flow forecast|big purchase|financial brain|see recommendations/i,'/finance/brain'],
  [/meal plan|grocer|shopping list|recipe|pantry|order online/i,'/food'],
  [/project|creative studio/i,'/projects'],
  [/goal|milestone|vision board|achievement/i,'/goals'],
  [/hair|wash day/i,'/hair'],
  [/ingredient|compatibility|skin journal|product categories|inventory/i,'/beauty/lab'],
  [/beauty|treatment|wishlist/i,'/beauty'],
  [/sleep|wellness|self care/i,'/wellness'],
  [/memory|world map|life timeline/i,'/world'],
  [/note|notebook|template|tag/i,'/notes'],
  [/integration|security|privacy|data management|preference|notification|appearance/i,'/settings'],
];

function textOf(button:HTMLButtonElement){
  return `${button.getAttribute('aria-label')??''} ${button.textContent??''}`.replace(/\s+/g,' ').trim();
}
function slug(value:string){
  return value.toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}
function quickModule(text:string){
  if(/add task|new task/i.test(text))return'task';
  if(/add event|new event/i.test(text))return'event';
  if(/add habit|new habit|build habit/i.test(text))return'habit';
  if(/create ritual|create routine|new ritual|new routine/i.test(text))return'routine';
  if(/add goal|new goal/i.test(text))return'goal';
  if(/new note|add note|journal note/i.test(text))return'note';
  if(/check in|wellness check/i.test(text))return'wellness';
  if(/finance entry|add transaction|new transaction/i.test(text))return'finance';
  if(/beauty step/i.test(text))return'beauty';
  return'';
}
function imageButton(button:HTMLButtonElement){
  const text=textOf(button);
  return /change image|reset image|^Change |^Reset /i.test(text);
}

export function ReferenceRoomInteractions(){
  useEffect(()=>{
    const click=(event:MouseEvent)=>{
      const node=event.target;
      if(!(node instanceof Element))return;
      if(!node.closest('.reference-room'))return;
      const found=node.closest('button');
      if(!(found instanceof HTMLButtonElement))return;
      if(found.hasAttribute('data-glow-voice-open')||imageButton(found))return;

      const text=textOf(found);
      if(!text)return;
      const module=quickModule(text);
      if(module){
        event.preventDefault();
        document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:{module}}));
        return;
      }
      if(/^Search\b/i.test(text)){
        event.preventDefault();
        window.location.assign('/brain?mode=search');
        return;
      }
      if(/More options/i.test(text)){
        event.preventDefault();
        document.dispatchEvent(new Event('glow:vault-open'));
        return;
      }
      if(found.closest('header nav')){
        event.preventDefault();
        const view=slug(found.textContent??'overview');
        const path=window.location.pathname;
        if(path.startsWith('/tasks')&&view==='planner')window.location.assign('/planning');
        else window.location.assign(`${path}?view=${view}`);
        return;
      }
      if(/ask glow|ask.*coach|do it for me|optimize my routine|get my focus plan|use this routine/i.test(text)){
        event.preventDefault();
        document.dispatchEvent(new Event('glow:voice-open'));
        return;
      }
      if(/open today.?s flow/i.test(text)){
        event.preventDefault();
        const path=window.location.pathname;
        window.location.assign(path.startsWith('/dashboard')?'/today':`${path}?view=today`);
        return;
      }
      const route=ROUTES.find(([pattern])=>pattern.test(text));
      if(route){
        event.preventDefault();
        window.location.assign(route[1]);
        return;
      }

      event.preventDefault();
      document.dispatchEvent(new Event('glow:vault-open'));
    };
    document.addEventListener('click',click);
    return()=>document.removeEventListener('click',click);
  },[]);
  return null;
}
