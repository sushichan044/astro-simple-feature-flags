export type EditableFlagValue = boolean | number | string | null;

export type EditableFlagValueKind = "boolean" | "null" | "number" | "string";

export const isEditableFlagValue = (
  value: unknown,
): value is EditableFlagValue => {
  return (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string" ||
    value === null
  );
};

export const getEditableFlagValueKind = (
  value: EditableFlagValue,
): EditableFlagValueKind => {
  if (value === null) {
    return "null";
  }

  if (typeof value === "boolean") {
    return "boolean";
  }

  if (typeof value === "number") {
    return "number";
  }

  return "string";
};

export const parseEditedFlagValue = (
  kind: EditableFlagValueKind,
  rawValue: string,
): EditableFlagValue => {
  if (kind === "null") {
    return null;
  }

  if (kind === "boolean") {
    if (rawValue === "true") {
      return true;
    }

    if (rawValue === "false") {
      return false;
    }

    throw new Error("Expected boolean input.");
  }

  if (kind === "number") {
    if (rawValue.trim() === "") {
      throw new Error("Expected finite number input.");
    }

    const parsed = Number(rawValue);
    if (!Number.isFinite(parsed)) {
      throw new Error("Expected finite number input.");
    }

    return parsed;
  }

  return rawValue;
};
