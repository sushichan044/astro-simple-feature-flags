# @repo/playgrounds-simple-flag

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

## 0.0.5
### Patch Changes

- Updated dependencies [[`c27e6d6`](https://github.com/sushichan044/astro-simple-feature-flags/commit/c27e6d634dad10d0edd17bb762b9b0aa34e4163f)]:
  - astro-simple-feature-flags@0.0.4

## 0.0.4
### Patch Changes

- Updated dependencies [[`bad4ad2`](https://github.com/sushichan044/astro-simple-feature-flags/commit/bad4ad27991ebc5fc19020c64ec4fd0b517b2338)]:
  - astro-simple-feature-flags@0.0.3

## 0.0.3
### Patch Changes

- Updated dependencies [[`777c130`](https://github.com/sushichan044/astro-simple-feature-flags/commit/777c1300049ec46cf15354f2bf607dc3ae709347)]:
  - astro-simple-feature-flags@0.0.2

## 0.0.2
### Patch Changes

- Updated dependencies [[`8a76da9`](https://github.com/sushichan044/astro-simple-feature-flags/commit/8a76da9509528b5835bc86541dcb1ff3e265548e)]:
  - astro-simple-feature-flags@0.0.1
