'use client';

import { Activity, Bell, BriefcaseBusiness, CalendarDays, ChevronRight, Circle, CloudSun, Dumbbell, Leaf, ListTodo, Mail, Search, Sparkles, SunMedium, UserRound, WandSparkles } from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { chooseBigThree, dayProgress, rankTasks } from '@/lib/dashboard-intelligence';
import { gettingReadyMinutesFor, useGlowRules } from '@/lib/glow-rules';
import { usePersonalContext } from '@/lib/personal-context/use-personal-context';
import { updateTaskAction } from '@/app/actions/tasks';
import styles from './living-dashboard.module.css';

type WeatherState={temp:number;apparent:number;high:number;low:number;rain:number;code:number}|null;
const dayBlocks=[
 {key:'morning',label:'Morning',start:5,end:10,range:'5:00 – 10:00'},
 {key:'between',label:'Between',start:10,end:16,range:'10:00 – 4:00'},
 {key:'evening',label:'Evening',start:16,end:20.5,range:'4:00 – 8:30'},
 {key:'night',label:'Night',start:20.5,end:23,range:'8:30 – 11:00'}
] as const;

function travel(path:string){document.dispatchEvent(new CustomEvent('glow:navigate',{detail:{path}}))}
function openGlow(prompt?:string){document.dispatchEvent(new CustomEvent('glow:open',{detail:prompt?{prompt}:undefined}))}
function fmt(value?:string|null){return value?new Date(value).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):''}
function mins(value?:string|null){return value?Math.max(0,Math.round((new Date(value).getTime()-Date.now())/60000)):null}
function weatherLabel(code:number){if(code===0)return'Clear';if(code<=3)return'Partly cloudy';if(code<=48)return'Foggy';if(code<=67)return'Rain';if(code<=77)return'Snow';if(code<=82)return'Showers';return'Storms'}
function blockFor(date:Date){const h=date.getHours()+date.getMinutes()/60;return dayBlocks.find(b=>h>=b.start&&h<b.end)??(h<5?dayBlocks[3]:dayBlocks[0])}
function theme(day:number){return['Reset Day','Foundation Day','Fitness Day','Wellness Day','Hair + Creative Day','Beauty + Social Day','Recovery + Creativity'][day]||'Intentional Day'}

