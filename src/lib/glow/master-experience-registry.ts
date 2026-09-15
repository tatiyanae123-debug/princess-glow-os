import type { GlowExperienceConfig } from './experience-config';
import { validateGlowExperienceConfig } from './experience-config';

const registry=new Map<string,GlowExperienceConfig>();

export function registerGlowExperience(config:GlowExperienceConfig){
 const check=validateGlowExperienceConfig(config);
 if(!check.valid) throw new Error(`Invalid Glow experience ${config.experienceId}: ${check.errors.join(', ')}`);
 if(registry.has(config.experienceId)) throw new Error(`Duplicate Glow experience: ${config.experienceId}`);
 registry.set(config.experienceId,Object.freeze({...config}));
 return config;
}
export function getRegisteredExperience(id:string){return registry.get(id);}
export function listRegisteredExperiences(){return [...registry.values()];}
export function experiencesForFamily(family:string){return listRegisteredExperiences().filter(x=>x.family===family);}
export function validateMasterRegistry(){
 const ids=new Set<string>(); const errors:string[]=[];
 for(const x of registry.values()){if(ids.has(x.experienceId)) errors.push(`duplicate ${x.experienceId}`);ids.add(x.experienceId);const check=validateGlowExperienceConfig(x);errors.push(...check.errors.map(e=>`${x.experienceId}: ${e}`));}
 return {valid:errors.length===0,errors,count:registry.size};
}

// Registry is the control plane. Normal experiences are configuration records, not bespoke page architecture.
