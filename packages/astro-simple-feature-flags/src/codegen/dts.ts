import { normalizeModuleId } from "./module";

export const createDtsImport = (modId: string) => {
  return `import("${normalizeModuleId(modId)}")` as const;
};
