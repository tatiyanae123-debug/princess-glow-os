'use client';

import { useEffect, useRef } from 'react';
import { TODAY_LIVING_CENTER_REFERENCE } from '@/lib/design/today-living-center-reference';

const W=1067;
const H=800;

type Region={x:number;y:number;w:number;h:number;r?:number;blur?:number;wash?:number};

// Clean only stale/demo ink. The room, host surfaces, photographed Shakti, furniture,
// flowers and Princess avatar remain part of the approved environment.
const REGIONS:Region[]=[
  {x:42,y:30,w:112,h:30,r:7,blur:17,wash:.10},
  {x:904,y:22,w:139,h:52,r:16,blur:16,wash:.10},
  {x:54,y:63,w:330,h:64,r:9,blur:20,wash:.12},
  {x:69,y:157,w:337,h:145,r:12,blur:18,wash:.14},
  {x:444,y:164,w:80,h:124,r:34,blur:17,wash:.11},
  {x:72,y:305,w:224,h:142,r:12,blur:17,wash:.13},
  {x:307,y:304,w:215,h:128,r:12,blur:17,wash:.12},
  {x:71,y:454,w:322,h:80,r:10,blur:17,wash:.13},
  {x:78,y:548,w:454,h:48,r:12,blur:16,wash:.12},
  {x:72,y:611,w:475,h:107,r:12,blur:17,wash:.13},
  {x:602,y:330,w:167,h:134,r:18,blur:22,wash:.10},
  {x:843,y:103,w:194,h:506,r:10,blur:18,wash:.11},
  {x:642,y:613,w:198,h:108,r:11,blur:17,wash:.12},
  {x:843,y:613,w:197,h:108,r:11,blur:17,wash:.12},
  {x:241,y:735,w:575,h:58,r:20,blur:15,wash:.10},
  {x:912,y:741,w:56,h:45,r:18,blur:15,wash:.09},
];

function roundPath(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
  const rr=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+rr,y);ctx.arcTo(x+w,y,x+w,y+h,rr);ctx.arcTo(x+w,y+h,x,y+h,rr);ctx.arcTo(x,y+h,x,y,rr);ctx.arcTo(x,y,x+w,y,rr);ctx.closePath();
}
function frostRegion(ctx:CanvasRenderingContext2D,image:HTMLImageElement,region:Region){
  const pad=Math.max(24,(region.blur??16)*2);ctx.save();roundPath(ctx,region.x,region.y,region.w,region.h,region.r??8);ctx.clip();ctx.filter=`blur(${region.blur??16}px) saturate(.94)`;ctx.drawImage(image,region.x-pad,region.y-pad,region.w+pad*2,region.h+pad*2,region.x-pad,region.y-pad,region.w+pad*2,region.h+pad*2);ctx.filter='none';ctx.fillStyle=`rgba(248,240,237,${region.wash??.12})`;ctx.fillRect(region.x,region.y,region.w,region.h);const grad=ctx.createLinearGradient(region.x,region.y,region.x+region.w,region.y+region.h);grad.addColorStop(0,'rgba(255,255,255,.10)');grad.addColorStop(.52,'rgba(255,255,255,0)');grad.addColorStop(1,'rgba(226,210,208,.05)');ctx.fillStyle=grad;ctx.fillRect(region.x,region.y,region.w,region.h);ctx.restore();
}
function paint(canvas:HTMLCanvasElement){const ctx=canvas.getContext('2d',{alpha:false});if(!ctx)return;const image=new Image();image.decoding='async';image.onload=()=>{ctx.clearRect(0,0,W,H);ctx.drawImage(image,0,0,W,H);for(const region of REGIONS)frostRegion(ctx,image,region);};image.src=TODAY_LIVING_CENTER_REFERENCE;}
export function TodaySceneCanvasV9({className=''}:{className?:string}){const ref=useRef<HTMLCanvasElement|null>(null);useEffect(()=>{if(ref.current)paint(ref.current);},[]);return <canvas ref={ref} width={W} height={H} aria-hidden="true" className={className}/>;}
