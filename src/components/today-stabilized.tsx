'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { Bell, Brain, CalendarDays, Heart, Search, Sparkles, SunMedium, WandSparkles } from 'lucide-react';

type TaskLite = { id: string; title: string; priority: string; dueDateISO?: string | null };
type EventLite = { id: string; title: string; location?: string | null; startAtISO?: string | null; allDay?: boolean };
type RoutineLite = { id: string; name: string; timeOfDay: string };
type Props = {
  tasks: TaskLite[];
  events: EventLite[];
  routines: RoutineLite[];
  energy: number | null;
  mood: number | null;
  sleepHours: number | null;
};
type Daypart = 'morning' | 'afternoon' | 'evening' | 'night';

type EventEntry = { event: EventLite; date: Date };

const CSS = String.raw`
:host{display:block;position:fixed;inset:0;z-index:2147483000;background:#f4ebe6;color:#302725;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
*,*::before,*::after{box-sizing:border-box}
button,input{font:inherit;color:inherit}
button{appearance:none;-webkit-appearance:none}
.app{height:100dvh;overflow:auto;background:linear-gradient(180deg,#faf5f1 0%,#f2e8e3 58%,#eadfd9 100%);color:#302725}
.frame{min-height:100%;padding:18px 20px 14px;display:grid;grid-template-rows:auto minmax(0,1fr) auto auto;gap:12px}
.header{display:flex;align-items:flex-start;justify-content:space-between;gap:20px}
.brand{font-size:11px;letter-spacing:.26em;font-weight:700}
.greeting{margin-top:8px;font-family:Georgia,"Times New Roman",serif;font-size:clamp(31px,3.1vw,46px);line-height:1;letter-spacing:-.03em}
.date{margin-top:7px;font-size:9px;letter-spacing:.17em;font-weight:700}
.tools{display:flex;gap:8px}.icon{width:44px;height:44px;border:1px solid rgba(137,105,96,.22);border-radius:14px;background:rgba(255,255,255,.52);display:grid;place-items:center;cursor:pointer;box-shadow:0 7px 20px rgba(67,47,43,.05)}
.main{min-height:0;display:grid;grid-template-columns:minmax(330px,1.45fr) minmax(160px,.62fr) minmax(270px,.9fr);gap:12px;align-items:stretch}
.surface{border:1px solid rgba(135,104,95,.20);border-radius:24px;background:linear-gradient(145deg,rgba(255,255,255,.70),rgba(250,242,238,.74));box-shadow:0 10px 28px rgba(72,50,46,.06)}
.present{padding:20px;display:grid;grid-template-columns:minmax(0,1fr) auto;grid-template-rows:auto auto auto 1fr auto;gap:0 18px;min-height:0}
.eyebrow{font-size:9px;letter-spacing:.18em;font-weight:700;text-transform:uppercase}
.clock{grid-column:2;grid-row:1;font-size:10px;font-weight:700;white-space:nowrap}
.now{margin-top:8px;font-family:Georgia,"Times New Roman",serif;font-size:50px;line-height:.85}
.task{grid-column:1;margin:10px 0 0;font-family:Georgia,"Times New Roman",serif;font-size:clamp(24px,2.2vw,34px);line-height:1.02;font-weight:400;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.context{grid-column:1;margin:8px 0 0;font-size:12px;color:#72615d}
.note{grid-column:1;align-self:end;margin:0;font-family:Georgia,"Times New Roman",serif;font-size:15px;font-style:italic;color:#8e6d65}
.focus{grid-column:2;grid-row:2/6;align-self:center;min-width:92px;height:92px;border:1px solid rgba(146,110,101,.28);border-radius:50%;background:rgba(255,255,255,.42);cursor:pointer;display:grid;place-items:center;text-align:center}.focus span{font-size:9px;font-weight:700;letter-spacing:.12em;line-height:1.25}
.shaktiZone{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:0}
.shakti{position:relative;width:min(18vw,190px);height:min(36vh,300px)}
.halo{position:absolute;left:50%;top:48%;width:82%;height:58%;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(ellipse,rgba(255,255,255,.92) 0 8%,rgba(247,235,249,.40) 27%,rgba(220,234,255,.18) 49%,transparent 72%)}
.core{position:absolute;left:50%;top:48%;width:18%;height:36%;transform:translate(-50%,-50%);border-radius:50%;background:linear-gradient(180deg,transparent,rgba(255,255,255,.70) 24%,#fff 48%,#fff 58%,rgba(226,237,255,.58) 76%,transparent);box-shadow:0 0 14px rgba(255,255,255,.95),0 0 36px rgba(232,219,248,.48)}
.ray{position:absolute;left:50%;top:48%;width:72%;height:1px;transform-origin:left center;background:linear-gradient(90deg,rgba(255,255,255,.72),rgba(228,221,247,.24),transparent)}
.r1{transform:rotate(18deg)}.r2{transform:rotate(-18deg)}.r3{transform:rotate(37deg);opacity:.65}.r4{transform:rotate(-37deg);opacity:.65}
.shaktiLabel{margin-top:-12px;border:0;background:transparent;font-family:Georgia,"Times New Roman",serif;font-size:21px;font-style:italic;cursor:pointer}.ask{margin-top:12px;padding:11px 18px;border:1px solid rgba(139,106,97,.20);border-radius:999px;background:rgba(255,255,255,.62);cursor:pointer;box-shadow:0 7px 20px rgba(67,47,43,.05)}
.future{padding:17px 18px;min-height:0}.futureList{margin-top:8px;display:grid;gap:0}.futureItem{width:100%;display:grid;grid-template-columns:12px minmax(0,1fr);gap:10px;padding:10px 0;border:0;border-bottom:1px solid rgba(137,105,96,.16);background:transparent;text-align:left;cursor:pointer}.futureItem:last-child{border-bottom:0}.node{width:9px;height:9px;margin-top:3px;border:1px solid rgba(137,105,96,.45);border-radius:50%;background:#faf1ed}.futureMeta{font-size:8px;letter-spacing:.14em;font-weight:700;color:#75625d}.futureTime{margin-left:6px;font-weight:500;letter-spacing:0;color:#9a8782}.futureTitle{display:block;margin-top:4px;font-family:Georgia,"Times New Roman",serif;font-size:17px;font-weight:400;line-height:1.06}.futureNote{display:block;margin-top:4px;font-size:9px;color:#8c7b76}
.shelf{display:grid;grid-template-columns:1.15fr .9fr .86fr 1.25fr 1fr;gap:10px}.tile{min-height:112px;padding:13px 14px}.tile h3{margin:0 0 8px;font-size:9px;letter-spacing:.16em;text-transform:uppercase}.whatRow{display:grid;grid-template-columns:22px minmax(0,1fr) auto;gap:7px;align-items:center;padding:6px 0;border-top:1px solid rgba(137,105,96,.14);border-left:0;border-right:0;border-bottom:0;background:transparent;width:100%;text-align:left;cursor:pointer}.n{width:21px;height:21px;border:1px solid rgba(137,105,96,.28);border-radius:50%;display:grid;place-items:center;font-size:8px}.whatTitle{font-family:Georgia,"Times New Roman",serif;font-size:12px;line-height:1.05;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.state{font-size:8px;color:#8d7a74;white-space:nowrap}.capacityState{font-family:Georgia,"Times New Roman",serif;font-size:24px}.capacityDetail{margin-top:8px;display:grid;gap:5px}.capLine{display:flex;justify-content:space-between;gap:8px;font-size:9px;color:#74625d}.capLine b{font-weight:600;color:#3a302d}.timing{display:grid;grid-template-columns:1fr 1fr;gap:12px}.timing>div+div{border-left:1px solid rgba(137,105,96,.16);padding-left:12px}.timing strong{display:block;margin-top:7px;font-family:Georgia,"Times New Roman",serif;font-size:23px;font-weight:400}.timing small{display:block;margin-top:4px;font-size:8px;color:#8c7a74}.priorityList,.routineList{display:grid;gap:6px}.priorityItem,.routineItem{width:100%;padding:5px 0;border:0;border-top:1px solid rgba(137,105,96,.14);background:transparent;text-align:left;cursor:pointer}.priorityItem strong,.routineItem strong{font-family:Georgia,"Times New Roman",serif;font-size:11px;font-weight:400;line-height:1.05}.priorityItem small,.routineItem small{display:block;margin-top:3px;font-size:8px;color:#8c7a74}
.nav{display:grid;grid-template-columns:repeat(5,1fr);gap:4px;padding:5px;border:1px solid rgba(137,105,96,.18);border-radius:22px;background:rgba(255,255,255,.62);box-shadow:0 8px 24px rgba(67,47,43,.05)}.nav button{min-height:44px;border:0;border-radius:17px;background:transparent;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;font-size:11px}.nav .active{background:#fff}
@keyframes drift{from{transform:translateY(-1px)}to{transform:translateY(1px)}}.core{animation:drift 4.8s ease-in-out infinite alternate}
@media(max-width:1050px){.frame{padding:14px 14px 12px}.main{grid-template-columns:minmax(300px,1.35fr) minmax(135px,.55fr) minmax(235px,.9fr);gap:9px}.shelf{grid-template-columns:1.2fr .9fr .9fr 1.2fr}.shelf .routines{grid-column:1/-1;min-height:86px}.greeting{font-size:34px}.present{padding:16px}.now{font-size:43px}.task{font-size:26px}.futureTitle{font-size:15px}}
@media(max-width:760px){.app{overflow:auto}.frame{display:block;padding:16px 14px 18px}.header{margin-bottom:12px}.greeting{font-size:34px;white-space:normal}.tools{gap:6px}.icon{width:42px;height:42px}.main{display:grid;grid-template-columns:1fr;gap:10px}.present{min-height:250px}.shaktiZone{min-height:250px}.shakti{width:180px;height:240px}.future{min-height:0}.shelf{margin-top:10px;grid-template-columns:1fr 1fr}.shelf .what,.shelf .priorities,.shelf .routines{grid-column:1/-1}.nav{margin-top:10px;position:sticky;bottom:8px;z-index:20}.nav button{min-height:48px}.focus{min-width:82px;height:82px}}
@media(max-width:520px){.header{display:grid;gap:12px}.tools{justify-content:flex-start}.present{grid-template-columns:minmax(0,1fr) 72px}.focus{min-width:70px;height:70px}.shelf{grid-template-columns:1fr}.shelf>*{grid-column:1!important}.nav button{flex-direction:column;gap:2px;font-size:9px}}
@media(prefers-reduced-motion:reduce){.core{animation:none}}
`;

