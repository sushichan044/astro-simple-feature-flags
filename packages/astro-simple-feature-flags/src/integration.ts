import type { AstroIntegration } from "astro";

import { writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  type FeatureFlagResolveOptions,
  resolveFlagConfig,
} from "./config/resolve";
import { INTEGRATION_NAME } from "./constant";
import { compileVirtualModuleDts } from "./virtual-module";
import {
  _macroVirtualModuleDts,
  _macroVirtualModuleInternalDts,
} from "./virtual-module/macro" with { type: "macro" };
import { astroFeatureFlagVirtualModPlugin } from "./virtual-module/vite-plugin-flags-virtual-mod";

export const simpleFeatureFlags = (
  options: Partial<FeatureFlagResolveOptions> = {},
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
      "astro-feature-flag:config": {
        configFileName,
      },

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

        const configRes = resolveFlagConfig(astroRootDirURL, {
          configFileName,
        });

        if (!configRes.success) {
          logger.error(configRes.error.message);
          return;
        }

        const configModulePathFromDts = relative(
          fileURLToPath(codeGenRootDir),
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
