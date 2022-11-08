import { z } from 'zod';

const ROLE = ['PROFCOLL', 'CLIENT', 'ADMIN'] as const;
export const UserSchema = z
  .object({
    email: z
      .string({ required_error: 'email tidak boleh kosong' })
      .email({ message: 'format email tidak valid' }),
    role: z.enum(ROLE).optional(),
    passwordHash: z
      .string({ required_error: 'password tidak boleh kosong' })
      .min(6, { message: 'password minimal 6 karakter' }),
    confirmPassword: z.string().optional(),
  })
  .refine(data => data.passwordHash === data.confirmPassword, {
    message: 'password tidak cocok',
    path: ['confirmPassword'],
  });

export const UserUpdateSchema = z.object({
  id: z
    .string({ required_error: 'id tidak boleh kosong' })
    .uuid({ message: 'tipe data tidak valid' }),
  role: z.enum(ROLE, { invalid_type_error: 'tipe data tidak valid' }),
  isActive: z.boolean({ invalid_type_error: 'tipe data tidak valid' }),
});

export type ActionUpdateUser = z.infer<typeof UserUpdateSchema>;
export type ActionInputUser = z.infer<typeof UserSchema>;
