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
const template=(kind:string)=>({experience,children}:GlowTemplateAdapterProps)=><Frame experience={experience} kind={kind}>{children}</Frame>;

export const GLOW_SHARED_TEMPLATE_ADAPTERS:GlowTemplateAdapters={
 T01:template('world-home'),T02:template('room-home'),T03:template('library'),T04:template('object-detail'),T05:template('studio'),T06:template('builder'),T07:template('guided'),T08:template('intelligence'),T09:template('timeline'),T10:template('planner'),T11:template('progress'),T12:template('collection'),T13:template('learn'),T14:template('review'),T15:template('system'),
};

// Shared structural adapters intentionally contain no domain-owned navigation or one-off styling.
