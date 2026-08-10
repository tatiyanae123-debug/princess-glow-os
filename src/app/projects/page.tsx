import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createProjectAction, updateProjectAction } from '@/app/actions/intelligence-expansion';
import { getProjectsByUser } from '@/lib/data/user-scope';

export const dynamic = 'force-dynamic';

function toDateInput(value: Date | null) {
  if (!value) return '';
  return value.toISOString().slice(0, 10);
}

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const projects = await getProjectsByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Projects + Creative Studio" title="Move every project forward from one place" description="Track status, priority, progress, next action, deadline, notes, milestones, related tasks, and activity using one shared project model.">
        <div className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
          <Card>
            <form action={createProjectAction} className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Creative Studio</p>
                <h2 className="mt-2 text-lg font-semibold">New project</h2>
              </div>
              <input name="title" required placeholder="Project title" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <input name="area" placeholder="Area, e.g. Terrain Design" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <select name="priority" defaultValue="medium" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
              <input name="deadline" type="date" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <textarea name="nextAction" rows={4} placeholder="Next action" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Create project</button>
            </form>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">Live project manager</p>
              <h2 className="mt-2 text-lg font-semibold">Active projects</h2>
            </div>
            {projects.length === 0 ? <p className="text-sm text-slate-500">No projects yet. Create one when you are ready.</p> : projects.map((project) => (
              <form key={project.id} action={updateProjectAction.bind(null, project.id)} className="rounded-[22px] border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{project.title}</p>
                    <p className="text-sm text-slate-500">{project.area}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs dark:bg-slate-800">{project.status}</span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <label className="text-xs font-medium text-slate-500">Status
                    <select name="status" defaultValue={project.status} className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-800"><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="archived">Archived</option></select>
                  </label>
                  <label className="text-xs font-medium text-slate-500">Priority
                    <select name="priority" defaultValue={project.priority} className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-800"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
                  </label>
                  <label className="text-xs font-medium text-slate-500">Progress
                    <input name="progress" type="number" min="0" max="100" defaultValue={project.progress} className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-800" />
                  </label>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full bg-slate-900 dark:bg-white" style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }} /></div>

                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-medium text-slate-500">Deadline
                    <input name="deadline" type="date" defaultValue={toDateInput(project.deadline)} className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-800" />
                  </label>
                  <label className="text-xs font-medium text-slate-500">Next action
                    <input name="nextAction" defaultValue={project.nextAction ?? ''} placeholder="What moves this forward?" className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-800" />
                  </label>
                </div>
                <label className="mt-3 block text-xs font-medium text-slate-500">Notes
                  <textarea name="notes" rows={3} defaultValue={project.notes ?? ''} placeholder="Context, decisions, links, or ideas" className="mt-1 w-full rounded-xl border border-slate-200 bg-transparent px-3 py-2 text-sm dark:border-slate-800" />
                </label>
                <button type="submit" className="mt-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium dark:border-slate-800">Save project update</button>
              </form>
            ))}
          </Card>
        </div>
      </SectionPage>
    </AppShell>
  );
}
