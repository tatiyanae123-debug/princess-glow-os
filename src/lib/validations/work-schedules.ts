import { z } from 'zod';

export const createWorkScheduleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS'),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Time must be HH:MM or HH:MM:SS'),
  notes: z.string().max(2000).optional(),
});

export const updateWorkScheduleSchema = createWorkScheduleSchema.partial().extend({
  archived: z.boolean().optional(),
});

export type CreateWorkScheduleInput = z.infer<typeof createWorkScheduleSchema>;
export type UpdateWorkScheduleInput = z.infer<typeof updateWorkScheduleSchema>;
