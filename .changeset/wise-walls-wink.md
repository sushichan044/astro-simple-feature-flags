---
"astro-simple-feature-flags": minor
"@repo/e2e": minor
"@repo/playgrounds-simple-flag": minor
---

fix!: remove argument from `defineFeatureFlagCollection()`

Users no longer need to pass an argument to `defineFeatureFlagCollection()`. The function now automatically defines the feature flag collection.

```ts
import { defineFeatureFlagCollection } from "astro-simple-feature-flags/content-layer";

export const collections = {
  ...defineFeatureFlagCollection(),
};
```
