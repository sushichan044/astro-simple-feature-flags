import { defineConfig } from "tsdown";

export default defineConfig({
  clean: true,
  dts: {
    tsgo: true,
  },
  entry: [
    "src/index.ts",
    "src/config/index.ts",
    "src/content-layer.ts",
    "src/errors.ts",
    "src/internal/index.ts",
    "src/toolbar/app.ts",
  ],
  format: "esm",
  minify: "dce-only",
  nodeProtocol: true,
  treeshake: true,

  external: [
    "astro", // Astro's runtime APIs
    /^astro:/, // Marking Astro's virtual modules as external
    "vite", // Vite's runtime APIs
  ],

  // inherit from vite
  fromVite: true,

  // artifact validations
  attw: true,
  publint: true,
  unused: true,
});
