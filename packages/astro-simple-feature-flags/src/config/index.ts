/**
 * @module featureFlag/config
 */

import type { ViteModeType } from "../vite";
import type { FeatureFlagConfig, FlagSchemaLike } from "./types";

export function defineConfig<
  TFlagSchema extends FlagSchemaLike,
  TViteMode extends ViteModeType,
>(
  config: FeatureFlagConfig<TFlagSchema, TViteMode>,
): FeatureFlagConfig<TFlagSchema, TViteMode> {
  return config;
}
