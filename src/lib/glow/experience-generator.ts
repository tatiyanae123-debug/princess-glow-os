import type { ExperienceDefinition } from './experience-renderer';
import { validateExperienceDefinition } from './experience-renderer';
import { SHARED_ENGINE_LIBRARY } from './shared-engine-library';

export type GeneratedExperienceArtifacts={
 definition:ExperienceDefinition;
 routeBinding:{experienceId:string;thinRoute:true};
 requiredStates:string[];
 requiredQa:string[];
 errors:string[];
};

const templateToEngine:Record<string,string>={T03:'library',T04:'object-detail',T06:'builder',T07:'guided',T08:'intelligence',T09:'timeline',T10:'planner',T11:'progress',T12:'collection',T13:'learn',T14:'review'};

export function generateExperience(definition:ExperienceDefinition):GeneratedExperienceArtifacts{
 const validation=validateExperienceDefinition(definition);
 const engineId=templateToEngine[definition.template];
 const engine=SHARED_ENGINE_LIBRARY.find(x=>x.id===engineId);
 const requiredStates=engine?.states??['loading','loaded','error'];
 const requiredQa=engine?.requiredQa??['responsive','accessibility','context-retention'];
 const errors=[...validation.errors];
 if(engineId&&!engine) errors.push(`missing shared engine ${engineId}`);
 return {definition,routeBinding:{experienceId:definition.experienceId,thinRoute:true},requiredStates,requiredQa,errors};
}

export function generateExperienceBatch(definitions:ExperienceDefinition[]){
 const generated=definitions.map(generateExperience);
 const duplicateIds=definitions.map(x=>x.experienceId).filter((id,i,a)=>a.indexOf(id)!==i);
 return {generated,valid:generated.every(x=>x.errors.length===0)&&duplicateIds.length===0,duplicateIds};
}

// Generator law: configuration may select registered architecture; it may not invent arbitrary styling or bypass canonical object identity.
