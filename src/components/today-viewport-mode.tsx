'use client';

import { useEffect } from 'react';

type TodayMode='reference'|'compact'|'portrait';

function isIPadLike(){if(typeof navigator==='undefined')return false;const ua=navigator.userAgent||'';const platform=navigator.platform||'';const touch=navigator.maxTouchPoints||0;return/iPad/i.test(ua)||(/Mac/i.test(platform)&&touch>1);}
function isPhoneLike(){if(typeof navigator==='undefined')return false;return/iPhone|iPod/i.test(navigator.userAgent||'');}
function viewportBox(){const vv=window.visualViewport;return{width:Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth||0),height:Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||0)};}
function physicalOrientation():'landscape'|'portrait'|'unknown'{
  if(typeof window==='undefined')return'unknown';const type=window.screen.orientation?.type||'';if(type.includes('landscape'))return'landscape';if(type.includes('portrait'))return'portrait';const legacy=(window as Window&{orientation?:number}).orientation;if(typeof legacy==='number')return Math.abs(legacy%180)===90?'landscape':'portrait';return'unknown';
}
function chooseTodayMode():TodayMode{
  const{width,height}=viewportBox();const ratio=height>0?width/height:1;
  // Full room requires true breathing room. Split View / Stage Manager gets its own horizontal camera.
  if(width>=920&&ratio>=1.16)return'reference';
  if(ratio>=1.02&&width>=520)return'compact';
  if(isIPadLike()&&physicalOrientation()==='landscape'&&width>=500)return'compact';
  if(isPhoneLike()&&ratio>=1.34&&width>=520)return'compact';
  return'portrait';
}
function applyTodayMode(){
  if(typeof window==='undefined')return;const mode=chooseTodayMode();const{width,height}=viewportBox();const root=document.documentElement;root.dataset.todayMode=mode;root.dataset.todayViewport=`${width}x${height}`;root.dataset.todayPhysical=isIPadLike()?`ipad-${physicalOrientation()}`:(isPhoneLike()?'iphone':'other');
}
export function TodayViewportMode(){
  useEffect(()=>{let frame=0;let settle=0;const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{applyTodayMode();clearTimeout(settle);settle=window.setTimeout(applyTodayMode,120);});};schedule();window.addEventListener('resize',schedule,{passive:true});window.addEventListener('orientationchange',schedule,{passive:true});window.visualViewport?.addEventListener('resize',schedule,{passive:true});window.visualViewport?.addEventListener('scroll',schedule,{passive:true});window.screen.orientation?.addEventListener?.('change',schedule);return()=>{cancelAnimationFrame(frame);clearTimeout(settle);window.removeEventListener('resize',schedule);window.removeEventListener('orientationchange',schedule);window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);window.screen.orientation?.removeEventListener?.('change',schedule);};},[]);return null;
}
