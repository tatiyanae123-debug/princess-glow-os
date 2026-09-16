export type BatchFFamily='closet'|'fitness-wellness'|'money'|'home'|'food'|'travel'|'career-life'|'brain'|'create';
export type BatchFWave={step:56|57|58;name:string;families:BatchFFamily[];sharedCapabilities:string[];canonicalObjects:string[];templates:string[];preserveExistingRoutes:true;retireOnlyAfterQa:true};

export const BATCH_F_WAVES:BatchFWave[]=[
 {step:56,name:'Wave B — Closet + Fitness + Wellness',families:['closet','fitness-wellness'],sharedCapabilities:['collections','object-detail','recommendations','progress','schedule','guided-experience','history','attachments'],canonicalObjects:['closet-item','outfit','workout','exercise','measurement','observation','routine','routine-session'],templates:['T02','T03','T04','T07','T08','T09','T11','T12','T14'],preserveExistingRoutes:true,retireOnlyAfterQa:true},
 {step:57,name:'Wave C — Life Systems',families:['money','home','food','travel','career-life'],sharedCapabilities:['planner','timeline','collections','object-detail','recommendations','documents','relationships','history','attention'],canonicalObjects:['transaction','bill','account','place','meal','trip','document','person','goal','project','task','event'],templates:['T02','T03','T04','T06','T08','T09','T10','T11','T12','T13','T14'],preserveExistingRoutes:true,retireOnlyAfterQa:true},
 {step:58,name:'Wave D — Brain + Create',families:['brain','create'],sharedCapabilities:['capture','collections','knowledge-relationships','workspace','builder','search','attachments','history','intelligence'],canonicalObjects:['note','idea','document','book','project','asset','collection','memory'],templates:['T02','T03','T04','T05','T06','T08','T11','T12','T13','T14'],preserveExistingRoutes:true,retireOnlyAfterQa:true},
];

export const BATCH_F_SHARED_ANCESTORS=['global-shell','glow-context','canonical-object-layer','template-factory','object-detail-engine','library-engine','timeline-engine','planner-engine','guided-engine','intelligence-engine','progress-engine','collection-engine','builder-engine','overlay-factory','state-machine-factory','environment-tokens','history-layer'] as const;
export const BATCH_F_GATES=['route-inventory-mapped','canonical-data-preserved','no-duplicate-identities','shell-and-context-inherited','template-and-engine-resolution','states-and-overlays-inherited','history-connected','responsive','accessibility','runtime-errors-clear','golden-exceptions-approved'] as const;

export function batchFSummary(){return {waves:BATCH_F_WAVES.map(w=>({step:w.step,name:w.name,families:w.families})),sharedAncestors:BATCH_F_SHARED_ANCESTORS,gates:BATCH_F_GATES};}

// Batch F registers the remaining family migration waves. It does not authorize deletion or claim visual completion; exceptions stop for Golden review instead of being guessed.
