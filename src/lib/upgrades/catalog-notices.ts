import type { RoomUpgradeSet } from './types';
export const NOTICE_UPGRADES:RoomUpgradeSet[]=[{key:'notices',label:'Notices',path:'/notices',upgrades:[
{id:'today',label:'Today',description:'Review notices relevant to today.',kind:'route',href:'/notices'},
{id:'important',label:'Important',description:'Surface high-priority active notices.',kind:'insight',scope:['notices']},
{id:'upcoming',label:'Upcoming',description:'Review notices tied to future dates and plans.',kind:'history',scope:['notices','calendar']},
{id:'overdue',label:'Overdue',description:'Review overdue tasks, reminders and attention items.',kind:'insight',scope:['tasks','reminders','notices']},
{id:'finance',label:'Finance',description:'Review finance-related notices.',kind:'insight',scope:['finance','notices']},
{id:'care',label:'Health and Care',description:'Review care-related notices already present in Glow.',kind:'insight',scope:['wellness','notices']},
{id:'projects',label:'Projects',description:'Review project and deadline notices.',kind:'insight',scope:['project','notices']},
{id:'connections',label:'Connections',description:'Review integration and sync notices.',kind:'route',href:'/connections'},
{id:'snoozed',label:'Snoozed',description:'Use the existing notice snooze lifecycle.',kind:'route',href:'/notices'},
{id:'resolve',label:'Resolve Center',description:'Turn a notice into a real next action instead of only dismissing it.',kind:'capture'},
]}];
