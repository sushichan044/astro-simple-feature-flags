import type { AstroIntegration } from "astro";

// HACK: `INTEGRATION_STORAGE_KEY` is used to pass the config file name from integration to the content loader.
// This is because Astro does not allow generating content collection definitions from integrations.
export interface FeatureFlagIntegration extends AstroIntegration {
  hooks: AstroIntegration["hooks"] & {
    "astro-simple-feature-flags:private:storage": {
      configFileName: string;
    };
  };
}
