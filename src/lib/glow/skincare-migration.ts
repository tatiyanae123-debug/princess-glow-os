import type { MigrationDisposition } from './experience-registry';

export type MigrationItem={path:string;disposition:MigrationDisposition;target:string;reason:string};

export const SKINCARE_MIGRATION:MigrationItem[]=[
 {path:'src/app/beauty/skincare/page.tsx',disposition:'REFACTOR',target:'beauty.skincare.home',reason:'Preserve the current real inventory/data work and Atelier visual work, but split the 26k page into shared Room, Library, Object, Intelligence and Timeline templates.'},
 {path:'src/app/beauty/skincare/skincare-treatment-lab.module.css',disposition:'REFACTOR',target:'skincare-atelier tokens/primitives',reason:'Preserve approved material language while extracting repeated values into room tokens and reusable primitives.'},
 {path:'src/app/beauty/skincare/layout.tsx',disposition:'KEEP',target:'skincare room layout',reason:'Keep the route boundary, then make it inherit the shared Glow/Beauty/Skincare context instead of adding descendant-local shells.'},
 {path:'src/lib/beauty/skincare-master.ts',disposition:'KEEP',target:'canonical beauty inventory source',reason:'This already contains the authoritative master inventory and skincare specs; do not duplicate product truth in page components.'},
 {path:'src/app/beauty/inventory',disposition:'MERGE',target:'beauty.skincare.products',reason:'Skincare inventory must be a projection of the canonical Beauty inventory rather than a second product database.'},
 {path:'src/app/beauty/progress',disposition:'MERGE',target:'beauty.skincare.progress',reason:'Use the shared Progress template with skincare-filtered canonical records.'},
 {path:'src/components/beauty/facial-massage-studio.tsx',disposition:'KEEP',target:'separate Gua Sha family',reason:'Related Beauty work, but not a Face Skincare descendant. It should later inherit shared Beauty primitives rather than be folded into skincare.'},
];

export const SKINCARE_LOCK_CONTRACT={
 family:'beauty.face-skincare',
 version:'v1',
 status:'BUILDING' as const,
 requiredGolden:['beauty.skincare.home','beauty.skincare.products','beauty.skincare.product','beauty.skincare.session','beauty.skincare.today','beauty.skincare.calendar','beauty.skincare.progress','beauty.skincare.completion'],
 requiredQa:['architecture','functional','data','intelligence','responsive','accessibility','golden-visual','regression'],
};
