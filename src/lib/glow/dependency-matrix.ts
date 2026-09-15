import { GLOW_FAMILIES, familiesByEngine } from './global-family-registry';

export type EnginePriority = {
  engine:string;
  unlocks:number;
  families:string[];
  dependsOn:string[];
  priority:'P0'|'P1'|'P2';
};

const dependencies:Record<string,string[]>={
 'object-projection':['object-detail'],
 'object-detail':[],
 'library':['object-detail'],
 'timeline':['object-detail'],
 'intelligence':['object-detail'],
 'collection':['object-detail'],
 'progress':['object-detail','timeline'],
 'builder':['object-detail'],
 'guided':['object-detail'],
 'planner':['timeline','object-detail'],
 'studio':['object-detail'],
 'learn':['object-detail'],
 'review':['object-detail'],
 'beauty-routine':['guided','object-detail'],
 'beauty-maintenance':['timeline','object-detail'],
};

const engines=[...new Set(GLOW_FAMILIES.flatMap(f=>f.sharedEngines))];

export const GLOW_ENGINE_PRIORITIES:EnginePriority[]=engines.map(engine=>{
 const families=familiesByEngine(engine).map(f=>f.id);
 const unlocks=families.length;
 return {engine,unlocks,families,dependsOn:dependencies[engine]??[],priority:unlocks>=7?'P0':unlocks>=4?'P1':'P2'};
}).sort((a,b)=>b.unlocks-a.unlocks||a.engine.localeCompare(b.engine));

export const GLOBAL_BUILD_ORDER=[
 'object-detail',
 'library',
 'timeline',
 'intelligence',
 'collection',
 'builder',
 'guided',
 'progress',
 'planner',
 'studio',
 'learn',
 'review',
 'object-projection',
 'beauty-routine',
 'beauty-maintenance',
] as const;

export function validateBuildOrder(){
 const seen=new Set<string>();
 const errors:string[]=[];
 for(const engine of GLOBAL_BUILD_ORDER){
  for(const dependency of dependencies[engine]??[]) if(!seen.has(dependency)) errors.push(`${engine} appears before dependency ${dependency}`);
  seen.add(engine);
 }
 return {valid:errors.length===0,errors};
}
