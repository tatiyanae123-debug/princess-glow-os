import { z } from 'zod';
export const syncCalendarRequestSchema = z.object({ intent: z.literal('sync') });
export const convertCalendarEventSchema = z.object({ eventId: z.string().uuid() });
