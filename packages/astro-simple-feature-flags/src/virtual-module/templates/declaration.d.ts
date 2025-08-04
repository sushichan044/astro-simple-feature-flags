/* eslint-disable */
// @ts-nocheck

declare module "@@__VIRTUAL_MODULE_ID__@@" {
  type Module = typeof import("@@__RESOLVED_CONFIG_PATH__@@");

  type ResolvedConfig = import("./internal.js").GetExport<Module, "default">;
  type FlagSchema = ResolvedConfig["schema"];
  type FlagType = import("astro/zod").infer<FlagSchema>;
  type FlagKey = keyof FlagType;

  type QueryFlag<TKey extends FlagKey> = TKey extends FlagKey ? FlagType[TKey] : never;

  export function queryFeatureFlag<TKey extends FlagKey>(flag: TKey): Promise<QueryFlag<TKey>>;
}
