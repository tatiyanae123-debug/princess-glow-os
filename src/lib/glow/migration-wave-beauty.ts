export type WaveItem={id:string;experience:string;template:string;engine:string;mode:'CONFIGURE'|'MIGRATE'|'EXCEPTION';golden:boolean};

export const BEAUTY_WAVE_1:WaveItem[]=[
 {id:'beauty.skincare.home',experience:'Skincare Atelier Home',template:'T02',engine:'room-home',mode:'EXCEPTION',golden:true},
 {id:'beauty.skincare.today',experience:'Skincare Today',template:'T08',engine:'intelligence',mode:'CONFIGURE',golden:true},
 {id:'beauty.skincare.products',experience:'Product Library',template:'T03',engine:'library',mode:'MIGRATE',golden:true},
 {id:'beauty.skincare.product',experience:'Product Detail',template:'T04',engine:'object-detail',mode:'MIGRATE',golden:true},
 {id:'beauty.skincare.routines',experience:'Routine Library',template:'T03',engine:'library',mode:'CONFIGURE',golden:false},
 {id:'beauty.skincare.session',experience:'Guided Skincare',template:'T07',engine:'guided',mode:'MIGRATE',golden:true},
 {id:'beauty.skincare.calendar',experience:'Skincare Calendar',template:'T09',engine:'timeline',mode:'CONFIGURE',golden:true},
 {id:'beauty.skincare.progress',experience:'Skin Progress',template:'T11',engine:'progress',mode:'MIGRATE',golden:true},
 {id:'beauty.skincare.completion',experience:'Routine Completion',template:'T14',engine:'review',mode:'CONFIGURE',golden:true},
];

export const BEAUTY_WAVE_GATES=['canonical-object-preservation','experience-registration','shared-engine-connected','state-machine-connected','overlay-factory-connected','typecheck','vercel-build','functional-qa','responsive-qa','accessibility-qa','golden-qa-when-required','history-context-verified'] as const;

export function waveSummary(){return {items:BEAUTY_WAVE_1.length,golden:BEAUTY_WAVE_1.filter(x=>x.golden).length,exceptions:BEAUTY_WAVE_1.filter(x=>x.mode==='EXCEPTION').length};}

// This is the first bulk migration manifest. It does not authorize retiring old Beauty routes until all gates pass.
