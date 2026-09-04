'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Brain, CalendarDays, Heart, PawPrint, Search, Sparkles, SunMedium, WandSparkles } from 'lucide-react';
import styles from './today-living-center-stable.module.css';
import layoutFix from './today-stable-layout-fix.module.css';

type TaskLite={id:string;title:string;priority:string;dueDateISO?:string|null};
type EventLite={id:string;title:string;timeLabel:string;location?:string|null;startAtISO?:string|null;allDay?:boolean};
type RoutineLite={id:string;name:string;timeOfDay:string};
type Props={tasks:TaskLite[];events:EventLite[];routines:RoutineLite[];energy:number|null;mood:number|null;sleepHours:number|null;glowMessage:string};
type Daypart='morning'|'afternoon'|'evening'|'night';

type EventEntry={event:EventLite;date:Date};

const fallbackTask:Record<Daypart,string>={
  morning:'Begin with the clearest next move',
  afternoon:'Reset the middle of the day',
  evening:'Transition into the evening',
  night:'Close the day gently',
};
const fallbackRoutines:Record<Daypart,string[]>={
  morning:['Morning hydration','Creativity warm-up','Posture + stretch'],
  afternoon:['Hydrate + reset','Posture + stretch','Midday reset'],
  evening:['Evening transition','Hydrate + move','Prepare tomorrow'],
  night:['Night hydration','Skincare close','Tomorrow prep'],
};

function getDaypart(hour:number):Daypart{if(hour>=5&&hour<12)return'morning';if(hour>=12&&hour<17)return'afternoon';if(hour>=17&&hour<21)return'evening';return'night'}
function greeting(d:Daypart){if(d==='morning')return'Good morning, Tatiyana ♡';if(d==='afternoon')return'Good afternoon, Tatiyana ♡';if(d==='evening')return'Good evening, Tatiyana ♡';return'Good night, Tatiyana ♡'}
function sameDay(a:Date,b:Date){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()}
function duration(ms:number){const m=Math.max(0,Math.floor(ms/60000));return`${Math.floor(m/60)}H ${String(m%60).padStart(2,'0')}M`}
function scoreTask(task:TaskLite,d:Daypart){const t=task.title.toLowerCase();let s=task.priority==='urgent'?50:task.priority==='high'?40:task.priority==='medium'?25:15;const yes:Record<Daypart,string[]>={morning:['morning','wake','breakfast'],afternoon:['midday','afternoon','lunch'],evening:['evening','dinner','transition'],night:['night','sleep','bedtime','shutdown','wind down','wind-down']};const no:Record<Daypart,string[]>={morning:['night','bedtime'],afternoon:['morning','night'],evening:['morning','midday'],night:['morning','midday','afternoon']};yes[d].forEach(w=>{if(t.includes(w))s+=35});no[d].forEach(w=>{if(t.includes(w))s-=45});return s}

