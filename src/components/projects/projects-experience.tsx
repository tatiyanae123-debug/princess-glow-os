import Link from 'next/link';
import { Check, CheckCircle2, Circle, FolderKanban, NotebookPen, Plus, Star } from 'lucide-react';
import { EditableRoomImage } from '@/components/media/editable-room-image';
import { addProjectMilestoneAction, toggleProjectMilestoneAction, type ProjectMilestone } from '@/app/actions/intelligence-expansion';
import type { Note, Task } from '@/lib/types';

type ProjectLite = {
  id: string;
  title: string;
  area: string;
  status: string;
  priority: string;
  progress: number;
  nextAction: string | null;
  deadline: Date | null;
  milestones: unknown;
  relatedTaskIds: unknown;
  updatedAt: Date;
};

function daysUntil(date: Date | null) {
  if (!date) return null;
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
}

function timeAgo(date: Date) {
  const minutes = Math.max(0, Math.round((Date.now() - date.getTime()) / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function ProjectsExperience({ projects, notes, tasks }: { projects: ProjectLite[]; notes: Note[]; tasks: Task[] }) {
  const active = projects.filter((project) => project.status === 'active');
  const featured = [...active].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0] ?? projects[0] ?? null;
  const featuredMilestones = featured ? ((Array.isArray(featured.milestones) ? featured.milestones : []) as ProjectMilestone[]) : [];
  const others = active.filter((project) => project.id !== featured?.id).slice(0, 3);
  const recentActivity = [...projects].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, 5);
  const featuredTaskIds = featured ? ((Array.isArray(featured.relatedTaskIds) ? featured.relatedTaskIds : []) as string[]) : [];
  const relatedTasks = tasks.filter((task) => featuredTaskIds.includes(task.id)).slice(0, 5);
  const recentNotes = notes.slice(0, 3);
  const remainingDays = daysUntil(featured?.deadline ?? null);

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="glow-display text-[38px] leading-none text-[#2B2420] sm:text-[46px]">Projects</h1>
          <p className="mt-2 max-w-lg text-[13px] text-[#8A8078]">A creative studio for bringing ideas to life. Plan, create, and ship beautiful work.</p>
        </div>
        <button type="button" onClick={() => document.dispatchEvent(new CustomEvent('glow:quick-add', { detail: { module: 'task' } }))} className="hidden items-center gap-1.5 rounded-full bg-[#C9727E] px-4 py-2.5 text-[12.5px] font-medium text-white sm:inline-flex">
          <Plus size={14} />New Project
        </button>
      </header>

      {featured ? (
        <div className="grid gap-0 overflow-hidden rounded-[20px] border border-[#F1E7E3] lg:grid-cols-[1.3fr_1fr]">
          <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
            <EditableRoomImage slot={`project:${featured.id}:cover`} label={`${featured.title} cover`} className="min-h-[160px]" />
            <div className="bg-white p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[.14em] text-[#C9727E]">Featured Project</p>
              <div className="mt-1 flex items-center gap-2"><h2 className="glow-display text-[22px] text-[#2B2420]">{featured.title}</h2><Star size={14} className="text-[#C9727E]" /></div>
              <p className="mt-1 text-[11.5px] text-[#8A8078]">{featured.area}{featured.nextAction ? ` · ${featured.nextAction}` : ''}</p>
              <div className="mt-4 flex items-center gap-6">
                <div><p className="text-[10.5px] text-[#9A9088]">Progress</p><p className="glow-display text-[18px] text-[#2B2420]">{featured.progress}%</p></div>
                {featured.deadline ? <div><p className="text-[10.5px] text-[#9A9088]">Deadline</p><p className="text-[12px] font-medium text-[#C9727E]">{featured.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p><p className="text-[10px] text-[#9A9088]">{remainingDays !== null ? (remainingDays < 0 ? `${Math.abs(remainingDays)}d overdue` : `${remainingDays} days remaining`) : ''}</p></div> : null}
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#C9727E]" style={{ width: `${featured.progress}%` }} /></div>
            </div>
          </div>
          <div className="border-t border-[#F1E7E3] bg-[#FDFAF8] p-5 lg:border-l lg:border-t-0">
            <p className="text-[13px] font-medium text-[#2B2420]">Milestones</p>
            <div className="mt-3 space-y-2">
              {featuredMilestones.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">No milestones yet.</p> : featuredMilestones.map((milestone) => (
                <form key={milestone.id} action={toggleProjectMilestoneAction.bind(null, featured.id, milestone.id)}>
                  <button type="submit" className="flex w-full items-center gap-2 text-left">
                    {milestone.done ? <CheckCircle2 size={15} className="shrink-0 text-[#5A6E52]" /> : <Circle size={15} className="shrink-0 text-[#D8CDC8]" />}
                    <span className={`text-[12.5px] ${milestone.done ? 'text-[#9A9088] line-through' : 'text-[#3A332E]'}`}>{milestone.title}</span>
                  </button>
                </form>
              ))}
            </div>
            <form action={addProjectMilestoneAction.bind(null, featured.id)} className="mt-3 flex gap-2">
              <input name="title" placeholder="Add milestone" className="min-w-0 flex-1 rounded-lg border border-[#F1E7E3] px-2.5 py-1.5 text-[11px]" />
              <button type="submit" className="rounded-lg bg-[#4A4440] px-2.5 py-1.5 text-[10.5px] font-medium text-white">Add</button>
            </form>
          </div>
        </div>
      ) : (
        <div className="rounded-[18px] border border-dashed border-[#F1E7E3] bg-white p-8 text-center">
          <FolderKanban size={22} className="mx-auto text-[#D8CDC8]" />
          <p className="mt-2 text-[13px] text-[#4A4440]">Start with one project you care about.</p>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between"><p className="text-[13px] font-medium text-[#2B2420]">Active Projects</p><Link href="#all-projects" className="text-[11.5px] font-medium text-[#C9727E]">View All</Link></div>
        <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {others.length === 0 ? <p className="text-[12px] text-[#9A9088]">No other active projects yet.</p> : others.map((project) => (
            <div key={project.id} className="overflow-hidden rounded-[16px] border border-[#F1E7E3] bg-white">
              <EditableRoomImage slot={`project:${project.id}:thumb`} label={`${project.title} thumbnail`} className="h-28" />
              <div className="p-3.5">
                <p className="truncate text-[12.5px] font-medium text-[#2B2420]">{project.title}</p>
                <p className="mt-1 text-[11px] font-medium text-[#C9727E]">{project.progress}%</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-[#F4ECE8]"><div className="h-full rounded-full bg-[#C9727E]" style={{ width: `${project.progress}%` }} /></div>
                {project.deadline ? <p className="mt-2 text-[10.5px] text-[#9A9088]">{project.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-5">
          <p className="text-[13px] font-medium text-[#2B2420]">Project Timeline</p>
          <p className="text-[10.5px] uppercase tracking-[.08em] text-[#9A9088]">{new Date().toLocaleDateString('en-US', { month: 'long' })}</p>
          <div className="mt-3 space-y-3">
            {featuredMilestones.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">Add milestones to build a timeline.</p> : featuredMilestones.map((milestone) => (
              <div key={milestone.id} className="flex items-center gap-3">
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${milestone.done ? 'bg-[#5A6E52]' : 'border-2 border-[#D8CDC8]'}`}>{milestone.done ? <Check size={11} className="text-white" /> : null}</span>
                <div className="min-w-0"><p className="truncate text-[12.5px] text-[#3A332E]">{milestone.title}</p><p className="text-[10px] text-[#9A9088]">{milestone.done ? 'Completed' : 'Upcoming'}</p></div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-[18px] border border-[#F1E7E3] bg-white p-2">
          {['a', 'b', 'c', 'd'].map((slot) => (
            <EditableRoomImage key={slot} slot={`project:${featured?.id ?? 'general'}:ref-${slot}`} label="Project reference image" className="h-24 rounded-[10px] sm:h-32" />
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-[12px] font-medium text-[#2B2420]"><NotebookPen size={13} className="text-[#C9727E]" />Notes</div><Link href="/notes" className="text-[10.5px] font-medium text-[#C9727E]">View All</Link></div>
          <div className="mt-2.5 space-y-2.5">
            {recentNotes.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">No notes yet.</p> : recentNotes.map((note) => (
              <div key={note.id}><p className="truncate text-[11.5px] font-medium text-[#3A332E]">{note.title || 'Untitled'}</p><p className="text-[10px] text-[#9A9088]">{note.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p></div>
            ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <div className="flex items-center justify-between"><p className="text-[12px] font-medium text-[#2B2420]">Related Tasks</p><Link href="/tasks" className="text-[10.5px] font-medium text-[#C9727E]">View All</Link></div>
          <div className="mt-2.5 space-y-2.5">
            {relatedTasks.length === 0 ? <p className="text-[11.5px] text-[#9A9088]">No linked tasks yet.</p> : relatedTasks.map((task) => (
              <p key={task.id} className="truncate text-[11.5px] text-[#3A332E]">{task.title}</p>
            ))}
          </div>
        </div>

        <div className="rounded-[18px] border border-[#F1E7E3] bg-white p-4">
          <p className="text-[12px] font-medium text-[#2B2420]">Recent Activity</p>
          <div className="mt-2.5 space-y-2.5">
            {recentActivity.map((project) => (
              <div key={project.id} className="flex items-center justify-between gap-2 text-[11.5px]"><span className="min-w-0 truncate text-[#3A332E]">{project.title} updated</span><span className="shrink-0 text-[10px] text-[#9A9088]">{timeAgo(project.updatedAt)}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-[18px] border border-[#F1E7E3] bg-[#FDF8F6] px-6 py-4">
        <p className="text-[12.5px] font-medium text-[#C9727E]">Ideas are easy. Execution is everything.</p>
        <p className="text-[11.5px] italic text-[#8A8078]">Glow is the space where both become art.</p>
      </div>
    </div>
  );
}
