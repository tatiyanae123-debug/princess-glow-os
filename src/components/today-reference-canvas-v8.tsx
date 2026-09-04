'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { TODAY_LIVING_CENTER_REFERENCE } from '@/lib/design/today-living-center-reference';

type Hole={x:number;y:number;w:number;h:number;feather?:number};
const W=1067;const H=800;
const TEXT_HOLES:Hole[]=[
  {x:28,y:47,w:393,h:67,feather:6},{x:54,y:146,w:367,h:150,feather:5},{x:432,y:146,w:88,h:137,feather:4},
  {x:54,y:300,w:246,h:150,feather:4},{x:307,y:300,w:214,h:151,feather:4},{x:54,y:459,w:469,h:72,feather:4},
  {x:55,y:546,w:474,h:56,feather:4},{x:55,y:616,w:520,h:105,feather:4},{x:567,y:343,w:169,h:101,feather:7},
  {x:851,y:104,w:190,h:507,feather:5},{x:649,y:616,w:193,h:106,feather:4},{x:848,y:615,w:194,h:108,feather:4},
];
function px(data:Uint8ClampedArray,width:number,x:number,y:number,channel:number){const ix=Math.max(0,Math.min(width-1,x));const iy=Math.max(0,Math.min(H-1,y));return data[(iy*width+ix)*4+channel]??0;}
function inpaintHole(imageData:ImageData,hole:Hole){
  const data=imageData.data;const x0=Math.max(2,Math.round(hole.x));const y0=Math.max(2,Math.round(hole.y));const x1=Math.min(W-3,Math.round(hole.x+hole.w));const y1=Math.min(H-3,Math.round(hole.y+hole.h));const width=Math.max(1,x1-x0);const height=Math.max(1,y1-y0);const original=new Uint8ClampedArray(data);const feather=Math.max(1,hole.feather??4);
  for(let y=y0;y<y1;y+=1){const v=(y-y0)/height;for(let x=x0;x<x1;x+=1){const u=(x-x0)/width;const edge=Math.min(x-x0,x1-1-x,y-y0,y1-1-y);const mix=Math.max(0,Math.min(1,edge/feather));const index=(y*W+x)*4;for(let c=0;c<3;c+=1){const left=px(original,W,x0-2,y,c);const right=px(original,W,x1+1,y,c);const top=px(original,W,x,y0-2,c);const bottom=px(original,W,x,y1+1,c);const lr=left*(1-u)+right*u;const tb=top*(1-v)+bottom*v;const diagonal=px(original,W,x0-2,y0-2,c)*(1-u)*(1-v)+px(original,W,x1+1,y0-2,c)*u*(1-v)+px(original,W,x0-2,y1+1,c)*(1-u)*v+px(original,W,x1+1,y1+1,c)*u*v;const filled=lr*.42+tb*.42+diagonal*.16;data[index+c]=Math.round(original[index+c]*(1-mix)+filled*mix);}data[index+3]=255;}}
}
function paint(canvas:HTMLCanvasElement){
  const ctx=canvas.getContext('2d',{alpha:false,willReadFrequently:true});if(!ctx)return;
  const image=new Image();image.decoding='async';image.onload=()=>{ctx.clearRect(0,0,W,H);ctx.drawImage(image,0,0,W,H);const imageData=ctx.getImageData(0,0,W,H);TEXT_HOLES.forEach(hole=>inpaintHole(imageData,hole));ctx.putImageData(imageData,0,0);};image.src=TODAY_LIVING_CENTER_REFERENCE;
}
export function TodayReferenceCanvasV8({className=''}:{className?:string}){const ref=useRef<HTMLCanvasElement|null>(null);useEffect(()=>{if(ref.current)paint(ref.current);},[]);return <canvas ref={ref} width={W} height={H} aria-hidden="true" className={className}/>;}

export function TodayVisualRepairV8(){
  const pathname=usePathname();
  useEffect(()=>{
    if(pathname!=='/today')return;
    let frame=0;let observer:MutationObserver|null=null;
    const mount=()=>{
      const stage=document.querySelector<HTMLElement>('.today-stage-v7');
      const baked=stage?.querySelector<HTMLImageElement>('.today-reference-v7');
      if(!stage||!baked||stage.querySelector('.today-clean-reference-v8'))return false;
      const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;canvas.className='today-clean-reference-v8 absolute inset-0 h-full w-full select-none';canvas.setAttribute('aria-hidden','true');
      stage.insertBefore(canvas,baked.nextSibling);paint(canvas);baked.style.setProperty('opacity','0','important');baked.style.setProperty('pointer-events','none','important');return true;
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>mount());};
    schedule();observer=new MutationObserver(schedule);observer.observe(document.body,{childList:true,subtree:true});
    return()=>{cancelAnimationFrame(frame);observer?.disconnect();document.querySelectorAll('.today-clean-reference-v8').forEach(node=>node.remove());document.querySelectorAll<HTMLElement>('.today-reference-v7').forEach(node=>node.style.removeProperty('opacity'));};
  },[pathname]);
  return null;
}
