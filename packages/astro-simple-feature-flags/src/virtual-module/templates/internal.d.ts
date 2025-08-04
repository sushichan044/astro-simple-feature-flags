export type GetExport<
  TMod extends Record<string, unknown>,
  TKey extends string,
> = TMod extends { [K in TKey]: infer E } ? E : never;
