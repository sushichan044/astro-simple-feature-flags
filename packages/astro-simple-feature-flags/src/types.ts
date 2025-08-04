import type { AnyZodObject, TypeOf } from "zod";

/**
 * Infer flag spec type from schema.
 */
export type InferFlagValue<T extends FlagSchemaLike> = T extends AnyZodObject
  ? TypeOf<T>
  : never;

/**
 * Acceptable schema type for feature flag
 */
export type FlagSchemaLike = AnyZodObject;
