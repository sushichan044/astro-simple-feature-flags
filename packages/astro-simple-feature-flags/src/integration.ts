import type { AstroIntegration } from "astro";

import { AstroError } from "astro/errors";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";

import {
  type FeatureFlagResolveOptions,
  resolveFlagConfig,
} from "./config/resolve";
import { INTEGRATION_NAME } from "./constant";
import { compileVirtualModuleDts } from "./virtual-module";
import { _macroVirtualModuleDts } from "./virtual-module/macro" with {
  type: "macro",
};
import { astroFeatureFlagVirtualModPlugin } from "./virtual-module/vite-plugin-flags-virtual-mod";

export const simpleFeatureFlags = (
  options: Partial<FeatureFlagResolveOptions> = {},
): AstroIntegration => {
  const { configFileName = "flags" } = options;
  let codeGenDir: URL;

  return {
    hooks: {
      // HACK: use private hook key to pass the config file name to the content loader.
      "astro-simple-feature-flags:private:storage": {
        configFileName,
      },

      "astro:config:setup": ({ createCodegenDir, updateConfig }) => {
        codeGenDir = createCodegenDir();
        updateConfig({
          vite: {
            plugins: [astroFeatureFlagVirtualModPlugin()],
          },
        });
      },

      "astro:config:done": ({ config, injectTypes }) => {
        const configRes = resolveFlagConfig(config.root, {
          configFileName,
        });
        if (!configRes.success) {
          throw new AstroError(configRes.error.message);
        }

        const configModulePathFromDts = relative(
          fileURLToPath(codeGenDir),
          fileURLToPath(configRes.configModuleId),
        );

        injectTypes({
          content: compileVirtualModuleDts(_macroVirtualModuleDts.code, {
            configModuleId: configModulePathFromDts,
          }),
          filename: _macroVirtualModuleDts.filename,
        });
      },
    },
    name: INTEGRATION_NAME,
  };
};
