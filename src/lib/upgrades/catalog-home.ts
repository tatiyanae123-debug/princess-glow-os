import type { RoomUpgradeSet } from './types';
export const HOME_UPGRADES:RoomUpgradeSet[]=[{key:'home',label:'Home',path:'/home',upgrades:[
{id:'dashboard',label:'Home Dashboard',description:'Use the real Home command center.',kind:'route',href:'/home'},
{id:'cleaning',label:'Cleaning',description:'Create and organize household cleaning work.',kind:'entity',entityType:'home_cleaning',fields:[{key:'room',label:'Room / area'},{key:'steps',label:'Tasks',type:'textarea'},{key:'cadence',label:'Cadence'}]},
{id:'laundry',label:'Laundry',description:'Track laundry batches and care state.',kind:'entity',entityType:'laundry_batch',fields:[{key:'load',label:'Load / category'},{key:'state',label:'State'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'maintenance',label:'Maintenance',description:'Track household maintenance needs and dates.',kind:'entity',entityType:'home_maintenance',fields:[{key:'due',label:'Due date',type:'date'},{key:'area',label:'Area'},{key:'details',label:'Details',type:'textarea'}]},
{id:'inventory',label:'Inventory',description:'Track useful household supplies and quantities.',kind:'entity',entityType:'home_inventory',fields:[{key:'quantity',label:'Quantity'},{key:'location',label:'Stored where'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'shopping',label:'Shopping',description:'Maintain home shopping lists connected to tasks and finance.',kind:'entity',entityType:'home_shopping',fields:[{key:'items',label:'Items',type:'textarea'},{key:'store',label:'Store'}]},
{id:'rooms',label:'Rooms',description:'Create room records and connect maintenance or projects to them.',kind:'entity',entityType:'home_room',fields:[{key:'purpose',label:'Purpose'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'projects',label:'Home Projects',description:'Connect home work to real Projects.',kind:'relations',scope:['home_room','project']},
{id:'routines',label:'Household Routines',description:'Connect Home with the real Routines system.',kind:'relations',scope:['home','routine']},
{id:'reset',label:'Home Reset',description:'Build a prioritized reset plan for the house.',kind:'planning',scope:['home_cleaning','laundry_batch','home_maintenance','tasks']},
]}];
