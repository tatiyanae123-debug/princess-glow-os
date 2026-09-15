export type CanonicalObjectType='task'|'event'|'routine'|'routine-session'|'habit'|'goal'|'project'|'product'|'clothing-item'|'outfit'|'workout'|'workout-session'|'meal'|'appointment'|'person'|'place'|'trip'|'purchase'|'bill'|'document'|'note'|'idea'|'home-item'|'storage-location'|'observation';
export type MigrationDisposition='KEEP_CANONICAL'|'REFERENCE_CANONICAL'|'MERGE_DUPLICATE'|'MIGRATE_HISTORY'|'RETIRE_LOCAL_COPY'|'NEEDS_AUDIT';

export type ObjectProjection={family:string;localName:string;canonicalType:CanonicalObjectType;disposition:MigrationDisposition;notes?:string};

export const CANONICAL_OBJECT_MIGRATION:ObjectProjection[]=[
 {family:'today',localName:'today task',canonicalType:'task',disposition:'REFERENCE_CANONICAL'},
 {family:'planning',localName:'planning task',canonicalType:'task',disposition:'REFERENCE_CANONICAL'},
 {family:'routines',localName:'routine',canonicalType:'routine',disposition:'KEEP_CANONICAL'},
 {family:'beauty',localName:'beauty routine',canonicalType:'routine',disposition:'REFERENCE_CANONICAL'},
 {family:'beauty',localName:'beauty product',canonicalType:'product',disposition:'KEEP_CANONICAL'},
 {family:'beauty',localName:'skin observation/progress record',canonicalType:'observation',disposition:'REFERENCE_CANONICAL',notes:'Preserve source photos, timestamps, notes and provenance; UI progress projections do not own a second identity.'},
 {family:'closet',localName:'closet item',canonicalType:'clothing-item',disposition:'KEEP_CANONICAL'},
 {family:'closet',localName:'outfit',canonicalType:'outfit',disposition:'KEEP_CANONICAL'},
 {family:'fitness-wellness',localName:'workout',canonicalType:'workout',disposition:'KEEP_CANONICAL'},
 {family:'fitness-wellness',localName:'workout session',canonicalType:'workout-session',disposition:'REFERENCE_CANONICAL'},
 {family:'money',localName:'purchase/spending entry',canonicalType:'purchase',disposition:'NEEDS_AUDIT'},
 {family:'travel',localName:'trip event',canonicalType:'event',disposition:'REFERENCE_CANONICAL'},
 {family:'career-life',localName:'interview appointment',canonicalType:'appointment',disposition:'REFERENCE_CANONICAL'},
 {family:'home',localName:'where-things-live item',canonicalType:'home-item',disposition:'REFERENCE_CANONICAL'},
];

export function projectionsFor(type:CanonicalObjectType){return CANONICAL_OBJECT_MIGRATION.filter(x=>x.canonicalType===type);}

export const CANONICAL_MIGRATION_LAWS=[
 'A projection never owns a second identity for the same life object.',
 'Preserve history before retiring a local copy.',
 'Never merge uncertain identities automatically.',
 'Provenance and source timestamps survive migration.',
 'UI migration must not silently delete user data.',
] as const;
