/**
 * @module featureFlag/config
 */

import type { FlagSchemaValue, InferFlagValue, ViteModeType } from "./types";

export type UserConfig<
  FLAG_SCHEMA extends FlagSchemaValue = FlagSchemaValue,
  VITE_MODE extends ViteModeType = ViteModeType,
> = {
  /**
   * Feature flag spec to each Vite Mode
   *
   */
  // We expect `VITE_MODE` to be inferred from `viteMode` arg, so we use `NoInfer` to prevent the inference from key of `flag`.
  flag: Record<NoInfer<VITE_MODE>, InferFlagValue<FLAG_SCHEMA>>;
  /**
   * Zod schema of feature flag
   */
  schema: FLAG_SCHEMA;
  /**
   * Vite Mode to be used as environment in feature flag
   */
  viteMode: VITE_MODE[];
};

export function defineConfig<
  FLAG_SCHEMA extends FlagSchemaValue,
  VITE_MODE extends ViteModeType,
>(config: UserConfig<FLAG_SCHEMA, VITE_MODE>) {
  return config;
}
