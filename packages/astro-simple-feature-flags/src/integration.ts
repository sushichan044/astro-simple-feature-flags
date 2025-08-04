import type { AstroIntegration } from "astro";

import { writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { INTEGRATION_NAME } from "./constant";
import { esmResolve } from "./utils/import";
import { isNonEmptyString } from "./utils/string";
import { compileVirtualModuleDts } from "./virtual-module";
import {
  _macroVirtualModuleDts,
  _macroVirtualModuleInternalDts,
} from "./virtual-module/macro" with { type: "macro" };
import { astroFeatureFlagVirtualModPlugin } from "./virtual-module/vite-plugin-flags-virtual-mod";

type FeatureFlagIntegrationOptions = {
  /**
   * config file name to be used for feature flags.
   *
   * For example, if you set `configFileName` to `flags`, the config file will be `flags.config.{js,cjs,mjs,ts,cts,mts}`.
   *
   * @default `flags`
   */
  configFileName: string;
};

export const simpleFeatureFlags = (
  options: Partial<FeatureFlagIntegrationOptions> = {},
): AstroIntegration => {
  const { configFileName = "flags" } = options;

  let astroRootDirURL = pathToFileURL(cwd());
  // get codegen root dir in `astro:config:setup` hook,
  // then use it in `astro:config:done` hook
  // to calculate relative path to the config file without calling `injectTypes()` twice
  let codeGenRootDir = new URL(
    `./.astro/integrations/${INTEGRATION_NAME}`,
    astroRootDirURL,
  );

  return {
    hooks: {
      "astro:config:setup": async ({ createCodegenDir, updateConfig }) => {
        codeGenRootDir = createCodegenDir();

        await writeFile(
          new URL(_macroVirtualModuleInternalDts.filename, codeGenRootDir),
          _macroVirtualModuleInternalDts.code,
          "utf8",
        );

        updateConfig({
          vite: {
            plugins: [astroFeatureFlagVirtualModPlugin()],
          },
        });
      },

      "astro:config:done": ({ config, injectTypes, logger }) => {
        astroRootDirURL = config.root;
        const configModuleId = `${configFileName}.config`;

        const configModIdOrURL = resolveModulePath(
          astroRootDirURL,
          configModuleId,
        );
        if (!isNonEmptyString(configModIdOrURL)) {
          logger.error(
            `Could not resolve config file for ${configModuleId}. Check if the file exists in the root directory.`,
          );
          return;
        }

        const configModulePathFromDts = relative(
          fileURLToPath(codeGenRootDir),
          fileURLToPath(configModIdOrURL),
        );

        injectTypes({
          content: compileVirtualModuleDts(_macroVirtualModuleDts.code, {
            resolvedConfigPath: configModulePathFromDts,
          }),
          filename: _macroVirtualModuleDts.filename,
        });
      },
    },
    name: INTEGRATION_NAME,
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
