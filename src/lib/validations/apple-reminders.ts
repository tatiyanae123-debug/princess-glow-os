import { z } from 'zod';

export const appleReminderItemSchema = z.object({
  externalId: z.string().min(1).max(300),
  listName: z.string().min(1).max(120).default('Reminders'),
  title: z.string().min(1).max(500),
  notes: z.string().max(2000).optional().nullable(),
  dueAt: z.string().datetime({ offset: true }).optional().nullable(),
  completed: z.boolean().default(false),
  priority: z.enum(['none', 'low', 'medium', 'high']).optional().default('none'),
  flagged: z.boolean().optional().default(false),
  recurrence: z.string().max(300).optional().nullable(),
  locationName: z.string().max(300).optional().nullable(),
  locationTrigger: z.enum(['arrive', 'leave']).optional().nullable(),
  url: z.string().url().max(2000).optional().nullable(),
  snoozeCount: z.number().int().min(0).max(1000).optional().default(0),
});

export const appleReminderImportSchema = z.object({
  reminders: z.array(appleReminderItemSchema).max(500),
});

export type AppleReminderImport = z.infer<typeof appleReminderImportSchema>;
