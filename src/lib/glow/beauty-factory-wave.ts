export type BeautyRoomPlan={room:string;templates:string[];objects:string[];engines:string[];exception?:boolean};
export const BEAUTY_FACTORY_ROOMS:BeautyRoomPlan[]=[
 {room:'skincare',templates:['T02','T03','T04','T06','T07','T08','T09','T11','T13','T14'],objects:['product','routine','routine-session','goal','appointment'],engines:['library','object-detail','builder','guided','intelligence','timeline','progress','learn','review'],exception:true},
 {room:'hair',templates:['T02','T03','T04','T07','T08','T09','T11','T13'],objects:['product','routine','routine-session','appointment'],engines:['library','object-detail','guided','intelligence','timeline','progress','learn']},
 {room:'makeup',templates:['T02','T03','T04','T05','T08','T12','T13'],objects:['product'],engines:['library','object-detail','studio','intelligence','collection','learn']},
 {room:'body',templates:['T02','T03','T04','T07','T08','T09','T11'],objects:['product','routine','routine-session'],engines:['library','object-detail','guided','intelligence','timeline','progress']},
 {room:'nails',templates:['T02','T03','T04','T07','T09','T11'],objects:['product','routine','appointment'],engines:['library','object-detail','guided','timeline','progress']},
 {room:'brows',templates:['T02','T03','T04','T07','T09'],objects:['product','routine','appointment'],engines:['library','object-detail','guided','timeline']},
 {room:'lashes',templates:['T02','T03','T04','T07','T09'],objects:['product','routine','appointment'],engines:['library','object-detail','guided','timeline']},
 {room:'oral',templates:['T02','T03','T04','T07','T09','T11','T13'],objects:['product','routine','appointment'],engines:['library','object-detail','guided','timeline','progress','learn']},
 {room:'fragrance',templates:['T02','T03','T04','T08','T12'],objects:['product'],engines:['library','object-detail','intelligence','collection']},
 {room:'tools-devices',templates:['T02','T03','T04','T07','T13'],objects:['product','routine'],engines:['library','object-detail','guided','learn']},
 {room:'gua-sha',templates:['T02','T03','T04','T07','T08','T11','T13','T14'],objects:['routine','routine-session'],engines:['library','object-detail','guided','intelligence','progress','learn','review'],exception:true},
 {room:'maintenance',templates:['T02','T08','T09','T10','T14'],objects:['routine','appointment'],engines:['intelligence','timeline','planner','review']},
];
export const BEAUTY_FACTORY_GATES=['canonical-data-preserved','shared-shell','registered-experiences','shared-templates','state-machine','overlay-factory','responsive','accessibility','history','golden-exceptions'] as const;
export function beautyFactorySummary(){return {rooms:BEAUTY_FACTORY_ROOMS.length,exceptions:BEAUTY_FACTORY_ROOMS.filter(x=>x.exception).length};}
