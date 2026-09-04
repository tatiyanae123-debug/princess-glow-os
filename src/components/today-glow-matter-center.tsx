'use client';

import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUp,
  CalendarDays,
  ChevronDown,
  Dumbbell,
  Ellipsis,
  Focus,
  LayoutGrid,
  MapPin,
  Plus,
  Route,
  ShowerHead,
  Sparkles,
  Undo2,
  Users,
} from 'lucide-react';

type TaskLite = { id: string; title: string; priority: string; status: string; dueDateISO?: string | null };
type EventLite = {
  id: string;
  title: string;
  location?: string | null;
  startAtISO?: string | null;
  endAtISO?: string | null;
  allDay?: boolean;
  htmlLink?: string | null;
};
type RoutineLite = { id: string; name: string; timeOfDay: string };
type FocusLite = {
  id: string;
  title: string;
  startedAtISO: string;
  plannedMinutes: number;
  entityId?: string | null;
  entityType?: string | null;
};
type Props = {
  tasks: TaskLite[];
  events: EventLite[];
  routines: RoutineLite[];
  activeFocus: FocusLite | null;
  energy: number | null;
  mood: number | null;
  sleepHours: number | null;
};
type TimelineItem = {
  id: string;
  title: string;
  at: Date | null;
  endAt: Date | null;
  kind: 'event' | 'task';
  meta?: string;
  location?: string | null;
  htmlLink?: string | null;
  allDay?: boolean;
};
type Bucket = 'NEXT' | 'LATER' | 'TONIGHT' | 'TOMORROW';

