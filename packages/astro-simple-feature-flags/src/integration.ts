import type { AstroIntegration } from "astro";

import { AstroError } from "astro/errors";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";

import type { FeatureFlagResolveOptions } from "./config/resolve";
import type { FlagDataError, FlagDataSuccess } from "./toolbar/shared";

import { resolveFlagConfig } from "./config/resolve";
import { INTEGRATION_NAME, TOOLBAR_APP_ID } from "./constant";
import { TOOLBAR_FLAG_DATA_EVENT } from "./toolbar/shared";
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
  let configRoot: URL;

  return {
    hooks: {
      // HACK: use private hook key to pass the config file name to the content loader.
      "astro-simple-feature-flags:private:storage": {
        configFileName,
      },

      "astro:config:setup": ({
        addDevToolbarApp,
        createCodegenDir,
        updateConfig,
      }) => {
        codeGenDir = createCodegenDir();
        updateConfig({
          vite: {
            plugins: [astroFeatureFlagVirtualModPlugin()],
          },
        });
        addDevToolbarApp({
          entrypoint: fileURLToPath(
            new URL("./toolbar/app.js", import.meta.url),
          ),
          // fa7-solid:flag
          icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path fill="currentColor" d="M160 96c0-17.7-14.3-32-32-32S96 78.3 96 96v448c0 17.7 14.3 32 32 32s32-14.3 32-32V422.4l62.7-18.8c41.9-12.6 87.1-8.7 126.2 10.9c42.7 21.4 92.5 24 137.2 7.2l37.1-13.9c12.5-4.7 20.8-16.6 20.8-30V130.1c0-23-24.2-38-44.8-27.7l-11.8 5.9c-44.9 22.5-97.8 22.5-142.8 0c-36.4-18.2-78.3-21.8-117.2-10.1L160 118.4z"/></svg>',
          id: TOOLBAR_APP_ID,
          name: "Simple Feature Flags",
        });
      },

      "astro:server:setup": ({ server, toolbar }) => {
        const flagResolution = resolveFlagConfig(configRoot, {
          configFileName,
        });
        if (!flagResolution.success) {
          toolbar.onAppInitialized(TOOLBAR_APP_ID, () => {
            toolbar.send<FlagDataError>(TOOLBAR_FLAG_DATA_EVENT, {
              error: flagResolution.error.message,
            });
          });
          return;
        }

        const sendFlagData = async () => {
          const configModule = await flagResolution.importConfigModule();
          if (!configModule) {
            toolbar.send<FlagDataError>(TOOLBAR_FLAG_DATA_EVENT, {
              error: "Failed to load feature flag config.",
            });
            return;
          }

          const mode = server.config.mode;
          const configFile = relative(
            fileURLToPath(configRoot),
            fileURLToPath(flagResolution.configModuleId),
          );

          toolbar.send<FlagDataSuccess>(TOOLBAR_FLAG_DATA_EVENT, {
            configFile,
            flags: configModule.flag[mode] ?? {},
            mode,
          });
        };

        toolbar.onAppInitialized(TOOLBAR_APP_ID, () => {
          void sendFlagData();
        });

        const configFilePath = fileURLToPath(flagResolution.configModuleId);
        server.watcher.on("change", (changedPath) => {
          if (changedPath === configFilePath) {
            void sendFlagData();
          }
        });
      },

      "astro:config:done": ({ config, injectTypes }) => {
        configRoot = config.root;

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
