export type GlowTransition<S extends string,E extends string>={from:S;event:E;to:S};
export type GlowMachine<S extends string,E extends string>={id:string;initial:S;states:readonly S[];transitions:readonly GlowTransition<S,E>[]};

export function transition<S extends string,E extends string>(machine:GlowMachine<S,E>,state:S,event:E):S{
 const match=machine.transitions.find(t=>t.from===state&&t.event===event);
 return match?.to??state;
}

export const SESSION_STATES=['PREPARING','READY','ACTIVE','WAITING','PAUSED','INTERRUPTED','COMPLETE','FAILED'] as const;
export type SessionState=typeof SESSION_STATES[number];
export type SessionEvent='PREPARED'|'START'|'WAIT'|'CONTINUE'|'PAUSE'|'RESUME'|'INTERRUPT'|'COMPLETE'|'FAIL';

export const GUIDED_SESSION_MACHINE:GlowMachine<SessionState,SessionEvent>={id:'guided-session',initial:'PREPARING',states:SESSION_STATES,transitions:[
 {from:'PREPARING',event:'PREPARED',to:'READY'},{from:'READY',event:'START',to:'ACTIVE'},{from:'ACTIVE',event:'WAIT',to:'WAITING'},{from:'WAITING',event:'CONTINUE',to:'ACTIVE'},{from:'ACTIVE',event:'PAUSE',to:'PAUSED'},{from:'PAUSED',event:'RESUME',to:'ACTIVE'},{from:'ACTIVE',event:'INTERRUPT',to:'INTERRUPTED'},{from:'INTERRUPTED',event:'RESUME',to:'ACTIVE'},{from:'ACTIVE',event:'COMPLETE',to:'COMPLETE'},{from:'ACTIVE',event:'FAIL',to:'FAILED'}]};

export const UNIVERSAL_CONTENT_STATES=['loading','loaded','empty','partial','error','offline'] as const;
export const ENERGY_STATES=['recovery','low','normal','high'] as const;

// Domain experiences extend registered machines with data/config; they do not fork equivalent state logic.
