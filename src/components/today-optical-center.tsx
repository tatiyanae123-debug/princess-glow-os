'use client';

import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUp,
  CalendarDays,
  ChevronDown,
  Focus,
  LayoutGrid,
  MapPin,
  Plus,
  RotateCcw,
  Route,
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
  kind: 'event' | 'task';
  meta?: string;
  location?: string | null;
  allDay?: boolean;
};
type Bucket = 'NEXT' | 'LATER' | 'TONIGHT' | 'TOMORROW';

const CSS = String.raw`
:host{position:fixed;inset:0;z-index:2147480000;display:block;background:#f2eee9;color:#292725;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision}
*,*::before,*::after{box-sizing:border-box}
button,input{font:inherit;color:inherit}
button{appearance:none;-webkit-appearance:none}
button:focus-visible,input:focus-visible{outline:2px solid rgba(108,113,120,.35);outline-offset:2px}
.app{height:100dvh;overflow:hidden;background:radial-gradient(circle at 54% 11%,rgba(255,255,255,.98),transparent 30%),radial-gradient(circle at 10% 78%,rgba(225,217,209,.48),transparent 34%),radial-gradient(circle at 91% 75%,rgba(255,255,255,.52),transparent 29%),linear-gradient(125deg,#f8f5f1 0%,#eee8e2 51%,#f6f2ed 100%)}
.frame{height:100%;min-height:0;padding:clamp(10px,1.6dvh,18px) clamp(11px,1.45vw,21px);display:grid;grid-template-columns:clamp(68px,7vw,92px) minmax(0,1fr);grid-template-rows:clamp(44px,6.2dvh,58px) minmax(0,1fr);gap:clamp(7px,1dvh,11px)}
.topbar{grid-column:1/-1;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 11px;border:1px solid rgba(255,255,255,.73);border-radius:27px;background:linear-gradient(180deg,rgba(255,255,255,.47),rgba(255,255,255,.19));box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 8px 24px rgba(85,76,68,.035)}
.brand{display:flex;align-items:center;gap:16px;min-width:0}.brand strong{font-size:clamp(9px,.84vw,12px);font-weight:560;letter-spacing:-.01em}.batch{font-size:clamp(7px,.62vw,9px);color:#9b9690}.world{justify-self:center;font-size:clamp(7px,.64vw,9px);font-weight:560;letter-spacing:.15em;white-space:nowrap;color:#55514d}.askTop{justify-self:end;display:flex;align-items:center;gap:8px;border:0;background:transparent;cursor:pointer;min-height:40px;padding:2px 1px 2px 8px}.askTop span:last-child{font-size:clamp(7px,.66vw,9px);line-height:1.16;text-align:left;color:#5f5a55}
.pearl{position:relative;display:inline-block;border-radius:50%;background:radial-gradient(circle at 34% 27%,#fff 0 13%,rgba(255,255,255,.88) 19%,rgba(216,227,250,.46) 39%,rgba(237,208,247,.38) 57%,rgba(255,226,181,.34) 72%,rgba(255,255,255,.78) 85%,rgba(169,166,170,.16) 100%);box-shadow:inset -5px -7px 12px rgba(136,135,143,.14),inset 4px 4px 9px rgba(255,255,255,.97),0 6px 14px rgba(91,80,73,.10);border:1px solid rgba(255,255,255,.82)}
.pearl::after{content:"";position:absolute;inset:14% 19% 58% 25%;border-radius:50%;background:rgba(255,255,255,.92)}
.pearlTop{width:clamp(29px,2.6vw,36px);height:clamp(29px,2.6vw,36px)}
.rail{grid-row:2;min-height:0;display:flex;flex-direction:column;align-items:center;gap:clamp(6px,1.15dvh,11px);padding:2px 0 3px}
.railButton{width:clamp(56px,5.8vw,72px);min-height:clamp(54px,8.6dvh,70px);border:0;background:transparent;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;color:#77716b;font-size:clamp(7px,.66vw,9px)}
.railIcon{width:clamp(34px,3.5vw,44px);height:clamp(34px,3.5vw,44px);border:1px solid rgba(255,255,255,.77);border-radius:14px;display:grid;place-items:center;background:linear-gradient(180deg,rgba(255,255,255,.48),rgba(255,255,255,.17));box-shadow:inset 0 1px 0 rgba(255,255,255,.92),0 6px 16px rgba(80,70,63,.035)}
.railButton.active{color:#403c38}.railButton.active .railIcon{width:clamp(42px,4.25vw,54px);height:clamp(42px,4.25vw,54px);background:linear-gradient(180deg,rgba(255,255,255,.58),rgba(255,255,255,.20));box-shadow:inset 0 1px 0 #fff,0 7px 19px rgba(80,69,62,.055)}
.railTodayPearl{width:clamp(22px,2.25vw,29px);height:clamp(22px,2.25vw,29px)}
.railSpacer{flex:1}.addButton{width:clamp(35px,3.5vw,44px);height:clamp(35px,3.5vw,44px);border-radius:50%;border:1px solid rgba(255,255,255,.82);background:linear-gradient(180deg,rgba(255,255,255,.54),rgba(255,255,255,.20));display:grid;place-items:center;cursor:pointer;box-shadow:inset 0 1px 0 #fff,0 7px 19px rgba(80,69,62,.055)}
.content{grid-column:2;grid-row:2;min-width:0;min-height:0;display:grid;grid-template-rows:clamp(260px,38dvh,396px) minmax(0,1fr) clamp(38px,5.5dvh,54px);gap:clamp(6px,.8dvh,9px)}
.living{min-height:0;border:1px solid rgba(255,255,255,.79);border-radius:clamp(25px,2.25vw,33px);background:linear-gradient(135deg,rgba(255,255,255,.43),rgba(246,241,236,.21) 45%,rgba(255,255,255,.32));box-shadow:inset 0 1px 0 rgba(255,255,255,.97),inset 0 -1px 0 rgba(255,255,255,.25),0 11px 34px rgba(86,74,66,.038);padding:clamp(12px,1.55dvh,18px) clamp(14px,1.5vw,22px) clamp(9px,1.15dvh,13px);display:grid;grid-template-columns:minmax(0,.58fr) minmax(0,.98fr) minmax(0,1.48fr);grid-template-rows:minmax(0,1fr) clamp(76px,11dvh,105px);column-gap:clamp(9px,1.25vw,18px);position:relative;overflow:hidden}
.living::before{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 0 27%,rgba(255,255,255,.22) 30%,transparent 33% 68%,rgba(255,255,255,.15) 70%,transparent 73%);pointer-events:none;opacity:.45}
.nowZone{position:relative;z-index:1;padding:clamp(3px,.5dvh,6px) 0 0 clamp(2px,.35vw,5px)}.time{font-size:clamp(8px,.78vw,11px);color:#77716b}.nowTitle{margin-top:clamp(7px,1dvh,12px);font-size:clamp(25px,2.55vw,36px);line-height:.94;font-weight:390;letter-spacing:-.055em}.flow{margin-top:clamp(8px,1.15dvh,13px);font-size:clamp(10px,.92vw,13px);font-weight:440}.flowNote{margin-top:4px;font-size:clamp(7px,.7vw,10px);color:#827c76}.statusPill{margin-top:clamp(11px,2dvh,20px);display:inline-flex;align-items:center;gap:7px;padding:clamp(5px,.7dvh,7px) clamp(8px,.8vw,11px);border:1px solid rgba(255,255,255,.75);border-radius:999px;background:rgba(255,255,255,.25);font-size:clamp(7px,.66vw,9px);box-shadow:inset 0 1px 0 rgba(255,255,255,.82);cursor:pointer}.statusDot{width:6px;height:6px;border-radius:50%;background:#d9df9f;box-shadow:0 0 6px rgba(193,207,113,.55)}
.liquidZone{position:relative;z-index:1;display:grid;place-items:center;min-width:0;min-height:0}.liquidSvg{width:min(100%,315px);height:min(100%,208px);overflow:visible}.liquidShadow{filter:drop-shadow(0 12px 13px rgba(103,92,82,.09))}
.intel{position:relative;z-index:1;display:grid;grid-template-rows:auto minmax(0,1fr);gap:clamp(7px,1.05dvh,11px);padding-top:1px;min-height:0}.whatLabel{font-size:clamp(8px,.73vw,10px);font-weight:540}.whatBox{margin-top:6px;height:clamp(38px,5.6dvh,49px);border:1px solid rgba(255,255,255,.80);border-radius:14px;background:linear-gradient(180deg,rgba(255,255,255,.50),rgba(255,255,255,.22));display:grid;grid-template-columns:minmax(0,1fr) clamp(34px,3.2vw,42px);align-items:center;box-shadow:inset 0 1px 0 rgba(255,255,255,.91)}.whatBox input{height:100%;border:0;background:transparent;padding:0 14px;font-size:clamp(8px,.74vw,10px);outline:none;min-width:0}.whatBox input::placeholder{color:#a29b95}.submitIntent{width:clamp(27px,2.55vw,34px);height:clamp(27px,2.55vw,34px);border-radius:50%;border:1px solid rgba(203,198,193,.50);background:radial-gradient(circle at 39% 30%,rgba(255,255,255,.96),rgba(217,220,226,.46));display:grid;place-items:center;cursor:pointer}
.intelCards{display:grid;grid-template-columns:1fr .94fr 1.32fr;gap:clamp(5px,.6vw,9px);min-height:0}.mini{min-height:0;border:1px solid rgba(255,255,255,.67);border-radius:14px;background:linear-gradient(145deg,rgba(255,255,255,.34),rgba(255,255,255,.13));padding:clamp(8px,1dvh,12px);box-shadow:inset 0 1px 0 rgba(255,255,255,.77);overflow:hidden}.miniLabel{font-size:clamp(6.5px,.56vw,8px);color:#625d58}.miniValue{margin-top:clamp(4px,.65dvh,7px);font-size:clamp(8px,.7vw,10px);white-space:normal}.capacityVisual{margin-top:clamp(6px,.8dvh,9px);height:13px;position:relative}.capacityVisual::before{content:"";position:absolute;left:0;right:3px;top:7px;height:1px;background:linear-gradient(90deg,transparent,rgba(121,118,115,.34),transparent);transform:rotate(-6deg)}.capacityVisual::after{content:"";position:absolute;right:12%;top:0;width:36%;height:9px;border:1px solid rgba(140,137,135,.24);border-radius:55% 45% 50% 50%;transform:rotate(-6deg)}.energyMini{display:grid;grid-template-columns:minmax(0,1fr) clamp(35px,3.5vw,48px);align-items:center;gap:5px}.pearlEnergy{width:clamp(34px,3.45vw,47px);height:clamp(34px,3.45vw,47px)}.priorityMini{padding-right:clamp(7px,.75vw,10px)}.priorityRow{display:grid;grid-template-columns:11px minmax(0,1fr) 11px;gap:5px;align-items:center;margin-top:clamp(3px,.45dvh,5px);font-size:clamp(6.2px,.54vw,7.6px)}.priorityRow:first-of-type{margin-top:clamp(5px,.65dvh,7px)}.priorityIndex{color:#77716c}.priorityText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.priorityCircle{width:10px;height:10px;border:1px solid rgba(126,120,115,.24);border-radius:50%}
.focusBand{grid-column:1/-1;position:relative;z-index:1;margin-top:clamp(4px,.7dvh,7px);min-height:0;border:1px solid rgba(255,255,255,.69);border-radius:17px;background:linear-gradient(180deg,rgba(255,255,255,.27),rgba(255,255,255,.10));display:grid;grid-template-columns:1.35fr 1fr 1.1fr}.focusCell{padding:clamp(8px,1dvh,12px) clamp(12px,1.35vw,20px);min-width:0;display:flex;flex-direction:column;justify-content:center}.focusCell+.focusCell{border-left:1px solid rgba(170,162,154,.16)}.cellLabel{font-size:clamp(6.5px,.55vw,8px);color:#756f69}.cellTitle{margin-top:clamp(4px,.65dvh,7px);font-size:clamp(9px,.9vw,13px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cellMeta{margin-top:clamp(5px,.75dvh,8px);font-size:clamp(6.5px,.56vw,8px);color:#817a74;display:flex;align-items:center;gap:7px;min-height:14px;white-space:nowrap}.thinLine{height:4px;border-radius:999px;background:rgba(255,255,255,.35);border:1px solid rgba(255,255,255,.63);overflow:hidden;width:min(190px,72%)}.thinLine span{display:block;width:72%;height:100%;background:linear-gradient(90deg,rgba(205,203,198,.32),rgba(255,255,255,.95),rgba(239,209,147,.60))}.joinButton{border:1px solid rgba(255,255,255,.76);border-radius:999px;background:rgba(255,255,255,.27);padding:3px 10px;font-size:clamp(6px,.52vw,7.5px);cursor:pointer}
.stream{min-height:0;display:grid;grid-template-rows:repeat(4,minmax(0,1fr));gap:clamp(4px,.55dvh,6px)}.timeRow{min-height:0;border:1px solid rgba(255,255,255,.73);border-radius:clamp(15px,1.45vw,21px);background:linear-gradient(90deg,rgba(255,255,255,.31),rgba(247,242,237,.19),rgba(255,255,255,.27));box-shadow:inset 0 1px 0 rgba(255,255,255,.87),0 6px 18px rgba(83,71,64,.025);display:grid;grid-template-columns:minmax(115px,1.02fr) minmax(0,1.65fr) minmax(0,1.65fr) minmax(92px,.82fr);align-items:center;gap:clamp(5px,.65vw,9px);padding:clamp(5px,.7dvh,8px) clamp(10px,1.2vw,17px) clamp(5px,.7dvh,8px) clamp(15px,1.55vw,23px);position:relative}.timeRow::before{content:"";position:absolute;left:-7px;top:50%;width:9px;height:1px;background:rgba(126,120,115,.25)}.rowLead{min-width:0}.rowTime{font-size:clamp(6px,.52vw,7.5px);color:#706a64}.rowName{margin-top:2px;font-size:clamp(14px,1.4vw,20px);line-height:.96;letter-spacing:-.04em;font-weight:390}.rowCopy{margin-top:3px;font-size:clamp(6.3px,.55vw,7.8px);color:#88817b;line-height:1.24}.eventSlot{display:grid;grid-template-columns:clamp(31px,3.25vw,43px) minmax(0,1fr);gap:clamp(7px,.8vw,11px);align-items:center;min-width:0}.eventPearl{width:clamp(30px,3.15vw,42px);height:clamp(30px,3.15vw,42px);justify-self:center}.toneViolet{background:radial-gradient(circle at 34% 27%,#fff 0 12%,rgba(255,255,255,.84) 20%,rgba(176,201,255,.47) 43%,rgba(177,143,246,.50) 63%,rgba(239,214,255,.58) 79%,rgba(255,255,255,.75) 92%)}.tonePeach{background:radial-gradient(circle at 34% 27%,#fff 0 12%,rgba(255,255,255,.86) 20%,rgba(255,217,178,.58) 45%,rgba(255,170,133,.48) 65%,rgba(255,229,205,.64) 82%,rgba(255,255,255,.74) 94%)}.toneCool{background:radial-gradient(circle at 34% 27%,#fff 0 12%,rgba(255,255,255,.88) 20%,rgba(214,231,255,.54) 46%,rgba(211,204,238,.34) 68%,rgba(255,255,255,.76) 91%)}.eventTitle{font-size:clamp(7.5px,.71vw,10px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eventMeta{margin-top:clamp(3px,.38dvh,4px);font-size:clamp(5.8px,.5vw,7px);color:#837c76;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tag{display:inline-block;margin-left:6px;padding:2px 6px;border:1px solid rgba(142,136,130,.15);border-radius:4px;font-size:clamp(5px,.44vw,6.2px);color:#918a83}.countBox{justify-self:end;width:min(100%,112px);min-height:clamp(42px,6dvh,54px);border:1px solid rgba(255,255,255,.69);border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,.14));padding:clamp(7px,.85dvh,10px) clamp(8px,.8vw,11px);display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;column-gap:5px}.countLabel{font-size:clamp(5.6px,.48vw,6.8px);color:#6f6963}.countValue{margin-top:4px;font-size:clamp(8px,.73vw,10.5px);grid-column:1}.countPearl{grid-column:2;grid-row:1/3;width:clamp(25px,2.45vw,33px);height:clamp(25px,2.45vw,33px)}.empty{font-size:clamp(6.8px,.6vw,8.5px);color:#9a938c;font-style:italic}.streamArrow{position:absolute;left:50%;bottom:calc(-1 * clamp(9px,1.25dvh,13px));transform:translateX(-50%);font-size:clamp(12px,1.25vw,17px);color:rgba(129,123,117,.24);z-index:2}
.bottomBar{min-height:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 clamp(4px,.5vw,7px)}.dayTools{justify-self:start;display:flex;align-items:center;gap:8px}.dayView{display:flex;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.76);border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.43),rgba(255,255,255,.18));padding:clamp(6px,.75dvh,8px) clamp(10px,1vw,14px);font-size:clamp(6.5px,.58vw,8px);cursor:pointer}.miniPearlButton{width:clamp(28px,2.8vw,36px);height:clamp(28px,2.8vw,36px);border:1px solid rgba(255,255,255,.78);border-radius:50%;background:rgba(255,255,255,.25);display:grid;place-items:center;cursor:pointer}.replan{justify-self:center;min-width:clamp(178px,20vw,240px);display:flex;align-items:center;justify-content:center;gap:8px;border:1px solid rgba(255,255,255,.82);border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.52),rgba(255,255,255,.21));padding:clamp(7px,.8dvh,9px) 18px;font-size:clamp(7px,.62vw,9px);cursor:pointer;box-shadow:inset 0 1px 0 #fff,0 6px 18px rgba(79,68,61,.035)}.saveTools{justify-self:end;display:flex;align-items:center;gap:clamp(8px,.85vw,12px);font-size:clamp(5.8px,.5vw,7px);color:#928b85}.undo{display:flex;align-items:center;gap:5px;border:1px solid rgba(255,255,255,.70);border-radius:999px;background:rgba(255,255,255,.20);padding:clamp(6px,.7dvh,8px) 10px;font-size:clamp(6px,.52vw,7.5px);color:#817a74}.undo:disabled{opacity:.52}.cornerPearl{width:clamp(31px,3.15vw,42px);height:clamp(31px,3.15vw,42px);margin-left:2px}
@media(max-width:980px) and (min-width:721px){.frame{grid-template-columns:64px minmax(0,1fr);padding-left:9px;padding-right:9px}.railButton{width:54px}.railIcon{width:34px;height:34px}.railButton.active .railIcon{width:42px;height:42px}.living{grid-template-columns:minmax(0,.55fr) minmax(0,.92fr) minmax(0,1.55fr);column-gap:8px;padding-left:11px;padding-right:11px}.intelCards{gap:4px}.mini{padding:7px}.focusCell{padding-left:9px;padding-right:9px}.timeRow{grid-template-columns:minmax(104px,.9fr) minmax(0,1.5fr) minmax(0,1.5fr) minmax(82px,.72fr);padding-left:12px;padding-right:8px}.countBox{width:88px}.bottomBar{padding:0}.replan{min-width:170px}}
@media(max-height:690px) and (min-width:721px){.content{grid-template-rows:clamp(238px,37dvh,265px) minmax(0,1fr) 36px}.living{grid-template-rows:minmax(0,1fr) 68px;padding-top:9px;padding-bottom:7px}.statusPill{margin-top:8px}.flow{margin-top:6px}.focusCell{padding-top:5px;padding-bottom:5px}.stream{gap:3px}.timeRow{padding-top:3px;padding-bottom:3px}.bottomBar{min-height:34px}}
@media(max-width:720px){:host{position:fixed}.app{overflow:auto}.frame{display:block;padding:10px 9px 82px}.topbar{position:sticky;top:6px;z-index:30;grid-template-columns:1fr auto;height:52px}.world{display:none}.batch{display:inline}.askTop{grid-column:2}.rail{position:fixed;left:9px;right:9px;bottom:7px;z-index:40;height:62px;padding:5px 7px;border:1px solid rgba(255,255,255,.82);border-radius:22px;background:rgba(247,242,237,.95);display:grid;grid-template-columns:repeat(6,1fr) 44px;gap:2px;box-shadow:0 10px 30px rgba(72,62,56,.13)}.railButton{width:auto;min-height:50px;font-size:0;gap:0}.railIcon,.railButton.active .railIcon{width:40px;height:40px}.railSpacer{display:none}.addButton{width:40px;height:40px;align-self:center;justify-self:center}.content{margin-top:9px;display:flex;flex-direction:column;gap:8px}.living{display:grid;grid-template-columns:1fr;grid-template-rows:auto 190px auto auto;padding:17px 15px;min-height:0;border-radius:26px}.nowZone{padding:0}.liquidZone{min-height:180px}.liquidSvg{width:min(290px,82vw);height:auto}.intel{margin-top:8px}.intelCards{grid-template-columns:1fr 1fr}.priorityMini{grid-column:1/-1}.focusBand{margin-top:14px;grid-template-columns:1fr}.focusCell+.focusCell{border-left:0;border-top:1px solid rgba(170,162,154,.16)}.timeRow{grid-template-columns:1fr;padding:15px;gap:12px;min-height:0}.timeRow::before,.streamArrow{display:none}.rowName{font-size:24px}.eventSlot{grid-template-columns:46px minmax(0,1fr)}.eventPearl{width:42px;height:42px}.countBox{justify-self:stretch;width:100%;min-height:48px}.bottomBar{display:grid;grid-template-columns:1fr;gap:8px;padding:4px}.dayTools,.replan,.saveTools{justify-self:stretch}.dayTools{justify-content:space-between}.replan{min-width:0}.saveTools{justify-content:center}.cornerPearl{display:none}}
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
  if (item.allDay) return 'All day';
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
function energyLabel(energy: number | null, mood: number | null, sleepHours: number | null) {
  if (energy === null) {
    if (sleepHours !== null && sleepHours < 6) return 'Low sleep · check in';
    if (mood !== null) return 'Check in to confirm';
    return 'Not checked in';
  }
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
  const firstTimed = items.find((item) => item.at && !item.allDay)?.at;
  if (firstTimed) return formatClock(firstTimed);
  if (bucket === 'TOMORROW') return 'Tomorrow';
  return 'Open';
}
function startOfHour(date: Date, hour: number) {
  const value = new Date(date);
  value.setHours(hour, 0, 0, 0);
  return value;
}
function pearlTone(bucket: Bucket, index: number) {
  if (bucket === 'LATER' && index === 0) return 'toneViolet';
  if (bucket === 'TONIGHT' && index === 0) return 'tonePeach';
  if (bucket === 'TONIGHT' && index === 1) return 'toneViolet';
  if (bucket === 'TOMORROW') return 'toneCool';
  return 'toneCool';
}

function LiquidObject() {
  return (
    <svg className="liquidSvg liquidShadow" viewBox="0 0 390 255" aria-label="Glow living matter">
      <defs>
        <linearGradient id="glassBody" x1=".05" y1=".08" x2=".94" y2=".92">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".98" />
          <stop offset="20%" stopColor="#e9e2db" stopOpacity=".43" />
          <stop offset="39%" stopColor="#ffffff" stopOpacity=".88" />
          <stop offset="58%" stopColor="#dce8ff" stopOpacity=".39" />
          <stop offset="69%" stopColor="#ead8ff" stopOpacity=".38" />
          <stop offset="78%" stopColor="#ffcfdc" stopOpacity=".27" />
          <stop offset="88%" stopColor="#ffe6af" stopOpacity=".35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity=".78" />
        </linearGradient>
        <linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".75" />
          <stop offset="25%" stopColor="#d7e6ff" stopOpacity=".56" />
          <stop offset="47%" stopColor="#d7c6ff" stopOpacity=".69" />
          <stop offset="62%" stopColor="#f1b8ef" stopOpacity=".58" />
          <stop offset="78%" stopColor="#ffd4bb" stopOpacity=".55" />
          <stop offset="92%" stopColor="#fff0bd" stopOpacity=".49" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity=".76" />
        </linearGradient>
        <radialGradient id="innerGlow" cx="42%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity=".93" />
          <stop offset="46%" stopColor="#ffffff" stopOpacity=".18" />
          <stop offset="100%" stopColor="#d8dce8" stopOpacity=".06" />
        </radialGradient>
        <filter id="softGlow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <ellipse cx="192" cy="213" rx="122" ry="18" fill="rgba(117,99,86,.10)" filter="url(#softGlow)" />
      <path d="M45 75C75 29 130 31 178 49c48 18 92-20 140 3 43 20 49 69 18 101-25 25-59 25-78 52-23 33-66 41-105 26-40-15-59-48-91-68C27 141 17 112 45 75Z" fill="url(#glassBody)" stroke="rgba(255,255,255,.95)" strokeWidth="4" />
      <path d="M84 88c37-34 74-10 108-1 40 11 82-18 112 5 27 21 3 53-28 62-37 11-51 46-89 51-37 5-55-27-80-44-34-24-53-49-23-73Z" fill="url(#innerGlow)" stroke="url(#spectrum)" strokeWidth="9" strokeLinecap="round" opacity=".88" />
      <path d="M111 70c33-22 61 0 94 7 39 8 71-13 102 0" fill="none" stroke="rgba(255,255,255,.88)" strokeWidth="7" strokeLinecap="round" />
      <path d="M76 132c52 7 71 53 123 47 48-6 57-55 105-59" fill="none" stroke="url(#spectrum)" strokeWidth="10" strokeLinecap="round" opacity=".77" />
      <path d="M150 177c33 12 67-3 83-28 18-29 30-50 63-57" fill="none" stroke="rgba(255,255,255,.62)" strokeWidth="5" strokeLinecap="round" />
      <ellipse cx="123" cy="76" rx="38" ry="15" fill="rgba(255,255,255,.55)" transform="rotate(-18 123 76)" />
      <ellipse cx="270" cy="109" rx="28" ry="11" fill="rgba(255,255,255,.28)" transform="rotate(-21 270 109)" />
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
  const nextTask = rankedTasks[1] ?? rankedTasks[0] ?? null;
  const nextTaskAt = nextTask?.dueDateISO ? new Date(nextTask.dueDateISO) : null;
  const validNextTaskAt = nextTaskAt && !Number.isNaN(nextTaskAt.getTime()) ? nextTaskAt : null;

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
    const nextCutoff = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const eveningStart = startOfHour(now, 17);
    const todayFuture = items.filter((item) => item.at && sameDay(item.at, now) && (item.allDay || item.at >= now));
    const timed = todayFuture.filter((item) => item.at && !item.allDay);
    const allDay = todayFuture.filter((item) => item.allDay);
    const next = [...timed.filter((item) => item.at && item.at < nextCutoff), ...allDay].slice(0, 2);
    const nextIds = new Set(next.map((item) => item.id));
    const later = timed.filter((item) => item.at && item.at >= nextCutoff && item.at < eveningStart && !nextIds.has(item.id)).slice(0, 2);
    const used = new Set([...next, ...later].map((item) => item.id));
    const tonight = timed.filter((item) => item.at && item.at >= eveningStart && !used.has(item.id)).slice(0, 2);
    const tomorrowItems = items.filter((item) => item.at && sameDay(item.at, tomorrow)).slice(0, 2);
    return { NEXT: next, LATER: later, TONIGHT: tonight, TOMORROW: tomorrowItems };
  }, [items, now]);

  const nextEvent = items.find((item) => item.kind === 'event' && item.at && item.at >= now && !item.allDay) ?? null;
  const energyText = energyLabel(energy, mood, sleepHours);
  const capacityText = capacityLabel(energy);
  const routineContext = routines.length ? `${routines.length} routine${routines.length === 1 ? '' : 's'} available today` : 'No routines due now';

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
          <button className="railButton active" type="button" onClick={() => router.push('/today')}><span className="railIcon"><span className="pearl railTodayPearl" aria-hidden="true"/></span><span>Today</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/tasks')}><span className="railIcon"><Focus size={15}/></span><span>Focus</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/connections')}><span className="railIcon"><Users size={15}/></span><span>People</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/world')}><span className="railIcon"><MapPin size={15}/></span><span>Places</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/resources')}><span className="railIcon"><LayoutGrid size={15}/></span><span>Resources</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/planning')}><span className="railIcon"><Route size={15}/></span><span>Journeys</span></button>
          <div className="railSpacer" />
          <button className="addButton" type="button" onClick={() => openGlow('Create ')} aria-label="Create with Glow"><Plus size={15}/></button>
        </nav>

        <main className="content">
          <section className="living">
            <div className="nowZone">
              <div className="time">{formatClock(now)}</div>
              <div className="nowTitle">NOW</div>
              <div className="flow">You’re in flow</div>
              <div className="flowNote">Keep the momentum.</div>
              <button className="statusPill" type="button" onClick={() => openGlow('Protect 90 minutes for my current focus. Show me the proposal before changing my schedule.')}><span className="statusDot"/><span>Protected 90 min</span></button>
            </div>

            <div className="liquidZone"><LiquidObject/></div>

            <div className="intel">
              <div>
                <div className="whatLabel">What now?</div>
                <div className="whatBox">
                  <input value={intent} onChange={(event) => setIntent(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitIntent(); }} placeholder="Share intent or ask anything…" aria-label="Ask Glow what now" />
                  <button className="submitIntent" type="button" onClick={submitIntent} aria-label="Send to Glow"><ArrowUp size={12}/></button>
                </div>
              </div>
              <div className="intelCards">
                <div className="mini"><div className="miniLabel">Capacity</div><div className="miniValue">{capacityText}</div><div className="capacityVisual"/></div>
                <div className="mini energyMini"><div><div className="miniLabel">Energy</div><div className="miniValue">{energyText}</div></div><span className="pearl pearlEnergy" aria-hidden="true"/></div>
                <div className="mini priorityMini"><div className="miniLabel">Top 3 priorities</div>{topThree.length ? topThree.map((task, index) => <div className="priorityRow" key={task.id}><span className="priorityIndex">{index + 1}</span><span className="priorityText">{task.title}</span><span className="priorityCircle"/></div>) : <div className="empty" style={{marginTop:7}}>No open priorities.</div>}</div>
              </div>
            </div>

            <div className="focusBand">
              <div className="focusCell"><div className="cellLabel">In focus</div><div className="cellTitle">{activeTask?.title ?? 'Open focus'}</div><div className="cellMeta">{activeTask ? <><div className="thinLine"><span/></div><span>{activeTask.priority}</span></> : 'No task is currently selected.'}</div></div>
              <div className="focusCell"><div className="cellLabel">Next up</div><div className="cellTitle">{nextTask?.title ?? 'Open'}</div><div className="cellMeta">{nextTask ? <><Focus size={12}/><span>{validNextTaskAt ? `${formatClock(validNextTaskAt)} · ${until(now, validNextTaskAt)}` : 'Flexible'}</span></> : routineContext}</div></div>
              <div className="focusCell"><div className="cellLabel">Appointments</div><div className="cellTitle">{nextEvent?.title ?? 'No appointment'}</div><div className="cellMeta">{nextEvent?.at ? <><CalendarDays size={12}/><span>{formatClock(nextEvent.at)}{nextEvent.location ? ` · ${nextEvent.location}` : ''}</span><button className="joinButton" type="button" onClick={() => selectContext(nextEvent)}>{nextEvent.location ? 'Join' : 'Open'}</button></> : 'Your schedule is open.'}</div></div>
            </div>
          </section>

          <section className="stream" aria-label="Today timeline">
            {(['NEXT','LATER','TONIGHT','TOMORROW'] as Bucket[]).map((bucket, bucketIndex) => {
              const rowItems = buckets[bucket];
              const copy = bucketCopy(bucket);
              const first = rowItems[0];
              const second = rowItems[1];
              const countdownTarget = first?.at ?? null;
              const countLabel = bucket === 'NEXT' ? 'Time to next' : bucket === 'LATER' ? 'Time to later' : bucket === 'TONIGHT' ? 'Leave-ready' : 'Preview time';
              let countValue = countdownTarget ? until(now, countdownTarget) : 'Open';
              if (bucket === 'TONIGHT' && countdownTarget) {
                const leaveReady = new Date(countdownTarget.getTime() - 30 * 60 * 1000);
                countValue = until(now, leaveReady);
              }
              if (bucket === 'TONIGHT' && !countdownTarget) countValue = 'Not set';
              const countTone = bucket === 'TONIGHT' ? 'tonePeach' : bucket === 'TOMORROW' ? 'toneCool' : '';
              return (
                <div className="timeRow" key={bucket}>
                  <div className="rowLead"><div className="rowTime">{bucketTime(bucket,rowItems)}</div><div className="rowName">{bucket}</div><div className="rowCopy">{copy[0]}<br/>{copy[1]}</div></div>
                  <div>{first ? <button type="button" className="eventSlot" onClick={() => selectContext(first)} style={{border:0,background:'transparent',textAlign:'left',width:'100%',cursor:'pointer'}}><span className={`pearl eventPearl ${pearlTone(bucket,0)}`}/><span><span className="eventTitle">{first.title}</span><span className="eventMeta">{formatRange(first)}<span className="tag">{first.kind}</span></span></span></button> : <div className="empty">Open space.</div>}</div>
                  <div>{second ? <button type="button" className="eventSlot" onClick={() => selectContext(second)} style={{border:0,background:'transparent',textAlign:'left',width:'100%',cursor:'pointer'}}><span className={`pearl eventPearl ${pearlTone(bucket,1)}`}/><span><span className="eventTitle">{second.title}</span><span className="eventMeta">{formatRange(second)}<span className="tag">{second.kind}</span></span></span></button> : <div className="empty">Open space.</div>}</div>
                  <div className="countBox"><div><div className="countLabel">{countLabel}</div><div className="countValue">{countValue}</div></div>{countTone ? <span className={`pearl countPearl ${countTone}`} aria-hidden="true"/> : null}</div>
                  {bucketIndex < 3 ? <div className="streamArrow">↑</div> : null}
                </div>
              );
            })}
          </section>

          <footer className="bottomBar">
            <div className="dayTools"><button className="dayView" type="button" onClick={() => router.push('/calendar')}><CalendarDays size={12}/><span>Day view</span><ChevronDown size={11}/></button><button className="miniPearlButton" type="button" onClick={() => openGlow('Show me what matters most in the rest of today.')} aria-label="Ask Glow about today"><Sparkles size={11}/></button></div>
            <button className="replan" type="button" onClick={() => openGlow('Replan my day using my real tasks, calendar, priorities, and current capacity. Show me the proposal before changing anything.')}><Sparkles size={12}/><span>Replan my day</span></button>
            <div className="saveTools"><span>All changes saved</span><button className="undo" type="button" disabled title="Undo appears only after a reversible action"><span>Undo</span><RotateCcw size={11}/></button><span className="pearl cornerPearl" aria-hidden="true"/></div>
          </footer>
        </main>
      </div>
    </div>
  );

  return <div ref={hostRef}>{shadow ? createPortal(body, shadow) : null}</div>;
}
