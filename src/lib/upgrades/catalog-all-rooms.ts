import type { RoomUpgradeSet } from './types';
export const ALL_ROOMS_UPGRADES:RoomUpgradeSet[]=[{key:'all-rooms',label:'All Rooms',path:'/all-rooms',upgrades:[
{id:'every-room',label:'Every Room',description:'Browse every real Glow OS destination.',kind:'route',href:'/all-rooms'},
{id:'favorites',label:'Favorites',description:'Save favorite room shortcuts.',kind:'entity',entityType:'room_favorite',fields:[{key:'room',label:'Room'},{key:'reason',label:'Why it is a favorite'}]},
{id:'recent',label:'Recently Used',description:'Review recent room and action history.',kind:'history',scope:['rooms']},
{id:'suggested',label:'Suggested Rooms',description:'Use current context to surface useful next rooms.',kind:'insight',scope:['all']},
{id:'categories',label:'Categories',description:'Use the organized All Rooms categories.',kind:'route',href:'/all-rooms'},
{id:'search',label:'Search Rooms',description:'Search Glow rooms and records.',kind:'search',scope:['rooms']},
{id:'reorder',label:'Room Ordering',description:'Save a preferred room order.',kind:'entity',entityType:'room_order',fields:[{key:'order',label:'Preferred order',type:'textarea'}]},
{id:'pin',label:'Pinning',description:'Save pinned room shortcuts for quick access.',kind:'entity',entityType:'room_pin',fields:[{key:'room',label:'Room'},{key:'label',label:'Custom label'}]},
{id:'descriptions',label:'Room Status and Descriptions',description:'Review what each room is for and where it connects.',kind:'route',href:'/all-rooms'},
{id:'shortcuts',label:'Custom Room Shortcuts',description:'Create custom shortcuts to real Glow routes.',kind:'entity',entityType:'room_shortcut',fields:[{key:'href',label:'Glow route'},{key:'note',label:'Shortcut note'}]},
]}];
