import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { updateFlagConfigFile, updateFlagConfigSource } from "./update";

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
    ).toThrow(
      'Feature flag config at "flag.development" must be a static object literal.',
    );
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
    ).toThrow(
      'Feature flag config at "flag.development" must be a static object literal.',
    );
  });

  it("throws when the flag config is not an object literal", () => {
    expect(() =>
      updateFlagConfigSource(
        `
export default defineConfig({
  flag: true,
});
`,
        {
          flags: {
            fooReleased: false,
          },
          mode: "development",
        },
      ),
    ).toThrow('Feature flag config at "flag" must be a static object literal.');
  });

  it("throws when the mode config contains a spread element", () => {
    expect(() =>
      updateFlagConfigSource(
        `
const shared = { fooReleased: true };

export default defineConfig({
  flag: {
    development: { ...shared, rolloutRate: 0.5 },
  },
});
`,
        {
          flags: { fooReleased: false, rolloutRate: 1 },
          mode: "development",
        },
      ),
    ).toThrow(
      'Feature flag config at "flag.development" must be a static object literal.',
    );
  });

  it("throws when the mode config contains an identifier reference as a value", () => {
    expect(() =>
      updateFlagConfigSource(
        `
const rate = 0.5;

export default defineConfig({
  flag: {
    development: { rolloutRate: rate },
  },
});
`,
        {
          flags: { rolloutRate: 1 },
          mode: "development",
        },
      ),
    ).toThrow(
      'Feature flag config at "flag.development" must be a static object literal.',
    );
  });

  it("throws when the mode config contains a computed property key", () => {
    expect(() =>
      updateFlagConfigSource(
        `
const key = "fooReleased";

export default defineConfig({
  flag: {
    development: { [key]: true },
  },
});
`,
        {
          flags: { fooReleased: false },
          mode: "development",
        },
      ),
    ).toThrow(
      'Feature flag config at "flag.development" must be a static object literal.',
    );
  });

  it("throws when the requested mode key is missing", () => {
    expect(() =>
      updateFlagConfigSource(
        `
export default defineConfig({
  flag: {
    production: {},
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
    ).toThrow(
      'Feature flag config key "development" was not found as a static property at "flag.development".',
    );
  });
});

describe("updateFlagConfigFile", () => {
  it("wraps filesystem errors with the file path context", async () => {
    const tempDir = await mkdtemp(
      join(tmpdir(), "astro-simple-feature-flags-"),
    );
    const missingFilePath = join(tempDir, "missing-flags.ts");

    await expect(
      updateFlagConfigFile(missingFilePath, {
        flags: {
          fooReleased: true,
        },
        mode: "development",
      }),
    ).rejects.toThrow(
      `Failed to update feature flag config file "${missingFilePath}"`,
    );

    await rm(tempDir, { force: true, recursive: true });
  });
});
