# astro-simple-feature-flags

## 2.1.0
### Minor Changes



- [#39](https://github.com/sushichan044/astro-simple-feature-flags/pull/39) [`93f2d01`](https://github.com/sushichan044/astro-simple-feature-flags/commit/93f2d01f4f70f9663f3dcb7a066228caf39f6bbb) Thanks [@sushichan044](https://github.com/sushichan044)! - feat: add devToolBar app to inspect and edit flags in dev mode
  
  The Astro Dev Toolbar now includes an interactive **Flag Console** that lets you view and live-edit feature flag values during development without restarting the dev server or manually editing your config file.
  
  ### What's new
  
  - **View all flags** – The Flag Console shows every flag key, its current value, type, and the active Vite mode (e.g. `development`).
  - **Inline editing** – Primitive flag values (`boolean`, `number`, `string`, `null`) are editable directly in the toolbar and written back to `flags.config.*`.
  - **HMR on save** – Clicking **Update** rewrites the config file and triggers HMR, so updated flag values are reflected immediately without a manual restart.
  
  ### Limitations
  
  - Only static `defineConfig({ flag: { … } })` object literals are editable. Flags defined via variables, spread operators, computed expressions, arrays, or nested objects are shown as read-only.
  - Complex flag values (objects, arrays) are displayed as read-only JSON strings and cannot be edited inline.

## 2.0.1
### Patch Changes



- [`28528cf`](https://github.com/sushichan044/astro-simple-feature-flags/commit/28528cfc036321fca9b48fe5cfa1dbbcad798b49) Thanks [@sushichan044](https://github.com/sushichan044)! - No significant changes

## 2.0.0
### Major Changes



- [#36](https://github.com/sushichan044/astro-simple-feature-flags/pull/36) [`949f836`](https://github.com/sushichan044/astro-simple-feature-flags/commit/949f836b994df981c376776ce946c8793bca09e1) Thanks [@sushichan044](https://github.com/sushichan044)! - feat!: support Astro v6
  
  You must migrate to Astro v6 to use this version of astro-simple-feature-flags. Please refer to the [Astro v6 migration guide](https://docs.astro.build/en/guides/upgrade-to/v6) for more details on how to upgrade your Astro project.

## 1.0.0
### Major Changes



- [#31](https://github.com/sushichan044/astro-simple-feature-flags/pull/31) [`a043c84`](https://github.com/sushichan044/astro-simple-feature-flags/commit/a043c84cfe3ee26ff8f2823e565eaa99e79db73e) Thanks [@sushichan044](https://github.com/sushichan044)! - This package is now considered as stable.
  
  This is the last version that supports Astro v5 and earlier.

### Minor Changes



- [#33](https://github.com/sushichan044/astro-simple-feature-flags/pull/33) [`f694cb0`](https://github.com/sushichan044/astro-simple-feature-flags/commit/f694cb0ff49abd69005ce7263c8e33e605080879) Thanks [@sushichan044](https://github.com/sushichan044)! - feat: throw error if queried non-existent flag



- [#35](https://github.com/sushichan044/astro-simple-feature-flags/pull/35) [`4e5a47f`](https://github.com/sushichan044/astro-simple-feature-flags/commit/4e5a47fc786fbd871f730f690ea7379af5ef9f69) Thanks [@sushichan044](https://github.com/sushichan044)! - feat: add DevToolsBar app to check current flags

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
