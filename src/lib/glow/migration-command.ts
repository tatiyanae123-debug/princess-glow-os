import type { LiveSurfaceEvidence } from './live-app-classifier';
import { classifyLiveSurface } from './live-app-classifier';
import { generateMigrationPlan } from './bulk-migration-generator';

export type MigrationCommandInput={surface:LiveSurfaceEvidence;experienceId:string;family:string;template:string;canonicalTypes:string[];environment?:string;overlays?:string[]};
export type MigrationCommandOutput={classification:ReturnType<typeof classifyLiveSurface>;plan:ReturnType<typeof generateMigrationPlan>;experience:{id:string;family:string;template:string;environment?:string;overlays:string[]};canonicalTypes:string[];reviewRequired:boolean};

export function planGlowMigration(input:MigrationCommandInput):MigrationCommandOutput{
 const classification=classifyLiveSurface(input.surface);
 const plan=generateMigrationPlan(classification);
 return {classification,plan,experience:{id:input.experienceId,family:input.family,template:input.template,environment:input.environment,overlays:input.overlays??[]},canonicalTypes:input.canonicalTypes,reviewRequired:plan.blocked||classification.disposition==='TRUE_EXCEPTION'};
}

export function planGlowMigrationBatch(inputs:MigrationCommandInput[]){const outputs=inputs.map(planGlowMigration);return {ready:outputs.filter(x=>!x.reviewRequired),review:outputs.filter(x=>x.reviewRequired)};}

// Migration command plans preservation first. It never deletes or retires a live route automatically.
