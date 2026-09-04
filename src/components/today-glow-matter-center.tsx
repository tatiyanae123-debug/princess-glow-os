'use client';

import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowUp,
  CalendarDays,
  Focus,
  LayoutGrid,
  MapPin,
  Plus,
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
:host{position:fixed;inset:0;z-index:2147480000;display:block;color:#292826;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","Segoe UI",sans-serif;-webkit-font-smoothing:antialiased;text-rendering:geometricPrecision;background:#ece7e0}
*,*::before,*::after{box-sizing:border-box}
button,input{font:inherit;color:inherit}
button{appearance:none;-webkit-appearance:none}
button:focus-visible,input:focus-visible{outline:2px solid rgba(95,100,108,.38);outline-offset:3px}
button{touch-action:manipulation}

.world{--ink:#2d2a27;--muted:#817a73;--edge:rgba(255,255,255,.8);--edge-soft:rgba(255,255,255,.34);--stone:rgba(218,209,200,.42);--shadow:rgba(78,67,59,.13);height:100dvh;overflow:hidden;position:relative;isolation:isolate;background:radial-gradient(80% 58% at 51% -8%,rgba(255,255,255,.98),transparent 63%),radial-gradient(42% 44% at 14% 72%,rgba(223,214,204,.62),transparent 73%),radial-gradient(32% 38% at 87% 76%,rgba(255,255,255,.66),transparent 74%),linear-gradient(128deg,#f8f5f0 0%,#eee9e2 49%,#f7f3ee 100%)}
.world::before{content:"";position:absolute;inset:-8%;z-index:-2;background:radial-gradient(26% 21% at 54% 17%,rgba(211,226,255,.19),transparent 70%),radial-gradient(18% 20% at 64% 23%,rgba(226,204,255,.17),transparent 74%),radial-gradient(22% 16% at 77% 32%,rgba(255,217,194,.16),transparent 75%),radial-gradient(18% 19% at 37% 78%,rgba(212,238,229,.13),transparent 74%);filter:blur(26px);opacity:.9}
.world::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:linear-gradient(104deg,transparent 0 18%,rgba(255,255,255,.26) 20%,transparent 23% 67%,rgba(255,255,255,.16) 69%,transparent 72%),radial-gradient(65% 1.4% at 50% 92%,rgba(111,98,87,.08),transparent 70%);mix-blend-mode:screen}

.stage{height:100%;padding:clamp(12px,1.55dvh,18px) clamp(12px,1.45vw,22px);display:grid;grid-template-columns:clamp(72px,7.3vw,98px) minmax(0,1fr);grid-template-rows:clamp(42px,5.8dvh,56px) minmax(0,1fr);gap:clamp(8px,1.05dvh,12px);perspective:1600px}

.identityRidge{grid-column:1/-1;position:relative;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 12px;background:linear-gradient(180deg,rgba(255,255,255,.22),rgba(255,255,255,.05));box-shadow:inset 0 1px 0 rgba(255,255,255,.78),inset 0 -1px 0 rgba(138,128,119,.10),0 12px 30px rgba(84,73,65,.035)}
.identityRidge::before,.identityRidge::after{content:"";position:absolute;left:2%;right:2%;height:1px;pointer-events:none}.identityRidge::before{top:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.93),rgba(224,234,255,.42),rgba(255,255,255,.88),transparent)}.identityRidge::after{bottom:0;background:linear-gradient(90deg,transparent,rgba(161,151,142,.10),rgba(255,255,255,.46),rgba(161,151,142,.09),transparent)}
.brand{display:flex;align-items:baseline;gap:16px;min-width:0}.brand strong{font-size:clamp(10px,.88vw,13px);font-weight:560;letter-spacing:-.014em}.batch{font-size:clamp(6.5px,.59vw,8.5px);letter-spacing:.08em;color:#9b948d}.worldName{justify-self:center;font-size:clamp(6.6px,.61vw,8.7px);font-weight:520;letter-spacing:.18em;color:#57524e;white-space:nowrap}.askTop{justify-self:end;display:flex;align-items:center;gap:9px;border:0;background:transparent;padding:2px 0 2px 10px;min-height:40px;cursor:pointer}.askTopLabel{font-size:clamp(6.5px,.61vw,8.8px);line-height:1.15;text-align:left;color:#66605a}

.railSlab{grid-row:2;position:relative;min-height:0;padding:7px 6px 9px;display:flex;flex-direction:column;align-items:center;gap:clamp(5px,.85dvh,9px);border-radius:30px;background:linear-gradient(102deg,rgba(255,255,255,.17),rgba(255,255,255,.04) 48%,rgba(236,230,224,.14));box-shadow:inset 1px 0 0 rgba(255,255,255,.73),inset -1px 0 0 rgba(131,121,112,.08),10px 18px 34px rgba(76,65,58,.045);transform:translateZ(22px)}
.railSlab::before{content:"";position:absolute;inset:10px 6px;border-radius:25px;background:linear-gradient(90deg,rgba(255,255,255,.31),rgba(255,255,255,.03) 55%,rgba(217,229,255,.09));box-shadow:inset 0 0 0 1px rgba(255,255,255,.28);pointer-events:none}
.railSlab::after{content:"";position:absolute;top:5%;bottom:5%;right:2px;width:2px;border-radius:99px;background:linear-gradient(180deg,transparent,rgba(255,255,255,.84) 18%,rgba(218,204,255,.30) 50%,rgba(255,225,204,.26) 74%,transparent)}
.railButton{position:relative;z-index:1;width:100%;min-height:clamp(52px,8.1dvh,68px);border:0;background:transparent;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;color:#7b746e;font-size:clamp(6.5px,.59vw,8.2px);cursor:pointer}
.railMount{width:clamp(31px,3.1vw,41px);height:clamp(31px,3.1vw,41px);display:grid;place-items:center;position:relative;border-radius:42% 58% 55% 45% / 49% 43% 57% 51%;background:linear-gradient(145deg,rgba(255,255,255,.19),rgba(255,255,255,.04));box-shadow:inset 1px 1px 0 rgba(255,255,255,.68),inset -1px -1px 0 rgba(120,110,102,.08)}
.railMount svg{stroke-width:1.25;color:#6e6863}
.railButton:hover .railMount,.railButton:active .railMount{transform:translateZ(4px) scale(.985);box-shadow:inset 1px 1px 0 rgba(255,255,255,.9),0 7px 16px rgba(77,66,59,.07)}
.railButton.active{color:#3d3935}.railButton.active .railMount{width:clamp(39px,3.8vw,50px);height:clamp(39px,3.8vw,50px);background:transparent;box-shadow:none}
.railSpacer{flex:1}.addOrb{position:relative;z-index:1;width:clamp(38px,3.65vw,48px);height:clamp(38px,3.65vw,48px);border:0;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:radial-gradient(circle at 32% 26%,rgba(255,255,255,.98) 0 12%,rgba(250,252,255,.72) 20%,rgba(208,221,245,.27) 44%,rgba(230,213,242,.20) 62%,rgba(255,228,206,.16) 76%,rgba(255,255,255,.55) 88%,rgba(149,145,145,.10));box-shadow:inset -7px -9px 14px rgba(124,125,136,.10),inset 5px 5px 12px rgba(255,255,255,.92),0 8px 14px rgba(81,69,61,.10)}

.pearl{position:relative;display:inline-block;border-radius:50%;background:radial-gradient(circle at 31% 24%,rgba(255,255,255,1) 0 10%,rgba(255,255,255,.83) 18%,rgba(219,230,250,.34) 38%,rgba(231,214,245,.29) 57%,rgba(255,224,200,.22) 72%,rgba(255,255,255,.62) 88%,rgba(148,145,149,.11));box-shadow:inset -7px -9px 14px rgba(124,125,136,.12),inset 5px 5px 12px rgba(255,255,255,.95),0 8px 16px rgba(80,68,60,.12),0 1px 1px rgba(255,255,255,.9)}
.pearl::before{content:"";position:absolute;inset:7%;border-radius:50%;box-shadow:inset 1px 1px 0 rgba(255,255,255,.92),inset -1px -1px 0 rgba(136,128,132,.10)}
.pearl::after{content:"";position:absolute;left:24%;top:14%;width:33%;height:18%;border-radius:50%;background:rgba(255,255,255,.88);filter:blur(.35px)}
.pearlTop{width:clamp(31px,2.65vw,37px);height:clamp(31px,2.65vw,37px)}.pearlToday{width:clamp(27px,2.6vw,35px);height:clamp(27px,2.6vw,35px)}
.pearlCool{background:radial-gradient(circle at 31% 24%,#fff 0 10%,rgba(255,255,255,.86) 18%,rgba(202,224,255,.46) 42%,rgba(221,214,246,.26) 63%,rgba(255,255,255,.62) 88%,rgba(148,145,149,.11))}.pearlViolet{background:radial-gradient(circle at 31% 24%,#fff 0 10%,rgba(255,255,255,.84) 18%,rgba(207,222,255,.37) 39%,rgba(194,165,244,.42) 61%,rgba(239,215,255,.34) 78%,rgba(255,255,255,.61) 90%)}.pearlPeach{background:radial-gradient(circle at 31% 24%,#fff 0 10%,rgba(255,255,255,.85) 18%,rgba(255,223,191,.43) 43%,rgba(255,181,151,.36) 64%,rgba(255,236,215,.39) 82%,rgba(255,255,255,.61) 92%)}

.center{grid-column:2;grid-row:2;min-width:0;min-height:0;display:grid;grid-template-rows:minmax(290px,43dvh) minmax(0,1fr) clamp(38px,5.3dvh,52px);gap:clamp(7px,.9dvh,10px)}

.chamber{position:relative;min-height:0;overflow:hidden;padding:clamp(15px,1.8dvh,22px) clamp(17px,1.7vw,26px) clamp(11px,1.35dvh,16px);display:grid;grid-template-columns:minmax(0,.65fr) minmax(230px,1.03fr) minmax(320px,1.38fr);grid-template-rows:minmax(0,1fr) clamp(78px,10.9dvh,104px);column-gap:clamp(11px,1.3vw,20px);border-radius:34px 36px 31px 37px / 31px 34px 36px 39px;background:linear-gradient(136deg,rgba(255,255,255,.20),rgba(255,255,255,.055) 43%,rgba(247,241,235,.09) 68%,rgba(255,255,255,.13));box-shadow:inset 1px 1px 0 rgba(255,255,255,.90),inset -1px -1px 0 rgba(143,130,119,.08),inset 0 18px 45px rgba(255,255,255,.09),0 24px 48px rgba(81,69,60,.055),0 3px 8px rgba(81,69,60,.04);transform:translateZ(10px)}
.chamber::before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(103deg,transparent 0 22%,rgba(255,255,255,.34) 24%,transparent 27% 61%,rgba(215,229,255,.10) 64%,rgba(228,211,255,.10) 66%,rgba(255,226,205,.08) 69%,transparent 72%),radial-gradient(54% 28% at 45% 104%,rgba(124,104,88,.065),transparent 72%);mix-blend-mode:screen}
.chamber::after{content:"";position:absolute;left:3%;right:3%;bottom:calc(clamp(78px,10.9dvh,104px) + 3px);height:1px;background:linear-gradient(90deg,transparent,rgba(155,145,135,.12) 18%,rgba(255,255,255,.65) 50%,rgba(155,145,135,.10) 82%,transparent);pointer-events:none}

.nowZone{position:relative;z-index:2;padding:5px 0 0 3px}.time{font-size:clamp(8px,.77vw,10.8px);letter-spacing:.02em;color:#78716b}.nowTitle{margin-top:clamp(8px,1.05dvh,12px);font-size:clamp(30px,2.9vw,41px);line-height:.9;font-weight:360;letter-spacing:-.06em}.flow{margin-top:clamp(10px,1.3dvh,15px);font-size:clamp(10px,.91vw,13px);font-weight:440}.flowNote{margin-top:4px;font-size:clamp(7px,.68vw,9.5px);color:#878079}.protected{margin-top:clamp(16px,2.3dvh,24px);position:relative;border:0;background:transparent;padding:8px 13px 8px 17px;display:inline-flex;align-items:center;gap:9px;font-size:clamp(6.8px,.61vw,8.6px);cursor:pointer}.protected::before{content:"";position:absolute;inset:2px 0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.21),rgba(255,255,255,.06));box-shadow:inset 0 1px 0 rgba(255,255,255,.72),inset 0 -1px 0 rgba(126,116,108,.07),0 5px 13px rgba(72,61,53,.03);z-index:-1}.protectedDot{width:7px;height:7px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fffbd9,#d9df9b 55%,#a5b265);box-shadow:0 0 9px rgba(190,204,104,.35)}

.matterZone{position:relative;z-index:2;display:grid;place-items:center;min-width:0;min-height:0;filter:drop-shadow(0 17px 16px rgba(90,76,65,.11))}
.matterGround{position:absolute;left:16%;right:13%;bottom:9%;height:12%;border-radius:50%;background:radial-gradient(ellipse,rgba(104,88,76,.12),rgba(104,88,76,.035) 48%,transparent 74%);filter:blur(9px);transform:rotate(-3deg)}
.matterSculpture{position:relative;width:min(96%,360px);aspect-ratio:1.48;transform:rotate(-5deg) translateY(-1%);border-radius:44% 56% 61% 39% / 38% 35% 65% 62%;background:radial-gradient(72% 80% at 34% 28%,rgba(255,255,255,.95) 0 8%,rgba(255,255,255,.37) 23%,rgba(213,228,251,.18) 42%,rgba(226,211,248,.16) 58%,rgba(255,221,203,.11) 72%,rgba(255,255,255,.34) 88%,rgba(155,146,143,.08) 100%);box-shadow:inset 15px 14px 25px rgba(255,255,255,.66),inset -18px -16px 30px rgba(133,135,146,.10),inset 0 -3px 5px rgba(190,171,158,.06),0 2px 0 rgba(255,255,255,.85);backdrop-filter:blur(5px) saturate(112%)}
.matterSculpture::before{content:"";position:absolute;inset:7% 8% 11% 9%;border-radius:58% 42% 51% 49% / 46% 56% 44% 54%;background:radial-gradient(50% 46% at 40% 29%,rgba(255,255,255,.70),transparent 65%),linear-gradient(116deg,rgba(255,255,255,.18),rgba(210,227,255,.08) 42%,rgba(211,184,246,.09) 57%,rgba(255,197,172,.07) 70%,rgba(255,255,255,.10));box-shadow:inset 2px 2px 0 rgba(255,255,255,.71),inset -2px -2px 0 rgba(150,140,143,.08);transform:rotate(6deg)}
.matterSculpture::after{content:"";position:absolute;inset:-1.5%;border-radius:inherit;padding:2px;background:linear-gradient(115deg,rgba(255,255,255,.95),rgba(220,235,255,.52) 27%,rgba(215,192,248,.38) 53%,rgba(255,204,185,.33) 70%,rgba(255,244,195,.27) 82%,rgba(255,255,255,.81));-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;opacity:.82;filter:blur(.15px)}
.matterCore{position:absolute;left:19%;top:18%;width:64%;height:62%;border-radius:41% 59% 47% 53% / 58% 44% 56% 42%;background:radial-gradient(circle at 42% 37%,rgba(255,255,255,.77),rgba(255,255,255,.13) 45%,rgba(205,220,248,.08) 66%,transparent 76%);box-shadow:inset 8px 7px 16px rgba(255,255,255,.33);transform:rotate(9deg)}
.matterFold{position:absolute;border-radius:999px;filter:blur(.2px);mix-blend-mode:screen}.foldA{left:13%;top:26%;width:67%;height:12%;background:linear-gradient(90deg,rgba(255,255,255,.08),rgba(255,255,255,.72) 34%,rgba(210,226,255,.28) 58%,rgba(211,183,249,.22) 69%,rgba(255,213,188,.16) 80%,transparent);transform:rotate(13deg)}.foldB{left:28%;top:58%;width:57%;height:9%;background:linear-gradient(90deg,transparent,rgba(215,232,255,.26),rgba(255,255,255,.69) 44%,rgba(236,198,246,.21) 64%,rgba(255,224,190,.13),transparent);transform:rotate(-19deg)}.foldC{left:55%;top:24%;width:16%;height:55%;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.58) 39%,rgba(215,203,247,.19) 60%,transparent);transform:rotate(17deg)}
.matterFlare{position:absolute;right:2%;top:28%;width:28%;height:34%;border-radius:50%;background:radial-gradient(circle at 35% 50%,rgba(255,255,255,.73),rgba(224,216,255,.16) 34%,rgba(255,211,189,.12) 56%,transparent 72%);filter:blur(5px);mix-blend-mode:screen}

.intel{position:relative;z-index:2;display:grid;grid-template-rows:auto minmax(0,1fr);gap:clamp(10px,1.25dvh,14px);min-width:0;min-height:0}.whatLabel{font-size:clamp(8px,.72vw,10px);font-weight:540}.intentSlot{position:relative;margin-top:7px;height:clamp(42px,5.9dvh,52px);display:grid;grid-template-columns:minmax(0,1fr) 44px;align-items:center}.intentSlot::before{content:"";position:absolute;inset:0;border-radius:15px 18px 14px 20px / 16px 14px 19px 17px;background:linear-gradient(150deg,rgba(255,255,255,.31),rgba(255,255,255,.08));box-shadow:inset 1px 1px 0 rgba(255,255,255,.76),inset -1px -1px 0 rgba(132,122,114,.06),0 7px 16px rgba(75,64,56,.025)}.intentSlot input{position:relative;z-index:1;height:100%;min-width:0;border:0;outline:none;background:transparent;padding:0 14px;font-size:clamp(8px,.73vw,10px)}.intentSlot input::placeholder{color:#aaa29a}.sendPearl{position:relative;z-index:1;justify-self:center;width:31px;height:31px;border:0;border-radius:50%;display:grid;place-items:center;cursor:pointer;background:radial-gradient(circle at 35% 29%,#fff,rgba(238,244,255,.68) 28%,rgba(211,219,234,.34) 60%,rgba(255,255,255,.54));box-shadow:inset 3px 3px 8px rgba(255,255,255,.93),inset -4px -5px 8px rgba(126,127,137,.08),0 6px 10px rgba(78,67,59,.08)}
.infoField{position:relative;min-height:0;display:grid;grid-template-columns:.95fr .86fr 1.31fr;gap:1px;background:linear-gradient(90deg,transparent,rgba(141,132,124,.10) 18%,rgba(255,255,255,.57) 50%,rgba(141,132,124,.08) 82%,transparent);border-radius:18px;overflow:hidden;box-shadow:inset 0 1px 0 rgba(255,255,255,.47),inset 0 -1px 0 rgba(128,118,109,.05)}
.infoCell{position:relative;padding:clamp(9px,1.05dvh,12px);min-width:0;background:linear-gradient(145deg,rgba(255,255,255,.18),rgba(255,255,255,.045));overflow:hidden}.infoCell::after{content:"";position:absolute;left:9px;right:9px;bottom:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.52),transparent)}.infoLabel{font-size:clamp(6.2px,.55vw,7.8px);color:#655f5a}.infoValue{margin-top:clamp(5px,.7dvh,8px);font-size:clamp(8px,.7vw,10px);line-height:1.25}.capacityEtch{margin-top:9px;height:14px;position:relative}.capacityEtch::before{content:"";position:absolute;left:0;right:4px;top:8px;height:1px;background:linear-gradient(90deg,transparent,rgba(110,107,105,.34),transparent);transform:rotate(-5deg)}.capacityEtch::after{content:"";position:absolute;right:12%;top:0;width:42%;height:10px;border:1px solid rgba(131,128,125,.16);border-radius:58% 42% 53% 47%;transform:rotate(-7deg)}.energyCell{display:grid;grid-template-columns:minmax(0,1fr) 48px;align-items:center}.energyPearl{width:42px;height:42px;justify-self:end}.priorityRow{display:grid;grid-template-columns:12px minmax(0,1fr) 11px;align-items:center;gap:5px;margin-top:5px;font-size:clamp(6px,.53vw,7.5px)}.priorityIndex{color:#7e7770}.priorityText{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.priorityNode{width:9px;height:9px;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(121,114,108,.23),inset 2px 2px 4px rgba(255,255,255,.8)}

.focusInset{grid-column:1/-1;position:relative;z-index:2;min-height:0;display:grid;grid-template-columns:1.35fr 1fr 1.12fr;border-radius:18px 22px 17px 20px / 18px 17px 21px 20px;background:linear-gradient(180deg,rgba(208,199,191,.07),rgba(255,255,255,.12));box-shadow:inset 0 9px 18px rgba(110,94,81,.035),inset 0 1px 0 rgba(255,255,255,.62),inset 0 -1px 0 rgba(139,127,118,.06)}
.focusCell{position:relative;padding:clamp(9px,1.05dvh,12px) clamp(13px,1.35vw,20px);display:flex;flex-direction:column;justify-content:center;min-width:0}.focusCell+.focusCell::before{content:"";position:absolute;left:0;top:16%;bottom:16%;width:1px;background:linear-gradient(180deg,transparent,rgba(149,140,131,.13),rgba(255,255,255,.52),rgba(149,140,131,.10),transparent)}.cellLabel{font-size:clamp(6px,.53vw,7.7px);color:#756e68}.cellTitle{margin-top:5px;font-size:clamp(9px,.84vw,12px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.cellMeta{margin-top:6px;display:flex;align-items:center;gap:7px;min-height:15px;font-size:clamp(6px,.53vw,7.7px);color:#817a74;white-space:nowrap}.focusLine{width:min(180px,68%);height:4px;border-radius:99px;background:linear-gradient(90deg,rgba(205,203,198,.23),rgba(255,255,255,.86),rgba(238,211,160,.48));box-shadow:inset 0 1px 0 rgba(255,255,255,.72)}.openContext{border:0;background:transparent;padding:2px 5px;font-size:inherit;text-decoration:underline;text-decoration-color:rgba(111,104,98,.22);text-underline-offset:3px;cursor:pointer}

.timeVessel{position:relative;min-height:0;display:grid;grid-template-rows:repeat(4,minmax(0,1fr));padding-left:18px;background:linear-gradient(90deg,rgba(255,255,255,.05),transparent 12%);box-shadow:inset 1px 0 0 rgba(255,255,255,.56)}
.timeVessel::before{content:"";position:absolute;left:7px;top:4%;bottom:4%;width:2px;border-radius:99px;background:linear-gradient(180deg,rgba(255,255,255,.86),rgba(206,223,251,.24) 31%,rgba(214,191,246,.20) 54%,rgba(255,211,190,.18) 73%,rgba(255,255,255,.60));box-shadow:1px 0 0 rgba(133,123,115,.05)}
.timeBand{position:relative;min-height:0;display:grid;grid-template-columns:minmax(120px,.86fr) minmax(0,1.45fr) minmax(0,1.45fr) minmax(96px,.72fr);align-items:center;gap:clamp(7px,.8vw,12px);padding:clamp(7px,.8dvh,10px) clamp(12px,1.2vw,18px) clamp(7px,.8dvh,10px) clamp(15px,1.45vw,22px);background:linear-gradient(90deg,rgba(255,255,255,.16),rgba(255,255,255,.045) 45%,rgba(248,243,238,.06));box-shadow:inset 0 1px 0 rgba(255,255,255,.58),inset 0 -1px 0 rgba(137,126,117,.06)}
.timeBand:first-child{border-radius:24px 26px 8px 8px / 19px 23px 8px 8px}.timeBand:last-child{border-radius:8px 8px 26px 24px / 8px 8px 23px 21px}.timeBand::before{content:"";position:absolute;left:-15px;top:50%;width:15px;height:1px;background:linear-gradient(90deg,rgba(128,118,109,.24),rgba(255,255,255,.78))}.timeBand::after{content:"";position:absolute;left:-13px;top:calc(50% - 3px);width:7px;height:7px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,rgba(213,227,251,.54) 50%,rgba(165,160,165,.18));box-shadow:0 2px 5px rgba(80,68,60,.09)}
.rowTime{font-size:clamp(5.8px,.51vw,7.3px);color:#716a64}.rowName{margin-top:2px;font-size:clamp(15px,1.42vw,20px);line-height:.94;letter-spacing:-.045em;font-weight:370}.rowCopy{margin-top:3px;font-size:clamp(5.8px,.5vw,7.2px);line-height:1.25;color:#8c847d}.eventSlot{width:100%;min-width:0;display:grid;grid-template-columns:44px minmax(0,1fr);gap:9px;align-items:center;border:0;background:transparent;text-align:left;padding:0;cursor:pointer}.eventPearl{width:36px;height:36px;justify-self:center;transition:transform 220ms cubic-bezier(.2,.7,.2,1),filter 220ms ease}.eventSlot:hover .eventPearl{transform:translateY(-2px) scale(1.025);filter:brightness(1.04)}.eventSlot:active .eventPearl{transform:translateY(0) scale(.98)}.eventTitle{display:block;font-size:clamp(7.2px,.69vw,9.7px);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.eventMeta{display:block;margin-top:3px;font-size:clamp(5.5px,.48vw,6.8px);color:#857d76;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.tag{display:inline-block;margin-left:5px;letter-spacing:.06em;text-transform:uppercase;color:#9b938c}.countLens{justify-self:end;min-width:92px;padding:8px 9px 8px 12px;position:relative}.countLens::before{content:"";position:absolute;inset:0;border-radius:16px 13px 18px 14px;background:linear-gradient(145deg,rgba(255,255,255,.16),rgba(255,255,255,.03));box-shadow:inset 1px 1px 0 rgba(255,255,255,.58),inset -1px -1px 0 rgba(130,120,112,.05)}.countLabel,.countValue{position:relative;z-index:1}.countLabel{font-size:clamp(5.2px,.45vw,6.4px);color:#716a64}.countValue{margin-top:4px;font-size:clamp(7.6px,.7vw,10px)}.countMini{position:absolute;right:-3px;top:-5px;width:25px;height:25px}.empty{font-size:clamp(6.5px,.58vw,8.2px);color:#9a928b;font-style:italic}

.utility{min-height:0;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;padding:0 5px}.dayTool{justify-self:start;display:flex;align-items:center;gap:8px;border:0;background:transparent;padding:7px 10px;font-size:clamp(6.3px,.57vw,8px);cursor:pointer}.replan{justify-self:center;position:relative;min-width:clamp(180px,19vw,238px);display:flex;align-items:center;justify-content:center;gap:8px;border:0;background:transparent;padding:9px 18px;font-size:clamp(6.7px,.6vw,8.5px);cursor:pointer}.replan::before{content:"";position:absolute;inset:1px 0;border-radius:999px;background:linear-gradient(180deg,rgba(255,255,255,.25),rgba(255,255,255,.06));box-shadow:inset 0 1px 0 rgba(255,255,255,.78),inset 0 -1px 0 rgba(126,116,108,.06),0 6px 13px rgba(79,68,61,.03);z-index:-1}.save{justify-self:end;display:flex;align-items:center;gap:10px;font-size:clamp(5.5px,.49vw,6.8px);color:#938b84}.cornerPearl{width:34px;height:34px}

@media(max-width:1050px) and (min-width:721px){.stage{grid-template-columns:68px minmax(0,1fr);padding-left:9px;padding-right:9px}.chamber{grid-template-columns:minmax(0,.55fr) minmax(210px,.96fr) minmax(285px,1.5fr);column-gap:8px;padding-left:12px;padding-right:12px}.infoField{grid-template-columns:.9fr .8fr 1.4fr}.timeBand{grid-template-columns:minmax(108px,.8fr) minmax(0,1.35fr) minmax(0,1.35fr) minmax(84px,.7fr);padding-left:12px;padding-right:9px}.railButton{min-height:56px}.worldName{letter-spacing:.12em}}
@media(max-height:700px) and (min-width:721px){.center{grid-template-rows:clamp(255px,39dvh,286px) minmax(0,1fr) 36px}.chamber{grid-template-rows:minmax(0,1fr) 69px;padding-top:10px;padding-bottom:7px}.protected{margin-top:9px}.timeBand{padding-top:4px;padding-bottom:4px}.eventPearl{width:31px;height:31px}.utility{min-height:34px}}
@media(max-width:720px){:host{position:fixed}.world{overflow:auto}.stage{display:block;padding:10px 9px 84px}.identityRidge{position:sticky;top:6px;z-index:50;height:52px;grid-template-columns:1fr auto;border-radius:20px;background:rgba(246,241,235,.80);box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 8px 24px rgba(78,67,59,.08)}.worldName{display:none}.railSlab{position:fixed;left:9px;right:9px;bottom:7px;z-index:60;height:64px;padding:5px 6px;border-radius:24px;display:grid;grid-template-columns:repeat(6,1fr) 44px;background:rgba(242,237,231,.88);box-shadow:inset 0 1px 0 rgba(255,255,255,.82),0 12px 28px rgba(75,64,56,.14);backdrop-filter:blur(9px)}.railSlab::before,.railSlab::after{display:none}.railButton{min-height:50px;font-size:0}.railMount,.railButton.active .railMount{width:40px;height:40px}.railSpacer{display:none}.addOrb{width:40px;height:40px}.center{margin-top:9px;display:flex;flex-direction:column;gap:8px}.chamber{display:grid;grid-template-columns:1fr;grid-template-rows:auto 210px auto auto;padding:18px 15px 14px;border-radius:29px}.nowZone{padding:0}.matterZone{min-height:205px}.matterSculpture{width:min(330px,88vw)}.intel{margin-top:4px}.infoField{grid-template-columns:1fr 1fr}.infoCell:last-child{grid-column:1/-1}.focusInset{margin-top:8px;grid-template-columns:1fr}.focusCell+.focusCell::before{left:5%;right:5%;top:0;bottom:auto;width:auto;height:1px;background:linear-gradient(90deg,transparent,rgba(149,140,131,.12),rgba(255,255,255,.48),transparent)}.timeVessel{padding-left:14px}.timeBand{grid-template-columns:1fr;padding:15px;gap:12px}.rowName{font-size:24px}.eventSlot{grid-template-columns:46px minmax(0,1fr)}.eventPearl{width:40px;height:40px}.countLens{justify-self:stretch;min-height:45px}.utility{grid-template-columns:1fr;gap:7px;padding:4px}.dayTool,.replan,.save{justify-self:center}.replan{min-width:210px}.cornerPearl{display:none}}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}.eventSlot:hover .eventPearl{transform:none}}
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
  if (bucket === 'LATER' && index === 0) return 'pearlViolet';
  if (bucket === 'TONIGHT' && index === 0) return 'pearlPeach';
  if (bucket === 'TONIGHT' && index === 1) return 'pearlViolet';
  return 'pearlCool';
}

function MatterSculpture() {
  return (
    <div className="matterZone" aria-label="Glow living matter">
      <div className="matterGround" aria-hidden="true" />
      <div className="matterSculpture" aria-hidden="true">
        <div className="matterCore" />
        <div className="matterFold foldA" />
        <div className="matterFold foldB" />
        <div className="matterFold foldC" />
        <div className="matterFlare" />
      </div>
    </div>
  );
}

export function TodayGlowMatterCenter({ tasks, events, routines, energy, mood, sleepHours }: Props) {
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
    <div className="world">
      <style>{CSS}</style>
      <div className="stage">
        <header className="identityRidge">
          <div className="brand"><strong>Glow OS</strong><span className="batch">GLOW MATTER</span></div>
          <div className="worldName">WORLD 1 · TODAY · THE LIVING CENTER</div>
          <button type="button" className="askTop" onClick={() => openGlow()} aria-label="Ask Glow">
            <span className="pearl pearlTop" aria-hidden="true" />
            <span className="askTopLabel">Ask Glow<br/>⌘ K</span>
          </button>
        </header>

        <nav className="railSlab" aria-label="Today tools">
          <button className="railButton active" type="button" onClick={() => router.push('/today')}><span className="railMount"><span className="pearl pearlToday" aria-hidden="true"/></span><span>Today</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/tasks')}><span className="railMount"><Focus size={15}/></span><span>Focus</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/connections')}><span className="railMount"><Users size={15}/></span><span>People</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/world')}><span className="railMount"><MapPin size={15}/></span><span>Places</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/resources')}><span className="railMount"><LayoutGrid size={15}/></span><span>Resources</span></button>
          <button className="railButton" type="button" onClick={() => router.push('/planning')}><span className="railMount"><Route size={15}/></span><span>Journeys</span></button>
          <div className="railSpacer" />
          <button className="addOrb" type="button" onClick={() => openGlow('Create ')} aria-label="Create with Glow"><Plus size={14}/></button>
        </nav>

        <main className="center">
          <section className="chamber">
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
                <div className="infoCell"><div className="infoLabel">Capacity</div><div className="infoValue">{capacityText}</div><div className="capacityEtch"/></div>
                <div className="infoCell energyCell"><div><div className="infoLabel">Energy</div><div className="infoValue">{energyText}</div></div><span className="pearl energyPearl" aria-hidden="true"/></div>
                <div className="infoCell"><div className="infoLabel">Top 3 priorities</div>{topThree.length ? topThree.map((task, index) => <div className="priorityRow" key={task.id}><span className="priorityIndex">{index + 1}</span><span className="priorityText">{task.title}</span><span className="priorityNode"/></div>) : <div className="empty" style={{marginTop:7}}>No open priorities.</div>}</div>
              </div>
            </div>

            <div className="focusInset">
              <div className="focusCell"><div className="cellLabel">In focus</div><div className="cellTitle">{activeTask?.title ?? 'Open focus'}</div><div className="cellMeta">{activeTask ? <><div className="focusLine"/><span>{activeTask.priority}</span></> : 'No task is currently selected.'}</div></div>
              <div className="focusCell"><div className="cellLabel">Next up</div><div className="cellTitle">{nextTask?.title ?? 'Open'}</div><div className="cellMeta">{nextTask ? <><Focus size={11}/><span>{validNextTaskAt ? `${formatClock(validNextTaskAt)} · ${until(now, validNextTaskAt)}` : 'Flexible'}</span></> : routineContext}</div></div>
              <div className="focusCell"><div className="cellLabel">Appointments</div><div className="cellTitle">{nextEvent?.title ?? 'No appointment'}</div><div className="cellMeta">{nextEvent?.at ? <><CalendarDays size={11}/><span>{formatClock(nextEvent.at)}{nextEvent.location ? ` · ${nextEvent.location}` : ''}</span><button className="openContext" type="button" onClick={() => selectContext(nextEvent)}>Open</button></> : 'Your schedule is open.'}</div></div>
            </div>
          </section>

          <section className="timeVessel" aria-label="Today timeline">
            {(['NEXT','LATER','TONIGHT','TOMORROW'] as Bucket[]).map((bucket) => {
              const rowItems = buckets[bucket];
              const copy = bucketCopy(bucket);
              const first = rowItems[0];
              const second = rowItems[1];
              const countdownTarget = first?.at ?? null;
              const countLabel = bucket === 'NEXT' ? 'Time to next' : bucket === 'LATER' ? 'Time to later' : bucket === 'TONIGHT' ? 'Leave-ready' : 'Preview time';
              let countValue = countdownTarget ? until(now, countdownTarget) : 'Open';
              if (bucket === 'TONIGHT' && countdownTarget) countValue = until(now, new Date(countdownTarget.getTime() - 30 * 60 * 1000));
              if (bucket === 'TONIGHT' && !countdownTarget) countValue = 'Not set';
              const countTone = bucket === 'TONIGHT' ? 'pearlPeach' : bucket === 'TOMORROW' ? 'pearlCool' : '';
              return (
                <div className="timeBand" key={bucket}>
                  <div><div className="rowTime">{bucketTime(bucket,rowItems)}</div><div className="rowName">{bucket}</div><div className="rowCopy">{copy[0]}<br/>{copy[1]}</div></div>
                  <div>{first ? <button type="button" className="eventSlot" onClick={() => selectContext(first)}><span className={`pearl eventPearl ${pearlTone(bucket,0)}`}/><span><span className="eventTitle">{first.title}</span><span className="eventMeta">{formatRange(first)}<span className="tag">{first.kind}</span></span></span></button> : <div className="empty">Open space.</div>}</div>
                  <div>{second ? <button type="button" className="eventSlot" onClick={() => selectContext(second)}><span className={`pearl eventPearl ${pearlTone(bucket,1)}`}/><span><span className="eventTitle">{second.title}</span><span className="eventMeta">{formatRange(second)}<span className="tag">{second.kind}</span></span></span></button> : <div className="empty">Open space.</div>}</div>
                  <div className="countLens"><div className="countLabel">{countLabel}</div><div className="countValue">{countValue}</div>{countTone ? <span className={`pearl countMini ${countTone}`} aria-hidden="true"/> : null}</div>
                </div>
              );
            })}
          </section>

          <footer className="utility">
            <button className="dayTool" type="button" onClick={() => router.push('/calendar')}><CalendarDays size={11}/><span>Day view</span></button>
            <button className="replan" type="button" onClick={() => openGlow('Replan my day using my real tasks, calendar, priorities, and current capacity. Show me the proposal before changing anything.')}><Sparkles size={11}/><span>Replan my day</span></button>
            <div className="save"><span>All changes saved</span><span className="pearl cornerPearl" aria-hidden="true"/></div>
          </footer>
        </main>
      </div>
    </div>
  );

  return <div ref={hostRef}>{shadow ? createPortal(body, shadow) : null}</div>;
}
