import type { RoomUpgradeSet } from './types';

export const BEAUTY_UPGRADES: RoomUpgradeSet[] = [{
  key:'beauty', label:'Beauty', path:'/beauty', upgrades:[
    {id:'am-pm',label:'AM / PM Routine Hero',description:'Keep the real AM and PM routines as the primary Beauty experience.',kind:'route',href:'/beauty'},
    {id:'skincare',label:'Interactive Skincare Routine',description:'Use the real Beauty routine steps and guided start actions.',kind:'route',href:'/beauty'},
    {id:'makeup',label:'Makeup Routine Library',description:'Save reusable makeup looks and their steps.',kind:'entity',entityType:'makeup_routine',fields:[{key:'occasion',label:'Occasion'},{key:'steps',label:'Steps',type:'textarea'},{key:'products',label:'Products',type:'textarea'}]},
    {id:'body-care',label:'Body-Care Routines',description:'Save body-care routines as reusable Glow objects.',kind:'entity',entityType:'body_care_routine',fields:[{key:'frequency',label:'Frequency'},{key:'steps',label:'Steps',type:'textarea'}]},
    {id:'treatments',label:'Treatment Calendar',description:'Track beauty treatments and relate them to calendar events.',kind:'entity',entityType:'beauty_treatment',fields:[{key:'date',label:'Date',type:'date'},{key:'provider',label:'Provider / place'},{key:'notes',label:'Notes',type:'textarea'}]},
    {id:'inventory',label:'Product Inventory',description:'Open the real Beauty Lab product cabinet.',kind:'route',href:'/beauty/lab'},
    {id:'usage',label:'Product Usage Tracking',description:'Log how a product is being used without changing its core record.',kind:'entity',entityType:'beauty_product_usage',fields:[{key:'product',label:'Product'},{key:'date',label:'Date',type:'date'},{key:'notes',label:'Usage / reaction notes',type:'textarea'}]},
    {id:'progress',label:'Before / After Timeline',description:'Save dated Beauty progress records and connect them to routines or products.',kind:'entity',entityType:'beauty_progress',fields:[{key:'date',label:'Date',type:'date'},{key:'imageUrl',label:'Image URL'},{key:'notes',label:'What changed?',type:'textarea'}]},
    {id:'spending',label:'Beauty Spending Connection',description:'Connect Beauty maintenance to real finance entries and goals.',kind:'relations',scope:['beauty','finance_entry']},
    {id:'coach',label:'Contextual Beauty Coach',description:'Use products, routines and recorded reactions already inside Glow.',kind:'insight',scope:['beauty','beauty_product','beauty_routine']},
  ]
}];
