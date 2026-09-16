export type ConvergenceViolation='duplicate-navigation'|'duplicate-object-identity'|'page-owned-architecture'|'duplicate-state-machine'|'duplicate-overlay'|'rogue-css'|'token-bypass'|'context-bypass'|'disconnected-history'|'dead-ui'|'placeholder-data'|'legacy-route'|'responsive-gap'|'accessibility-gap';
export type ConvergenceFinding={surface:string;family:string;violation:ConvergenceViolation;severity:'BLOCKER'|'HIGH'|'MEDIUM';sharedOwner:string;details:string};

export const CONVERGENCE_OWNER:Record<ConvergenceViolation,string>={
 'duplicate-navigation':'global-shell','duplicate-object-identity':'canonical-object-layer','page-owned-architecture':'template-factory','duplicate-state-machine':'state-machine-factory','duplicate-overlay':'overlay-factory','rogue-css':'environment-tokens','token-bypass':'environment-tokens','context-bypass':'glow-context','disconnected-history':'history-layer','dead-ui':'experience','placeholder-data':'data-provenance','legacy-route':'route-factory','responsive-gap':'template-factory','accessibility-gap':'template-factory'
};

export function convergeGlow(findings:Omit<ConvergenceFinding,'sharedOwner'>[]){
 const normalized=findings.map(f=>({...f,sharedOwner:CONVERGENCE_OWNER[f.violation]}));
 const byOwner=normalized.reduce<Record<string,ConvergenceFinding[]>>((acc,f)=>{(acc[f.sharedOwner]??=[]).push(f);return acc;},{});
 const blockers=normalized.filter(f=>f.severity==='BLOCKER');
 return {findings:normalized,byOwner,blockers,canLock:blockers.length===0};
}

export const WHOLE_GLOW_CONVERGENCE_ORDER=['inventory-all-surfaces','detect-duplicate-ownership','group-by-highest-shared-ancestor','repair-ancestor-not-descendants','rerun-family-qa','rerun-golden-exceptions','verify-runtime-responsive-accessibility-history','authorize-legacy-retirement-only-after-parity'] as const;
