import { z } from "astro/zod";
import { describe, expect, it } from "vitest";

import { extractSchemaDefaults, getFlagEditorSchemaMap } from "./schema";

describe("getFlagEditorSchemaMap", () => {
  it("marks primitive schemas as editable", () => {
    const schema = z.object({
      boolFlag: z.boolean().optional().default(false),
      nullFlag: z.literal(null),
      numberFlag: z.number().optional(),
      stringFlag: z.string(),
    });

    expect(getFlagEditorSchemaMap(schema)).toEqual({
      boolFlag: { kind: "boolean", nullable: false },
      nullFlag: { kind: "null", nullable: true },
      numberFlag: { kind: "number", nullable: false },
      stringFlag: { kind: "string", nullable: false },
    });
  });

  it("marks nullable primitives as editable and nullable", () => {
    const schema = z.object({
      maybeBool: z.boolean().nullable(),
      maybeNumber: z.number().nullable(),
      maybeString: z.string().nullable(),
    });

    expect(getFlagEditorSchemaMap(schema)).toEqual({
      maybeBool: { kind: "boolean", nullable: true },
      maybeNumber: { kind: "number", nullable: true },
      maybeString: { kind: "string", nullable: true },
    });
  });

  it("marks non-primitive schemas as read-only", () => {
    const schema = z.object({
      arrayFlag: z.array(z.string()),
      objectFlag: z.object({ enabled: z.boolean() }),
    });

    expect(getFlagEditorSchemaMap(schema)).toEqual({
      arrayFlag: { kind: "readonly", nullable: false },
      objectFlag: { kind: "readonly", nullable: false },
    });
  });
});

describe("extractSchemaDefaults", () => {
  it("returns default values for fields that declare them", () => {
    const schema = z.object({
      boolFlag: z.boolean().optional().default(false),
      numberFlag: z.number().default(42),
      stringFlag: z.string(),
    });

    expect(extractSchemaDefaults(schema)).toEqual({
      boolFlag: false,
      numberFlag: 42,
    });
  });

  it("finds defaults nested under nullable wrapper", () => {
    const schema = z.object({
      flag: z.boolean().default(true).nullable(),
    });

    expect(extractSchemaDefaults(schema)).toEqual({ flag: true });
  });

  it("returns empty object when no fields have defaults", () => {
    const schema = z.object({
      optional: z.number().optional(),
      required: z.string(),
    });

    expect(extractSchemaDefaults(schema)).toEqual({});
  });

  it("excludes fields where a transform wraps the default", () => {
    const schema = z.object({
      flag: z
        .string()
        .default("hello")
        .transform((v) => v.toUpperCase()),
    });

    expect(extractSchemaDefaults(schema)).toEqual({});
  });
});
