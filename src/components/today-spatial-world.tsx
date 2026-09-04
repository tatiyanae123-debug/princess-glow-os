'use client';

import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import {
  ArrowUp,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Ellipsis,
  Focus,
  GripVertical,
  LayoutGrid,
  MapPin,
  Plus,
  Route,
  Sparkles,
  Undo2,
  Users,
  X,
} from 'lucide-react';

type TaskLite = { id: string; title: string; priority: string; status: string; dueDateISO?: string | null };
type EventLite = { id: string; title: string; location?: string | null; startAtISO?: string | null; endAtISO?: string | null; allDay?: boolean };
type RoutineLite = { id: string; name: string; timeOfDay: string };
type FocusLite = { id: string; title: string; startedAtISO: string; plannedMinutes: number; entityId?: string | null; entityType?: string | null };
type Props = { tasks: TaskLite[]; events: EventLite[]; routines: RoutineLite[]; activeFocus: FocusLite | null; energy: number | null; mood: number | null; sleepHours: number | null };
type TimelineItem = { id: string; rawId: string; title: string; at: Date | null; endAt: Date | null; kind: 'event' | 'task'; meta?: string; location?: string | null; allDay?: boolean };
type Bucket = 'NEXT' | 'LATER' | 'TONIGHT' | 'TOMORROW';
type Lens = { kind: 'capacity' | 'energy' | 'priorities' } | { kind: 'event'; item: TimelineItem } | null;

const BUCKETS: Bucket[] = ['NEXT', 'LATER', 'TONIGHT', 'TOMORROW'];

