import { z } from 'zod';

export const createWellnessEntrySchema = z.object({
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  mood: z.enum(['great', 'good', 'okay', 'low', 'rough']).optional(),
  energy: z.enum(['high', 'medium', 'low', 'exhausted']).optional(),
  sleepHours: z.number().min(0).max(24).optional(),
  waterGlasses: z.number().int().min(0).max(30).optional(),
  notes: z.string().max(2000).optional(),
});

export const updateWellnessEntrySchema = createWellnessEntrySchema.partial();

export type CreateWellnessEntryInput = z.infer<typeof createWellnessEntrySchema>;
export type UpdateWellnessEntryInput = z.infer<typeof updateWellnessEntrySchema>;
