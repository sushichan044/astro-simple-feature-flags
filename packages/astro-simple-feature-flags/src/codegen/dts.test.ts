import { describe, expect, it } from "vitest";

import { transformModuleIdForDts } from "./dts";

describe("transformModuleIdForDts", () => {
  it("should convert .d.ts to .js", () => {
    expect(transformModuleIdForDts("types.d.ts")).toBe("types.js");
  });

  it("should convert .d.mts to .mjs", () => {
    expect(transformModuleIdForDts("module.d.mts")).toBe("module.mjs");
  });

  it("should convert .d.cts to .cjs", () => {
    expect(transformModuleIdForDts("module.d.cts")).toBe("module.cjs");
  });

  it("should convert .mts to .mjs", () => {
    expect(transformModuleIdForDts("module.mts")).toBe("module.mjs");
  });

  it("should convert .cts to .cjs", () => {
    expect(transformModuleIdForDts("module.cts")).toBe("module.cjs");
  });

  it("should convert .ts to .js", () => {
    expect(transformModuleIdForDts("module.ts")).toBe("module.js");
  });

  it("should convert .tsx to .js", () => {
    expect(transformModuleIdForDts("component.tsx")).toBe("component.js");
  });

  it("should convert .jsx to .js", () => {
    expect(transformModuleIdForDts("component.jsx")).toBe("component.js");
  });

  it("should keep .js as-is", () => {
    expect(transformModuleIdForDts("script.js")).toBe("script.js");
  });

  it("should keep other extensions as-is", () => {
    expect(transformModuleIdForDts("manifest.json")).toBe("manifest.json");
    expect(transformModuleIdForDts("style.css")).toBe("style.css");
    expect(transformModuleIdForDts("image.png")).toBe("image.png");
  });
});
