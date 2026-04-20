import type { ASTNode, ProxifiedFunctionCall, ProxifiedObject } from "magicast";

import { generateCode, parseModule } from "magicast";
import { readFile, writeFile } from "node:fs/promises";

type UpdateFlagConfigSourceOptions = {
  flags: Record<string, unknown>;
  mode: string;
};

export class UnsupportedFlagConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnsupportedFlagConfigError";
  }
}

export const updateFlagConfigSource = (
  source: string,
  options: UpdateFlagConfigSourceOptions,
): string => {
  const mod = parseModule(source);
  const config = getConfigObject(mod.exports["default"]);
  assertStaticConfigShape(config.$ast, ["flag", options.mode]);

  const flagConfig = config.flag;
  if (!isRecord(flagConfig)) {
    throw new UnsupportedFlagConfigError(
      'Feature flag config at "flag" must be a static object literal.',
    );
  }

  const modeConfig = flagConfig[options.mode];
  if (!isRecord(modeConfig)) {
    throw new UnsupportedFlagConfigError(
      `Feature flag config at "flag.${options.mode}" must be a static object literal.`,
    );
  }

  flagConfig[options.mode] = options.flags;

  return generateCode(mod).code;
};

export const updateFlagConfigFile = async (
  filePath: string,
  options: UpdateFlagConfigSourceOptions,
): Promise<void> => {
  try {
    const source = await readFile(filePath, "utf8");
    const updatedSource = updateFlagConfigSource(source, options);
    await writeFile(filePath, updatedSource, "utf8");
  } catch (error) {
    const message = getErrorMessage(error);

    throw new Error(
      `Failed to update feature flag config file "${filePath}": ${message}`,
      {
        cause: error,
      },
    );
  }
};

type ConfigObjectProxy = ProxifiedObject<{
  flag?: Record<string, unknown>;
}>;

type ObjectExpressionNode = Extract<ASTNode, { type: "ObjectExpression" }>;
type ObjectPropertyNode = Extract<ASTNode, { type: "ObjectProperty" }>;
type StaticConfigAccessFailureKind =
  | "missing-property"
  | "non-object-expression";

class StaticConfigAccessError extends Error {
  readonly failureKind: StaticConfigAccessFailureKind;
  readonly key?: string;
  readonly path: string[];

  constructor(
    failureKind: StaticConfigAccessFailureKind,
    path: string[],
    key?: string,
  ) {
    super("Static config access failed.");
    this.name = "StaticConfigAccessError";
    this.failureKind = failureKind;
    this.path = path;
    this.key = key;
  }
}

const getConfigObject = (defaultExport: unknown): ConfigObjectProxy => {
  if (isFunctionCall(defaultExport)) {
    const config = defaultExport.$args[0];
    if (isObjectExpressionProxy(config)) {
      return config;
    }

    throw new UnsupportedFlagConfigError(
      "Feature flag config must export a static object or defineConfig({ ... }).",
    );
  }

  if (isObjectExpressionProxy(defaultExport)) {
    return defaultExport;
  }

  throw new UnsupportedFlagConfigError(
    "Feature flag config must export a static object or defineConfig({ ... }).",
  );
};

const assertStaticConfigShape = (
  objectExpression: ASTNode,
  path: string[],
): void => {
  try {
    const property = getStaticPropertyByPath(objectExpression, path);
    assertStaticObjectExpression(property.value, path);
  } catch (error) {
    if (error instanceof StaticConfigAccessError) {
      throw toUnsupportedFlagConfigError(error);
    }

    throw error;
  }
};

const getStaticProperty = (
  objectExpression: ASTNode,
  key: string,
): ObjectPropertyNode => {
  if (!isObjectExpressionNode(objectExpression)) {
    throw new UnsupportedFlagConfigError(
      "Feature flag config must use a static object literal.",
    );
  }

  const property = objectExpression.properties.find(
    (candidate): candidate is ObjectPropertyNode => {
      if (candidate.type !== "ObjectProperty" || candidate.computed === true) {
        return false;
      }

      return hasStaticPropertyKey(candidate.key, key);
    },
  );

  if (!property) {
    throw new StaticConfigAccessError("missing-property", [key], key);
  }

  return property;
};

const getStaticPropertyByPath = (
  objectExpression: ASTNode,
  path: string[],
): ObjectPropertyNode => {
  let currentNode = assertStaticObjectExpression(objectExpression, []);
  let currentPath: string[] = [];

  for (const key of path) {
    currentPath = [...currentPath, key];

    let property: ObjectPropertyNode;
    try {
      property = getStaticProperty(currentNode, key);
    } catch (error) {
      if (
        error instanceof StaticConfigAccessError &&
        error.failureKind === "missing-property"
      ) {
        throw new StaticConfigAccessError("missing-property", currentPath, key);
      }

      throw error;
    }

    if (currentPath.length === path.length) {
      return property;
    }

    currentNode = assertStaticObjectExpression(property.value, currentPath);
  }

  throw new StaticConfigAccessError("non-object-expression", path);
};

const assertStaticObjectExpression = (
  node: ASTNode,
  path: string[],
): ObjectExpressionNode => {
  if (!isObjectExpressionNode(node)) {
    throw new StaticConfigAccessError("non-object-expression", path);
  }

  return node;
};

const toUnsupportedFlagConfigError = (
  error: StaticConfigAccessError,
): UnsupportedFlagConfigError => {
  const joinedPath = error.path.join(".");

  if (error.failureKind === "missing-property") {
    return new UnsupportedFlagConfigError(
      `Feature flag config key "${error.key}" was not found as a static property at "${joinedPath}".`,
    );
  }

  return new UnsupportedFlagConfigError(
    `Feature flag config at "${joinedPath}" must be a static object literal.`,
  );
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
};

const isFunctionCall = (
  value: unknown,
): value is ProxifiedFunctionCall<[Record<string, unknown>]> => {
  return (
    typeof value === "object" &&
    value !== null &&
    "$type" in value &&
    value.$type === "function-call" &&
    "$args" in value &&
    Array.isArray(value.$args)
  );
};

const isObjectExpressionProxy = (
  value: unknown,
): value is ConfigObjectProxy => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  try {
    return isObjectExpressionNode((value as ConfigObjectProxy).$ast);
  } catch {
    return false;
  }
};

const isObjectExpressionNode = (
  value: ASTNode,
): value is ObjectExpressionNode => {
  return value.type === "ObjectExpression";
};

const hasStaticPropertyKey = (
  keyNode: ObjectPropertyNode["key"],
  key: string,
): boolean => {
  if (keyNode.type === "Identifier") {
    return keyNode.name === key;
  }

  if (keyNode.type === "StringLiteral") {
    return keyNode.value === key;
  }

  return false;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};
