import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createProjectAction } from '@/app/actions/intelligence-expansion';
import { getProjectsByUser } from '@/lib/data/user-scope';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const projects = await getProjectsByUser(session.user.id);

  return (
    <AppShell>
      <SectionPage eyebrow="Projects + Creative Studio" title="Move every project forward from one place" description="Track status, priority, progress, next action, deadline, milestones, related tasks, and activity using one shared project model.">
        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <Card>
            <form action={createProjectAction} className="space-y-3">
              <h2 className="text-lg font-semibold">New project</h2>
              <input name="title" required placeholder="Project title" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <input name="area" placeholder="Area, e.g. Creative Studio" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <select name="priority" defaultValue="medium" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select>
              <textarea name="nextAction" rows={4} placeholder="Next action" className="w-full rounded-2xl border border-slate-200 bg-transparent px-4 py-3 text-sm dark:border-slate-800" />
              <button type="submit" className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-slate-900">Create project</button>
            </form>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-semibold">Active projects</h2>
            {projects.length === 0 ? <p className="text-sm text-slate-500">No projects yet. Create one when you are ready.</p> : projects.map((project) => (
              <div key={project.id} className="rounded-[22px] border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{project.title}</p><p className="text-sm text-slate-500">{project.area}</p></div><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs dark:bg-slate-800">{project.priority}</span></div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full bg-slate-900 dark:bg-white" style={{ width: `${Math.max(0, Math.min(100, project.progress))}%` }} /></div>
                <p className="mt-2 text-xs text-slate-500">{project.progress}% · {project.status}</p>
                {project.nextAction && <p className="mt-3 text-sm"><span className="font-medium">Next:</span> {project.nextAction}</p>}
              </div>
            ))}
          </Card>
        </div>
      </SectionPage>
    </AppShell>
  );
}
