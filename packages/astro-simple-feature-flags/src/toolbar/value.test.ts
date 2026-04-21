import { describe, expect, it } from "vitest";

import {
  getEditableFlagValueKind,
  isEditableFlagValue,
  parseEditedFlagValue,
} from "./value";

describe("isEditableFlagValue", () => {
  it("returns true for JSON primitives", () => {
    expect(isEditableFlagValue(true)).toBe(true);
    expect(isEditableFlagValue(1)).toBe(true);
    expect(isEditableFlagValue("a")).toBe(true);
    expect(isEditableFlagValue(null)).toBe(true);
  });

  it("returns false for non-primitive values", () => {
    expect(isEditableFlagValue(undefined)).toBe(false);
    expect(isEditableFlagValue(["a"])).toBe(false);
    expect(isEditableFlagValue({ enabled: true })).toBe(false);
  });
});

describe("getEditableFlagValueKind", () => {
  it("returns the primitive kind name", () => {
    expect(getEditableFlagValueKind(true)).toBe("boolean");
    expect(getEditableFlagValueKind(1)).toBe("number");
    expect(getEditableFlagValueKind("a")).toBe("string");
    expect(getEditableFlagValueKind(null)).toBe("null");
  });
});

describe("parseEditedFlagValue", () => {
  it("parses booleans from select values", () => {
    expect(parseEditedFlagValue("boolean", "true")).toBe(true);
    expect(parseEditedFlagValue("boolean", "false")).toBe(false);
  });

  it("parses numbers from text input", () => {
    expect(parseEditedFlagValue("number", "0.5")).toBe(0.5);
    expect(parseEditedFlagValue("number", "1")).toBe(1);
  });

  it("keeps strings exactly as entered", () => {
    expect(parseEditedFlagValue("string", "")).toBe("");
    expect(parseEditedFlagValue("string", " candidate ")).toBe(" candidate ");
  });

  it("returns null for the null kind", () => {
    expect(parseEditedFlagValue("null", "ignored")).toBeNull();
  });

  it("throws for invalid boolean input", () => {
    expect(() => parseEditedFlagValue("boolean", "yes")).toThrow(
      "Expected boolean input",
    );
  });

  it("throws for invalid number input", () => {
    expect(() => parseEditedFlagValue("number", "")).toThrow(
      "Expected finite number input",
    );
    expect(() => parseEditedFlagValue("number", "Infinity")).toThrow(
      "Expected finite number input",
    );
  });
});
