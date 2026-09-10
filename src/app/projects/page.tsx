import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { PlanProjectsReferenceV4, type PlanProjectItem } from '@/components/plan/plan-projects-reference-v4';
import { getProjectsByUser } from '@/lib/data/user-scope';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const projects = await getProjectsByUser(session.user.id);
  const items: PlanProjectItem[] = projects.filter((project) => project.status !== 'archived').map((project) => ({
    id: project.id,
    title: project.title,
    area: project.area,
    status: project.status,
    priority: project.priority,
    progress: project.progress,
    deadline: project.deadline?.toISOString() ?? null,
    nextAction: project.nextAction,
    notes: project.notes,
  }));
  return <PlanProjectsReferenceV4 projects={items} />;
}
