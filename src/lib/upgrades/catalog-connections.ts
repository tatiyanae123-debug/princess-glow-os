import type { RoomUpgradeSet } from './types';
export const CONNECTION_UPGRADES:RoomUpgradeSet[]=[{key:'connections',label:'Connections',path:'/connections',upgrades:[
{id:'google',label:'Google',description:'Review the real Google connection state.',kind:'route',href:'/connections'},
{id:'gmail',label:'Gmail',description:'Review Gmail scope and connection health.',kind:'route',href:'/connections'},
{id:'calendar',label:'Calendar',description:'Review Calendar scope and connection health.',kind:'route',href:'/connections'},
{id:'reminders',label:'Apple Reminders',description:'Review the real Apple Reminders bridge.',kind:'route',href:'/connections'},
{id:'sources',label:'Other Data Sources',description:'Document additional sources without pretending they are connected.',kind:'entity',entityType:'data_source_note',fields:[{key:'source',label:'Source'},{key:'status',label:'Status'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'status',label:'Connection Status',description:'See connection states and attention conditions.',kind:'route',href:'/connections'},
{id:'last-sync',label:'Last Sync',description:'Review recorded sync and import activity.',kind:'history',scope:['connections','import']},
{id:'permissions',label:'Permissions',description:'Review the permissions Glow currently has.',kind:'route',href:'/connections'},
{id:'errors',label:'Sync History / Errors',description:'Review connection and import error history.',kind:'history',scope:['connections','import']},
{id:'flow',label:'Data Flow Map',description:'Connect data sources to the Glow rooms they supply.',kind:'relations',scope:['connection','room']},
]}];
