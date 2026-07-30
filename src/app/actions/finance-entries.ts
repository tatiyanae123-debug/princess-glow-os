'use server';

import { revalidatePath } from 'next/cache';
import { createFinanceEntrySchema, updateFinanceEntrySchema } from '@/lib/validations/finance-entries';
import * as data from '@/lib/data/finance-entries';

const MOCK_USER_ID = 'placeholder-user-id';

export async function createFinanceEntryAction(formData: unknown) {
  const parsed = createFinanceEntrySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const entry = await data.createFinanceEntry(MOCK_USER_ID, parsed.data);
  revalidatePath('/finance');
  return { data: entry };
}

export async function updateFinanceEntryAction(id: string, formData: unknown) {
  const parsed = updateFinanceEntrySchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };
  const entry = await data.updateFinanceEntry(id, MOCK_USER_ID, parsed.data);
  revalidatePath('/finance');
  return { data: entry };
}

export async function deleteFinanceEntryAction(id: string) {
  const entry = await data.deleteFinanceEntry(id, MOCK_USER_ID);
  revalidatePath('/finance');
  return { data: entry };
}
