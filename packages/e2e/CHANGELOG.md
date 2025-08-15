# @repo/e2e

## 0.1.1
### Patch Changes

- Updated dependencies [[`8c90338`](https://github.com/sushichan044/astro-simple-feature-flags/commit/8c9033885ac17051298f35b8fdef393523801ef0)]:
  - astro-simple-feature-flags@0.1.1

## 0.1.0
### Minor Changes



- [#17](https://github.com/sushichan044/astro-simple-feature-flags/pull/17) [`5bc0097`](https://github.com/sushichan044/astro-simple-feature-flags/commit/5bc00978e5ee51b1e8959a4580f012649cad66aa) Thanks [@sushichan044](https://github.com/sushichan044)! - fix!: remove argument from `defineFeatureFlagCollection()`
  
  Users no longer need to pass an argument to `defineFeatureFlagCollection()`. The function now automatically defines the feature flag collection.
  
  ```ts
  import { defineFeatureFlagCollection } from "astro-simple-feature-flags/content-layer";
  
  export const collections = {
    ...defineFeatureFlagCollection(),
  };
  ```

### Patch Changes

- Updated dependencies [[`5bc0097`](https://github.com/sushichan044/astro-simple-feature-flags/commit/5bc00978e5ee51b1e8959a4580f012649cad66aa)]:
  - astro-simple-feature-flags@0.1.0

## 0.0.1
### Patch Changes

- Updated dependencies [[`c27e6d6`](https://github.com/sushichan044/astro-simple-feature-flags/commit/c27e6d634dad10d0edd17bb762b9b0aa34e4163f)]:
  - astro-simple-feature-flags@0.0.4
