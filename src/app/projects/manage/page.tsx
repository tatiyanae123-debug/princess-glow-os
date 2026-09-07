import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { SectionPage } from '@/components/section-page';
import { Card } from '@/components/ui/card';
import { createProjectAction, updateProjectAction } from '@/app/actions/intelligence-expansion';
import { getProjectsByUser } from '@/lib/data/user-scope';

export const dynamic='force-dynamic';
const field='w-full rounded-[8px] border border-[#e4d9d1] bg-white px-3 py-2.5 text-[10px]';

export default async function ProjectManagementPage(){
  const session=await auth();
  if(!session?.user?.id)redirect('/sign-in');
  const projects=await getProjectsByUser(session.user.id);
  return <AppShell><SectionPage eyebrow="Projects" title="Manage project objects" description="Create and edit the same project records shown in the Plan project world.">
    <div className="grid gap-5 lg:grid-cols-[.72fr_1.28fr]">
      <Card className="p-5"><form action={createProjectAction} className="space-y-3"><h2 className="glow-display text-[20px] text-[#493c32]">New project</h2><input name="title" required placeholder="Project title" className={field}/><input name="area" placeholder="Area" className={field}/><select name="priority" defaultValue="medium" className={field}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select><input name="deadline" type="date" className={field}/><textarea name="nextAction" rows={4} placeholder="Next action" className={field}/><button type="submit" className="rounded-[8px] bg-[#40352e] px-4 py-2 text-[10px] text-white">Create project</button></form></Card>
      <div className="space-y-3">{projects.map((project)=><Card key={project.id} className="p-4"><form action={updateProjectAction.bind(null,project.id)} className="grid gap-3 md:grid-cols-3"><div className="md:col-span-3"><h3 className="glow-display text-[18px] text-[#4a3d33]">{project.title}</h3><p className="text-[9px] text-[#8d796a]">{project.area} · {project.progress}%</p></div><select name="status" defaultValue={project.status} className={field}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="archived">Archived</option></select><select name="priority" defaultValue={project.priority} className={field}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select><input name="progress" type="number" min="0" max="100" defaultValue={project.progress} className={field}/><input name="deadline" type="date" defaultValue={project.deadline?project.deadline.toISOString().slice(0,10):''} className={field}/><input name="nextAction" defaultValue={project.nextAction??''} placeholder="Next action" className={`${field} md:col-span-2`}/><textarea name="notes" rows={4} defaultValue={project.notes??''} placeholder="Notes / context / blockers" className={`${field} md:col-span-3`}/><button type="submit" className="w-fit rounded-[8px] border border-[#dccfc4] px-4 py-2 text-[9px] text-[#705c50]">Save project</button></form></Card>)}{projects.length===0?<Card className="p-6 text-center text-[10px] text-[#85766a]">No projects yet.</Card>:null}</div>
    </div>
  </SectionPage></AppShell>;
}
