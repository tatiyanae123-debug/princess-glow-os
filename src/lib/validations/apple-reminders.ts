import { z } from 'zod';

export const appleReminderItemSchema = z.object({
  externalId: z.string().min(1).max(300),
  listName: z.string().min(1).max(120).default('Reminders'),
  title: z.string().min(1).max(500),
  notes: z.string().max(2000).optional().nullable(),
  dueAt: z.string().datetime({ offset: true }).optional().nullable(),
  completed: z.boolean().default(false),
});

export const appleReminderImportSchema = z.object({
  reminders: z.array(appleReminderItemSchema).max(500),
});

export type AppleReminderImport = z.infer<typeof appleReminderImportSchema>;
