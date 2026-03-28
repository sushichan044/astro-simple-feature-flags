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
  const flagObject = getStaticObjectProperty(config.$ast, "flag", "flag");
  getStaticObjectProperty(
    flagObject.value,
    options.mode,
    `flag.${options.mode}`,
  );

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
  const source = await readFile(filePath, "utf8");
  const updatedSource = updateFlagConfigSource(source, options);
  await writeFile(filePath, updatedSource, "utf8");
};

type ConfigObjectProxy = ProxifiedObject<{
  flag?: Record<string, unknown>;
}>;

type ObjectExpressionNode = Extract<ASTNode, { type: "ObjectExpression" }>;
type ObjectPropertyNode = Extract<ASTNode, { type: "ObjectProperty" }>;

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

const getStaticObjectProperty = (
  objectExpression: ASTNode,
  key: string,
  path: string,
): ObjectPropertyNode => {
  const property = getStaticProperty(objectExpression, key);
  if (property.value.type !== "ObjectExpression") {
    throw new UnsupportedFlagConfigError(
      `Feature flag config at "${path}" must be a static object literal.`,
    );
  }

  return property;
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
    throw new UnsupportedFlagConfigError(
      `Feature flag config key "${key}" was not found as a static property.`,
    );
  }

  return property;
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
  return typeof value === "object" && value !== null;
};
