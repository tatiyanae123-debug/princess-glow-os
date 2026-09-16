import { planWholeAppMigration, executeSafeMigrationPlan, buildMigrationExceptionInbox } from './batch-h-auto-migration';
import { planRuntimeConversions } from './runtime-conversion-planner';
import { convergeGlow, type ConvergenceFinding } from './whole-glow-convergence';

export function executeRepositoryInventory(files:string[]){const migration=planWholeAppMigration(files);return {migration,safeManifest:executeSafeMigrationPlan(migration),exceptionInbox:buildMigrationExceptionInbox(migration)};}
export const BATCH_O={steps:{89:'real-repository-inventory',90:'real-migration-manifest',91:'real-exception-inbox',92:'remaining-work-summary'},law:'Repository evidence, not estimates, defines remaining Glow work.'} as const;

export function createBulkConversionManifest(files:string[]){const execution=executeRepositoryInventory(files);return {execution,runtime:planRuntimeConversions(execution.migration.plans),eligible:execution.safeManifest.map(x=>x.route),blocked:execution.exceptionInbox.map(x=>x.route)};}
export const BATCH_P={steps:{93:'safe-bulk-route-conversion',94:'thin-factory-projections',95:'shared-template-engine-binding',96:'legacy-url-data-compatibility'},law:'Bulk conversion preserves URLs, canonical data and history. Ambiguous surfaces stop rather than being destructively rewritten.'} as const;

export type RootRepair={owner:string;violations:ConvergenceFinding[];priority:'BLOCKER'|'HIGH'|'MEDIUM';affectedSurfaces:string[]};
export function buildRootRepairQueue(findings:Omit<ConvergenceFinding,'sharedOwner'>[]){const result=convergeGlow(findings);const repairs=Object.entries(result.byOwner).map(([owner,violations])=>({owner,violations,priority:violations.some(v=>v.severity==='BLOCKER')?'BLOCKER':violations.some(v=>v.severity==='HIGH')?'HIGH':'MEDIUM',affectedSurfaces:[...new Set(violations.map(v=>v.surface))]} as RootRepair));return {...result,repairs:repairs.sort((a,b)=>({BLOCKER:0,HIGH:1,MEDIUM:2}[a.priority]-{BLOCKER:0,HIGH:1,MEDIUM:2}[b.priority]))};}
export const BATCH_Q={steps:{97:'whole-app-convergence-run',98:'shared-owner-grouping',99:'ancestor-first-repair-queue',100:'convergence-regression-gate'},law:'Repair the highest shared owner once, then rerun all affected descendants.'} as const;

export type GoldenEvidence={experience:string;referenceId:string;device:'iphone'|'ipad'|'desktop';state:string;referenceCritical:boolean;architecturePass:boolean;visualPass:boolean;responsivePass:boolean;accessibilityPass:boolean};
export function evaluateGoldenMatrix(items:GoldenEvidence[]){const evaluated=items.map(x=>({...x,passed:x.architecturePass&&x.visualPass&&x.responsivePass&&x.accessibilityPass}));return {evaluated,passed:evaluated.filter(x=>x.passed),exceptions:evaluated.filter(x=>!x.passed),canApprove:evaluated.every(x=>x.passed||!x.referenceCritical)};}
export const BATCH_R={steps:{101:'reference-to-experience-binding',102:'golden-device-state-matrix',103:'visual-exception-inbox',104:'golden-approval-gate'},law:'Locked references are acceptance evidence for registered experiences, not separate page architectures. Reference-critical failures remain explicit exceptions until approved.'} as const;

export const O_R_PIPELINE=['scan-real-repository','map-real-surfaces','produce-safe-manifest','bulk-convert-eligible-surfaces','preserve-legacy-compatibility','run-convergence','repair-shared-ancestors','run-golden-matrix','review-only-exceptions'] as const;
