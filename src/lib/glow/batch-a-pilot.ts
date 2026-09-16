import { getSkincareExperience } from './experience-registry';
import type { CanonicalObjectType } from './canonical-object-migration';
import { supportsTemplate } from './canonical-object-adapters';

export type PilotExperience={id:string;route:string;template:string;canonicalType?:CanonicalObjectType;golden:boolean;legacyProjection:string;gaps:string[]};

const PILOT_IDS=['beauty.skincare.home','beauty.skincare.products','beauty.skincare.product','beauty.skincare.session','beauty.skincare.progress'] as const;
const ROUTES:Record<(typeof PILOT_IDS)[number],string>={
 'beauty.skincare.home':'/beauty/skincare','beauty.skincare.products':'/beauty/skincare?view=product-library','beauty.skincare.product':'/beauty/skincare?view=product-detail','beauty.skincare.session':'/beauty/skincare?view=guided-routine','beauty.skincare.progress':'/beauty/skincare?view=progress-photos',
};
const TYPES:Partial<Record<(typeof PILOT_IDS)[number],CanonicalObjectType>>={
 'beauty.skincare.products':'product','beauty.skincare.product':'product','beauty.skincare.session':'routine-session','beauty.skincare.progress':'observation',
};

export const SKINCARE_REAL_PILOT:PilotExperience[]=PILOT_IDS.map(id=>{
 const experience=getSkincareExperience(id); if(!experience) throw new Error(`Missing registered pilot ${id}`);
 const canonicalType=TYPES[id]; const gaps:string[]=[];
 if(canonicalType&&!supportsTemplate(canonicalType,experience.template)) gaps.push(`canonical ${canonicalType} is not yet declared compatible with ${experience.template}`);
 if(id==='beauty.skincare.home') gaps.push('legacy page owns ReferenceRail/global navigation; migrate shell ownership before retiring it');
 return {id,route:ROUTES[id],template:experience.template,canonicalType,golden:Boolean(experience.golden),legacyProjection:'src/app/beauty/skincare/page.tsx',gaps};
});

export const FACTORY_GAP_REPAIR_QUEUE=[
 {owner:'global-shell',issue:'Skincare ReferenceRail duplicates global navigation',repair:'Move persistent navigation/Ask Glow/context ownership to Global Glow Shell; keep skincare content projection only.',severity:'HIGH',status:'OPEN'},
 {owner:'canonical-objects',issue:'Skin progress lacked a canonical observation type',repair:'Canonical observation now preserves progress/photo/timestamp/provenance identity across projections.',severity:'BLOCKER',status:'RESOLVED'},
 {owner:'template-T02',issue:'Skincare Home has a reference-critical custom composition',repair:'Keep Atelier composition as registered T02 exception while removing shell-owned structure.',severity:'MEDIUM',status:'OPEN'},
 {owner:'routes',issue:'Pilot experiences currently share query-param routing inside one large page',repair:'Introduce thin experience resolution without deleting legacy route until parity/QA passes.',severity:'HIGH',status:'OPEN'},
] as const;

export function validateSkincarePilot(){const errors:string[]=[];for(const p of SKINCARE_REAL_PILOT){if(!getSkincareExperience(p.id))errors.push(`${p.id}: missing registry`);if(!p.route)errors.push(`${p.id}: missing route`);if(p.canonicalType&&!supportsTemplate(p.canonicalType,p.template))errors.push(`${p.id}: incompatible ${p.canonicalType}/${p.template}`);}return {valid:errors.length===0,errors,pilotCount:SKINCARE_REAL_PILOT.length,gaps:FACTORY_GAP_REPAIR_QUEUE};}

// Batch A is preservation-first. These records authorize migration work, not deletion of the current skincare route or user data.
