import { stripLastExtension } from "../utils/path";

const ECMA_SCRIPT_LIKE_EXTENSIONS = /\.[cm]?[jt]sx?$/;
const DTS_LIKE_EXTENSIONS = /\.d\.ts$/;

export const normalizeModuleId = (modId: string): string => {
  // return as-is if it's a JSON file
  if (modId.endsWith(".json")) {
    return modId;
  }

  // If the module ID ends with `.d.ts`, we need to replace it with `.js`
  // This case must be executed before `ECMA_SCRIPT_LIKE_EXTENSIONS.test()`
  if (modId.endsWith(".d.ts")) {
    return modId.replace(DTS_LIKE_EXTENSIONS, ".js");
  }

  if (ECMA_SCRIPT_LIKE_EXTENSIONS.test(modId)) {
    return stripLastExtension(modId) + ".js";
  }

  // preserve if not ecma script-like
  return modId;
};
