import type { RoomUpgradeSet } from './types';
export const NOTE_UPGRADES:RoomUpgradeSet[]=[{key:'notes',label:'Notes',path:'/notes',upgrades:[
{id:'rich',label:'Rich Notes',description:'Use the existing note editor and intelligence layer.',kind:'route',href:'/notes'},
{id:'quick',label:'Quick Notes',description:'Capture a note quickly through Universal Intake.',kind:'capture'},
{id:'voice',label:'Voice Notes',description:'Use Glow Voice and Universal Capture for spoken notes.',kind:'capture'},
{id:'files',label:'Photos and Files',description:'Use Import and Universal Intake to preserve source context.',kind:'route',href:'/import'},
{id:'notebooks',label:'Notebooks',description:'Create notebook objects and connect Notes to them.',kind:'entity',entityType:'notebook',fields:[{key:'description',label:'Description',type:'textarea'}]},
{id:'tags',label:'Tags',description:'Use real note tags and extracted intelligence.',kind:'route',href:'/notes'},
{id:'pinned',label:'Pinned Notes',description:'Use the real pinned-note behavior.',kind:'route',href:'/notes'},
{id:'search',label:'Search',description:'Search Notes and related Glow context.',kind:'search',scope:['notes']},
{id:'links',label:'Note Linking',description:'Connect Notes to projects, goals, memories and other objects.',kind:'relations',scope:['note','project','goal','memory']},
{id:'convert',label:'Convert Note',description:'Route note content into tasks, projects, goals, events or memories through Intake.',kind:'capture'},
]}];
