import type { CanonicalObjectType } from './canonical-object-migration';

export type CanonicalGlowObject={id:string;type:CanonicalObjectType;properties:Record<string,unknown>;state?:Record<string,unknown>;history?:unknown[];relationships?:Record<string,string[]>;provenance?:{source:string;timestamp?:string;confidence?:number};actions?:string[]};
export type ObjectAdapter<T=unknown>={type:CanonicalObjectType;identify:(source:T)=>string;properties:(source:T)=>Record<string,unknown>;state?:(source:T)=>Record<string,unknown>;history?:(source:T)=>unknown[];relationships?:(source:T)=>Record<string,string[]>;provenance?:(source:T)=>CanonicalGlowObject['provenance'];actions?:(source:T)=>string[]};

export function adaptCanonicalObject<T>(source:T,adapter:ObjectAdapter<T>):CanonicalGlowObject{
 const id=adapter.identify(source); if(!id) throw new Error(`Canonical ${adapter.type} adapter returned an empty identity`);
 return {id,type:adapter.type,properties:adapter.properties(source),state:adapter.state?.(source),history:adapter.history?.(source),relationships:adapter.relationships?.(source),provenance:adapter.provenance?.(source),actions:adapter.actions?.(source)};
}

export const TEMPLATE_OBJECT_COMPATIBILITY:Partial<Record<CanonicalObjectType,string[]>>={
 product:['T03','T04','T07','T08','T12'],routine:['T03','T04','T06','T07','T08','T09','T14'],task:['T04','T09','T10','T14'],event:['T04','T09','T10'],goal:['T04','T10','T11'],project:['T03','T04','T05','T06','T10','T11'],workout:['T03','T04','T07','T09','T11'],outfit:['T04','T05','T08','T12'],purchase:['T04','T09','T11'],note:['T03','T04','T05','T12'],trip:['T04','T09','T10','T12'],appointment:['T04','T09'],
};
export function supportsTemplate(type:CanonicalObjectType,template:string){return TEMPLATE_OBJECT_COMPATIBILITY[type]?.includes(template)??false;}

// Adapters preserve existing source identity/data. They normalize projections without creating duplicate life objects.
