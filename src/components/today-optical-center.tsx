'use client';

import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUp,
  Bell,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  Dumbbell,
  Focus,
  LayoutGrid,
  MapPin,
  Plus,
  RotateCcw,
  Route,
  Search,
  Sparkles,
  Users,
} from 'lucide-react';

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
type TimelineItem = {
  id: string;
  title: string;
  at: Date | null;
  kind: 'event' | 'task' | 'routine';
  meta?: string;
  location?: string | null;
  allDay?: boolean;
};
type Bucket = 'NEXT' | 'LATER' | 'TONIGHT' | 'TOMORROW';

const CSS = String.raw`
:host{position:fixed;inset:0;z-index:2147480000;display:block;background:#f3eee8;color:#242220;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
*,*::before,*::after{box-sizing:border-box}
button,input{font:inherit;color:inherit}
button{appearance:none;-webkit-appearance:none}
button:focus-visible,input:focus-visible{outline:2px solid rgba(109,119,135,.45);outline-offset:2px}
.app{height:100dvh;overflow:auto;background:radial-gradient(circle at 58% 16%,rgba(255,255,255,.96),transparent 34%),radial-gradient(circle at 13% 78%,rgba(232,222,214,.62),transparent 36%),linear-gradient(125deg,#f8f4ef 0%,#eee6df 52%,#f8f5f1 100%)}
.frame{min-height:100%;padding:22px;display:grid;grid-template-columns:112px minmax(0,1fr);grid-template-rows:58px minmax(0,1fr);gap:14px}
.topbar{grid-column:1/-1;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 12px;border:1px solid rgba(255,255,255,.72);border-radius:30px;background:linear-gradient(180deg,rgba(255,255,255,.54),rgba(255,255,255,.23));box-shadow:inset 0 1px 0 rgba(255,255,255,.86),0 12px 34px rgba(82,72,64,.055)}
.brand{display:flex;align-items:center;gap:18px;min-width:0}.brand strong{font-size:13px;font-weight:650;letter-spacing:-.01em}.batch{font-size:10px;color:#8b8782}.world{justify-self:center;font-size:10px;font-weight:650;letter-spacing:.16em;text-transform:uppercase;white-space:nowrap;color:#4a4846}.askTop{justify-self:end;display:flex;align-items:center;gap:9px;border:0;background:transparent;cursor:pointer;min-height:44px;padding:4px 2px 4px 10px}.askTop span:last-child{font-size:10px;line-height:1.15;text-align:left}.pearl{position:relative;display:inline-block;border-radius:50%;background:radial-gradient(circle at 33% 28%,#fff 0 15%,rgba(255,255,255,.72) 23%,rgba(208,225,255,.42) 42%,rgba(244,205,249,.38) 59%,rgba(254,226,190,.42) 74%,rgba(255,255,255,.68) 86%,rgba(180,176,176,.18) 100%);box-shadow:inset -5px -7px 11px rgba(148,141,146,.16),inset 4px 4px 9px rgba(255,255,255,.94),0 7px 15px rgba(92,78,71,.13);border:1px solid rgba(255,255,255,.72)}
.pearl::after{content:"";position:absolute;inset:16% 20% 56% 26%;border-radius:50%;background:rgba(255,255,255,.88)}
.pearlTop{width:36px;height:36px}
.rail{grid-row:2;display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:18px;padding:4px 0 8px}
.railButton{width:80px;min-height:78px;border:0;background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;color:#625e59;font-size:10px}
.railButton .railIcon{width:46px;height:46px;border:1px solid rgba(255,255,255,.76);border-radius:16px;display:grid;place-items:center;background:linear-gradient(180deg,rgba(255,255,255,.58),rgba(255,255,255,.24));box-shadow:inset 0 1px 0 rgba(255,255,255,.86),0 7px 21px rgba(80,69,62,.055)}
.railButton.active{color:#272421}.railButton.active .railIcon{background:radial-gradient(circle at 50% 44%,rgba(255,255,255,.92),rgba(255,255,255,.40) 56%,rgba(230,218,209,.30));box-shadow:inset 0 1px 0 #fff,0 10px 25px rgba(80,69,62,.09)}
.railSpacer{flex:1}.addButton{width:48px;height:48px;border-radius:50%;border:1px solid rgba(255,255,255,.82);background:linear-gradient(180deg,rgba(255,255,255,.60),rgba(255,255,255,.25));display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 1px 0 #fff,0 9px 24px rgba(80,69,62,.08)}
.content{grid-column:2;grid-row:2;min-width:0;display:flex;flex-direction:column;gap:14px}
.living{min-height:392px;border:1px solid rgba(255,255,255,.78);border-radius:35px;background:linear-gradient(135deg,rgba(255,255,255,.47),rgba(244,238,233,.27) 44%,rgba(255,255,255,.38));box-shadow:inset 0 1px 0 rgba(255,255,255,.96),inset 0 -1px 0 rgba(255,255,255,.35),0 18px 48px rgba(86,74,66,.06);padding:26px 32px 20px;display:grid;grid-template-columns:minmax(175px,.72fr) minmax(240px,1.05fr) minmax(370px,1.58fr);grid-template-rows:minmax(236px,1fr) auto;column-gap:22px;position:relative;overflow:hidden}
.living::before{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 0 29%,rgba(255,255,255,.25) 31%,transparent 33% 67%,rgba(255,255,255,.19) 69%,transparent 72%);pointer-events:none;opacity:.5}
.nowZone{position:relative;z-index:1;padding:8px 0 0 6px}.time{font-size:13px;color:#6d6863}.nowTitle{margin-top:15px;font-size:37px;line-height:.95;font-weight:420;letter-spacing:-.055em}.flow{margin-top:15px;font-size:15px}.flowNote{margin-top:7px;font-size:11px;color:#74706b}.statusPill{margin-top:26px;display:inline-flex;align-items:center;gap:8px;padding:7px 12px;border:1px solid rgba(255,255,255,.72);border-radius:999px;background:rgba(255,255,255,.30);font-size:10px;box-shadow:inset 0 1px 0 rgba(255,255,255,.8)}.statusDot{width:7px;height:7px;border-radius:50%;background:#d5df9a;box-shadow:0 0 7px rgba(193,207,113,.65)}
.liquidZone{position:relative;z-index:1;display:grid;place-items:center;min-width:0}.liquidSvg{width:min(100%,390px);height:auto;overflow:visible}.liquidShadow{filter:drop-shadow(0 22px 18px rgba(109,92,80,.11))}.liquidHint{position:absolute;bottom:12px;font-size:9px;letter-spacing:.12em;color:#8d8883;text-transform:uppercase;opacity:.55}
.intel{position:relative;z-index:1;display:grid;grid-template-rows:auto 1fr;gap:20px;padding-top:2px}.whatLabel{font-size:12px;font-weight:600}.whatBox{margin-top:9px;height:58px;border:1px solid rgba(255,255,255,.78);border-radius:17px;background:linear-gradient(180deg,rgba(255,255,255,.55),rgba(255,255,255,.26));display:grid;grid-template-columns:minmax(0,1fr) 46px;align-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.88)}.whatBox input{height:100%;border:0;background:transparent;padding:0 18px;font-size:12px;outline:none;min-width:0}.whatBox input::placeholder{color:#9b9590}.submitIntent{width:34px;height:34px;border-radius:50%;border:1px solid rgba(203,198,193,.55);background:radial-gradient(circle at 40% 32%,rgba(255,255,255,.95),rgba(215,220,226,.55));display:grid;place-items:center;cursor:pointer}
.intelCards{display:grid;grid-template-columns:1fr .92fr 1.28fr;gap:12px}.mini{min-height:102px;border:1px solid rgba(255,255,255,.65);border-radius:17px;background:linear-gradient(145deg,rgba(255,255,255,.38),rgba(255,255,255,.18));padding:16px;box-shadow:inset 0 1px 0 rgba(255,255,255,.72)}.miniLabel{font-size:9px;color:#57534f}.miniValue{margin-top:8px;font-size:12px}.capacityVisual{margin-top:12px;height:20px;position:relative}.capacityVisual::before{content:"";position:absolute;left:0;right:4px;top:10px;height:1px;background:linear-gradient(90deg,transparent,rgba(121,118,115,.35),transparent);transform:rotate(-5deg)}.energyMini{display:grid;grid-template-columns:1fr 54px;align-items:center;gap:8px}.pearlEnergy{width:52px;height:52px}.priorityMini{padding-right:14px}.priorityRow{display:grid;grid-template-columns:14px minmax(0,1fr) 14px;gap:7px;align-items:center;margin-top:7px;font-size:9px}.priorityRow:first-of-type{margin-top:9px}.priorityIndex{color:#716d68}.priorityText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.priorityCircle{width:13px;height:13px;border:1px solid rgba(126,120,115,.24);border-radius:50%}
.focusBand{grid-column:1/-1;position:relative;z-index:1;margin-top:8px;min-height:108px;border:1px solid rgba(255,255,255,.68);border-radius:20px;background:linear-gradient(180deg,rgba(255,255,255,.31),rgba(255,255,255,.14));display:grid;grid-template-columns:1.35fr 1fr 1.1fr}.focusCell{padding:18px 26px;min-width:0}.focusCell+.focusCell{border-left:1px solid rgba(170,162,154,.18)}.cellLabel{font-size:9px;color:#706b66}.cellTitle{margin-top:10px;font-size:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cellMeta{margin-top:11px;font-size:10px;color:#7c7772;display:flex;align-items:center;gap:9px;min-height:18px}.thinLine{height:5px;border-radius:999px;background:rgba(255,255,255,.42);border:1px solid rgba(255,255,255,.65);overflow:hidden;width:min(230px,85%)}.thinLine span{display:block;width:64%;height:100%;background:linear-gradient(90deg,rgba(204,202,197,.45),rgba(255,255,255,.96),rgba(239,209,147,.64))}.joinButton{border:1px solid rgba(255,255,255,.72);border-radius:999px;background:rgba(255,255,255,.30);padding:5px 12px;font-size:9px;cursor:pointer}
.stream{display:grid;gap:10px}.timeRow{min-height:94px;border:1px solid rgba(255,255,255,.72);border-radius:24px;background:linear-gradient(90deg,rgba(255,255,255,.36),rgba(247,241,236,.24),rgba(255,255,255,.31));box-shadow:inset 0 1px 0 rgba(255,255,255,.84),0 10px 28px rgba(83,71,64,.035);display:grid;grid-template-columns:205px 1fr 1fr 150px;align-items:center;gap:10px;padding:10px 18px 10px 28px;position:relative}.timeRow::before{content:"";position:absolute;left:-10px;top:50%;width:13px;height:1px;background:rgba(126,120,115,.28)}.rowLead{min-width:0}.rowTime{font-size:9px;color:#655f5a}.rowName{margin-top:5px;font-size:24px;line-height:.95;letter-spacing:-.04em}.rowCopy{margin-top:5px;font-size:10px;color:#7e7974;line-height:1.25}.eventSlot{display:grid;grid-template-columns:58px minmax(0,1fr);gap:12px;align-items:center;min-width:0}.eventPearl{width:48px;height:48px;justify-self:center}.eventTitle{font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eventMeta{margin-top:7px;font-size:9px;color:#7b7671;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tag{display:inline-block;margin-left:8px;padding:3px 7px;border:1px solid rgba(142,136,130,.18);border-radius:5px;font-size:8px;color:#837e78}.countBox{justify-self:end;width:138px;min-height:64px;border:1px solid rgba(255,255,255,.68);border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,.39),rgba(255,255,255,.18));padding:12px 14px}.countLabel{font-size:8px;color:#65615c}.countValue{margin-top:7px;font-size:14px}.empty{font-size:11px;color:#918b85;font-style:italic}.streamArrow{position:absolute;left:50%;bottom:-14px;transform:translateX(-50%);font-size:18px;color:rgba(129,123,117,.28);z-index:2}
.bottomBar{min-height:58px;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 12px}.dayView{justify-self:start;display:flex;align-items:center;gap:12px;border:1px solid rgba(255,255,255,.74);border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.49),rgba(255,255,255,.22));padding:10px 16px;font-size:10px;cursor:pointer}.replan{justify-self:center;min-width:250px;display:flex;align-items:center;justify-content:center;gap:9px;border:1px solid rgba(255,255,255,.80);border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.57),rgba(255,255,255,.25));padding:12px 22px;font-size:11px;cursor:pointer;box-shadow:inset 0 1px 0 #fff,0 9px 24px rgba(79,68,61,.055)}.saveTools{justify-self:end;display:flex;align-items:center;gap:16px;font-size:9px;color:#827d78}.undo{display:flex;align-items:center;gap:7px;border:1px solid rgba(255,255,255,.68);border-radius:999px;background:rgba(255,255,255,.25);padding:9px 12px;font-size:9px;color:#77726d}.undo:disabled{opacity:.55}.cornerPearl{width:52px;height:52px;margin-left:10px}
@media(max-width:1180px){.frame{grid-template-columns:90px minmax(0,1fr);padding:14px;gap:10px}.railButton{width:68px}.living{grid-template-columns:minmax(150px,.68fr) minmax(190px,.88fr) minmax(330px,1.55fr);padding:20px 22px}.intelCards{grid-template-columns:1fr 1fr}.priorityMini{grid-column:1/-1;min-height:82px}.focusBand{grid-template-columns:1.15fr 1fr 1fr}.timeRow{grid-template-columns:165px 1fr 1fr 128px;padding-left:20px}.rowName{font-size:21px}.countBox{width:118px}.world{font-size:9px}}
@media(max-width:900px){.frame{grid-template-columns:76px minmax(0,1fr)}.railButton{width:60px;font-size:9px}.railButton .railIcon{width:42px;height:42px}.living{grid-template-columns:155px minmax(170px,.7fr) minmax(0,1.4fr);min-height:420px;column-gap:14px}.nowTitle{font-size:34px}.liquidSvg{width:210px}.intelCards{grid-template-columns:1fr 1fr}.priorityMini{display:none}.focusBand{grid-template-columns:1fr 1fr}.focusCell:nth-child(3){grid-column:1/-1;border-left:0;border-top:1px solid rgba(170,162,154,.18)}.timeRow{grid-template-columns:150px 1fr 118px}.eventSlot.second{display:none}.bottomBar{grid-template-columns:1fr auto}.saveTools{display:none}.replan{justify-self:end;min-width:200px}.batch{display:none}}
@media(max-width:720px){:host{position:fixed}.app{overflow:auto}.frame{display:block;padding:12px 10px 88px}.topbar{position:sticky;top:8px;z-index:30;grid-template-columns:1fr auto;padding:0 12px;height:54px}.world{display:none}.askTop{grid-column:2}.rail{position:fixed;left:10px;right:10px;bottom:8px;z-index:40;height:64px;padding:5px 7px;border:1px solid rgba(255,255,255,.82);border-radius:23px;background:rgba(247,242,237,.94);display:grid;grid-template-columns:repeat(6,1fr) 46px;gap:2px;box-shadow:0 12px 35px rgba(72,62,56,.16)}.railButton{width:auto;min-height:52px;font-size:0;gap:0}.railButton .railIcon{width:42px;height:42px}.railSpacer{display:none}.addButton{width:42px;height:42px;align-self:center;justify-self:center}.content{margin-top:10px}.living{display:grid;grid-template-columns:1fr;grid-template-rows:auto auto auto auto;padding:20px 18px;min-height:0;border-radius:28px}.nowZone{padding:0}.liquidZone{min-height:210px}.liquidSvg{width:min(300px,86vw)}.liquidHint{bottom:0}.intel{margin-top:12px}.intelCards{grid-template-columns:1fr 1fr}.priorityMini{display:block;grid-column:1/-1}.focusBand{margin-top:18px;grid-template-columns:1fr}.focusCell+.focusCell{border-left:0;border-top:1px solid rgba(170,162,154,.18)}.focusCell:nth-child(3){grid-column:auto}.timeRow{grid-template-columns:1fr;padding:18px 18px;gap:14px;min-height:0}.timeRow::before,.streamArrow{display:none}.rowName{font-size:26px}.eventSlot{grid-template-columns:50px minmax(0,1fr)}.eventSlot.second{display:grid}.countBox{justify-self:stretch;width:100%;min-height:54px;display:flex;align-items:center;justify-content:space-between}.countValue{margin-top:0}.bottomBar{display:grid;grid-template-columns:1fr;gap:10px;padding:4px}.dayView,.replan{justify-self:stretch}.replan{min-width:0}.saveTools{display:flex;justify-self:center}.cornerPearl{display:none}}
@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important}}
`;

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function tomorrowFrom(date: Date) {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  return next;
}
function formatClock(date: Date) {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date);
}
function formatRange(item: TimelineItem) {
  if (!item.at) return item.meta ?? '';
  return `${formatClock(item.at)}${item.meta ? ` · ${item.meta}` : ''}`;
}
function until(from: Date, to: Date | null) {
  if (!to) return 'Open';
  const mins = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`;
}
function priorityWeight(priority: string) {
  if (priority === 'urgent') return 4;
  if (priority === 'high') return 3;
  if (priority === 'medium') return 2;
  return 1;
}
function energyLabel(energy: number | null) {
  if (energy === null) return 'Not checked in';
  if (energy >= 8) return 'Clear · Strong';
  if (energy >= 6) return 'Clear · Steady';
  if (energy >= 4) return 'Gentle · Steady';
  return 'Low · Protect energy';
}
function capacityLabel(energy: number | null) {
  if (energy === null) return 'Check in first';
  if (energy >= 8) return 'High focus';
  if (energy >= 6) return 'Steady focus';
  if (energy >= 4) return 'Moderate';
  return 'Low load';
}
function bucketCopy(bucket: Bucket) {
  if (bucket === 'NEXT') return ['Build and move', 'Protect your next hour.'];
  if (bucket === 'LATER') return ['Collaborate and create', 'Afternoon momentum.'];
  if (bucket === 'TONIGHT') return ['Unwind and reset', 'Close the day well.'];
  return ['Preview your tomorrow', 'So today can flow.'];
}
function bucketTime(bucket: Bucket, items: TimelineItem[]) {
  const first = items.find((item) => item.at)?.at;
  if (first) return formatClock(first);
  if (bucket === 'TOMORROW') return 'Tomorrow';
  return 'Open';
}

function LiquidObject() {
  return (
    <svg className="liquidSvg liquidShadow" viewBox="0 0 360 250" aria-label="Glow living matter">
      <defs>
        <linearGradient id="pearlBody" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".93" />
          <stop offset="26%" stopColor="#f2e9df" stopOpacity=".62" />
          <stop offset="47%" stopColor="#ffffff" stopOpacity=".86" />
          <stop offset="62%" stopColor="#d9e5ff" stopOpacity=".42" />
          <stop offset="76%" stopColor="#f3d4ff" stopOpacity=".34" />
          <stop offset="88%" stopColor="#ffe2ab" stopOpacity=".44" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity=".72" />
        </linearGradient>
        <linearGradient id="pearlEdge" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".9" />
          <stop offset="40%" stopColor="#d7d6df" stopOpacity=".65" />
          <stop offset="67%" stopColor="#efb6ff" stopOpacity=".62" />
          <stop offset="78%" stopColor="#b9d5ff" stopOpacity=".65" />
          <stop offset="91%" stopColor="#ffd89a" stopOpacity=".58" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity=".75" />
        </linearGradient>
      </defs>
      <path d="M54 71C89 28 134 44 175 59c46 17 82-14 123 4 44 20 47 66 17 92-25 22-48 17-69 44-22 29-60 34-95 21-37-14-55-43-82-61-35-23-47-57-15-88Z" fill="url(#pearlBody)" stroke="rgba(255,255,255,.92)" strokeWidth="3" />
      <path d="M101 82c34-29 62-5 93 4 34 10 72-12 91 10 18 21-4 43-30 50-30 8-39 36-72 41-31 4-43-22-63-36-29-20-47-43-19-69Z" fill="rgba(255,255,255,.15)" stroke="url(#pearlEdge)" strokeWidth="7" strokeLinecap="round" />
      <path d="M116 70c31-18 55 4 84 9 32 6 62-10 84 4" fill="none" stroke="rgba(255,255,255,.83)" strokeWidth="5" strokeLinecap="round" />
      <path d="M91 130c42 8 57 45 99 43 45-3 46-48 92-51" fill="none" stroke="url(#pearlEdge)" strokeWidth="7" strokeLinecap="round" opacity=".76" />
      <ellipse cx="121" cy="78" rx="33" ry="14" fill="rgba(255,255,255,.45)" transform="rotate(-18 121 78)" />
    </svg>
  );
}

export function TodayOpticalCenter({ tasks, events, routines, energy, mood, sleepHours }: Props) {
  const router = useRouter();
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [intent, setIntent] = useState('');

  useEffect(() => {
    if (hostRef.current && !hostRef.current.shadowRoot) setShadow(hostRef.current.attachShadow({ mode: 'open' }));
    else if (hostRef.current?.shadowRoot) setShadow(hostRef.current.shadowRoot);
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const rankedTasks = useMemo(() => [...tasks].sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority)), [tasks]);
  const topThree = rankedTasks.slice(0, 3);
  const activeTask = topThree[0] ?? null;

  const items = useMemo<TimelineItem[]>(() => {
    const eventItems = events.flatMap((event) => {
      const at = event.startAtISO ? new Date(event.startAtISO) : null;
      if (at && Number.isNaN(at.getTime())) return [];
      return [{
        id: `event-${event.id}`,
        title: event.title,
        at,
        kind: 'event' as const,
        meta: event.allDay ? 'All day' : event.location || 'Calendar',
        location: event.location,
        allDay: event.allDay,
      }];
    });
    const taskItems = tasks.flatMap((task) => {
      if (!task.dueDateISO) return [];
      const at = new Date(task.dueDateISO);
      if (Number.isNaN(at.getTime())) return [];
      return [{ id: `task-${task.id}`, title: task.title, at, kind: 'task' as const, meta: task.priority }];
    });
    return [...eventItems, ...taskItems].sort((a, b) => (a.at?.getTime() ?? Infinity) - (b.at?.getTime() ?? Infinity));
  }, [events, tasks]);

  const buckets = useMemo<Record<Bucket, TimelineItem[]>>(() => {
    const tomorrow = tomorrowFrom(now);
    const futureToday = items.filter((item) => item.at && sameDay(item.at, now) && (item.allDay || item.at >= now));
    const tonight = futureToday.filter((item) => item.at && !item.allDay && item.at.getHours() >= 17);
    const daytime = futureToday.filter((item) => !item.at || item.allDay || item.at.getHours() < 17);
    const next = daytime.slice(0, 2);
    const later = daytime.slice(2, 4);
    const tomorrowItems = items.filter((item) => item.at && sameDay(item.at, tomorrow)).slice(0, 2);
    return { NEXT: next, LATER: later, TONIGHT: tonight.slice(0, 2), TOMORROW: tomorrowItems };
  }, [items, now]);

  const nextFuture = items.find((item) => item.at && item.at >= now) ?? null;
  const nextEvent = items.find((item) => item.kind === 'event' && item.at && item.at >= now) ?? null;
  const nextTask = rankedTasks[1] ?? rankedTasks[0] ?? null;
  const energyText = energyLabel(energy);
  const capacityText = capacityLabel(energy);

  function openGlow(prefill?: string) {
    document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill } }));
  }
  function submitIntent() {
    const value = intent.trim();
    openGlow(value || undefined);
    setIntent('');
  }
  function selectContext(item: TimelineItem) {
    document.dispatchEvent(new CustomEvent('glow:context', { detail: { type: item.kind, label: item.title, id: item.id } }));
    openGlow(`Help me with ${item.title}`);
  }

  const body = (
    <div className="app">
      <style>{CSS}</style>
      <div className="frame">
        <header className="topbar">
          <div className="brand"><strong>Glow OS</strong><span className="batch">Batch 1</span></div>
          <div className="world">world 1: TODAY · THE LIVING CENTER</div>
          <button type="button" className="askTop" onClick={() => openGlow()} aria-label="Ask Glow">
            <span className="pearl pearlTop" aria-hidden="true" />
            <span>Ask Glow<br/>⌘ K</span>
          </button>
        </header>

        <nav className="rail" aria-label="Today tools">
          <button className="railButton active" type="button" onClick={() => router.push('/today')}><span className="railIcon"><Sparkles size={19}/></span><span>Today</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/tasks')}><span className="railIcon"><Focus size={18}/></span><span>Focus</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/connections')}><span className="railIcon"><Users size={18}/></span><span>People</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/world')}><span className="railIcon"><MapPin size={18}/></span><span>Places</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/resources')}><span className="railIcon"><LayoutGrid size={18}/></span><span>Resources</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/planning')}><span className="railIcon"><Route size={18}/></span><span>Journeys</span></button>
          <div className="railSpacer" />
          <button className="addButton" type="button" onClick={() => openGlow('Create ')} aria-label="Create with Glow"><Plus size={18}/></button>
        </nav>

        <main className="content">
          <section className="living">
            <div className="nowZone">
              <div className="time">{formatClock(now)}</div>
              <div className="nowTitle">NOW</div>
              <div className="flow">{activeTask ? activeTask.title : 'You’re in flow'}</div>
              <div className="flowNote">{activeTask ? `${activeTask.priority} priority · choose one clear next move.` : 'Keep the momentum.'}</div>
              <div className="statusPill"><span className="statusDot"/><span>{activeTask ? 'Protected focus available' : 'Open space'}</span></div>
            </div>

            <div className="liquidZone"><LiquidObject/><div className="liquidHint">Glow matter · live state</div></div>

            <div className="intel">
              <div>
                <div className="whatLabel">What now?</div>
                <div className="whatBox">
                  <input value={intent} onChange={(event) => setIntent(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitIntent(); }} placeholder="Share intent or ask anything…" aria-label="Ask Glow what now" />
                  <button className="submitIntent" type="button" onClick={submitIntent} aria-label="Send to Glow"><ArrowUp size={14}/></button>
                </div>
              </div>
              <div className="intelCards">
                <div className="mini"><div className="miniLabel">Capacity</div><div className="miniValue">{capacityText}</div><div className="capacityVisual"/></div>
                <div className="mini energyMini"><div><div className="miniLabel">Energy</div><div className="miniValue">{energyText}</div></div><span className="pearl pearlEnergy" aria-hidden="true"/></div>
                <div className="mini priorityMini"><div className="miniLabel">Top 3 priorities</div>{topThree.length ? topThree.map((task, index) => <div className="priorityRow" key={task.id}><span className="priorityIndex">{index + 1}</span><span className="priorityText">{task.title}</span><span className="priorityCircle"/></div>) : <div className="empty" style={{marginTop:10}}>No open priorities.</div>}</div>
              </div>
            </div>

            <div className="focusBand">
              <div className="focusCell"><div className="cellLabel">In focus</div><div className="cellTitle">{activeTask?.title ?? 'Open focus'}</div><div className="cellMeta">{activeTask ? <><div className="thinLine"><span/></div><span>{activeTask.priority}</span></> : 'No task is currently selected.'}</div></div>
              <div className="focusCell"><div className="cellLabel">Next up</div><div className="cellTitle">{nextTask?.title ?? nextFuture?.title ?? 'Open'}</div><div className="cellMeta">{nextFuture?.at ? <><Dumbbell size={15}/><span>{formatClock(nextFuture.at)} · {until(now, nextFuture.at)}</span></> : 'Nothing fixed next.'}</div></div>
              <div className="focusCell"><div className="cellLabel">Appointments</div><div className="cellTitle">{nextEvent?.title ?? 'No appointment'}</div><div className="cellMeta">{nextEvent?.at ? <><CalendarDays size={14}/><span>{formatClock(nextEvent.at)}{nextEvent.location ? ` · ${nextEvent.location}` : ''}</span><button className="joinButton" type="button" onClick={() => selectContext(nextEvent)}>Open</button></> : 'Your schedule is open.'}</div></div>
            </div>
          </section>

          <section className="stream" aria-label="Today timeline">
            {(['NEXT','LATER','TONIGHT','TOMORROW'] as Bucket[]).map((bucket, bucketIndex) => {
              const rowItems = buckets[bucket];
              const copy = bucketCopy(bucket);
              const first = rowItems[0];
              const second = rowItems[1];
              const countdownTarget = first?.at ?? (bucket === 'NEXT' ? nextFuture?.at ?? null : null);
              const countLabel = bucket === 'NEXT' ? 'Time to next' : bucket === 'LATER' ? 'Time to later' : bucket === 'TONIGHT' ? 'Leave-ready' : 'Preview time';
              const countValue = bucket === 'TONIGHT' && !first ? 'Not set' : bucket === 'TOMORROW' && first?.at ? until(now, first.at) : countdownTarget ? until(now, countdownTarget) : 'Open';
              return (
                <div className="timeRow" key={bucket}>
                  <div className="rowLead"><div className="rowTime">{bucketTime(bucket,rowItems)}</div><div className="rowName">{bucket}</div><div className="rowCopy">{copy[0]}<br/>{copy[1]}</div></div>
                  <div>{first ? <button type="button" className="eventSlot" onClick={() => selectContext(first)} style={{border:0,background:'transparent',textAlign:'left',width:'100%',cursor:'pointer'}}><span className="pearl eventPearl"/><span><span className="eventTitle">{first.title}</span><span className="eventMeta">{formatRange(first)}<span className="tag">{first.kind}</span></span></span></button> : <div className="empty">Nothing scheduled here.</div>}</div>
                  <div>{second ? <button type="button" className="eventSlot second" onClick={() => selectContext(second)} style={{border:0,background:'transparent',textAlign:'left',width:'100%',cursor:'pointer'}}><span className="pearl eventPearl"/><span><span className="eventTitle">{second.title}</span><span className="eventMeta">{formatRange(second)}<span className="tag">{second.kind}</span></span></span></button> : <div className="empty second">Open space.</div>}</div>
                  <div className="countBox"><div className="countLabel">{countLabel}</div><div className="countValue">{countValue}</div></div>
                  {bucketIndex < 3 ? <div className="streamArrow">↑</div> : null}
                </div>
              );
            })}
          </section>

          <footer className="bottomBar">
            <button className="dayView" type="button" onClick={() => router.push('/calendar')}><CalendarDays size={14}/><span>Day view</span><ChevronDown size={13}/></button>
            <button className="replan" type="button" onClick={() => openGlow('Replan my day using my real tasks, calendar, priorities, and current capacity. Show me the proposal before changing anything.')}><Sparkles size={14}/><span>Replan my day</span></button>
            <div className="saveTools"><span>Live data · changes save at source</span><button className="undo" type="button" disabled title="Undo appears only after a reversible action"><span>Undo</span><RotateCcw size={13}/></button><span className="pearl cornerPearl" aria-hidden="true"/></div>
          </footer>
        </main>
      </div>
    </div>
  );

  return <div ref={hostRef}>{shadow ? createPortal(body, shadow) : null}</div>;
}
