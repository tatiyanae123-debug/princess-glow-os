import { inventoryAppRoutes, type GlowRouteInventoryItem } from './automatic-route-inventory';
import { mapGlowRoutes, type RouteMapping } from './automatic-route-mapper';

export type RepositorySurface={file:string;kind:'route'|'component'|'style'|'api'|'layout'|'other'};
export type MigrationAction='AUTO_MIGRATE'|'PRESERVE_AND_ADAPT'|'EXCEPTION_REVIEW'|'BLOCKED';
export type MigrationPlanItem={route:GlowRouteInventoryItem;mapping:RouteMapping;action:MigrationAction;reasons:string[]};
export type MigrationException={file:string;route:string;reason:string;severity:'BLOCKER'|'HIGH'|'MEDIUM';owner:string};

export function scanGlowRepository(files:string[]){
 const routes=inventoryAppRoutes(files);
 const surfaces:RepositorySurface[]=files.map(file=>({file,kind:file.startsWith('src/app/api/')?'api':/\/layout\.(t|j)sx?$/.test(file)?'layout':/src\/app\/.+\/page\.(t|j)sx?$/.test(file)?'route':/\.module\.css$|\.css$/.test(file)?'style':/src\/components\//.test(file)?'component':'other'}));
 return {routes,surfaces,counts:{files:files.length,routes:routes.length,components:surfaces.filter(x=>x.kind==='component').length,styles:surfaces.filter(x=>x.kind==='style').length,apis:surfaces.filter(x=>x.kind==='api').length}};
}

export function planWholeAppMigration(files:string[]){
 const scan=scanGlowRepository(files);const mapped=mapGlowRoutes(scan.routes);
 const plans:MigrationPlanItem[]=mapped.mappings.map(mapping=>{const route=scan.routes.find(r=>r.file===mapping.file)!;const reasons:string[]=[];let action:MigrationAction='AUTO_MIGRATE';
  if(mapping.confidence==='LOW'){action='BLOCKED';reasons.push('low-confidence family mapping');}
  else if(mapping.reviewRequired){action='EXCEPTION_REVIEW';reasons.push('mapping requires human/Golden review');}
  if(route.dynamic&&action==='AUTO_MIGRATE'){action='PRESERVE_AND_ADAPT';reasons.push('dynamic route requires compatibility preservation');}
  return {route,mapping,action,reasons};});
 return {scan,mapped,plans,automatic:plans.filter(x=>x.action==='AUTO_MIGRATE'||x.action==='PRESERVE_AND_ADAPT'),exceptions:plans.filter(x=>x.action==='EXCEPTION_REVIEW'||x.action==='BLOCKED')};
}

export function executeSafeMigrationPlan(plan:ReturnType<typeof planWholeAppMigration>){
 return plan.automatic.map(item=>({file:item.route.file,route:item.route.route,family:item.mapping.family,world:item.mapping.world,room:item.mapping.room,templates:item.mapping.templates,objects:item.mapping.objects,engines:item.mapping.engines,mode:item.action,preserveRoute:true,preserveCanonicalData:true,preserveHistory:true,retireLegacy:false}));
}

export function buildMigrationExceptionInbox(plan:ReturnType<typeof planWholeAppMigration>):MigrationException[]{return plan.exceptions.map(item=>({file:item.route.file,route:item.route.route,reason:item.reasons.join('; ')||'review required',severity:item.action==='BLOCKED'?'BLOCKER':'HIGH',owner:item.mapping.confidence==='LOW'?'registry-mapping':'golden-exception-review'}));}

export const BATCH_H_PIPELINE=['repository-scan','route-and-surface-inventory','registered-family-mapping','migration-plan','safe-execution-manifest','exception-inbox','qa-before-retirement'] as const;
export const BATCH_H_LAW='Automatic migration is preservation-first and non-destructive. Ambiguous, reference-critical or unsafe surfaces stop in the exception inbox. No executor manifest authorizes legacy deletion before parity and QA.' as const;
