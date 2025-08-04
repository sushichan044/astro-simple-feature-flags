/**
 * @module astro-simple-feature-flags/virtual-module
 *
 * import this module with type: `macro` to inject the virtual module implementation.
 *
 * All files importing this module have to specified in Macros.include in `vite.config.ts`
 *
 * All export from this file should be named with `_macro` prefix.
 */

import { readFileSync } from "node:fs";

export const _macroVirtualModuleDts = {
  code: readFileSync(
    new URL("./templates/declaration.d.ts", import.meta.url),
    "utf8",
  ),
  filename: "flags.d.ts",
} as const;

export const _macroVirtualModuleImpl = readFileSync(
  new URL("./templates/implementation.js", import.meta.url),
  "utf8",
);

export const _macroVirtualModuleInternalDts = {
  code: readFileSync(
    new URL("./templates/internal.d.ts", import.meta.url),
    "utf8",
  ),
  filename: "internal.d.ts",
} as const;
