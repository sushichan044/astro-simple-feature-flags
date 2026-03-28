import { generateCode, parseModule } from "magicast";
import { readFile, writeFile } from "node:fs/promises";

type PrimitiveFlagValue = boolean | number | string | null;

type UpdateFlagConfigSourceOptions = {
  key: string;
  mode: string;
  value: PrimitiveFlagValue;
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
  const modeObject = getStaticObjectProperty(
    flagObject.value,
    options.mode,
    `flag.${options.mode}`,
  );
  const targetProperty = getStaticProperty(modeObject.value, options.key);

  assertPrimitiveLiteral(targetProperty.value.type, `flag.${options.mode}.${options.key}`);

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

  modeConfig[options.key] = options.value;

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

type ObjectPropertyLike = {
  computed?: boolean | null;
  key: {
    name?: string | null;
    type: string;
    value?: string | null;
  };
  type: string;
  value: {
    properties?: ObjectPropertyLike[];
    type: string;
  };
};

type ObjectExpressionLike = {
  properties?: ObjectPropertyLike[];
  type: string;
};

type ConfigObjectProxy = Record<string, unknown> & {
  $ast: ObjectExpressionLike;
  flag?: Record<string, unknown>;
};

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
  objectExpression: ObjectExpressionLike,
  key: string,
  path: string,
): ObjectPropertyLike => {
  const property = getStaticProperty(objectExpression, key);
  if (property.value.type !== "ObjectExpression") {
    throw new UnsupportedFlagConfigError(
      `Feature flag config at "${path}" must be a static object literal.`,
    );
  }

  return property;
};

const getStaticProperty = (
  objectExpression: ObjectExpressionLike,
  key: string,
): ObjectPropertyLike => {
  if (objectExpression.type !== "ObjectExpression") {
    throw new UnsupportedFlagConfigError(
      "Feature flag config must use a static object literal.",
    );
  }

  const property = objectExpression.properties?.find((candidate) => {
    if (candidate.type !== "ObjectProperty" || candidate.computed === true) {
      return false;
    }

    if (candidate.key.type === "Identifier") {
      return candidate.key.name === key;
    }

    if (candidate.key.type === "StringLiteral") {
      return candidate.key.value === key;
    }

    return false;
  });

  if (!property) {
    throw new UnsupportedFlagConfigError(
      `Feature flag config key "${key}" was not found as a static property.`,
    );
  }

  return property;
};

const assertPrimitiveLiteral = (nodeType: string, path: string): void => {
  if (
    nodeType === "BooleanLiteral" ||
    nodeType === "NullLiteral" ||
    nodeType === "NumericLiteral" ||
    nodeType === "StringLiteral"
  ) {
    return;
  }

  if (nodeType === "ArrayExpression" || nodeType === "ObjectExpression") {
    throw new UnsupportedFlagConfigError(
      `Feature flag config at "${path}" must be a JSON primitive literal, not an array or object.`,
    );
  }

  throw new UnsupportedFlagConfigError(
    `Feature flag config at "${path}" must be a JSON primitive literal.`,
  );
};

const isFunctionCall = (
  value: unknown,
): value is {
  $args: [Record<string, unknown>];
  $type: "function-call";
} => {
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
    return (value as ConfigObjectProxy).$ast.type === "ObjectExpression";
  } catch {
    return false;
  }
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};
