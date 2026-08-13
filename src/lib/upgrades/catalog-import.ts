import type { RoomUpgradeSet } from './types';
export const IMPORT_UPGRADES:RoomUpgradeSet[]=[{key:'import',label:'Import Center',path:'/import',upgrades:[
{id:'files',label:'Import Files',description:'Use the real import and intake workflows for files.',kind:'route',href:'/import'},
{id:'notes',label:'Import Notes',description:'Bring text into Glow and preview its destination.',kind:'capture'},
{id:'calendars',label:'Import Calendars',description:'Manage connected calendar sources through Connections.',kind:'route',href:'/connections'},
{id:'tasks',label:'Import Tasks',description:'Route imported actions into the real Tasks system.',kind:'capture'},
{id:'contacts',label:'Import Contacts',description:'Create people objects only after reviewing imported information.',kind:'entity',entityType:'person',fields:[{key:'contact',label:'Contact information'},{key:'relationship',label:'Relationship'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'spreadsheets',label:'Import Spreadsheets',description:'Use supported import parsing and review before saving.',kind:'route',href:'/import'},
{id:'mapping',label:'Preview Mapping',description:'Preview classifications before committing imported data.',kind:'route',href:'/import'},
{id:'duplicates',label:'Duplicate Detection',description:'Review imports and existing Glow objects before adding another copy.',kind:'insight',scope:['import','all']},
{id:'errors',label:'Error Review',description:'Review failed imports and their status.',kind:'history',scope:['import']},
{id:'classification',label:'Glow Classification Preview',description:'Use Universal Intake to preview where information should go.',kind:'capture'},
]}];
