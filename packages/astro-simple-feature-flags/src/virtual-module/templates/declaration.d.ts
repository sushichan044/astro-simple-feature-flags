/* eslint-disable */
// @ts-nocheck

declare module "@@__VIRTUAL_MODULE_ID__@@" {
  type FeatureFlagConfig = typeof import("@@__CONFIG_MODULE_ID__@@").default;

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
