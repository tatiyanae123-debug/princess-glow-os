import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Batch6ProjectsView } from '@/components/batch6/work-create-reference';
import { createProjectAction, updateProjectAction } from '@/app/actions/intelligence-expansion';
import { getProjectsByUser } from '@/lib/data/user-scope';

export const dynamic='force-dynamic';
const fieldClass='w-full rounded-lg border border-[#E8E1DC] bg-white px-3 py-2 text-[11px] text-[#2B2420] placeholder:text-[#A69E98] focus:border-[#7C4857] focus:outline-none';
function toDateInput(value:Date|null){return value?value.toISOString().slice(0,10):'';}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [projects,params]=await Promise.all([getProjectsByUser(session.user.id),searchParams]);
  const requestedProjectId=typeof params.projectId==='string'?params.projectId:null;
  return <AppShell><div className="space-y-4"><Batch6ProjectsView projects={projects}/>
    <details id="new-project" className="rounded-[9px] border border-[#ece6e1] bg-white p-4 shadow-[0_10px_30px_rgba(57,46,39,.045)]"><summary className="cursor-pointer glow-display text-[16px]">Project management</summary>
      <div className="mt-4 grid gap-4 lg:grid-cols-[.62fr_1.38fr]">
        <form action={createProjectAction} className="space-y-2 rounded-[8px] border border-[#ece6e1] bg-[#fdfaf7] p-4"><h2 className="glow-display text-[16px]">New Project</h2><input name="title" required placeholder="Project title" className={fieldClass}/><input name="area" placeholder="Area" className={fieldClass}/><select name="priority" defaultValue="medium" className={fieldClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select><input name="deadline" type="date" className={fieldClass}/><textarea name="nextAction" rows={3} placeholder="Next action" className={fieldClass}/><button className="rounded-[7px] bg-[#7C4857] px-3 py-2 text-[10px] text-white">Create project</button></form>
        <div className="space-y-2">{projects.map(project=><details key={project.id} open={project.id===requestedProjectId} className="rounded-[8px] border border-[#ece6e1] bg-white"><summary className="cursor-pointer px-3 py-2 text-[10px] font-medium">{project.title} · {project.progress}%</summary><form action={updateProjectAction.bind(null,project.id)} className="grid gap-2 border-t border-[#f0ebe7] p-3 sm:grid-cols-3"><select name="status" defaultValue={project.status} className={fieldClass}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="archived">Archived</option></select><select name="priority" defaultValue={project.priority} className={fieldClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select><input name="progress" type="number" min="0" max="100" defaultValue={project.progress} className={fieldClass}/><input name="deadline" type="date" defaultValue={toDateInput(project.deadline)} className={fieldClass}/><input name="nextAction" defaultValue={project.nextAction??''} placeholder="Next action" className={`${fieldClass} sm:col-span-2`}/><textarea name="notes" rows={3} defaultValue={project.notes??''} placeholder="Notes" className={`${fieldClass} sm:col-span-3`}/><button className="w-fit rounded-[7px] border border-[#e6ddd7] px-3 py-2 text-[10px]">Save update</button></form></details>)}</div>
      </div>
    </details>
  </div></AppShell>;
}
