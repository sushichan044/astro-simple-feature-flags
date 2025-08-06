const SHOULD_JS_PATTERN = /\.[jt]sx?$/;

/**
 * Transforms module IDs for compatible format in `typeof import()` in d.ts files.
 * @param modId - The module ID to transform.
 * @returns The transformed module ID.
 */
export const transformModuleIdForDts = (modId: string): string => {
  if (modId.endsWith(".d.ts")) {
    return modId.replace(/\.d\.ts$/, ".js");
  }
  if (modId.endsWith(".d.mts")) {
    return modId.replace(/\.d\.mts$/, ".mjs");
  }
  if (modId.endsWith(".d.cts")) {
    return modId.replace(/\.d\.cts$/, ".cjs");
  }

  if (SHOULD_JS_PATTERN.test(modId)) {
    return modId.replace(SHOULD_JS_PATTERN, ".js");
  }
  if (modId.endsWith(".mts")) {
    return modId.replace(/\.mts$/, ".mjs");
  }
  if (modId.endsWith(".cts")) {
    return modId.replace(/\.cts$/, ".cjs");
  }

  return modId;
};
