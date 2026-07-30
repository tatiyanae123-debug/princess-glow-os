import { z } from 'zod';

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional(),
  frequency: z.enum(['daily', 'weekdays', 'weekends', 'weekly', 'custom']).default('daily'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#f43f5e'),
  icon: z.string().max(50).optional(),
  targetCount: z.number().int().min(1).default(1),
});

export const updateHabitSchema = createHabitSchema.partial().extend({
  archived: z.boolean().optional(),
});

export const createHabitLogSchema = z.object({
  habitId: z.string().min(1),
  loggedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  count: z.number().int().min(1).default(1),
  notes: z.string().max(2000).optional(),
});

export const updateHabitLogSchema = createHabitLogSchema.partial();

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type CreateHabitLogInput = z.infer<typeof createHabitLogSchema>;
export type UpdateHabitLogInput = z.infer<typeof updateHabitLogSchema>;
