import type { RoomUpgradeSet } from './types';
const labels=['Planning Rules','Scheduling Rules','Wellness Boundaries','Spending Rules','Work Preferences','Routine Preferences','Notification Preferences','AI Behavior Rules','Temporary Rules','Explain This Rule'];
export const RULE_UPGRADES:RoomUpgradeSet[]=[{key:'rules',label:'Personal Rules',path:'/rules',upgrades:labels.map((label,i)=>({id:`rule-${i+1}`,label,description:i===9?'Review how each rule is defined and applied.':'Create and manage this preference in the real Personal Rules system.',kind:'route' as const,href:'/rules'}))}];
