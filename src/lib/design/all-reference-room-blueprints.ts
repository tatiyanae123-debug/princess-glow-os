import { blueprintForRoom as baseBlueprintForRoom, type ReferenceRoomBlueprint } from '@/lib/design/reference-room-blueprints';
import { EXTRA_REFERENCE_ROOM_BLUEPRINTS } from '@/lib/design/reference-room-blueprints-extra';
import { DAILY_REFERENCE_ROOM_BLUEPRINTS } from '@/lib/design/reference-room-blueprints-daily';

export type { ReferenceRoomBlueprint } from '@/lib/design/reference-room-blueprints';

const FINAL_REFERENCE_OVERRIDES:Record<string,Partial<ReferenceRoomBlueprint>>={
  dashboard:{title:'Today',script:'',tabs:[]},
  tasks:{title:'Tasks',script:'',tabs:['Do First','Do Today','Can Wait','Inbox','Waiting On','Someday']},
  calendar:{title:'Calendar',script:'',tabs:[]},
  planning:{title:'Planning',script:'Map your week. Focus on what matters.',tabs:['Overview','Lists','Meals','Projects','Shopping','Ideas','Notes']},
  routines:{title:'Routines',script:'Build rituals that care for you.',tabs:['My Routines','Templates','History']},
  habits:{title:'Habits Garden',script:'Nurture daily actions. Watch your garden grow.',tabs:['Garden','Habits','History','Insights']},
  wellness:{title:'Wellness',script:'',tabs:[]},
  food:{title:'Food & Nutrition',script:'Fuel your body. Nourish your life.',tabs:['Today','Meal Plan','Groceries','Pantry','Recipes','Nutrition']},
  beauty:{title:'Beauty OS',script:'',tabs:[]},
  'beauty-lab':{title:'Beauty Lab',script:'Your product library and skin knowledge.',tabs:['Products','Ingredients','Compatibility','Experiments','Reactions','Repurchase']},
  hair:{title:'Hair Studio',script:'',tabs:[]},
  finance:{title:'Finance',script:'',tabs:[]},
  'financial-brain':{title:'Financial Brain',script:'Plan smarter. Build wealth. Create freedom.',tabs:['Overview','Forecast','Scenarios','Recommendations']},
  goals:{title:'Goals',script:'Design your future with intention.',tabs:['Overview','Timeline','Vision','Achievements','Reflections']},
  notes:{title:'Notes',script:'',tabs:[]},
  settings:{title:'Settings',script:'Customize your Glow OS experience.',tabs:[]},
  world:{title:'Life World',script:'Your world. Your story. Your legacy.',tabs:['Home','Map','Timeline','Digital Home','Collections']},
  projects:{title:'Projects',script:'Build the future, one project at a time.',tabs:[]},
  brain:{title:'Glow',script:'',tabs:[]},
  inbox:{title:'Inbox',script:'All your incoming in one place.',tabs:[]},
  briefings:{title:'Briefings',script:'Your daily intelligence from Glow.',tabs:[]},
};

function simplify(spec:ReferenceRoomBlueprint):ReferenceRoomBlueprint{
  const primaryLimit = spec.layout==='calendar'?9:spec.layout==='desk'?6:spec.layout==='ritual'?8:spec.layout==='garden'?8:spec.layout==='world'?8:spec.layout==='notes'?8:spec.layout==='settings'?6:4;
  const secondaryLimit = spec.layout==='calendar'?7:spec.layout==='board'?7:spec.layout==='ritual'?5:spec.layout==='world'?6:spec.layout==='lab'?6:5;
  return {
    ...spec,
    metrics: spec.metrics.slice(0,4),
    primary: spec.primary.slice(0,primaryLimit),
    secondary: spec.secondary.slice(0,secondaryLimit),
    rail: spec.rail.slice(0,3),
  };
}

export function blueprintForRoom(room:string):ReferenceRoomBlueprint{
  const source=DAILY_REFERENCE_ROOM_BLUEPRINTS[room]??EXTRA_REFERENCE_ROOM_BLUEPRINTS[room]??baseBlueprintForRoom(room);
  const simplified=simplify(source);
  return {...simplified,...(FINAL_REFERENCE_OVERRIDES[room]??{})};
}
