'use server';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createTaskFromEmail } from '@/lib/gmail/create-task';
import { createTaskFromEmailSchema } from '@/lib/validations/gmail-task';

// Called only from an explicit "Create task" button click on a specific
// email in the Gmail inbox widget — never invoked automatically, never
// batched across an inbox. This reads the message fields it's given and
// writes a task; it has no way to modify, archive, label, delete, or
// forward the underlying Gmail message.
export async function createTaskFromEmailAction(formData: unknown) {
  const session = await auth();
  if (!session?.user?.id) redirect('/sign-in');

  const parsed = createTaskFromEmailSchema.safeParse(formData);
  if (!parsed.success) return { error: parsed.error.flatten() };

  const result = await createTaskFromEmail(session.user.id, parsed.data);
  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  return { data: result };
}
