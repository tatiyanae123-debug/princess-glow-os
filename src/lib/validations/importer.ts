import { z } from 'zod';

const weekdaySchema = z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']);
const timeOfDaySchema = z.enum(['morning', 'afternoon', 'evening', 'night', 'anytime']);

export const routineImportItemSchema = z.object({
  category: z.literal('routines'),
  key: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  timeOfDay: timeOfDaySchema,
  daysOfWeek: z.array(weekdaySchema).optional(),
});

export const habitImportItemSchema = z.object({
  category: z.literal('habits'),
  key: z.string(),
  name: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  frequency: z.enum(['daily', 'weekdays', 'weekends', 'weekly', 'custom']),
});

export const taskImportItemSchema = z.object({
  category: z.literal('tasks'),
  key: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
});

export const beautyImportItemSchema = z.object({
  category: z.literal('beauty_routines'),
  key: z.string(),
  name: z.string().min(1).max(255),
  timeOfDay: timeOfDaySchema,
  products: z.array(z.string()).optional(),
});

export const calendarImportItemSchema = z.object({
  category: z.literal('calendar_templates'),
  key: z.string(),
  title: z.string().min(1).max(255),
  description: z.string().max(2000).optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().int().min(5).max(480),
  daysOfWeek: z.array(weekdaySchema).min(1),
});

export const importItemSchema = z.discriminatedUnion('category', [
  routineImportItemSchema,
  habitImportItemSchema,
  taskImportItemSchema,
  beautyImportItemSchema,
  calendarImportItemSchema,
]);

export const confirmImportSchema = z.object({
  batchCategory: z.string().min(1).max(100),
  items: z.array(importItemSchema).min(1).max(200),
});

export type ImportItemInput = z.infer<typeof importItemSchema>;
export type ConfirmImportInput = z.infer<typeof confirmImportSchema>;
