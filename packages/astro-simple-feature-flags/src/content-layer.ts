import type {
  BaseSchema,
  CollectionConfig,
  defineCollection as defineAstroCollection,
} from "astro/content/config";

import type { FeatureFlagCollectionName } from "./constant";

import { INTEGRATION_NAME } from "./constant";

export const defineFeatureFlagCollection = (
  defineCollection: DefineCollectionFn,
): Record<FeatureFlagCollectionName, CollectionConfig<BaseSchema>> => {
  return {
    // Not using `FEATURE_FLAG_COLLECTION_NAME` to avoid dynamic key construction
    // type checking in return type annotation instead.
    "astro-simple-feature-flags": defineCollection({
      loader: {
        name: INTEGRATION_NAME,
      },
    }),
  };
};

type DefineCollectionFn = typeof defineAstroCollection;
