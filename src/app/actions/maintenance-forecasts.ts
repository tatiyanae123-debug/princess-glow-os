'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';
import { db } from '@/db';
import { maintenanceForecasts } from '@/db/schema/adaptive-os';

export async function updateMaintenanceForecastStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('Unauthorized');

  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!id || !['resolved', 'dismissed'].includes(status)) throw new Error('Invalid maintenance update');

  await db
    .update(maintenanceForecasts)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(maintenanceForecasts.id, id), eq(maintenanceForecasts.userId, session.user.id)));

  revalidatePath('/maintenance');
}
