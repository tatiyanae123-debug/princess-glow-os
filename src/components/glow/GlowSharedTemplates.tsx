import type { ReactNode } from 'react';
import type { GlowTemplateAdapters, GlowTemplateAdapterProps } from './GlowTemplateRenderer';

function Frame({experience,children,kind}:{experience:GlowTemplateAdapterProps['experience'];children?:ReactNode;kind:string}){
 const state=experience.props.state as Record<string,unknown>|undefined;
 return <main data-glow-template={experience.template} data-glow-kind={kind} data-glow-world={experience.context.world} data-glow-room={experience.context.room??''} data-glow-experience={experience.context.experienceId}>
  <header><p>{experience.context.world}{experience.context.room?` · ${experience.context.room}`:''}</p><h1>{experience.context.experienceId}</h1></header>
  {state?.status==='loading'?<p role="status">Loading…</p>:null}
  <section data-glow-slot="primary">{children}</section>
  <aside data-glow-slot="intelligence" aria-label="Glow intelligence" />
  <footer data-glow-slot="continuity" />
 </main>;
}
function createTemplateAdapter(kind:string){
 function GlowSharedTemplate({experience,children}:GlowTemplateAdapterProps){return <Frame experience={experience} kind={kind}>{children}</Frame>;}
 GlowSharedTemplate.displayName=`GlowSharedTemplate(${kind})`;
 return GlowSharedTemplate;
}

export const GLOW_SHARED_TEMPLATE_ADAPTERS:GlowTemplateAdapters={
 T01:createTemplateAdapter('world-home'),T02:createTemplateAdapter('room-home'),T03:createTemplateAdapter('library'),T04:createTemplateAdapter('object-detail'),T05:createTemplateAdapter('studio'),T06:createTemplateAdapter('builder'),T07:createTemplateAdapter('guided'),T08:createTemplateAdapter('intelligence'),T09:createTemplateAdapter('timeline'),T10:createTemplateAdapter('planner'),T11:createTemplateAdapter('progress'),T12:createTemplateAdapter('collection'),T13:createTemplateAdapter('learn'),T14:createTemplateAdapter('review'),T15:createTemplateAdapter('system'),
};

// Shared structural adapters intentionally contain no domain-owned navigation or one-off styling.
