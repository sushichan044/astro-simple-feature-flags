import { z } from "astro/zod";

import type { AnyZodObject } from "../zod";
import type { EditableFlagValueKind } from "./value";

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
