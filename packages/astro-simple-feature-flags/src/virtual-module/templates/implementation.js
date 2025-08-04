// CAUTION: This file cannot import anything from relative path.

// @ts-check
import { createQueryFeatureFlag } from "astro-simple-feature-flags/internal";
// @ts-expect-error this is a virtual module by Astro
import { getEntry } from "astro:content";

const FEATURE_FLAGS_COLLECTION_NAME = "@@__FEATURE_FLAGS_COLLECTIONS_NAME__@@";

export const queryFeatureFlag = createQueryFeatureFlag({
  collectionName: FEATURE_FLAGS_COLLECTION_NAME,
  getEntry,
});
