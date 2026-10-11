'use client';

import Link from 'next/link';
import {
  Activity, Bell, BriefcaseBusiness, CalendarDays, Check, ChevronRight, Circle, CloudSun,
  Dumbbell, Heart, Home, Inbox, ListTodo, MessageCircle, Moon, Search, Settings,
  Sparkles, SunMedium, UserRound, WandSparkles
} from 'lucide-react';
import { useEffect, useMemo, useState, useTransition } from 'react';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { updateTaskAction } from '@/app/actions/tasks';

type Weather = { temp:number; apparent:number; high:number; low:number; rain:number; code:number } | null;

const blocks = [
  { key:'morning', label:'Morning', start:5, end:10, range:'5:00 – 10:00' },
  { key:'between', label:'Between', start:10, end:16, range:'10:00 – 4:00' },
  { key:'evening', label:'Evening', start:16, end:20.5, range:'4:00 – 8:30' },
  { key:'night', label:'Night', start:20.5, end:23, range:'8:30 – 11:00' },
] as const;

function fmtTime(value: Date | string | null | undefined) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleTimeString('en-US', { hour:'numeric', minute:'2-digit' });
}

function weatherLabel(code:number){
  if(code===0) return 'Clear';
  if(code<=3) return 'Partly cloudy';
  if(code<=48) return 'Foggy';
  if(code<=67) return 'Rain';
  if(code<=77) return 'Snow';
  if(code<=82) return 'Showers';
  return 'Storms';
}

function blockFor(date:Date){
  const h=date.getHours()+date.getMinutes()/60;
  return blocks.find(b=>h>=b.start&&h<b.end) ?? (h<5?blocks[3]:blocks[0]);
}

function dayTheme(day:number){
  return ['Reset Day','Foundation Day','Fitness Day','Wellness Day','Hair + Creative Day','Beauty + Planning Day','Recovery + Creativity'][day] ?? 'Intentional Day';
}

function minsUntil(date:Date|null){
  return date ? Math.max(0,Math.round((date.getTime()-Date.now())/60000)) : null;
}

