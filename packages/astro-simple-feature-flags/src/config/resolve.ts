import type { FeatureFlagConfig } from "./types";

import { esmResolve, importDefault } from "../utils/import";
import { isNonEmptyString } from "../utils/string";

export type FeatureFlagResolveOptions = {
  /**
   * config file name to be used for feature flags.
   *
   * For example, if you set `configFileName` to `flags`, the config file will be `flags.config.{js,cjs,mjs,ts,cts,mts}`.
   *
   * @default `flags`
   */
  configFileName: string;
};

type FlagResolutionSuccess = {
  configModuleId: string;
  importConfigModule: () => Promise<FeatureFlagConfig | null>;
  success: true;
};

type FlagResolutionFailure = {
  error: Error;
  success: false;
};

export type FlagResolutionResult =
  | FlagResolutionFailure
  | FlagResolutionSuccess;

export const resolveFlagConfig = (
  rootDir: URL,
  config: FeatureFlagResolveOptions,
): FlagResolutionResult => {
  const configModuleIdOrUrl = resolveModulePath(
    rootDir,
    `${config.configFileName}.config`,
  );

  if (!isNonEmptyString(configModuleIdOrUrl)) {
    return {
      error: new Error(
        `Feature flag config file "${config.configFileName}.config" not found.`,
      ),
      success: false,
    } satisfies FlagResolutionFailure;
  }

  return {
    configModuleId: configModuleIdOrUrl,
    importConfigModule: async () => {
      return (
        (await importDefault<FeatureFlagConfig>(configModuleIdOrUrl)) ?? null
      );
    },
    success: true,
  };
};

const resolveModulePath = (
  rootDir: URL,
  configFileName: string,
): string | undefined => {
  // do not specify extension, delegate resolution to esmResolve()
  const configFileURL = new URL(configFileName, rootDir);

  return esmResolve(configFileURL.href);
};