const CSS = String.raw`
:host{position:fixed;inset:0;z-index:2147480000;display:block;color:#2e2b29;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;background:#eae5df}
*,*::before,*::after{box-sizing:border-box}
button,input{font:inherit;color:inherit}
button{appearance:none;-webkit-appearance:none;touch-action:manipulation}
button:focus-visible,input:focus-visible{outline:2px solid rgba(98,101,109,.38);outline-offset:3px}

.world{height:100dvh;overflow:auto;position:relative;isolation:isolate;display:grid;place-items:start center;padding:12px;background:radial-gradient(70% 54% at 52% -4%,rgba(255,255,255,.99),transparent 67%),radial-gradient(42% 38% at 10% 68%,rgba(218,207,197,.66),transparent 73%),radial-gradient(34% 38% at 91% 73%,rgba(255,255,255,.72),transparent 73%),linear-gradient(128deg,#f8f5f0 0%,#ede7e1 48%,#f8f4ef 100%)}
.world::before{content:"";position:absolute;inset:-8%;z-index:-3;background:radial-gradient(25% 19% at 56% 15%,rgba(192,219,255,.24),transparent 69%),radial-gradient(18% 17% at 66% 21%,rgba(211,181,247,.22),transparent 72%),radial-gradient(19% 15% at 75% 27%,rgba(255,193,169,.18),transparent 72%),radial-gradient(16% 15% at 37% 77%,rgba(190,231,216,.13),transparent 72%);filter:blur(22px);opacity:.96}
.world::after{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background:linear-gradient(103deg,transparent 0 15%,rgba(255,255,255,.27) 17%,transparent 20% 66%,rgba(255,255,255,.18) 69%,transparent 72%),radial-gradient(56% 2.4% at 50% 91%,rgba(94,78,65,.10),transparent 72%);mix-blend-mode:screen}

.shell{position:relative;width:min(1416px,calc(100vw - 24px));height:min(calc(100dvh - 24px),calc((100vw - 24px)*.742));min-height:min(760px,calc(100dvh - 24px));overflow:hidden;padding:13px 14px 14px;border-radius:34px 38px 36px 33px / 31px 35px 39px 36px;background:linear-gradient(138deg,rgba(255,255,255,.22),rgba(255,255,255,.055) 41%,rgba(245,239,234,.10) 68%,rgba(255,255,255,.16));box-shadow:inset 1px 1px 0 rgba(255,255,255,.98),inset -1px -1px 0 rgba(125,113,103,.10),inset 0 0 0 3px rgba(255,255,255,.10),inset 0 26px 60px rgba(255,255,255,.07),0 28px 60px rgba(78,66,57,.08),0 3px 9px rgba(78,66,57,.05);perspective:1800px}
.shell::before{content:"";position:absolute;inset:1px;z-index:0;border-radius:inherit;padding:2px;background:linear-gradient(118deg,rgba(255,255,255,.96),rgba(221,235,255,.43) 20%,rgba(255,255,255,.44) 38%,rgba(220,197,246,.28) 54%,rgba(255,205,181,.24) 69%,rgba(255,241,192,.20) 79%,rgba(255,255,255,.83));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.88;pointer-events:none}
.shell::after{content:"";position:absolute;inset:7px;z-index:0;border-radius:28px 32px 31px 28px / 27px 30px 34px 31px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.32),inset 7px 0 16px rgba(255,255,255,.05),inset -7px 0 18px rgba(199,218,246,.035);pointer-events:none}
.shellCaustic{position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(14% 8% at 28% 9%,rgba(255,255,255,.39),transparent 70%),radial-gradient(18% 9% at 69% 28%,rgba(203,224,255,.11),rgba(220,190,247,.09) 45%,rgba(255,205,180,.06) 62%,transparent 74%),radial-gradient(22% 4% at 55% 92%,rgba(255,255,255,.23),transparent 70%);filter:blur(1.4px);mix-blend-mode:screen}

.layout{position:relative;z-index:2;height:100%;min-height:0;display:grid;grid-template-columns:clamp(78px,7.4vw,96px) minmax(0,1fr);grid-template-rows:clamp(45px,5.4dvh,54px) minmax(0,1fr);gap:clamp(7px,.8dvh,10px)}

.header{grid-column:1/-1;position:relative;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 10px;min-height:0;background:linear-gradient(180deg,rgba(255,255,255,.085),rgba(255,255,255,.015));box-shadow:inset 0 1px 0 rgba(255,255,255,.71),inset 0 -1px 0 rgba(137,126,117,.07)}
.header::before{content:"";position:absolute;left:2%;right:2%;top:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.93),rgba(210,228,255,.28),rgba(255,255,255,.84),transparent)}
.header::after{content:"";position:absolute;left:4%;right:4%;bottom:0;height:1px;background:linear-gradient(90deg,transparent,rgba(146,136,127,.08),rgba(255,255,255,.49),rgba(146,136,127,.07),transparent)}
.brand{display:flex;align-items:baseline;gap:17px;min-width:0}.brand strong{font-size:clamp(10px,.86vw,13px);font-weight:570;letter-spacing:-.012em}.batch{font-size:clamp(6.4px,.58vw,8.3px);color:#9d958e}.worldName{justify-self:center;font-size:clamp(6.3px,.58vw,8.4px);font-weight:500;letter-spacing:.12em;color:#5f5a55;white-space:nowrap;text-transform:none}.askTop{justify-self:end;display:flex;align-items:center;gap:9px;border:0;background:transparent;padding:2px 1px 2px 8px;min-height:40px;cursor:pointer}.askTopLabel{font-size:clamp(6.3px,.56vw,8px);line-height:1.15;text-align:left;color:#625d58}

.rail{grid-row:2;position:relative;min-height:0;padding:7px 5px 9px;display:flex;flex-direction:column;align-items:center;gap:clamp(7px,1.1dvh,12px);border-radius:24px 30px 28px 22px / 26px 24px 31px 27px;background:linear-gradient(103deg,rgba(255,255,255,.14),rgba(255,255,255,.025) 49%,rgba(235,229,223,.08));box-shadow:inset 1px 0 0 rgba(255,255,255,.79),inset -1px 0 0 rgba(122,112,103,.08),0 16px 28px rgba(73,62,54,.035);transform:translateZ(25px)}
.rail::before{content:"";position:absolute;inset:7px 5px;border-radius:20px 25px 24px 18px / 22px 20px 27px 23px;background:linear-gradient(90deg,rgba(255,255,255,.22),rgba(255,255,255,.018) 57%,rgba(205,226,255,.07));box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);pointer-events:none}
.rail::after{content:"";position:absolute;top:4%;bottom:5%;right:2px;width:2px;border-radius:99px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.88) 14%,rgba(205,225,255,.31) 33%,rgba(214,187,246,.26) 51%,rgba(255,205,184,.22) 70%,rgba(255,255,255,.58) 88%,transparent)}
.railButton{position:relative;z-index:1;width:100%;min-height:clamp(51px,7.7dvh,66px);border:0;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;color:#8a837d;font-size:clamp(6.3px,.56vw,8px);cursor:pointer}.railButton span:last-child{transition:color 180ms ease}.railMount{width:clamp(29px,2.85vw,38px);height:clamp(29px,2.85vw,38px);display:grid;place-items:center;position:relative;border-radius:46% 54% 58% 42% / 51% 44% 56% 49%;background:linear-gradient(145deg,rgba(255,255,255,.14),rgba(255,255,255,.025));box-shadow:inset 1px 1px 0 rgba(255,255,255,.63),inset -1px -1px 0 rgba(117,108,101,.07);transition:transform 200ms cubic-bezier(.2,.7,.2,1),opacity 200ms ease,filter 200ms ease}.railMount svg{stroke-width:1.05;color:#847d77;opacity:.82}.railButton:not(.active) .railMount{opacity:.70;filter:saturate(.75)}.railButton:hover .railMount{opacity:1;transform:translateY(-1px) translateZ(4px);filter:saturate(1)}.railButton.active{color:#44403c}.railButton.active .railMount{width:clamp(39px,3.7vw,48px);height:clamp(39px,3.7vw,48px);background:transparent;box-shadow:none;opacity:1}.railSpacer{flex:1}.addPearl{position:relative;z-index:1;width:clamp(40px,3.7vw,49px);height:clamp(40px,3.7vw,49px);border:0;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:radial-gradient(circle at 29% 22%,#fff 0 10%,rgba(255,255,255,.90) 17%,rgba(207,228,255,.46) 39%,rgba(212,188,246,.34) 58%,rgba(255,210,184,.29) 73%,rgba(255,248,208,.22) 81%,rgba(255,255,255,.62) 91%,rgba(145,139,143,.12));box-shadow:inset -8px -10px 15px rgba(111,112,124,.13),inset 5px 5px 12px rgba(255,255,255,.97),0 8px 14px rgba(74,62,54,.12)}

.pearl{position:relative;display:inline-block;border-radius:50%;background:radial-gradient(circle at 29% 22%,#fff 0 10%,rgba(255,255,255,.88) 17%,rgba(211,229,255,.42) 38%,rgba(220,200,246,.31) 57%,rgba(255,214,190,.26) 72%,rgba(255,245,202,.19) 80%,rgba(255,255,255,.64) 91%,rgba(137,134,141,.13));box-shadow:inset -8px -10px 15px rgba(112,114,129,.14),inset 5px 5px 12px rgba(255,255,255,.97),0 8px 15px rgba(75,63,55,.13),0 1px 1px rgba(255,255,255,.92)}
.pearl::before{content:"";position:absolute;inset:6%;border-radius:inherit;box-shadow:inset 1px 1px 0 rgba(255,255,255,.94),inset -1px -1px 0 rgba(128,120,128,.12)}.pearl::after{content:"";position:absolute;left:22%;top:12%;width:35%;height:18%;border-radius:50%;background:rgba(255,255,255,.94);filter:blur(.25px)}
.pearlTop{width:clamp(31px,2.65vw,37px);height:clamp(31px,2.65vw,37px);background:radial-gradient(circle at 30% 22%,#fff 0 9%,rgba(255,255,255,.86) 17%,rgba(187,220,255,.48) 37%,rgba(195,164,245,.48) 55%,rgba(255,190,180,.36) 70%,rgba(255,232,174,.30) 81%,rgba(255,255,255,.64) 91%)}.pearlToday{width:clamp(28px,2.55vw,34px);height:clamp(28px,2.55vw,34px)}
.pearlCool{background:radial-gradient(circle at 29% 22%,#fff 0 10%,rgba(255,255,255,.86) 17%,rgba(188,219,255,.50) 41%,rgba(214,204,246,.30) 63%,rgba(255,255,255,.65) 90%)}.pearlViolet{background:radial-gradient(circle at 29% 22%,#fff 0 10%,rgba(255,255,255,.84) 17%,rgba(191,218,255,.40) 37%,rgba(176,135,244,.57) 59%,rgba(235,199,255,.44) 76%,rgba(255,255,255,.62) 91%)}.pearlPeach{background:radial-gradient(circle at 29% 22%,#fff 0 10%,rgba(255,255,255,.86) 17%,rgba(255,222,180,.51) 40%,rgba(255,157,120,.53) 62%,rgba(255,224,205,.46) 80%,rgba(255,255,255,.63) 92%)}
.pearlDroplet{border-radius:62% 38% 56% 44% / 39% 53% 47% 61%;transform:rotate(-18deg);box-shadow:inset -9px -9px 14px rgba(108,110,124,.14),inset 6px 5px 11px rgba(255,255,255,.97),0 8px 15px rgba(75,63,55,.13)}.pearlFacet{border-radius:43% 57% 48% 52% / 58% 38% 62% 42%;clip-path:polygon(12% 29%,35% 7%,72% 12%,94% 39%,83% 78%,54% 96%,18% 83%,5% 52%);background:linear-gradient(137deg,rgba(255,255,255,.93),rgba(203,225,255,.36) 26%,rgba(255,255,255,.50) 45%,rgba(202,178,241,.30) 63%,rgba(255,218,194,.24) 79%,rgba(255,255,255,.72));box-shadow:inset 7px 5px 10px rgba(255,255,255,.87),inset -7px -8px 11px rgba(108,107,119,.09),0 7px 14px rgba(76,64,56,.12)}.pearlRing{background:radial-gradient(circle at 50% 50%,rgba(245,239,233,.38) 0 34%,rgba(255,255,255,.18) 36%,rgba(255,211,164,.62) 48%,rgba(255,255,255,.90) 60%,rgba(205,225,255,.36) 74%,rgba(255,255,255,.59) 92%)}

.center{grid-column:2;grid-row:2;min-width:0;min-height:0;display:grid;grid-template-rows:minmax(278px,39%) minmax(0,1fr) clamp(39px,5%,48px);gap:clamp(7px,.8dvh,9px)}

.chamber{position:relative;min-height:0;overflow:hidden;padding:clamp(12px,1.4dvh,17px) clamp(16px,1.5vw,22px) clamp(10px,1.1dvh,13px);display:grid;grid-template-columns:minmax(0,.64fr) minmax(230px,1.08fr) minmax(330px,1.46fr);grid-template-rows:minmax(0,1fr) clamp(79px,10.2dvh,101px);column-gap:clamp(10px,1.2vw,18px);border-radius:29px 34px 31px 36px / 31px 28px 36px 33px;background:linear-gradient(136deg,rgba(255,255,255,.19),rgba(255,255,255,.038) 40%,rgba(245,239,234,.07) 66%,rgba(255,255,255,.12));box-shadow:inset 1px 1px 0 rgba(255,255,255,.94),inset -1px -1px 0 rgba(131,119,109,.09),inset 0 -14px 30px rgba(112,95,81,.025),0 20px 38px rgba(74,62,54,.055),0 2px 7px rgba(74,62,54,.035);transform:translateZ(12px)}
.chamber::before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(103deg,transparent 0 20%,rgba(255,255,255,.38) 22%,transparent 25% 57%,rgba(195,221,255,.12) 60%,rgba(205,176,246,.11) 63%,rgba(255,199,177,.10) 66%,rgba(255,237,180,.07) 69%,transparent 73%),radial-gradient(42% 22% at 51% 101%,rgba(113,92,76,.08),transparent 73%);mix-blend-mode:screen}.chamber::after{content:"";position:absolute;left:3%;right:3%;bottom:calc(clamp(79px,10.2dvh,101px) + 2px);height:2px;background:linear-gradient(90deg,transparent,rgba(143,132,122,.09) 12%,rgba(255,255,255,.72) 47%,rgba(198,218,246,.12) 61%,rgba(143,132,122,.07) 88%,transparent);box-shadow:0 1px 0 rgba(103,90,79,.035);pointer-events:none}
.chamberLight{position:absolute;inset:0;pointer-events:none;background:radial-gradient(24% 31% at 34% 32%,rgba(255,255,255,.31),transparent 72%),radial-gradient(20% 27% at 54% 28%,rgba(210,229,255,.10),rgba(213,185,246,.08) 54%,transparent 74%),radial-gradient(17% 23% at 80% 44%,rgba(255,215,189,.07),transparent 72%)}

.nowZone{position:relative;z-index:3;padding:4px 0 0 3px}.time{font-size:clamp(8px,.74vw,10.5px);letter-spacing:.01em;color:#6f6964}.nowTitle{margin-top:clamp(7px,.85dvh,10px);font-size:clamp(27px,2.55vw,36px);line-height:.91;font-weight:330;letter-spacing:-.06em}.flow{margin-top:clamp(9px,1.1dvh,13px);font-size:clamp(9.5px,.86vw,12.5px);font-weight:430}.flowNote{margin-top:4px;font-size:clamp(7px,.64vw,9px);color:#827b75}.protected{margin-top:clamp(13px,1.7dvh,18px);position:relative;border:0;background:transparent;padding:7px 12px 7px 16px;display:inline-flex;align-items:center;gap:8px;font-size:clamp(6.5px,.58vw,8.2px);cursor:pointer}.protected::before{content:"";position:absolute;inset:1px 0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.27),rgba(255,255,255,.055));box-shadow:inset 0 1px 0 rgba(255,255,255,.82),inset 0 -1px 0 rgba(121,110,102,.06),0 5px 12px rgba(72,60,52,.04);z-index:-1}.protected::after{content:"";position:absolute;left:5px;right:5px;top:2px;height:1px;border-radius:99px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.94),transparent)}.protectedDot{width:6px;height:6px;border-radius:50%;background:radial-gradient(circle at 35% 28%,#ffffed,#dfe9a9 56%,#9bab62);box-shadow:0 0 6px rgba(190,207,104,.25)}

.matterZone{position:relative;z-index:3;min-width:0;min-height:0;display:grid;place-items:center;transform-style:preserve-3d}.matterGround{position:absolute;left:13%;right:10%;bottom:5%;height:14%;border-radius:50%;background:radial-gradient(ellipse,rgba(95,78,65,.16),rgba(95,78,65,.05) 46%,transparent 75%);filter:blur(8px);transform:rotate(-4deg) translateZ(-8px)}.matterSculpture{position:relative;width:min(100%,365px);aspect-ratio:1.58;transform:rotate(-4deg) translateY(-2%) translateZ(16px);filter:drop-shadow(0 14px 14px rgba(83,69,58,.11))}.matterBody{position:absolute;inset:6% 3% 5% 2%;border-radius:48% 52% 61% 39% / 39% 34% 66% 61%;background:radial-gradient(50% 58% at 31% 27%,rgba(255,255,255,.98) 0 8%,rgba(255,255,255,.43) 20%,rgba(199,222,252,.18) 39%,rgba(222,195,247,.17) 56%,rgba(255,202,181,.13) 71%,rgba(255,239,185,.09) 81%,rgba(255,255,255,.36) 91%,rgba(133,128,134,.08));box-shadow:inset 18px 15px 31px rgba(255,255,255,.76),inset -20px -18px 32px rgba(109,112,127,.13),inset 0 -3px 6px rgba(171,146,130,.08),0 2px 0 rgba(255,255,255,.89);backdrop-filter:blur(6px) saturate(122%)}.matterBody::after{content:"";position:absolute;inset:-1%;border-radius:inherit;padding:2px;background:linear-gradient(120deg,rgba(255,255,255,.99),rgba(197,226,255,.58) 25%,rgba(255,255,255,.58) 40%,rgba(190,153,246,.47) 57%,rgba(255,179,158,.39) 70%,rgba(255,231,168,.35) 80%,rgba(255,255,255,.88));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.92}.matterLobeA{position:absolute;left:7%;top:3%;width:56%;height:52%;border-radius:54% 46% 60% 40% / 50% 42% 58% 50%;background:radial-gradient(60% 60% at 35% 31%,rgba(255,255,255,.82),rgba(255,255,255,.12) 50%,rgba(189,221,255,.10) 68%,transparent 76%);box-shadow:inset 6px 5px 10px rgba(255,255,255,.45);transform:rotate(5deg);mix-blend-mode:screen}.matterLobeB{position:absolute;left:28%;bottom:4%;width:60%;height:48%;border-radius:43% 57% 55% 45% / 60% 43% 57% 40%;background:radial-gradient(65% 55% at 45% 38%,rgba(255,255,255,.48),rgba(201,223,255,.12) 43%,rgba(198,168,242,.11) 61%,rgba(255,206,181,.08) 75%,transparent);box-shadow:inset -3px -4px 8px rgba(118,116,129,.08);transform:rotate(-11deg)}.matterCavity{position:absolute;right:5%;top:12%;width:47%;height:31%;border-radius:55% 45% 59% 41% / 51% 39% 61% 49%;background:radial-gradient(ellipse at 58% 45%,rgba(224,216,207,.40),rgba(242,237,232,.26) 44%,rgba(255,255,255,.20) 57%,rgba(211,226,247,.10) 68%,transparent 74%);box-shadow:inset 9px 7px 13px rgba(255,255,255,.84),inset -8px -8px 13px rgba(91,84,81,.15),0 1px 0 rgba(255,255,255,.70);transform:rotate(-14deg);backdrop-filter:blur(2px)}.matterCavity::after{content:"";position:absolute;inset:-5%;border-radius:inherit;padding:3px;background:linear-gradient(124deg,rgba(255,255,255,.95),rgba(193,222,255,.42) 31%,rgba(211,174,247,.34) 52%,rgba(255,189,169,.27) 69%,rgba(255,239,188,.24) 81%,rgba(255,255,255,.80));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;filter:blur(.25px)}.matterRibbon{position:absolute;left:20%;top:45%;width:65%;height:18%;border-radius:999px;background:linear-gradient(90deg,rgba(255,255,255,.12),rgba(255,255,255,.85) 27%,rgba(191,222,255,.48) 47%,rgba(184,147,245,.46) 61%,rgba(255,181,159,.38) 74%,rgba(255,231,166,.29) 86%,rgba(255,255,255,.45));box-shadow:inset 0 2px 3px rgba(255,255,255,.78),0 1px 2px rgba(116,98,84,.07);transform:rotate(-22deg);filter:blur(.2px);mix-blend-mode:screen}.matterRibbon2{position:absolute;left:23%;bottom:19%;width:53%;height:9%;border-radius:999px;background:linear-gradient(90deg,transparent,rgba(205,228,255,.27),rgba(255,255,255,.74) 42%,rgba(208,169,246,.25) 61%,rgba(255,206,178,.17),transparent);transform:rotate(15deg);mix-blend-mode:screen}.matterHighlight{position:absolute;left:11%;top:13%;width:43%;height:16%;border-radius:50%;background:rgba(255,255,255,.72);filter:blur(3px);transform:rotate(-14deg);mix-blend-mode:screen}.matterFlare{position:absolute;right:-1%;bottom:16%;width:35%;height:36%;border-radius:50%;background:radial-gradient(circle at 32% 42%,rgba(255,255,255,.75),rgba(194,221,255,.18) 29%,rgba(195,157,245,.15) 46%,rgba(255,190,169,.12) 60%,transparent 73%);filter:blur(6px);mix-blend-mode:screen}

.intel{position:relative;z-index:3;display:grid;grid-template-rows:auto minmax(0,1fr);gap:clamp(8px,1dvh,12px);min-width:0;min-height:0}.whatLabel{font-size:clamp(8px,.7vw,9.8px);font-weight:545}.intentSlot{position:relative;margin-top:6px;height:clamp(41px,5.4dvh,49px);display:grid;grid-template-columns:minmax(0,1fr) 43px;align-items:center}.intentSlot::before{content:"";position:absolute;inset:0;border-radius:15px 18px 14px 20px / 16px 14px 19px 17px;background:linear-gradient(148deg,rgba(255,255,255,.32),rgba(255,255,255,.065) 55%,rgba(223,234,250,.06));box-shadow:inset 1px 1px 0 rgba(255,255,255,.89),inset -1px -1px 0 rgba(122,112,104,.07),inset 0 -5px 11px rgba(103,89,78,.025),0 8px 15px rgba(72,61,53,.035)}.intentSlot::after{content:"";position:absolute;left:4%;right:10%;top:1px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.94),rgba(202,225,255,.23),transparent)}.intentSlot input{position:relative;z-index:1;height:100%;min-width:0;border:0;outline:none;background:transparent;padding:0 14px;font-size:clamp(8px,.71vw,9.8px)}.intentSlot input::placeholder{color:#9d958e}.sendPearl{position:relative;z-index:1;justify-self:center;width:31px;height:31px;border:0;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:radial-gradient(circle at 31% 25%,#fff,rgba(231,241,255,.78) 25%,rgba(190,215,248,.42) 48%,rgba(214,187,244,.24) 67%,rgba(255,255,255,.57));box-shadow:inset 3px 3px 8px rgba(255,255,255,.97),inset -4px -5px 8px rgba(111,112,123,.12),0 6px 10px rgba(73,62,54,.09)}.sendPearl svg{stroke-width:1.35;transform:rotate(12deg)}

.infoField{min-height:0;display:grid;grid-template-columns:.95fr .88fr 1.25fr;gap:clamp(7px,.7vw,10px)}.infoPane{position:relative;min-width:0;overflow:hidden;padding:clamp(9px,1dvh,12px) clamp(10px,.9vw,13px);border-radius:15px 18px 14px 17px / 16px 14px 18px 15px;background:linear-gradient(145deg,rgba(255,255,255,.20),rgba(255,255,255,.045));box-shadow:inset 1px 1px 0 rgba(255,255,255,.74),inset -1px -1px 0 rgba(126,116,108,.06),0 6px 12px rgba(74,63,55,.025)}.infoPane::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;background:linear-gradient(106deg,transparent 0 35%,rgba(255,255,255,.20) 38%,transparent 42%);mix-blend-mode:screen}.infoLabel{position:relative;z-index:1;font-size:clamp(6.3px,.54vw,7.7px);color:#5f5954}.infoValue{position:relative;z-index:1;margin-top:clamp(4px,.6dvh,7px);font-size:clamp(8px,.68vw,9.7px);line-height:1.2}.capacityWave{position:relative;z-index:1;margin-top:7px;height:25px}.capacityWave::before{content:"";position:absolute;left:2%;right:3%;bottom:9px;height:11px;border-radius:55% 45% 49% 51% / 75% 66% 34% 25%;border-bottom:2px solid rgba(122,118,115,.23);border-right:1px solid rgba(255,255,255,.65);transform:rotate(-7deg);box-shadow:0 1px 0 rgba(255,255,255,.46)}.energyPane{display:grid;grid-template-columns:minmax(0,1fr) 51px;align-items:center}.energyPane .infoValue{white-space:nowrap}.energyPearl{width:43px;height:43px;justify-self:end}.priorityPane{padding-right:11px}.priorityRow{position:relative;z-index:1;display:grid;grid-template-columns:13px minmax(0,1fr) 13px;align-items:center;gap:6px;margin-top:5px;font-size:clamp(6.1px,.53vw,7.5px);min-height:13px}.priorityIndex{color:#756e68}.priorityText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.priorityNode{width:10px;height:10px;border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.85),rgba(255,255,255,.18) 60%,rgba(145,136,130,.05));box-shadow:inset 0 0 0 1px rgba(118,111,105,.18),inset 2px 2px 4px rgba(255,255,255,.82)}

.focusInset{grid-column:1/-1;position:relative;z-index:3;min-height:0;display:grid;grid-template-columns:1.32fr 1fr 1.11fr;border-radius:17px 20px 16px 19px / 17px 16px 20px 18px;background:linear-gradient(180deg,rgba(186,174,163,.035),rgba(255,255,255,.11));box-shadow:inset 0 10px 18px rgba(93,78,66,.04),inset 0 1px 0 rgba(255,255,255,.73),inset 0 -1px 0 rgba(130,119,110,.07),0 -1px 0 rgba(255,255,255,.30)}.focusCell{position:relative;padding:clamp(8px,.95dvh,11px) clamp(14px,1.28vw,19px);display:flex;flex-direction:column;justify-content:center;min-width:0}.focusCell+.focusCell::before{content:"";position:absolute;left:0;top:15%;bottom:15%;width:1px;background:linear-gradient(180deg,transparent,rgba(143,133,124,.12),rgba(255,255,255,.62),rgba(143,133,124,.10),transparent)}.cellLabel{font-size:clamp(6.2px,.53vw,7.5px);color:#716a64}.cellTitle{margin-top:5px;font-size:clamp(9.6px,.86vw,12.4px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.focusProgress{margin-top:7px;display:flex;align-items:center;gap:7px}.focusTrack{position:relative;width:min(190px,67%);height:5px;border-radius:99px;background:rgba(255,255,255,.25);box-shadow:inset 0 1px 2px rgba(98,85,74,.08),inset 0 0 0 1px rgba(255,255,255,.56);overflow:hidden}.focusFill{height:100%;border-radius:inherit;background:linear-gradient(90deg,rgba(219,220,215,.34),rgba(255,255,255,.96) 62%,rgba(255,222,160,.72) 92%,rgba(255,255,255,.96));box-shadow:0 0 6px rgba(255,215,143,.20)}.focusPct{font-size:clamp(6.4px,.55vw,7.8px);color:#67615c}.cellMeta{margin-top:5px;display:flex;align-items:center;gap:6px;min-height:14px;font-size:clamp(6.3px,.54vw,7.7px);color:#7b746e;white-space:nowrap}.semanticIcons{display:inline-flex;align-items:center;gap:5px}.semanticIcons svg{stroke-width:1.15}.joinButton{position:relative;border:0;background:transparent;padding:4px 10px;margin-left:5px;font-size:inherit;cursor:pointer}.joinButton::before{content:"";position:absolute;inset:0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.26),rgba(255,255,255,.05));box-shadow:inset 0 1px 0 rgba(255,255,255,.79),inset 0 -1px 0 rgba(124,113,105,.06);z-index:-1}.moreButton{width:23px;height:23px;border:0;border-radius:50%;background:radial-gradient(circle at 34% 28%,rgba(255,255,255,.78),rgba(255,255,255,.13));box-shadow:inset 0 0 0 1px rgba(255,255,255,.52);display:grid;place-items:center;cursor:pointer;margin-left:1px}

.timeVessel{position:relative;min-height:0;display:grid;grid-template-rows:repeat(4,minmax(0,1fr));gap:clamp(7px,.8dvh,9px);padding-left:16px}.timeBand{position:relative;min-height:0;display:grid;grid-template-columns:minmax(126px,.9fr) minmax(0,1.5fr) minmax(0,1.5fr) minmax(105px,.78fr);align-items:center;gap:clamp(7px,.8vw,12px);padding:clamp(6px,.72dvh,9px) clamp(12px,1.15vw,17px) clamp(6px,.72dvh,9px) clamp(19px,1.55vw,23px);border-radius:18px 24px 20px 22px / 20px 18px 23px 21px;background:linear-gradient(91deg,rgba(255,255,255,.18),rgba(255,255,255,.045) 47%,rgba(246,241,236,.075));box-shadow:inset 1px 1px 0 rgba(255,255,255,.77),inset -1px -1px 0 rgba(130,119,109,.055),inset 0 -7px 13px rgba(91,76,64,.018),0 7px 14px rgba(77,65,56,.025)}.timeBand::before{content:"";position:absolute;left:-15px;top:50%;width:15px;height:2px;background:linear-gradient(90deg,rgba(132,121,112,.22),rgba(255,255,255,.84));box-shadow:0 1px 0 rgba(109,95,84,.03)}.timeBand::after{content:"";position:absolute;left:-4px;top:calc(50% - 4px);width:8px;height:8px;border-radius:61% 39% 54% 46% / 43% 58% 42% 57%;background:radial-gradient(circle at 32% 29%,#fff,rgba(207,226,253,.56) 48%,rgba(190,162,231,.20) 66%,rgba(255,255,255,.55));box-shadow:0 3px 6px rgba(75,63,55,.10)}.flowArrow{position:absolute;left:50%;top:calc(100% + 1px);transform:translateX(-50%);z-index:4;font-size:18px;line-height:1;color:rgba(124,116,109,.28);text-shadow:0 -1px 0 rgba(255,255,255,.55);pointer-events:none}.rowTime{font-size:clamp(5.8px,.50vw,7.1px);color:#69635e}.rowName{margin-top:2px;font-size:clamp(14px,1.35vw,19px);line-height:.94;letter-spacing:-.045em;font-weight:350}.rowCopy{margin-top:3px;font-size:clamp(5.8px,.49vw,7.1px);line-height:1.24;color:#827b74}.eventSlot{width:100%;min-width:0;display:grid;grid-template-columns:48px minmax(0,1fr);gap:10px;align-items:center;border:0;background:transparent;text-align:left;padding:0;cursor:pointer}.eventObject{width:39px;height:39px;justify-self:center;transition:transform 220ms cubic-bezier(.2,.7,.2,1),filter 220ms ease}.eventSlot:hover .eventObject{transform:translateY(-2px) scale(1.02);filter:brightness(1.04) saturate(1.08)}.eventSlot:active .eventObject{transform:scale(.98)}.eventTitle{display:block;font-size:clamp(7.5px,.68vw,9.8px);font-weight:440;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eventMeta{display:flex;align-items:center;gap:6px;margin-top:4px;font-size:clamp(5.6px,.48vw,6.9px);color:#7f7770;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tag{display:inline-block;padding:2px 6px;border-radius:5px;background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,.06));box-shadow:inset 0 0 0 1px rgba(137,127,118,.09);font-size:clamp(5px,.43vw,6px);color:#877f78}.emptySpace{display:flex;align-items:center;gap:7px;font-size:clamp(6.2px,.54vw,7.8px);color:#a0968d;font-style:italic}.emptySpace::before{content:"";width:18px;height:1px;background:linear-gradient(90deg,rgba(149,139,130,.18),rgba(255,255,255,.58),transparent)}.countLens{justify-self:end;min-width:104px;min-height:47px;padding:8px 11px 8px 12px;position:relative;display:flex;align-items:center}.countLens::before{content:"";position:absolute;inset:0;border-radius:14px 17px 15px 18px / 16px 14px 18px 15px;background:linear-gradient(144deg,rgba(255,255,255,.23),rgba(255,255,255,.048));box-shadow:inset 1px 1px 0 rgba(255,255,255,.76),inset -1px -1px 0 rgba(127,117,109,.065),0 5px 10px rgba(75,63,55,.025)}.countCopy{position:relative;z-index:1}.countLabel{font-size:clamp(5.2px,.44vw,6.3px);color:#6f6963}.countValue{margin-top:4px;font-size:clamp(8px,.71vw,10.4px)}.countPearl{position:absolute;z-index:2;right:-5px;top:50%;transform:translateY(-50%);width:33px;height:33px}.countRing{position:absolute;z-index:2;right:-4px;top:50%;transform:translateY(-50%);width:35px;height:35px}

.footer{min-height:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 4px}.dayGroup{justify-self:start;display:flex;align-items:center;gap:8px}.dayView{position:relative;display:flex;align-items:center;gap:8px;border:0;background:transparent;padding:8px 12px;font-size:clamp(6.4px,.56vw,8px);cursor:pointer}.dayView::before{content:"";position:absolute;inset:0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.27),rgba(255,255,255,.055));box-shadow:inset 0 1px 0 rgba(255,255,255,.83),inset 0 -1px 0 rgba(126,116,108,.06),0 6px 12px rgba(77,65,56,.03);z-index:-1}.miniOptic{width:31px;height:31px;border:0;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:radial-gradient(circle at 31% 24%,#fff,rgba(209,229,255,.49) 38%,rgba(208,181,244,.25) 60%,rgba(255,216,190,.19) 77%,rgba(255,255,255,.60));box-shadow:inset 4px 4px 8px rgba(255,255,255,.94),inset -4px -5px 8px rgba(113,112,122,.09),0 5px 10px rgba(76,64,55,.07)}.replan{justify-self:center;position:relative;min-width:clamp(205px,21vw,265px);display:flex;align-items:center;justify-content:center;gap:8px;border:0;background:transparent;padding:10px 19px;font-size:clamp(6.7px,.59vw,8.4px);cursor:pointer}.replan::before{content:"";position:absolute;inset:0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,.075));box-shadow:inset 0 1px 0 rgba(255,255,255,.91),inset 0 -1px 0 rgba(125,114,106,.07),0 8px 15px rgba(76,64,55,.04);z-index:-1}.replan::after{content:"";position:absolute;left:10%;right:10%;top:1px;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.94),transparent)}.saveTools{justify-self:end;display:flex;align-items:center;gap:10px;font-size:clamp(5.6px,.48vw,6.7px);color:#8a837d}.undo{position:relative;display:flex;align-items:center;gap:5px;border:0;background:transparent;padding:7px 10px;font-size:clamp(6px,.52vw,7.4px);color:#746e68;cursor:pointer}.undo::before{content:"";position:absolute;inset:0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.045));box-shadow:inset 0 1px 0 rgba(255,255,255,.70),inset 0 -1px 0 rgba(124,113,105,.055);z-index:-1}.cornerPearl{width:38px;height:38px;margin-left:2px;background:radial-gradient(circle at 29% 22%,#fff 0 9%,rgba(255,255,255,.83) 16%,rgba(186,218,255,.48) 37%,rgba(191,158,242,.40) 55%,rgba(255,190,166,.29) 69%,rgba(255,230,170,.24) 79%,rgba(255,255,255,.64) 91%)}

@media(max-width:1050px) and (min-width:721px){.shell{height:min(calc(100dvh - 24px),calc((100vw - 24px)*.77));min-height:min(760px,calc(100dvh - 24px))}.layout{grid-template-columns:72px minmax(0,1fr)}.chamber{grid-template-columns:minmax(0,.56fr) minmax(210px,1fr) minmax(300px,1.52fr);column-gap:8px;padding-left:12px;padding-right:12px}.matterSculpture{width:min(100%,330px)}.infoField{grid-template-columns:.92fr .82fr 1.3fr;gap:5px}.infoPane{padding-left:8px;padding-right:8px}.timeBand{grid-template-columns:minmax(113px,.82fr) minmax(0,1.37fr) minmax(0,1.37fr) minmax(91px,.72fr);padding-left:14px;padding-right:8px}.eventSlot{grid-template-columns:43px minmax(0,1fr);gap:7px}.eventObject{width:35px;height:35px}.countLens{min-width:90px}.railButton{min-height:54px}.worldName{letter-spacing:.09em}}
@media(max-height:820px) and (min-width:721px){.shell{height:calc(100dvh - 20px);min-height:0}.center{grid-template-rows:minmax(252px,38%) minmax(0,1fr) 38px}.chamber{grid-template-rows:minmax(0,1fr) 72px;padding-top:9px;padding-bottom:7px}.protected{margin-top:8px}.timeBand{padding-top:4px;padding-bottom:4px}.eventObject{width:31px;height:31px}.countLens{min-height:39px}.footer{min-height:34px}}
@media(max-width:720px){:host{position:fixed}.world{display:block;padding:8px}.shell{width:100%;height:auto;min-height:calc(100dvh - 16px);padding:9px;border-radius:27px;overflow:visible}.layout{display:block}.header{position:sticky;top:0;z-index:70;height:50px;grid-template-columns:1fr auto;border-radius:18px;background:rgba(245,240,234,.79);backdrop-filter:blur(8px)}.worldName{display:none}.rail{position:fixed;left:11px;right:11px;bottom:8px;z-index:80;height:63px;padding:5px 6px;border-radius:22px;display:grid;grid-template-columns:repeat(6,1fr) 43px;gap:2px;background:rgba(241,235,229,.84);backdrop-filter:blur(9px);box-shadow:inset 0 1px 0 rgba(255,255,255,.84),0 10px 25px rgba(74,62,54,.14)}.rail::before,.rail::after{display:none}.railButton{min-height:50px;font-size:0;gap:0}.railMount,.railButton.active .railMount{width:39px;height:39px}.railSpacer{display:none}.addPearl{width:39px;height:39px}.center{margin-top:8px;padding-bottom:74px;display:flex;flex-direction:column;gap:8px}.chamber{display:grid;grid-template-columns:1fr;grid-template-rows:auto 210px auto auto;padding:17px 14px 13px;border-radius:27px}.nowZone{padding:0}.matterZone{min-height:205px}.matterSculpture{width:min(340px,88vw)}.intel{margin-top:3px}.infoField{grid-template-columns:1fr 1fr}.priorityPane{grid-column:1/-1}.focusInset{margin-top:8px;grid-template-columns:1fr}.focusCell+.focusCell::before{left:5%;right:5%;top:0;bottom:auto;width:auto;height:1px;background:linear-gradient(90deg,transparent,rgba(143,133,124,.11),rgba(255,255,255,.55),transparent)}.timeVessel{padding-left:12px}.timeBand{grid-template-columns:1fr;padding:14px;gap:11px}.flowArrow{display:none}.rowName{font-size:23px}.eventSlot{grid-template-columns:46px minmax(0,1fr)}.eventObject{width:40px;height:40px}.countLens{justify-self:stretch;min-height:44px}.footer{grid-template-columns:1fr;gap:8px;padding:4px}.dayGroup,.replan,.saveTools{justify-self:center}.replan{min-width:220px}.cornerPearl{display:none}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.eventSlot:hover .eventObject{transform:none}}
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
function formatDateShort(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}
function durationMinutes(start: Date | null, end: Date | null) {
  if (!start || !end) return null;
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
}
function formatDuration(minutes: number | null) {
  if (minutes === null) return null;
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${String(m).padStart(2, '0')}m` : `${h}h`;
}
function formatRange(item: TimelineItem) {
  if (item.allDay) return 'All day';
  if (!item.at) return item.meta ?? '';
  if (item.endAt && sameDay(item.at, item.endAt)) return `${formatClock(item.at)} – ${formatClock(item.endAt)}`;
  return formatClock(item.at);
}
function until(from: Date, to: Date | null) {
  if (!to) return 'Open';
  const mins = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000));
  if (mins > 36 * 60) return formatDateShort(to);
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
  if (bucket === 'LATER' && index === 0) return 'pearlViolet';
  if (bucket === 'TONIGHT' && index === 0) return 'pearlPeach';
  if (bucket === 'TONIGHT' && index === 1) return 'pearlViolet';
  return 'pearlCool';
}
function objectShape(bucket: Bucket, index: number) {
  if (bucket === 'NEXT' && index === 0) return 'pearlDroplet';
  if (bucket === 'NEXT' && index === 1) return 'pearlFacet';
  if (bucket === 'LATER' && index === 1) return 'pearlFacet';
  if (bucket === 'TOMORROW' && index === 0) return 'pearlDroplet';
  if (bucket === 'TOMORROW' && index === 1) return 'pearlFacet';
  return '';
}
function tagFor(item: TimelineItem) {
  if (item.kind === 'task') return item.meta === 'high' || item.meta === 'urgent' ? 'Deep work' : 'Task';
  if (item.location && item.location !== 'Calendar') return 'Meeting';
  return 'Calendar';
}
function isUrl(value?: string | null) {
  return !!value && /^https?:\/\//i.test(value.trim());
}

