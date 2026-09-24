import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FolderKanban, Sparkles } from 'lucide-react';
import { auth } from '@/auth';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { getProjectsByUser } from '@/lib/data/user-scope';

export const dynamic = 'force-dynamic';

export default async function CreativeProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const projects = (await getProjectsByUser(session.user.id)).filter((project) => project.status !== 'archived');

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Create · Projects"
        title="Creative Projects"
        question="A making space for the real projects already living in Glow. This is a creative projection of the same canonical project objects, not a second project database."
        climate="create"
        destinations={[
          { label: 'Projects', href: '/projects', cue: 'Canonical project system' },
          { label: 'Brain Dump', href: '/brain/dump', cue: 'Capture raw ideas' },
          { label: 'Create', href: '/create', cue: 'Return to making world' },
        ]}
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {projects.length ? projects.map((project) => (
            <Link key={project.id} href="/projects" className="editorial-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-[11px] bg-[linear-gradient(145deg,#eee8f5,#e6efef)] text-[#81769a]"><FolderKanban size={14}/></span>
                <span className="rounded-full bg-white/55 px-2.5 py-1 text-[6.5px] capitalize text-[#8b7c74]">{project.status}</span>
              </div>
              <h2 className="glow-display mt-4 text-[20px] text-[#3f3631]">{project.title}</h2>
              <p className="mt-1 text-[7.5px] text-[#8d8078]">{project.area || 'Project'} · {project.priority} priority</p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#ebe6e2]"><span className="block h-full rounded-full bg-[linear-gradient(90deg,#a8bfc8,#c9b8dd)]" style={{ width: Math.max(0,Math.min(100,project.progress)) + '%' }}/></div>
              <div className="mt-2 flex items-center justify-between text-[7px] text-[#93867e]"><span>{project.progress}%</span><span>{project.deadline ? project.deadline.toLocaleDateString([], { month:'short', day:'numeric' }) : 'No deadline'}</span></div>
              {project.nextAction ? <p className="mt-3 rounded-[10px] bg-white/42 p-2.5 text-[8px] text-[#625650]"><Sparkles size={9} className="mr-1 inline text-[#8a7fa1]"/>{project.nextAction}</p> : null}
            </Link>
          )) : Array.from({length:6},(_,index)=><div key={index} className="min-h-[170px] rounded-[15px] border border-dashed border-[#ddd1c9] bg-white/28 p-4 text-[8px] italic text-[#9b8d84]">Open creative project slot</div>)}
        </div>
      </CanonicalDomainRoom>
    </AppShell>
  );
}
