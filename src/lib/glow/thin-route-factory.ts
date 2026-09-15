import type { ExperienceResolver, ResolvedGlowExperience } from './experience-renderer';
import { resolveGlowExperience } from './experience-renderer';

export type ThinRouteRequest={experienceId:string;objectId?:string;variant?:string;entryPoint?:string};

export function resolveThinRoute(request:ThinRouteRequest,resolver:ExperienceResolver):ResolvedGlowExperience{
 const resolved=resolveGlowExperience(request.experienceId,resolver);
 return {...resolved,context:{...resolved.context,objectId:request.objectId??resolved.context.objectId,variant:request.variant??resolved.context.variant,entryPoint:request.entryPoint??resolved.context.entryPoint}};
}

export function createThinRoute(experienceId:string){
 return function resolve(request:Omit<ThinRouteRequest,'experienceId'>,resolver:ExperienceResolver){return resolveThinRoute({experienceId,...request},resolver);};
}

export const THIN_ROUTE_LAW='URL/entry point resolves identity and context, then delegates architecture to the Glow Experience Renderer.' as const;
