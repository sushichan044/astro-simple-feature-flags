import type { AnyZodObject, TypeOf } from "zod";

/**
 * Acceptable schema type for feature flag
 */
export type FlagSchemaValue = AnyZodObject;

/**
 * Infer flag spec type from schema.
 */
export type InferFlagValue<T extends FlagSchemaValue> = T extends AnyZodObject
  ? TypeOf<T>
  : never;

export type InferFlagKey<T extends FlagSchemaValue> = T extends AnyZodObject
  ? keyof TypeOf<T>
  : never;

/**
 * Vite Mode type. accepts default mode or user-defined mode.
 */
export type ViteModeType = (string & {}) | DefaultViteModeType;

/**
 * Vite Mode type defined in Vite by default
 * @see {@link https://vite.dev/guide/env-and-mode#modes}
 */
type DefaultViteModeType = "development" | "production";

export type EmptyObject = Record<string, never>;
