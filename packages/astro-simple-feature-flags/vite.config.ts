/// <reference types="vitest/config" />

import Macros from "unplugin-macros/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    Macros({
      // Specify files imports macros from `codegen-macros` directory, or build will fail
      include: [
        "src/integration.ts",
        "src/virtual-module/vite-plugin-flags-virtual-mod.ts",
      ],
    }),
  ],
  // @ts-expect-error type mismatch!
  test: {
    globals: false,
  },
});
