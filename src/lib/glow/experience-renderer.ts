import type { GlowTemplateId } from './global-family-registry';

export type ExperienceContext = {
 experienceId:string;
 world:string;
 room?:string;
 objectId?:string;
 objectType?:string;
 state?:string;
 variant?:string;
 entryPoint?:string;
 overlays?:string[];
 intelligence?:string;
};

export type ExperienceDefinition = ExperienceContext & {
 template:GlowTemplateId;
 environment?:string;
 customComposition?:string;
 filters?:Record<string,string>;
 requiredData?:string[];
 requiredPermissions?:string[];
};

export type ResolvedGlowExperience = {
 definition:ExperienceDefinition;
 template:GlowTemplateId;
 props:Record<string,unknown>;
 context:ExperienceContext;
};

export type ExperienceResolver = {
 getDefinition:(id:string)=>ExperienceDefinition|undefined;
 getObject?:(objectType:string|undefined,objectId:string|undefined)=>unknown;
 getState?:(definition:ExperienceDefinition)=>Record<string,unknown>;
 getIntelligence?:(definition:ExperienceDefinition)=>unknown;
};

export function resolveGlowExperience(id:string,resolver:ExperienceResolver):ResolvedGlowExperience{
 const definition=resolver.getDefinition(id);
 if(!definition) throw new Error(`Unknown Glow experience: ${id}`);
 const object=resolver.getObject?.(definition.objectType,definition.objectId);
 const state=resolver.getState?.(definition)??{};
 const intelligence=resolver.getIntelligence?.(definition);
 return {
  definition,
  template:definition.template,
  context:{experienceId:id,world:definition.world,room:definition.room,objectId:definition.objectId,objectType:definition.objectType,state:definition.state,variant:definition.variant,entryPoint:definition.entryPoint,overlays:definition.overlays,intelligence:definition.intelligence},
  props:{object,state,intelligence,filters:definition.filters,environment:definition.environment,customComposition:definition.customComposition},
 };
}

export function validateExperienceDefinition(x:ExperienceDefinition){
 const errors:string[]=[];
 if(!x.experienceId) errors.push('missing experienceId');
 if(!x.world) errors.push('missing world');
 if(!x.template) errors.push('missing template');
 if(x.template==='T07'&&!x.objectType) errors.push('guided experience requires an object type');
 return {valid:errors.length===0,errors};
}

// UI adapters should map `template` to shared React template components. Routes should only resolve identity/context and delegate here.
