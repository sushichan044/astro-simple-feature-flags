import { z } from "astro/zod";

export type AnyZodObject = z.ZodObject<z.ZodRawShape>;

export function isZodObjectSchema(input: unknown): input is AnyZodObject {
  return input instanceof z.ZodObject;
}
