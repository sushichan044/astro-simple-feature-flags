import type { z } from "astro/zod";

import type { AnyZodObject } from "../zod";

export class InvalidToolbarPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidToolbarPayloadError";
  }
}

export const validateToolbarFlagDraft = async (
  schema: AnyZodObject,
  input: unknown,
): Promise<Record<string, unknown>> => {
  if (!isRecord(input)) {
    throw new InvalidToolbarPayloadError(
      "Toolbar flag update payload must be an object.",
    );
  }

  const parseRes = await schema.safeParseAsync(input);
  if (!parseRes.success) {
    throw new InvalidToolbarPayloadError(
      formatZodIssues(parseRes.error.issues),
    );
  }

  return input;
};

const formatZodIssues = (issues: z.core.$ZodIssue[]): string => {
  const message = issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("\n");

  return `Feature flag validation failed.\n${message}`;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
