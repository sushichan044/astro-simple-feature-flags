/* eslint-disable */
// @ts-nocheck

declare module "@@__VIRTUAL_MODULE_ID__@@" {
  type Module = typeof import("@@__RESOLVED_CONFIG_PATH__@@");

  type ResolvedFlags = GetExport<Module, "default">;

  type FlagSchema = ResolvedFlags["schema"];
  type FlagShape = import("astro/zod").infer<FlagSchema>;
  type FlagKey = keyof FlagShape;

  type QueryFlag<TKey extends FlagKey> = TKey extends FlagKey
    ? FlagShape[TKey]
    : never;

  export function queryFeatureFlag<TKey extends FlagKey>(
    flag: TKey,
  ): Promise<QueryFlag<TKey>>;
}
