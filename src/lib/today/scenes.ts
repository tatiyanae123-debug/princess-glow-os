import 'server-only';

import { getTasksByUser } from '@/lib/data/tasks';
import { getLivingDashboardData } from '@/lib/dashboard/living-dashboard';
import type { LivingDashboardData } from '@/lib/dashboard/types';
import { getTodayReview } from '@/lib/intelligence/adaptive-os';
import { dateKeyInTimeZone, normalizeTimeZone } from '@/lib/time/zone';

export type TodaySceneTask = {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date | null;
  completedAt: Date | null;
};

export type TodaySceneReview = {
  energy?: number | null;
  mood?: string | null;
  completedSummary?: string | null;
  movedSummary?: string | null;
  memoryNote?: string | null;
  tomorrowTopThree?: string[] | null;
} | null;

export type TodaySceneData = {
  dashboard: LivingDashboardData;
  tasks: TodaySceneTask[];
  review: TodaySceneReview;
};

export async function getTodaySceneData(userId: string, requestedTimeZone?: string): Promise<TodaySceneData> {
  const timeZone = normalizeTimeZone(requestedTimeZone);
  const dateKey = dateKeyInTimeZone(new Date(), timeZone);
  const [dashboard, tasks, review] = await Promise.all([
    getLivingDashboardData(userId, timeZone),
    getTasksByUser(userId),
    getTodayReview(userId, dateKey).catch(() => null),
  ]);

  return {
    dashboard,
    tasks: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      completedAt: task.completedAt,
    })),
    review,
  };
}
