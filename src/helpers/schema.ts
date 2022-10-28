import { z } from "zod";

export const UserSchema = z
  .object({
    email: z
      .string({ required_error: "email is required" })
      .email({ message: "invalid email address" }),
    passwordHash: z
      .string({ required_error: "password is required" })
      .min(6, { message: "password must be 6 or more characters long " }),
    confirmPassword: z.string().optional(),
  })
  .refine((data) => data.passwordHash === data.confirmPassword, {
    message: "Password not match",
    path: ["confirmPassword"],
  });

export type ActionInputUser = z.infer<typeof UserSchema>;
