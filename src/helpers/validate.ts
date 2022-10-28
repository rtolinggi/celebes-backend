import { type ZodSchema, z } from "zod";

export const Validate = async (schema: ZodSchema, body: any) => {
  try {
    await schema.parseAsync(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors.map((msg) => msg.message);
    }
  }
};