export function LivingDashboard({ data, error, userName }: { data: LivingDashboardData; error?: string; userName?: string | null }) {
  const [now,setNow]=useState(new Date());
  const [weather,setWeather]=useState<Weather>(null);
  const [weatherState,setWeatherState]=useState<'loading'|'ready'|'denied'|'error'>('loading');
  const [pending,startTransition]=useTransition();

  useEffect(()=>{
    const id=window.setInterval(()=>setNow(new Date()),60_000);
    return()=>window.clearInterval(id);
  },[]);

  useEffect(()=>{
    if(!navigator.geolocation){setWeatherState('error');return}
    navigator.geolocation.getCurrentPosition(async({coords})=>{
      try{
        const q=new URLSearchParams({
          latitude:String(coords.latitude),longitude:String(coords.longitude),
          current:'temperature_2m,apparent_temperature,weather_code',
          daily:'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
          temperature_unit:'fahrenheit',timezone:'auto',forecast_days:'1'
        });
        const res=await fetch('https://api.open-meteo.com/v1/forecast?'+q.toString());
        if(!res.ok) throw new Error('weather');
        const j=await res.json();
        setWeather({
          temp:Math.round(j.current.temperature_2m),
          apparent:Math.round(j.current.apparent_temperature),
          high:Math.round(j.daily.temperature_2m_max[0]),
          low:Math.round(j.daily.temperature_2m_min[0]),
          rain:Math.round(j.daily.precipitation_probability_max[0]??0),
          code:j.current.weather_code,
        });
        setWeatherState('ready');
      }catch{setWeatherState('error')}
    },()=>setWeatherState('denied'),{timeout:5000,maximumAge:900000});
  },[]);

  const firstName=userName?.trim().split(/\s+/)[0]||'Tatiyana';
  const block=blockFor(now);
  const greeting=now.getHours()<12?'Good morning':now.getHours()<17?'Good afternoon':now.getHours()<21?'Good evening':'Good night';

  const allEvents=useMemo(()=>{
    const google=data.googleCalendar.events.map(e=>({id:'g-'+e.id,title:e.title,startAt:e.startAt,endAt:e.endAt,location:e.location??null,source:'Google'}));
    const glow=data.todaySchedule.events.map(e=>({id:'l-'+e.id,title:e.title,startAt:e.startAt,endAt:e.endAt,location:e.location,source:'Glow'}));
    return [...google,...glow]
      .filter((event,index,all)=>all.findIndex(x=>x.title.trim().toLowerCase()===event.title.trim().toLowerCase()&&x.startAt.getTime()===event.startAt.getTime())===index)
      .sort((a,b)=>a.startAt.getTime()-b.startAt.getTime());
  },[data]);

  const nextEvent=allEvents.find(e=>(e.endAt??e.startAt).getTime()>=now.getTime())??null;
  const nextMinutes=minsUntil(nextEvent?.startAt??null);
  const getReadyIn=nextMinutes===null?null:Math.max(0,nextMinutes-45);
  const tasks=data.topPriorityTasks;
  const topTask=tasks[0]??null;
  const routine=data.routinesForNow[0]??null;
  const wellness=data.wellnessToday.entry;

  const timeline=useMemo(()=>{
    const eventRows=allEvents.map(e=>({key:e.id,time:e.startAt,label:e.title,kind:'event'}));
    const workRows=data.todaySchedule.workSlots.map(w=>{
      const [h,m]=w.startTime.split(':').map(Number);
      const d=new Date(now); d.setHours(h||0,m||0,0,0);
      return {key:'work-'+w.id,time:d,label:w.title,kind:'work'};
    });
    return [...eventRows,...workRows].sort((a,b)=>a.time.getTime()-b.time.getTime()).slice(0,8);
  },[allEvents,data.todaySchedule.workSlots,now]);

  const noteNodes=data.notesSummary.recentNotes.slice(0,4);
  const gmailChanges=data.gmailInbox.messages.slice(0,3);
  const tomorrowKey=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1).toLocaleDateString('en-CA');
  const tomorrowEvents=allEvents.filter(e=>e.startAt.toLocaleDateString('en-CA')===tomorrowKey).slice(0,3);
  const coverage=[
    ['Greeting / current block','Device time + Glow rules','Connected','Fact'],
    ['Weather','Live weather + browser location',weatherState==='ready'?'Connected':weatherState,'Fact'],
    ['Next event / My Day','Google Calendar + Glow events',data.googleCalendar.status,'Fact'],
    ['Tasks / Big 3','Glow task database','Connected','Fact + Glow ranking'],
    ['Routines','Glow routines','Connected','Fact'],
    ['Brain Web','Glow Notes','Connected','Fact relationships only'],
    ['Gmail changes','Gmail',data.gmailInbox.status,'Fact'],
    ['Notion tasks / Brain Dump','Notion Life OS','Not connected in app runtime','Missing Source'],
    ['Fitness steps','Health/activity source','Not connected','Missing Source'],
    ['People','Contacts / People source','Not connected','Missing Source'],
    ['Money','Finance source','Not connected','Missing Source'],
  ] as const;

  function completeTask(id:string){
    startTransition(async()=>{
      await updateTaskAction(id,{status:'done'});
      window.location.reload();
    });
  }

  return (
    <div className="glow-ref-dashboard">
      {error?<div className="ref-error">{error}</div>:null}

      <aside className="ref-sidebar">
        <div className="ref-logo">Glow</div>
        <nav>
          <Link className="active" href="/home"><Home/>Dashboard</Link>
          <Link href="/today"><CalendarDays/>Today</Link>
          <button onClick={()=>document.dispatchEvent(new CustomEvent('glow:open'))}><Sparkles/>Ask Glow</button>
          <Link href="/inbox"><Circle/>Capture</Link>
          <Link href="/search"><Search/>Search</Link>
          <hr/>
          <Link href="/life"><Heart/>Life</Link>
          <Link href="/projects"><BriefcaseBusiness/>Projects</Link>
          <Link href="/relationships"><UserRound/>People</Link>
          <hr/>
          <Link href="/notifications"><Bell/>Notifications</Link>
          <Link href="/settings"><Settings/>Settings</Link>
        </nav>
        <blockquote>A more intentional life looks so good on you.</blockquote>
      </aside>

      <section className="ref-canvas">
        <header className="ref-header">
          <div>
            <h1>Welcome {firstName} <span>🌷</span></h1>
            <p>{now.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'})}<i/> {block.label} Block <i/> Day Theme: {dayTheme(now.getDay())}</p>
          </div>
          <div className="ref-header-tools">
            <button onClick={()=>document.dispatchEvent(new CustomEvent('glow:open'))}><Search/>Search anything…</button>
            <Bell/>
            <div className="ref-avatar">{firstName.slice(0,1)}</div>
          </div>
        </header>

        <section className="ref-top-row">
          <article>
            <CloudSun className="ref-weather-icon"/>
            <div><span>Weather</span>
              {weatherState==='ready'&&weather?<><strong>{weather.temp}° <small>{weatherLabel(weather.code)}</small></strong><p>Feels like {weather.apparent}° · High {weather.high}° · Low {weather.low}° · Rain {weather.rain}%</p><em>{weather.rain>45?'Rain may affect leaving plans.':weather.temp<58?'Bring a light layer if you go out.':'Weather looks comfortable.'}</em></>:<><strong>{weatherState==='loading'?'Checking weather…':'Weather unavailable'}</strong><p>{weatherState==='denied'?'Location permission is off.':'Glow will show live weather when available.'}</p></>}
            </div>
          </article>
          <article><CalendarDays/><div><span>Next Event</span><strong>{nextEvent?.title??'No upcoming event'}</strong><p>{nextEvent?fmtTime(nextEvent.startAt)+(nextMinutes!==null?' · '+nextMinutes+' min away':''):'Your connected calendar is clear'}</p><em>{getReadyIn!==null?(getReadyIn===0?'Start getting ready now.':'Get ready in about '+getReadyIn+' min.'):'No preparation needed.'}</em></div></article>
          <article><SunMedium/><div><span>Current Block</span><strong>{block.label}</strong><p>{block.range}</p><em>{routine?.name??topTask?.title??'Open space'}</em></div></article>
          <article><Activity/><div><span>Day Progress</span><strong>{data.todayOverview.tasksDueToday?data.todayOverview.tasksDueToday+' due today':'No tracked total'}</strong><p>{data.projectStatus.activeTaskCount} active tasks</p><em>Glow will not invent a percentage.</em></div></article>
        </section>

        <section className="ref-hero-grid">
          <article className="ref-now">
            <span className="kicker">NOW</span>
            <h2>{block.label} Block</h2>
            <p>{block.range}</p>
            <h3>{topTask?.title??routine?.name??'You have breathing room'}</h3>
            <div className="ref-now-bottom">
              <div><CalendarDays/><span>Up next</span><strong>{nextEvent?fmtTime(nextEvent.startAt):'Open'}</strong><small>{nextEvent?.title??'Nothing scheduled'}</small></div>
              <div><ListTodo/><span>Before then</span>{tasks.slice(0,3).map(t=><small key={t.id}>○ {t.title}</small>)}{!tasks.length?<small>No open priority tasks.</small>:null}</div>
            </div>
          </article>

          <article className="ref-what-now">
            <span className="eyebrow">✧ WHAT SHOULD I DO NOW?</span>
            <h2>{topTask?.title??'Nothing urgent is surfaced.'}</h2>
            <p>{topTask?'Glow surfaced this from your highest-priority connected tasks.':'Your connected task queue does not currently provide a priority.'}</p>
            <div>{tasks.slice(0,3).map((t,i)=><button key={t.id} onClick={()=>document.dispatchEvent(new CustomEvent('glow:open',{detail:{prompt:'Help me do: '+t.title}}))}><b>{i+1}</b><span>{t.title}</span><ChevronRight/></button>)}</div>
          </article>

          <article className="ref-big3">
            <span className="eyebrow">◎ TODAY’S BIG 3</span>
            {[0,1,2].map((i)=>{const t=tasks[i];return <div key={i}><b>{i+1}</b><span><strong>{i===0?'Priority':i===1?'Next':'Later'}</strong><small>{t?.title??'No connected priority selected'}</small></span>{t?<button disabled={pending} onClick={()=>completeTask(t.id)}><Circle/></button>:<Circle/>}</div>})}
          </article>
        </section>

        <section className="ref-flow-row">
          <div className="ref-my-day">
            <header><span>✣ MY DAY</span><Link href="/calendar">View calendar →</Link></header>
            <div className="ref-timeline">{timeline.length?timeline.map(item=><Link href={item.kind==='event'?'/calendar':'/planning'} key={item.key}><time>{fmtTime(item.time)}</time><span>{item.label}</span></Link>):<p>No timed items are connected for today.</p>}</div>
          </div>
          <div className="ref-day-flow">
            <header>DAY FLOW</header>
            <div>{blocks.map(b=><button key={b.key} className={b.key===block.key?'active':''}><strong>{b.label}</strong><small>{b.range}</small><em>{b.key===block.key?'In progress':b.end<=(now.getHours()+now.getMinutes()/60)?'Complete':'Upcoming'}</em></button>)}</div>
          </div>
        </section>

        <section className="ref-mid-grid">
          <article className="ref-panel state"><header><SunMedium/>TODAY’S STATE</header>
            <div><span>Schedule</span><b>{nextEvent?'Active':'Clear'}</b></div>
            <div><span>Energy</span><b>{wellness?.energy??'Not logged'}</b></div>
            <div><span>Tasks</span><b>{data.projectStatus.activeTaskCount} active</b></div>
            <div><span>Routine</span><b>{routine?.name??'None now'}</b></div>
            <div><span>Next pressure point</span><b>{nextEvent?fmtTime(nextEvent.startAt)+' · '+nextEvent.title:'None detected'}</b></div>
          </article>

          <article className="ref-panel task-list"><header><ListTodo/>TASKS + TO-DOS <small>Live Glow data</small></header>
            {tasks.length?tasks.slice(0,5).map(t=><div key={t.id}><button disabled={pending} onClick={()=>completeTask(t.id)}><Circle/></button><span>{t.title}</span><em>{t.priority}</em></div>):<p>No connected tasks to show.</p>}
            <Link href="/tasks">View all tasks →</Link>
          </article>

          <article className="ref-panel brain-web"><header><Sparkles/>BRAIN DUMP / BRAIN WEB</header>
            <div className="web-stage">
              <span className="web-center">{firstName}</span>
              {noteNodes.map((n,i)=><Link href="/notes" key={n.id} className={'web-node n'+i}>{n.title}</Link>)}
              {!noteNodes.length?<span className="web-empty">No connected notes yet.</span>:null}
            </div>
            <small>Source: connected Glow notes. Notion web appears when Notion sync is connected.</small>
          </article>

          <article className="ref-panel routines"><header><Sparkles/>ROUTINES TODAY</header>
            {data.routinesForNow.length?data.routinesForNow.map(r=><Link href="/routines" key={r.id}><Circle/><span>{r.name}</span><small>{r.timeOfDay}</small></Link>):<p>No routine is scheduled for this block.</p>}
            <Link className="full" href="/routines">View full routine →</Link>
          </article>
        </section>

        <section className="ref-domain-grid">
          <article><header><Dumbbell/>BODY</header><strong>{data.workoutOfTheDay.label||'No workout surfaced'}</strong><p>{data.workoutOfTheDay.focus||'Fitness details are available when connected.'}</p><Link href="/fitness">Open Fitness →</Link></article>
          <article><header><WandSparkles/>BEAUTY TODAY</header>{data.beautyToday.length?data.beautyToday.slice(0,3).map(x=><p key={x.id}>○ {x.name}</p>):<p>No beauty routine surfaced now.</p>}<Link href="/beauty">Open Beauty →</Link></article>
          <article><header><UserRound/>STYLE</header><p>{nextEvent?'Glow can prepare style context for '+nextEvent.title+'.':'No event-based style prompt needed.'}</p><Link href="/closet">Open Closet →</Link></article>
          <article><header><BriefcaseBusiness/>CAREER</header><p>{tasks.find(t=>/job|career|interview|application|recruit/i.test(t.title))?.title??'No connected career action surfaced.'}</p><Link href="/projects">Open Career →</Link></article>
          <article><header><Sparkles/>BRAND BRAIN</header><p>{noteNodes.find(n=>/brand|skin|product|manufacturer|packag/i.test(n.title))?.title??'No connected brand note surfaced.'}</p><Link href="/notes">Open Brain →</Link></article>
          <article><header><ListTodo/>LIFE ADMIN</header><p>{tasks.find(t=>/bank|call|appointment|bill|return|prescription|phone/i.test(t.title))?.title??'No connected admin task surfaced.'}</p><Link href="/tasks">View all →</Link></article>
        </section>

        <section className="ref-bottom-grid">
          <article><header><UserRound/>PEOPLE</header><p>People only appear when a connected source provides relationship context.</p><Link href="/relationships">Open People →</Link></article>
          <article><header><CloudSun/>WEATHER + LEAVING</header><p>{nextEvent?('Next event '+fmtTime(nextEvent.startAt)):'No departure needed now.'}</p><p>{weather?weather.temp+'° · '+weatherLabel(weather.code):'Weather not connected yet.'}</p></article>
          <article><header><Inbox/>ON YOUR MIND</header>{noteNodes.slice(0,3).map(n=><p key={n.id}>○ {n.title}</p>)}{!noteNodes.length?<p>Nothing connected here yet.</p>:null}</article>
          <article><header><MessageCircle/>WHAT CHANGED?</header>{gmailChanges.length?gmailChanges.map(m=><p key={m.id}>○ {m.subject}</p>):<p>No connected Gmail changes surfaced.</p>}</article>
          <article><header><Moon/>CAN WAIT</header><p>{tasks.length>2?tasks.slice(2).map(t=>t.title).join(' · '):'Nothing is explicitly safe to defer from current data.'}</p></article>
          <article><header><CalendarDays/>TOMORROW</header>{tomorrowEvents.length?tomorrowEvents.map(e=><p key={e.id}>○ {fmtTime(e.startAt)} · {e.title}</p>):<p>No connected event is currently surfaced for tomorrow.</p>}<Link href="/calendar">View tomorrow →</Link></article>
        </section>

        <details className="ref-coverage"><summary>Data Coverage · verify every dashboard fact</summary><div>{coverage.map(row=><p key={row[0]}><strong>{row[0]}</strong><span>{row[1]}</span><em>{row[2]}</em><b>{row[3]}</b></p>)}</div><small>Screenshot content is never used as factual fallback data. Missing sources stay visibly missing.</small></details>

        <footer className="ref-command">
          <Link href="/inbox">＋ Capture</Link>
          <button onClick={()=>document.dispatchEvent(new CustomEvent('glow:open'))}><Sparkles/>Ask Glow anything…</button>
          <button onClick={()=>document.dispatchEvent(new CustomEvent('glow:open',{detail:{prompt:'What should I do next?'}}))}>What should I do next?</button>
          <button onClick={()=>document.dispatchEvent(new CustomEvent('glow:open',{detail:{prompt:'Plan tonight'}}))}>Plan tonight</button>
          <button onClick={()=>document.dispatchEvent(new CustomEvent('glow:open',{detail:{prompt:'Catch me up'}}))}>Catch me up</button>
        </footer>
      </section>
    </div>
  );
}
