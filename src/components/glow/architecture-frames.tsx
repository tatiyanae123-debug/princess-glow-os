import type { ReactNode } from 'react';
import type { PageArchitectureId } from '@/lib/glow/architecture-constitution';

type FrameProps = {
  title?: ReactNode;
  orientation?: ReactNode;
  primary: ReactNode;
  supporting?: ReactNode;
  inspector?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
};

type ArchitectureFrameProps = FrameProps & {
  architecture: PageArchitectureId;
  layout?: 'brief'|'split'|'studio'|'map'|'graph'|'sequence'|'command'|'protected';
  inspectorLabel?: string;
};

export function ArchitectureFrame({
  architecture,
  layout='split',
  title,
  orientation,
  primary,
  supporting,
  inspector,
  actions,
  footer,
  className='',
  inspectorLabel='Supporting context',
}: ArchitectureFrameProps) {
  return (
    <section
      className={`glow-architecture-frame ${className}`.trim()}
      data-page-architecture={architecture}
      data-architecture-layout={layout}
    >
      {(title || orientation || actions) ? (
        <header className="glow-architecture-frame__header">
          <div className="min-w-0">{orientation}{title}</div>
          {actions ? <div className="glow-architecture-frame__actions">{actions}</div> : null}
        </header>
      ) : null}
      <div className="glow-architecture-frame__body">
        <main className="glow-architecture-frame__primary">{primary}</main>
        {supporting ? <aside className="glow-architecture-frame__supporting" aria-label="Supporting information">{supporting}</aside> : null}
        {inspector ? <aside className="glow-architecture-frame__inspector" aria-label={inspectorLabel}>{inspector}</aside> : null}
      </div>
      {footer ? <footer className="glow-architecture-frame__footer">{footer}</footer> : null}
    </section>
  );
}

const frame = (architecture: PageArchitectureId, layout: ArchitectureFrameProps['layout'] = 'split') =>
  function NamedArchitectureFrame(props: FrameProps) {
    return <ArchitectureFrame {...props} architecture={architecture} layout={layout} />;
  };

export const ContextualBriefFrame = frame('contextual-brief','brief');
export const TransitionalBriefFrame = frame('transitional-brief','brief');
export const CalendarFrame = frame('operational-calendar','studio');
export const ScenarioStudioFrame = frame('scenario-studio','studio');
export const ObjectWorkspaceFrame = frame('object-workspace','split');
export const GuidedExperienceFrame = frame('guided-experience','sequence');
export const AdaptiveProgramFrame = frame('adaptive-program','studio');
export const SpatialOperationsFrame = frame('spatial-operations','map');
export const RelationshipCareFrame = frame('relationship-care','split');
export const KnowledgeGraphFrame = frame('knowledge-graph','graph');
export const SystemConstellationFrame = frame('system-constellation','graph');
export const LivingSystemFrame = frame('living-system-map','map');
export const CultivationDashboardFrame = frame('cultivation-dashboard','command');
export const EmbodiedStateFrame = frame('embodied-state','split');
export const DomainStudioFrame = frame('personal-domain-studio','studio');
export const ResourceCommandCenterFrame = frame('resource-command-center','command');

export const IntegratedDomainHubFrame = frame('integrated-domain-hub','command');
export const AmbientCaptureFieldFrame = frame('ambient-capture-field','map');
export const ProgressionCommandCenterFrame = frame('progression-command-center','command');
export const ShoppingOperationsFrame = frame('shopping-operations-workspace','command');
export const CrossDomainProtocolFrame = frame('cross-domain-protocol-orchestrator','sequence');
export const PrecisionGuidedStudioFrame = frame('precision-guided-studio','studio');
export const RestorativeCareFrame = frame('restorative-care-workspace','split');

export const LivingDayFrame = frame('living-day-orchestrator','sequence');
export const ReplanStudioFrame = frame('adaptive-replanning-studio','studio');
export const DayPhaseFrame = frame('day-phase-workspace','sequence');
export const ImmediateHorizonFrame = frame('immediate-horizon','sequence');
export const EventWorkspaceFrame = frame('event-workspace','split');
export const ProtectedExecutionFrame = frame('protected-execution','protected');
export const DecisionResolverFrame = frame('contextual-decision-resolver','split');
