'use client';

import { useEffect, useMemo, useState } from 'react';

export function FocusCountdown({plannedMinutes=25,startedAt}:{plannedMinutes?:number;startedAt?:string|null}){
 const target=useMemo(()=>startedAt?new Date(startedAt).getTime()+plannedMinutes*60_000:null,[plannedMinutes,startedAt]);
 const [seconds,setSeconds]=useState(()=>target?Math.max(0,Math.ceil((target-Date.now())/1000)):plannedMinutes*60);
 useEffect(()=>{setSeconds(target?Math.max(0,Math.ceil((target-Date.now())/1000)):plannedMinutes*60);if(!target)return;const id=window.setInterval(()=>setSeconds(Math.max(0,Math.ceil((target-Date.now())/1000))),1000);return()=>window.clearInterval(id)},[target,plannedMinutes]);
 const min=Math.floor(seconds/60);const sec=String(seconds%60).padStart(2,'0');
 return <strong className="mt-3 font-serif text-[42px] font-normal tracking-[-.04em]" aria-live="polite">{min}:{sec}</strong>;
}