const CSS = String.raw`
:host{position:fixed;inset:0;z-index:2147480000;display:block;color:#312e2b;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;background:#ebe6df}
*,*::before,*::after{box-sizing:border-box}button,input{font:inherit;color:inherit}button{appearance:none;-webkit-appearance:none}button,input{touch-action:manipulation}button:focus-visible,input:focus-visible{outline:2px solid rgba(82,92,110,.42);outline-offset:3px}
.world{height:100dvh;width:100vw;overflow:hidden;overscroll-behavior:none;position:relative;isolation:isolate;display:grid;place-items:center;padding:6px;background:radial-gradient(80% 58% at 50% -8%,rgba(255,255,255,.99),transparent 66%),radial-gradient(38% 42% at 8% 76%,rgba(214,204,194,.66),transparent 73%),radial-gradient(34% 42% at 92% 76%,rgba(255,255,255,.70),transparent 74%),linear-gradient(128deg,#faf7f2 0%,#ece6df 48%,#f8f4ef 100%)}
.world::before{content:"";position:absolute;inset:-8%;z-index:-3;background:radial-gradient(25% 19% at 56% 14%,rgba(187,218,255,.27),transparent 70%),radial-gradient(19% 18% at 67% 22%,rgba(209,176,248,.24),transparent 72%),radial-gradient(20% 16% at 79% 31%,rgba(255,193,167,.20),transparent 72%),radial-gradient(17% 16% at 34% 83%,rgba(189,231,216,.14),transparent 72%);filter:blur(22px)}
.world::after{content:"";position:absolute;inset:0;z-index:-2;pointer-events:none;background:linear-gradient(104deg,transparent 0 14%,rgba(255,255,255,.29) 16%,transparent 20% 64%,rgba(255,255,255,.18) 68%,transparent 72%),radial-gradient(58% 2.8% at 50% 94%,rgba(91,75,63,.10),transparent 72%);mix-blend-mode:screen}
.shell{position:relative;width:calc(100vw - 12px);height:calc(100dvh - 12px);max-width:1440px;max-height:1040px;overflow:hidden;padding:10px 11px 11px;border-radius:36px 40px 37px 34px / 32px 36px 40px 37px;background:linear-gradient(137deg,rgba(255,255,255,.23),rgba(255,255,255,.055) 41%,rgba(245,239,234,.10) 69%,rgba(255,255,255,.16));box-shadow:inset 1px 1px 0 rgba(255,255,255,.99),inset -1px -1px 0 rgba(121,110,101,.11),inset 0 0 0 3px rgba(255,255,255,.11),inset 0 28px 64px rgba(255,255,255,.07),0 30px 62px rgba(76,64,55,.085),0 4px 10px rgba(76,64,55,.05);perspective:1800px;transform-style:preserve-3d}
.shell::before{content:"";position:absolute;inset:1px;z-index:0;border-radius:inherit;padding:2px;background:linear-gradient(118deg,rgba(255,255,255,.98),rgba(216,234,255,.48) 19%,rgba(255,255,255,.46) 38%,rgba(216,190,248,.31) 55%,rgba(255,198,176,.27) 70%,rgba(255,239,189,.21) 80%,rgba(255,255,255,.86));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.92;pointer-events:none}
.shell::after{content:"";position:absolute;inset:7px;z-index:0;border-radius:29px 34px 31px 29px / 28px 31px 35px 32px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.34),inset 8px 0 17px rgba(255,255,255,.06),inset -7px 0 18px rgba(198,218,248,.04);pointer-events:none}
.caustic{position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(14% 8% at 28% 9%,rgba(255,255,255,.40),transparent 70%),radial-gradient(20% 9% at 69% 29%,rgba(198,224,255,.12),rgba(219,187,249,.10) 46%,rgba(255,201,176,.07) 64%,transparent 75%),radial-gradient(24% 4% at 55% 93%,rgba(255,255,255,.25),transparent 72%);filter:blur(1.2px);mix-blend-mode:screen}
.layout{position:relative;z-index:2;height:100%;min-height:0;display:grid;grid-template-columns:clamp(66px,6.8vw,94px) minmax(0,1fr);grid-template-rows:clamp(42px,5.2dvh,52px) minmax(0,1fr);gap:clamp(6px,.8dvh,9px)}
.header{grid-column:1/-1;position:relative;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 10px;min-height:0;background:linear-gradient(180deg,rgba(255,255,255,.09),rgba(255,255,255,.014));box-shadow:inset 0 1px 0 rgba(255,255,255,.74),inset 0 -1px 0 rgba(137,126,117,.07)}
.header::before,.header::after{content:"";position:absolute;left:3%;right:3%;height:1px}.header::before{top:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.95),rgba(207,228,255,.30),rgba(255,255,255,.86),transparent)}.header::after{bottom:0;background:linear-gradient(90deg,transparent,rgba(145,135,126,.08),rgba(255,255,255,.51),rgba(145,135,126,.07),transparent)}
.brand{display:flex;align-items:baseline;gap:14px;min-width:0}.brand strong{font-size:clamp(10px,.86vw,13px);font-weight:570}.batch{font-size:clamp(6.4px,.56vw,8px);color:#9b948e}.worldName{justify-self:center;font-size:clamp(6.2px,.57vw,8.2px);font-weight:500;letter-spacing:.12em;color:#5f5a55;white-space:nowrap}.askTop{justify-self:end;display:flex;align-items:center;gap:8px;border:0;background:transparent;padding:2px 0 2px 8px;min-height:38px;cursor:pointer}.askTopLabel{font-size:clamp(6.2px,.55vw,7.8px);line-height:1.15;text-align:left;color:#625d58}
.rail{grid-row:2;position:relative;min-height:0;padding:7px 4px 8px;display:flex;flex-direction:column;align-items:center;gap:clamp(5px,.8dvh,8px);border-radius:25px 30px 28px 23px / 27px 25px 31px 28px;background:linear-gradient(103deg,rgba(255,255,255,.15),rgba(255,255,255,.025) 49%,rgba(235,229,223,.08));box-shadow:inset 1px 0 0 rgba(255,255,255,.82),inset -1px 0 0 rgba(122,112,103,.08),0 16px 29px rgba(73,62,54,.04);transform:translateZ(25px)}
.rail::before{content:"";position:absolute;inset:6px 4px;border-radius:20px 25px 24px 18px / 22px 20px 27px 23px;background:linear-gradient(90deg,rgba(255,255,255,.24),rgba(255,255,255,.018) 57%,rgba(202,226,255,.08));box-shadow:inset 0 0 0 1px rgba(255,255,255,.23);pointer-events:none}.rail::after{content:"";position:absolute;top:4%;bottom:5%;right:2px;width:2px;border-radius:99px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.90) 14%,rgba(201,225,255,.34) 33%,rgba(211,183,248,.28) 51%,rgba(255,201,181,.24) 70%,rgba(255,255,255,.60) 88%,transparent)}
.railButton{position:relative;z-index:1;width:100%;min-height:clamp(48px,6.8dvh,62px);border:0;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#8a837d;font-size:clamp(6px,.54vw,7.6px);cursor:pointer}.railMount{width:clamp(28px,2.6vw,36px);height:clamp(28px,2.6vw,36px);display:grid;place-items:center;position:relative;border-radius:47% 53% 58% 42% / 51% 45% 55% 49%;background:linear-gradient(145deg,rgba(255,255,255,.15),rgba(255,255,255,.025));box-shadow:inset 1px 1px 0 rgba(255,255,255,.66),inset -1px -1px 0 rgba(117,108,101,.07);transition:transform .24s cubic-bezier(.2,.7,.2,1),opacity .2s ease,filter .2s ease}.railMount svg{stroke-width:1.03;color:#847d77;opacity:.80}.railButton:not(.active) .railMount{opacity:.62;filter:saturate(.72)}.railButton:hover .railMount,.railButton:active .railMount{opacity:1;transform:translateY(-1px) translateZ(7px) scale(.985);filter:saturate(1)}.railButton.active{color:#45403c}.railButton.active .railMount{width:clamp(37px,3.3vw,46px);height:clamp(37px,3.3vw,46px);background:transparent;box-shadow:none;opacity:1}.railSpacer{flex:1}.addPearl{position:relative;z-index:1;width:clamp(38px,3.4vw,47px);height:clamp(38px,3.4vw,47px);border:0;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:radial-gradient(circle at 29% 22%,#fff 0 9%,rgba(255,255,255,.91) 17%,rgba(203,227,255,.48) 39%,rgba(209,184,248,.37) 58%,rgba(255,204,179,.32) 73%,rgba(255,246,205,.23) 82%,rgba(255,255,255,.65) 92%,rgba(143,138,144,.12));box-shadow:inset -8px -10px 15px rgba(111,112,124,.13),inset 5px 5px 12px rgba(255,255,255,.98),0 8px 14px rgba(74,62,54,.12)}
.pearl,.object{position:relative;display:inline-block;background:radial-gradient(circle at 29% 22%,#fff 0 9%,rgba(255,255,255,.89) 17%,rgba(207,228,255,.46) 38%,rgba(218,195,248,.33) 57%,rgba(255,207,184,.28) 72%,rgba(255,244,199,.20) 80%,rgba(255,255,255,.66) 91%,rgba(137,134,141,.13));box-shadow:inset -8px -10px 15px rgba(112,114,129,.14),inset 5px 5px 12px rgba(255,255,255,.98),0 8px 15px rgba(75,63,55,.13),0 1px 1px rgba(255,255,255,.93)}.pearl{border-radius:50%}.pearl::before,.object::before{content:"";position:absolute;inset:6%;border-radius:inherit;box-shadow:inset 1px 1px 0 rgba(255,255,255,.96),inset -1px -1px 0 rgba(128,120,128,.12)}.pearl::after,.object::after{content:"";position:absolute;left:22%;top:12%;width:35%;height:18%;border-radius:50%;background:rgba(255,255,255,.95);filter:blur(.25px)}.pearlTop{width:clamp(30px,2.6vw,37px);height:clamp(30px,2.6vw,37px);background:radial-gradient(circle at 30% 22%,#fff 0 9%,rgba(255,255,255,.86) 17%,rgba(182,217,255,.51) 37%,rgba(190,157,246,.51) 55%,rgba(255,184,174,.39) 70%,rgba(255,229,168,.32) 81%,rgba(255,255,255,.66) 91%)}.pearlToday{width:clamp(27px,2.4vw,34px);height:clamp(27px,2.4vw,34px)}.pearlCool{background:radial-gradient(circle at 29% 22%,#fff 0 9%,rgba(255,255,255,.88) 17%,rgba(184,218,255,.53) 42%,rgba(211,201,248,.32) 64%,rgba(255,255,255,.67) 90%)}.pearlViolet{background:radial-gradient(circle at 29% 22%,#fff 0 9%,rgba(255,255,255,.86) 17%,rgba(188,216,255,.43) 37%,rgba(169,128,245,.61) 59%,rgba(232,194,255,.48) 76%,rgba(255,255,255,.64) 91%)}.pearlPeach{background:radial-gradient(circle at 29% 22%,#fff 0 9%,rgba(255,255,255,.88) 17%,rgba(255,218,176,.54) 40%,rgba(255,150,113,.57) 62%,rgba(255,226,200,.42) 80%,rgba(255,255,255,.66) 92%)}
.scene{grid-column:2;grid-row:2;min-width:0;min-height:0;display:grid;grid-template-rows:minmax(260px,46%) minmax(190px,1fr) clamp(38px,5.1dvh,48px);gap:clamp(6px,.75dvh,8px);transform-style:preserve-3d}
.chamber{position:relative;min-width:0;min-height:0;overflow:hidden;padding:clamp(11px,1.2dvh,16px) clamp(12px,1.2vw,18px) clamp(8px,1dvh,12px);display:grid;grid-template-columns:minmax(118px,.40fr) minmax(180px,.72fr) minmax(330px,1.38fr);grid-template-rows:minmax(0,1fr) clamp(68px,9dvh,84px);gap:clamp(8px,.8vw,12px);border-radius:32px 37px 31px 38px / 31px 34px 37px 39px;background:linear-gradient(136deg,rgba(255,255,255,.21),rgba(255,255,255,.048) 42%,rgba(247,241,235,.075) 68%,rgba(255,255,255,.14));box-shadow:inset 1px 1px 0 rgba(255,255,255,.93),inset -1px -1px 0 rgba(143,130,119,.09),inset 0 17px 40px rgba(255,255,255,.055),0 22px 43px rgba(81,69,60,.06),0 3px 7px rgba(81,69,60,.04);transform:translateZ(12px)}
.chamber::before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(103deg,transparent 0 20%,rgba(255,255,255,.35) 23%,transparent 27% 61%,rgba(198,224,255,.12) 64%,rgba(212,184,247,.11) 67%,rgba(255,205,184,.09) 70%,transparent 73%),radial-gradient(54% 28% at 45% 104%,rgba(124,104,88,.07),transparent 72%);mix-blend-mode:screen}.chamber::after{content:"";position:absolute;left:3%;right:3%;bottom:calc(clamp(68px,9dvh,84px) + 3px);height:1px;background:linear-gradient(90deg,transparent,rgba(155,145,135,.12) 18%,rgba(255,255,255,.72) 50%,rgba(155,145,135,.10) 82%,transparent);pointer-events:none}
.nowZone{position:relative;z-index:3;padding:3px 0 0 3px;min-width:0}.clock{font-size:clamp(7.5px,.7vw,10px);color:#77706a}.now{margin-top:6px;font-size:clamp(28px,2.65vw,39px);line-height:.9;font-weight:350;letter-spacing:-.055em}.flow{margin-top:10px;font-size:clamp(9px,.85vw,12px);font-weight:440}.flowNote{margin-top:4px;font-size:clamp(6.6px,.62vw,8.6px);color:#88817a}.protected{margin-top:clamp(11px,1.4dvh,17px);position:relative;border:0;background:transparent;padding:8px 12px 8px 16px;display:inline-flex;align-items:center;gap:8px;font-size:clamp(6.5px,.58vw,8px);cursor:pointer}.protected::before{content:"";position:absolute;inset:1px 0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.24),rgba(255,255,255,.05));box-shadow:inset 0 1px 0 rgba(255,255,255,.77),inset 0 -1px 0 rgba(126,116,108,.07),0 5px 13px rgba(72,61,53,.04);z-index:-1}.protectedDot{width:6px;height:6px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fffbd9,#dce69b 55%,#9fab5f);box-shadow:0 0 8px rgba(190,204,104,.32)}
.matter{position:relative;z-index:2;display:grid;place-items:center;min-width:0;min-height:0;filter:drop-shadow(0 15px 15px rgba(88,73,62,.12))}.matterGround{position:absolute;left:10%;right:9%;bottom:9%;height:12%;border-radius:50%;background:radial-gradient(ellipse,rgba(103,86,74,.13),rgba(103,86,74,.035) 49%,transparent 75%);filter:blur(8px)}.sculpt{position:relative;width:min(100%,310px);aspect-ratio:1.46;border-radius:45% 55% 59% 41% / 38% 34% 66% 62%;transform:rotate(-5deg);background:radial-gradient(67% 75% at 32% 25%,rgba(255,255,255,.96) 0 7%,rgba(255,255,255,.38) 22%,rgba(204,226,255,.18) 41%,rgba(218,190,248,.15) 57%,rgba(255,207,183,.12) 73%,rgba(255,255,255,.35) 88%,rgba(145,137,139,.09));box-shadow:inset 15px 13px 24px rgba(255,255,255,.67),inset -18px -16px 30px rgba(124,126,142,.11),0 1px 0 rgba(255,255,255,.92)}.sculpt::before{content:"";position:absolute;inset:-1.5%;border-radius:inherit;padding:2px;background:linear-gradient(115deg,rgba(255,255,255,.98),rgba(198,226,255,.54) 28%,rgba(190,159,246,.42) 53%,rgba(255,181,160,.38) 70%,rgba(255,233,170,.30) 82%,rgba(255,255,255,.86));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.88}.cavity{position:absolute;right:11%;top:12%;width:42%;height:34%;border-radius:48% 52% 57% 43% / 55% 44% 56% 45%;background:radial-gradient(ellipse at 40% 45%,rgba(132,142,166,.11),rgba(255,255,255,.40) 48%,rgba(255,255,255,.08) 67%,transparent 70%);box-shadow:inset 8px 8px 13px rgba(111,116,133,.08),inset -4px -4px 8px rgba(255,255,255,.66);transform:rotate(8deg)}.ribbon{position:absolute;border-radius:999px;mix-blend-mode:screen}.r1{left:9%;top:42%;width:76%;height:13%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.85) 31%,rgba(191,223,255,.39) 49%,rgba(195,154,246,.30) 61%,rgba(255,186,163,.22) 75%,transparent);transform:rotate(17deg)}.r2{left:22%;top:64%;width:65%;height:10%;background:linear-gradient(90deg,transparent,rgba(196,226,255,.28),rgba(255,255,255,.76) 45%,rgba(220,177,247,.25) 66%,rgba(255,218,174,.17),transparent);transform:rotate(-19deg)}.r3{left:48%;top:19%;width:14%;height:62%;background:linear-gradient(180deg,transparent,rgba(255,255,255,.66) 39%,rgba(198,172,247,.22) 62%,transparent);transform:rotate(15deg)}
.intel{position:relative;z-index:4;min-width:0;min-height:0;display:grid;grid-template-rows:auto minmax(0,1fr);gap:8px}.what{font-size:clamp(7.4px,.68vw,9.4px);font-weight:560}.intent{position:relative;margin-top:6px;height:clamp(40px,5dvh,48px);display:grid;grid-template-columns:minmax(0,1fr) 42px;align-items:center}.intent::before{content:"";position:absolute;inset:0;border-radius:16px 20px 15px 21px / 17px 15px 21px 18px;background:linear-gradient(150deg,rgba(255,255,255,.34),rgba(255,255,255,.075));box-shadow:inset 1px 1px 0 rgba(255,255,255,.82),inset -1px -1px 0 rgba(132,122,114,.07),0 8px 17px rgba(75,64,56,.035)}.intent input{position:relative;z-index:1;height:100%;min-width:0;border:0;outline:none;background:transparent;padding:0 13px;font-size:clamp(7.4px,.68vw,9.5px)}.intent input::placeholder{color:#a59d96}.send{position:relative;z-index:1;justify-self:center;width:30px;height:30px;border:0;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:radial-gradient(circle at 34% 27%,#fff,rgba(233,241,255,.72) 29%,rgba(195,214,243,.34) 60%,rgba(255,255,255,.57));box-shadow:inset 3px 3px 8px rgba(255,255,255,.96),inset -4px -5px 8px rgba(126,127,137,.08),0 6px 10px rgba(78,67,59,.09)}
.intelTray{min-width:0;display:grid;grid-template-columns:.9fr .9fr 1.45fr;gap:6px;align-items:stretch}.intelCard{position:relative;min-width:0;border:0;text-align:left;padding:10px 11px;border-radius:18px 15px 20px 16px / 17px 20px 16px 19px;background:linear-gradient(145deg,rgba(255,255,255,.24),rgba(255,255,255,.05));box-shadow:inset 1px 1px 0 rgba(255,255,255,.77),inset -1px -1px 0 rgba(132,122,114,.06),0 7px 15px rgba(75,64,56,.025);cursor:pointer;overflow:hidden;transition:transform .22s cubic-bezier(.2,.7,.2,1),box-shadow .22s ease}.intelCard:hover,.intelCard:active{transform:translateY(-2px) translateZ(6px);box-shadow:inset 1px 1px 0 rgba(255,255,255,.92),inset -1px -1px 0 rgba(132,122,114,.05),0 10px 20px rgba(75,64,56,.055)}.intelLabel{font-size:clamp(5.8px,.52vw,7.2px);color:#69625c}.intelValue{margin-top:5px;font-size:clamp(7px,.66vw,9.2px);line-height:1.2;white-space:normal}.energyPearl{position:absolute;right:9px;bottom:8px;width:36px;height:36px}.capacityWave{position:absolute;left:14px;right:10px;bottom:10px;height:15px}.capacityWave::before{content:"";position:absolute;left:4%;right:1%;top:7px;height:1px;background:linear-gradient(90deg,transparent,rgba(113,108,104,.37),transparent);transform:rotate(-5deg)}.capacityWave::after{content:"";position:absolute;right:13%;top:0;width:48%;height:10px;border:1px solid rgba(131,128,125,.18);border-radius:58% 42% 53% 47%;transform:rotate(-7deg)}.priority{display:grid;grid-template-columns:12px minmax(0,1fr) 10px;align-items:center;gap:5px;margin-top:4px;font-size:clamp(5.6px,.50vw,7px)}.priority b{font-weight:480;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.priorityDot{width:8px;height:8px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(121,114,108,.24),inset 2px 2px 4px rgba(255,255,255,.8)}
.focusInset{grid-column:1/-1;position:relative;z-index:3;min-height:0;display:grid;grid-template-columns:1.25fr 1fr 1.12fr;border-radius:18px 22px 17px 20px / 18px 17px 21px 20px;background:linear-gradient(180deg,rgba(208,199,191,.065),rgba(255,255,255,.13));box-shadow:inset 0 10px 20px rgba(110,94,81,.036),inset 0 1px 0 rgba(255,255,255,.65),inset 0 -1px 0 rgba(139,127,118,.06)}.focusCell{position:relative;padding:8px clamp(11px,1.15vw,17px);display:flex;flex-direction:column;justify-content:center;min-width:0;border:0;background:transparent;text-align:left;cursor:pointer}.focusCell+.focusCell::before{content:"";position:absolute;left:0;top:15%;bottom:15%;width:1px;background:linear-gradient(180deg,transparent,rgba(149,140,131,.13),rgba(255,255,255,.57),rgba(149,140,131,.10),transparent)}.cellLabel{font-size:clamp(5.7px,.51vw,7.1px);color:#756e68}.cellTitle{margin-top:4px;font-size:clamp(8.2px,.78vw,10.8px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cellMeta{margin-top:5px;display:flex;align-items:center;gap:6px;min-height:14px;font-size:clamp(5.5px,.49vw,6.9px);color:#817a74;white-space:nowrap;overflow:hidden}.focusTrack{position:relative;width:min(175px,62%);height:4px;border-radius:99px;background:rgba(203,202,198,.34);overflow:hidden}.focusFill{height:100%;border-radius:inherit;background:linear-gradient(90deg,rgba(255,255,255,.78),rgba(222,226,231,.84),rgba(242,209,146,.78));box-shadow:0 0 6px rgba(244,215,157,.25)}.microBtn{border:0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,.05));box-shadow:inset 0 1px 0 rgba(255,255,255,.74),0 4px 9px rgba(80,68,59,.035);padding:4px 9px;font-size:inherit;cursor:pointer}
.riverViewport{position:relative;min-width:0;min-height:0;overflow:hidden;touch-action:none;overscroll-behavior:none;border-radius:26px 31px 28px 24px / 27px 25px 31px 28px;background:linear-gradient(180deg,rgba(255,255,255,.045),rgba(255,255,255,.015));box-shadow:inset 0 1px 0 rgba(255,255,255,.48);perspective:1500px;transform-style:preserve-3d}.riverViewport::before{content:"";position:absolute;left:8px;top:5%;bottom:5%;width:2px;border-radius:99px;background:linear-gradient(180deg,rgba(255,255,255,.89),rgba(198,224,255,.31) 30%,rgba(209,181,246,.25) 53%,rgba(255,200,180,.23) 74%,rgba(255,255,255,.64));box-shadow:1px 0 0 rgba(133,123,115,.05)}.riverViewport::after{content:"Drag or swipe through time";position:absolute;right:13px;top:8px;z-index:8;font-size:5.8px;letter-spacing:.07em;color:#9a928a;pointer-events:none}.timeBand{position:absolute;left:17px;right:8px;top:8px;height:clamp(56px,7.1dvh,66px);min-width:0;display:grid;grid-template-columns:minmax(105px,.48fr) minmax(0,1.6fr) minmax(86px,.45fr);align-items:center;gap:clamp(7px,.8vw,11px);padding:7px clamp(10px,1vw,15px);border:0;text-align:left;border-radius:24px 28px 23px 27px / 21px 24px 28px 25px;background:linear-gradient(96deg,rgba(255,255,255,.20),rgba(255,255,255,.055) 44%,rgba(247,242,237,.075));box-shadow:inset 1px 1px 0 rgba(255,255,255,.75),inset -1px -1px 0 rgba(132,121,112,.065),inset 0 -7px 13px rgba(91,76,64,.018),0 7px 14px rgba(77,65,56,.025);transform-origin:50% 50%;transition:transform 460ms cubic-bezier(.16,.75,.2,1),opacity 360ms ease,filter 360ms ease,box-shadow 300ms ease;cursor:pointer;will-change:transform}.timeBand.active{box-shadow:inset 1px 1px 0 rgba(255,255,255,.91),inset -1px -1px 0 rgba(132,121,112,.05),0 14px 27px rgba(77,65,56,.07);filter:saturate(1.06)}.timeBand::before{content:"";position:absolute;left:-15px;top:50%;width:15px;height:2px;background:linear-gradient(90deg,rgba(128,118,109,.24),rgba(255,255,255,.84))}.timeBand::after{content:"";position:absolute;left:-4px;top:calc(50% - 4px);width:8px;height:8px;border-radius:50%;background:radial-gradient(circle at 34% 28%,#fff,rgba(205,225,255,.62) 48%,rgba(170,158,185,.18));box-shadow:0 2px 5px rgba(80,68,60,.09)}.rowTime{font-size:clamp(5.3px,.48vw,6.7px);color:#716a64}.rowName{margin-top:1px;font-size:clamp(14px,1.25vw,18px);line-height:.94;letter-spacing:-.04em;font-weight:360}.rowCopy{margin-top:2px;font-size:clamp(5.2px,.46vw,6.5px);line-height:1.18;color:#8c847d}.bandEvents{min-width:0;display:flex;gap:7px;overflow-x:auto;overscroll-behavior-inline:contain;scroll-snap-type:x proximity;scrollbar-width:none;touch-action:pan-x}.bandEvents::-webkit-scrollbar{display:none}.eventCard{position:relative;flex:1 1 0;min-width:min(180px,45%);max-width:270px;height:46px;border:0;background:transparent;display:grid;grid-template-columns:36px minmax(0,1fr);align-items:center;gap:7px;text-align:left;padding:0;cursor:grab;scroll-snap-align:start}.eventCard:active{cursor:grabbing}.eventObject{width:31px;height:31px;justify-self:center;border-radius:46% 54% 57% 43% / 55% 44% 56% 45%;transition:transform .22s cubic-bezier(.2,.7,.2,1)}.eventCard:hover .eventObject,.eventCard:active .eventObject{transform:translateY(-2px) scale(1.03)}.eventTitle{display:block;font-size:clamp(6.5px,.62vw,8.6px);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eventMeta{display:block;margin-top:2px;font-size:clamp(5.2px,.46vw,6.4px);color:#847c75;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tag{margin-left:5px;letter-spacing:.05em;color:#9b938c}.empty{font-size:clamp(5.8px,.52vw,7.2px);color:#9a928b}.countLens{justify-self:end;min-width:82px;padding:7px 9px;position:relative;border-radius:16px 13px 18px 14px;background:linear-gradient(145deg,rgba(255,255,255,.19),rgba(255,255,255,.035));box-shadow:inset 1px 1px 0 rgba(255,255,255,.62),inset -1px -1px 0 rgba(130,120,112,.05)}.countLabel{font-size:clamp(4.9px,.43vw,6px);color:#716a64}.countValue{margin-top:3px;font-size:clamp(6.9px,.64vw,8.8px)}.riverDots{position:absolute;right:10px;bottom:8px;z-index:9;display:flex;gap:4px}.riverDot{width:18px;height:18px;border:0;border-radius:50%;background:transparent;display:grid;place-items:center;cursor:pointer}.riverDot::after{content:"";width:5px;height:5px;border-radius:50%;background:rgba(142,134,128,.28);transition:transform .2s ease,background .2s ease}.riverDot.active::after{transform:scale(1.45);background:radial-gradient(circle,#fff,rgba(181,208,244,.74) 58%,rgba(187,153,232,.42))}
.footer{min-width:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 5px}.dayView,.replan,.undo{position:relative;border:0;background:transparent;min-height:34px;cursor:pointer}.dayView{justify-self:start;display:flex;align-items:center;gap:8px;padding:7px 12px;border-radius:999px}.dayView::before,.replan::before,.undo::before{content:"";position:absolute;inset:1px 0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,.055));box-shadow:inset 0 1px 0 rgba(255,255,255,.79),inset 0 -1px 0 rgba(126,116,108,.06),0 6px 13px rgba(79,68,61,.035);z-index:-1}.replan{justify-self:center;min-width:clamp(170px,18vw,225px);display:flex;align-items:center;justify-content:center;gap:8px;padding:8px 17px}.footerRight{justify-self:end;display:flex;align-items:center;gap:8px}.saved{font-size:clamp(5.1px,.45vw,6.4px);color:#948c85}.undo{display:flex;align-items:center;gap:6px;padding:7px 11px}.cornerPearl{width:34px;height:34px;margin-left:2px}
.lensBackdrop{position:absolute;inset:0;z-index:40;display:grid;place-items:center;padding:18px;background:radial-gradient(70% 70% at 50% 50%,rgba(239,235,232,.18),rgba(220,215,211,.32));backdrop-filter:blur(8px) saturate(108%);-webkit-backdrop-filter:blur(8px) saturate(108%)}.lens{width:min(560px,92%);max-height:86%;overflow:auto;overscroll-behavior:contain;padding:18px;border-radius:28px 33px 26px 31px / 27px 29px 33px 30px;background:linear-gradient(145deg,rgba(255,255,255,.61),rgba(248,244,240,.31));box-shadow:inset 1px 1px 0 rgba(255,255,255,.94),inset -1px -1px 0 rgba(126,116,108,.08),0 27px 65px rgba(76,64,55,.14);scrollbar-width:none}.lens::-webkit-scrollbar{display:none}.lensHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.lensKicker{font-size:6.5px;letter-spacing:.12em;color:#8f8780;text-transform:uppercase}.lensTitle{margin-top:4px;font-size:20px;font-weight:390;letter-spacing:-.03em}.closeLens{width:34px;height:34px;border:0;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.26);box-shadow:inset 0 1px 0 rgba(255,255,255,.76);cursor:pointer}.lensCopy{margin-top:10px;font-size:8px;line-height:1.5;color:#746d67}.lensRows{margin-top:14px;display:grid;gap:7px}.lensRow{display:grid;grid-template-columns:28px minmax(0,1fr) auto;align-items:center;gap:8px;padding:10px;border-radius:15px;background:rgba(255,255,255,.20);box-shadow:inset 0 1px 0 rgba(255,255,255,.55)}.lensRow strong{font-size:8px;font-weight:520}.lensRow small{display:block;margin-top:2px;font-size:6.5px;color:#8b837c}.lensActions{margin-top:15px;display:flex;flex-wrap:wrap;gap:7px}.lensAction{border:0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.43),rgba(255,255,255,.14));box-shadow:inset 0 1px 0 rgba(255,255,255,.84),0 5px 11px rgba(76,64,55,.04);padding:9px 13px;font-size:7px;cursor:pointer}.lensAction.primary{background:linear-gradient(135deg,rgba(218,230,249,.58),rgba(225,207,246,.44),rgba(255,222,206,.36));color:#49434c}.moveGrid{margin-top:12px;display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.moveGrid button{min-height:43px;border:0;border-radius:14px;background:rgba(255,255,255,.21);box-shadow:inset 0 1px 0 rgba(255,255,255,.64);font-size:6.5px;cursor:pointer}
@media(max-width:1120px){.layout{grid-template-columns:66px minmax(0,1fr)}.railButton{min-height:48px}.chamber{grid-template-columns:minmax(104px,.34fr) minmax(165px,.60fr) minmax(0,1.36fr);gap:7px;padding-left:10px;padding-right:10px}.sculpt{width:min(100%,245px)}.intelTray{display:grid;grid-auto-flow:column;grid-template-columns:none;grid-auto-columns:minmax(145px,46%);overflow-x:auto;overscroll-behavior-inline:contain;scroll-snap-type:x mandatory;scrollbar-width:none;touch-action:pan-x;padding:1px 1px 3px}.intelTray::-webkit-scrollbar{display:none}.intelCard{scroll-snap-align:start;min-height:77px}.timeBand{grid-template-columns:minmax(94px,.43fr) minmax(0,1.57fr) minmax(78px,.42fr);padding-left:9px;padding-right:9px}.eventCard{min-width:190px}.worldName{letter-spacing:.08em}}
@media(max-width:820px){.world{padding:4px}.shell{width:calc(100vw - 8px);height:calc(100dvh - 8px);padding:7px;border-radius:27px}.layout{grid-template-columns:56px minmax(0,1fr);grid-template-rows:40px minmax(0,1fr);gap:5px}.brand{gap:7px}.batch{display:none}.worldName{font-size:5.5px}.askTopLabel{display:none}.rail{border-radius:20px;padding:4px 2px}.railButton{min-height:43px;font-size:5.4px}.railMount{width:27px;height:27px}.railButton.active .railMount{width:34px;height:34px}.addPearl{width:37px;height:37px}.scene{grid-template-rows:minmax(245px,47%) minmax(180px,1fr) 38px;gap:5px}.chamber{grid-template-columns:minmax(85px,.30fr) minmax(118px,.46fr) minmax(0,1.24fr);grid-template-rows:minmax(0,1fr) 62px;padding:8px;gap:5px}.now{font-size:25px}.protected{padding-left:10px;padding-right:9px}.sculpt{width:min(100%,185px)}.intel{gap:5px}.intent{height:38px}.intelTray{grid-auto-columns:minmax(132px,58%);gap:5px}.intelCard{min-height:70px;padding:8px}.energyPearl{width:30px;height:30px}.focusInset{grid-template-columns:1.1fr 1fr 1fr}.focusCell{padding:6px 8px}.cellMeta{font-size:5.1px}.riverViewport::after{display:none}.timeBand{height:55px;grid-template-columns:82px minmax(0,1fr) 68px;gap:5px;padding:5px 7px}.rowName{font-size:14px}.eventCard{min-width:175px;height:42px;grid-template-columns:30px minmax(0,1fr)}.eventObject{width:27px;height:27px}.countLens{min-width:65px;padding:5px 6px}.footer{padding:0}.saved{display:none}.dayView{padding:6px 8px}.replan{min-width:145px;padding:7px 10px}.undo{padding:6px 8px}.cornerPearl{width:29px;height:29px}.moveGrid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:640px){.world{padding:0}.shell{width:100vw;height:100dvh;border-radius:0;padding:6px}.layout{grid-template-columns:1fr;grid-template-rows:38px minmax(0,1fr)}.rail{position:absolute;left:7px;right:7px;bottom:6px;z-index:30;height:57px;display:grid;grid-template-columns:repeat(6,1fr) 42px;border-radius:22px;background:rgba(239,234,228,.84);backdrop-filter:blur(9px)}.rail::before,.rail::after{display:none}.railButton{min-height:47px;font-size:0}.railMount,.railButton.active .railMount{width:35px;height:35px}.railSpacer{display:none}.addPearl{width:36px;height:36px}.scene{grid-column:1;grid-row:2;padding-bottom:62px;grid-template-rows:minmax(300px,52%) minmax(175px,1fr) 36px}.chamber{grid-template-columns:90px minmax(0,1fr);grid-template-rows:1fr auto 58px;overflow:hidden}.nowZone{grid-column:1}.matter{position:absolute;left:55px;top:23px;width:170px;height:150px;opacity:.78;pointer-events:none}.intel{grid-column:2}.intelTray{grid-auto-columns:minmax(128px,76%)}.focusInset{grid-column:1/-1;grid-row:3;grid-template-columns:1fr 1fr}.focusCell:nth-child(3){display:none}.riverViewport{border-radius:20px}.timeBand{left:13px;right:4px;grid-template-columns:72px minmax(0,1fr) 60px}.bandEvents{gap:4px}.eventCard{min-width:160px}.footerRight .undo{display:none}.worldName{display:none}.lensBackdrop{padding:10px}.lens{width:96%;max-height:88%;padding:14px}}
@media(max-height:680px) and (min-width:641px){.scene{grid-template-rows:minmax(225px,45%) minmax(165px,1fr) 34px}.chamber{grid-template-rows:minmax(0,1fr) 58px}.sculpt{width:min(100%,210px)}.timeBand{height:51px}.railButton{min-height:42px}.footer{font-size:6px}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.timeBand{transition:none!important}.railMount{transition:none!important}}
`;

