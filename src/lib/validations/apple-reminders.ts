import { z } from 'zod';

export const appleReminderSchema = z.object({
  id: z.string().min(1).max(500),
  title: z.string().min(1).max(500),
  notes: z.string().max(2000).optional().nullable(),
  list: z.string().max(250).optional().nullable(),
  dueDate: z.string().datetime({ offset: true }).optional().nullable(),
  completed: z.boolean().default(false),
  completedAt: z.string().datetime({ offset: true }).optional().nullable(),
});

export const appleRemindersSyncSchema = z.object({
  reminders: z.array(appleReminderSchema).max(1000),
});

export type AppleReminderInput = z.infer<typeof appleReminderSchema>;
