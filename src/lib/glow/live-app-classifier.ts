export type LiveDisposition='KEEP'|'MIGRATE'|'MERGE'|'CONFIGURE'|'RETIRE'|'TRUE_EXCEPTION'|'NEEDS_REVIEW';
export type LiveSurfaceEvidence={path:string;usesAppShell?:boolean;usesSectionPage?:boolean;hasLargeLocalCss?:boolean;canonicalData?:boolean;duplicatesAnotherPath?:string;specialSpatialExperience?:boolean};
export type LiveClassification=LiveSurfaceEvidence&{disposition:LiveDisposition;reasons:string[]};

export function classifyLiveSurface(x:LiveSurfaceEvidence):LiveClassification{
 const reasons:string[]=[];
 if(x.specialSpatialExperience){reasons.push('registered spatial/custom composition candidate');return {...x,disposition:'TRUE_EXCEPTION',reasons};}
 if(x.duplicatesAnotherPath){reasons.push(`appears to overlap ${x.duplicatesAnotherPath}`);return {...x,disposition:'MERGE',reasons};}
 if(x.hasLargeLocalCss){reasons.push('local visual architecture should move into inherited tokens/templates');return {...x,disposition:'MIGRATE',reasons};}
 if(x.usesAppShell&&x.usesSectionPage){reasons.push('generic shell/page composition can become configuration-driven');return {...x,disposition:'CONFIGURE',reasons};}
 if(x.canonicalData){reasons.push('preserve canonical data while replacing projection architecture');return {...x,disposition:'MIGRATE',reasons};}
 reasons.push('insufficient evidence for safe automated disposition');return {...x,disposition:'NEEDS_REVIEW',reasons};
}

export const INITIAL_LIVE_AUDIT:LiveClassification[]=[
 classifyLiveSurface({path:'src/app/food/page.tsx',usesAppShell:true,usesSectionPage:true}),
 classifyLiveSurface({path:'src/app/money/page.tsx',usesAppShell:true}),
 classifyLiveSurface({path:'src/app/finance/page.tsx',usesAppShell:true,duplicatesAnotherPath:'src/app/money/page.tsx'}),
 classifyLiveSurface({path:'src/app/notes/page.tsx',usesAppShell:true}),
 classifyLiveSurface({path:'src/app/closet/page.tsx',canonicalData:true}),
 classifyLiveSurface({path:'src/app/fitness/page.tsx',canonicalData:true}),
 classifyLiveSurface({path:'src/app/timeline/page.tsx',canonicalData:true}),
 classifyLiveSurface({path:'src/app/wellness/page.tsx',canonicalData:true}),
 classifyLiveSurface({path:'src/app/settings/page.tsx',usesAppShell:true}),
];

// This classifier is conservative by design: RETIRE requires stronger route/data evidence than a filename match.
