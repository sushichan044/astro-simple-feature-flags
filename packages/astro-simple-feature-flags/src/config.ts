/**
 * @module featureFlag/config
 */

import type { AnyZodObject, TypeOf } from "zod";

import type { ViteModeType } from "./vite";

export type UserConfig<
  TFlagSchema extends FlagSchemaLike = FlagSchemaLike,
  TViteMode extends ViteModeType = ViteModeType,
> = {
  /**
   * Feature flag spec to each Vite Mode
   *
   */
  // We expect `VITE_MODE` to be inferred from `viteMode` arg, so we use `NoInfer` to prevent the inference from key of `flag`.
  flag: Record<NoInfer<TViteMode>, InferFlagValue<TFlagSchema>>;
  /**
   * Zod schema of feature flag
   */
  schema: TFlagSchema;
  /**
   * Vite Mode to be used as environment in feature flag
   */
  viteMode: TViteMode[];
};

export function defineConfig<
  TFlagSchema extends FlagSchemaLike,
  TViteMode extends ViteModeType,
>(
  config: UserConfig<TFlagSchema, TViteMode>,
): UserConfig<TFlagSchema, TViteMode> {
  return config;
}

/**
 * Infer flag spec type from schema.
 */
type InferFlagValue<T extends FlagSchemaLike> = T extends AnyZodObject
  ? TypeOf<T>
  : never;

/**
 * Acceptable schema type for feature flag
 */
type FlagSchemaLike = AnyZodObject;
