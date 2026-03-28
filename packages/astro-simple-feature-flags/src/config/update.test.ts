import { describe, expect, it } from "vitest";

import {
  UnsupportedFlagConfigError,
  updateFlagConfigSource,
} from "./update";

describe("updateFlagConfigSource", () => {
  it("updates a boolean flag for the selected mode", () => {
    const result = updateFlagConfigSource(
      `
import { defineConfig } from "astro-simple-feature-flags/config";

export default defineConfig({
  flag: {
    development: {
      fooReleased: true,
    },
    production: {},
  },
});
`,
      {
        key: "fooReleased",
        mode: "development",
        value: false,
      },
    );

    expect(result).toContain("fooReleased: false");
    expect(result).toContain("production: {}");
  });

  it("updates a number flag for the selected mode", () => {
    const result = updateFlagConfigSource(
      `
export default defineConfig({
  flag: {
    development: {
      rolloutRate: 0.5,
    },
  },
});
`,
      {
        key: "rolloutRate",
        mode: "development",
        value: 1,
      },
    );

    expect(result).toContain("rolloutRate: 1");
  });

  it("updates a string flag for the selected mode", () => {
    const result = updateFlagConfigSource(
      `
export default defineConfig({
  flag: {
    development: {
      variant: "control",
    },
  },
});
`,
      {
        key: "variant",
        mode: "development",
        value: "candidate",
      },
    );

    expect(result).toContain('variant: "candidate"');
  });

  it("updates a null flag for the selected mode", () => {
    const result = updateFlagConfigSource(
      `
export default defineConfig({
  flag: {
    development: {
      announcement: null,
    },
  },
});
`,
      {
        key: "announcement",
        mode: "development",
        value: "hello",
      },
    );

    expect(result).toContain('announcement: "hello"');
  });

  it("throws when the target flag is an array", () => {
    expect(() =>
      updateFlagConfigSource(
        `
export default defineConfig({
  flag: {
    development: {
      tags: ["a"],
    },
  },
});
`,
        {
          key: "tags",
          mode: "development",
          value: "b",
        },
      ),
    ).toThrow(UnsupportedFlagConfigError);
  });

  it("throws when the target flag is an object", () => {
    expect(() =>
      updateFlagConfigSource(
        `
export default defineConfig({
  flag: {
    development: {
      nested: { enabled: true },
    },
  },
});
`,
        {
          key: "nested",
          mode: "development",
          value: false,
        },
      ),
    ).toThrow(UnsupportedFlagConfigError);
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
          key: "fooReleased",
          mode: "development",
          value: false,
        },
      ),
    ).toThrow("static object literal");
  });

  it("throws when the target flag uses a computed expression", () => {
    expect(() =>
      updateFlagConfigSource(
        `
export default defineConfig({
  flag: {
    development: {
      rolloutRate: 1 / 2,
    },
  },
});
`,
        {
          key: "rolloutRate",
          mode: "development",
          value: 1,
        },
      ),
    ).toThrow("JSON primitive literal");
  });
});
