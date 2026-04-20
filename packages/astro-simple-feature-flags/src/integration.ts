import type { AstroIntegration } from "astro";

import { AstroError } from "astro/errors";
import { relative } from "node:path";
import { fileURLToPath } from "node:url";

import type { FeatureFlagResolveOptions } from "./config/resolve";
import type {
  FlagDataError,
  FlagDataSuccess,
  FlagUpdateRequest,
  FlagUpdateResult,
} from "./toolbar/shared";

import { resolveFlagConfig } from "./config/resolve";
import {
  UnsupportedFlagConfigError,
  updateFlagConfigFile,
} from "./config/update";
import { INTEGRATION_NAME, TOOLBAR_APP_ID } from "./constant";
import { FlagNotFoundError } from "./errors";
import { getFlagEditorSchemaMap } from "./toolbar/schema";
import {
  TOOLBAR_FLAG_DATA_EVENT,
  TOOLBAR_FLAG_REQUEST_EVENT,
  TOOLBAR_FLAG_UPDATE_EVENT,
  TOOLBAR_FLAG_UPDATE_RESULT_EVENT,
} from "./toolbar/shared";
import {
  InvalidToolbarPayloadError,
  validateToolbarFlagDraft,
} from "./toolbar/update";
import { createKeyedTaskQueue } from "./utils/keyed-task-queue";
import { compileVirtualModuleDts } from "./virtual-module";
import { _macroVirtualModuleDts } from "./virtual-module/macro" with {
  type: "macro",
};
import { astroFeatureFlagVirtualModPlugin } from "./virtual-module/vite-plugin-flags-virtual-mod";

export const simpleFeatureFlags = (
  options: Partial<FeatureFlagResolveOptions> = {},
): AstroIntegration => {
  const { configFileName = "flags" } = options;
  const updateQueue = createKeyedTaskQueue();
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
            new URL("./toolbar/App.mjs", import.meta.url),
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
            editors: getFlagEditorSchemaMap(configModule.schema),
            flags: configModule.flag[mode] ?? {},
            mode,
          });
        };

        toolbar.onAppInitialized(TOOLBAR_APP_ID, () => {
          void sendFlagData();
        });

        toolbar.on<undefined>(TOOLBAR_FLAG_REQUEST_EVENT, () => {
          void sendFlagData();
        });

        const configFilePath = fileURLToPath(flagResolution.configModuleId);

        const handleFlagUpdate = async (payload: FlagUpdateRequest) => {
          const { requestId } = payload;
          try {
            if (payload.mode !== server.config.mode) {
              throw new Error(
                `Toolbar updates are only supported for the active Vite mode "${server.config.mode}".`,
              );
            }

            const configModule = await flagResolution.importConfigModule();
            if (!configModule) {
              throw new Error("Failed to load feature flag config.");
            }

            const currentFlags = configModule.flag[payload.mode];
            if (!currentFlags) {
              throw new Error(
                `Feature flags for Vite mode "${payload.mode}" were not found.`,
              );
            }

            const nextFlags = await validateToolbarFlagDraft(
              configModule.schema,
              payload.flags,
            );

            await updateFlagConfigFile(configFilePath, {
              flags: nextFlags,
              mode: payload.mode,
            });
            toolbar.send<FlagUpdateResult>(TOOLBAR_FLAG_UPDATE_RESULT_EVENT, {
              ok: true,
              requestId,
            });
            await sendFlagData();
          } catch (error) {
            if (error instanceof InvalidToolbarPayloadError) {
              const hasFieldErrors = Object.keys(error.fieldErrors).length > 0;
              toolbar.send<FlagUpdateResult>(
                TOOLBAR_FLAG_UPDATE_RESULT_EVENT,
                hasFieldErrors
                  ? { fieldErrors: error.fieldErrors, ok: false, requestId }
                  : { formError: error.message, ok: false, requestId },
              );
              return;
            }

            const formError =
              error instanceof UnsupportedFlagConfigError ||
              error instanceof FlagNotFoundError ||
              error instanceof Error
                ? error.message
                : "Failed to update feature flag config.";

            toolbar.send<FlagUpdateResult>(TOOLBAR_FLAG_UPDATE_RESULT_EVENT, {
              formError,
              ok: false,
              requestId,
            });
          }
        };

        toolbar.on<FlagUpdateRequest>(TOOLBAR_FLAG_UPDATE_EVENT, (payload) => {
          void updateQueue.run(configFilePath, async () =>
            handleFlagUpdate(payload),
          );
        });

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
