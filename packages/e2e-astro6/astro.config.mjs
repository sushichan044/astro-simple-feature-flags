// @ts-check
import node from "@astrojs/node";
import simpleFeatureFlags from "astro-simple-feature-flags";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  adapter: node({ mode: "standalone" }),
  integrations: [simpleFeatureFlags()],
  output: "server",
});
