import type { RoomUpgradeSet } from './types';
export const WEEKLY_DEBRIEF_UPGRADES:RoomUpgradeSet[]=[{key:'weekly-debrief',label:'Weekly Debrief',path:'/briefings/weekly',upgrades:[
{id:'summary',label:'Week Summary',description:'Review the week as one concise chapter.',kind:'review',scope:['tasks','calendar','habits']},
{id:'wins',label:'Accomplishments',description:'Review completed work and milestones.',kind:'history',scope:['tasks','project','goal']},
{id:'missed',label:'Missed Priorities',description:'Review unfinished priorities intentionally.',kind:'review',scope:['tasks','planning']},
{id:'habits',label:'Habit Consistency',description:'Review weekly habit activity.',kind:'history',scope:['habits']},
{id:'wellness',label:'Wellness',description:'Review weekly Wellness patterns.',kind:'insight',scope:['wellness']},
{id:'spending',label:'Spending',description:'Review weekly Finance activity.',kind:'history',scope:['finance']},
{id:'fitness',label:'Fitness',description:'Review completed training sessions.',kind:'history',scope:['fitness']},
{id:'projects',label:'Project Progress',description:'Review project movement and blockers.',kind:'insight',scope:['project','tasks']},
{id:'lessons',label:'Lessons / Patterns',description:'Save the week’s most important lesson.',kind:'entity',entityType:'weekly_lesson',fields:[{key:'week',label:'Week of',type:'date'},{key:'lesson',label:'Lesson',type:'textarea'}]},
{id:'next',label:'Next-Week Plan',description:'Build a reviewable plan for next week.',kind:'planning',scope:['planning','tasks','calendar','goals']},
]}];
