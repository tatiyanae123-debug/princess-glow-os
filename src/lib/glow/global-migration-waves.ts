export type MigrationWave={id:string;families:string[];dependsOn?:string[];status:'PLANNED'|'BUILDING'|'QA'|'LOCKED'};
export const GLOBAL_MIGRATION_WAVES:MigrationWave[]=[
 {id:'A',families:['today','planning','routines'],dependsOn:['beauty-factory-proof'],status:'PLANNED'},
 {id:'B',families:['closet','fitness-wellness'],dependsOn:['A'],status:'PLANNED'},
 {id:'C',families:['money','home','food','travel','career-life'],dependsOn:['B'],status:'PLANNED'},
 {id:'D',families:['brain','create'],dependsOn:['C'],status:'PLANNED'},
];
export function nextMigrationWave(locked:string[]){return GLOBAL_MIGRATION_WAVES.find(w=>w.status!=='LOCKED'&&(w.dependsOn??[]).every(x=>locked.includes(x)));}
export const WAVE_LAW='A wave advances only after its shared-engine, canonical-data, automatic-QA and exception/Golden gates pass. Failures improve the factory first; they are not patched page by page.' as const;
