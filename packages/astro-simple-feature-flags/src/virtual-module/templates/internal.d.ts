export type GetExport<
  TMod extends Record<string, unknown>,
  TKey extends string,
> = TKey extends keyof TMod ? TMod[TKey] : never;
