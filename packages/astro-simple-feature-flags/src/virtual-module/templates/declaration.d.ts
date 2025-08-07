/* eslint-disable */
// @ts-nocheck

declare module "@@__VIRTUAL_MODULE_ID__@@" {
  type FeatureFlagConfig = GetExport<
    typeof import("@@__CONFIG_MODULE_ID__@@"),
    "default"
  >;

  type FeatureFlagShape = import("astro/zod").output<
    FeatureFlagConfig["schema"]
  >;

  export type FeatureFlagKey = keyof FeatureFlagShape;

  type QueryFeatureFlag<TKey extends FeatureFlagKey> =
    TKey extends FeatureFlagKey ? FeatureFlagShape[TKey] : never;

  export function queryFeatureFlag<TKey extends FeatureFlagKey>(
    flag: TKey,
  ): Promise<QueryFeatureFlag<TKey>>;
}
