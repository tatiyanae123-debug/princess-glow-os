export type RouteSurfaceKind='PAGE'|'LAYOUT'|'API'|'DYNAMIC'|'QUERY_PROJECTION';
export type GlowRouteInventoryItem={file:string;route:string;kind:RouteSurfaceKind;segments:string[];dynamic:boolean;needsMapping:boolean};

function normalizeRoute(file:string){
 const relative=file.replace(/^src\/app/,'').replace(/\/(page|layout)\.(tsx|ts|jsx|js)$/,'').replace(/\/route\.(tsx|ts|jsx|js)$/,'');
 const segments=relative.split('/').filter(Boolean).filter(x=>!/^\(.*\)$/.test(x));
 return '/'+segments.join('/');
}
export function inventoryAppRoutes(files:string[]):GlowRouteInventoryItem[]{
 return files.filter(file=>/^src\/app\//.test(file)&&/(page|layout|route)\.(tsx|ts|jsx|js)$/.test(file)).map(file=>{
  const route=normalizeRoute(file);const segments=route.split('/').filter(Boolean);const dynamic=segments.some(x=>x.startsWith('['));
  const kind:RouteSurfaceKind=file.match(/\/route\./)?'API':file.match(/\/layout\./)?'LAYOUT':dynamic?'DYNAMIC':'PAGE';
  return {file,route:route||'/',kind,segments,dynamic,needsMapping:kind==='PAGE'||kind==='DYNAMIC'};
 }).sort((a,b)=>a.route.localeCompare(b.route));
}
export function routeInventorySummary(items:GlowRouteInventoryItem[]){return {total:items.length,pages:items.filter(x=>x.kind==='PAGE'||x.kind==='DYNAMIC').length,layouts:items.filter(x=>x.kind==='LAYOUT').length,api:items.filter(x=>x.kind==='API').length,dynamic:items.filter(x=>x.dynamic).length,unmapped:items.filter(x=>x.needsMapping).length};}

export const ROUTE_INVENTORY_LAW='Repository route discovery is generated from src/app file evidence. The inventory never invents a page that is not present in the scanned tree.' as const;
