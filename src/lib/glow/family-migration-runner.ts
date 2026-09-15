import { planGlowMigrationBatch, type MigrationCommandInput } from './migration-command';
import { auditSurfaces, type SurfaceInheritanceEvidence } from './inheritance-audit';

export type FamilyMigrationRequest={family:string;surfaces:MigrationCommandInput[];inheritance:SurfaceInheritanceEvidence[]};
export type RepairItem={family:string;surface:string;owner:string;severity:'BLOCKER'|'HIGH'|'MEDIUM';issue:string};

export function runFamilyMigration(request:FamilyMigrationRequest){
 const migration=planGlowMigrationBatch(request.surfaces);
 const inheritance=auditSurfaces(request.inheritance);
 const repairs:RepairItem[]=inheritance.flatMap(result=>result.violations.map(v=>({family:request.family,surface:result.surface,owner:v.owner,severity:v.severity,issue:v.issue})));
 const blockers=repairs.filter(x=>x.severity==='BLOCKER');
 return {family:request.family,migration,inheritance,repairs,canAdvance:migration.review.length===0&&blockers.length===0};
}

export const FAMILY_MIGRATION_ORDER=['scan','classify','preserve-canonical-data','register-experience','assign-template','connect-canonical-objects','connect-shared-engine','connect-state-and-overlays','switch-projection','automatic-qa','golden-exception-qa','retire-obsolete-code-after-parity'] as const;
export const FAMILY_MIGRATION_LAW='Bulk migration is preservation-first. A family advances only when blockers are repaired at the highest shared ancestor and review-required surfaces are resolved.' as const;
