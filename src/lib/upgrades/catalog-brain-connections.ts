import type { RoomUpgradeSet } from './types';
export const BRAIN_CONNECTION_UPGRADES:RoomUpgradeSet[]=[{key:'brain-connections',label:'Brain Connections',path:'/brain/connections',upgrades:[
{id:'goal-task',label:'Goal and Task Links',description:'Inspect and create goal-to-task relationships.',kind:'relations',scope:['goal','task']},
{id:'goal-habit',label:'Goal and Habit Links',description:'Inspect and create goal-to-habit relationships.',kind:'relations',scope:['goal','habit']},
{id:'wellness-sleep',label:'Wellness and Sleep',description:'Review wellness evidence around sleep.',kind:'insight',scope:['wellness','sleep']},
{id:'finance-beauty',label:'Finance and Beauty',description:'Inspect Beauty spending and connected Beauty records.',kind:'insight',scope:['finance','beauty']},
{id:'calendar-energy',label:'Calendar and Energy',description:'Compare schedule density with logged energy.',kind:'insight',scope:['calendar','wellness']},
{id:'food-grocery',label:'Food and Grocery',description:'Connect meal plans, recipes, pantry and grocery lists.',kind:'relations',scope:['meal_plan','recipe','grocery_list','pantry_item']},
{id:'project-notes',label:'Project and Notes',description:'Connect Notes and Projects.',kind:'relations',scope:['project','note']},
{id:'memory-people',label:'Memory and People',description:'Connect memories to saved people records.',kind:'relations',scope:['memory','person']},
{id:'hair-products',label:'Hair and Products',description:'Connect Hair records to products and treatments.',kind:'relations',scope:['hair','hair_product','hair_treatment']},
{id:'explain',label:'Connection Explanation',description:'Review relationship type, context and recency.',kind:'insight',scope:['relations']},
]}];
