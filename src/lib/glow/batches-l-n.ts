import { generateGlowExperience, type GlowGeneratorRequest } from './glow-generator';

export type GeneratedExperience={request:GlowGeneratorRequest;plan:ReturnType<typeof generateGlowExperience>;implementation:'GENERATE'|'EXCEPTION_DESIGN';reason?:string};
export function selfGenerateExperience(request:GlowGeneratorRequest):GeneratedExperience{const plan=generateGlowExperience(request);return {request,plan,implementation:plan.exceptionReview?'EXCEPTION_DESIGN':'GENERATE',reason:plan.exceptionReview?'Reference-critical or unresolved template architecture requires explicit review.':undefined};}
export const BATCH_L={steps:{77:'natural-request-to-glow-plan',78:'template-object-capability-generation',79:'implementation-manifest-generation',80:'exception-design-gate'},law:'New experiences begin as generated Glow projections. Custom architecture is reserved for explicit, justified exceptions.'} as const;

export type CleanupCandidate={path:string;kind:'route'|'component'|'style'|'state'|'navigation'|'placeholder'|'migration-scaffold';replacement?:string;parity:boolean;qa:boolean;referenced:boolean;canonicalDataOwner:boolean};
export function evaluateCleanup(candidates:CleanupCandidate[]){return candidates.map(c=>{const blockers:string[]=[];if(!c.replacement)blockers.push('no verified replacement');if(!c.parity)blockers.push('parity not proven');if(!c.qa)blockers.push('QA not passed');if(c.referenced)blockers.push('still referenced');if(c.canonicalDataOwner)blockers.push('owns canonical data');return {...c,safeToRetire:blockers.length===0,blockers};});}
export const BATCH_M={steps:{81:'legacy-candidate-inventory',82:'replacement-and-parity-proof',83:'reference-data-safety-check',84:'evidence-based-retirement'},law:'Old-looking code is not deletable code. Retirement requires verified replacement, parity, QA, zero live references and no canonical-data ownership.'} as const;

export type ChangeRequest={summary:string;affectedObjects:string[];affectedCapabilities:string[];requestedScope?:string};
export type ImpactNode={id:string;kind:'object'|'engine'|'template'|'experience'|'route'|'golden';dependsOn:string[]};
export function calculateImpact(request:ChangeRequest,nodes:ImpactNode[]){const seeds=new Set([...request.affectedObjects,...request.affectedCapabilities]);const affected=new Set<string>();let changed=true;while(changed){changed=false;for(const n of nodes){if(affected.has(n.id))continue;if(seeds.has(n.id)||n.dependsOn.some(d=>seeds.has(d)||affected.has(d))){affected.add(n.id);changed=true;}}}return nodes.filter(n=>affected.has(n.id));}
export const PERMANENT_PIPELINE=['understand-request','resolve-affected-canonical-objects','resolve-highest-inheritance-owner','calculate-impact-graph','generate-change','build-once','run-affected-qa','review-exceptions','preview','approve','ship'] as const;
export const BATCH_N={steps:{85:'request-intent-resolver',86:'impact-graph',87:'affected-only-build-and-qa',88:'permanent-development-pipeline'},pipeline:PERMANENT_PIPELINE,law:'Every future Glow change is made at the highest correct inheritance level, impact is known before shipping, and QA targets affected surfaces instead of manually rediscovering them.'} as const;

export const L_N_SAFETY='Generation and cleanup never bypass canonical identity, provenance, permissions, history, Golden review, QA or explicit production shipping approval.' as const;
