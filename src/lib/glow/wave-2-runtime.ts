import { WAVE_A_GATES, WAVE_A_SHARED_ANCESTORS, WAVE_A_TODAY_PLANNING_ROUTINES } from './wave-a-today-planning-routines';

export const WAVE_2_FAMILY = 'today-planning-routines' as const;
export type Wave2EnergyMode = 'low' | 'normal' | 'high' | 'recovery';
export type Wave2Surface = 'today' | 'planning' | 'routines';

export const WAVE_2_CANONICAL_ROUTES: Record<Wave2Surface,string> = { today:'/today', planning:'/planning', routines:'/routines' };
export const WAVE_2_TIME_WINDOWS = { morning:{start:'05:00',end:'10:00'}, between:{start:'10:00',end:'16:00'}, evening:{start:'16:00',end:'20:30'}, night:{start:'20:30',end:'23:00'} } as const;
export const WAVE_2_ENERGY_CAPACITY = {
  low:{priorityLimit:1,protectOpenSpace:true}, normal:{priorityLimit:3,protectOpenSpace:true}, high:{priorityLimit:6,protectOpenSpace:true}, recovery:{priorityLimit:1,protectOpenSpace:true,recoveryFirst:true},
} as const;
export const WAVE_2_SHARED_RUNTIME = {
  canonicalObjects:['task','event','routine','routine-session','habit','goal','project'],
  capabilities:['what-now','energy-mode','capacity','timeline','calendar','time-blocking','recurrence','guided-session','completion-history','recommendation'],
  ancestors:WAVE_A_SHARED_ANCESTORS,gates:WAVE_A_GATES,timeWindows:WAVE_2_TIME_WINDOWS,energyCapacity:WAVE_2_ENERGY_CAPACITY,
} as const;

export function wave2SurfaceForPath(pathname:string):Wave2Surface|null {
  if(pathname==='/today'||pathname.startsWith('/today/'))return 'today';
  if(pathname==='/planning'||pathname.startsWith('/planning/'))return 'planning';
  if(pathname==='/routines'||pathname.startsWith('/routines/'))return 'routines';
  return null;
}
export function wave2RuntimeContext(pathname:string){
  const surface=wave2SurfaceForPath(pathname); if(!surface)return null;
  const family=WAVE_A_TODAY_PLANNING_ROUTINES.find(entry=>entry.family===surface);
  return {family:WAVE_2_FAMILY,surface,route:WAVE_2_CANONICAL_ROUTES[surface],canonicalObjects:family?.canonicalObjects??[],sharedCapabilities:family?.sharedCapabilities??[],timeWindows:WAVE_2_TIME_WINDOWS,energyCapacity:WAVE_2_ENERGY_CAPACITY,preserveExistingRoutes:true,retireOnlyAfterQa:true} as const;
}

export type Wave2QaEvidence={surface:Wave2Surface;route:boolean;data:boolean;sharedContext:boolean;energyCapacity:boolean;history:boolean;responsive:boolean;accessibility:boolean;visual:boolean;golden:boolean;runtime?:boolean;blockers?:string[]};
export function evaluateWave2Qa(evidence:Wave2QaEvidence[]){
  const required=(x:Wave2QaEvidence)=>x.route&&x.data&&x.sharedContext&&x.energyCapacity&&x.history&&x.responsive&&x.accessibility&&x.visual&&x.golden&&x.runtime!==false;
  const failed=evidence.filter(x=>!required(x));
  return {passed:evidence.length===3&&failed.length===0,failedSurfaces:failed.map(x=>x.surface),blockers:[...new Set(failed.flatMap(x=>x.blockers??[]))],canLock:evidence.length===3&&failed.length===0};
}

export type Wave2ActionReceipt={id:string;surface:Wave2Surface;objectType:string;objectId:string;action:string;occurredAt:string;reversible:boolean};
export type Wave2ExecutionState={energy:Wave2EnergyMode;scheduledMinutes:number;availableMinutes:number;receipts:Wave2ActionReceipt[]};
export function wave2Capacity(state:Wave2ExecutionState){
  const policy=WAVE_2_ENERGY_CAPACITY[state.energy];
  const remaining=Math.max(0,state.availableMinutes-state.scheduledMinutes);
  return {priorityLimit:policy.priorityLimit,remainingMinutes:remaining,overCapacity:state.scheduledMinutes>state.availableMinutes,protectOpenSpace:policy.protectOpenSpace,recoveryFirst:'recoveryFirst' in policy&&policy.recoveryFirst===true};
}
export function appendWave2Receipt(state:Wave2ExecutionState,receipt:Wave2ActionReceipt):Wave2ExecutionState{return {...state,receipts:[receipt,...state.receipts]};}

export type Wave2CompletionEvidence={buildReady:boolean;routesPreserved:boolean;canonicalDataPreserved:boolean;sharedRuntimeBound:boolean;historyConnected:boolean;responsiveVerified:boolean;accessibilityVerified:boolean;visualVerified:boolean;goldenVerified:boolean;runtimeVerified:boolean;blockers:string[]};
export function wave2CompletionStatus(e:Wave2CompletionEvidence){
  const passed=e.buildReady&&e.routesPreserved&&e.canonicalDataPreserved&&e.sharedRuntimeBound&&e.historyConnected&&e.responsiveVerified&&e.accessibilityVerified&&e.visualVerified&&e.goldenVerified&&e.runtimeVerified&&e.blockers.length===0;
  return {passed,canLock:passed,status:passed?'LOCKABLE':'BUILDING' as const,blockers:e.blockers};
}

export const WAVE_2_STEPS_26_30=[
 {step:26,action:'verify-steps-21-25-build',owner:'wave-2'},
 {step:27,action:'bind-execution-capacity-state',owner:'planner-engine'},
 {step:28,action:'bind-cross-surface-action-receipts',owner:'history-layer'},
 {step:29,action:'evaluate-runtime-responsive-accessibility-visual-golden-evidence',owner:'qa-pipeline'},
 {step:30,action:'lock-wave-2-only-if-all-evidence-passes',owner:'factory-lock'},
] as const;
