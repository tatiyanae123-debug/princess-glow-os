export type LockLevel='GLOBAL'|'WORLD'|'ROOM'|'TEMPLATE'|'EXPERIENCE';
export type LockStatus='DRAFT'|'BUILDING'|'QA'|'LOCKED'|'SUPERSEDED';
export type GlowLock={id:string;level:LockLevel;status:LockStatus;version:string;parentIds:string[];descendantIds:string[];approvedReferenceIds?:string[];lockedAt?:string};
export type ChangeScope={targetId:string;reason:string;requestedLevel:LockLevel};

export function affectedDescendants(lock:GlowLock,allLocks:GlowLock[]){
 const ids=new Set(lock.descendantIds);
 let changed=true;
 while(changed){
  changed=false;
  for(const candidate of allLocks){
   if(candidate.parentIds.some(p=>ids.has(p)||p===lock.id)&&!ids.has(candidate.id)){ids.add(candidate.id);changed=true;}
  }
 }
 return [...ids];
}

export function canModify(lock:GlowLock){return lock.status!=='LOCKED';}

export function requireOverride(lock:GlowLock,change:ChangeScope){
 if(lock.status!=='LOCKED') return {allowed:true,requiresOverride:false};
 return {allowed:false,requiresOverride:true,message:`${lock.id} is LOCKED. Register an explicit ${change.requestedLevel} override or unlock through approved change control.`};
}

export function regressionTargets(changedLock:GlowLock,allLocks:GlowLock[]){
 return [changedLock.id,...affectedDescendants(changedLock,allLocks)];
}

export const CHANGE_PROPAGATION_LAW={
 global:'change Global only when every descendant should inherit it',
 world:'change World for all rooms in that world',
 room:'change Room for all experiences in that room',
 template:'change Template for every experience using that structure',
 experience:'use only for a registered true exception',
} as const;
