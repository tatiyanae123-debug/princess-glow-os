'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { and, eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { db } from '@/db';
import { medications, supplements } from '@/db/schema/health-intelligence';

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? '').trim();
}

function optionalDate(raw: string) {
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function createMedicationAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const name = value(formData, 'name');
  if (!name) return;
  await db.insert(medications).values({
    userId,
    name: name.slice(0, 300),
    dosage: value(formData, 'dosage').slice(0, 120) || null,
    frequency: value(formData, 'frequency').slice(0, 120) || null,
    timeOfDay: value(formData, 'timeOfDay').slice(0, 120) || null,
    instructions: value(formData, 'instructions').slice(0, 1000) || null,
    prescriber: value(formData, 'prescriber').slice(0, 200) || null,
    startedAt: optionalDate(value(formData, 'startedAt')),
    notes: value(formData, 'notes').slice(0, 2000) || null,
  });
  revalidatePath('/wellness');
}

export async function updateMedicationAction(id: string, formData: FormData): Promise<void> {
  const userId = await requireUser();
  const name = value(formData, 'name');
  if (!name) return;
  await db.update(medications).set({
    name: name.slice(0, 300),
    dosage: value(formData, 'dosage').slice(0, 120) || null,
    frequency: value(formData, 'frequency').slice(0, 120) || null,
    timeOfDay: value(formData, 'timeOfDay').slice(0, 120) || null,
    instructions: value(formData, 'instructions').slice(0, 1000) || null,
    prescriber: value(formData, 'prescriber').slice(0, 200) || null,
    startedAt: optionalDate(value(formData, 'startedAt')),
    notes: value(formData, 'notes').slice(0, 2000) || null,
    updatedAt: new Date(),
  }).where(and(eq(medications.id, id), eq(medications.userId, userId)));
  revalidatePath('/wellness');
}

export async function setMedicationActiveAction(id: string, active: boolean): Promise<void> {
  const userId = await requireUser();
  await db.update(medications).set({ active, endedAt: active ? null : new Date(), updatedAt: new Date() }).where(and(eq(medications.id, id), eq(medications.userId, userId)));
  revalidatePath('/wellness');
}

export async function createSupplementAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const name = value(formData, 'name');
  if (!name) return;
  await db.insert(supplements).values({
    userId,
    name: name.slice(0, 300),
    dosage: value(formData, 'dosage').slice(0, 120) || null,
    frequency: value(formData, 'frequency').slice(0, 120) || null,
    timeOfDay: value(formData, 'timeOfDay').slice(0, 120) || null,
    instructions: value(formData, 'instructions').slice(0, 1000) || null,
    startedAt: optionalDate(value(formData, 'startedAt')),
    notes: value(formData, 'notes').slice(0, 2000) || null,
  });
  revalidatePath('/wellness');
}

export async function updateSupplementAction(id: string, formData: FormData): Promise<void> {
  const userId = await requireUser();
  const name = value(formData, 'name');
  if (!name) return;
  await db.update(supplements).set({
    name: name.slice(0, 300),
    dosage: value(formData, 'dosage').slice(0, 120) || null,
    frequency: value(formData, 'frequency').slice(0, 120) || null,
    timeOfDay: value(formData, 'timeOfDay').slice(0, 120) || null,
    instructions: value(formData, 'instructions').slice(0, 1000) || null,
    startedAt: optionalDate(value(formData, 'startedAt')),
    notes: value(formData, 'notes').slice(0, 2000) || null,
    updatedAt: new Date(),
  }).where(and(eq(supplements.id, id), eq(supplements.userId, userId)));
  revalidatePath('/wellness');
}

export async function setSupplementActiveAction(id: string, active: boolean): Promise<void> {
  const userId = await requireUser();
  await db.update(supplements).set({ active, endedAt: active ? null : new Date(), updatedAt: new Date() }).where(and(eq(supplements.id, id), eq(supplements.userId, userId)));
  revalidatePath('/wellness');
}
