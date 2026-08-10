'use server';

import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createPersonalRule, deletePersonalRule, setPersonalRuleEnabled } from '@/lib/intelligence/adaptive-rules';

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

export async function createPersonalRuleAction(formData: FormData) {
  const userId = await requireUserId();
  const title = String(formData.get('title') ?? '').trim();
  const ruleType = String(formData.get('ruleType') ?? 'general').trim();
  const conditionText = String(formData.get('conditionText') ?? '').trim();
  const effectText = String(formData.get('effectText') ?? '').trim();
  const rawPriority = Number(formData.get('priority') ?? 50);
  if (!title) return;
  await createPersonalRule(userId, {
    title,
    ruleType: ruleType || 'general',
    priority: Number.isFinite(rawPriority) ? Math.max(1, Math.min(100, Math.round(rawPriority))) : 50,
    conditionText,
    effectText,
  });
  revalidatePath('/rules');
  revalidatePath('/today');
}

export async function setPersonalRuleEnabledAction(ruleId: string, enabled: boolean) {
  const userId = await requireUserId();
  await setPersonalRuleEnabled(userId, ruleId, enabled);
  revalidatePath('/rules');
  revalidatePath('/today');
}

export async function deletePersonalRuleAction(ruleId: string) {
  const userId = await requireUserId();
  await deletePersonalRule(userId, ruleId);
  revalidatePath('/rules');
  revalidatePath('/today');
}
