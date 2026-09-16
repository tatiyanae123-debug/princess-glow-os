import { planGlowMigrationBatch, type MigrationCommandInput } from './migration-command';
import { auditSurfaces, type SurfaceAuditEvidence } from './inheritance-audit';

export type FamilyMigrationRequest={family:string;surfaces:MigrationCommandInput[];inheritance:SurfaceAuditEvidence[]};
export type RepairItem={family:string;surface:string;owner:string;severity:'BLOCKER'|'HIGH'|'MEDIUM';issue:string};

export function runFamilyMigration(request:FamilyMigrationRequest){
 const migration=planGlowMigrationBatch(request.surfaces);
 const inheritance=auditSurfaces(request.inheritance);
 const repairs:RepairItem[]=inheritance.findings.map(finding=>({family:request.family,surface:finding.path,owner:ownerForViolation(finding.violation),severity:finding.severity,issue:finding.details}));
 const blockers=repairs.filter(x=>x.severity==='BLOCKER');
 return {family:request.family,migration,inheritance,repairs,canAdvance:migration.review.length===0&&blockers.length===0};
}

function ownerForViolation(violation:string){if(violation==='duplicate-navigation'||violation==='context-bypass')return 'global-shell';if(violation==='duplicate-object-identity'||violation==='disconnected-history')return 'canonical-objects';if(violation==='duplicate-overlay')return 'overlay-factory';if(violation==='duplicate-state-machine')return 'state-machine-factory';if(violation==='token-bypass'||violation==='rogue-css')return 'environment-tokens';if(violation==='page-owned-architecture')return 'template-factory';return 'experience';}

export const FAMILY_MIGRATION_ORDER=['scan','classify','preserve-canonical-data','register-experience','assign-template','connect-canonical-objects','connect-shared-engine','connect-state-and-overlays','switch-projection','automatic-qa','golden-exception-qa','retire-obsolete-code-after-parity'] as const;
export const FAMILY_MIGRATION_LAW='Bulk migration is preservation-first. A family advances only when blockers are repaired at the highest shared ancestor and review-required surfaces are resolved.' as const;
