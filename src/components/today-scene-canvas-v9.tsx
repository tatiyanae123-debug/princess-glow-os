'use client';

import { useEffect, useRef } from 'react';
import { TODAY_LIVING_CENTER_REFERENCE } from '@/lib/design/today-living-center-reference';

const W=1067;
const H=800;

type Region={x:number;y:number;w:number;h:number;r?:number;blur?:number;wash?:number};

/*
  The approved reference is an art-direction source, but it also contains old demo ink.
  V9 originally blurred those pixels in place, which merely turned the obsolete UI into
  readable ghosts. This pass deliberately destroys the OLD INK while preserving the room.
  The live React layer is the only place product text is allowed to exist.
*/
const REGIONS:Region[]=[
  // old product chrome
  {x:8,y:22,w:118,h:39,r:9,blur:30,wash:.84},
  {x:918,y:18,w:145,h:62,r:18,blur:30,wash:.80},

  // old greeting / date
  {x:24,y:57,w:382,h:88,r:12,blur:30,wash:.84},

  // old NOW system
  {x:44,y:145,w:385,h:159,r:18,blur:30,wash:.73},
  {x:431,y:151,w:101,h:144,r:42,blur:30,wash:.70},

  // old What Now + Capacity ink
  {x:55,y:293,w:248,h:157,r:16,blur:29,wash:.75},
  {x:299,y:292,w:229,h:147,r:16,blur:29,wash:.73},

  // old countdown copy, intentionally stops before the Princess avatar
  {x:55,y:444,w:337,h:93,r:14,blur:29,wash:.74},

  // old replan copy
  {x:58,y:537,w:474,h:64,r:16,blur:28,wash:.72},

  // old priorities
  {x:55,y:596,w:500,h:130,r:18,blur:30,wash:.76},

  // old product-facing Living Glow Aura copy only, not the luminous body above it
  {x:585,y:315,w:205,h:163,r:28,blur:32,wash:.82},

  // old future rail copy
  {x:829,y:88,w:226,h:530,r:18,blur:31,wash:.78},

  // old routines + Ask Glow
  {x:626,y:596,w:220,h:132,r:18,blur:30,wash:.78},
  {x:836,y:596,w:220,h:132,r:18,blur:30,wash:.80},

  // old world navigation ink. Keep the architectural shelf, erase labels/icons.
  {x:224,y:724,w:612,h:70,r:24,blur:29,wash:.78},

  // old Saint label only. The portrait at the far right is preserved.
  {x:899,y:729,w:76,h:54,r:18,blur:28,wash:.76},
];

function roundPath(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
  const rr=Math.min(r,w/2,h/2);
  ctx.beginPath();
  ctx.moveTo(x+rr,y);
  ctx.arcTo(x+w,y,x+w,y+h,rr);
  ctx.arcTo(x+w,y+h,x,y+h,rr);
  ctx.arcTo(x,y+h,x,y,rr);
  ctx.arcTo(x,y,x+w,y,rr);
  ctx.closePath();
}

function hardClean(ctx:CanvasRenderingContext2D,image:HTMLImageElement,region:Region){
  const blur=region.blur??30;
  const pad=Math.max(64,blur*3);
  ctx.save();
  roundPath(ctx,region.x,region.y,region.w,region.h,region.r??12);
  ctx.clip();

  // Smear the local material until letterforms/icons no longer survive as shapes.
  ctx.filter=`blur(${blur}px) saturate(.78) brightness(1.055) contrast(.84)`;
  ctx.drawImage(
    image,
    Math.max(0,region.x-pad),Math.max(0,region.y-pad),
    Math.min(W,region.w+pad*2),Math.min(H,region.h+pad*2),
    region.x-pad,region.y-pad,region.w+pad*2,region.h+pad*2,
  );
  ctx.filter='none';

  // Pearl material is intentionally stronger than before. This is not a UI card;
  // it is part of the cleaned photographic surface and exists solely to kill stale ink.
  const wash=region.wash??.76;
  const pearl=ctx.createLinearGradient(region.x,region.y,region.x+region.w,region.y+region.h);
  pearl.addColorStop(0,`rgba(255,251,247,${Math.min(.94,wash+.08)})`);
  pearl.addColorStop(.42,`rgba(247,237,233,${wash})`);
  pearl.addColorStop(1,`rgba(239,225,222,${Math.max(.56,wash-.10)})`);
  ctx.fillStyle=pearl;
  ctx.fillRect(region.x,region.y,region.w,region.h);

  // Restore a small amount of luminous grain so cleaned zones do not read as flat paint.
  const light=ctx.createRadialGradient(
    region.x+region.w*.36,region.y+region.h*.28,0,
    region.x+region.w*.36,region.y+region.h*.28,Math.max(region.w,region.h)*.72,
  );
  light.addColorStop(0,'rgba(255,255,255,.21)');
  light.addColorStop(.42,'rgba(255,255,255,.07)');
  light.addColorStop(1,'rgba(255,255,255,0)');
  ctx.fillStyle=light;
  ctx.fillRect(region.x,region.y,region.w,region.h);
  ctx.restore();
}

function paint(canvas:HTMLCanvasElement){
  const ctx=canvas.getContext('2d',{alpha:false});
  if(!ctx)return;
  const image=new Image();
  image.decoding='async';
  image.onload=()=>{
    ctx.clearRect(0,0,W,H);
    ctx.drawImage(image,0,0,W,H);
    for(const region of REGIONS)hardClean(ctx,image,region);
  };
  image.src=TODAY_LIVING_CENTER_REFERENCE;
}

export function TodaySceneCanvasV9({className=''}:{className?:string}){
  const ref=useRef<HTMLCanvasElement|null>(null);
  useEffect(()=>{if(ref.current)paint(ref.current);},[]);
  return <canvas ref={ref} width={W} height={H} aria-hidden="true" className={className}/>;
}
