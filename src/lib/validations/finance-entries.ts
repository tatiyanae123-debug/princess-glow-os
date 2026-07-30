import { z } from 'zod';

export const createFinanceEntrySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid amount'),
  type: z.enum(['income', 'expense', 'saving', 'investment']),
  category: z
    .enum([
      'salary',
      'food',
      'transport',
      'beauty',
      'health',
      'entertainment',
      'utilities',
      'subscriptions',
      'shopping',
      'savings',
      'investments',
      'other',
    ])
    .default('other'),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  notes: z.string().max(2000).optional(),
});

export const updateFinanceEntrySchema = createFinanceEntrySchema.partial().extend({
  archived: z.boolean().optional(),
});

export type CreateFinanceEntryInput = z.infer<typeof createFinanceEntrySchema>;
export type UpdateFinanceEntryInput = z.infer<typeof updateFinanceEntrySchema>;
