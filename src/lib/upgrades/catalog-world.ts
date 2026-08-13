import type { RoomUpgradeSet } from './types';
export const WORLD_UPGRADES:RoomUpgradeSet[]=[{key:'world',label:'Life World',path:'/world',upgrades:[
{id:'map',label:'Architectural Life Map',description:'Use the real Life World as an optional spatial navigation layer.',kind:'route',href:'/world'},
{id:'buildings',label:'Life-Domain Buildings',description:'Navigate to real Glow rooms from the world.',kind:'route',href:'/world'},
{id:'focus',label:'Current-Focus Illumination',description:'Use current priorities to identify the active life domain.',kind:'insight',scope:['tasks','goals','calendar']},
{id:'goals',label:'Goal Landmarks',description:'Connect real goals into the Life World.',kind:'relations',scope:['goal','room']},
{id:'memories',label:'Memory Landmarks',description:'Connect memories to life domains and places.',kind:'relations',scope:['memory','room','place']},
{id:'chapter',label:'Current Chapter',description:'Save the current life chapter and what defines it.',kind:'entity',entityType:'life_chapter',fields:[{key:'start',label:'Start date',type:'date'},{key:'theme',label:'Theme'},{key:'story',label:'What defines this chapter?',type:'textarea'}]},
{id:'timeline',label:'Timeline Integration',description:'Open the real Life Timeline from World.',kind:'route',href:'/timeline'},
{id:'zoom',label:'World Zoom',description:'Use the existing spatial navigation controls.',kind:'route',href:'/world'},
{id:'explore',label:'Explore Mode',description:'Open Life World as the intentional immersive experience.',kind:'route',href:'/world?focus=1'},
{id:'transition',label:'Building → Room Continuity',description:'Keep buildings linked to their real functional Glow rooms.',kind:'route',href:'/all-rooms'},
]}];
