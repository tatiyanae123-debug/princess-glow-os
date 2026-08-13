import type { RoomUpgradeSet } from './types';

export const HAIR_UPGRADES: RoomUpgradeSet[] = [{ key:'hair', label:'Hair', path:'/hair', upgrades:[
  {id:'phase',label:'Current Hair Phase',description:'Show current phase, wash timing and next action.',kind:'route',href:'/hair'},
  {id:'wash-plan',label:'Wash-Day Planner',description:'Use the real wash-day flow and Hair logs.',kind:'route',href:'/hair'},
  {id:'routine-builder',label:'Hair Routine Builder',description:'Save reusable Hair routine structures.',kind:'entity',entityType:'hair_routine',fields:[{key:'frequency',label:'Frequency'},{key:'steps',label:'Steps',type:'textarea'},{key:'products',label:'Products',type:'textarea'}]},
  {id:'product-shelf',label:'Product Shelf',description:'Track Hair products and relate them to results.',kind:'entity',entityType:'hair_product',fields:[{key:'category',label:'Category'},{key:'status',label:'Status'},{key:'notes',label:'Notes',type:'textarea'}]},
  {id:'treatments',label:'Treatment Calendar',description:'Track Hair treatments and appointments.',kind:'entity',entityType:'hair_treatment',fields:[{key:'date',label:'Date',type:'date'},{key:'treatment',label:'Treatment'},{key:'notes',label:'Notes',type:'textarea'}]},
  {id:'styles',label:'Style Library',description:'Save reusable styles, steps and products.',kind:'entity',entityType:'hair_style',fields:[{key:'occasion',label:'Occasion'},{key:'steps',label:'Steps',type:'textarea'},{key:'products',label:'Products',type:'textarea'}]},
  {id:'goals',label:'Hair Goals',description:'Connect Hair work to the Goals system.',kind:'relations',scope:['hair','goal']},
  {id:'journey',label:'Photo Journey',description:'Maintain dated Hair journey records.',kind:'entity',entityType:'hair_progress',fields:[{key:'date',label:'Date',type:'date'},{key:'imageUrl',label:'Image URL'},{key:'notes',label:'Notes',type:'textarea'}]},
  {id:'usage',label:'Product Usage Tracking',description:'Record product use and future-use decisions.',kind:'entity',entityType:'hair_product_usage',fields:[{key:'product',label:'Product'},{key:'status',label:'Status'},{key:'notes',label:'Notes',type:'textarea'}]},
  {id:'intelligence',label:'Hair Intelligence',description:'Use wash history, treatments, products and notes to surface patterns.',kind:'insight',scope:['hair','hair_product','hair_treatment']},
]}];
