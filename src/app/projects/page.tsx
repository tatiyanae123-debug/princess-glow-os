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
const fieldClass='w-full rounded-lg border border-[#F1E7E3] px-3.5 py-2.5 text-[12px] text-[#2B2420] placeholder:text-[#B5ACA5] focus:border-[#C9727E] focus:outline-none';
function toDateInput(value:Date|null){return value?value.toISOString().slice(0,10):'';}
function daysUntil(value:Date|null){if(!value)return null;return Math.ceil((value.getTime()-Date.now())/86400000);}
function healthFor(project:{status:string;progress:number;deadline:Date|null;nextAction:string|null}){
  const days=daysUntil(project.deadline);
  if(project.status==='completed')return {label:'Complete',tone:'text-[#5A6E52]',detail:'Finished and ready to archive or reference.'};
  if(project.status==='paused')return {label:'Paused',tone:'text-[#9A7A3D]',detail:'Paused intentionally. Resume only when capacity returns.'};
  if(days!==null&&days<0)return {label:'At risk',tone:'text-[#B15A68]',detail:`Deadline passed ${Math.abs(days)} day${Math.abs(days)===1?'':'s'} ago.`};
  if(days!==null&&days<=7&&project.progress<75)return {label:'Watch',tone:'text-[#9A7A3D]',detail:`${days} day${days===1?'':'s'} left with ${100-project.progress}% remaining.`};
  if(!project.nextAction)return {label:'Needs next move',tone:'text-[#9A7A3D]',detail:'Add one concrete next action so this project is resumable.'};
  return {label:'On track',tone:'text-[#5A6E52]',detail:'A next move is defined and no immediate deadline risk is visible.'};
}

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }){
  const session=await auth();if(!session?.user?.id)redirect('/sign-in');
  const [projects, notes, tasks, params] = await Promise.all([
    getProjectsByUser(session.user.id),
    getNotesByUser(session.user.id),
    getTasksByUser(session.user.id),
    searchParams,
  ]);
  const gmailSubject = params.source === 'gmail' && typeof params.subject === 'string' ? params.subject : null;
  const requestedProjectId = typeof params.projectId === 'string' ? params.projectId : null;
  const requestedExists = requestedProjectId ? projects.some((project)=>project.id===requestedProjectId) : false;

  return <AppShell>
    <div className="space-y-6">
      <ProjectsExperience projects={projects} notes={notes} tasks={tasks} />

      {requestedProjectId && !requestedExists ? <Card><div role="status" className="p-4 text-[11px] text-[#8A8078]">That project is no longer available.</div></Card> : null}

      <div id="all-projects" className="grid gap-4 scroll-mt-20 lg:grid-cols-[.68fr_1.32fr]">
        <Card><form action={createProjectAction} className="space-y-3"><div className="flex items-center gap-2"><Lightbulb size={14} className="text-[#C9727E]"/><div><p className="glow-eyebrow">New desk</p><h2 className="glow-display mt-1 text-[20px] text-[#2B2420]">New project</h2></div></div>{gmailSubject?<p className="rounded-[12px] bg-[#FDF8F6] px-3 py-2 text-[11px] leading-4 text-[#8A8078]">Pre-filled from Gmail. Review before creating — nothing is saved until you submit.</p>:null}<input name="title" required defaultValue={gmailSubject??''} placeholder="Project title" className={fieldClass}/><input name="area" placeholder="Area, e.g. Terrain Design" className={fieldClass}/><select name="priority" defaultValue="medium" className={fieldClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select><input name="deadline" type="date" className={fieldClass}/><textarea name="nextAction" rows={4} placeholder="Next action" className={fieldClass}/><button type="submit" className="rounded-full bg-[#2B2420] px-4 py-2.5 text-[12px] font-medium text-white">Create project</button></form></Card>

        <div className="space-y-3">{projects.length===0?<Card><div className="p-6 text-center"><p className="text-[12px] text-[#8A8078]">No projects yet.</p><p className="mt-1 text-[11px] text-[#B5ACA5]">Create your first project desk to start tracking health, progress and next moves.</p></div></Card>:projects.map((project,index)=>{const health=healthFor(project);const milestoneCount=Array.isArray(project.milestones)?project.milestones.length:0;const taskCount=Array.isArray(project.relatedTaskIds)?project.relatedTaskIds.length:0;const activityCount=Array.isArray(project.activity)?project.activity.length:0;const remaining=daysUntil(project.deadline);const selected=project.id===requestedProjectId;return <Card key={project.id} className={`relative overflow-hidden p-0 ${selected?'ring-2 ring-[#F7D1D8] shadow-[0_18px_50px_rgba(163,91,108,.12)]':index===0?'bg-[linear-gradient(145deg,#FBE4E8,#FDF8F6)]':''}`}><form action={updateProjectAction.bind(null,project.id)}><div className="grid gap-4 p-4 md:grid-cols-[1fr_auto]"><div><div className="flex flex-wrap items-center gap-2"><p className="glow-display text-[17px] text-[#2B2420]">{project.title}</p><span className="rounded-full bg-[#FDF3F2] px-2.5 py-1 text-[10px] text-[#8A8078]">{project.status}</span><span className={`text-[10.5px] font-medium ${health.tone}`}>{health.label}</span></div><p className="mt-1 text-[11px] text-[#8A8078]">{project.area}</p>{project.nextAction?<p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-2 text-[11px] text-[#4A4440]">Next: {project.nextAction}<ArrowRight size={9}/></p>:null}<div className="mt-3 flex flex-wrap gap-2 text-[10.5px] text-[#8A8078]"><span>{milestoneCount} milestones</span><span>•</span><span>{taskCount} linked tasks</span><span>•</span><span>{activityCount} activity entries</span>{remaining!==null?<><span>•</span><span className="inline-flex items-center gap-1"><Clock3 size={8}/>{remaining<0?`${Math.abs(remaining)}d overdue`:`${remaining}d left`}</span></>:null}</div></div><div className="text-right"><p className="glow-display text-[25px] text-[#C9727E]">{project.progress}%</p><p className="text-[10px] text-[#B5ACA5]">progress</p></div></div><div className="mx-4 h-1.5 rounded-full bg-[#F4ECE8]"><div className="h-1.5 rounded-full bg-[#C9727E]" style={{width:`${Math.max(0,Math.min(100,project.progress))}%`}}/></div><details open={selected || undefined} className="mt-4 border-t border-[#F1E7E3]"><summary className="cursor-pointer px-4 py-3 text-[11px] font-medium text-[#4A4440]">Open project desk</summary><div className="grid gap-3 px-4 pb-4 sm:grid-cols-3"><label className="text-[10.5px] text-[#8A8078]">Status<select name="status" defaultValue={project.status} className={`mt-1 ${fieldClass}`}><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label><label className="text-[10.5px] text-[#8A8078]">Priority<select name="priority" defaultValue={project.priority} className={`mt-1 ${fieldClass}`}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label><label className="text-[10.5px] text-[#8A8078]">Progress<input name="progress" type="number" min="0" max="100" defaultValue={project.progress} className={`mt-1 ${fieldClass}`}/></label><label className="text-[10.5px] text-[#8A8078]">Deadline<input name="deadline" type="date" defaultValue={toDateInput(project.deadline)} className={`mt-1 ${fieldClass}`}/></label><label className="text-[10.5px] text-[#8A8078] sm:col-span-2">Next action<input name="nextAction" defaultValue={project.nextAction??''} placeholder="What moves this forward?" className={`mt-1 ${fieldClass}`}/></label><label className="text-[10.5px] text-[#8A8078] sm:col-span-3">Notes / research / working context<textarea name="notes" rows={4} defaultValue={project.notes??''} placeholder="Capture decisions, research, references, blockers or file links here." className={`mt-1 ${fieldClass}`}/></label><div className="sm:col-span-3 rounded-[12px] bg-[#FDF8F6] p-3"><p className="text-[10px] uppercase tracking-[.08em] text-[#8A8078]">Health readout</p><p className={`mt-1 text-[12px] font-medium ${health.tone}`}>{health.label}</p><p className="mt-1 text-[11px] leading-4 text-[#8A8078]">{health.detail}</p></div><button type="submit" className="w-fit rounded-full border border-[#F1E7E3] bg-white px-3.5 py-2 text-[11px] text-[#4A4440] hover:bg-[#FDF8F6]">Save project update</button></div></details></form></Card>})}</div>
      </div>
    </div>
  </AppShell>;
}
