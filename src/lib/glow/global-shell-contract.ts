import type { ExperienceContext } from './experience-renderer';

export type GlowMode='recovery'|'low'|'normal'|'high';
export type GlowShellContext={experience:ExperienceContext;mode:GlowMode;dateISO:string;attentionCount?:number;sync:'synced'|'syncing'|'offline'|'error';returnPath?:string[]};
export type GlowShellCapability='world-fold'|'spatial-back'|'search'|'ask-glow'|'shakti'|'attention-center'|'quick-capture'|'mode'|'sync-status'|'overlays';

export const GLOBAL_SHELL_CAPABILITIES:readonly GlowShellCapability[]=['world-fold','spatial-back','search','ask-glow','shakti','attention-center','quick-capture','mode','sync-status','overlays'];

export function createShellContext(input:GlowShellContext):GlowShellContext{return Object.freeze({...input,experience:{...input.experience},returnPath:[...(input.returnPath??[])]});}
export function shellBreadcrumbs(ctx:GlowShellContext){return [ctx.experience.world,ctx.experience.room,ctx.experience.experienceId].filter(Boolean) as string[];}
export function withExperience(ctx:GlowShellContext,experience:ExperienceContext):GlowShellContext{return createShellContext({...ctx,experience,returnPath:[...shellBreadcrumbs(ctx)]});}

export const GLOBAL_SHELL_LAW='Persistent destinations render inside one Global Glow Shell. Pages may project content but may not recreate global navigation, Ask Glow, attention, capture, mode, sync or overlay architecture.' as const;