function getDaypart(hour: number): Daypart {
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}
function greeting(daypart: Daypart) {
  if (daypart === 'morning') return 'Good morning, Tatiyana ♡';
  if (daypart === 'afternoon') return 'Good afternoon, Tatiyana ♡';
  if (daypart === 'evening') return 'Good evening, Tatiyana ♡';
  return 'Good night, Tatiyana ♡';
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function duration(ms: number) {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(minutes / 60)}H ${String(minutes % 60).padStart(2, '0')}M`;
}
function priorityWeight(priority: string) {
  if (priority === 'urgent') return 4;
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}
function daypartFit(title: string, daypart: Daypart) {
  const text = title.toLowerCase();
  const good: Record<Daypart, string[]> = {
    morning: ['morning', 'wake', 'breakfast'],
    afternoon: ['midday', 'afternoon', 'lunch'],
    evening: ['evening', 'dinner', 'transition'],
    night: ['night', 'sleep', 'bedtime', 'shutdown', 'wind down', 'wind-down'],
  };
  const bad: Record<Daypart, string[]> = {
    morning: ['night', 'bedtime'],
    afternoon: ['morning', 'night'],
    evening: ['morning', 'midday'],
    night: ['morning', 'midday', 'afternoon'],
  };
  let score = 0;
  good[daypart].forEach((word) => { if (text.includes(word)) score += 3; });
  bad[daypart].forEach((word) => { if (text.includes(word)) score -= 3; });
  return score;
}

export function TodayStabilized({ tasks, events, routines, energy, mood, sleepHours }: Props) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (hostRef.current && !hostRef.current.shadowRoot) setShadow(hostRef.current.attachShadow({ mode: 'open' }));
    else if (hostRef.current?.shadowRoot) setShadow(hostRef.current.shadowRoot);
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const daypart = getDaypart(now.getHours());
  const rankedTasks = useMemo(() => [...tasks].sort((a, b) => {
    const fit = daypartFit(b.title, daypart) - daypartFit(a.title, daypart);
    return fit || priorityWeight(b.priority) - priorityWeight(a.priority);
  }), [tasks, daypart]);
  const top = rankedTasks.slice(0, 3);
  const active = top[0]?.title ?? 'Open breathing space';

  const entries = useMemo<EventEntry[]>(() => events.flatMap((event) => {
    if (!event.startAtISO || event.allDay) return [];
    const date = new Date(event.startAtISO);
    return Number.isNaN(date.getTime()) ? [] : [{ event, date }];
  }).sort((a, b) => a.date.getTime() - b.date.getTime()), [events]);

  const todayFuture = entries.filter((entry) => sameDay(entry.date, now) && entry.date > now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowFirst = entries.find((entry) => sameDay(entry.date, tomorrowDate));
  const next = todayFuture[0] ?? null;
  const later = todayFuture[1] ?? null;
  const tonight = todayFuture.find((entry) => entry.date.getHours() >= 17 && entry !== next && entry !== later) ?? null;
  const used = new Set([next?.event.id, later?.event.id, tonight?.event.id].filter(Boolean));
  const schedule = [
    { label: 'NEXT', item: next, empty: 'Open breathing space' },
    { label: 'LATER', item: later, empty: 'Nothing fixed' },
    { label: 'TONIGHT', item: tonight, empty: 'Nothing fixed' },
    { label: 'TOMORROW', item: tomorrowFirst && !used.has(tomorrowFirst.event.id) ? tomorrowFirst : tomorrowFirst, empty: 'A quiet glimpse' },
  ];

  const eod = new Date(now); eod.setHours(23, 59, 59, 999);
  const timeRemaining = duration(eod.getTime() - now.getTime());
  const leaveReady = next ? duration(Math.max(0, next.date.getTime() - 30 * 60000 - now.getTime())) : 'CLEAR';
  const daypartRoutines = routines.filter((routine) => routine.timeOfDay === daypart).slice(0, 3);
  const energyPct = energy == null ? null : Math.max(0, Math.min(100, Math.round(energy * 10)));
  const moodPct = mood == null ? null : Math.max(0, Math.min(100, Math.round(mood * 10)));

  const ui = <>
    <style>{CSS}</style>
    <div className="app">
      <div className="frame">
        <header className="header">
          <div>
            <div className="brand">GLOW OS</div>
            <div className="greeting">{greeting(daypart)}</div>
            <div className="date">{now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</div>
          </div>
          <div className="tools">
            <button className="icon" aria-label="Search" onClick={() => router.push('/search')}><Search size={19} /></button>
            <button className="icon" aria-label="Calendar" onClick={() => router.push('/calendar')}><CalendarDays size={19} /></button>
            <button className="icon" aria-label="Attention Center" onClick={() => router.push('/notices')}><Bell size={19} /></button>
          </div>
        </header>

        <div className="main">
          <section className="surface present">
            <div className="eyebrow">LIVE MOMENT · NOW</div>
            <div className="clock">{now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
            <div className="now">NOW</div>
            <h1 className="task">{active}</h1>
            <p className="context">{top.length ? 'One clear next move.' : 'Nothing needs to be forced.'}</p>
            <p className="note">{daypart === 'night' ? 'Only what still matters.' : 'This is your moment.'}</p>
            <button className="focus" onClick={() => router.push('/focus')}><span>START<br/>FOCUS</span></button>
          </section>

          <section className="shaktiZone" aria-label="Shakti">
            <div className="shakti" aria-hidden="true"><div className="halo"/><div className="ray r1"/><div className="ray r2"/><div className="ray r3"/><div className="ray r4"/><div className="core"/></div>
            <button className="shaktiLabel" onClick={() => router.push('/ask-glow')}>Shakti</button>
            <button className="ask" onClick={() => router.push('/ask-glow')}>Ask Shakti</button>
          </section>

          <section className="surface future">
            <div className="eyebrow">THE REST OF TODAY</div>
            <div className="futureList">{schedule.map(({ label, item, empty }) => <button className="futureItem" key={label} onClick={() => router.push('/calendar')}>
              <span className="node" />
              <span><span className="futureMeta">{label}<span className="futureTime">{item ? item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : label === 'TOMORROW' ? 'Preview' : ''}</span></span><strong className="futureTitle">{item?.event.title ?? empty}</strong><small className="futureNote">{item?.event.location ?? (item ? 'Scheduled' : 'No fixed event')}</small></span>
            </button>)}</div>
          </section>
        </div>

        <section className="shelf" aria-label="Today support shelf">
          <div className="surface tile what"><h3>WHAT NOW? <Sparkles size={11} /></h3>{top.length ? top.map((task, index) => <button className="whatRow" key={task.id} onClick={() => router.push('/focus')}><span className="n">{index + 1}</span><span className="whatTitle">{task.title}</span><span className="state">{index === 0 ? 'Now' : 'Can wait'}</span></button>) : <div className="capacityState">Open space</div>}</div>

          <div className="surface tile capacity"><h3>CAPACITY</h3>{energyPct == null && moodPct == null && sleepHours == null ? <><div className="capacityState">Not checked in</div><div className="capacityDetail"><div className="capLine"><span>Glow will not invent a score.</span></div></div></> : <div className="capacityDetail">{energyPct != null && <div className="capLine"><span>Energy</span><b>{energyPct}%</b></div>}{moodPct != null && <div className="capLine"><span>Mood</span><b>{moodPct}%</b></div>}{sleepHours != null && <div className="capLine"><span>Sleep</span><b>{sleepHours.toFixed(1)}h</b></div>}</div>}</div>

          <div className="surface tile timing"><div><h3>TIME LEFT</h3><strong>{timeRemaining}</strong><small>until day’s end</small></div><div><h3>LEAVE-READY</h3><strong>{leaveReady}</strong><small>{next ? '30-minute preparation buffer' : 'no fixed commitment ahead'}</small></div></div>

          <div className="surface tile priorities"><h3>PRIORITIES</h3><div className="priorityList">{top.length ? top.map((task) => <button className="priorityItem" key={task.id} onClick={() => router.push('/focus')}><strong>{task.title}</strong><small>{task.priority || 'Normal'} priority</small></button>) : <div className="capacityState">Nothing queued</div>}</div></div>

          <div className="surface tile routines"><h3>ROUTINES</h3><div className="routineList">{daypartRoutines.length ? daypartRoutines.map((routine) => <button className="routineItem" key={routine.id} onClick={() => router.push('/routines')}><strong>{routine.name}</strong><small>{routine.timeOfDay}</small></button>) : <div className="capacityState">None due now</div>}</div></div>
        </section>

        <nav className="nav" aria-label="Glow worlds">
          <button className="active"><SunMedium size={17}/><span>Today</span></button>
          <button onClick={() => router.push('/planning')}><CalendarDays size={17}/><span>Plan</span></button>
          <button onClick={() => router.push('/world')}><Heart size={17}/><span>Life</span></button>
          <button onClick={() => router.push('/brain')}><Brain size={17}/><span>Brain</span></button>
          <button onClick={() => router.push('/world')}><WandSparkles size={17}/><span>Create</span></button>
        </nav>
      </div>
    </div>
  </>;

  return <div ref={hostRef} style={{ position: 'fixed', inset: 0, zIndex: 2147483000 }}>{shadow ? createPortal(ui, shadow) : null}</div>;
}
