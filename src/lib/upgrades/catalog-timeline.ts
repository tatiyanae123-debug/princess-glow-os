import type { RoomUpgradeSet } from './types';
export const TIMELINE_UPGRADES:RoomUpgradeSet[]=[{key:'timeline',label:'Timeline',path:'/timeline',upgrades:[
{id:'today',label:'Today',description:'Review today in timeline context.',kind:'history',scope:['timeline','calendar','tasks']},
{id:'week',label:'Week',description:'Review this week’s events and memories.',kind:'history',scope:['timeline','calendar','memory']},
{id:'month',label:'Month',description:'Review the month as a chronological chapter.',kind:'history',scope:['timeline','memory','project']},
{id:'year',label:'Year',description:'Review the year’s major events and milestones.',kind:'history',scope:['timeline','memory','goal','project']},
{id:'life',label:'Life',description:'Browse the full stored life timeline.',kind:'route',href:'/timeline'},
{id:'milestones',label:'Major Milestones',description:'Connect major moments to goals and projects.',kind:'relations',scope:['timeline','goal','project']},
{id:'photos',label:'Photos',description:'Review image-based progress and memory records over time.',kind:'history',scope:['photo_memory','hair_progress','beauty_progress','fitness_progress_photo']},
{id:'memories',label:'Memories',description:'Open the Memory archive beside Timeline.',kind:'route',href:'/memory'},
{id:'projects',label:'Projects and Goals',description:'See outcomes and work in chronological context.',kind:'history',scope:['project','goal']},
{id:'date-search',label:'Life Date Search',description:'Search timeline and memory records by period.',kind:'search',scope:['timeline','memory']},
]}];
