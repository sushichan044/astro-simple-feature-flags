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
    "src/internal/index.ts",
  ],
  format: "esm",
  nodeProtocol: true,
  treeshake: true,

  // inherit from vite
  fromVite: true,

  // artifact validations
  attw: true,
  publint: true,
  unused: true,
});
