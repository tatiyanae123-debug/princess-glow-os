'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createNote } from '@/lib/data/notes';
import { generateExpandedBriefingAction } from '@/app/actions/briefings';
import { updateTaskAction } from '@/app/actions/tasks';

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');
  return session.user.id;
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function saveEveningReflectionAction(formData: FormData): Promise<void> {
  const userId = await requireUser();
  const wentWell = String(formData.get('wentWell') ?? '').trim();
  const feltDifficult = String(formData.get('feltDifficult') ?? '').trim();
  const proudOf = String(formData.get('proudOf') ?? '').trim();
  const doDifferently = String(formData.get('doDifferently') ?? '').trim();
  if (!wentWell && !feltDifficult && !proudOf && !doDifferently) return;

  const content = [
    wentWell ? `What went well:\n${wentWell}` : null,
    feltDifficult ? `What felt difficult:\n${feltDifficult}` : null,
    proudOf ? `What I'm proud of:\n${proudOf}` : null,
    doDifferently ? `What I want to do differently tomorrow:\n${doDifferently}` : null,
  ].filter(Boolean).join('\n\n');

  await createNote(userId, {
    title: `Evening Reflection · ${todayLabel()}`,
    content,
    tags: ['evening-reflection'],
    pinned: false,
  });

  revalidatePath('/briefings/evening');
}

export async function moveTaskToTomorrowAction(formData: FormData): Promise<void> {
  await requireUser();
  const taskId = String(formData.get('taskId') ?? '').trim();
  if (!taskId) return;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(9, 0, 0, 0);
  await updateTaskAction(taskId, { dueDate: tomorrow });
  revalidatePath('/briefings/evening');
  revalidatePath('/tomorrow');
  revalidatePath('/dashboard');
}

export async function closeEveningAction(): Promise<void> {
  await generateExpandedBriefingAction('evening');
  revalidatePath('/briefings/evening');
}
