export type EngineState='loading'|'loaded'|'empty'|'partial'|'error'|'offline';
export type EngineAction={id:string;label:string;kind:'read'|'draft'|'suggest'|'confirm'|'execute'|'sensitive'};

export type SharedEngineContract={
 id:string;
 template:string;
 purpose:string;
 accepts:string[];
 states:EngineState[];
 capabilities:string[];
 requiredQa:string[];
};

const commonQa=['loading','empty','error','responsive','accessibility','context-retention'];

export const SHARED_ENGINE_LIBRARY:SharedEngineContract[]=[
 {id:'object-detail',template:'T04',purpose:'Render one canonical Glow Object',accepts:['object','relationships','history','actions','intelligence'],states:['loading','loaded','partial','error','offline'],capabilities:['identity','state','relationships','history','provenance','actions'],requiredQa:commonQa},
 {id:'library',template:'T03',purpose:'Discover canonical objects',accepts:['collection','filters','sort','search','groups'],states:['loading','loaded','empty','partial','error','offline'],capabilities:['search','filter','sort','group','preview','open'],requiredQa:commonQa},
 {id:'guided',template:'T07',purpose:'Execute a session against a canonical definition',accepts:['definition','session','steps','resources'],states:['loading','loaded','partial','error','offline'],capabilities:['prepare','start','pause','resume','skip','complete','history'],requiredQa:[...commonQa,'session-persistence','interruption-recovery']},
 {id:'builder',template:'T06',purpose:'Create or edit structured Glow Objects',accepts:['draft','constraints','components','validation'],states:['loading','loaded','partial','error','offline'],capabilities:['edit','validate','preview','save'],requiredQa:[...commonQa,'unsaved-work-protection']},
 {id:'timeline',template:'T09',purpose:'Project canonical objects through time',accepts:['objects','range','currentTime','capacity'],states:['loading','loaded','empty','partial','error','offline'],capabilities:['now','upcoming','reschedule','conflict','capacity'],requiredQa:commonQa},
 {id:'planner',template:'T10',purpose:'Turn commitments, priorities and capacity into a plan',accepts:['commitments','priorities','capacity','goals'],states:['loading','loaded','empty','partial','error','offline'],capabilities:['propose','adjust','commit','review'],requiredQa:[...commonQa,'capacity-protection']},
 {id:'intelligence',template:'T08',purpose:'Interpret context and offer structured decisions/actions',accepts:['context','objects','history','intent'],states:['loading','loaded','empty','partial','error','offline'],capabilities:['interpret','recommend','explain','alternatives','confidence','act'],requiredQa:[...commonQa,'provenance','fact-inference-separation']},
 {id:'progress',template:'T11',purpose:'Interpret meaningful change over time',accepts:['subject','records','metrics','history'],states:['loading','loaded','empty','partial','error','offline'],capabilities:['metrics','patterns','interpretation','next-actions'],requiredQa:[...commonQa,'no-false-causation']},
 {id:'collection',template:'T12',purpose:'Curate relationships among canonical objects',accepts:['collection','objects','arrangement','context'],states:['loading','loaded','empty','partial','error','offline'],capabilities:['arrange','add','remove','relate'],requiredQa:commonQa},
 {id:'learn',template:'T13',purpose:'Connect reference knowledge back to the life model',accepts:['topic','content','media','relatedObjects'],states:['loading','loaded','empty','partial','error','offline'],capabilities:['explain','steps','examples','apply'],requiredQa:commonQa},
 {id:'review',template:'T14',purpose:'Close an action or period and update history/learning',accepts:['result','changes','history','reflection'],states:['loading','loaded','partial','error','offline'],capabilities:['summarize','record','reflect','continue'],requiredQa:commonQa},
];

export function getSharedEngine(id:string){return SHARED_ENGINE_LIBRARY.find(x=>x.id===id);}
