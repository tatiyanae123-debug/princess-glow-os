import { z } from 'zod';

export const createTaskFromEmailSchema = z.object({
  messageId: z.string().min(1),
  threadId: z.string().min(1),
  subject: z.string().max(255),
  from: z.string().max(255).optional(),
  snippet: z.string().max(2000).optional(),
});

export type CreateTaskFromEmailInput = z.infer<typeof createTaskFromEmailSchema>;
