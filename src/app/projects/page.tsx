import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { Card } from '@/components/ui/card';
import { ProjectsExperience } from '@/components/projects/projects-experience';
import { createProjectAction, updateProjectAction } from '@/app/actions/intelligence-expansion';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { getNotesByUser } from '@/lib/data/notes';
import { getTasksByUser } from '@/lib/data/tasks';
import { Lightbulb, ArrowRight, Clock3 } from 'lucide-react';

export const dynamic='force-dynamic';
const fieldClass='w-full border px-3 py-2.5 text-[9px]';
function toDateInput(value:Date|null){return value?value.toISOString().slice(0,10):'';}
function daysUntil(value:Date|null){if(!value)return null;return Math.ceil((value.getTime()-Date.now())/86400000);}
function healthFor(project:{status:string;progress:number;deadline:Date|null;nextAction:string|null}){
  const days=daysUntil(project.deadline);
  if(project.status==='completed')return {label:'Complete',tone:'text-[#60735d]',detail:'Finished and ready to archive or reference.'};
  if(project.status==='paused')return {label:'Paused',tone:'text-[#8b745f]',detail:'Paused intentionally. Resume only when capacity returns.'};
  if(days!==null&&days<0)return {label:'At risk',tone:'text-[#9d5f59]',detail:`Deadline passed ${Math.abs(days)} day${Math.abs(days)===1?'':'s'} ago.`};
  if(days!==null&&days<=7&&project.progress<75)return {label:'Watch',tone:'text-[#9a7551]',detail:`${days} day${days===1?'':'s'} left with ${100-project.progress}% remaining.`};
  if(!project.nextAction)return {label:'Needs next move',tone:'text-[#9a7551]',detail:'Add one concrete next action so this project is resumable.'};
  return {label:'On track',tone:'text-[#60735d]',detail:'A next move is defined and no immediate deadline risk is visible.'};
}

export default async function ProjectsPage(){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [projects, notes, tasks] = await Promise.all([
    getProjectsByUser(session.user.id),
    getNotesByUser(session.user.id),
    getTasksByUser(session.user.id),
  ]);

  return <AppShell>
    <div className="space-y-6">
      <ProjectsExperience projects={projects} notes={notes} tasks={tasks} />

      <div id="all-projects" className="grid gap-5 scroll-mt-20 lg:grid-cols-[.68fr_1.32fr]">
        <Card className="paper-card"><form action={createProjectAction} className="space-y-3"><div className="flex items-center gap-2"><Lightbulb size={14} className="text-[#9a785e]"/><div><p className="glow-eyebrow">New desk</p><h2 className="glow-display mt-1 text-[20px] text-[#493c32]">New project</h2></div></div><input name="title" required placeholder="Project title" className={fieldClass}/><input name="area" placeholder="Area, e.g. Terrain Design" className={fieldClass}/><select name="priority" defaultValue="medium" className={fieldClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select><input name="deadline" type="date" className={fieldClass}/><textarea name="nextAction" rows={4} placeholder="Next action" className={fieldClass}/><button type="submit" className="rounded-[6px] bg-[#40352e] px-4 py-2 text-[9px] text-white">Create project</button></form></Card>

        <div className="space-y-3">{projects.length===0?<Card><div className="p-6 text-center"><p className="text-[9px] text-[#85766a]">No projects yet.</p><p className="mt-1 text-[8px] text-[#9a897c]">Create your first project desk to start tracking health, progress and next moves.</p></div></Card>:projects.map((project,index)=>{const health=healthFor(project);const milestoneCount=Array.isArray(project.milestones)?project.milestones.length:0;const taskCount=Array.isArray(project.relatedTaskIds)?project.relatedTaskIds.length:0;const activityCount=Array.isArray(project.activity)?project.activity.length:0;const remaining=daysUntil(project.deadline);return <Card key={project.id} className={`relative overflow-hidden p-0 ${index===0?'bg-[linear-gradient(145deg,#f7eee7,#efe3d6)]':''}`}><form action={updateProjectAction.bind(null,project.id)}><div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><p className="glow-display text-[17px] text-[#4a3d33]">{project.title}</p><span className="rounded-full bg-[#eee4d8] px-2 py-1 text-[7px] text-[#7d6755]">{project.status}</span><span className={`text-[7px] font-medium ${health.tone}`}>{health.label}</span></div><p className="mt-1 text-[8px] text-[#8d796a]">{project.area}</p>{project.nextAction?<p className="mt-3 inline-flex items-center gap-1 rounded-[6px] bg-[#f3e7dc] px-3 py-2 text-[8px] text-[#755b4d]">Next: {project.nextAction}<ArrowRight size={9}/></p>:null}<div className="mt-3 flex flex-wrap gap-2 text-[7px] text-[#897568]"><span>{milestoneCount} milestones</span><span>•</span><span>{taskCount} linked tasks</span><span>•</span><span>{activityCount} activity entries</span>{remaining!==null?<><span>•</span><span className="inline-flex items-center gap-1"><Clock3 size={8}/>{remaining<0?`${Math.abs(remaining)}d overdue`:`${remaining}d left`}</span></>:null}</div></div><div className="text-right"><p className="glow-display text-[25px] text-[#76604d]">{project.progress}%</p><p className="text-[7px] text-[#998375]">progress</p></div></div><div className="mx-4 h-1.5 rounded-full bg-[#ece2d9]"><div className="h-1.5 rounded-full bg-[#a88d70]" style={{width:`${Math.max(0,Math.min(100,project.progress))}%`}}/></div><details className="mt-4 border-t border-[#e9ddd4]"><summary className="cursor-pointer px-4 py-3 text-[8px] font-medium text-[#7d685c]">Open project desk</summary><div className="grid gap-3 px-4 pb-4 sm:grid-cols-3"><label className="text-[7px] text-[#8c786a]">Status<select name="status" defaultValue={project.status} className={`mt-1 ${fieldClass}`}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label><label className="text-[7px] text-[#8c786a]">Priority<select name="priority" defaultValue={project.priority} className={`mt-1 ${fieldClass}`}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label className="text-[7px] text-[#8c786a]">Progress<input name="progress" type="number" min="0" max="100" defaultValue={project.progress} className={`mt-1 ${fieldClass}`}/></label><label className="text-[7px] text-[#8c786a]">Deadline<input name="deadline" type="date" defaultValue={toDateInput(project.deadline)} className={`mt-1 ${fieldClass}`}/></label><label className="text-[7px] text-[#8c786a] sm:col-span-2">Next action<input name="nextAction" defaultValue={project.nextAction??''} placeholder="What moves this forward?" className={`mt-1 ${fieldClass}`}/></label><label className="text-[7px] text-[#8c786a] sm:col-span-3">Notes / research / working context<textarea name="notes" rows={4} defaultValue={project.notes??''} placeholder="Capture decisions, research, references, blockers or file links here." className={`mt-1 ${fieldClass}`}/></label><div className="sm:col-span-3 rounded-[8px] bg-[#f7f0ea] p-3"><p className="text-[7px] uppercase tracking-[.12em] text-[#8b7566]">Health readout</p><p className={`mt-1 text-[9px] font-medium ${health.tone}`}>{health.label}</p><p className="mt-1 text-[8px] leading-4 text-[#817064]">{health.detail}</p></div><button type="submit" className="w-fit rounded-[6px] border border-[#dccfc4] px-3 py-2 text-[8px] text-[#705c50]">Save project update</button></div></details></form></Card>})}</div>
      </div>
    </div>
  </AppShell>;
}
