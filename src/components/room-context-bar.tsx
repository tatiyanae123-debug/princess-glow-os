'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Focus } from 'lucide-react';

const CONTEXT:Record<string,[string,string,string]>={
  '/tasks':['Choose the one task that deserves your attention first.','Review what belongs today after the current task.','Keep lower-priority work out of sight until you need it.'],
  '/calendar':['See the next commitment that affects your day.','Review the next block of scheduled time.','Keep future dates available without crowding today.'],
  '/planning':['Protect your Top Three.','Review this week’s appointments and deadlines.','Keep monthly and quarterly planning one layer deeper.'],
  '/routines':['Continue the current ritual step.','See the next step only when you are ready.','Keep the full ritual library available but quiet.'],
  '/fitness':['Do the current exercise.','See the next exercise and recovery cue.','Keep progress history and programs deeper.'],
  '/wellness':['Check in with how you feel right now.','Reveal the next useful recommendation after the check-in.','Keep trends and history calm in the background.'],
  '/food':['Handle the meal or prep task in front of you.','See the next meal and grocery need.','Keep pantry, recipes and nutrition details deeper.'],
  '/beauty':['Do the beauty step that belongs now.','See tonight or the next treatment.','Keep progress and history one level deeper.'],
  '/hair':['See your current hair phase and immediate care.','Prepare for the next wash, treatment or style change.','Keep products, growth and history deeper.'],
  '/finance':['Know what is true right now.','See the next bill, transfer or savings move.','Keep reports and long-range analysis deeper.'],
  '/projects':['Work on one active project action.','See the next milestone after this action.','Keep the rest of the portfolio quiet.'],
  '/goals':['Move one priority goal forward.','See the next milestone or supporting habit.','Keep lower-priority goals in the background.'],
};

function contextFor(pathname:string){
  const key=Object.keys(CONTEXT).sort((a,b)=>b.length-a.length).find(path=>pathname.startsWith(path));
  return key?CONTEXT[key]:['See what matters most in this room.','Review what is coming next.','Keep everything else available without showing it all at once.'];
}

export function RoomContextBar(){
  const pathname=usePathname();const router=useRouter();
  if(pathname.startsWith('/world'))return null;
  const [now,next,later]=contextFor(pathname);
  function enterFocus(){const params=new URLSearchParams(window.location.search);params.set('focus','1');router.push(`${pathname}?${params.toString()}`);window.setTimeout(()=>document.dispatchEvent(new Event('glow:focus-changed')),0);}
  return <div className="mb-7 space-y-3">
    <div className="flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[.14em] text-[#9A9A9F]">Now · Next · Later</p><button type="button" onClick={enterFocus} className="inline-flex h-9 items-center gap-2 rounded-full border border-[#E7E7E7] bg-white px-3 text-[12px] font-medium text-[#5A5A5F] hover:bg-[#FAFAFA]"><Focus size={14}/>Focus Mode</button></div>
    <div className="glow-temporal-strip"><div className="glow-temporal-item"><p className="glow-temporal-label">Now</p><p className="glow-temporal-value">{now}</p></div><div className="glow-temporal-item"><p className="glow-temporal-label">Next</p><p className="glow-temporal-value">{next}</p></div><div className="glow-temporal-item"><p className="glow-temporal-label">Later</p><p className="glow-temporal-value">{later}</p></div></div>
  </div>;
}
