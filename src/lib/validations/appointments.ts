import { z } from 'zod';

export const createAppointmentSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  provider: z.string().max(255).optional(),
  location: z.string().max(255).optional(),
  startAt: z.coerce.date(),
  endAt: z.coerce.date().optional(),
  type: z
    .enum(['medical', 'dental', 'beauty', 'wellness', 'personal', 'work', 'other'])
    .default('other'),
  notes: z.string().max(2000).optional(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  archived: z.boolean().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;
