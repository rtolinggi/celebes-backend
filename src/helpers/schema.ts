import { z } from 'zod';

export const UserSchema = z
  .object({
    email: z
      .string({ required_error: 'email tidak boleh kosong' })
      .email({ message: 'format email tidak valid' }),
    passwordHash: z
      .string({ required_error: 'password tidak boleh kosong' })
      .min(6, { message: 'password minimal 6 karakter' }),
    confirmPassword: z.string().optional(),
  })
  .refine(data => data.passwordHash === data.confirmPassword, {
    message: 'password tidak cocok',
    path: ['confirmPassword'],
  });

export type ActionInputUser = z.infer<typeof UserSchema>;
