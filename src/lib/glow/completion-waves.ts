import { chooseFinishAction, type FinishState } from './batches-x-z';

export type CompletionWaveId=1|2|3|4|5|6|7|8|9|10;
export type CompletionWave={id:CompletionWaveId;name:string;scope:string[];gates:string[];lockAfterPass:boolean};
export const COMPLETION_WAVES:CompletionWave[]=[
{id:1,name:'Global Core',scope:['global-shell','world-fold','navigation','glow-context','search','ask-glow','shakti','attention-center','overlays','canonical-objects','history','authentication-session'],gates:['build','runtime','navigation','canonical-data','history','auth-session','responsive','accessibility'],lockAfterPass:true},
{id:2,name:'Today + Planning + Routines',scope:['today','planning','routines','tasks','events','calendar','habits','energy','capacity','what-now','time'],gates:['data','functional','intelligence','history','responsive','visual','golden'],lockAfterPass:true},
{id:3,name:'Beauty',scope:['skincare','hair','makeup','body','nails','brows-lashes','oral','gua-sha','beauty-inventory','beauty-routines','beauty-maintenance','beauty-progress','beauty-intelligence'],gates:['canonical-data','functional','intelligence','visual','responsive','golden'],lockAfterPass:true},
{id:4,name:'Closet + Fitness + Wellness',scope:['closet','outfits','fitness','wellness','workouts','exercises','measurements','recovery','progress','recommendations','schedules'],gates:['canonical-data','functional','intelligence','history','visual','responsive'],lockAfterPass:true},
{id:5,name:'Life',scope:['money','home','food','travel','career-life','school','people','shopping','transportation','documents'],gates:['canonical-data','functional','relationships','history','intelligence','responsive'],lockAfterPass:true},
{id:6,name:'Brain + Create',scope:['brain','notes','ideas','knowledge','research','collections','create','projects','moodboards','assets','writing','design'],gates:['canonical-data','capture','search','relationships','functional','history','visual'],lockAfterPass:true},
{id:7,name:'Whole-App Visual Convergence',scope:['typography','materials','glass','spacing','environments','motion','responsive','visual-drift'],gates:['visual','responsive','reduced-motion','golden'],lockAfterPass:true},
{id:8,name:'Whole-App Functional Sweep',scope:['navigate','search','filter','open','add','edit','save','complete','delete','schedule','ask-glow','recommend','history','back'],gates:['actions','persistence','history','runtime','regression'],lockAfterPass:true},
{id:9,name:'Device + State Matrix',scope:['iphone','ipad','desktop','loading','empty','populated','error','low-energy','normal','high-energy','recovery'],gates:['responsive','accessibility','state','visual','runtime'],lockAfterPass:true},
{id:10,name:'Production Readiness',scope:['legacy-retirement','final-regression','auth','data','history','golden-exceptions','completion-rollup','production-merge-preparation'],gates:['zero-required-blockers','runtime-errors-clear','auth-data-history','golden-reviewed','final-regression'],lockAfterPass:false},
];

export type WaveEvidence={wave:CompletionWaveId;gate:string;passed:boolean;blockers:string[]};
export function evaluateCompletionWaves(evidence:WaveEvidence[]){return COMPLETION_WAVES.map(wave=>{const rows=evidence.filter(x=>x.wave===wave.id);const missing=wave.gates.filter(g=>!rows.some(r=>r.gate===g&&r.passed));const blockers=[...new Set(rows.flatMap(r=>r.blockers))];return {...wave,missing,blockers,passed:missing.length===0&&blockers.length===0};});}
export function nextCompletionWave(evidence:WaveEvidence[]){return evaluateCompletionWaves(evidence).find(x=>!x.passed)??null;}
export function completionNextAction(state:FinishState,rankedBlockers:{owner:string;blocker:string;impact:number}[]){return chooseFinishAction(state,rankedBlockers);}
export const COMPLETION_EXECUTION_LOOP=['census','rank-highest-impact-blocker','repair-highest-correct-ancestor','build-once','qa-affected-family','lock-passed-wave','recalculate-census','next-blocker'] as const;
export const COMPLETION_WAVE_LAW='From this point Glow work is completion-wave execution, not new abstract architecture. The next work item is the highest-impact evidenced blocker at the highest correct shared ancestor.' as const;
