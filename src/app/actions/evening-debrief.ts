'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { createNote, getNotesByUser, updateNote } from '@/lib/data/notes';
import { getTasksByUser } from '@/lib/data/tasks';
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

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function upsertTomorrowDraft(userId: string, titles: string[]) {
  const clean = titles.map((title) => String(title).trim()).filter(Boolean).slice(0, 3);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const periodKey = localDateKey(tomorrow);
  const noteTitle = `Tomorrow Top 3 · ${periodKey}`;
  const content = clean.length
    ? clean.map((title, index) => `${index + 1}. ${title}`).join('\n')
    : 'No priority tasks drafted. Protect open space.';
  const notes = await getNotesByUser(userId);
  const existing = notes.find((note) => note.title === noteTitle && note.tags?.includes('tomorrow-top3'));

  if (existing) {
    await updateNote(existing.id, userId, { content, tags: ['tomorrow-top3', periodKey], pinned: false });
  } else {
    await createNote(userId, { title: noteTitle, content, tags: ['tomorrow-top3', periodKey], pinned: false });
  }
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

export async function saveEveningPatternAction(pattern: string): Promise<void> {
  const userId = await requireUser();
  const clean = String(pattern).trim();
  if (!clean) return;
  const notes = await getNotesByUser(userId);
  const existing = notes.find((note) => note.tags?.includes('glow-planning-pattern'));
  if (existing) {
    await updateNote(existing.id, userId, {
      content: clean,
      tags: ['glow-planning-pattern'],
      pinned: false,
    });
  } else {
    await createNote(userId, {
      title: 'Glow Planning Pattern',
      content: clean,
      tags: ['glow-planning-pattern'],
      pinned: false,
    });
  }
  revalidatePath('/briefings/evening');
  revalidatePath('/briefings/morning');
  revalidatePath('/dashboard');
}

export async function saveTomorrowDraftAction(titles: string[]): Promise<void> {
  const userId = await requireUser();
  await upsertTomorrowDraft(userId, titles);
  revalidatePath('/briefings/morning');
  revalidatePath('/briefings/evening');
  revalidatePath('/tomorrow');
  revalidatePath('/dashboard');
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
  revalidatePath('/briefings/morning');
  revalidatePath('/tomorrow');
  revalidatePath('/dashboard');
}

export async function closeEveningAction(): Promise<void> {
  const userId = await requireUser();
  const openTasks = (await getTasksByUser(userId))
    .filter((task) => task.status !== 'done' && task.status !== 'cancelled')
    .sort((a, b) => {
      const rank = { urgent: 0, high: 1, medium: 2, low: 3 } as const;
      const priorityDiff = rank[a.priority] - rank[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return (a.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueDate?.getTime() ?? Number.MAX_SAFE_INTEGER);
    })
    .slice(0, 3)
    .map((task) => task.title);

  await upsertTomorrowDraft(userId, openTasks);
  await generateExpandedBriefingAction('evening');
  revalidatePath('/briefings/evening');
  revalidatePath('/briefings/morning');
  revalidatePath('/tomorrow');
  revalidatePath('/dashboard');
}
