'use client';

import { usePathname, useRouter } from 'next/navigation';
import { CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { QuickAddModule } from '@/components/quick-add/quick-add';

const ROOM_LABEL:Record<string,string>={
  '/dashboard':'Dashboard','/tasks':'Tasks & Planner','/calendar':'Calendar','/planning':'Planning','/routines':'Routines & Rituals','/habits':'Habits','/fitness':'Fitness Studio','/wellness':'Wellness Sanctuary','/food':'Food & Nutrition','/beauty':'Beauty OS','/beauty/lab':'Beauty Lab','/hair':'Hair','/finance':'Finance','/finance/brain':'Financial Brain','/goals':'Goals','/notes':'Notes','/settings':'Settings','/world':'Life World',
};

const DIRECT_ROUTES:Array<[RegExp,string]>=[
  [/view calendar|review calendar|calendar setup/i,'/calendar'],
  [/view habits|habit library|habit challenge/i,'/habits'],
  [/view finances|view budget|view cash flow|view net worth|view investments|spending intelligence/i,'/finance'],
  [/financial brain|cash flow forecast|plan this purchase|big purchases|see recommendations/i,'/finance/brain'],
  [/view meal plan|plan my meals|favorite recipes|view all recipes|view pantry|grocer|shopping list/i,'/food'],
  [/view projects|project roadmap|creative studio/i,'/projects'],
  [/view goals|goal timeline|vision board|milestones|achievements/i,'/goals'],
  [/view routine|view ritual|ritual calendar|routine stats|upcoming rituals|upcoming routines/i,'/routines'],
  [/hair inspiration|wash day plan|view hair|recent treatments/i,'/hair'],
  [/beauty lab|ingredient|compatibility|skin journal|product categories|view all inventory/i,'/beauty/lab'],
  [/beauty budget|upcoming treatments|view full analysis|beauty inventory|view wishlist/i,'/beauty'],
  [/sleep overview|wellness insights|self care ideas/i,'/wellness'],
  [/progress photos|view program|recovery tips|body stats/i,'/fitness'],
  [/life timeline|memory vault|view all memories|world map/i,'/world'],
  [/notes|notebook|templates|tags/i,'/notes'],
  [/integrations|security|privacy|data management|appearance|preferences|notifications|about glow/i,'/settings'],
];

const WORLD_PORTALS:Record<string,string>={
  'the sanctuary':'/home',home:'/home','inner world':'/brain',mind:'/brain','body world':'/fitness',fitness:'/fitness','glow world':'/beauty',beauty:'/beauty','wealth world':'/finance',finance:'/finance','adventure world':'/world?room=travel',travel:'/world?room=travel','purpose world':'/projects?room=career',career:'/projects?room=career','creation world':'/projects?room=creative',creativity:'/projects?room=creative',learning:'/resources','saint care':'/home?room=saint',
};

function clean(value:string){return value.replace(/\s+/g,' ').replace(/[→+✨✦]/g,'').trim();}
function slug(value:string){return clean(value).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function roomBase(pathname:string){
  if(pathname.startsWith('/beauty/lab'))return'/beauty/lab';
  if(pathname.startsWith('/finance/brain'))return'/finance/brain';
  return Object.keys(ROOM_LABEL).sort((a,b)=>b.length-a.length).find(route=>pathname.startsWith(route))??'/dashboard';
}
function quickModule(text:string):QuickAddModule|null{
  if(/add task|new task/i.test(text))return'task';
  if(/add event|new event/i.test(text))return'event';
  if(/add habit|new habit|build habit/i.test(text))return'habit';
  if(/create ritual|create routine|new ritual|new routine/i.test(text))return'routine';
  if(/add goal|new goal/i.test(text))return'goal';
  if(/new note|add note|journal note/i.test(text))return'note';
  if(/log.*check.?in|check in now|wellness check/i.test(text))return'wellness';
  if(/finance entry|add transaction|new transaction/i.test(text))return'finance';
  if(/beauty step/i.test(text))return'beauty';
  return null;
}
function isImageControl(control:HTMLElement){
  const aria=control.getAttribute('aria-label')??'';
  const text=clean(control.textContent??'');
  return /^(change|reset) /i.test(aria)||/^upload replacement/i.test(aria)||/^(change image|reset image)$/i.test(text);
}

export function ReferenceRoomInteractions(){
  const pathname=usePathname();
  const router=useRouter();
  const [notice,setNotice]=useState<string|null>(null);
  const currentRoom=useMemo(()=>roomBase(pathname),[pathname]);

  useEffect(()=>{
    let timer:number|undefined;
    const show=(message:string)=>{
      setNotice(message);
      window.clearTimeout(timer);
      timer=window.setTimeout(()=>setNotice(null),2600);
    };
    const openVault=(message?:string)=>{
      document.dispatchEvent(new CustomEvent('glow:vault-open'));
      show(message??`Opened the real ${ROOM_LABEL[currentRoom]??'Glow OS'} tool.`);
    };
    const openQuick=(module:QuickAddModule)=>{
      document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:{module}}));
      show(`Ready to ${module==='wellness'?'log your check-in':`add a ${module}`}.`);
    };

    const enhance=()=>{
      document.querySelectorAll<HTMLElement>('.reference-room span').forEach(element=>{
        const text=clean(element.textContent??'');
        if(/^(view|see|manage|edit|learn|how it|optimize|plan this|check now|more ideas)/i.test(text)){
          element.dataset.refLinklike='true';
          element.setAttribute('role','button');
          element.tabIndex=0;
        }
      });
      if(currentRoom==='/world'){
        document.querySelectorAll<HTMLElement>('.reference-room p').forEach(label=>{
          if(clean(label.textContent??'').toLowerCase()!=='enter room')return;
          const portal=label.closest<HTMLElement>('.group');
          if(portal){portal.dataset.refWorldPortal='true';portal.setAttribute('role','button');portal.tabIndex=0;}
        });
      }
    };
    enhance();
    const observer=new MutationObserver(enhance);
    const reference=document.querySelector('.reference-room');
    if(reference)observer.observe(reference,{subtree:true,childList:true});

    const activate=(target:HTMLElement)=>{
      if(target.closest('[data-glow-voice-open]'))return;
      const imageControl=target.closest<HTMLElement>('button');
      if(imageControl&&isImageControl(imageControl))return;

      const worldPortal=target.closest<HTMLElement>('[data-ref-world-portal="true"]');
      if(worldPortal){
        const text=clean(worldPortal.textContent??'').toLowerCase();
        const match=Object.entries(WORLD_PORTALS).find(([label])=>text.includes(label));
        if(match){router.push(match[1]);show(`Entering ${match[0]}.`);return;}
      }

      const control=target.closest<HTMLElement>('button,a,[data-ref-linklike="true"]');
      if(!control||!control.closest('.reference-room'))return;
      if(control.tagName==='A'&&control.getAttribute('href'))return;
      if(isImageControl(control))return;
      const aria=control.getAttribute('aria-label')??'';
      const text=clean(`${aria} ${control.textContent??''}`);
      if(!text)return;

      if(/^search\b/i.test(text)){router.push(`/brain?mode=search&from=${encodeURIComponent(currentRoom)}`);show('Opening Glow search across your life.');return;}
      if(/more options/i.test(text)){openVault('Opened this room’s full controls and preserved tools.');return;}
      const module=quickModule(text);
      if(module){openQuick(module);return;}

      const nav=control.closest('header nav');
      if(nav){
        const view=slug(control.textContent??'overview');
        const destination=view==='planner'&&currentRoom==='/tasks'?'/planning':`${currentRoom}?view=${view}`;
        router.push(destination);
        Array.from(nav.querySelectorAll('button')).forEach(button=>{
          button.classList.remove('border-[var(--ref-accent)]','text-[var(--ref-accent)]');
          button.classList.add('border-transparent','text-[#67564f]');
        });
        control.classList.remove('border-transparent','text-[#67564f]');
        control.classList.add('border-[var(--ref-accent)]','text-[var(--ref-accent)]');
        openVault(`${clean(control.textContent??'')} view opened with its real ${ROOM_LABEL[currentRoom]??'Glow OS'} tools.`);
        return;
      }

      if(/build my day|fix my day|plan my day/i.test(text)){router.push('/today');show('Opening Build My Day.');return;}
      if(/brain dump/i.test(text)){router.push('/intake?mode=brain-dump');show('Opening Brain Dump capture.');return;}
      if(/voice note/i.test(text)){document.dispatchEvent(new CustomEvent('glow:voice-open'));return;}
      if(/start focus/i.test(text)){router.push('/today?mode=focus');show('Opening your focus workspace.');return;}
      if(/start.*reset|prepare my reset/i.test(text)){router.push('/routines?view=reset');show('Opening your reset ritual.');return;}
      if(/start.*ritual|start.*routine|continue ritual/i.test(text)){router.push('/routines?view=player');openVault('Opened the guided ritual controls.');return;}
      if(/start workout/i.test(text)){router.push('/fitness?view=workout');openVault('Opened the live workout controls.');return;}
      if(/order online/i.test(text)){router.push('/food?view=groceries');openVault('Opened groceries so you can review the list before ordering.');return;}
      if(/ask.*coach|ask glow|do it for me|optimize my routine|get my focus plan|use this routine/i.test(text)){document.dispatchEvent(new CustomEvent('glow:voice-open'));show('Glow is ready with this room as context.');return;}
      if(/open today.?s flow/i.test(text)){router.push(currentRoom==='/dashboard'?'/today':`${currentRoom}?view=today`);openVault(`Opened today’s ${ROOM_LABEL[currentRoom]??'Glow OS'} flow.`);return;}

      const direct=DIRECT_ROUTES.find(([pattern])=>pattern.test(text));
      if(direct){router.push(direct[1]);show(`Opening ${clean(text)}.`);return;}

      if(control.closest('[data-reference-layout="settings"]')){
        router.push(`/settings?section=${slug(control.textContent??'preferences')}`);
        openVault(`${clean(control.textContent??'Settings')} opened.`);
        return;
      }

      openVault(`${clean(control.textContent??aria)} is connected to the real ${ROOM_LABEL[currentRoom]??'Glow OS'} workspace.`);
    };

    const click=(event:MouseEvent)=>{
      const target=event.target instanceof HTMLElement?event.target:null;
      if(!target||!target.closest('.reference-room'))return;
      const actionable=target.closest<HTMLElement>('button,[data-ref-linklike="true"],[data-ref-world-portal="true"]');
      if(!actionable)return;
      if(actionable.closest('[data-glow-voice-open]')||isImageControl(actionable))return;
      event.preventDefault();
      activate(target);
    };
    const key=(event:KeyboardEvent)=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      const target=event.target instanceof HTMLElement?event.target:null;
      if(!target?.matches('[data-ref-linklike="true"],[data-ref-world-portal="true"]'))return;
      event.preventDefault();activate(target);
    };
    document.addEventListener('click',click);
    document.addEventListener('keydown',key);
    return()=>{
      observer.disconnect();
      document.removeEventListener('click',click);
      document.removeEventListener('keydown',key);
      window.clearTimeout(timer);
    };
  },[currentRoom,router]);

  return notice?<div role="status" aria-live="polite" className="fixed bottom-[76px] left-1/2 z-[94] flex w-[min(430px,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-3 rounded-[16px] border border-[#e2d4cd] bg-[#fffaf6]/96 px-4 py-3 text-[#574742] shadow-[0_18px_48px_rgba(65,43,38,.18)] backdrop-blur-xl lg:left-auto lg:right-5 lg:translate-x-0"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0dfdc] text-[#ad707b]"><CheckCircle2 size={15}/></span><span className="min-w-0 flex-1 text-[9px] leading-4">{notice}</span><Sparkles size={13} className="text-[#c78b94]"/><ChevronRight size={13} className="text-[#a68f87]"/></div>:null;
}
