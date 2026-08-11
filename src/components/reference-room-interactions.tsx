'use client';

import { usePathname, useRouter } from 'next/navigation';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

type QuickModule='task'|'habit'|'routine'|'goal'|'event'|'note'|'beauty'|'wellness'|'finance';

const ROOM_LABELS:Record<string,string>={
  '/dashboard':'Dashboard','/today':'Today','/tomorrow':'Tomorrow','/tasks':'Tasks & Planner','/reminders':'Reminders','/calendar':'Calendar','/planning':'Planning','/routines':'Routines & Rituals','/habits':'Habits','/fitness':'Fitness Studio','/wellness':'Wellness Sanctuary','/maintenance':'Maintenance','/food':'Food & Nutrition','/beauty/lab':'Beauty Lab','/beauty':'Beauty OS','/hair':'Hair','/finance/brain':'Financial Brain','/finance':'Finance','/goals':'Goals','/projects':'Projects & Creative Studio','/brain':'AI Brain','/concierge':'Glow Concierge','/observations':'Intelligent Observations','/memory':'Memory Vault','/timeline':'Life Timeline','/briefings':'Briefings','/closet':'Closet','/home':'Home Sanctuary','/inbox':'Glow Inbox','/intake':'Universal Intake','/rules':'Personal Rules','/resources':'Resources','/connections':'Connections','/gmail':'Gmail Intelligence','/import':'Import Center','/notes':'Notes','/settings':'Settings','/world':'Life World'
};

