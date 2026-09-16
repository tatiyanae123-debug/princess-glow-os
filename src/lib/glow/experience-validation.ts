import { SKINCARE_EXPERIENCES, SKINCARE_GOLDEN_EXPERIENCES, type GlowExperience } from './experience-registry';

const VALID_TEMPLATES=new Set(['T02','T03','T04','T06','T07','T08','T09','T11','T12','T13','T14']);
const VALID_OVERLAYS=new Set(['product-peek','product-picker','routine-picker','compare','ask-glow','step-help','ingredient-peek','calendar-peek','confirmation','receipt','quick-add']);

export type ExperienceValidation={id:string;valid:boolean;errors:string[]};

export function validateExperience(x:GlowExperience):ExperienceValidation{
 const errors:string[]=[];
 if(!x.id.startsWith('beauty.skincare.')) errors.push('invalid registry namespace');
 if(x.world!=='beauty'||x.room!=='skincare-atelier') errors.push('invalid inheritance context');
 if(!VALID_TEMPLATES.has(x.template)) errors.push(`unknown template ${x.template}`);
 for(const overlay of x.overlays??[]) if(!VALID_OVERLAYS.has(overlay)) errors.push(`unknown overlay ${overlay}`);
 if(x.template==='T07'&&x.objectType!=='routine-session') errors.push('guided skincare must render a routine-session');
 if(x.template==='T04'&&!x.objectType) errors.push('object detail requires objectType');
 return {id:x.id,valid:errors.length===0,errors};
}

export function validateSkincareRegistry(){
 const results=SKINCARE_EXPERIENCES.map(validateExperience);
 const duplicateIds=SKINCARE_EXPERIENCES.map(x=>x.id).filter((id,i,a)=>a.indexOf(id)!==i);
 const missingGolden=SKINCARE_GOLDEN_EXPERIENCES.filter(id=>!SKINCARE_EXPERIENCES.some(x=>x.id===id));
 return {valid:results.every(x=>x.valid)&&duplicateIds.length===0&&missingGolden.length===0,results,duplicateIds,missingGolden};
}
