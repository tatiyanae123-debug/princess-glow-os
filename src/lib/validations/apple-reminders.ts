import { z } from 'zod';

export const appleReminderItemSchema = z.object({
  externalId: z.string().min(1).max(300),
  listName: z.string().min(1).max(120).default('Reminders'),
  title: z.string().min(1).max(500),
  notes: z.string().max(2000).optional().nullable(),
  dueAt: z.string().datetime({ offset: true }).optional().nullable(),
  completed: z.boolean().default(false),
  // Optional source metadata. Older iPhone Shortcut bridges can omit these;
  // newer bridges may send them without requiring a database migration because
  // the verified source fields are preserved in importAudit JSON.
  locationName: z.string().max(500).optional().nullable(),
  personName: z.string().max(300).optional().nullable(),
  recurrence: z.string().max(300).optional().nullable(),
  notificationStyle: z.string().max(120).optional().nullable(),
  spokenReminder: z.boolean().optional().nullable(),
  smartTiming: z.boolean().optional().nullable(),
  url: z.string().url().max(2000).optional().nullable(),
});

export const appleReminderImportSchema = z.object({
  reminders: z.array(appleReminderItemSchema).max(500),
});

export type AppleReminderImport = z.infer<typeof appleReminderImportSchema>;
