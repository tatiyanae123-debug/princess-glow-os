import type { ReactNode } from 'react';
import type { ResolvedGlowExperience } from '@/lib/glow/experience-renderer';

export type GlowTemplateAdapterProps={experience:ResolvedGlowExperience;children?:ReactNode};
export type GlowTemplateAdapter=(props:GlowTemplateAdapterProps)=>ReactNode;

export type GlowTemplateAdapters=Partial<Record<ResolvedGlowExperience['template'],GlowTemplateAdapter>>;

function MissingTemplate({experience}:GlowTemplateAdapterProps){
 return <section data-glow-template={experience.template} data-glow-experience={experience.context.experienceId} aria-label="Glow experience unavailable"><h1>Experience unavailable</h1><p>This Glow template has not been connected yet.</p></section>;
}

export function GlowTemplateRenderer({experience,adapters,children}:{experience:ResolvedGlowExperience;adapters:GlowTemplateAdapters;children?:ReactNode}){
 const Adapter=adapters[experience.template]??MissingTemplate;
 return <Adapter experience={experience}>{children}</Adapter>;
}

// Step 26 law: routes and domains select registered templates; they do not recreate shell/template architecture.
