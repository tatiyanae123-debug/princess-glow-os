'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createFinanceEntrySchema, updateFinanceEntrySchema } from '@/lib/validations/finance-entries';
import * as data from '@/lib/data/finance-entries';

export async function createFinanceEntryAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = createFinanceEntrySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const entry = await data.createFinanceEntry(userId, parsed.data);
  revalidatePath('/finance');
  return { data: entry };
}

export async function updateFinanceEntryAction(id: string, formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const parsed = updateFinanceEntrySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const entry = await data.updateFinanceEntry(id, userId, parsed.data);
  revalidatePath('/finance');
  return { data: entry };
}

export async function deleteFinanceEntryAction(id: string) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  const userId = session.user.id;
  const entry = await data.deleteFinanceEntry(id, userId);
  revalidatePath('/finance');
  return { data: entry };
}
