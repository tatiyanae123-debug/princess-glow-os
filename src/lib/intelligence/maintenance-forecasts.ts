import 'server-only';

import { and, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { maintenanceForecasts } from '@/db/schema/adaptive-os';
import { beautyProducts, hairLogs } from '@/db/schema/completion-v1';

type MaintenanceProposal = {
  userId: string;
  domain: string;
  title: string;
  dueAt: Date | null;
  urgency: string;
  sourceType: string;
  sourceId: string;
  recommendation: string;
};

const sourceKey = (sourceType: string | null, sourceId: string | null) =>
  sourceType && sourceId ? `${sourceType}:${sourceId}` : null;

export async function refreshMaintenanceForecasts(userId: string, now = new Date()) {
  const [products, hair, active] = await Promise.all([
    db
      .select()
      .from(beautyProducts)
      .where(and(eq(beautyProducts.userId, userId), eq(beautyProducts.archived, false))),
    db
      .select()
      .from(hairLogs)
      .where(eq(hairLogs.userId, userId))
      .orderBy(desc(hairLogs.occurredAt))
      .limit(12),
    db
      .select()
      .from(maintenanceForecasts)
      .where(and(eq(maintenanceForecasts.userId, userId), eq(maintenanceForecasts.status, 'active'))),
  ]);

  const proposals: MaintenanceProposal[] = [];
  const inDays = (date: Date) => Math.ceil((date.getTime() - now.getTime()) / 86400000);

  for (const product of products) {
    if (product.expiresAt) {
      const days = inDays(product.expiresAt);
      if (days <= 45) {
        proposals.push({
          userId,
          domain: 'beauty',
          title:
            days < 0
              ? `${product.name} may be expired`
              : `${product.name} expires ${days === 0 ? 'today' : `in ${days} day${days === 1 ? '' : 's'}`}`,
          dueAt: product.expiresAt,
          urgency: days <= 7 ? 'high' : days <= 21 ? 'soon' : 'normal',
          sourceType: 'beauty_product',
          sourceId: product.id,
          recommendation:
            product.repurchase === 'yes' || product.repurchase === 'repurchase'
              ? 'Review remaining amount and decide whether to repurchase.'
              : 'Review whether to finish, replace, or retire this product.',
        });
      }
    } else if (product.openedAt) {
      const age = Math.floor((now.getTime() - product.openedAt.getTime()) / 86400000);
      if (age >= 150) {
        proposals.push({
          userId,
          domain: 'beauty',
          title: `Review how long ${product.name} has been open`,
          dueAt: null,
          urgency: 'normal',
          sourceType: 'beauty_product',
          sourceId: product.id,
          recommendation: `Opened about ${Math.floor(age / 30)} months ago. Check the package-after-opening guidance and product condition.`,
        });
      }
    }
  }

  const latestHair = hair[0];
  if (latestHair?.nextAction) {
    proposals.push({
      userId,
      domain: 'hair',
      title: `Hair: ${latestHair.nextAction}`,
      dueAt: null,
      urgency: 'normal',
      sourceType: 'hair_log',
      sourceId: latestHair.id,
      recommendation: 'Protect enough time in Calendar and keep the needed products ready.',
    });
  }

  const existingBySource = new Map<string, (typeof active)[number]>();
  const duplicateIds: string[] = [];
  for (const item of active) {
    const key = sourceKey(item.sourceType, item.sourceId);
    if (!key) continue;
    if (existingBySource.has(key)) duplicateIds.push(item.id);
    else existingBySource.set(key, item);
  }

  const desiredKeys = new Set<string>();
  for (const proposal of proposals) {
    const key = sourceKey(proposal.sourceType, proposal.sourceId)!;
    desiredKeys.add(key);
    const existing = existingBySource.get(key);

    if (existing) {
      await db
        .update(maintenanceForecasts)
        .set({
          domain: proposal.domain,
          title: proposal.title,
          dueAt: proposal.dueAt,
          urgency: proposal.urgency,
          recommendation: proposal.recommendation,
          updatedAt: now,
        })
        .where(and(eq(maintenanceForecasts.id, existing.id), eq(maintenanceForecasts.userId, userId)));
    } else {
      await db.insert(maintenanceForecasts).values(proposal);
    }
  }

  for (const item of active) {
    const key = sourceKey(item.sourceType, item.sourceId);
    const generated = item.sourceType === 'beauty_product' || item.sourceType === 'hair_log';
    if (generated && (!key || !desiredKeys.has(key) || duplicateIds.includes(item.id))) {
      await db
        .update(maintenanceForecasts)
        .set({ status: 'resolved', updatedAt: now })
        .where(and(eq(maintenanceForecasts.id, item.id), eq(maintenanceForecasts.userId, userId)));
    }
  }

  return db
    .select()
    .from(maintenanceForecasts)
    .where(and(eq(maintenanceForecasts.userId, userId), eq(maintenanceForecasts.status, 'active')));
}
