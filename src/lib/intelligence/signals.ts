import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { beautyProducts, financeGoals, hairLogs } from '@/db/schema/completion-v1';
import { projects } from '@/db/schema/intelligence-expansion';

export type MaintenanceSignal = {
  id: string;
  domain: string;
  title: string;
  dueAt: Date | null;
  urgency: 'soon' | 'normal' | 'later';
  recommendation: string;
};

export type ProjectHealthSignal = {
  id: string;
  title: string;
  status: 'green' | 'yellow' | 'red';
  reason: string;
  nextAction: string | null;
  deadline: Date | null;
  progress: number;
};

export async function getMaintenanceSignals(userId: string, now = new Date()): Promise<MaintenanceSignal[]> {
  const [products, hair, goals] = await Promise.all([
    db.select().from(beautyProducts).where(and(eq(beautyProducts.userId, userId), eq(beautyProducts.archived, false))),
    db.select().from(hairLogs).where(eq(hairLogs.userId, userId)).orderBy(desc(hairLogs.occurredAt)).limit(8),
    db.select().from(financeGoals).where(eq(financeGoals.userId, userId)),
  ]);

  const signals: MaintenanceSignal[] = [];
  const soon = new Date(now.getTime() + 30 * 86400000);
  const week = new Date(now.getTime() + 7 * 86400000);

  for (const product of products) {
    if (!product.expiresAt) continue;
    if (product.expiresAt <= soon) {
      signals.push({
        id: `beauty-${product.id}`,
        domain: 'Beauty',
        title: `${product.name} ${product.expiresAt < now ? 'may be expired' : 'expires soon'}`,
        dueAt: product.expiresAt,
        urgency: product.expiresAt <= week ? 'soon' : 'normal',
        recommendation: product.repurchase === 'yes' ? 'Add a replacement to your shopping plan before you run out.' : 'Review the product before continuing use.',
      });
    }
  }

  const nextHair = hair.find((log) => Boolean(log.nextAction));
  if (nextHair?.nextAction) {
    signals.push({ id: `hair-${nextHair.id}`, domain: 'Hair', title: nextHair.nextAction, dueAt: null, urgency: 'normal', recommendation: 'Turn the latest hair log into the next maintenance block.' });
  }

  for (const goal of goals) {
    if (!goal.targetDate) continue;
    const days = Math.ceil((goal.targetDate.getTime() - now.getTime()) / 86400000);
    if (days <= 30 && days >= 0 && goal.currentCents < goal.targetCents) {
      signals.push({ id: `finance-${goal.id}`, domain: 'Finance', title: `${goal.name} target is ${days} day${days === 1 ? '' : 's'} away`, dueAt: goal.targetDate, urgency: days <= 7 ? 'soon' : 'normal', recommendation: 'Review the remaining gap and adjust this week before the target becomes urgent.' });
    }
  }

  return signals.sort((a, b) => {
    if (!a.dueAt && !b.dueAt) return 0;
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return a.dueAt.getTime() - b.dueAt.getTime();
  }).slice(0, 8);
}

export async function getProjectHealthSignals(userId: string, now = new Date()): Promise<ProjectHealthSignal[]> {
  const rows = await db.select().from(projects).where(eq(projects.userId, userId)).orderBy(desc(projects.updatedAt));
  return rows.filter((project) => project.status === 'active' || project.status === 'in_progress').map((project) => {
    const inactiveDays = Math.floor((now.getTime() - project.updatedAt.getTime()) / 86400000);
    const deadlineDays = project.deadline ? Math.ceil((project.deadline.getTime() - now.getTime()) / 86400000) : null;
    let status: ProjectHealthSignal['status'] = 'green';
    let reason = 'Moving normally.';
    if (deadlineDays !== null && deadlineDays < 0) { status = 'red'; reason = 'Deadline has passed.'; }
    else if (!project.nextAction) { status = 'yellow'; reason = 'No next action is defined.'; }
    else if (inactiveDays >= 14) { status = 'red'; reason = `No activity for ${inactiveDays} days.`; }
    else if (inactiveDays >= 7) { status = 'yellow'; reason = `No activity for ${inactiveDays} days.`; }
    else if (deadlineDays !== null && deadlineDays <= 7 && project.progress < 80) { status = 'yellow'; reason = `Deadline is ${deadlineDays} days away at ${project.progress}% progress.`; }
    return { id: project.id, title: project.title, status, reason, nextAction: project.nextAction, deadline: project.deadline, progress: project.progress };
  });
}
