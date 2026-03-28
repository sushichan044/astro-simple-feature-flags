import { describe, expect, it } from "vitest";

import { UnsupportedFlagConfigError, updateFlagConfigSource } from "./update";

describe("updateFlagConfigSource", () => {
  it("replaces the selected mode object with validated input values", () => {
    const result = updateFlagConfigSource(
      `
import { defineConfig } from "astro-simple-feature-flags/config";

export default defineConfig({
  flag: {
    development: {
      fooReleased: true,
      rolloutRate: 0.5,
      variant: "control",
    },
    production: {},
  },
});
`,
      {
        flags: {
          fooReleased: false,
          rolloutRate: 1,
          variant: "candidate",
        },
        mode: "development",
      },
    );

    expect(result).toContain("development: {");
    expect(result).toContain("fooReleased: false");
    expect(result).toContain("rolloutRate: 1");
    expect(result).toContain('variant: "candidate"');
    expect(result).toContain("production: {}");
  });

  it("preserves readonly keys by rewriting the whole mode object with provided values", () => {
    const result = updateFlagConfigSource(
      `
export default defineConfig({
  flag: {
    development: {
      fooReleased: true,
      nested: { enabled: true },
      tags: ["a"],
    },
  },
});
`,
      {
        flags: {
          fooReleased: false,
          nested: { enabled: true },
          tags: ["a"],
        },
        mode: "development",
      },
    );

    expect(result).toContain("fooReleased: false");
    expect(result).toContain("nested: {");
    expect(result).toContain("enabled: true");
    expect(result).toContain('tags: ["a"]');
  });

  it("supports null in the rewritten mode object", () => {
    const result = updateFlagConfigSource(
      `
export default defineConfig({
  flag: {
    development: {
      announcement: "hello",
    },
  },
});
`,
      {
        flags: {
          announcement: null,
        },
        mode: "development",
      },
    );

    expect(result).toContain("announcement: null");
  });

  it("throws when the mode config is not a static object literal", () => {
    expect(() =>
      updateFlagConfigSource(
        `
const development = {
  fooReleased: true,
};

export default defineConfig({
  flag: {
    development,
  },
});
`,
        {
          flags: {
            fooReleased: false,
          },
          mode: "development",
        },
      ),
    ).toThrow("static object literal");
  });

  it("throws when the existing mode config is not an object literal", () => {
    expect(() =>
      updateFlagConfigSource(
        `
export default defineConfig({
  flag: {
    development: true,
  },
});
`,
        {
          flags: {
            fooReleased: false,
          },
          mode: "development",
        },
      ),
    ).toThrow(UnsupportedFlagConfigError);
  });
});
