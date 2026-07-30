import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(2000).optional(),
  category: z
    .enum(['health', 'career', 'finance', 'personal', 'relationships', 'learning', 'travel', 'other'])
    .default('personal'),
  status: z
    .enum(['not_started', 'in_progress', 'achieved', 'paused', 'abandoned'])
    .default('not_started'),
  targetDate: z.coerce.date().optional(),
  progress: z.number().min(0).max(100).default(0),
});

export const updateGoalSchema = createGoalSchema.partial().extend({
  archived: z.boolean().optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
