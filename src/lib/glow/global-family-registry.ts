export type GlowFamilyStatus = 'ALREADY_SUPPORTED'|'NEEDS_CONFIGURATION'|'NEEDS_SHARED_ENGINE'|'TRUE_EXCEPTION';
export type GlowTemplateId = 'T01'|'T02'|'T03'|'T04'|'T05'|'T06'|'T07'|'T08'|'T09'|'T10'|'T11'|'T12'|'T13'|'T14'|'T15';

export type GlowFamily = {
  id:string;
  title:string;
  world:'today'|'plan'|'life'|'brain'|'create'|'beauty';
  rooms:string[];
  templates:GlowTemplateId[];
  coreObjects:string[];
  sharedEngines:string[];
  status:GlowFamilyStatus;
  exception?:string;
};

export const GLOW_FAMILIES:GlowFamily[]=[
 {id:'today',title:'Today',world:'today',rooms:['today','what-now','dayparts'],templates:['T01','T08','T09','T14'],coreObjects:['task','event','routine','meal','workout','outfit','purchase'],sharedEngines:['timeline','intelligence','review','object-projection'],status:'NEEDS_SHARED_ENGINE'},
 {id:'planning',title:'Planning',world:'plan',rooms:['planning-studio','calendar','goals','projects'],templates:['T02','T03','T04','T06','T09','T10','T11','T14'],coreObjects:['task','goal','project','event','reminder','time-block'],sharedEngines:['planner','timeline','object-detail','builder','progress'],status:'NEEDS_SHARED_ENGINE'},
 {id:'routines',title:'Routines',world:'life',rooms:['routine-home','daily-life','beauty','fitness','home','digital','food','travel'],templates:['T02','T03','T04','T06','T07','T08','T09','T11','T14'],coreObjects:['routine','routine-session','habit'],sharedEngines:['library','object-detail','builder','guided','timeline','progress'],status:'NEEDS_SHARED_ENGINE'},
 {id:'beauty',title:'Beauty',world:'beauty',rooms:['skincare','hair','makeup','body','nails','brows','lashes','oral','gua-sha','fragrance','tools'],templates:['T01','T02','T03','T04','T06','T07','T08','T09','T11','T12','T13','T14'],coreObjects:['product','routine','routine-session','tool','appointment','goal','observation'],sharedEngines:['beauty-routine','beauty-maintenance','library','object-detail','guided','timeline','progress'],status:'NEEDS_CONFIGURATION'},
 {id:'closet',title:'Closet + Style',world:'life',rooms:['closet','outfit-studio','style','packing','laundry'],templates:['T02','T03','T04','T05','T06','T08','T09','T11','T12'],coreObjects:['clothing-item','outfit','lookbook','capsule','laundry-state'],sharedEngines:['library','object-detail','studio','builder','intelligence','collection','progress'],status:'NEEDS_SHARED_ENGINE'},
 {id:'fitness-wellness',title:'Fitness + Wellness',world:'life',rooms:['fitness','workouts','recovery','sleep','nutrition','wellness'],templates:['T02','T03','T04','T07','T08','T09','T11','T13','T14'],coreObjects:['workout','exercise','workout-session','measurement','meal','wellness-observation'],sharedEngines:['library','object-detail','guided','timeline','progress','learn'],status:'NEEDS_SHARED_ENGINE'},
 {id:'money',title:'Money',world:'life',rooms:['money','accounts','spending','bills','goals'],templates:['T02','T03','T04','T08','T09','T10','T11'],coreObjects:['account','transaction','bill','subscription','savings-goal','purchase'],sharedEngines:['library','object-detail','timeline','planner','progress','intelligence'],status:'NEEDS_SHARED_ENGINE'},
 {id:'brain',title:'Brain',world:'brain',rooms:['notes','ideas','research','knowledge','journal','collections'],templates:['T01','T03','T04','T05','T08','T12','T13'],coreObjects:['note','document','idea','book','course','memory','collection'],sharedEngines:['library','object-detail','studio','intelligence','collection','learn'],status:'NEEDS_SHARED_ENGINE'},
 {id:'create',title:'Create',world:'create',rooms:['projects','moodboards','writing','images','design','assets'],templates:['T01','T03','T04','T05','T06','T12'],coreObjects:['creative-project','asset','draft','moodboard','template'],sharedEngines:['library','object-detail','studio','builder','collection'],status:'NEEDS_SHARED_ENGINE'},
 {id:'home',title:'Home',world:'life',rooms:['rooms','cleaning','inventory','storage','maintenance','projects'],templates:['T02','T03','T04','T06','T07','T09','T12'],coreObjects:['home-item','storage-location','chore','routine','maintenance','home-project'],sharedEngines:['library','object-detail','builder','guided','timeline','collection'],status:'NEEDS_CONFIGURATION'},
 {id:'travel',title:'Travel',world:'life',rooms:['trips','itinerary','reservations','packing','places','budget'],templates:['T02','T03','T04','T06','T08','T09','T10','T12','T14'],coreObjects:['trip','reservation','place','event','packing-list','travel-document'],sharedEngines:['library','object-detail','builder','timeline','planner','collection','review'],status:'NEEDS_SHARED_ENGINE'},
 {id:'career-life',title:'Career + Life',world:'life',rooms:['career','jobs','applications','interviews','people','school'],templates:['T02','T03','T04','T06','T08','T09','T10','T11','T12'],coreObjects:['job','application','interview','company','person','document','goal'],sharedEngines:['library','object-detail','builder','intelligence','timeline','planner','progress'],status:'NEEDS_SHARED_ENGINE'},
];

export function familiesByEngine(engine:string){return GLOW_FAMILIES.filter(f=>f.sharedEngines.includes(engine));}
export function familiesByStatus(status:GlowFamilyStatus){return GLOW_FAMILIES.filter(f=>f.status===status);}
