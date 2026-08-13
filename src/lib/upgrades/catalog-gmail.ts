import type { RoomUpgradeSet } from './types';
export const GMAIL_UPGRADES:RoomUpgradeSet[]=[{key:'gmail',label:'Gmail Intelligence',path:'/gmail',upgrades:[
{id:'priority',label:'Priority Emails',description:'Use the real read-only Gmail intelligence feed.',kind:'route',href:'/gmail'},
{id:'response',label:'Needs Response',description:'Surface messages likely to need a reply.',kind:'insight',scope:['gmail']},
{id:'waiting',label:'Waiting for Reply',description:'Track a follow-up date without modifying Gmail.',kind:'entity',entityType:'email_followup',fields:[{key:'thread',label:'Message / thread'},{key:'followUpDate',label:'Follow-up date',type:'date'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'appointments',label:'Appointments',description:'Route appointment context into Calendar for review.',kind:'route',href:'/calendar?source=gmail'},
{id:'orders',label:'Orders / Receipts',description:'Save receipt references and connect them to Finance.',kind:'entity',entityType:'email_receipt',fields:[{key:'merchant',label:'Merchant'},{key:'amount',label:'Amount'},{key:'date',label:'Date',type:'date'}]},
{id:'career',label:'Career Messages',description:'Connect work or job messages to Tasks and Projects.',kind:'relations',scope:['gmail','task','project']},
{id:'projects',label:'Project Messages',description:'Connect relevant message context to Projects.',kind:'relations',scope:['gmail','project']},
{id:'search',label:'Email Search',description:'Use Glow Search with Gmail context.',kind:'search',scope:['gmail']},
{id:'convert',label:'Email → Task / Event / Project',description:'Use the existing Gmail review-before-save actions.',kind:'route',href:'/gmail'},
{id:'summary',label:'Inbox Intelligence',description:'Summarize what requires attention without recreating Gmail.',kind:'insight',scope:['gmail','tasks','calendar']},
]}];
