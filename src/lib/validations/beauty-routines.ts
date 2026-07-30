import { z } from 'zod';

export const createBeautyRoutineSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  stepOrder: z.number().int().min(0).default(0),
  products: z.array(z.string().max(255)).optional(),
  notes: z.string().max(2000).optional(),
  timeOfDay: z.enum(['morning', 'afternoon', 'evening', 'night', 'anytime']).default('morning'),
});

export const updateBeautyRoutineSchema = createBeautyRoutineSchema.partial().extend({
  archived: z.boolean().optional(),
});

export type CreateBeautyRoutineInput = z.infer<typeof createBeautyRoutineSchema>;
export type UpdateBeautyRoutineInput = z.infer<typeof updateBeautyRoutineSchema>;
