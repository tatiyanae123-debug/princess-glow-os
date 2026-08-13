import type { RoomUpgrade, RoomUpgradeSet } from './types';
import { CORE_A_UPGRADES } from './catalog-core-a';
import { ROUTINE_HABIT_UPGRADES } from './catalog-routines-habits';
import { FITNESS_WELLNESS_UPGRADES } from './catalog-fitness-wellness';
import { FOOD_UPGRADES } from './catalog-food';
import { BEAUTY_UPGRADES } from './catalog-beauty';

export const ROOM_UPGRADE_SETS:RoomUpgradeSet[]=[...CORE_A_UPGRADES,...ROUTINE_HABIT_UPGRADES,...FITNESS_WELLNESS_UPGRADES,...FOOD_UPGRADES,...BEAUTY_UPGRADES];
export function getRoomUpgradeSet(key:string){return ROOM_UPGRADE_SETS.find(set=>set.key===key)??null;}
export function getRoomUpgrade(key:string,tool:string):RoomUpgrade|null{return getRoomUpgradeSet(key)?.upgrades.find(item=>item.id===tool)??null;}
export function upgradeHref(set:RoomUpgradeSet,upgrade:RoomUpgrade){if(upgrade.kind==='route'&&upgrade.href)return upgrade.href;if(upgrade.kind==='capture')return '/intake';if(upgrade.kind==='search')return `/search?scope=${encodeURIComponent((upgrade.scope??[set.key]).join(','))}`;if(upgrade.kind==='rules')return '/rules';return `/upgrades/${encodeURIComponent(set.key)}/${encodeURIComponent(upgrade.id)}`;}
