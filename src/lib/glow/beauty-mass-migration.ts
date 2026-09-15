import { BEAUTY_FACTORY_WAVE, BEAUTY_FACTORY_GATES } from './beauty-factory-wave';

export type BeautyMigrationStatus='READY_FOR_FACTORY'|'EXCEPTION_REVIEW';
export const BEAUTY_MASS_MIGRATION=BEAUTY_FACTORY_WAVE.map(room=>({
 room:room.room,templates:room.templates,objects:room.objects,engines:room.engines,
 status:(room.exception?'EXCEPTION_REVIEW':'READY_FOR_FACTORY') as BeautyMigrationStatus,
 preserveExistingRoutes:true,preserveCanonicalData:true,retireOnlyAfterQa:true,
}));

export const BEAUTY_EXCEPTION_ROOMS=BEAUTY_MASS_MIGRATION.filter(x=>x.status==='EXCEPTION_REVIEW').map(x=>x.room);
export const BEAUTY_AUTOMATIC_ROOMS=BEAUTY_MASS_MIGRATION.filter(x=>x.status==='READY_FOR_FACTORY').map(x=>x.room);
export const BEAUTY_MASS_MIGRATION_GATES=[...BEAUTY_FACTORY_GATES,'family-migration-runner','repair-queue-clear','runtime-errors-clear','golden-exceptions-approved'] as const;

export function beautyMigrationSummary(){return {total:BEAUTY_MASS_MIGRATION.length,automatic:BEAUTY_AUTOMATIC_ROOMS.length,exceptions:BEAUTY_EXCEPTION_ROOMS,gates:BEAUTY_MASS_MIGRATION_GATES};}

// Registration authorizes factory migration, not deletion. Skincare and Gua Sha remain reference-critical exception rooms until their Golden gates pass.
