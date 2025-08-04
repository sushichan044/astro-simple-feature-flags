import type { AstroIntegration } from "astro";

import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
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

      "astro:config:done": async ({ config, injectTypes, logger }) => {
        const internalDtsURL = injectTypes({
          content: compileVirtualModuleInternalDts(
            _macroVirtualModuleInternalDts.code,
          ),
          filename: _macroVirtualModuleInternalDts.filename,
        });

        const dtsRootDir = dirname(fileURLToPath(internalDtsURL));
        if (!existsSync(dtsRootDir)) {
          await mkdir(dtsRootDir, { recursive: true });
        }

        const configRes = resolveFlagConfig(config.root, {
          configFileName,
        });

        if (!configRes.success) {
          logger.error(configRes.error.message);
          return;
        }

        const configModulePathFromDts = relative(
          dtsRootDir,
          fileURLToPath(configRes.configModuleId),
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
