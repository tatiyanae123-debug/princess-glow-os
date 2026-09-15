import type { MigrationPlanItem } from './batch-h-auto-migration';

export type RuntimeConversion={route:string;family?:string;shell:'GLOBAL';engines:string[];canonicalObjects:string[];legacyCompatibility:true;retireLegacy:false;status:'READY_TO_ADAPT'|'EXCEPTION_REVIEW'|'BLOCKED'};
export function planRuntimeConversions(items:MigrationPlanItem[]):RuntimeConversion[]{return items.map(item=>({route:item.route.route,family:item.mapping.family,shell:'GLOBAL',engines:item.mapping.engines,canonicalObjects:item.mapping.objects,legacyCompatibility:true,retireLegacy:false,status:item.action==='BLOCKED'?'BLOCKED':item.action==='EXCEPTION_REVIEW'?'EXCEPTION_REVIEW':'READY_TO_ADAPT'}));}
export const RUNTIME_CONVERSION_ORDER=['inherit-global-shell','resolve-shared-template','resolve-shared-engines','bind-canonical-objects','bind-history','preserve-legacy-entry','run-qa-factory','golden-review-if-needed','retire-only-after-parity'] as const;
