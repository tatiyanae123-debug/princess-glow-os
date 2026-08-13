import type { RoomUpgradeSet } from './types';

export const BEAUTY_LAB_UPGRADES: RoomUpgradeSet[] = [{
  key:'beauty-lab', label:'Beauty Lab', path:'/beauty/lab', upgrades:[
    {id:'laboratory',label:'Product Laboratory',description:'Use the real product cabinet, reactions, cost and repurchase data.',kind:'route',href:'/beauty/lab'},
    {id:'ingredients',label:'Ingredient Explorer',description:'Save ingredient notes and connect them to tested products.',kind:'entity',entityType:'beauty_ingredient',fields:[{key:'ingredient',label:'Ingredient'},{key:'purpose',label:'Purpose / note'},{key:'products',label:'Products containing it',type:'textarea'}]},
    {id:'compare',label:'Product Comparison',description:'Create a side-by-side comparison record for products you are evaluating.',kind:'entity',entityType:'beauty_comparison',fields:[{key:'products',label:'Products'},{key:'criteria',label:'Comparison criteria',type:'textarea'},{key:'verdict',label:'Current verdict',type:'textarea'}]},
    {id:'compatibility',label:'Routine Compatibility',description:'Connect products to routines and store compatibility notes.',kind:'relations',scope:['beauty_product','beauty_routine']},
    {id:'lifecycle',label:'Product Lifecycle',description:'Use the real product statuses and archive controls.',kind:'route',href:'/beauty/lab'},
    {id:'skin-journal',label:'Skin Journal',description:'Record dated observations and context around your routine.',kind:'entity',entityType:'skin_journal',fields:[{key:'date',label:'Date',type:'date'},{key:'condition',label:'Skin condition'},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'photos',label:'Progress Photography',description:'Build a dated visual record of product and routine experiments.',kind:'entity',entityType:'beauty_lab_photo',fields:[{key:'date',label:'Date',type:'date'},{key:'imageUrl',label:'Image URL'},{key:'experiment',label:'Experiment / routine'},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'experiments',label:'Treatment Experiments',description:'Define what you are testing, why and the observation window.',kind:'entity',entityType:'beauty_experiment',fields:[{key:'hypothesis',label:'What are you testing?',type:'textarea'},{key:'startDate',label:'Start date',type:'date'},{key:'reviewDate',label:'Review date',type:'date'}]},
    {id:'analytics',label:'Beauty Analytics',description:'Review real product, reaction, repurchase and usage patterns.',kind:'insight',scope:['beauty_product','beauty_routine','beauty_experiment']},
    {id:'inspection',label:'Product Inspection Mode',description:'Open Beauty Lab in focus mode for a quieter product-first experience.',kind:'route',href:'/beauty/lab?focus=1'},
  ]
}];
