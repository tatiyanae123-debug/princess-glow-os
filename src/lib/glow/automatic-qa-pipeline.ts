import type { GeneratedExperienceArtifacts } from './experience-generator';
import { buildQaPlan, evaluateQa, type QaResult } from './qa-regression';

export type QaStage='schema'|'types'|'build'|'states'|'interaction'|'accessibility'|'responsive'|'context'|'history'|'intelligence'|'golden';
export type QaPipelineResult={experienceId:string;required:string[];results:QaResult[];passed:boolean;missing:string[];failed:string[];goldenRequired:boolean};

export function runRecordedQa(artifact:GeneratedExperienceArtifacts,results:QaResult[],goldenRequired=false):QaPipelineResult{
 const required=buildQaPlan(artifact);
 const evaluated=evaluateQa(required,results);
 return {experienceId:artifact.definition.experienceId,required,results,...evaluated,goldenRequired};
}

export function canPromote(result:QaPipelineResult,{goldenApproved=false}:{goldenApproved?:boolean}={}){
 return result.passed&&(!result.goldenRequired||goldenApproved);
}

export const AUTOMATIC_QA_ORDER:QaStage[]=['schema','types','build','states','interaction','accessibility','responsive','context','history','intelligence','golden'];

// Build/type failures block migration. Golden approval is required only for master templates and registered visual exceptions, never faked by structural tests.
