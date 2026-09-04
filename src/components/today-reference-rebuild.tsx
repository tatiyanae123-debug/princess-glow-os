'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Bell, Brain, CalendarDays, ChevronRight, Circle, Heart, Home, Search, Sparkles, WandSparkles } from 'lucide-react';
import styles from './today-reference-rebuild.module.css';

type Task = { id:string; title:string; priority:string; dueLabel:string|null };
type Event = { id:string; title:string; timeLabel:string; location:string|null; startAtISO:string; allDay:boolean };
type Routine = { id:string; name:string; timeOfDay:string|null };

type Props = {
  tasks:Task[];
  events:Event[];
  routines:Routine[];
  energy:number|null;
  mood:number|null;
  sleepHours:number|null;
};

type Daypart='morning'|'afternoon'|'evening'|'night';

const NAV=[
  {label:'Today',href:'/today',icon:Sparkles},
  {label:'Plan',href:'/calendar',icon:CalendarDays},
  {label:'Life',href:'/life',icon:Heart},
  {label:'Brain',href:'/brain',icon:Brain},
  {label:'Create',href:'/create',icon:WandSparkles},
];

function daypartFor(hour:number):Daypart{
  if(hour>=5&&hour<12)return'morning';
  if(hour>=12&&hour<17)return'afternoon';
  if(hour>=17&&hour<21)return'evening';
  return'night';
}
function greetingFor(part:Daypart){
  if(part==='morning')return'Good morning';
  if(part==='afternoon')return'Good afternoon';
  if(part==='evening')return'Good evening';
  return'Good night';
}
function phaseWords(part:Daypart){
  if(part==='morning')return{context:'High focus · Create with intention',line:'This is your moment.'};
  if(part==='afternoon')return{context:'Steady focus · Move with intention',line:'Keep the day light and clear.'};
  if(part==='evening')return{context:'Gentle focus · Close what matters',line:'Let the day soften around you.'};
  return{context:'Quiet focus · Release what can wait',line:'Only what still matters.'};
}
function dateLabel(d:Date){return d.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).toUpperCase();}
function timeLabel(d:Date){return d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function minutesUntilMidnight(d:Date){const end=new Date(d);end.setHours(24,0,0,0);return Math.max(0,Math.round((end.getTime()-d.getTime())/60000));}
function compactDuration(mins:number){const h=Math.floor(mins/60);const m=mins%60;return h?`${h}H ${String(m).padStart(2,'0')}M`:`${m}M`;}
function scoreTask(task:Task,part:Daypart){
  const t=task.title.toLowerCase(); let score=0;
  if(task.priority==='urgent')score+=50; if(task.priority==='high')score+=30; if(task.dueLabel==='Overdue')score+=25; if(task.dueLabel==='Today')score+=18;
  if(part==='night'&&(t.includes('night')||t.includes('shutdown')||t.includes('bed')))score+=40;
  if(part==='evening'&&(t.includes('evening')||t.includes('wind')||t.includes('transition')))score+=35;
  if(part==='morning'&&(t.includes('morning')||t.includes('start')||t.includes('baseline')))score+=35;
  if(part==='afternoon'&&(t.includes('midday')||t.includes('afternoon')||t.includes('work')))score+=30;
  return score;
}

export function TodayReferenceRebuild({tasks,events,routines,energy,mood,sleepHours}:Props){
  const [now,setNow]=useState(()=>new Date());
  const [focusRunning,setFocusRunning]=useState(false);
  const [focusMinutes,setFocusMinutes]=useState(30);
  const [completed,setCompleted]=useState<Set<string>>(()=>new Set());
  const [modal,setModal]=useState<'search'|'shakti'|'alerts'|null>(null);
  const [receipt,setReceipt]=useState<string>('');

  useEffect(()=>{const id=window.setInterval(()=>setNow(new Date()),30000);return()=>window.clearInterval(id);},[]);
  useEffect(()=>{if(!focusRunning)return;const id=window.setInterval(()=>setFocusMinutes(v=>v>1?v-1:30),60000);return()=>window.clearInterval(id);},[focusRunning]);
  useEffect(()=>{if(!receipt)return;const id=window.setTimeout(()=>setReceipt(''),2600);return()=>window.clearTimeout(id);},[receipt]);

  const part=daypartFor(now.getHours());
  const phase=phaseWords(part);
  const ranked=useMemo(()=>[...tasks].sort((a,b)=>scoreTask(b,part)-scoreTask(a,part)),[tasks,part]);
  const fallbackTask=part==='night'?'Night Shutdown':part==='evening'?'Evening Close':part==='afternoon'?'Midday Reset':'Morning Foundation';
  const active=ranked[0]?.title||fallbackTask;
  const top3=(ranked.length?ranked:[{id:'1',title:fallbackTask,priority:'medium',dueLabel:'Today'},{id:'2',title:'Care + reset',priority:'medium',dueLabel:'Today'},{id:'3',title:'Plan the next move',priority:'medium',dueLabel:'Today'}]).slice(0,3);

  const future=useMemo(()=>events.map(e=>({...e,date:new Date(e.startAtISO)})).filter(e=>e.allDay||e.date.getTime()>=now.getTime()-5*60000).sort((a,b)=>a.date.getTime()-b.date.getTime()),[events,now]);
  const next=future.find(e=>!e.allDay)||future[0];
  const later=future.find(e=>next&&e.id!==next.id&&e.date.toDateString()===now.toDateString());
  const tomorrow=future.find(e=>e.date.toDateString()!==now.toDateString());
  const routineList=(routines.length?routines:[{id:'r1',name:'Night hydration',timeOfDay:'night'},{id:'r2',name:'Skincare close',timeOfDay:'night'},{id:'r3',name:'Tomorrow prep',timeOfDay:'night'}]).slice(0,3);
  const energyBase=energy?Math.round(energy*10):82;
  const mental=Math.max(55,Math.min(98,energyBase));
  const emotional=Math.max(50,Math.min(98,mood?Math.round(mood*10):85));
  const physical=Math.max(45,Math.min(96,sleepHours?Math.round(Math.min(10,sleepHours)/10*100):70));
  const creative=Math.max(55,Math.min(99,Math.round((mental+emotional)/2+7)));
  const remain=minutesUntilMidnight(now);

  function toggleRoutine(id:string){setCompleted(prev=>{const nextSet=new Set(prev);if(nextSet.has(id))nextSet.delete(id);else nextSet.add(id);return nextSet;});}
  function action(message:string){setReceipt(message);}

  return <main className={styles.root} data-daypart={part}>
    <div className={styles.scene}>
      <div className={styles.environment} aria-hidden="true">
        <div className={styles.sky}/><div className={`${styles.curtain} ${styles.curtainLeft}`}/><div className={`${styles.curtain} ${styles.curtainRight}`}/><div className={styles.floor}/>
        <div className={styles.vanity}><div className={styles.mirror}/><div className={styles.desk}/><div className={styles.chair}/><div className={styles.flowers}/></div>
        <div className={styles.sparkleField}/>
      </div>

      <header className={styles.header}>
        <div className={styles.brand}>GLOW OS</div>
        <div className={styles.greeting}>{greetingFor(part)}, Tatiyana <span>♡</span></div>
        <div className={styles.date}>{dateLabel(now)}</div>
      </header>

      <div className={styles.tools}>
        <button aria-label="Search" onClick={()=>setModal('search')}><Search size={17}/></button>
        <Link aria-label="Calendar" href="/calendar"><CalendarDays size={17}/></Link>
        <button aria-label="Attention" onClick={()=>setModal('alerts')}><Bell size={17}/></button>
      </div>

      <section className={`${styles.glass} ${styles.nowPanel}`}>
        <div className={styles.liveLabel}>LIVE MOMENT</div>
        <div className={styles.nowTime}>{timeLabel(now)}</div>
        <div className={styles.nowWord}>NOW</div>
        <h1>{active}</h1>
        <p>{phase.context}</p>
        <em>{phase.line}</em>
        <button className={styles.focusRing} onClick={()=>setFocusRunning(v=>!v)} aria-label={focusRunning?'Pause focus':'Start focus'}><strong>{focusMinutes}</strong><span>{focusRunning?'PAUSE':'START'}</span></button>

        <div className={`${styles.subGlass} ${styles.whatNow}`}>
          <div className={styles.sectionTitle}>WHAT NOW? <Sparkles size={13}/></div>
          <small>Your next right 3.</small>
          <div className={styles.taskRows}>{top3.map((t,i)=><button key={t.id} onClick={()=>action(`${t.title} selected`)}><span className={styles.num}>{i+1}</span><span>{t.title}</span><b>{t.dueLabel||'Today'}</b></button>)}</div>
        </div>

        <div className={`${styles.subGlass} ${styles.capacity}`}>
          <div className={styles.sectionTitle}>ENERGY &amp; CAPACITY</div>
          <div className={styles.capacityBody}>
            <div className={styles.capacityOrb}><strong>{Math.round((mental+emotional+physical+creative)/4)}</strong><span>{energy?'Live':'Inferred'}</span></div>
            <div className={styles.metrics}>{[['Mental',mental],['Emotional',emotional],['Physical',physical],['Creative',creative]].map(([label,val])=><div className={styles.metric} key={String(label)}><span>{label}</span><i><u style={{width:`${val}%`}}/></i><b>{val}%</b></div>)}</div>
          </div>
        </div>

        <div className={styles.countdown}><div><span>TIME REMAINING TODAY</span><strong>{compactDuration(remain)}</strong><small>until day’s end</small></div><div><span>LEAVE-READY COUNTDOWN</span><strong>{next&&!next.allDay?'Ready':'CLEAR'}</strong><small>{next&&!next.allDay?`for ${next.title}`:'no fixed commitment ahead'}</small></div></div>
      </section>

      <button className={`${styles.glass} ${styles.replan}`} onClick={()=>action('Shakti prepared a gentle replan preview. Nothing changed yet.')}><Sparkles size={18}/><span><strong>{part==='night'?'Reset the rest of tonight':'Replan My Day'}</strong><small>One-tap reset. Realign, reschedule, and flow.</small></span><ChevronRight size={19}/></button>

      <section className={`${styles.glass} ${styles.priorities}`}>
        <div className={styles.sectionTitle}>TOP 3 PRIORITIES <span>♛</span></div>
        <div className={styles.priorityGrid}>{top3.map((t,i)=><button key={t.id} onClick={()=>action(`${t.title} opened`)}><small>{['CREATE','CARE','PLAN'][i]||'FOCUS'}</small><strong>{t.title}</strong><span>{i===0?'Ship what matters':i===1?'Nourish to create':'Map the next move'}</span><em>Impact: {t.priority}</em></button>)}</div>
      </section>

      <section className={styles.shaktiZone}>
        <button className={styles.shakti} onClick={()=>setModal('shakti')} aria-label="Talk to Shakti">
          <span className={styles.shaktiHaze}/><span className={styles.shaktiBeam}/><span className={`${styles.shaktiWing} ${styles.shaktiWingL}`}/><span className={`${styles.shaktiWing} ${styles.shaktiWingR}`}/><span className={styles.shaktiRays}/><span className={styles.shaktiCore}/><span className={styles.shaktiWhite}/><span className={styles.shaktiGround}/>
        </button>
        <div className={styles.shaktiName}>Shakti</div>
        <div className={styles.shaktiTagline}>Your life. Your timing.<br/>Your becoming.</div>
      </section>

      <section className={styles.timeline}>
        <div className={styles.timelineRail}/>
        {[{k:'NEXT',time:next?.timeLabel||'Now',title:next?.title||'Open breathing space',note:next?.location||'Nothing fixed is pulling you forward.'},{k:'LATER',time:later?.timeLabel||'Later',title:later?.title||'Nothing fixed',note:later?.location||'Let the rest stay quiet.'},{k:'TONIGHT',time:'Tonight',title:part==='night'?'Close gently':'Wind Down',note:'Reset & reflect'},{k:'TOMORROW',time:tomorrow?.timeLabel||'Preview',title:tomorrow?.title||'A quiet glimpse',note:tomorrow?.location||'A good beginning'}].map((m,i)=><button key={m.k} onClick={()=>action(`${m.k}: ${m.title}`)} className={styles.timelineMoment}><span className={styles.node}>{i===2?'☾':i===3?'☼':'○'}</span><small>{m.k}</small><b>{m.time}</b><strong>{m.title}</strong><em>{m.note}</em></button>)}
      </section>

      <section className={`${styles.glass} ${styles.routines}`}>
        <div className={styles.sectionTitle}>ROUTINES DUE NOW</div>
        {routineList.map((r,i)=><button key={r.id} onClick={()=>toggleRoutine(r.id)} className={completed.has(r.id)?styles.done:''}><span>{r.name}</span><small>{[5,10,7][i]} MIN</small><i>{completed.has(r.id)?'✓':''}</i></button>)}
        <Link href="/routines">View all routines →</Link>
      </section>

      <button className={`${styles.glass} ${styles.askPanel}`} onClick={()=>setModal('shakti')}><div><div className={styles.sectionTitle}>ASK SHAKTI ✧</div><small>Your oracle. Your clarity.</small><p>{part==='night'?'What can we close, carry, or release?':'What would make today iconic?'}</p></div><span className={styles.miniPresence}><i/><b/></span></button>

      <nav className={styles.nav}>{NAV.map(({label,href,icon:Icon})=><Link key={label} href={href} className={label==='Today'?styles.navActive:''}><Icon size={17}/><span>{label}</span></Link>)}</nav>
      <button className={styles.saint} onClick={()=>action('Saint is with you.')}><Home size={14}/><span>Saint</span></button>
    </div>

    {modal&&<div className={styles.modalBackdrop} onClick={()=>setModal(null)}><section className={styles.modal} onClick={e=>e.stopPropagation()}>
      <button className={styles.close} onClick={()=>setModal(null)}>×</button>
      {modal==='search'&&<><div className={styles.modalEyebrow}>SEARCH GLOW OS</div><h2>Cast light across your world.</h2><input autoFocus placeholder="Search tasks, memories, routines, people…"/></>}
      {modal==='alerts'&&<><div className={styles.modalEyebrow}>ATTENTION CENTER</div><h2>You’re clear right now.</h2><p>No urgent alerts need your attention.</p></>}
      {modal==='shakti'&&<><div className={styles.modalEyebrow}>SHAKTI</div><h2>I’m here, Tatiyana.</h2><p>Speak naturally. Ask me what to do next, replan the rest of today, open a routine, or help you think through something.</p><textarea autoFocus placeholder="Talk to Shakti…"/><button className={styles.send} onClick={()=>{setModal(null);action('Shakti is listening.')}}>Ask Shakti</button></>}
    </section></div>}
    {receipt&&<div className={styles.receipt}>{receipt}</div>}
  </main>;
}
