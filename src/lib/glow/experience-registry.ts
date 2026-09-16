export type GlowTemplateId = 'T02'|'T03'|'T04'|'T06'|'T07'|'T08'|'T09'|'T11'|'T12'|'T13'|'T14';
export type GlowExperienceKind = 'page'|'variant'|'state'|'overlay';
export type MigrationDisposition = 'KEEP'|'REFACTOR'|'MERGE'|'REBUILD'|'RETIRE';

export type GlowExperience = {
  id: string;
  world: 'beauty';
  room: 'skincare-atelier';
  template: GlowTemplateId;
  kind: GlowExperienceKind;
  objectType?: 'product'|'routine'|'routine-session'|'skin-goal'|'skin-observation'|'treatment'|'storage-location'|'recommendation';
  filter?: Record<string,string>;
  intelligence?: 'I0'|'I1'|'I2'|'I3'|'I4'|'I5';
  overlays?: string[];
  golden?: boolean;
  customComposition?: string;
};

const category = (id:string, lane:string):GlowExperience => ({
  id:`beauty.skincare.${id}`, world:'beauty', room:'skincare-atelier', template:'T03', kind:'variant',
  objectType:'product', filter:{functionalLane:lane}, overlays:['product-peek','ask-glow'],
});

export const SKINCARE_EXPERIENCES: GlowExperience[] = [
  {id:'beauty.skincare.home',world:'beauty',room:'skincare-atelier',template:'T02',kind:'page',intelligence:'I3',golden:true,customComposition:'skincareAtelierArrival'},
  {id:'beauty.skincare.today',world:'beauty',room:'skincare-atelier',template:'T08',kind:'page',objectType:'recommendation',intelligence:'I3',golden:true},
  {id:'beauty.skincare.products',world:'beauty',room:'skincare-atelier',template:'T03',kind:'page',objectType:'product',intelligence:'I2',golden:true,overlays:['product-peek','compare','ask-glow','quick-add']},
  {id:'beauty.skincare.product',world:'beauty',room:'skincare-atelier',template:'T04',kind:'page',objectType:'product',intelligence:'I2',golden:true,overlays:['compare','ask-glow']},
  {id:'beauty.skincare.routines',world:'beauty',room:'skincare-atelier',template:'T03',kind:'page',objectType:'routine',intelligence:'I2',golden:true},
  {id:'beauty.skincare.routine',world:'beauty',room:'skincare-atelier',template:'T04',kind:'page',objectType:'routine',intelligence:'I2'},
  {id:'beauty.skincare.routine-builder',world:'beauty',room:'skincare-atelier',template:'T06',kind:'page',objectType:'routine',intelligence:'I3'},
  {id:'beauty.skincare.session',world:'beauty',room:'skincare-atelier',template:'T07',kind:'page',objectType:'routine-session',intelligence:'I3',golden:true,overlays:['product-peek','step-help','ask-glow']},
  {id:'beauty.skincare.calendar',world:'beauty',room:'skincare-atelier',template:'T09',kind:'page',objectType:'routine',intelligence:'I2',golden:true},
  {id:'beauty.skincare.progress',world:'beauty',room:'skincare-atelier',template:'T11',kind:'page',objectType:'skin-observation',intelligence:'I2',golden:true},
  {id:'beauty.skincare.goals',world:'beauty',room:'skincare-atelier',template:'T12',kind:'page',objectType:'skin-goal',intelligence:'I2'},
  {id:'beauty.skincare.learn',world:'beauty',room:'skincare-atelier',template:'T13',kind:'page',intelligence:'I1'},
  {id:'beauty.skincare.completion',world:'beauty',room:'skincare-atelier',template:'T14',kind:'state',objectType:'routine-session',intelligence:'I2',golden:true},
  category('cleanse','cleanse'), category('toner-exfoliation','toner-exfoliation'), category('serums','serum'),
  category('treatments','treatment'), category('moisturize-barrier','moisturize-barrier'), category('spot-care','spot-care'),
  category('eye-care','eye'), category('lip-care','lip'), category('masks','mask'),
];

export function getSkincareExperience(id:string){return SKINCARE_EXPERIENCES.find(x=>x.id===id);}
export const SKINCARE_GOLDEN_EXPERIENCES = SKINCARE_EXPERIENCES.filter(x=>x.golden).map(x=>x.id);
