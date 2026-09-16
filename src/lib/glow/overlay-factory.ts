import type { GlowOverlay } from './experience-config';

export type OverlayRequest={type:GlowOverlay;experienceId:string;objectId?:string;payload?:Record<string,unknown>;returnFocusId?:string};
export type OverlayInstance=OverlayRequest&{id:string;openedAt:number};

export function createOverlay(request:OverlayRequest,now=Date.now()):OverlayInstance{
 return {...request,id:`${request.experienceId}:${request.type}:${now}`,openedAt:now};
}

export type OverlayStack={items:OverlayInstance[]};
export function openOverlay(stack:OverlayStack,request:OverlayRequest):OverlayStack{return {...stack,items:[...stack.items,createOverlay(request)]};}
export function closeOverlay(stack:OverlayStack,id:string):OverlayStack{return {...stack,items:stack.items.filter(x=>x.id!==id)};}
export function topOverlay(stack:OverlayStack){return stack.items.at(-1);}

export const OVERLAY_BEHAVIOR={preserveExperienceContext:true,preserveActiveSession:true,restoreFocus:true,escapeDismissesWhenSafe:true,trapFocus:true,responsivePresentation:true} as const;

// Ask Glow, Quick Add, Peek, Picker, Compare, Inspector, Help, Confirmation and Receipt share this lifecycle and layering contract.
