// @ts-check
import simpleFeatureFlags from "astro-simple-feature-flags";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [simpleFeatureFlags()],
});
