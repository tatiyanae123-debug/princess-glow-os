import type { ExperienceDefinition } from './experience-renderer';

export const REGISTERED_OVERLAYS=['peek','picker','action','compare','ask-glow','help','confirmation','receipt','quick-add','inspector'] as const;
export const REGISTERED_INTELLIGENCE=['I0','I1','I2','I3','I4','I5'] as const;
export type GlowOverlay=typeof REGISTERED_OVERLAYS[number];
export type GlowIntelligenceLevel=typeof REGISTERED_INTELLIGENCE[number];

const REGISTERED_OVERLAY_SET:ReadonlySet<string>=new Set<string>(REGISTERED_OVERLAYS);

export type GlowExperienceConfig=ExperienceDefinition & {
 title:string;
 family:string;
 classification:'PAGE'|'VARIANT'|'STATE'|'OVERLAY';
 intelligenceLevel:GlowIntelligenceLevel;
 actions?:string[];
 overlays?:GlowOverlay[];
 exceptionId?:string;
 lockId?:string;
};

export function defineGlowExperience(config:GlowExperienceConfig){return config;}
export function isRegisteredOverlay(value:string):value is GlowOverlay{return REGISTERED_OVERLAY_SET.has(value);}

export function validateGlowExperienceConfig(config:GlowExperienceConfig){
 const errors:string[]=[];
 if(!config.title) errors.push('missing title');
 if(!config.family) errors.push('missing family');
 if(config.overlays?.some(x=>!isRegisteredOverlay(x))) errors.push('contains unregistered overlay');
 if(config.classification==='OVERLAY'&&!config.overlays?.length) errors.push('overlay experience must declare overlay behavior');
 if(config.exceptionId&&!config.customComposition) errors.push('registered exception requires customComposition');
 return {valid:errors.length===0,errors};
}

// Configuration selects registered architecture only. It cannot contain one-off CSS/layout escape hatches.
