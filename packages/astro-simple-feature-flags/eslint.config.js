import ts from "@virtual-live-lab/eslint-config/presets/ts";
import topLevel from "eslint-plugin-toplevel";
import { defineConfig } from "eslint/config";

export default defineConfig(ts, {
  ignores: ["**/*.{test,spec}.{js,ts}"],
  plugins: {
    toplevel: topLevel,
  },
  rules: {
    // TODO: maybe writing new plugin is good to analyze intelligently using `sideEffects` field in package.json
    "toplevel/no-toplevel-side-effect": "error",
  },
});
