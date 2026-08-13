import type { RoomUpgradeSet } from './types';
export const GRAPH_UPGRADES:RoomUpgradeSet[]=[{key:'graph',label:'Graph',path:'/graph',upgrades:[
{id:'you',label:'Person Node',description:'Use You as the central identity in the system graph.',kind:'route',href:'/graph'},
{id:'goals',label:'Goals',description:'Inspect goal relationships.',kind:'relations',scope:['goal']},
{id:'projects',label:'Projects',description:'Inspect project relationships.',kind:'relations',scope:['project']},
{id:'tasks',label:'Tasks',description:'Inspect task relationships.',kind:'relations',scope:['task']},
{id:'habits',label:'Habits',description:'Inspect habit relationships.',kind:'relations',scope:['habit']},
{id:'people',label:'People',description:'Create people nodes for real relationships.',kind:'entity',entityType:'person',fields:[{key:'relationship',label:'Relationship'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'memories',label:'Memories',description:'Connect Memory records into the graph.',kind:'relations',scope:['memory']},
{id:'places',label:'Places',description:'Create meaningful place nodes.',kind:'entity',entityType:'place',fields:[{key:'location',label:'Location'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'domains',label:'Life Domains',description:'Review links between Glow life domains.',kind:'route',href:'/graph'},
{id:'filters',label:'Relationship Filters',description:'Inspect specific relationship types and connected records.',kind:'relations',scope:['all']},
]}];
