import type { RoomUpgradeSet } from './types';
export const SETTINGS_UPGRADES:RoomUpgradeSet[]=[{key:'settings',label:'Settings',path:'/settings',upgrades:[
{id:'profile',label:'Profile',description:'Open the real profile and account controls.',kind:'route',href:'/settings?section=profile'},
{id:'appearance',label:'Appearance',description:'Control Glow’s appearance settings.',kind:'route',href:'/settings?section=appearance'},
{id:'personality',label:'Glow Personality',description:'Save how you want Glow to communicate and prioritize.',kind:'entity',entityType:'glow_personality',fields:[{key:'tone',label:'Tone'},{key:'priorities',label:'Priorities',type:'textarea'},{key:'avoid',label:'Avoid',type:'textarea'}]},
{id:'notifications',label:'Notifications',description:'Control notification behavior and attention preferences.',kind:'route',href:'/settings'},
{id:'connections',label:'Connections',description:'Open real integration controls.',kind:'route',href:'/connections'},
{id:'privacy',label:'Privacy',description:'Review privacy and data controls.',kind:'route',href:'/settings'},
{id:'permissions',label:'AI Permissions',description:'Use Personal Rules to define what Glow may suggest or change.',kind:'rules'},
{id:'data',label:'Data Controls',description:'Review import, export and connected data surfaces.',kind:'route',href:'/settings'},
{id:'motion',label:'Motion / Accessibility',description:'Save accessibility and motion preferences.',kind:'entity',entityType:'accessibility_preference',fields:[{key:'motion',label:'Motion preference'},{key:'density',label:'Interface density'},{key:'notes',label:'Accessibility notes',type:'textarea'}]},
{id:'control',label:'Glow Control Center',description:'Review Settings, Connections, Rules and intelligence controls together.',kind:'route',href:'/settings/intelligence'},
]}];
