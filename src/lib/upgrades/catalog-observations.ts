import type { RoomUpgradeSet } from './types';

export const OBSERVATION_UPGRADES: RoomUpgradeSet[]=[{key:'observations',label:'Observations',path:'/observations',upgrades:[
{id:'new',label:'New Observations',description:'Review active intelligent observations from real Glow data.',kind:'route',href:'/observations'},
{id:'important',label:'Important Observations',description:'Surface high-signal observations and evidence.',kind:'insight',scope:['observations']},
{id:'positive',label:'Positive Patterns',description:'Review evidence-backed improvements and strengths.',kind:'insight',scope:['observations','habits','wellness']},
{id:'risks',label:'Risks',description:'Surface active patterns that may need attention.',kind:'insight',scope:['observations','notices']},
{id:'changes',label:'Changes',description:'Review recent changes in observations and connected records.',kind:'history',scope:['observations']},
{id:'cross-room',label:'Cross-Room Patterns',description:'Connect observations to evidence from multiple Glow rooms.',kind:'relations',scope:['observation','task','habit','wellness','finance','project']},
{id:'evidence',label:'Evidence',description:'Inspect the stored evidence and context behind observations.',kind:'route',href:'/observations'},
{id:'confidence',label:'Confidence',description:'Review confidence as supporting context, not certainty.',kind:'route',href:'/observations'},
{id:'manage',label:'Dismiss / Snooze / Save',description:'Use the real observation lifecycle controls.',kind:'route',href:'/observations'},
{id:'action',label:'Turn Into Action',description:'Route an observation into a task, note, plan or other Glow destination.',kind:'capture'},
]}];
