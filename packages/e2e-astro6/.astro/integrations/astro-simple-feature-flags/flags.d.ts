/* eslint-disable */
// @ts-nocheck

declare module "virtual:astro-simple-feature-flags" {
  type FeatureFlagConfig = typeof import("../../../flags.config.js").default;

  type FeatureFlagDataShape = import("astro/zod").output<
    FeatureFlagConfig["schema"]
  >;

  export type FeatureFlagKey = keyof FeatureFlagDataShape;

  type QueryFeatureFlag<TKey extends FeatureFlagKey> =
    TKey extends FeatureFlagKey ? FeatureFlagDataShape[TKey] : never;

  export function queryFeatureFlag<TKey extends FeatureFlagKey>(
    flag: TKey,
  ): Promise<QueryFeatureFlag<TKey>>;
}
