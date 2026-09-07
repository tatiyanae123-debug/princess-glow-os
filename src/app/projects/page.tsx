import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import {
  PlanProjectsV2,
  type PlanProjectMemory,
  type PlanProjectTask,
  type PlanProjectV2,
  type PlanSettingSnapshot,
} from '@/components/plan/plan-reference-v2';
import { getLifeMemoriesByUser, getProjectsByUser } from '@/lib/data/user-scope';
import { getTasksByUser } from '@/lib/data/tasks';
import { getPlanObjectSettingsByPrefix } from '@/lib/plan/object-settings';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const [projectRows, taskRows, memoryRows, settingsMap] = await Promise.all([
    getProjectsByUser(userId),
    getTasksByUser(userId),
    getLifeMemoriesByUser(userId),
    getPlanObjectSettingsByPrefix(userId, 'plan:project:'),
  ]);
  const projects: PlanProjectV2[] = projectRows.filter((project) => project.status !== 'archived').map((project) => ({
    id: project.id,
    title: project.title,
    area: project.area,
    status: project.status,
    priority: project.priority,
    progress: project.progress,
    deadline: project.deadline?.toISOString() ?? null,
    nextAction: project.nextAction,
    notes: project.notes,
    milestones: project.milestones,
    relatedTaskIds: project.relatedTaskIds,
    activity: project.activity,
  }));
  const tasks: PlanProjectTask[] = taskRows.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    dueDate: task.dueDate?.toISOString() ?? null,
    priority: task.priority,
  }));
  const memories: PlanProjectMemory[] = memoryRows.map((memory) => ({
    id: memory.id,
    title: memory.title,
    summary: memory.summary,
    category: memory.category,
    source: memory.source,
    sourceDate: memory.sourceDate?.toISOString() ?? null,
    relatedProjectId: memory.relatedProjectId,
  }));
  const settings: PlanSettingSnapshot = Object.fromEntries(Array.from(settingsMap.entries()).map(([key, row]) => [key, row.preferences]));
  return <PlanProjectsV2 projects={projects} tasks={tasks} memories={memories} settings={settings} />;
}
