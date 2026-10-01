import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { CanonicalDomainRoom } from '@/components/glow/canonical-domain-room';
import { getProjectsByUser } from '@/lib/data/user-scope';
import { ArrowRight, CalendarDays, FolderKanban, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

function dateLabel(value: Date | null) {
  return value ? value.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : 'No deadline';
}

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const projects = (await getProjectsByUser(session.user.id)).filter((project) => project.status !== 'archived');

  return (
    <AppShell>
      <CanonicalDomainRoom
        eyebrow="Plan · Projects"
        title="Projects"
        question="Turn goals into living work. These cards project the real projects already stored in Glow, without inventing actions, files, people, or progress."
        climate="work"
        destinations={[
          { label: 'Moving Forward', href: '/living/moving-forward', cue: 'Progress across active work' },
          { label: 'Goals', href: '/goals', cue: 'Direction above the work' },
          { label: 'Brain Dump', href: '/brain/dump', cue: 'Capture a project thought' },
        ]}
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {projects.length ? projects.map((project) => (
            <article key={project.id} className="editorial-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-[13px] bg-[linear-gradient(145deg,#ece7f5,#e5efef)] text-[#80769a]"><FolderKanban size={15}/></span>
                <span className="rounded-full bg-white/55 px-2.5 py-1 text-[6.5px] capitalize text-[#8b7c74]">{project.status.replace('_',' ')}</span>
              </div>
              <h2 className="glow-display mt-4 text-[21px] leading-tight text-[#3f3631]">{project.title}</h2>
              <p className="mt-1 text-[7.5px] text-[#8d8078]">{project.area || 'Unassigned'} · {project.priority} priority</p>
              {project.notes ? <p className="mt-3 line-clamp-3 min-h-[48px] text-[8px] leading-4 text-[#756963]">{project.notes}</p> : <div className="mt-3 min-h-[48px] rounded-[11px] border border-dashed border-[#ddd1c9] p-2.5 text-[7px] italic text-[#9b8d84]">No project notes saved.</div>}
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#ebe6e2]"><span className="block h-full rounded-full bg-[linear-gradient(90deg,#a8bfc8,#c9b8dd)]" style={{ width: Math.max(0,Math.min(100,project.progress)) + '%' }}/></div>
              <div className="mt-2 flex items-center justify-between text-[7px] text-[#93867e]"><span>{project.progress}% complete</span><span className="inline-flex items-center gap-1"><CalendarDays size={9}/>{dateLabel(project.deadline)}</span></div>
              {project.nextAction ? <div className="mt-3 rounded-[11px] bg-white/42 p-3"><p className="text-[6.5px] uppercase tracking-[.12em] text-[#9a8a81]">Next action</p><p className="mt-1 text-[8px] text-[#625650]">{project.nextAction}</p></div> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/tasks" className="inline-flex items-center gap-1 rounded-full bg-[#342e2b] px-3 py-2 text-[7.5px] text-white">Open related tasks <ArrowRight size={9}/></Link>
                <Link href="/brain/dump" className="inline-flex items-center gap-1 rounded-full bg-white/55 px-3 py-2 text-[7.5px] text-[#6e625b]"><Sparkles size={9}/> Capture note</Link>
              </div>
            </article>
          )) : Array.from({length:6},(_,index)=><div key={index} className="min-h-[205px] rounded-[16px] border border-dashed border-[#ddd1c9] bg-white/28 p-4"><p className="glow-eyebrow">Open project slot</p><p className="mt-3 text-[8px] leading-4 text-[#978a82]">No project object is stored here yet.</p></div>)}
        </div>
      </CanonicalDomainRoom>
    </AppShell>
  );
}
