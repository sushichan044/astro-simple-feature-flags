import type { AnyZodObject, TypeOf } from "astro/zod";

import type { ViteModeType } from "../vite";

export type FeatureFlagConfig<
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

/**
 * Acceptable schema type for feature flag
 */
export type FlagSchemaLike = AnyZodObject;

/**
 * Infer flag spec type from schema.
 */
type InferFlagValue<T extends FlagSchemaLike> = T extends AnyZodObject
  ? TypeOf<T>
  : never;
