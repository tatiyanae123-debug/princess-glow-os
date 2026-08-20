'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, ChevronRight, CloudRain, Gauge, MoonStar, Play, Sparkles, SunMedium, WandSparkles } from 'lucide-react';

type Energy = 'High' | 'Normal' | 'Low' | 'Exhausted';
type WellnessEnergy = 'low' | 'medium' | 'high' | 'exhausted' | null;
type EventLite = { id:string; title:string; startAt:string; allDay:boolean };
type TaskLite = { id:string; title:string; priority:string; dueDate:string|null };
type RoutineLite = { key:string; name:string; steps:{title:string}[] } | null;
type WorkoutLite = { name:string; purpose:string };
type Props = { modeName:string; tasks:TaskLite[]; events:EventLite[]; energy:WellnessEnergy; morningRoutine:RoutineLite; workout:WorkoutLite };
type WeatherState = { status:'idle'|'loading'|'ready'|'error'; summary:string; detail:string; rain:boolean };

const ENERGY_LIMIT:Record<Energy,number> = { High:3, Normal:3, Low:2, Exhausted:1 };
const READY_STEPS = [
  { title:'Hair refresh', detail:'10 min', href:'/hair' },
  { title:'Beauty', detail:'Quick makeup · 18 min', href:'/beauty' },
  { title:'Outfit', detail:'Weather-aware choice', href:'/closet' },
  { title:'Bag', detail:'Essentials + first-event prep', href:'/today' },
];

function clock(value:string){return new Date(value).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}
function daypart(hour:number){if(hour<10)return'Morning';if(hour<16)return'Afternoon';if(hour<20)return'Evening';return'Night'}
function normalizeEnergy(value:WellnessEnergy):Energy{if(value==='high')return'High';if(value==='low')return'Low';if(value==='exhausted')return'Exhausted';return'Normal'}

