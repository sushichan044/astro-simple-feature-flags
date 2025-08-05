/* eslint-disable */
// @ts-nocheck

declare module "@@__VIRTUAL_MODULE_ID__@@" {
  type Module = typeof import("@@__CONFIG_MODULE_ID__@@");

  type ResolvedFlags = GetExport<Module, "default">;

  type FlagSchema = ResolvedFlags["schema"];
  type FlagOutputShape = import("astro/zod").output<FlagSchema>;
  type FlagKey = keyof FlagOutputShape;

  type QueryFlag<TKey extends FlagKey> = TKey extends FlagKey
    ? FlagOutputShape[TKey]
    : never;

  export function queryFeatureFlag<TKey extends FlagKey>(
    flag: TKey,
  ): Promise<QueryFlag<TKey>>;
}
