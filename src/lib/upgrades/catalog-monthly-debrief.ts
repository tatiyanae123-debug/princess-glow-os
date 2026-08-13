import type { RoomUpgradeSet } from './types';
export const MONTHLY_DEBRIEF_UPGRADES:RoomUpgradeSet[]=[{key:'monthly-debrief',label:'Monthly Debrief',path:'/briefings/monthly',upgrades:[
{id:'story',label:'Month Story',description:'Review the month as one life chapter.',kind:'review',scope:['timeline','memory','tasks']},
{id:'wins',label:'Major Accomplishments',description:'Review completed work, milestones and wins.',kind:'history',scope:['tasks','project','goal']},
{id:'goals',label:'Goal Progress',description:'Review real goal and milestone movement.',kind:'history',scope:['goal','project']},
{id:'finance',label:'Financial Summary',description:'Review the month’s real Finance activity.',kind:'history',scope:['finance']},
{id:'wellness',label:'Wellness Trends',description:'Review monthly Wellness patterns.',kind:'insight',scope:['wellness']},
{id:'fitness',label:'Fitness Progress',description:'Review completed fitness sessions over the month.',kind:'history',scope:['fitness']},
{id:'beauty',label:'Beauty / Hair Progress',description:'Review Beauty and Hair logs and progress objects.',kind:'history',scope:['beauty','hair']},
{id:'memories',label:'Memories',description:'Review memories captured during the month.',kind:'history',scope:['memory']},
{id:'changes',label:'Life Changes',description:'Save meaningful changes that should become part of the life timeline.',kind:'entity',entityType:'monthly_life_change',fields:[{key:'month',label:'Month'},{key:'change',label:'What changed?',type:'textarea'}]},
{id:'next',label:'Next Chapter',description:'Build a reviewable plan for the coming month.',kind:'planning',scope:['planning','goals','projects']},
]}];
