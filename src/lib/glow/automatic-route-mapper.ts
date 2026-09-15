import type { GlowRouteInventoryItem } from './automatic-route-inventory';
import { GLOW_FAMILIES, type GlowFamily } from './global-family-registry';

export type RouteMapping={route:string;file:string;family?:string;world?:string;room?:string;templates:string[];objects:string[];engines:string[];confidence:'HIGH'|'MEDIUM'|'LOW';reviewRequired:boolean};
const aliases:Record<string,string>={finance:'money',fitness:'fitness-wellness',wellness:'fitness-wellness',closet:'closet',beauty:'beauty',today:'today',planning:'planning',plan:'planning',routines:'routines',routine:'routines',brain:'brain',create:'create',home:'home',travel:'travel',career:'career-life'};
function scoreFamily(item:GlowRouteInventoryItem,family:GlowFamily){const text=item.segments.join(' ').toLowerCase();let score=0;if(text.includes(family.id))score+=5;if(text.includes(family.world.toLowerCase()))score+=2;for(const room of family.rooms)if(text.includes(room.toLowerCase()))score+=3;return score;}
export function mapGlowRoute(item:GlowRouteInventoryItem):RouteMapping{
 const first=item.segments[0]?.toLowerCase();const alias=first&&aliases[first];
 const ranked=GLOW_FAMILIES.map(f=>({f,score:scoreFamily(item,f)+(alias===f.id?8:0)})).sort((a,b)=>b.score-a.score);
 const winner=ranked[0];const tied=winner&&ranked[1]&&winner.score===ranked[1].score;const confidence=winner?.score>=8&&!tied?'HIGH':winner?.score>=3&&!tied?'MEDIUM':'LOW';
 return {route:item.route,file:item.file,family:confidence==='LOW'?undefined:winner?.f.id,world:confidence==='LOW'?undefined:winner?.f.world,room:confidence==='LOW'?undefined:item.segments[1]??winner?.f.rooms[0],templates:confidence==='LOW'?[]:winner?.f.templates??[],objects:confidence==='LOW'?[]:winner?.f.coreObjects??[],engines:confidence==='LOW'?[]:winner?.f.sharedEngines??[],confidence,reviewRequired:confidence!=='HIGH'};
}
export function mapGlowRoutes(items:GlowRouteInventoryItem[]){const mappings=items.filter(x=>x.needsMapping).map(mapGlowRoute);return {mappings,automatic:mappings.filter(x=>!x.reviewRequired),review:mappings.filter(x=>x.reviewRequired)};}
export const ROUTE_MAPPING_LAW='Automatic mapping may select only registered Glow families and their inherited contracts. Low-confidence or ambiguous routes are review items, never guessed into a destructive migration.' as const;
