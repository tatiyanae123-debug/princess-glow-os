import type { RoomUpgradeSet } from './types';
export const EVENING_DEBRIEF_UPGRADES:RoomUpgradeSet[]=[{key:'evening-debrief',label:'Evening Debrief',path:'/briefings/evening',upgrades:[
{id:'completed',label:'Completed Today',description:'Review tasks and actions completed today.',kind:'review',scope:['tasks']},
{id:'missed',label:'Missed Today',description:'Review unfinished items without moving them automatically.',kind:'review',scope:['tasks','routines','habits']},
{id:'schedule',label:'Schedule Recap',description:'Review the day’s real calendar commitments.',kind:'history',scope:['calendar']},
{id:'habits',label:'Habit / Routine Completion',description:'Review logged habit and routine activity.',kind:'history',scope:['habits','routines']},
{id:'wellness',label:'Wellness Summary',description:'Review the day’s Wellness context.',kind:'review',scope:['wellness']},
{id:'reflection',label:'Mood Reflection',description:'Capture how the day felt and what influenced it.',kind:'entity',entityType:'evening_reflection',fields:[{key:'mood',label:'Mood'},{key:'reflection',label:'Reflection',type:'textarea'}]},
{id:'wins',label:'Meaningful Wins',description:'Save wins worth remembering.',kind:'entity',entityType:'daily_win',fields:[{key:'date',label:'Date',type:'date'},{key:'win',label:'Win',type:'textarea'}]},
{id:'attention',label:'What Needs Attention',description:'Review active Notices and unfinished work.',kind:'route',href:'/notices'},
{id:'carry',label:'Tomorrow Carry-Forward',description:'Intentionally choose what should move forward.',kind:'planning',scope:['tasks','planning']},
{id:'close',label:'Close the Day',description:'Use the real Evening Debrief close-day workflow.',kind:'route',href:'/briefings/evening'},
]}];
