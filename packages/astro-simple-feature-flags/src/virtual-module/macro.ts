/**
 *
 * import this module with type: `macro` to inject the virtual module implementation.
 *
 * All files importing this module have to specified in Macros.include in `vite.config.ts`
 *
 * All export from this file should be named with `_macro` prefix.
 */

import { transformSync } from "amaro";
import { readFileSync } from "node:fs";

export const _macroVirtualModuleDts = {
  code: readFileSync(
    new URL("./templates/declaration.d.ts", import.meta.url),
    "utf8",
  ),
  filename: "flags.d.ts",
} as const;

// Write virtual module implementation with typescript, and transform it to javascript in build-time macro.
// We enabled `erasableSyntaxOnly` to disallow syntaxes like `namespace` that cannot be transpiled.
export const _macroVirtualModuleImpl = transformSync(
  readFileSync(
    new URL("./templates/implementation.ts", import.meta.url),
    "utf8",
  ),
).code;
