'use client';

import { useEffect } from 'react';

type TodayMode='reference'|'adaptive';

function isIPadLike(){if(typeof navigator==='undefined')return false;const ua=navigator.userAgent||'';const platform=navigator.platform||'';const touch=navigator.maxTouchPoints||0;return/iPad/i.test(ua)||(/Mac/i.test(platform)&&touch>1);}
function isPhoneLike(){if(typeof navigator==='undefined'||typeof window==='undefined')return false;if(/iPhone|iPod/i.test(navigator.userAgent||''))return true;if(isIPadLike())return false;const touch=(navigator.maxTouchPoints||0)>0;const shortest=Math.min(window.screen.width||9999,window.screen.height||9999);return touch&&shortest<700;}
function viewportBox(){const vv=window.visualViewport;return{width:Math.round(vv?.width||window.innerWidth||document.documentElement.clientWidth||0),height:Math.round(vv?.height||window.innerHeight||document.documentElement.clientHeight||0)};}
function physicalOrientation():'landscape'|'portrait'|'unknown'{
  if(typeof window==='undefined')return'unknown';const type=window.screen.orientation?.type||'';if(type.includes('landscape'))return'landscape';if(type.includes('portrait'))return'portrait';const angle=typeof window.screen.orientation?.angle==='number'?Math.abs(window.screen.orientation.angle%180):null;if(angle===90)return'landscape';if(angle===0)return'portrait';const legacy=(window as Window&{orientation?:number}).orientation;const l=typeof legacy==='number'?Math.abs(legacy%180):null;if(l===90)return'landscape';if(l===0)return'portrait';return'unknown';
}
function chooseTodayMode():TodayMode{
  const{width,height}=viewportBox();
  if(isPhoneLike())return'adaptive';
  const ratio=height>0?width/height:1;
  // The actual usable pane is authoritative. A landscape iPad in Split View or Stage
  // Manager is not treated like a full 4:3 canvas merely because the hardware is sideways.
  // The approved room only appears when the pane itself has enough width and breathing room.
  if(isIPadLike())return width>=980&&ratio>=1.08?'reference':'adaptive';
  return width>=1000&&ratio>=1.08?'reference':'adaptive';
}
function forceTodaySurfaces(mode:TodayMode){
  const root=document.documentElement;const{width,height}=viewportBox();const ipad=isIPadLike();root.dataset.todayMode=mode;root.dataset.todayPhysical=ipad?`ipad-${physicalOrientation()}`:(isPhoneLike()?'phone-like':'other');root.dataset.todayViewport=`${width}x${height}`;
  document.querySelectorAll<HTMLElement>('.today-landscape').forEach(node=>{const show=mode==='reference';node.style.setProperty('display',show?'block':'none','important');node.style.setProperty('visibility',show?'visible':'hidden','important');node.style.setProperty('pointer-events',show?'auto':'none','important');node.setAttribute('aria-hidden',show?'false':'true');});
  document.querySelectorAll<HTMLElement>('.today-portrait').forEach(node=>{const show=mode==='adaptive';node.style.setProperty('display',show?'block':'none','important');node.style.setProperty('visibility',show?'visible':'hidden','important');node.style.setProperty('pointer-events',show?'auto':'none','important');node.setAttribute('aria-hidden',show?'false':'true');});
}
function applyTodayMode(){if(typeof window!=='undefined')forceTodaySurfaces(chooseTodayMode());}
export function TodayViewportMode(){
  useEffect(()=>{let frame=0;let settle=0;const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{applyTodayMode();clearTimeout(settle);settle=window.setTimeout(applyTodayMode,140);});};schedule();window.addEventListener('resize',schedule,{passive:true});window.addEventListener('orientationchange',schedule,{passive:true});window.visualViewport?.addEventListener('resize',schedule,{passive:true});window.visualViewport?.addEventListener('scroll',schedule,{passive:true});window.screen.orientation?.addEventListener?.('change',schedule);const observer=new MutationObserver(records=>{if(records.some(record=>record.addedNodes.length||record.removedNodes.length))schedule();});observer.observe(document.body,{childList:true,subtree:true});return()=>{cancelAnimationFrame(frame);clearTimeout(settle);observer.disconnect();window.removeEventListener('resize',schedule);window.removeEventListener('orientationchange',schedule);window.visualViewport?.removeEventListener('resize',schedule);window.visualViewport?.removeEventListener('scroll',schedule);window.screen.orientation?.removeEventListener?.('change',schedule);};},[]);return null;
}