function MatterSculpture() {
  return (
    <div className="matterZone" aria-label="Glow living matter">
      <div className="matterGround" aria-hidden="true" />
      <div className="matterSculpture" aria-hidden="true">
        <div className="matterBody" />
        <div className="matterLobeA" />
        <div className="matterLobeB" />
        <div className="matterCavity" />
        <div className="matterRibbon" />
        <div className="matterRibbon2" />
        <div className="matterHighlight" />
        <div className="matterFlare" />
      </div>
    </div>
  );
}

function SemanticNextIcon({ title }: { title: string }) {
  const lower = title.toLowerCase();
  if (lower.includes('workout') || lower.includes('gym') || lower.includes('shower')) {
    return <span className="semanticIcons"><Dumbbell size={12}/><ShowerHead size={12}/></span>;
  }
  return <Focus size={12}/>;
}

export function TodayGlowMatterCenter({ tasks, events, routines, activeFocus, energy, mood, sleepHours }: Props) {
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
  const activeTask = activeFocus ? rankedTasks.find((task) => task.id === activeFocus.entityId) ?? null : topThree[0] ?? null;

  const items = useMemo<TimelineItem[]>(() => {
    const eventItems = events.flatMap((event) => {
      const at = event.startAtISO ? new Date(event.startAtISO) : null;
      const endAt = event.endAtISO ? new Date(event.endAtISO) : null;
      if (at && Number.isNaN(at.getTime())) return [];
      return [{
        id: `event-${event.id}`,
        title: event.title,
        at,
        endAt: endAt && !Number.isNaN(endAt.getTime()) ? endAt : null,
        kind: 'event' as const,
        meta: event.location || 'Calendar',
        location: event.location,
        htmlLink: event.htmlLink,
        allDay: event.allDay,
      }];
    });
    const taskItems = tasks.flatMap((task) => {
      if (!task.dueDateISO) return [];
      const at = new Date(task.dueDateISO);
      if (Number.isNaN(at.getTime())) return [];
      return [{ id: `task-${task.id}`, title: task.title, at, endAt: null, kind: 'task' as const, meta: task.priority }];
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

  const nextScheduled = buckets.NEXT[0] ?? null;
  const nextTask = rankedTasks.find((task) => task.id !== activeTask?.id) ?? rankedTasks[0] ?? null;
  const nextUpTitle = nextScheduled?.title ?? nextTask?.title ?? 'Open';
  const nextUpMeta = nextScheduled
    ? nextScheduled.allDay
      ? 'All day'
      : `${nextScheduled.at ? formatClock(nextScheduled.at) : 'Flexible'}${formatDuration(durationMinutes(nextScheduled.at, nextScheduled.endAt)) ? ` · ${formatDuration(durationMinutes(nextScheduled.at, nextScheduled.endAt))}` : ''}`
    : nextTask?.dueDateISO
      ? `Due ${formatDateShort(new Date(nextTask.dueDateISO))}`
      : routines.length ? `${routines.length} routines available today` : 'Flexible';

  const nextEvent = items.find((item) => item.kind === 'event' && item.at && item.at >= now && !item.allDay) ?? null;
  const energyText = energyLabel(energy, mood, sleepHours);
  const capacityText = capacityLabel(energy);

  const focusStartedAt = activeFocus ? new Date(activeFocus.startedAtISO) : null;
  const focusPlanned = activeFocus?.plannedMinutes ?? 0;
  const focusElapsed = focusStartedAt && !Number.isNaN(focusStartedAt.getTime()) ? Math.max(0, Math.round((now.getTime() - focusStartedAt.getTime()) / 60000)) : 0;
  const focusProgress = activeFocus && focusPlanned > 0 ? Math.max(0, Math.min(100, Math.round((focusElapsed / focusPlanned) * 100))) : 0;
  const focusRemaining = activeFocus && focusPlanned > 0 ? Math.max(0, focusPlanned - focusElapsed) : null;
  const focusTitle = activeFocus?.title ?? activeTask?.title ?? 'Open focus';

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
  function openAppointment(item: TimelineItem) {
    const target = isUrl(item.location) ? item.location : item.htmlLink;
    if (target) window.open(target, '_blank', 'noopener,noreferrer');
    else selectContext(item);
  }

  const body = (
    <div className="world">
      <style>{CSS}</style>
      <div className="shell">
        <div className="shellCaustic" aria-hidden="true" />
        <div className="layout">
          <header className="header">
            <div className="brand"><strong>Glow OS</strong><span className="batch">Batch 1</span></div>
            <div className="worldName">world 1: TODAY · THE LIVING CENTER</div>
            <button type="button" className="askTop" onClick={() => openGlow()} aria-label="Ask Glow">
              <span className="pearl pearlTop" aria-hidden="true" />
              <span className="askTopLabel">Ask Glow<br/>⌘ K</span>
            </button>
          </header>

          <nav className="rail" aria-label="Today tools">
            <button className="railButton active" type="button" onClick={() => router.push('/today')}><span className="railMount"><span className="pearl pearlToday" aria-hidden="true"/></span><span>Today</span></button>
            <button className="railButton" type="button" onClick={() => router.push('/focus')}><span className="railMount"><Focus size={15}/></span><span>Focus</span></button>
            <button className="railButton" type="button" onClick={() => router.push('/connections')}><span className="railMount"><Users size={15}/></span><span>People</span></button>
            <button className="railButton" type="button" onClick={() => router.push('/world')}><span className="railMount"><MapPin size={15}/></span><span>Places</span></button>
            <button className="railButton" type="button" onClick={() => router.push('/resources')}><span className="railMount"><LayoutGrid size={15}/></span><span>Resources</span></button>
            <button className="railButton" type="button" onClick={() => router.push('/planning')}><span className="railMount"><Route size={15}/></span><span>Journeys</span></button>
            <div className="railSpacer" />
            <button className="addPearl" type="button" onClick={() => openGlow('Create ')} aria-label="Create with Glow"><Plus size={14}/></button>
          </nav>

          <main className="center">
            <section className="chamber">
              <div className="chamberLight" aria-hidden="true" />
              <div className="nowZone">
                <div className="time">{formatClock(now)}</div>
                <div className="nowTitle">NOW</div>
                <div className="flow">You’re in flow</div>
                <div className="flowNote">Keep the momentum.</div>
                <button className="protected" type="button" onClick={() => openGlow('Protect 90 minutes for my current focus. Show me the proposal before changing my schedule.')}><span className="protectedDot"/><span>Protected 90 min</span></button>
              </div>

              <MatterSculpture />

              <div className="intel">
                <div>
                  <div className="whatLabel">What now?</div>
                  <div className="intentSlot">
                    <input value={intent} onChange={(event) => setIntent(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitIntent(); }} placeholder="Share intent or ask anything…" aria-label="Ask Glow what now" />
                    <button className="sendPearl" type="button" onClick={submitIntent} aria-label="Send to Glow"><ArrowUp size={12}/></button>
                  </div>
                </div>
                <div className="infoField">
                  <div className="infoPane"><div className="infoLabel">Capacity</div><div className="infoValue">{capacityText}</div><div className="capacityWave"/></div>
                  <div className="infoPane energyPane"><div><div className="infoLabel">Energy</div><div className="infoValue">{energyText}</div></div><span className="pearl energyPearl" aria-hidden="true"/></div>
                  <div className="infoPane priorityPane"><div className="infoLabel">Top 3 priorities</div>{topThree.length ? topThree.map((task, index) => <div className="priorityRow" key={task.id}><span className="priorityIndex">{index + 1}</span><span className="priorityText">{task.title}</span><span className="priorityNode"/></div>) : <div className="emptySpace" style={{marginTop:8}}>Space held open.</div>}</div>
                </div>
              </div>

              <div className="focusInset">
                <div className="focusCell">
                  <div className="cellLabel">In focus</div>
                  <div className="cellTitle">{focusTitle}</div>
                  {activeFocus ? <><div className="focusProgress"><div className="focusTrack"><div className="focusFill" style={{width:`${focusProgress}%`}}/></div><span className="focusPct">{focusProgress}%</span></div><div className="cellMeta">{focusRemaining} min remaining</div></> : <div className="cellMeta">No focus session is active · <button className="joinButton" type="button" onClick={() => router.push('/focus')}>Start focus</button></div>}
                </div>
                <div className="focusCell"><div className="cellLabel">Next up</div><div className="cellTitle">{nextUpTitle}</div><div className="cellMeta"><SemanticNextIcon title={nextUpTitle}/><span>{nextUpMeta}</span></div></div>
                <div className="focusCell"><div className="cellLabel">Appointments</div><div className="cellTitle">{nextEvent?.title ?? 'No appointment'}</div><div className="cellMeta">{nextEvent ? <><CalendarDays size={11}/><span>{formatRange(nextEvent)}</span><button className="joinButton" type="button" onClick={() => openAppointment(nextEvent)}>Join</button><button className="moreButton" type="button" onClick={() => selectContext(nextEvent)} aria-label="Appointment options"><Ellipsis size={12}/></button></> : 'Your schedule is open.'}</div></div>
              </div>
            </section>

            <section className="timeVessel" aria-label="Today timeline">
              {(['NEXT','LATER','TONIGHT','TOMORROW'] as Bucket[]).map((bucket, bucketIndex) => {
                const rowItems = buckets[bucket];
                const copy = bucketCopy(bucket);
                const first = rowItems[0];
                const second = rowItems[1];
                const countdownTarget = first?.at ?? null;
                const countLabel = bucket === 'NEXT' ? 'Time to next' : bucket === 'LATER' ? 'Time to later' : bucket === 'TONIGHT' ? 'Leave-ready' : 'Preview time';
                let countValue = countdownTarget ? until(now, countdownTarget) : 'Open';
                if (bucket === 'TONIGHT' && countdownTarget) countValue = until(now, new Date(countdownTarget.getTime() - 30 * 60 * 1000));
                if (bucket === 'TONIGHT' && !countdownTarget) countValue = 'Not set';
                return (
                  <div className="timeBand" key={bucket}>
                    <div><div className="rowTime">{bucketTime(bucket,rowItems)}</div><div className="rowName">{bucket}</div><div className="rowCopy">{copy[0]}<br/>{copy[1]}</div></div>
                    <div>{first ? <button type="button" className="eventSlot" onClick={() => selectContext(first)}><span className={`pearl eventObject ${pearlTone(bucket,0)} ${objectShape(bucket,0)}`}/><span><span className="eventTitle">{first.title}</span><span className="eventMeta"><span>{formatRange(first)}</span><span className="tag">{tagFor(first)}</span></span></span></button> : <div className="emptySpace">Open by design.</div>}</div>
                    <div>{second ? <button type="button" className="eventSlot" onClick={() => selectContext(second)}><span className={`pearl eventObject ${pearlTone(bucket,1)} ${objectShape(bucket,1)}`}/><span><span className="eventTitle">{second.title}</span><span className="eventMeta"><span>{formatRange(second)}</span><span className="tag">{tagFor(second)}</span></span></span></button> : <div className="emptySpace">Open by design.</div>}</div>
                    <div className="countLens"><div className="countCopy"><div className="countLabel">{countLabel}</div><div className="countValue">{countValue}</div></div>{bucket === 'TONIGHT' ? <span className="pearl pearlRing countRing" aria-hidden="true"/> : bucket === 'TOMORROW' ? <span className="pearl pearlCool countPearl" aria-hidden="true"/> : null}</div>
                    {bucketIndex < 3 ? <div className="flowArrow">↑</div> : null}
                  </div>
                );
              })}
            </section>

            <footer className="footer">
              <div className="dayGroup"><button className="dayView" type="button" onClick={() => router.push('/calendar')}><CalendarDays size={11}/><span>Day view</span><ChevronDown size={10}/></button><button className="miniOptic" type="button" onClick={() => openGlow('Show me the most important shape of the rest of today.')} aria-label="Ask Glow about the day"><Sparkles size={10}/></button></div>
              <button className="replan" type="button" onClick={() => openGlow('Replan my day using my real tasks, calendar, priorities, active focus session, and current capacity. Show me the proposal before changing anything.')}><Sparkles size={11}/><span>Replan my day</span></button>
              <div className="saveTools"><span>All changes saved</span><button className="undo" type="button" onClick={() => openGlow('Undo my last reversible Glow change. Show me what will change before applying it.')}><span>Undo</span><Undo2 size={10}/></button><span className="pearl cornerPearl" aria-hidden="true"/></div>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );

  return <div ref={hostRef}>{shadow ? createPortal(body, shadow) : null}</div>;
}
