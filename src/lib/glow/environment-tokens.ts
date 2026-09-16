export type GlowTokenValue=string|number|boolean;
export type GlowTokenSet=Record<string,GlowTokenValue>;
export type EnvironmentLayer={id:string;level:'GLOBAL'|'WORLD'|'ROOM'|'TEMPLATE'|'EXCEPTION';tokens:GlowTokenSet};

export function resolveEnvironmentTokens(layers:EnvironmentLayer[]){
 const rank={GLOBAL:0,WORLD:1,ROOM:2,TEMPLATE:3,EXCEPTION:4} as const;
 return [...layers].sort((a,b)=>rank[a.level]-rank[b.level]).reduce<GlowTokenSet>((out,layer)=>Object.assign(out,layer.tokens),{});
}

export const GLOBAL_GLOW_TOKENS:GlowTokenSet={
 'motion.standard':'240ms','motion.spatial':'420ms','surface.blur':20,'touch.min':44,'content.max':'1600px','overlay.depth':100,
};

export const BEAUTY_WORLD_TOKENS:GlowTokenSet={
 'material.softness':0.8,'image.editorial':true,'motion.softness':0.75,
};

export const SKINCARE_ATELIER_TOKENS:GlowTokenSet={
 'material.pearlGlass':true,'material.ivoryStone':true,'material.creamPlaster':true,'material.chrome':true,'accent.blush':'pale','atmosphere.mist':0.24,'light.mirror':0.72,'reflection.water':0.3,
};

export function changedTokenKeys(before:GlowTokenSet,after:GlowTokenSet){return [...new Set([...Object.keys(before),...Object.keys(after)])].filter(k=>before[k]!==after[k]);}

// Correct level law: change the highest inheritance layer whose entire descendant set should receive the change.
