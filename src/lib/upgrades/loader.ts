import type { RoomUpgradeSet } from './types';

type Loader=()=>Promise<RoomUpgradeSet[]>;
const loaders:Record<string,Loader>={
 dashboard:()=>import('./catalog-core-a').then(m=>m.CORE_A_UPGRADES.filter(x=>x.key==='dashboard')),
 calendar:()=>import('./catalog-core-a').then(m=>m.CORE_A_UPGRADES.filter(x=>x.key==='calendar')),
 tasks:()=>import('./catalog-core-a').then(m=>m.CORE_A_UPGRADES.filter(x=>x.key==='tasks')),
 planning:()=>import('./catalog-core-a').then(m=>m.CORE_A_UPGRADES.filter(x=>x.key==='planning')),
 reminders:()=>import('./catalog-core-a').then(m=>m.CORE_A_UPGRADES.filter(x=>x.key==='reminders')),
 routines:()=>import('./catalog-routines-habits').then(m=>m.ROUTINE_HABIT_UPGRADES.filter(x=>x.key==='routines')),
 habits:()=>import('./catalog-routines-habits').then(m=>m.ROUTINE_HABIT_UPGRADES.filter(x=>x.key==='habits')),
 fitness:()=>import('./catalog-fitness-wellness').then(m=>m.FITNESS_WELLNESS_UPGRADES.filter(x=>x.key==='fitness')),
 wellness:()=>import('./catalog-fitness-wellness').then(m=>m.FITNESS_WELLNESS_UPGRADES.filter(x=>x.key==='wellness')),
 medications:()=>import('./catalog-medications').then(m=>m.MEDICATION_UPGRADES),
 food:()=>import('./catalog-food').then(m=>m.FOOD_UPGRADES), beauty:()=>import('./catalog-beauty').then(m=>m.BEAUTY_UPGRADES),
 'beauty-lab':()=>import('./catalog-beauty-lab').then(m=>m.BEAUTY_LAB_UPGRADES), hair:()=>import('./catalog-hair').then(m=>m.HAIR_UPGRADES),
 closet:()=>import('./catalog-closet').then(m=>m.CLOSET_UPGRADES), finance:()=>import('./catalog-finance').then(m=>m.FINANCE_UPGRADES),
 'financial-brain':()=>import('./catalog-financial-brain').then(m=>m.FINANCIAL_BRAIN_UPGRADES), goals:()=>import('./catalog-goals').then(m=>m.GOAL_UPGRADES),
 projects:()=>import('./catalog-projects').then(m=>m.PROJECT_UPGRADES.filter(x=>x.key==='projects')),
 'creative-studio':()=>import('./catalog-projects').then(m=>m.PROJECT_UPGRADES.filter(x=>x.key==='creative-studio')),
 brain:()=>import('./catalog-brain').then(m=>m.BRAIN_UPGRADES), 'brain-connections':()=>import('./catalog-brain-connections').then(m=>m.BRAIN_CONNECTION_UPGRADES),
 memory:()=>import('./catalog-memory').then(m=>m.MEMORY_UPGRADES), timeline:()=>import('./catalog-timeline').then(m=>m.TIMELINE_UPGRADES),
 observations:()=>import('./catalog-observations').then(m=>m.OBSERVATION_UPGRADES), concierge:()=>import('./catalog-concierge').then(m=>m.CONCIERGE_UPGRADES),
 'morning-brief':()=>import('./catalog-morning-brief').then(m=>m.MORNING_BRIEF_UPGRADES), 'evening-debrief':()=>import('./catalog-evening-debrief').then(m=>m.EVENING_DEBRIEF_UPGRADES),
 'weekly-debrief':()=>import('./catalog-weekly-debrief').then(m=>m.WEEKLY_DEBRIEF_UPGRADES), 'monthly-debrief':()=>import('./catalog-monthly-debrief').then(m=>m.MONTHLY_DEBRIEF_UPGRADES),
 home:()=>import('./catalog-home').then(m=>m.HOME_UPGRADES), 'all-rooms':()=>import('./catalog-all-rooms').then(m=>m.ALL_ROOMS_UPGRADES),
 notices:()=>import('./catalog-notices').then(m=>m.NOTICE_UPGRADES), graph:()=>import('./catalog-graph').then(m=>m.GRAPH_UPGRADES),
 gmail:()=>import('./catalog-gmail').then(m=>m.GMAIL_UPGRADES), import:()=>import('./catalog-import').then(m=>m.IMPORT_UPGRADES),
 connections:()=>import('./catalog-connections').then(m=>m.CONNECTION_UPGRADES), notes:()=>import('./catalog-notes').then(m=>m.NOTE_UPGRADES),
 intake:()=>import('./catalog-intake').then(m=>m.INTAKE_UPGRADES), rules:()=>import('./catalog-rules').then(m=>m.RULE_UPGRADES),
 world:()=>import('./catalog-world').then(m=>m.WORLD_UPGRADES), search:()=>import('./catalog-search').then(m=>m.SEARCH_UPGRADES), settings:()=>import('./catalog-settings').then(m=>m.SETTINGS_UPGRADES),
};

export async function loadUpgradeSet(key:string){const rows=await loaders[key]?.();return rows?.[0]??null;}

export function upgradeKeyForPath(pathname:string){
 const specials:[string,string][]=[['/brain/connections','brain-connections'],['/finance/brain','financial-brain'],['/beauty/lab','beauty-lab'],['/wellness/medications','medications'],['/briefings/morning','morning-brief'],['/briefings/evening','evening-debrief'],['/briefings/weekly','weekly-debrief'],['/briefings/monthly','monthly-debrief'],['/creative-studio','creative-studio'],['/work','projects'],['/today','dashboard'],['/inbox','intake'],['/life-world','world']];
 for(const [prefix,key] of specials)if(pathname===prefix||pathname.startsWith(`${prefix}/`))return key;
 const first=pathname.split('/').filter(Boolean)[0]??'dashboard';
 if(first==='dashboard')return 'dashboard';if(first==='beauty')return 'beauty';if(first==='finance')return 'finance';if(first==='briefings')return 'morning-brief';if(first==='projects')return 'projects';
 return loaders[first]?first:null;
}

export function upgradeHref(set:RoomUpgradeSet,upgrade:RoomUpgradeSet['upgrades'][number]){if(upgrade.kind==='route'&&upgrade.href)return upgrade.href;if(upgrade.kind==='capture')return '/intake';if(upgrade.kind==='search')return `/search?scope=${encodeURIComponent((upgrade.scope??[set.key]).join(','))}`;if(upgrade.kind==='rules')return '/rules';return `/upgrades/${encodeURIComponent(set.key)}/${encodeURIComponent(upgrade.id)}`;}
