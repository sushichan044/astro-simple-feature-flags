import type { z } from "astro/zod";

import type { AnyZodObject } from "../zod";
import type { FlagFieldErrors } from "./shared";

export class InvalidToolbarPayloadError extends Error {
  readonly fieldErrors: FlagFieldErrors;

  constructor(message: string, fieldErrors: FlagFieldErrors = {}) {
    super(message);
    this.fieldErrors = fieldErrors;
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
      ...formatZodIssues(parseRes.error.issues),
    );
  }

  return parseRes.data;
};

const formatZodIssues = (
  issues: z.core.$ZodIssue[],
): [message: string, fieldErrors: FlagFieldErrors] => {
  const fieldErrors = Object.fromEntries(
    issues
      .filter((issue) => issue.path.length > 0)
      .map((issue) => [issue.path.join("."), issue.message]),
  );

  const message = issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "(root)";
      return `${path}: ${issue.message}`;
    })
    .join("\n");

  return [`Feature flag validation failed.\n${message}`, fieldErrors];
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