export function TodayLivingCenterStable({tasks,events,routines,energy,mood}:Props){
  const router=useRouter();
  const [now,setNow]=useState(()=>new Date());
  const [done,setDone]=useState<string[]>([]);
  useEffect(()=>{const id=window.setInterval(()=>setNow(new Date()),15000);return()=>window.clearInterval(id)},[]);

  const daypart=getDaypart(now.getHours());
  const ranked=useMemo(()=>[...tasks].sort((a,b)=>scoreTask(b,daypart)-scoreTask(a,daypart)),[tasks,daypart]);
  const top=ranked.slice(0,3);
  const active=top[0]?.title??fallbackTask[daypart];
  const capacity=energy==null?({morning:78,afternoon:70,evening:64,night:56}[daypart]):Math.max(30,Math.min(96,Math.round(energy*10)));
  const emotional=mood==null?Math.max(35,capacity+4):Math.max(30,Math.min(96,Math.round(mood*10)));
  const physical=Math.max(30,capacity-6);
  const creative=Math.min(98,capacity+10);
  const inferred=energy==null&&mood==null;

  const entries=useMemo<EventEntry[]>(()=>events.flatMap(event=>{if(!event.startAtISO)return[];const date=new Date(event.startAtISO);return Number.isNaN(date.getTime())?[]:[{event,date}]}).sort((a,b)=>a.date.getTime()-b.date.getTime()),[events]);
  const todayFuture=entries.filter(x=>!x.event.allDay&&sameDay(x.date,now)&&x.date>now);
  const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
  const tomorrowFirst=entries.find(x=>sameDay(x.date,tomorrow));
  const next=todayFuture[0];
  const later=todayFuture[1];
  const tonight=todayFuture.find(x=>x.date.getHours()>=17&&x!==next&&x!==later);
  const schedule=[
    ['NEXT',next,next?'':'Open breathing space'],
    ['LATER',later,later?'':'Nothing fixed'],
    ['TONIGHT',tonight,tonight?'':daypart==='night'?'Close gently':'Wind down'],
    ['TOMORROW',tomorrowFirst,tomorrowFirst?'':'A quiet glimpse'],
  ] as const;

  const eod=new Date(now);eod.setHours(23,59,59,999);
  const timeRemaining=duration(eod.getTime()-now.getTime());
  const routineNames=(routines.filter(r=>r.timeOfDay===daypart).map(r=>r.name).slice(0,3));
  const visibleRoutines=routineNames.length?routineNames:fallbackRoutines[daypart];
  const prompt=daypart==='morning'?'What deserves your first clear yes?':daypart==='afternoon'?'What would make the rest of today lighter?':daypart==='evening'?'What still deserves your energy tonight?':'What can we close, carry, or release?';

  return <main className={`${styles.root} ${layoutFix.guard}`} data-daypart={daypart}>
    <div className={styles.environment} aria-hidden="true"><div className={styles.curtains}/><div className={styles.floor}/><div className={styles.vanity}/><div className={styles.flowers}/></div>
    <div className={styles.shell}>
      <header className={styles.header}>
        <div><div className={styles.brand}>GLOW OS</div><div className={styles.greeting}>{greeting(daypart)}</div><div className={styles.date}>{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase()}</div></div>
        <div className={styles.tools}>
          <button aria-label="Search" onClick={()=>router.push('/search')}><Search size={18}/></button>
          <button aria-label="Calendar" onClick={()=>router.push('/calendar')}><CalendarDays size={18}/></button>
          <button aria-label="Attention Center" onClick={()=>router.push('/notices')}><Bell size={18}/></button>
        </div>
      </header>

      <section className={styles.left}>
        <section className={`${styles.surface} ${styles.now}`}>
          <div className={styles.eyebrow}>LIVE MOMENT · NOW</div><div className={styles.clock}>{now.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</div>
          <div className={styles.nowWord}>NOW</div><h1>{active}</h1><p>Steady focus · move with intention</p><em>{daypart==='night'?'Only what still matters.':'This is your moment.'}</em>
          <button className={styles.timer} onClick={()=>router.push('/focus')}><strong>30</strong><span>START<br/>FOCUS</span></button>
        </section>

        <div className={styles.middleRow}>
          <section className={`${styles.surface} ${styles.what}`}><div className={styles.eyebrow}>WHAT NOW? <Sparkles size={11}/></div><p className={styles.muted}>Your next right 3.</p>{(top.length?top:[{id:'fallback',title:fallbackTask[daypart],priority:'medium'}]).slice(0,3).map((task,i)=><button key={task.id} onClick={()=>router.push('/focus')}><b>{i+1}</b><span>{task.title}</span><small>{i===0?'Now':'Can wait'}</small></button>)}</section>
          <section className={`${styles.surface} ${styles.capacity}`}><div className={styles.eyebrow}>ENERGY & CAPACITY</div><div className={styles.capacityGrid}><div className={styles.capacityOrb}><strong>{capacity}</strong><span>{inferred?'Inferred':'Live'}</span></div><div className={styles.metrics}>{[['Mental',capacity],['Emotional',emotional],['Physical',physical],['Creative',creative]].map(([label,value])=><div className={styles.metric} key={label as string}><span>{label}</span><i><u style={{width:`${value}%`}}/></i><b>{value}%</b></div>)}</div></div></section>
        </div>

        <section className={`${styles.surface} ${styles.counts}`}><div><span>TIME REMAINING TODAY</span><strong>{timeRemaining}</strong><small>until day’s end</small></div><div><span>LEAVE-READY</span><strong>{next?duration(new Date(next.date.getTime()-30*60000).getTime()-now.getTime()):'CLEAR'}</strong><small>{next?'30-minute preparation buffer':'no fixed commitment ahead'}</small></div></section>
        <button className={`${styles.surface} ${styles.replan}`} onClick={()=>router.push('/planning')}><span>✧</span><div><strong>{daypart==='night'?'Close the rest of tonight':daypart==='evening'?'Replan My Evening':'Replan My Day'}</strong><small>Preview first. Nothing external moves without approval.</small></div><b>→</b></button>
        <section className={`${styles.surface} ${styles.priorities}`}><div className={styles.eyebrow}>TOP 3 PRIORITIES ♕</div><div>{(top.length?top:[{id:'fallback',title:fallbackTask[daypart],priority:'medium'}]).slice(0,3).map((task,i)=><button key={`${task.id}-${i}`} onClick={()=>router.push('/focus')}><small>{['FOCUS','CARE','PLAN'][i]??'FOCUS'}</small><strong>{task.title}</strong><span>Impact: {task.priority||'Medium'}</span></button>)}</div></section>
      </section>

      <section className={styles.center}>
        <div className={styles.shakti} aria-label="Shakti"><i/><i/><i/><i/><span/></div>
        <button className={styles.shaktiName} onClick={()=>router.push('/ask-glow')}>Shakti</button>
        <button className={styles.askShakti} onClick={()=>router.push('/ask-glow')}>Ask Shakti</button>
      </section>

      <aside className={styles.right}>
        <section className={`${styles.surface} ${styles.timeline}`}><div className={styles.eyebrow}>THE REST OF TODAY</div>{schedule.map(([label,item,fallback])=><button key={label} onClick={()=>router.push('/calendar')}><i/><div><span>{label}</span><small>{item?item.date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):label==='TOMORROW'?'Preview':label==='NEXT'?'Now':label==='LATER'?'Later':'Tonight'}</small><strong>{item?.event.title??fallback}</strong><em>{item?.event.location??(item?'':'Let the rest stay quiet.')}</em></div></button>)}</section>
        <section className={`${styles.surface} ${styles.routines}`}><div className={styles.eyebrow}>ROUTINES DUE NOW</div>{visibleRoutines.map((name,i)=><button key={`${name}-${i}`} onClick={()=>setDone(v=>v.includes(name)?v.filter(x=>x!==name):[...v,name])}><span>{name}</span><small>{[5,10,7][i]??5} MIN</small><b>{done.includes(name)?'✓':''}</b></button>)}</section>
        <button className={`${styles.surface} ${styles.askPanel}`} onClick={()=>router.push('/ask-glow')}><div><div className={styles.eyebrow}>ASK SHAKTI ✧</div><h2>Your oracle. Your clarity.</h2><p>{prompt}</p></div><span/></button>
      </aside>
    </div>

    <nav className={styles.nav}>
      <button className={styles.active}><SunMedium size={16}/><span>Today</span></button>
      <button onClick={()=>router.push('/planning')}><CalendarDays size={16}/><span>Plan</span></button>
      <button onClick={()=>router.push('/world')}><Heart size={16}/><span>Life</span></button>
      <button onClick={()=>router.push('/brain')}><Brain size={16}/><span>Brain</span></button>
      <button onClick={()=>router.push('/world')}><WandSparkles size={16}/><span>Create</span></button>
    </nav>
    <button className={styles.saint} onClick={()=>router.push('/world')}><PawPrint size={16}/><span>Saint</span></button>
  </main>
}
