import type { RoomUpgradeSet } from './types';

export const BRAIN_UPGRADES: RoomUpgradeSet[]=[{key:'brain',label:'Brain',path:'/brain',upgrades:[
{id:'mind-map',label:'Editable Mind Map',description:'Use the real add, edit and remove controls in Your Mind Map.',kind:'route',href:'/brain'},
{id:'universal-search',label:'Universal Glow Search',description:'Search across Glow records from the Search page.',kind:'route',href:'/search'},
{id:'connected-thoughts',label:'Connected Thoughts',description:'Save thoughts and connect them to other Glow objects.',kind:'entity',entityType:'connected_thought',fields:[{key:'thought',label:'Thought',type:'textarea'},{key:'context',label:'Context'},{key:'next',label:'Possible next step',type:'textarea'}]},
{id:'recent-captures',label:'Recent Captures',description:'Review recent Universal Intake and Glow Inbox activity.',kind:'route',href:'/inbox'},
{id:'interests',label:'Current Interests',description:'Maintain an editable list of current interests.',kind:'entity',entityType:'current_interest',fields:[{key:'area',label:'Area'},{key:'why',label:'Why it matters',type:'textarea'}]},
{id:'questions',label:'Open Questions',description:'Track questions you want Glow to help answer over time.',kind:'entity',entityType:'open_question',fields:[{key:'question',label:'Question',type:'textarea'},{key:'context',label:'Context',type:'textarea'}]},
{id:'decisions',label:'Decision Tracker',description:'Record decisions, alternatives and reasoning.',kind:'entity',entityType:'decision',fields:[{key:'decision',label:'Decision',type:'textarea'},{key:'alternatives',label:'Alternatives',type:'textarea'},{key:'reason',label:'Reasoning',type:'textarea'}]},
{id:'patterns',label:'Detected Patterns',description:'Review real observations and cross-room patterns.',kind:'route',href:'/observations'},
{id:'brain-dump',label:'Brain Dump Processing',description:'Capture messy input and route it into the right Glow system.',kind:'capture'},
{id:'ask-life',label:'Ask Your Life',description:'Search and reason across connected Glow rooms.',kind:'search',scope:['all']},
]}];