export function MorningIntelligenceBriefing({modeName,tasks,events,energy,morningRoutine,workout}:Props){
  const [now,setNow]=useState(()=>new Date());
  const [selectedEnergy,setSelectedEnergy]=useState<Energy>(normalizeEnergy(energy));
  const [accepted,setAccepted]=useState(false);
  const [showWhy,setShowWhy]=useState(false);
  const [simplified,setSimplified]=useState(false);
  const [expandedArc,setExpandedArc]=useState<string|null>('Morning');
  const [gettingReady,setGettingReady]=useState(false);
  const [readyIndex,setReadyIndex]=useState(0);
  const [weather,setWeather]=useState<WeatherState>({status:'idle',summary:'Check today’s weather',detail:'Glow will translate it into useful preparation.',rain:false});
  const [question,setQuestion]=useState('');
  const [answer,setAnswer]=useState('');
  const [asking,setAsking]=useState(false);
  const [nightDraft,setNightDraft]=useState<string[]>([]);

  useEffect(()=>{const timer=window.setInterval(()=>setNow(new Date()),60000);return()=>window.clearInterval(timer)},[]);
  useEffect(()=>{
    const saved=window.localStorage.getItem('glow-morning-energy') as Energy|null;
    if(saved&&ENERGY_LIMIT[saved])setSelectedEnergy(saved);
    try{
      const raw=window.localStorage.getItem('glow-tomorrow-top3');
      if(raw){const parsed=JSON.parse(raw) as {date?:string;titles?:string[]};const today=new Date().toISOString().slice(0,10);if(parsed.date===today&&Array.isArray(parsed.titles))setNightDraft(parsed.titles.slice(0,3));}
    }catch{}
  },[]);
  useEffect(()=>{window.localStorage.setItem('glow-morning-energy',selectedEnergy)},[selectedEnergy]);

  const openTasks=useMemo(()=>tasks.filter(task=>task.title.trim()),[tasks]);
  const driverLimit=ENERGY_LIMIT[selectedEnergy];
  const drivers=useMemo(()=>{
    if(!nightDraft.length)return openTasks.slice(0,driverLimit);
    const ordered=[...nightDraft.map(title=>openTasks.find(task=>task.title===title)).filter((task):task is TaskLite=>Boolean(task)),...openTasks.filter(task=>!nightDraft.includes(task.title))];
    return ordered.slice(0,driverLimit);
  },[openTasks,driverLimit,nightDraft]);
  const nextEvent=useMemo(()=>events.find(event=>new Date(event.startAt).getTime()>=now.getTime())??events[0]??null,[events,now]);
  const morningEnd=useMemo(()=>{const d=new Date(now);d.setHours(10,0,0,0);return d},[now]);
  const availableMinutes=Math.max(0,Math.round((morningEnd.getTime()-now.getTime())/60000));
  const baseRoutineMinutes=Math.max(12,(morningRoutine?.steps.length??6)*4);
  const beforeTen=events.filter(event=>{const d=new Date(event.startAt);return d.getHours()<10&&!event.allDay}).length;
  const plannedMinutes=(simplified?Math.round(baseRoutineMinutes*.55):baseRoutineMinutes)+beforeTen*35+drivers.length*20;
  const overBy=Math.max(0,plannedMinutes-availableMinutes);
  const bestStart=morningRoutine?.name??(drivers[0]?.title??'Open your day gently');
  const bestMinutes=simplified?Math.max(8,Math.round(baseRoutineMinutes*.55)):baseRoutineMinutes;
  const arc=useMemo(()=>['Morning','Afternoon','Evening','Night'].map(label=>({label,list:events.filter(event=>daypart(new Date(event.startAt).getHours())===label).slice(0,3)})),[events]);

  function setEnergy(value:Energy){setSelectedEnergy(value);if(value==='Low'||value==='Exhausted')setSimplified(true)}
  function fixMorning(){setSimplified(true);if(selectedEnergy==='High'||selectedEnergy==='Normal')setSelectedEnergy('Low')}
  function requestWeather(){
    if(!navigator.geolocation){setWeather({status:'error',summary:'Weather location unavailable',detail:'Glow kept your plan unchanged instead of guessing.',rain:false});return}
    setWeather({status:'loading',summary:'Checking weather…',detail:'Using your device location only for this forecast.',rain:false});
    navigator.geolocation.getCurrentPosition(async pos=>{
      try{
        const {latitude,longitude}=pos.coords;
        const res=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=precipitation_probability,temperature_2m&temperature_unit=fahrenheit&forecast_days=1&timezone=auto`);
        const data=await res.json();
        const probs:number[]=data?.hourly?.precipitation_probability??[];
        const temps:number[]=data?.hourly?.temperature_2m??[];
        const rain=(probs.length?Math.max(...probs):0)>=45;
        const high=temps.length?Math.round(Math.max(...temps)):null;
        setWeather({status:'ready',summary:rain?'Rain could change today’s plan':'Weather looks low-friction today',detail:`${high!=null?`High around ${high}°F. `:''}${rain?'Take an umbrella, choose rain-safe shoes, and leave extra travel buffer.':'No major rain signal detected. Keep the normal leave-time buffer.'}`,rain});
      }catch{setWeather({status:'error',summary:'Weather check failed',detail:'Glow kept your plan unchanged instead of guessing.',rain:false})}
    },()=>setWeather({status:'error',summary:'Location permission is off',detail:'Allow location if you want weather-aware morning suggestions.',rain:false}),{timeout:8000});
  }
  async function askGlow(){
    const text=question.trim();if(!text)return;setAsking(true);setAnswer('');
    try{const res=await fetch('/api/glow/ask',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,history:[]})});const data=await res.json();setAnswer(data.message??'Glow could not answer yet.');if(/barely slept|exhausted|low energy|tired/i.test(text)){setEnergy('Low');setSimplified(true)}}catch{setAnswer('Glow could not answer yet. Your briefing has not changed.')}finally{setAsking(false)}
  }

  if(gettingReady){const current=READY_STEPS[readyIndex];return <div className="mx-auto max-w-4xl pb-20"><section className="min-h-[72vh] rounded-[36px] border border-[#e7e5d7] bg-[radial-gradient(circle_at_top,#fffdf5,#eef4e7_58%,#f7efe8)] p-6 sm:p-10"><div className="flex items-center justify-between"><p className="text-[10px] font-semibold uppercase tracking-[.18em] text-[#7f876a]">Getting Ready · {readyIndex+1}/{READY_STEPS.length}</p><button type="button" onClick={()=>setGettingReady(false)} className="text-xs text-[#737567]">Exit</button></div><div className="mx-auto mt-20 max-w-xl text-center"><p className="text-sm text-[#888b7c]">Current step</p><h1 className="mt-3 font-serif text-5xl text-[#34372f]">{current.title}</h1><p className="mt-4 text-base text-[#6f7467]">{current.detail}</p><div className="mt-10 flex flex-wrap justify-center gap-2"><Link href={current.href} className="rounded-full border border-[#dfe2d3] bg-white px-5 py-3 text-sm">Open room</Link><button type="button" onClick={()=>readyIndex===READY_STEPS.length-1?setGettingReady(false):setReadyIndex(i=>i+1)} className="rounded-full bg-[#34372f] px-5 py-3 text-sm text-white">{readyIndex===READY_STEPS.length-1?'Done':'Next step'}</button></div></div></section></div>}

  return <div className="mx-auto max-w-[1240px] space-y-7 pb-20">
    <section className="overflow-hidden rounded-[38px] border border-[#e8e7dc] bg-[radial-gradient(circle_at_82%_8%,rgba(221,235,208,.9),transparent_30%),radial-gradient(circle_at_62%_0%,rgba(255,241,199,.88),transparent_34%),linear-gradient(135deg,#fffdf7,#f8fbf3)] p-6 shadow-[0_30px_90px_rgba(70,82,54,.08)] sm:p-10"><div className="grid gap-8 lg:grid-cols-[1.2fr_.8fr] lg:items-end"><div><p className="text-[11px] font-semibold uppercase tracking-[.18em] text-[#87906c]">Glow Morning · {modeName}</p><h1 className="mt-3 font-serif text-5xl leading-none tracking-[-.04em] text-[#30342c] sm:text-6xl">Good morning.</h1><p className="mt-3 text-sm font-medium text-[#aa7a61]">{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})} · {now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</p><p className="mt-5 max-w-2xl text-[15px] leading-7 text-[#697064]">{overBy>0?`Your morning needs simplifying by about ${overBy} minutes.`:`Today feels manageable. You have ${drivers.length} important ${drivers.length===1?'priority':'priorities'} and ${events.length} calendar ${events.length===1?'item':'items'}.`}</p>{nightDraft.length?<p className="mt-2 text-xs text-[#7d836f]">Nightly Briefing prepared today’s starting Top 3 draft.</p>:null}<div className="mt-6 rounded-[24px] border border-white/80 bg-white/68 p-5 backdrop-blur"><p className="text-[10px] uppercase tracking-[.16em] text-[#969b88]">Best way to start</p><h2 className="mt-2 font-serif text-3xl text-[#363a31]">{bestStart}</h2><p className="mt-1 text-sm text-[#7c8173]">{bestMinutes} min · then {nextEvent?`${nextEvent.title} at ${clock(nextEvent.startAt)}`:'protect an open buffer'}</p></div><div className="mt-5 flex flex-wrap gap-2"><Link href="/routines?routine=morning-ritual&focus=1" className="inline-flex items-center gap-2 rounded-full bg-[#34382f] px-5 py-3 text-sm text-white"><Play size={14}/>Start Morning</Link><button type="button" onClick={fixMorning} className="inline-flex items-center gap-2 rounded-full border border-[#dfe2d4] bg-white/80 px-5 py-3 text-sm"><WandSparkles size={14}/>Make Today Easier</button><a href="#ask-glow" className="rounded-full border border-[#dfe2d4] bg-white/80 px-5 py-3 text-sm">Ask Glow</a></div></div><div className="rounded-[28px] border border-white/80 bg-white/65 p-5 backdrop-blur-xl"><p className="text-[10px] uppercase tracking-[.16em] text-[#969b88]">How are you feeling?</p><div className="mt-3 grid grid-cols-2 gap-2">{(['High','Normal','Low','Exhausted'] as Energy[]).map(item=><button type="button" key={item} onClick={()=>setEnergy(item)} className={`rounded-[16px] px-3 py-3 text-sm ${selectedEnergy===item?'bg-[#3e4338] text-white':'bg-white text-[#6f7568]'}`}>{item}</button>)}</div><p className="mt-4 text-xs leading-5 text-[#828777]">{selectedEnergy==='Low'||selectedEnergy==='Exhausted'?`Glow reduced today to ${driverLimit} driver${driverLimit===1?'':'s'}, shortened the morning routine, and increased buffer.`:'Normal planning depth is active. Optional items stay secondary.'}</p></div></div></section>

    <section className="rounded-[30px] border border-[#e8e7dc] bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.16em] text-[#8e947b]">Your day at a glance</p><h2 className="mt-1 font-serif text-2xl text-[#34372f]">Morning → Afternoon → Evening → Night</h2></div><SunMedium size={18} className="text-[#b59b62]"/></div><div className="mt-5 grid gap-3 md:grid-cols-4">{arc.map(part=><button type="button" key={part.label} onClick={()=>setExpandedArc(expandedArc===part.label?null:part.label)} className={`rounded-[22px] border p-4 text-left ${expandedArc===part.label?'border-[#cfd6bf] bg-[#f4f7ee]':'border-[#ecebe3] bg-[#fbfbf8]'}`}><p className="text-[10px] uppercase tracking-[.14em] text-[#969a89]">{part.label}</p><p className="mt-2 text-sm font-medium text-[#44483e]">{part.list[0]?.title??(part.label==='Morning'?(morningRoutine?.name??'Morning Foundation'):part.label==='Evening'?'Dinner · Beauty · Reset':part.label==='Night'?'Prepare tomorrow · Wind-down':'Open space')}</p><p className="mt-2 text-[11px] text-[#8a8f80]">{part.list.length} scheduled</p>{expandedArc===part.label?<div className="mt-3 space-y-1 border-t border-[#e6e8dc] pt-3">{part.list.length?part.list.map(item=><p key={item.id} className="text-[11px] text-[#686d61]">{clock(item.startAt)} · {item.title}</p>):<p className="text-[11px] text-[#8b9083]">Nothing fixed here yet.</p>}</div>:null}</button>)}</div></section>

    <section className="grid gap-5 lg:grid-cols-[1.12fr_.88fr]"><div className="space-y-5"><section className="rounded-[30px] border border-[#e8e7dc] bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.16em] text-[#8e947b]">Today’s {driverLimit} drivers</p><h2 className="mt-1 font-serif text-2xl">Glow-generated priorities</h2></div>{accepted?<span className="inline-flex items-center gap-1 rounded-full bg-[#edf4e7] px-3 py-1.5 text-xs text-[#66765c]"><Check size={12}/>Accepted</span>:null}</div><div className="mt-4 space-y-3">{drivers.length?drivers.map((task,index)=><div key={task.id} className="rounded-[18px] bg-[#fafbf7] p-4"><div className="flex gap-3"><span className="font-serif text-xl text-[#a0a58f]">0{index+1}</span><div><Link href={`/tasks?taskId=${encodeURIComponent(task.id)}&view=all`} className="font-medium text-[#3d4139]">{task.title}</Link>{showWhy?<p className="mt-1 text-xs leading-5 text-[#858a7c]">{task.priority==='urgent'||task.priority==='high'?'Glow elevated this because its priority is high.':nightDraft.includes(task.title)?'Nightly Briefing drafted this for today.':'Glow selected this from your current open task list.'}</p>:null}</div></div></div>):<p className="py-5 text-sm text-[#858a7c]">No open priorities are demanding attention.</p>}</div><div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={()=>setAccepted(true)} className="rounded-full bg-[#393d35] px-4 py-2.5 text-xs text-white">Accept</button><Link href="/tasks" className="rounded-full border border-[#e4e5dd] px-4 py-2.5 text-xs">Replace one</Link><button type="button" onClick={()=>setShowWhy(v=>!v)} className="rounded-full border border-[#e4e5dd] px-4 py-2.5 text-xs">Ask why</button></div></section><section className="rounded-[30px] border border-[#e8e7dc] bg-white p-5 sm:p-7"><div className="flex items-center gap-2"><Gauge size={16} className="text-[#8a9476]"/><p className="text-[10px] uppercase tracking-[.16em] text-[#8e947b]">Morning reality check</p></div><div className="mt-4 grid grid-cols-3 gap-3"><div><p className="text-[10px] text-[#999d8f]">Available</p><p className="mt-1 font-serif text-2xl">{availableMinutes}m</p></div><div><p className="text-[10px] text-[#999d8f]">Planned</p><p className="mt-1 font-serif text-2xl">{plannedMinutes}m</p></div><div><p className="text-[10px] text-[#999d8f]">Balance</p><p className={`mt-1 font-serif text-2xl ${overBy?'text-[#a86666]':'text-[#65775d]'}`}>{overBy?`-${overBy}m`:`+${Math.max(0,availableMinutes-plannedMinutes)}m`}</p></div></div><p className={`mt-5 rounded-[18px] p-4 text-sm leading-6 ${overBy?'bg-[#fff7ef] text-[#796958]':'bg-[#f3f7ef] text-[#66725e]'}`}>{overBy?'Shorten the morning routine, protect the strongest driver, and move optional tasks out of the before-10 window.':'Your morning fits. Glow is protecting the remaining time as buffer instead of filling every minute.'}</p><button type="button" onClick={fixMorning} className="mt-4 rounded-full bg-[#3a3e35] px-4 py-2.5 text-xs text-white">Fix My Morning</button></section></div><div className="space-y-5"><section className="rounded-[30px] border border-[#e8e7dc] bg-white p-5 sm:p-7"><div className="flex items-center justify-between"><div><p className="text-[10px] uppercase tracking-[.16em] text-[#8e947b]">Weather that changes the plan</p><h2 className="mt-1 font-serif text-2xl">{weather.summary}</h2></div><CloudRain size={18} className={weather.rain?'text-[#71889b]':'text-[#a8a58d]'}/></div><p className="mt-3 text-sm leading-6 text-[#7b8074]">{weather.detail}</p><button type="button" onClick={requestWeather} disabled={weather.status==='loading'} className="mt-4 rounded-full border border-[#e2e4da] px-4 py-2.5 text-xs disabled:opacity-50">{weather.status==='loading'?'Checking…':'Check weather now'}</button></section><section className="rounded-[30px] border border-[#e8e7dc] bg-white p-5 sm:p-7"><p className="text-[10px] uppercase tracking-[.16em] text-[#8e947b]">Get ready intelligence</p><h2 className="mt-1 font-serif text-2xl">Get ready for today</h2><p className="mt-2 text-xs text-[#8a8f80]">{nextEvent?`Next commitment ${clock(nextEvent.startAt)} · ${nextEvent.title}`:'No fixed leave time detected yet.'}</p><div className="mt-4 space-y-2">{READY_STEPS.map(step=><Link href={step.href} key={step.title} className="flex items-center justify-between rounded-[16px] bg-[#fafbf7] px-4 py-3"><span className="text-sm text-[#4d5248]">{step.title}</span><span className="text-xs text-[#8d9284]">{step.detail}</span></Link>)}</div><button type="button" onClick={()=>{setReadyIndex(0);setGettingReady(true)}} className="mt-4 rounded-full bg-[#393d35] px-4 py-2.5 text-xs text-white">Start Getting Ready</button></section></div></section>

    <section className="grid gap-5 lg:grid-cols-2"><div className="rounded-[30px] border border-[#e8e7dc] bg-[linear-gradient(135deg,#f7f8ee,#fffaf2)] p-5 sm:p-7"><div className="flex items-center gap-2"><Sparkles size={15} className="text-[#8f956e]"/><p className="text-[10px] uppercase tracking-[.16em] text-[#8e947b]">Glow noticed overnight</p></div><h2 className="mt-3 font-serif text-2xl text-[#3e423a]">{overBy?'Your morning is tighter than your plan.':'Your morning has usable breathing room.'}</h2><p className="mt-3 text-sm leading-6 text-[#74796d]">{overBy?`Glow found ${overBy} minutes of pressure before 10 AM. Shortening the routine is the cleanest first fix.`:`Glow is protecting ${Math.max(0,availableMinutes-plannedMinutes)} minutes as flexible space instead of turning free time into another task.`}</p></div><div className="rounded-[30px] border border-[#e8e7dc] bg-white p-5 sm:p-7"><p className="text-[10px] uppercase tracking-[.16em] text-[#8e947b]">Quick morning actions</p><div className="mt-4 flex flex-wrap gap-2"><Link href="/reminders" className="rounded-full border border-[#e4e5dd] px-4 py-2.5 text-xs">Add reminder</Link><Link href="/tasks" className="rounded-full border border-[#e4e5dd] px-4 py-2.5 text-xs">Move task</Link><Link href="/routines" className="rounded-full border border-[#e4e5dd] px-4 py-2.5 text-xs">Start routine</Link><Link href="/wellness" className="rounded-full border border-[#e4e5dd] px-4 py-2.5 text-xs">Log mood</Link><a href="#ask-glow" className="rounded-full bg-[#393d35] px-4 py-2.5 text-xs text-white">Ask Glow</a></div></div></section>

    <section id="ask-glow" className="rounded-[34px] border border-[#e8e7dc] bg-[radial-gradient(circle_at_top_right,#edf3e5,transparent_36%),#fff] p-5 sm:p-8"><div className="flex items-center gap-2"><Sparkles size={16} className="text-[#84916e]"/><p className="text-[10px] uppercase tracking-[.16em] text-[#8e947b]">Morning Briefing Conversation</p></div><h2 className="mt-2 font-serif text-3xl">Tell Glow what changed.</h2><p className="mt-2 text-sm text-[#7c8175]">Try: “I barely slept. Fix today.” or “What should I do first?”</p><div className="mt-5 flex flex-col gap-2 sm:flex-row"><input value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')void askGlow()}} placeholder="Ask Glow about this morning…" className="min-w-0 flex-1 rounded-full border border-[#dfe3d7] bg-white px-5 py-3 text-sm outline-none focus:border-[#9eaa8a]"/><button type="button" onClick={()=>void askGlow()} disabled={asking} className="rounded-full bg-[#373c33] px-5 py-3 text-sm text-white disabled:opacity-50">{asking?'Thinking…':'Ask Glow'}</button></div>{answer?<div className="mt-4 rounded-[22px] bg-white p-5 text-sm leading-6 text-[#60665c] shadow-[0_12px_40px_rgba(73,84,61,.06)]">{answer}</div>:null}</section>

    <section className="rounded-[26px] border border-[#e8e7dc] bg-white px-5 py-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-2 text-xs text-[#7f8577]"><MoonStar size={13}/>Night prepares → Morning decides → Dashboard executes → Night learns</div><div className="flex gap-3"><Link href="/fitness/plan" className="text-xs text-[#68735d]">{workout.name}</Link><Link href="/dashboard" className="inline-flex items-center gap-1 text-xs text-[#68735d]">Dashboard <ChevronRight size={13}/></Link></div></div></section>
  </div>
}
