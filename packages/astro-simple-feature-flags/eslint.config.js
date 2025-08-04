import ts from "@virtual-live-lab/eslint-config/presets/ts";
import topLevel from "eslint-plugin-toplevel";
import { defineConfig } from "eslint/config";

export default defineConfig(ts, {
  plugins: {
    toplevel: topLevel,
  },
  rules: {
    "toplevel/no-toplevel-side-effect": "error",
  },
});
