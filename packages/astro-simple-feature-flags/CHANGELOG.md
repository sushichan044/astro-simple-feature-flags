# astro-simple-feature-flags

## 0.1.1
### Patch Changes



- [#24](https://github.com/sushichan044/astro-simple-feature-flags/pull/24) [`8c90338`](https://github.com/sushichan044/astro-simple-feature-flags/commit/8c9033885ac17051298f35b8fdef393523801ef0) Thanks [@sushichan044](https://github.com/sushichan044)! - refactor(integration): get codegen dir in setup hook

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

## 0.0.4
### Patch Changes



- [#14](https://github.com/sushichan044/astro-simple-feature-flags/pull/14) [`c27e6d6`](https://github.com/sushichan044/astro-simple-feature-flags/commit/c27e6d634dad10d0edd17bb762b9b0aa34e4163f) Thanks [@sushichan044](https://github.com/sushichan044)! - fix: convert module IDs to use correct extensions in .d.ts files

## 0.0.3
### Patch Changes



- [#6](https://github.com/sushichan044/astro-simple-feature-flags/pull/6) [`bad4ad2`](https://github.com/sushichan044/astro-simple-feature-flags/commit/bad4ad27991ebc5fc19020c64ec4fd0b517b2338) Thanks [@sushichan044](https://github.com/sushichan044)! - Refactor types in virtual module

## 0.0.2
### Patch Changes



- [#4](https://github.com/sushichan044/astro-simple-feature-flags/pull/4) [`777c130`](https://github.com/sushichan044/astro-simple-feature-flags/commit/777c1300049ec46cf15354f2bf607dc3ae709347) Thanks [@sushichan044](https://github.com/sushichan044)! - use OIDC trusted publishing

## 0.0.1
### Patch Changes



- [#2](https://github.com/sushichan044/astro-simple-feature-flags/pull/2) [`8a76da9`](https://github.com/sushichan044/astro-simple-feature-flags/commit/8a76da9509528b5835bc86541dcb1ff3e265548e) Thanks [@sushichan044](https://github.com/sushichan044)! - first release
