import { defineFeatureFlagCollection } from "astro-simple-feature-flags/content-layer";
import { defineCollection } from "astro:content";

export const collections = {
  ...defineFeatureFlagCollection(defineCollection),
};
