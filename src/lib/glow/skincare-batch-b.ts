import { createThinRoute } from './thin-route-factory';
import { getSkincareExperience } from './experience-registry';
import { GLOBAL_SHELL_CAPABILITIES } from './global-shell-contract';

export const SKINCARE_SHELL_OWNERSHIP={
 global:[...GLOBAL_SHELL_CAPABILITIES,'glow-identity','current-world','current-room','current-experience'] as const,
 local:['atelier-environment','experience-content','skincare-filters','routine-step-content','product-content','progress-content'] as const,
 retireAfterParity:['ReferenceRail','local Ask Glow launcher','local persistent context/navigation'] as const,
};

export const SKINCARE_T02_EXCEPTION={
 id:'beauty.skincare.home.atelier-arrival',experienceId:'beauty.skincare.home',template:'T02',scope:'composition-only',
 keeps:['continuous Atelier environment','reference-critical arrival composition','Beauty/Skincare editorial identity'],
 mayNotOverride:['Global Glow Shell','canonical object identity','global overlays','global responsive/accessibility contracts'],
 goldenRequired:true,
} as const;

const bindings={
 home:{experienceId:'beauty.skincare.home',view:undefined},products:{experienceId:'beauty.skincare.products',view:'product-library'},product:{experienceId:'beauty.skincare.product',view:'product-detail'},session:{experienceId:'beauty.skincare.session',view:'guided-routine'},progress:{experienceId:'beauty.skincare.progress',view:'progress-photos'},
} as const;

export const SKINCARE_THIN_ROUTES=Object.fromEntries(Object.entries(bindings).map(([key,binding])=>{
 if(!getSkincareExperience(binding.experienceId)) throw new Error(`Missing skincare experience ${binding.experienceId}`);
 return [key,{...binding,resolve:createThinRoute(binding.experienceId)}];
}));

export function skincareExperienceFromLegacyView(view?:string){
 const match=Object.values(bindings).find(x=>x.view===view)??bindings.home;
 return match.experienceId;
}

export const SKINCARE_BATCH_B_GATES=[
 'legacy route preserved','shell ownership declared','T02 exception bounded','thin-route bindings registered','canonical data preserved','history preserved','build ready','runtime errors clear','responsive QA','accessibility QA','Golden approval for Atelier Home',
] as const;

// Transitional adapter: legacy query-param entry points may resolve registered experience identity while the current route remains intact. Retirement requires parity and QA.
