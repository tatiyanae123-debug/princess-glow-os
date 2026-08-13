import type { RoomUpgradeSet } from './types';

export const CONCIERGE_UPGRADES: RoomUpgradeSet[]=[{key:'concierge',label:'Concierge',path:'/concierge',upgrades:[
{id:'suggested',label:'Suggested Actions',description:'Use real AI proposals and contextual recommendations.',kind:'route',href:'/concierge'},
{id:'pending',label:'Pending Approvals',description:'Review actions waiting for explicit approval.',kind:'planning',scope:['ai_proposal']},
{id:'completed',label:'Completed Actions',description:'Review approved/rejected proposal history and audit events.',kind:'history',scope:['ai_proposal']},
{id:'follow-ups',label:'Follow-Ups',description:'Save follow-up items and connect them to tasks, events or people.',kind:'entity',entityType:'concierge_followup',fields:[{key:'due',label:'Due date',type:'date'},{key:'context',label:'Context',type:'textarea'}]},
{id:'scheduling',label:'Scheduling Proposals',description:'Build reviewable scheduling proposals rather than changing the calendar silently.',kind:'planning',scope:['calendar','tasks']},
{id:'research',label:'Research Proposals',description:'Save a research request with its reason and expected outcome.',kind:'entity',entityType:'research_request',fields:[{key:'question',label:'Question',type:'textarea'},{key:'reason',label:'Why this matters',type:'textarea'}]},
{id:'preparation',label:'Preparation Checklists',description:'Build reusable preparation checklists for events and tasks.',kind:'entity',entityType:'preparation_checklist',fields:[{key:'for',label:'For'},{key:'items',label:'Checklist',type:'textarea'}]},
{id:'drafts',label:'Draft Communications',description:'Save drafts before sending them through external systems.',kind:'entity',entityType:'communication_draft',fields:[{key:'recipient',label:'Recipient / audience'},{key:'subject',label:'Subject'},{key:'draft',label:'Draft',type:'textarea'}]},
{id:'action-plans',label:'Multi-Step Action Plans',description:'Build a sequence of actions with reviewable next steps.',kind:'entity',entityType:'action_plan',fields:[{key:'goal',label:'Outcome'},{key:'steps',label:'Steps',type:'textarea'}]},
{id:'approval-center',label:'Approval Center',description:'Review exactly what Glow proposes before consequential actions.',kind:'route',href:'/concierge'},
]}];
