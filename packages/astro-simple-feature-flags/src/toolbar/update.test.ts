import { z } from "astro/zod";
import { describe, expect, it } from "vitest";

import {
  InvalidToolbarPayloadError,
  validateToolbarFlagDraft,
} from "./update";

describe("validateToolbarFlagDraft", () => {
  it("returns the original input object when schema validation succeeds", async () => {
    const schema = z.object({
      fooReleased: z.boolean(),
      variant: z.string().transform((value) => value.length),
    });

    const draft = {
      fooReleased: true,
      variant: "candidate",
    };

    const result = await validateToolbarFlagDraft(schema, draft);

    expect(result).toEqual(draft);
    expect(result["variant"]).toBe("candidate");
  });

  it("throws when schema validation fails", async () => {
    const schema = z.object({
      rolloutRate: z.number().min(0).max(1),
    });

    await expect(async () =>
      validateToolbarFlagDraft(schema, {
        rolloutRate: 2,
      }),
    ).rejects.toThrow(InvalidToolbarPayloadError);
  });

  it("exposes field errors when schema validation fails", async () => {
    const schema = z.object({
      rolloutRate: z.number().min(0).max(1),
      variant: z.string().min(1),
    });

    try {
      await validateToolbarFlagDraft(schema, {
        rolloutRate: 2,
        variant: "",
      });
      throw new Error("Expected validateToolbarFlagDraft to throw.");
    } catch (error) {
      expect(error).toBeInstanceOf(InvalidToolbarPayloadError);

      const validationError = error as InvalidToolbarPayloadError;
      expect(validationError.fieldErrors["rolloutRate"]).toBeTypeOf("string");
      expect(validationError.fieldErrors["variant"]).toBeTypeOf("string");
    }
  });

  it("rejects non-record payloads before schema validation", async () => {
    const schema = z.object({
      fooReleased: z.boolean(),
    });

    await expect(async () =>
      validateToolbarFlagDraft(schema, true),
    ).rejects.toThrow("must be an object");
  });
});
