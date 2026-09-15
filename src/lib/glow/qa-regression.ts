import type { GeneratedExperienceArtifacts } from './experience-generator';

export type QaResult={gate:string;passed:boolean;details?:string};
export type GoldenReference={id:string;experienceId:string;viewport:'desktop'|'ipad-landscape'|'ipad-portrait'|'mobile';referenceId:string;locked:boolean};

export const GLOBAL_QA_GATES=['registry','canonical-object','loading','empty','error','interaction','context-retention','responsive','accessibility','intelligence-provenance','history','no-dead-ui'] as const;

export const GOLDEN_REFERENCE_POLICY={
 compare:'master templates + registered exceptions only',
 descendants:'inherit unless explicitly exception-flagged',
 lockRequiresHumanVisualApproval:true,
} as const;

export function buildQaPlan(artifact:GeneratedExperienceArtifacts){
 return [...new Set([...GLOBAL_QA_GATES,...artifact.requiredQa])];
}

export function evaluateQa(required:string[],results:QaResult[]){
 const byGate=new Map(results.map(r=>[r.gate,r]));
 const missing=required.filter(g=>!byGate.has(g));
 const failed=required.filter(g=>byGate.get(g)?.passed===false);
 return {passed:missing.length===0&&failed.length===0,missing,failed};
}

export function mayLockGolden(reference:GoldenReference,qaPassed:boolean,humanVisualApproved:boolean){
 return reference.locked&&qaPassed&&humanVisualApproved;
}

// Visual QA is intentionally not faked by structural tests. Golden visual approval remains a distinct gate.
