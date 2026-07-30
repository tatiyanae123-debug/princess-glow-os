import { z } from 'zod';

export const createImportantLinkSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  url: z.string().url('Invalid URL'),
  category: z.string().max(100).optional(),
  notes: z.string().max(2000).optional(),
  pinned: z.boolean().default(false),
});

export const updateImportantLinkSchema = createImportantLinkSchema.partial().extend({
  archived: z.boolean().optional(),
});

export type CreateImportantLinkInput = z.infer<typeof createImportantLinkSchema>;
export type UpdateImportantLinkInput = z.infer<typeof updateImportantLinkSchema>;
