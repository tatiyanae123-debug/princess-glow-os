import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  content: z.string().optional(),
  tags: z.array(z.string().max(50)).optional(),
  pinned: z.boolean().default(false),
});

export const updateNoteSchema = createNoteSchema.partial().extend({
  archived: z.boolean().optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
