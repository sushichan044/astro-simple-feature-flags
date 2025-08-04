import { featureFlags } from "astro-feature-flags";
// @ts-check
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
  integrations: [featureFlags()],
});