function baseRoute(pathname:string){
  const keys=Object.keys(ROOM_LABELS).sort((a,b)=>b.length-a.length);
  return keys.find(route=>pathname===route||pathname.startsWith(`${route}/`))??'/dashboard';
}
function tidy(text:string){return text.replace(/\s+/g,' ').replace(/[→+✨✦]/g,'').trim();}
function slug(text:string){return tidy(text).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');}
function quickModule(text:string):QuickModule|null{
  if(/add task|new task/i.test(text))return'task';
  if(/add event|new event/i.test(text))return'event';
  if(/add habit|new habit|build habit/i.test(text))return'habit';
  if(/create ritual|create routine|new ritual|new routine/i.test(text))return'routine';
  if(/add goal|new goal/i.test(text))return'goal';
  if(/new note|add note|journal note/i.test(text))return'note';
  if(/check in|wellness check/i.test(text))return'wellness';
  if(/finance entry|add transaction|new transaction/i.test(text))return'finance';
  if(/beauty step/i.test(text))return'beauty';
  return null;
}
function isImageButton(button:HTMLButtonElement){
  const aria=button.getAttribute('aria-label')??'';
  const text=tidy(button.textContent??'');
  return /^(change|reset) /i.test(aria)||/^(change image|reset image)$/i.test(text);
}

export function ReferenceRoomInteractions(){
  const pathname=usePathname();
  const router=useRouter();
  const [message,setMessage]=useState('');

  useEffect(()=>{
    let timeout:number|undefined;
    const say=(text:string)=>{
      setMessage(text);
      if(timeout)window.clearTimeout(timeout);
      timeout=window.setTimeout(()=>setMessage(''),2400);
    };
    const openVault=(text:string)=>{
      document.dispatchEvent(new Event('glow:vault-open'));
      say(text);
    };
    const openQuick=(module:QuickModule)=>{
      document.dispatchEvent(new CustomEvent('glow:quick-add',{detail:{module}}));
      say(`Ready to add ${module==='wellness'?'a wellness check-in':`a ${module}`}.`);
    };

    const onClick=(event:MouseEvent)=>{
      const element=event.target instanceof Element?event.target:null;
      if(!element||!element.closest('.reference-room'))return;
      const button=element.closest('button') as HTMLButtonElement|null;
      if(!button||isImageButton(button)||button.hasAttribute('data-glow-voice-open'))return;
      const text=tidy(`${button.getAttribute('aria-label')??''} ${button.textContent??''}`);
      if(!text)return;
      event.preventDefault();

      const room=baseRoute(pathname);
      const label=ROOM_LABELS[room]??'Glow OS';
      const module=quickModule(text);
      if(module){openQuick(module);return;}
      if(/^search/i.test(text)){router.push(`/brain?mode=search&from=${encodeURIComponent(room)}`);say('Opening Glow search.');return;}
      if(/more options/i.test(text)){openVault(`Opened all ${label} controls.`);return;}
      if(button.closest('header nav')){
        const view=slug(button.textContent??'overview');
        if(room==='/tasks'&&view==='planner')router.push('/planning');
        else router.push(`${room}?view=${view}`);
        openVault(`${tidy(button.textContent??'')} view is ready.`);
        return;
      }
      if(/build my day|fix my day|plan my day/i.test(text)){router.push('/today');say('Opening Build My Day.');return;}
      if(/brain dump/i.test(text)){router.push('/intake?mode=brain-dump');say('Opening Brain Dump.');return;}
      if(/start focus/i.test(text)){router.push('/today?mode=focus');say('Opening Focus Mode.');return;}
      if(/start.*workout/i.test(text)){router.push('/fitness?view=workout');openVault('Live workout controls opened.');return;}
      if(/start.*ritual|start.*routine|continue ritual|start.*reset|prepare my reset/i.test(text)){router.push('/routines?view=player');openVault('Guided ritual controls opened.');return;}
      if(/ask glow|ask.*coach|do it for me|optimize my routine|get my focus plan|use this routine/i.test(text)){document.dispatchEvent(new Event('glow:voice-open'));say('Glow Voice opened with this room as context.');return;}
      if(/review calendar|view calendar/i.test(text)){router.push('/calendar');say('Opening Calendar.');return;}
      if(/view habits|habit library|habit challenge/i.test(text)){router.push('/habits');say('Opening Habits.');return;}
      if(/view finances|view budget|view cash flow|view net worth|view investments/i.test(text)){router.push('/finance');say('Opening Finance.');return;}
      if(/cash flow forecast|big purchase|financial brain|see recommendations/i.test(text)){router.push('/finance/brain');say('Opening Financial Brain.');return;}
      if(/meal plan|grocer|shopping list|recipe|pantry/i.test(text)){router.push('/food');say('Opening Food & Nutrition.');return;}
      if(/project|creative studio/i.test(text)){router.push('/projects');say('Opening Projects & Creative Studio.');return;}
      if(/goal|milestone|vision board|achievement/i.test(text)){router.push('/goals');say('Opening Goals.');return;}
      if(/hair|wash day/i.test(text)){router.push('/hair');say('Opening Hair.');return;}
      if(/ingredient|compatibility|skin journal|inventory/i.test(text)){router.push('/beauty/lab');say('Opening Beauty Lab.');return;}
      if(/beauty|treatment|wishlist/i.test(text)){router.push('/beauty');say('Opening Beauty OS.');return;}
      if(/sleep|wellness|self care/i.test(text)){router.push('/wellness');say('Opening Wellness Sanctuary.');return;}
      if(/progress photo|recovery|body stat|program/i.test(text)){router.push('/fitness');say('Opening Fitness Studio.');return;}
      if(/memory|world map|life timeline/i.test(text)){router.push('/world');say('Opening Life World.');return;}
      if(/note|notebook|template|tag/i.test(text)){router.push('/notes');say('Opening Notes.');return;}
      if(/integration|security|privacy|data management|preference|notification|appearance|save changes/i.test(text)){router.push(`/settings?section=${slug(button.textContent??'settings')}`);openVault('Settings controls opened.');return;}
      if(/open today.?s flow/i.test(text)){router.push(room==='/dashboard'?'/today':`${room}?view=today`);openVault(`Today’s ${label} tools opened.`);return;}

      openVault(`${tidy(button.textContent??button.getAttribute('aria-label')??'Control')} is connected to the real ${label} tools.`);
    };

    document.addEventListener('click',onClick);
    return()=>{
      document.removeEventListener('click',onClick);
      if(timeout)window.clearTimeout(timeout);
    };
  },[pathname,router]);

  if(!message)return null;
  return <div role="status" aria-live="polite" className="fixed bottom-[76px] left-1/2 z-[94] flex w-[min(430px,calc(100vw-1.5rem))] -translate-x-1/2 items-center gap-3 rounded-[16px] border border-[#e2d4cd] bg-[#fffaf6]/96 px-4 py-3 text-[#574742] shadow-[0_18px_48px_rgba(65,43,38,.18)] backdrop-blur-xl lg:left-auto lg:right-5 lg:translate-x-0"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f0dfdc] text-[#ad707b]"><CheckCircle2 size={15}/></span><span className="min-w-0 flex-1 text-[9px] leading-4">{message}</span><Sparkles size={13} className="text-[#c78b94]"/></div>;
}