export function LivingDashboard(){
 const personal=usePersonalContext();
 const [now,setNow]=useState<Date|null>(null);
 const [weather,setWeather]=useState<WeatherState>(null);
 const [weatherStatus,setWeatherStatus]=useState<'loading'|'ready'|'denied'|'error'>('loading');
 const [pending,startTransition]=useTransition();
 const {rules}=useGlowRules();
 const data=personal.status==='ready'?personal.data:null;

 useEffect(()=>{const tick=()=>setNow(new Date());tick();const id=window.setInterval(tick,60000);return()=>window.clearInterval(id)},[]);
 useEffect(()=>{
   if(!navigator.geolocation){setWeatherStatus('error');return}
   navigator.geolocation.getCurrentPosition(async({coords})=>{
     try{
       const p=new URLSearchParams({latitude:String(coords.latitude),longitude:String(coords.longitude),current:'temperature_2m,apparent_temperature,weather_code,precipitation_probability',daily:'temperature_2m_max,temperature_2m_min,precipitation_probability_max',temperature_unit:'fahrenheit',timezone:'auto',forecast_days:'1'});
       const res=await fetch('https://api.open-meteo.com/v1/forecast?'+p.toString()); if(!res.ok)throw new Error('weather');
       const j=await res.json(); setWeather({temp:Math.round(j.current.temperature_2m),apparent:Math.round(j.current.apparent_temperature),high:Math.round(j.daily.temperature_2m_max[0]),low:Math.round(j.daily.temperature_2m_min[0]),rain:Math.round(j.daily.precipitation_probability_max[0]??0),code:j.current.weather_code});setWeatherStatus('ready');
     }catch{setWeatherStatus('error')}
   },()=>setWeatherStatus('denied'),{timeout:5000,maximumAge:900000})
 },[]);

 const activeBlock=now?blockFor(now):dayBlocks[2];
 const nextEvent=data?.todayEvents.find(e=>new Date(e.startAt).getTime()>=Date.now())??null;
 const openTasks=(data?.tasks??[]).filter(t=>t.status!=='done'&&t.status!=='cancelled');
 const ranked=useMemo(()=>now?rankTasks({tasks:openTasks,now,nextEvent,energy:data?.wellness?.energy}):[],[openTasks,now,nextEvent,data?.wellness?.energy]);
 const currentAction=ranked[0]?.task??data?.activeTask??null;
 const currentWhy=ranked[0]?.reasons.join(' · ')??'No open priority needs attention right now.';
 const bigThree=useMemo(()=>now?chooseBigThree(openTasks,now,nextEvent,data?.wellness?.energy):[],[openTasks,now,nextEvent,data?.wellness?.energy]);
 const progress=useMemo(()=>now?dayProgress(data?.tasks??[],now):{completed:0,total:0},[data?.tasks,now]);
 const routineTime = activeBlock.key === 'between' ? 'afternoon' : activeBlock.key;
 const currentRoutine=data?.routines.find(r=>r.timeOfDay===routineTime)??null;
 const nextMins=mins(nextEvent?.startAt);
 const prepMinutes=gettingReadyMinutesFor(nextEvent?.title,rules);
 const readyMins=nextMins===null?null:Math.max(0,nextMins-prepMinutes);
 const firstName=data?.user.name?.trim().split(/\s+/)[0]||'Tatiyana';
 const greeting=!now?'Welcome':now.getHours()<12?'Good morning':now.getHours()<17?'Good afternoon':now.getHours()<21?'Good evening':'Good night';
 const dateLabel=now?.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})??'';
 const routines=data?.routines.slice(0,4)??[]; const goals=data?.goals.filter(g=>g.status!=='complete').slice(0,3)??[];
 const fitnessRoutine=data?.routines.find(r=>/workout|fitness|walk|pilates|glute|upper body|cardio|core/i.test(r.name))??null;
 const beautyRoutines=(data?.routines??[]).filter(r=>/skin|beauty|hair|makeup|face|body care/i.test(r.name)).slice(0,3);
 const gmail=data?.gmail?.messages??[]; const unread=data?.gmail?.unreadCount??0;
 const timelineItems=useMemo(()=>{
   if(!now||!data)return [];
   const day=now.toLocaleDateString('en-CA');
   const events=data.todayEvents.map(e=>({id:'event:'+e.id,time:new Date(e.startAt),label:e.title,kind:'event' as const}));
   const dueTasks=data.tasks.filter(t=>t.status!=='done'&&t.dueDate&&new Date(t.dueDate).toLocaleDateString('en-CA')===day).map(t=>({id:'task:'+t.id,time:new Date(t.dueDate!),label:t.title,kind:'task' as const}));
   return [...events,...dueTasks].sort((a,b)=>a.time.getTime()-b.time.getTime()).slice(0,8);
 },[data,now]);
 const nextPressure=timelineItems.find(item=>item.time.getTime()>=Date.now())??null;
 const sourceRows=[
   {name:'Glow data',state:data?'Connected':'Loading',kind:'Fact'},
   {name:'Google Calendar',state:data?.sourceStatus.googleCalendar??'loading',kind:'Fact'},
   {name:'Gmail',state:data?.sourceStatus.gmail??'loading',kind:'Fact'},
   {name:'Weather',state:weatherStatus==='ready'?'connected':weatherStatus,kind:'Fact'},
   {name:'Notion',state:'not connected',kind:'Missing Source'},
   {name:'Fitness steps',state:'not connected',kind:'Missing Source'},
   {name:'People/Contacts',state:'not connected',kind:'Missing Source'},
   {name:'Finance',state:'not connected',kind:'Missing Source'}
 ] as const;

 function complete(id:string){startTransition(async()=>{await updateTaskAction(id,{status:'done'});window.sessionStorage.removeItem('glow:personal-context:v1');window.location.reload()})}

 return <main className={styles.shell} data-block={activeBlock.key} data-density={rules.dashboardDensity}>


   <section className={styles.canvas}>
    <header className={styles.header}>
     <div><h1>{greeting}, {firstName} <span>🌷</span></h1><p>{dateLabel} <i/> {theme(now?.getDay()??2)} <i/> {activeBlock.label} Block <i/> You’re on track</p></div>
     <div className={styles.headerActions}><button onClick={()=>openGlow()}><Search/><span>Ask Glow anything…</span></button><Bell/><div className={styles.avatar}>{firstName.slice(0,1)}</div></div>
    </header>

    <section className={styles.topRow}>
     <article className={styles.topCard}><CloudSun className={styles.weatherIcon}/><div><span className={styles.eyebrow}>Weather</span>{weatherStatus==='ready'&&weather?<><strong>{weather.temp}° <small>{weatherLabel(weather.code)}</small></strong><p>Feels like {weather.apparent}° · High {weather.high}° · Low {weather.low}° · Rain {weather.rain}%</p><em>{weather.rain>45?'Bring an umbrella if you’re going out.':weather.temp<58?'Bring a light layer if you’re going out.':'Weather looks comfortable for your next outing.'}</em></>:<><strong>{weatherStatus==='loading'?'Checking weather…':'Weather not shared'}</strong><p>{weatherStatus==='denied'?'Enable location for live local weather.':'Glow uses location only for your live forecast.'}</p></>}</div></article>
     <article className={styles.topCard}><CalendarDays/><div><span className={styles.eyebrow}>Next Event</span><strong>{nextEvent?.title??'No event coming up'}</strong><p>{nextEvent?fmt(nextEvent.startAt)+(nextMins!==null?' · '+nextMins+' min away':''):'Your calendar is clear'}</p><em>{readyMins!==null?(readyMins===0?'Start getting ready now.':'Get ready in about '+readyMins+' min.'):'No preparation needed right now.'}</em></div></article>
     <article className={styles.topCard}><SunMedium/><div><span className={styles.eyebrow}>Current Block</span><strong>{activeBlock.label}</strong><p>{activeBlock.range}</p><em>{currentRoutine?.name??currentAction?.title??'Open space'}</em></div></article>
     <article className={styles.topCard}><Activity/><div><span className={styles.eyebrow}>Day Progress</span><strong>{progress.total?progress.completed+' of '+progress.total:'No tracked total'}</strong><p>{progress.total?'today-linked tasks complete':'No due/completed tasks tracked for today'}</p><em>{openTasks.length?openTasks.length+' open priorities':'Your day is clear'}</em></div></article>
    </section>

    <section className={styles.heroGrid}>
     <article className={styles.nowCard}><span className={styles.heroEyebrow}>NOW</span><h2>{activeBlock.label} block</h2><p>{activeBlock.range}</p><h3>{currentAction?.title??currentRoutine?.name??'You have breathing room'}</h3><div className={styles.heroLower}><div><CalendarDays/><span>Up next</span><strong>{nextEvent?fmt(nextEvent.startAt):'Open'}</strong><small>{nextEvent?.title??'Nothing scheduled'}</small></div><div><ListTodo/><span>Before then</span>{openTasks.slice(0,3).map(t=><small key={t.id}>○ {t.title}</small>)}</div></div></article>
     <article className={styles.whatNow}><span className={styles.eyebrow}>✧ WHAT SHOULD I DO NOW?</span><h2>{currentAction?.title??'Choose one useful next move.'}</h2><p>{currentAction?'Glow recommendation: '+currentWhy+'.':'Nothing is demanding your attention. You can choose intentionally.'}</p><div className={styles.actionStack}>{ranked.slice(0,3).map((item)=><button key={item.task.id} onClick={()=>openGlow('Help me do this next: '+item.task.title)}><b>{item.estimateMinutes} min</b><span>{item.task.title}</span><ChevronRight/></button>)}{!openTasks.length&&<button onClick={()=>openGlow('What should I do next?')}><b>Now</b><span>Ask Glow to plan this block</span><ChevronRight/></button>}</div></article>
     <article className={styles.bigThree}><span className={styles.eyebrow}>◎ TODAY’S BIG 3 · GLOW PICKS</span>{bigThree.map((item,i)=><div key={i}><b>{i+1}</b><span><strong>{item.label}</strong><small>{item.task?.title??'No connected priority selected'}</small></span>{item.task?<button disabled={pending} onClick={()=>complete(item.task.id)} aria-label={'Complete '+item.task.title}><Circle/></button>:<Circle/>}</div>)}</article>
    </section>

    <section className={styles.dayFlow}>
      <div className={styles.flowSplit}>
        <div className={styles.myDay}>
          <div className={styles.sectionTitle}>MY DAY <button onClick={()=>travel('/calendar')}>View calendar →</button></div>
          <div className={styles.timelineRow}>
            {timelineItems.length?timelineItems.map(item=><button key={item.id} onClick={()=>travel(item.kind==='event'?'/calendar':'/tasks')}><time>{fmt(item.time.toISOString())}</time><span>{item.label}</span><em>{item.kind==='event'?'Calendar':'Task due'}</em></button>):<p className={styles.empty}>No timed events or due tasks are connected for today.</p>}
          </div>
        </div>
        <div className={styles.flowSide}>
          <div className={styles.sectionTitle}>DAY FLOW <span>{now?.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}</span></div>
          <div className={styles.blockRow}>{dayBlocks.map(block=><button key={block.key} className={block.key===activeBlock.key?styles.currentBlock:''} onClick={()=>travel('/today')}><span>{block.key==='night'?'☾':'☼'}</span><div><strong>{block.label}</strong><small>{block.range}</small><em>{block.key===activeBlock.key?'In progress':block.end<=(now?now.getHours()+now.getMinutes()/60:0)?'Complete':'Upcoming'}</em></div></button>)}</div>
        </div>
      </div>
    </section>

    <section className={styles.midGrid}>
     <article className={styles.panel}><header><Activity/> TODAY’S STATE</header>
       <div className={styles.stateLine}><span>Schedule</span><strong>{nextEvent?'Active':'Clear'}</strong></div>
       <div className={styles.stateLine}><span>Energy</span><strong>{data?.wellness?.energy??'Not logged'}</strong></div>
       <div className={styles.stateLine}><span>Tasks</span><strong>{progress.total?progress.completed+' / '+progress.total:'No tracked total'}</strong></div>
       <div className={styles.stateLine}><span>Routine</span><strong>{currentRoutine?.name??'No current routine'}</strong></div>
       <div className={styles.stateLine}><span>Next pressure point</span><strong>{nextPressure?fmt(nextPressure.time.toISOString())+' · '+nextPressure.label:'None detected'}</strong></div>
     </article>
     <article className={styles.panel}><header><Leaf/> ROUTINES TODAY</header>{routines.map(r=><button className={styles.checkLine} key={r.id} onClick={()=>travel('/routines')}><Circle/><span>{r.name}</span><small>{r.timeOfDay}</small></button>)}{!routines.length&&<p className={styles.empty}>Add your first routine in Routines.</p>}</article>
     <article className={styles.panel}><header><Dumbbell/> BODY</header><strong className={styles.featureTitle}>{fitnessRoutine?.name ?? 'No workout scheduled in connected data'}</strong><p>{data?.wellness?.energy ? 'Energy · '+data.wellness.energy : 'Energy not logged today'}</p><p>Daily step target · 8,000–12,000</p><button className={styles.primaryBtn} onClick={()=>travel('/fitness')}>Open Fitness</button></article>
     <article className={styles.panel}><header><Sparkles/> BEAUTY TODAY</header>{beautyRoutines.map(r=><button className={styles.checkLine} key={r.id} onClick={()=>travel('/beauty/today')}><Circle/><span>{r.name}</span><small>{r.timeOfDay}</small></button>)}{!beautyRoutines.length&&<p className={styles.empty}>No beauty routine is scheduled in connected data.</p>}<button className={styles.linkBtn} onClick={()=>travel('/beauty/today')}>Open Beauty Today →</button></article>
     <article className={styles.panel}><header><WandSparkles/> STYLE</header><strong className={styles.featureTitle}>{nextEvent ? 'Dress for '+nextEvent.title : 'No event-based outfit needed'}</strong><p>{weather?weather.temp+'° · '+weatherLabel(weather.code):'Enable weather for outfit context'}</p><p>{nextEvent?.location ? 'Location · '+nextEvent.location : 'No location context available'}</p><button className={styles.linkBtn} onClick={()=>travel('/closet')}>Open Closet →</button></article>
    </section>

    <section className={styles.lowerGrid}>
     <article className={styles.miniPanel}><header><BriefcaseBusiness/> CAREER</header><p>{nextEvent?.title??'No career event right now'}</p><p>{goals.find(g=>/career|job/i.test(g.category+' '+g.title))?.title??'Open Career in Projects'}</p><button onClick={()=>travel('/projects')}>Open →</button></article>
     <article className={styles.miniPanel}><header><Sparkles/> BRAND BRAIN</header><p>{goals.find(g=>/brand|skin|beauty/i.test(g.category+' '+g.title))?.title??goals[0]?.title??'No active brand goal'}</p><p>{data?.notes[0]?.title??'Capture your next idea'}</p><button onClick={()=>travel('/brain')}>Open Brain →</button></article>
     <article className={styles.miniPanel}><header><ListTodo/> LIFE ADMIN</header>{openTasks.slice(0,4).map(t=><button key={t.id} className={styles.microLine} onClick={()=>travel('/tasks')}><Circle/>{t.title}</button>)}</article>
     <article className={styles.miniPanel}><header><UserRound/> PEOPLE</header><p>Relationship reminders appear when they matter.</p><button onClick={()=>travel('/relationships')}>Open People →</button></article>
     <article className={styles.miniPanel}><header><Mail/> WHAT CHANGED?</header><p>{unread?unread+' unread important email'+(unread===1?'':'s'):'No unread email surfaced'}</p>{gmail.slice(0,2).map(m=><button className={styles.emailLine} key={m.id} onClick={()=>travel('/gmail')}><b>{m.subject}</b><small>{m.from}</small></button>)}</article>
     <article className={styles.miniPanel}><header><CloudSun/> WEATHER & LEAVING</header><p>{nextEvent?'Next event '+fmt(nextEvent.startAt):'No departure needed right now'}</p><p>{weather?weather.temp+'° · '+weatherLabel(weather.code):'Enable weather for leaving guidance'}</p></article>
    </section>

    <section className={styles.bottomGrid}>
     <article><header>ON YOUR MIND</header>{data?.notes.slice(0,4).map(n=><button key={n.id} onClick={()=>travel('/notes')}>○ {n.title}</button>)}{!data?.notes.length&&<p>Nothing is demanding mental space right now.</p>}</article>
     <article><header>CAN WAIT</header>{openTasks.slice(3,6).map(t=><button key={t.id} onClick={()=>travel('/tasks')}>○ {t.title}</button>)}{openTasks.length<4&&<p>Nothing else needs attention right now.</p>}</article>
     <article><header>WAITING ON</header><p>External dependencies appear here as connected records.</p></article>
     <article><header>MONEY</header><p>Current money context stays quiet unless it needs attention.</p><button onClick={()=>travel('/finance')}>Open Money →</button></article>
     <article><header>TOMORROW</header><p>{data?.tomorrowEvents.length??0} events</p>{data?.tomorrowEvents.slice(0,2).map(e=><button key={e.id} onClick={()=>travel('/calendar')}>{fmt(e.startAt)} · {e.title}</button>)}<small>{data?.tomorrowEvents.length?'Glow will help you prepare tonight.':'Nothing unusual to prepare yet.'}</small></article>
    </section>
    <details className={styles.coverage}>
      <summary>Data Coverage · what is real, connected, recommended, or missing</summary>
      <div className={styles.coverageGrid}>{sourceRows.map(row=><div key={row.name}><strong>{row.name}</strong><span>{row.state}</span><em>{row.kind}</em></div>)}</div>
      <p>Dashboard facts only come from connected sources. Glow recommendations are labeled as recommendations. Missing sources never receive demo values.</p>
    </details>
   </section>

   <div className={styles.commandBar}><button onClick={()=>travel('/inbox')}>＋ Capture</button><button className={styles.ask} onClick={()=>openGlow()}><Sparkles/> Ask Glow anything…</button><button onClick={()=>openGlow('What should I do next?')}>What should I do next?</button><button onClick={()=>openGlow('Plan tonight')}>Plan tonight</button><button onClick={()=>openGlow('Catch me up')}>Catch me up</button></div>
 </main>
}