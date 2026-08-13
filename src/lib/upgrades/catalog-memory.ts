import type { RoomUpgradeSet } from './types';

export const MEMORY_UPGRADES: RoomUpgradeSet[]=[{key:'memory',label:'Memory',path:'/memory',upgrades:[
{id:'capture',label:'Memory Capture',description:'Use the real Memory archive to save meaningful moments.',kind:'route',href:'/memory'},
{id:'photos',label:'Photo Memories',description:'Save dated image-based memory records.',kind:'entity',entityType:'photo_memory',fields:[{key:'date',label:'Date',type:'date'},{key:'imageUrl',label:'Image URL'},{key:'story',label:'Story',type:'textarea'}]},
{id:'notes',label:'Memory Notes',description:'Connect memories to existing Notes and reflections.',kind:'relations',scope:['memory','note']},
{id:'dates',label:'Dates',description:'Review memories and life events chronologically.',kind:'history',scope:['memory']},
{id:'people',label:'People',description:'Create people records and connect them to memories.',kind:'entity',entityType:'person',fields:[{key:'relationship',label:'Relationship'},{key:'contact',label:'Contact information'},{key:'notes',label:'Notes',type:'textarea'}]},
{id:'places',label:'Places',description:'Save places that matter and connect them to memories.',kind:'entity',entityType:'place',fields:[{key:'location',label:'Location / address'},{key:'notes',label:'Why it matters',type:'textarea'}]},
{id:'categories',label:'Memory Categories',description:'Organize memory objects by meaningful categories.',kind:'entity',entityType:'memory_category',fields:[{key:'description',label:'Description',type:'textarea'}]},
{id:'life-events',label:'Related Life Events',description:'Connect memories to timeline events, goals and projects.',kind:'relations',scope:['memory','timeline','goal','project']},
{id:'search',label:'Memory Search',description:'Search the archive and related Glow context.',kind:'search',scope:['memory']},
{id:'story',label:'Memory Story View',description:'Review related memory and timeline records as a chronological story.',kind:'history',scope:['memory','timeline']},
]}];
