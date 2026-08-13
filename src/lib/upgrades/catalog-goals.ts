import type { RoomUpgradeSet } from './types';
export const GOAL_UPGRADES:RoomUpgradeSet[]=[{key:'goals',label:'Goals',path:'/goals',upgrades:[
{id:'life',label:'Life Goals',description:'Use real goals for long-range outcomes.',kind:'route',href:'/goals'},
{id:'quarter',label:'Quarterly Goals',description:'Connect goals with planning periods.',kind:'relations',scope:['goal','planning']},
{id:'cards',label:'Visual Goal Cards',description:'Review real progress and status.',kind:'route',href:'/goals'},
{id:'milestones',label:'Milestones',description:'Use real goal and project milestone controls.',kind:'route',href:'/goals'},
{id:'projects',label:'Goal and Project Links',description:'Connect goals to projects.',kind:'relations',scope:['goal','project']},
{id:'habits',label:'Goal and Habit Links',description:'Connect goals to supporting habits.',kind:'relations',scope:['goal','habit']},
{id:'history',label:'Progress History',description:'Review goal and project activity over time.',kind:'history',scope:['goal','project']},
{id:'risks',label:'Obstacles and Risks',description:'Record blockers and response plans.',kind:'entity',entityType:'goal_risk',fields:[{key:'goal',label:'Goal'},{key:'risk',label:'Risk or obstacle'},{key:'response',label:'Response plan',type:'textarea'}]},
{id:'reflection',label:'Reflection Journal',description:'Save dated goal reflections.',kind:'entity',entityType:'goal_reflection',fields:[{key:'goal',label:'Goal'},{key:'date',label:'Date',type:'date'},{key:'reflection',label:'Reflection',type:'textarea'}]},
{id:'path',label:'Goal Path',description:'Connect current actions, milestones and targets.',kind:'relations',scope:['task','goal','project','habit']},
]}];
