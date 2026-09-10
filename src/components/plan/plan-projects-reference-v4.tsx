'use client';

import { useMemo, useState } from 'react';
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileText,
  FolderOpen,
  GalleryHorizontal,
  List,
  MoreHorizontal,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Users,
} from 'lucide-react';
import { PlanInstrumentChrome, type PlanHorizon } from './plan-instrument-chrome';
import styles from './plan-reference-rooms.module.css';

export type PlanProjectItem = {
  id: string;
  title: string;
  area: string;
  status: string;
  priority: string;
  progress: number;
  deadline: string | null;
  nextAction: string | null;
  notes: string | null;
};

type ProjectView = 'List' | 'Board' | 'Timeline' | 'Gallery';
const stages = ['Discover', 'Define', 'Design', 'Build', 'Launch'];

function shortDate(value: string | null | undefined) {
  if (!value) return 'No deadline';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'No deadline' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function lines(value: string | null, fallback: string) {
  const result = (value ?? '').split(/\n|•|;/).map((item) => item.trim()).filter(Boolean);
  return result.length ? result.slice(0, 4) : [fallback];
}

export function PlanProjectsReferenceV4({ projects }: { projects: PlanProjectItem[] }) {
  const [horizon, setHorizon] = useState<PlanHorizon>('month');
  const [selectedId, setSelectedId] = useState(projects.find((project) => project.status === 'active')?.id ?? projects[0]?.id ?? '');
  const [view, setView] = useState<ProjectView>('Timeline');
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0] ?? null;
  const stageIndex = Math.min(4, Math.max(0, Math.floor((selected?.progress ?? 0) / 20)));
  const days = selected?.deadline ? Math.ceil((new Date(selected.deadline).getTime() - Date.now()) / 86_400_000) : null;
  const actions = lines(selected?.nextAction ?? null, 'No next action recorded yet.');
  const noteLines = lines(selected?.notes ?? null, 'No project notes recorded yet.');
  const progress = Math.max(0, Math.min(100, Math.round(selected?.progress ?? 0)));
  const timelineWidths = useMemo(() => stages.map((_, index) => Math.max(0, Math.min(100, progress - index * 20))), [progress]);

  return (
    <PlanInstrumentChrome
      title="PLAN · PROJECTS"
      subtitle="Turn ideas into impact. Organize, align, and move things forward."
      activeInstrument="Projects"
      horizon={horizon}
      onHorizonChange={setHorizon}
      centerLabel="TODAY"
    >
      <section className={`${styles.stage} project-reference-v4`} aria-label="Project observatory">
        <div className="project-view-switch-v4" aria-label="Project view">
          {(['List', 'Board', 'Timeline', 'Gallery'] as ProjectView[]).map((item) => (
            <button key={item} type="button" className={view === item ? 'active' : ''} onClick={() => setView(item)}>
              {item === 'List' ? <List size={12} /> : item === 'Gallery' ? <GalleryHorizontal size={12} /> : <FolderOpen size={12} />}{item}
            </button>
          ))}
          <button type="button" aria-label="More project views"><MoreHorizontal size={13} /></button>
        </div>

        <div className="project-hero-v4">
          <div className="project-title-v4">
            <span className="project-glyph-v4"><Sparkles size={18} /></span>
            <div><small>PROJECT</small><h2>{selected?.title ?? 'Project world'}</h2><p>{selected?.notes || 'A unified planning experience for a calmer, brighter future.'}</p></div>
          </div>
          <div className="project-meta-v4"><span>● {selected?.area ?? 'Unassigned'}</span><span>▣ {selected ? shortDate(selected.deadline) : 'No dates'}</span><span className="on-track-v4">● {selected?.status ?? 'Not started'}</span></div>
          <div className="project-stage-line-v4">
            {stages.map((stage, index) => <div key={stage} className={index < stageIndex ? 'done' : index === stageIndex ? 'current' : ''}><i>{index < stageIndex ? <CheckCircle2 size={13} /> : index + 1}</i><strong>{stage}</strong><small>{index < stageIndex ? 'Completed' : index === stageIndex ? 'In progress' : 'Not started'}</small></div>)}
          </div>
          {projects.length > 1 ? <label className="project-picker-v4">Project <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select><ChevronDown size={11} /></label> : null}
        </div>

        <div className="project-observatory-v4">
          <span className="project-ring-v4 ring-one" /><span className="project-ring-v4 ring-two" /><span className="project-ring-v4 ring-three" />
          <span className="project-pearl-v4 p1" /><span className="project-pearl-v4 p2" /><span className="project-pearl-v4 p3" /><span className="project-pearl-v4 p4" />
          <div className="project-center-v4"><div className="project-city-v4"><i /><i /><i /><i /><i /></div><strong>{selected?.title ?? 'Project'}</strong><small>{selected?.area ?? 'Project'} · {stages[stageIndex]}</small></div>

          <article className="project-float-v4 actions-v4"><h3>NEXT ACTIONS</h3>{actions.map((action, index) => <div key={`${action}-${index}`}><Circle size={10} /><span>{action}</span><small>{index === 0 ? 'Next' : ''}</small></div>)}<button type="button">+ Add next action</button></article>
          <article className="project-float-v4 notes-v4"><h3>NOTES</h3>{noteLines.map((note, index) => <p key={`${note}-${index}`}>• {note}</p>)}<button type="button">+ Add a note</button></article>
          <article className="project-float-v4 files-v4"><h3>FILES</h3><div className="empty-project-v4"><FileText size={17} /><span>No linked project files yet</span><small>Files appear here only when connected to this project.</small></div></article>
          <article className="project-float-v4 inspiration-v4"><h3>INSPIRATION</h3><div className="inspiration-thumbs-v4"><i /><i /><i /></div><p>Visual references connected to this project will live here.</p></article>
          <article className="project-float-v4 blockers-v4"><h3>BLOCKERS</h3><div><Circle size={10} /><span>{selected?.status === 'paused' ? 'Project is intentionally paused' : 'No explicit blocker recorded'}</span><small className={selected?.status === 'paused' ? 'high-v4' : 'low-v4'}>{selected?.status === 'paused' ? 'High' : 'Low'}</small></div></article>
        </div>

        <aside className="project-rail-v4">
          <article><h3>Deadline</h3><strong>{shortDate(selected?.deadline)}</strong><span className="days-left-v4">{days === null ? 'No date' : days < 0 ? `${Math.abs(days)} days overdue` : `${days} days left`}</span><div className="deadline-ring-v4" style={{ '--project-progress': `${progress}%` } as React.CSSProperties}><b>{progress}%</b></div></article>
          <article><h3><Users size={14} /> People</h3><div className="avatar-row-v4"><span /><span /><span /><span /><b>Connected people appear here</b></div></article>
          <article><h3>⚡ Automation</h3><div className="automation-row-v4"><span>Summarize weekly</span><ToggleRight size={25} /></div><div className="automation-row-v4"><span>Update status from tasks</span><ToggleRight size={25} /></div><div className="automation-row-v4"><span>Tag blockers</span><ToggleLeft size={25} /></div><small>Visual controls remain proposal-only until an executor is configured.</small></article>
          <article><h3><Archive size={14} /> Archive</h3><div className="automation-row-v4"><span>Move to archive when complete</span><ToggleLeft size={25} /></div></article>
        </aside>

        <div className="project-bottom-v4">
          <article className="gantt-v4"><h3>PROJECT TIMELINE</h3><div className="gantt-months-v4"><span>Month 1</span><span>Month 2</span><span>Month 3</span></div>{stages.map((stage, index) => <div className="gantt-row-v4" key={stage}><span>{stage}</span><i><b style={{ width: `${timelineWidths[index]}%` }} /></i></div>)}</article>
          <article className="decisions-v4"><h3>RECENT DECISIONS <small>View all ›</small></h3><div className="empty-project-v4"><CheckCircle2 size={16} /><span>No recorded decisions yet</span><small>Verified decision history will appear from Glow History.</small></div></article>
        </div>
      </section>
    </PlanInstrumentChrome>
  );
}