function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function tomorrowFrom(date: Date) { const next = new Date(date); next.setDate(next.getDate() + 1); return next; }
function formatClock(date: Date) { return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' }).format(date); }
function formatRange(item: TimelineItem) {
  if (item.allDay) return 'All day';
  if (!item.at) return item.meta ?? '';
  if (item.endAt && item.endAt > item.at) return `${formatClock(item.at)} – ${formatClock(item.endAt)}`;
  return formatClock(item.at);
}
function durationMinutes(item: TimelineItem) { if (!item.at || !item.endAt || item.endAt <= item.at) return null; return Math.max(1, Math.round((item.endAt.getTime() - item.at.getTime()) / 60000)); }
function until(from: Date, to: Date | null) { if (!to) return 'Open'; const mins = Math.max(0, Math.round((to.getTime() - from.getTime()) / 60000)); if (mins < 60) return `${mins} min`; return `${Math.floor(mins / 60)}h ${String(mins % 60).padStart(2, '0')}m`; }
function priorityWeight(priority: string) { return priority === 'urgent' ? 4 : priority === 'high' ? 3 : priority === 'medium' ? 2 : 1; }
function energyLabel(energy: number | null, sleepHours: number | null) { if (energy === null) return sleepHours !== null && sleepHours < 6 ? 'Low sleep · check in' : 'Not checked in'; if (energy >= 8) return 'Clear · Strong'; if (energy >= 6) return 'Clear · Steady'; if (energy >= 4) return 'Gentle · Steady'; return 'Low · Protect'; }
function capacityLabel(energy: number | null) { if (energy === null) return 'Check in first'; if (energy >= 8) return 'High focus'; if (energy >= 6) return 'Steady focus'; if (energy >= 4) return 'Moderate'; return 'Low load'; }
function startOfHour(date: Date, hour: number) { const value = new Date(date); value.setHours(hour, 0, 0, 0); return value; }
function bucketCopy(bucket: Bucket) { if (bucket === 'NEXT') return ['Build and move', 'Protect your next hour.']; if (bucket === 'LATER') return ['Collaborate and create', 'Afternoon momentum.']; if (bucket === 'TONIGHT') return ['Unwind and reset', 'Close the day well.']; return ['Preview your tomorrow', 'So today can flow.']; }
function bucketTone(bucket: Bucket, index: number) { if (bucket === 'TONIGHT' && index === 0) return 'pearlPeach'; if (bucket === 'LATER' && index === 0) return 'pearlViolet'; if (bucket === 'TONIGHT' && index === 1) return 'pearlViolet'; return 'pearlCool'; }
function isUrl(value?: string | null) { return Boolean(value && /^https?:\/\//i.test(value.trim())); }

export function TodaySpatialWorld({ tasks, events, routines, activeFocus, energy, mood, sleepHours }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const riverRef = useRef<HTMLDivElement | null>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);
  const dragStartY = useRef<number | null>(null);
  const lastWheel = useRef(0);
  const longPress = useRef<number | null>(null);
  const draggingItem = useRef<TimelineItem | null>(null);
  const [shadow, setShadow] = useState<ShadowRoot | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [intent, setIntent] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [lens, setLens] = useState<Lens>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    const root = hostRef.current.shadowRoot ?? hostRef.current.attachShadow({ mode: 'open' });
    shadowRef.current = root;
    setShadow(root);
  }, []);

  useEffect(() => {
    const htmlOverflow = document.documentElement.style.overflow;
    const bodyOverflow = document.body.style.overflow;
    const bodyOverscroll = document.body.style.overscrollBehavior;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.overscrollBehavior = 'none';
    return () => {
      document.documentElement.style.overflow = htmlOverflow;
      document.body.style.overflow = bodyOverflow;
      document.body.style.overscrollBehavior = bodyOverscroll;
    };
  }, []);

  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 15000); return () => window.clearInterval(timer); }, []);

  const rankedTasks = useMemo(() => [...tasks].sort((a, b) => priorityWeight(b.priority) - priorityWeight(a.priority)), [tasks]);
  const topThree = rankedTasks.slice(0, 3);
  const activeTask = activeFocus ? rankedTasks.find((task) => task.id === activeFocus.entityId) ?? rankedTasks[0] ?? null : rankedTasks[0] ?? null;

  const items = useMemo<TimelineItem[]>(() => {
    const eventItems = events.flatMap((event) => {
      const at = event.startAtISO ? new Date(event.startAtISO) : null;
      const endAt = event.endAtISO ? new Date(event.endAtISO) : null;
      if (at && Number.isNaN(at.getTime())) return [];
      return [{ id: `event-${event.id}`, rawId: event.id, title: event.title, at, endAt: endAt && !Number.isNaN(endAt.getTime()) ? endAt : null, kind: 'event' as const, meta: event.location || 'Calendar', location: event.location, allDay: event.allDay }];
    });
    const taskItems = tasks.flatMap((task) => {
      if (!task.dueDateISO) return [];
      const at = new Date(task.dueDateISO);
      if (Number.isNaN(at.getTime())) return [];
      return [{ id: `task-${task.id}`, rawId: task.id, title: task.title, at, endAt: null, kind: 'task' as const, meta: task.priority }];
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
    const next = [...timed.filter((item) => item.at && item.at < nextCutoff), ...allDay].slice(0, 3);
    const usedNext = new Set(next.map((item) => item.id));
    const later = timed.filter((item) => item.at && item.at >= nextCutoff && item.at < eveningStart && !usedNext.has(item.id)).slice(0, 3);
    const used = new Set([...next, ...later].map((item) => item.id));
    const tonight = timed.filter((item) => item.at && item.at >= eveningStart && !used.has(item.id)).slice(0, 3);
    const tomorrowItems = items.filter((item) => item.at && sameDay(item.at, tomorrow)).slice(0, 3);
    return { NEXT: next, LATER: later, TONIGHT: tonight, TOMORROW: tomorrowItems };
  }, [items, now]);

  const nextEvent = items.find((item) => item.kind === 'event' && item.at && item.at >= now && !item.allDay) ?? null;
  const focusElapsed = activeFocus ? Math.max(0, Math.round((now.getTime() - new Date(activeFocus.startedAtISO).getTime()) / 60000)) : 0;
  const focusPlanned = Math.max(1, activeFocus?.plannedMinutes ?? 25);
  const focusPct = activeFocus ? Math.max(0, Math.min(100, Math.round((focusElapsed / focusPlanned) * 100))) : 0;
  const focusRemaining = activeFocus ? Math.max(0, focusPlanned - focusElapsed) : null;

  function openGlow(prefill?: string) { document.dispatchEvent(new CustomEvent('glow:open', { detail: { prefill } })); }
  function navigate(path: string) { document.dispatchEvent(new CustomEvent('glow:navigate', { detail: { path } })); }
  function submitIntent() { const value = intent.trim(); openGlow(value || undefined); setIntent(''); }
  function selectContext(item: TimelineItem) { document.dispatchEvent(new CustomEvent('glow:context', { detail: { type: item.kind, label: item.title, id: item.rawId, route: '/today' } })); }
  function focusItem(item: TimelineItem) { selectContext(item); setLens({ kind: 'event', item }); }
  function queueMove(item: TimelineItem, bucket: Bucket) {
    selectContext(item);
    openGlow(`Move ${item.title} to ${bucket.toLowerCase()} in my Today flow. Prepare the exact change as a proposal. Do not change anything until I approve.`);
    setLens(null);
  }
  function stepTime(delta: number) { setActiveIndex((index) => Math.max(0, Math.min(BUCKETS.length - 1, index + delta))); }
  function bucketTime(bucket: Bucket, list: TimelineItem[]) { const first = list.find((item) => item.at && !item.allDay)?.at; return first ? formatClock(first) : bucket === 'TOMORROW' ? 'Tomorrow' : 'Open'; }
  function countdown(bucket: Bucket, list: TimelineItem[]) {
    const first = list.find((item) => item.at && !item.allDay)?.at ?? null;
    if (bucket === 'TONIGHT' && first) return until(now, new Date(first.getTime() - 30 * 60000));
    return first ? until(now, first) : 'Open';
  }

  useEffect(() => {
    const node = riverRef.current;
    if (!node) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const stamp = Date.now();
      if (stamp - lastWheel.current < 330 || Math.abs(event.deltaY) < 5) return;
      lastWheel.current = stamp;
      stepTime(event.deltaY > 0 ? 1 : -1);
    };
    node.addEventListener('wheel', wheel, { passive: false });
    return () => node.removeEventListener('wheel', wheel);
  }, []);

  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    dragStartY.current = event.clientY;
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function pointerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (dragStartY.current == null) return;
    const delta = event.clientY - dragStartY.current;
    dragStartY.current = null;
    if (Math.abs(delta) > 32) stepTime(delta < 0 ? 1 : -1);
  }
  function beginHold(item: TimelineItem) {
    if (longPress.current) window.clearTimeout(longPress.current);
    longPress.current = window.setTimeout(() => focusItem(item), 520);
  }
  function endHold() { if (longPress.current) window.clearTimeout(longPress.current); longPress.current = null; }

  const energyText = energyLabel(energy, sleepHours);
  const capacityText = capacityLabel(energy);
  const routineContext = routines.length ? `${routines.length} routines available` : 'No routine due now';

  const content = (
    <div className="world">
      <style>{CSS}</style>
      <div className="shell" data-glow-spatial-room="today">
        <div className="caustic" aria-hidden="true" />
        <div className="layout">
          <header className="header">
            <div className="brand"><strong>Glow OS</strong><span className="batch">Batch 1</span></div>
            <div className="worldName">world 1: TODAY · THE LIVING CENTER</div>
            <button className="askTop" type="button" onClick={() => openGlow()} aria-label="Ask Glow"><span className="pearl pearlTop"/><span className="askTopLabel">Ask Glow<br/>⌘ K</span></button>
          </header>

          <nav className="rail" aria-label="Today spatial navigation">
            <button className="railButton active" type="button" onClick={() => setActiveIndex(0)}><span className="railMount"><span className="pearl pearlToday"/></span><span>Today</span></button>
            <button className="railButton" type="button" onClick={() => navigate('/focus')}><span className="railMount"><Focus size={14}/></span><span>Focus</span></button>
            <button className="railButton" type="button" onClick={() => navigate('/connections')}><span className="railMount"><Users size={14}/></span><span>People</span></button>
            <button className="railButton" type="button" onClick={() => navigate('/world')}><span className="railMount"><MapPin size={14}/></span><span>Places</span></button>
            <button className="railButton" type="button" onClick={() => navigate('/resources')}><span className="railMount"><LayoutGrid size={14}/></span><span>Resources</span></button>
            <button className="railButton" type="button" onClick={() => navigate('/planning')}><span className="railMount"><Route size={14}/></span><span>Journeys</span></button>
            <div className="railSpacer"/>
            <button className="addPearl" type="button" onClick={() => openGlow('Create ')} aria-label="Create with Glow"><Plus size={13}/></button>
          </nav>

          <main className="scene">
            <section className="chamber">
              <div className="nowZone">
                <div className="clock">{formatClock(now)}</div>
                <div className="now">NOW</div>
                <div className="flow">You’re in flow</div>
                <div className="flowNote">Keep the momentum.</div>
                <button className="protected" type="button" onClick={() => openGlow('Protect 90 minutes for my current focus. Show me the proposal before changing my schedule.')}><span className="protectedDot"/><span>Protected 90 min</span></button>
              </div>

              <div className="matter" aria-label="Glow Matter present-state sculpture">
                <div className="matterGround"/>
                <div className="sculpt"><div className="cavity"/><div className="ribbon r1"/><div className="ribbon r2"/><div className="ribbon r3"/></div>
              </div>

              <div className="intel">
                <div><div className="what">What now?</div><div className="intent"><input value={intent} onChange={(event) => setIntent(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') submitIntent(); }} placeholder="Share intent or ask anything…" aria-label="Ask Glow what now"/><button className="send" type="button" onClick={submitIntent} aria-label="Send to Glow"><ArrowUp size={11}/></button></div></div>
                <div className="intelTray" aria-label="Current intelligence tray">
                  <button className="intelCard" type="button" onClick={() => setLens({ kind: 'capacity' })}><div className="intelLabel">Capacity</div><div className="intelValue">{capacityText}</div><div className="capacityWave"/></button>
                  <button className="intelCard" type="button" onClick={() => setLens({ kind: 'energy' })}><div className="intelLabel">Energy</div><div className="intelValue" style={{maxWidth:'62%'}}>{energyText}</div><span className="pearl energyPearl"/></button>
                  <button className="intelCard" type="button" onClick={() => setLens({ kind: 'priorities' })}><div className="intelLabel">Top 3 priorities</div>{topThree.length ? topThree.map((task,index)=><div className="priority" key={task.id}><span>{index+1}</span><b>{task.title}</b><span className="priorityDot"/></div>) : <div className="intelValue">No open priorities.</div>}</button>
                </div>
              </div>

              <div className="focusInset">
                <button className="focusCell" type="button" onClick={() => activeFocus ? navigate('/focus') : openGlow(`Start a focus session for ${activeTask?.title ?? 'my next priority'}. Show me the focus plan first.`)}><div className="cellLabel">In focus</div><div className="cellTitle">{activeFocus?.title ?? activeTask?.title ?? 'Open focus'}</div><div className="cellMeta">{activeFocus ? <><div className="focusTrack"><div className="focusFill" style={{width:`${focusPct}%`}}/></div><span>{focusPct}% · {focusRemaining} min</span></> : <><span>{activeTask?.priority ?? 'Open'}</span><span className="microBtn">Start focus</span></>}</div></button>
                <button className="focusCell" type="button" onClick={() => { const first = buckets.NEXT[0]; if (first) focusItem(first); else setActiveIndex(0); }}><div className="cellLabel">Next up</div><div className="cellTitle">{buckets.NEXT[0]?.title ?? 'Open'}</div><div className="cellMeta">{buckets.NEXT[0] ? <><Focus size={10}/><span>{formatRange(buckets.NEXT[0])}{durationMinutes(buckets.NEXT[0]) ? ` · ${durationMinutes(buckets.NEXT[0])} min` : ''}</span></> : routineContext}</div></button>
                <button className="focusCell" type="button" onClick={() => nextEvent && focusItem(nextEvent)}><div className="cellLabel">Appointments</div><div className="cellTitle">{nextEvent?.title ?? 'No appointment'}</div><div className="cellMeta">{nextEvent ? <><CalendarDays size={10}/><span>{formatRange(nextEvent)}</span><span className="microBtn">Open</span></> : 'Your schedule is open.'}</div></button>
              </div>
            </section>

            <section ref={riverRef} className="riverViewport" aria-label="Living time river" onPointerDown={pointerDown} onPointerUp={pointerUp} onPointerCancel={() => { dragStartY.current = null; }}>
              {BUCKETS.map((bucket,index) => {
                const distance = index - activeIndex;
                const list = buckets[bucket];
                const opacity = Math.max(.38, 1 - Math.abs(distance) * .16);
                const scale = Math.max(.92, 1 - Math.abs(distance) * .018);
                const y = distance * 64;
                const z = -Math.abs(distance) * 58;
                const style = { transform:`translate3d(0,${y}px,${z}px) scale(${scale})`, opacity } as CSSProperties;
                return <div key={bucket} className={`timeBand ${index===activeIndex?'active':''}`} style={style} role="button" tabIndex={0} onClick={() => setActiveIndex(index)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setActiveIndex(index); }} onDragOver={(event)=>event.preventDefault()} onDrop={(event)=>{ event.preventDefault(); const item=draggingItem.current; draggingItem.current=null; if(item) queueMove(item,bucket); }}>
                  <div><div className="rowTime">{bucketTime(bucket,list)}</div><div className="rowName">{bucket}</div><div className="rowCopy">{bucketCopy(bucket)[0]}<br/>{bucketCopy(bucket)[1]}</div></div>
                  <div className="bandEvents" onPointerDown={(event)=>event.stopPropagation()} onPointerUp={(event)=>event.stopPropagation()}>{list.length ? list.slice(0,3).map((item,itemIndex)=><button key={item.id} className="eventCard" type="button" draggable onDragStart={()=>{draggingItem.current=item;}} onDragEnd={()=>{draggingItem.current=null;}} onPointerDown={()=>beginHold(item)} onPointerUp={endHold} onPointerCancel={endHold} onClick={(event)=>{event.stopPropagation();focusItem(item);}}><span className={`object eventObject ${bucketTone(bucket,itemIndex)}`}/><span><span className="eventTitle">{item.title}</span><span className="eventMeta">{formatRange(item)}<span className="tag">{item.kind==='event'?'Calendar':item.meta}</span></span></span></button>) : <div className="empty">Open by design.</div>}</div>
                  <div className="countLens"><div className="countLabel">{bucket==='NEXT'?'Time to next':bucket==='LATER'?'Time to later':bucket==='TONIGHT'?'Leave-ready':'Preview time'}</div><div className="countValue">{countdown(bucket,list)}</div></div>
                </div>;
              })}
              <div className="riverDots">{BUCKETS.map((bucket,index)=><button type="button" key={bucket} className={`riverDot ${index===activeIndex?'active':''}`} onClick={(event)=>{event.stopPropagation();setActiveIndex(index);}} aria-label={`Move to ${bucket}`}/>)}</div>
            </section>

            <footer className="footer">
              <button className="dayView" type="button" onClick={() => navigate('/calendar')}><CalendarDays size={10}/><span>Day view</span><ChevronDown size={9}/></button>
              <button className="replan" type="button" onClick={() => openGlow('Replan my day using my real tasks, calendar, priorities, and current capacity. Show me the proposal before changing anything.')}><Sparkles size={10}/><span>Replan my day</span></button>
              <div className="footerRight"><span className="saved">All changes saved</span><button className="undo" type="button" onClick={() => openGlow('Undo my most recent Glow OS change if it is safe and reversible. Show me exactly what will be undone first.')}><span>Undo</span><Undo2 size={10}/></button><span className="pearl cornerPearl"/></div>
            </footer>
          </main>
        </div>

        {lens ? <div className="lensBackdrop" onPointerDown={(event)=>{ if(event.target===event.currentTarget) setLens(null); }}><section className="lens" aria-modal="true" role="dialog">
          <div className="lensHead"><div><div className="lensKicker">Glow Matter · focused object</div><div className="lensTitle">{lens.kind==='capacity'?'Capacity':lens.kind==='energy'?'Energy check-in':lens.kind==='priorities'?'Top 3 priorities':lens.item.title}</div></div><button className="closeLens" type="button" onClick={()=>setLens(null)} aria-label="Close"><X size={14}/></button></div>
          {lens.kind==='capacity' ? <><p className="lensCopy">Capacity is a working state, not a score. Bring this object forward whenever the day needs to become lighter, steadier, or more focused.</p><div className="lensRows"><div className="lensRow"><span className="pearl pearlToday"/><div><strong>Current capacity</strong><small>{capacityText}</small></div><span>{energy ?? '—'}</span></div></div><div className="lensActions"><button className="lensAction primary" onClick={()=>{openGlow('Check in my capacity and adjust Today around what I can realistically hold. Show me the proposal first.');setLens(null);}}>Check in with Glow</button><button className="lensAction" onClick={()=>{openGlow('Make the rest of Today lighter without deleting anything. Show me what would move.');setLens(null);}}>Lighten today</button></div></> : null}
          {lens.kind==='energy' ? <><p className="lensCopy">Energy changes how information should surface. Use this object to update the day’s pacing instead of forcing the same plan at every energy level.</p><div className="lensRows"><div className="lensRow"><span className="pearl pearlViolet"/><div><strong>Current energy</strong><small>{energyText}</small></div><span>{energy ?? '—'}</span></div></div><div className="lensActions"><button className="lensAction primary" onClick={()=>{navigate('/wellness');setLens(null);}}>Open check-in</button><button className="lensAction" onClick={()=>{openGlow('Use my current energy to adapt the rest of Today. Show the proposed changes before applying them.');setLens(null);}}>Adapt Today</button></div></> : null}
          {lens.kind==='priorities' ? <><p className="lensCopy">These are your current highest-priority open tasks. The full object comes forward here instead of being cropped inside the command deck.</p><div className="lensRows">{topThree.length ? topThree.map((task,index)=><div className="lensRow" key={task.id}><span><GripVertical size={12}/></span><div><strong>{task.title}</strong><small>{task.priority}</small></div><span>{index+1}</span></div>) : <div className="lensRow"><span>—</span><div><strong>No open priorities</strong><small>Today has room.</small></div><span/></div>}</div><div className="lensActions"><button className="lensAction primary" onClick={()=>{openGlow('Help me reorder my Top 3 priorities. Prepare the new order for approval before changing anything.');setLens(null);}}>Reorder with Glow</button><button className="lensAction" onClick={()=>{navigate('/tasks');setLens(null);}}>Open tasks</button></div></> : null}
          {lens.kind==='event' ? <><p className="lensCopy">This is a real temporal object. Tap to focus it, hold to open it, or move it to another Today region. Calendar mutations remain approval-based.</p><div className="lensRows"><div className="lensRow"><span className="object eventObject pearlCool"/><div><strong>{lens.item.title}</strong><small>{formatRange(lens.item)} · {lens.item.kind==='event'?'Calendar':lens.item.meta}</small></div><button className="closeLens" type="button" onClick={()=>{selectContext(lens.item);openGlow(`Help me with ${lens.item.title}`);setLens(null);}} aria-label="Ask Glow about this"><ArrowUp size={11}/></button></div></div><div className="lensActions">{isUrl(lens.item.location)?<button className="lensAction primary" onClick={()=>window.open(lens.item.location!, '_blank', 'noopener,noreferrer')}>Join</button>:<button className="lensAction primary" onClick={()=>{selectContext(lens.item);openGlow(`Open the context for ${lens.item.title}`);setLens(null);}}>Open context</button>}<button className="lensAction" onClick={()=>{selectContext(lens.item);openGlow(`What should I know or prepare for ${lens.item.title}?`);setLens(null);}}>Prepare me</button><button className="lensAction" onClick={()=>{selectContext(lens.item);openGlow(`Show me all details for ${lens.item.title}`);setLens(null);}}><Ellipsis size={12}/></button></div><div className="lensKicker" style={{marginTop:14}}>Move through time</div><div className="moveGrid">{BUCKETS.map((bucket)=><button type="button" key={bucket} onClick={()=>queueMove(lens.item,bucket)}>{bucket}</button>)}</div></> : null}
        </section></div> : null}
      </div>
    </div>
  );

  return <div ref={hostRef}>{shadow ? createPortal(content, shadow) : null}</div>;
}
