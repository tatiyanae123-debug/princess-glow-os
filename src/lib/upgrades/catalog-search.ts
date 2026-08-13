import type { RoomUpgradeSet } from './types';
export const SEARCH_UPGRADES:RoomUpgradeSet[]=[{key:'search',label:'Search',path:'/search',upgrades:[
{id:'everything',label:'Search Everything',description:'Search across supported Glow records.',kind:'route',href:'/search'},
{id:'room',label:'Filter by Room',description:'Use scoped Glow search for one domain at a time.',kind:'search',scope:['rooms']},
{id:'people',label:'Search People',description:'Search saved people objects.',kind:'search',scope:['person']},
{id:'dates',label:'Search Dates',description:'Search calendar, timeline and memory context by date.',kind:'search',scope:['calendar','timeline','memory']},
{id:'memories',label:'Search Memories',description:'Search the Memory archive.',kind:'search',scope:['memory']},
{id:'tasks-projects',label:'Tasks / Projects',description:'Search active work and project records.',kind:'search',scope:['tasks','projects']},
{id:'notes-files',label:'Notes / References',description:'Search Notes and imported references.',kind:'search',scope:['notes','import']},
{id:'recent',label:'Recent Searches',description:'Save useful search queries you want to repeat.',kind:'entity',entityType:'saved_search',fields:[{key:'query',label:'Query'},{key:'scope',label:'Scope'}]},
{id:'suggested',label:'Suggested Queries',description:'Use current context to suggest useful questions.',kind:'insight',scope:['all']},
{id:'ask',label:'Ask Glow',description:'Use natural-language search alongside exact matches.',kind:'search',scope:['all']},
]}];
