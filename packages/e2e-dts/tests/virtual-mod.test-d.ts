// CAUTION: Vitest's typecheck mode does not run any setup codes in test files or setup files.
// This means WE MUST run `astro build` or `astro sync` before running this test file.

import type { queryFeatureFlag } from "virtual:astro-simple-feature-flags";
import type {
  FeatureFlagKey,
  FeatureFlagShape,
} from "virtual:astro-simple-feature-flags";

import { describe, expectTypeOf, it } from "vitest";

describe("Generated dts of virtual:astro-simple-feature-flags", () => {
  describe("FeatureFlagShape", () => {
    it("should be the output type of the feature flag schema", () => {
      expectTypeOf<FeatureFlagShape>().toEqualTypeOf<{
        barReleaseRate: number;
        fooReleased: boolean;
      }>();
    });
  });

  describe("FeatureFlagKey", () => {
    it("should be a union of keys from the feature flag schema", () => {
      expectTypeOf<FeatureFlagKey>().toEqualTypeOf<
        "barReleaseRate" | "fooReleased"
      >();
    });
  });

  describe("queryFeatureFlag", () => {
    it("should return a promise of the queried feature flag type", () => {
      expectTypeOf<
        ReturnType<typeof queryFeatureFlag<"barReleaseRate">>
      >().toEqualTypeOf<Promise<number>>();

      expectTypeOf<
        ReturnType<typeof queryFeatureFlag<"fooReleased">>
      >().toEqualTypeOf<Promise<boolean>>();
    });

    it("should return a promise of void for an invalid key", () => {
      expectTypeOf<
        ReturnType<typeof queryFeatureFlag<"invalidKey">>
      >().toEqualTypeOf<Promise<void>>();
    });
  });
});
