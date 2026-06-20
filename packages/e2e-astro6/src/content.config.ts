import { defineFeatureFlagCollection } from "astro-simple-feature-flags/content-layer";

export const collections = {
  ...defineFeatureFlagCollection(),
};
