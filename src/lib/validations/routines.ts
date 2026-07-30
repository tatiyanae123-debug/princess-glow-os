import { z } from 'zod';

export const createRoutineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(2000).optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night', 'anytime']).default('morning'),
  daysOfWeek: z.array(z.string()).optional(),
});

export const updateRoutineSchema = createRoutineSchema.partial().extend({
  archived: z.boolean().optional(),
});

export const createRoutineStepSchema = z.object({
  routineId: z.string().min(1),
  title: z.string().min(1, 'Title is required').max(255),
  notes: z.string().max(2000).optional(),
  order: z.number().int().min(0).default(0),
  durationMinutes: z.number().int().min(1).max(480).optional(),
});

export const updateRoutineStepSchema = createRoutineStepSchema.partial();

export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;
export type UpdateRoutineInput = z.infer<typeof updateRoutineSchema>;
export type CreateRoutineStepInput = z.infer<typeof createRoutineStepSchema>;
export type UpdateRoutineStepInput = z.infer<typeof updateRoutineStepSchema>;
