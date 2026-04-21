import { z } from "astro/zod";

import type { AnyZodObject } from "../zod";
import type { EditableFlagValueKind } from "./value";

type DefaultSearchResult = { found: false } | { found: true; value: unknown };

function findDefaultValue(field: z.ZodType): DefaultSearchResult {
  if (field instanceof z.ZodDefault) {
    const result = field.safeParse(undefined);
    return result.success
      ? { found: true, value: result.data }
      : { found: false };
  }
  if (field instanceof z.ZodOptional || field instanceof z.ZodNullable) {
    return findDefaultValue(field.unwrap() as z.ZodType);
  }
  return { found: false };
}

export const extractSchemaDefaults = (
  schema: AnyZodObject,
): Record<string, unknown> => {
  const defaults: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(schema.shape)) {
    const result = findDefaultValue(field as z.ZodType);
    if (result.found) {
      defaults[key] = result.value;
    }
  }
  return defaults;
};

export type FlagEditorSchema =
  | {
      kind: "readonly";
      nullable: false;
    }
  | {
      kind: EditableFlagValueKind;
      nullable: boolean;
    };

export const getFlagEditorSchemaMap = (
  schema: AnyZodObject,
): Record<string, FlagEditorSchema> => {
  return Object.fromEntries(
    Object.entries(schema.shape).map(([key, value]) => [
      key,
      getFlagEditorSchema(value as z.ZodType),
    ]),
  );
};

const getFlagEditorSchema = (input: z.ZodType): FlagEditorSchema => {
  const nullable = input.safeParse(null).success;
  let current: z.ZodType = input;

  while (
    current instanceof z.ZodDefault ||
    current instanceof z.ZodOptional ||
    current instanceof z.ZodNullable
  ) {
    current = current.unwrap() as z.ZodType;
  }

  if (current instanceof z.ZodBoolean) {
    return { kind: "boolean", nullable };
  }

  if (current instanceof z.ZodNumber) {
    return { kind: "number", nullable };
  }

  if (current instanceof z.ZodString) {
    return { kind: "string", nullable };
  }

  if (current instanceof z.ZodLiteral && current.values.has(null)) {
    return { kind: "null", nullable: true };
  }

  return { kind: "readonly", nullable: false };
};
