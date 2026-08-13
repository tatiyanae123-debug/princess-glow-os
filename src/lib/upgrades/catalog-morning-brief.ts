import type { RoomUpgradeSet } from './types';
export const MORNING_BRIEF_UPGRADES:RoomUpgradeSet[]=[{key:'morning-brief',label:'Morning Brief',path:'/briefings/morning',upgrades:[
{id:'hero',label:'Today’s Hero',description:'Open the morning briefing as a clear editorial start to the day.',kind:'route',href:'/briefings/morning'},
{id:'schedule',label:'Schedule Highlights',description:'See only the most important real commitments.',kind:'insight',scope:['calendar']},
{id:'priority',label:'Top Priority',description:'Surface the highest-priority task or plan for the day.',kind:'insight',scope:['tasks','planning']},
{id:'wellness',label:'Wellness Reminder',description:'Use current Wellness context to surface one useful care reminder.',kind:'insight',scope:['wellness']},
{id:'meals',label:'Meals',description:'Connect the brief to the real Food planning system.',kind:'route',href:'/food'},
{id:'mood',label:'Mood Check-In',description:'Open the real Wellness check-in.',kind:'route',href:'/wellness'},
{id:'alerts',label:'Important Alerts',description:'Review active Notices and overdue attention items.',kind:'route',href:'/notices'},
{id:'free-time',label:'Free-Time Opportunities',description:'Find useful open windows around today’s commitments.',kind:'planning',scope:['calendar','tasks']},
{id:'context',label:'Day Context Notes',description:'Save useful contextual notes for the day.',kind:'entity',entityType:'day_context',fields:[{key:'date',label:'Date',type:'date'},{key:'context',label:'Context',type:'textarea'}]},
{id:'insight',label:'One Glow Insight',description:'Surface one concise evidence-backed insight for the day.',kind:'insight',scope:['tasks','calendar','wellness','habits']},
]}];
