// CAUTION:
// - This file cannot import anything from relative path.
//   - Implement external modules in `astro-simple-feature-flags/internal`, then import them from here.
// - This file will be transpiled to JavaScript as-is, not bundled.
//   - See `packages/astro-simple-feature-flags/src/virtual-module/macro.ts` for more details.

import { createQueryFeatureFlag } from "astro-simple-feature-flags/internal";
import { getEntry } from "astro:content";

const FEATURE_FLAGS_COLLECTION_NAME = "@@__FEATURE_FLAGS_COLLECTIONS_NAME__@@";

export const queryFeatureFlag = createQueryFeatureFlag({
  collectionName: FEATURE_FLAGS_COLLECTION_NAME,
  getEntry,
});
