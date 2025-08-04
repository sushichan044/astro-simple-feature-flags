import type { AstroIntegration } from "astro";

import { AstroError } from "astro/errors";
import { dirname, relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  type FeatureFlagResolveOptions,
  resolveFlagConfig,
} from "./config/resolve";
import { INTEGRATION_NAME } from "./constant";
import {
  compileVirtualModuleDts,
  compileVirtualModuleInternalDts,
} from "./virtual-module";
import {
  _macroVirtualModuleDts,
  _macroVirtualModuleInternalDts,
} from "./virtual-module/macro" with { type: "macro" };
import { astroFeatureFlagVirtualModPlugin } from "./virtual-module/vite-plugin-flags-virtual-mod";

export const simpleFeatureFlags = (
  options: Partial<FeatureFlagResolveOptions> = {},
): AstroIntegration => {
  const { configFileName = "flags" } = options;

  return {
    hooks: {
      "astro-feature-flag:config": {
        configFileName,
      },

      "astro:config:setup": ({ updateConfig }) => {
        updateConfig({
          vite: {
            plugins: [astroFeatureFlagVirtualModPlugin()],
          },
        });
      },

      "astro:config:done": ({ config, injectTypes }) => {
        // generate dts of `virtual:astro-simple-feature-flags` by calling `injectTypes` twice to
        // dynamically construct the dts content with generated dts file URL.

        // 1: Inject `GetExport` type only to get the directory dts files placed.
        const internalDtsURL = injectTypes({
          content: compileVirtualModuleInternalDts(
            _macroVirtualModuleInternalDts.code,
          ),
          filename: _macroVirtualModuleInternalDts.filename,
        });
        const dtsRootDir = dirname(fileURLToPath(internalDtsURL));

        const configRes = resolveFlagConfig(config.root, {
          configFileName,
        });
        if (!configRes.success) {
          throw new AstroError(configRes.error.message);
        }

        // 2: Calculate the path to the config module from the dts root directory.
        const configModulePathFromDts = relative(
          dtsRootDir,
          fileURLToPath(configRes.configModuleId),
        );

        injectTypes({
          // 3: Inject rest virtual module dts, which depends on internal dts URL.
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
