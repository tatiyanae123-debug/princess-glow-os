import { db } from '@/db';
import { appointments } from '@/db/schema/appointments';
import { eq, and, desc } from 'drizzle-orm';
import type { CreateAppointmentInput, UpdateAppointmentInput } from '@/lib/validations/appointments';

export async function getAppointmentsByUser(userId: string) {
  return db
    .select()
    .from(appointments)
    .where(and(eq(appointments.userId, userId), eq(appointments.archived, false)))
    .orderBy(desc(appointments.startAt));
}

export async function getAppointmentById(id: string, userId: string) {
  const [appointment] = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.userId, userId)));
  return appointment ?? null;
}

export async function createAppointment(userId: string, data: CreateAppointmentInput) {
  const [appointment] = await db
    .insert(appointments)
    .values({ ...data, userId })
    .returning();
  return appointment;
}

export async function updateAppointment(id: string, userId: string, data: UpdateAppointmentInput) {
  const [appointment] = await db
    .update(appointments)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
    .returning();
  return appointment ?? null;
}

export async function deleteAppointment(id: string, userId: string) {
  const [appointment] = await db
    .update(appointments)
    .set({ archived: true, updatedAt: new Date() })
    .where(and(eq(appointments.id, id), eq(appointments.userId, userId)))
    .returning();
  return appointment ?? null;
}
