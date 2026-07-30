import { z } from 'zod';

// Shared Zod schemas — extend in future sessions as forms and server actions are built

export const emailSchema = z.string().email('Please enter a valid email address');

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signUpSchema = signInSchema.extend({
  name: z.string().min(1, 'Name is required').max(100),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
