'use server';

import { auth } from '@/auth';
import { db } from '@/db';
import { aiProposals, intelligentObservations } from '@/db/schema/completion-v1';
import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function proposeObservationAction(observationId: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const rows = await db.select().from(intelligentObservations).where(and(eq(intelligentObservations.id, observationId), eq(intelligentObservations.userId, userId))).limit(1);
  const observation = rows[0];
  if (!observation) return;
  await db.insert(aiProposals).values({
    userId,
    intent: `respond_to_${observation.category}`,
    summary: `Respond to: ${observation.title}`,
    reason: observation.evidence,
    confidence: observation.confidence,
    reversible: true,
    payload: { observationId: observation.id, category: observation.category, source: 'glow_notice' },
  });
  revalidatePath('/observations');
  revalidatePath('/concierge');
}
