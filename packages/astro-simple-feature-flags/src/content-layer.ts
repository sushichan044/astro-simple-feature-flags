import type { BaseSchema, CollectionConfig } from "astro/content/config";
import type { LoaderContext } from "astro/loaders";

import { AstroError } from "astro/errors";
import { z } from "astro/zod";
import { defineCollection } from "astro:content";
import { relative } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { styleText } from "node:util";

import type { FlagResolutionResult } from "./config/resolve";
import type { FeatureFlagCollectionName } from "./constant";
import type { FeatureFlagIntegration } from "./types";

import { bugs as pkgBugs } from "../package.json" with { type: "json" };
import { resolveFlagConfig } from "./config/resolve";
import { INTEGRATION_NAME } from "./constant";
import { isNonEmptyString } from "./utils/string";
import { getViteMode } from "./vite";

export const defineFeatureFlagCollection = (): Record<
  FeatureFlagCollectionName,
  CollectionConfig<BaseSchema>
> => {
  return {
    "astro-simple-feature-flags": defineCollection({
      loader: {
        load: async (c) => {
          // HACK: use private hook key to retrieve the config from integration.
          const integration = c.config.integrations.find(
            (i) => i.name === INTEGRATION_NAME,
          ) as FeatureFlagIntegration | undefined;

          const configFileName =
            integration?.hooks["astro-simple-feature-flags:private:storage"]
              .configFileName;

          if (!isNonEmptyString(configFileName)) {
            throw new AstroError(
              "❌ Feature flag config file name not found. Please ensure the integration is configured correctly.",
              `This might be a bug in the integration. Please report it at ${pkgBugs.url}`,
            );
          }

          const flagResolution = resolveFlagConfig(c.config.root, {
            configFileName,
          });
          if (!flagResolution.success) {
            c.logger.error(flagResolution.error.message);
            return;
          }

          const currentViteMode = getViteMode();

          await doLoadFeatureFlag({
            currentViteMode,
            flagResolution,
            loaderContext: c,
          }).then(() => {
            c.logger.info(
              `✅ Feature flag config loaded successfully for current Vite Mode: ${styleText("yellow", currentViteMode)}`,
            );
          });

          c.watcher?.on("change", (changedPath) => {
            if (changedPath === fileURLToPath(flagResolution.configModuleId)) {
              doLoadFeatureFlag({
                currentViteMode,
                flagResolution,
                loaderContext: c,
              })
                .then(() => {
                  c.logger.info(
                    `🔄 Feature flag config reloaded successfully for current Vite Mode: ${styleText("yellow", currentViteMode)}`,
                  );
                })
                .catch((e) => {
                  throw e;
                });
            }
          });
        },
        name: INTEGRATION_NAME,
      },
    }),
  };
};

type LoadFeatureFlagOptions = {
  currentViteMode: string;
  flagResolution: Extract<FlagResolutionResult, { success: true }>;
  loaderContext: LoaderContext;
};

const doLoadFeatureFlag = async (options: LoadFeatureFlagOptions) => {
  const { currentViteMode, flagResolution, loaderContext: ctx } = options;

  const configModulePathLike = fileURLToPath(flagResolution.configModuleId);

  const cwd = process.cwd();
  const configRelPathFromCwd = relative(cwd, configModulePathLike);
  const configRelPathFromAstroRoot = relative(
    fileURLToPath(ctx.config.root),
    configModulePathLike,
  );

  const configModule = await flagResolution.importConfigModule();
  if (!configModule) {
    throw new AstroError(
      `❌ Failed to load feature flag config file ${configRelPathFromCwd}.`,

      `Check if the config file exists at ${configRelPathFromCwd}.`,
    );
  }

  if (!isZodObjectSchema(configModule.schema)) {
    throw new AstroError(
      `❌ Invalid feature flag config schema in ${configRelPathFromCwd}.`,

      `Check if the config schema is defined using \`z.object()\` in ${configRelPathFromCwd}.`,
    );
  }

  const isFeatureActiveForCurrentViteMode =
    configModule.viteMode.includes(currentViteMode);

  if (!isFeatureActiveForCurrentViteMode) {
    throw new AstroError(
      `❌ Feature flag not configured for current Vite Mode: ${styleText("yellow", currentViteMode)}`,

      `Check if ${currentViteMode} is included in viteMode in defineConfig() at ${configRelPathFromCwd}.`,
    );
  }

  ctx.logger.info(
    `🚚 Feature flag will be loaded for current Vite Mode: ${styleText("yellow", currentViteMode)}`,
  );

  return await Promise.all(
    configModule.viteMode.map(async (mode) => {
      const flag = configModule.flag[mode];
      if (flag == null) {
        throw new AstroError(
          `❌ Feature flag for mode: ${mode} not found.`,
          `Define flag config for \`${mode}\` in defineConfig() at ${configRelPathFromCwd}. Maybe you see TypeScript error because of missing flag config.`,
        );
      }

      const parseRes = await configModule.schema.safeParseAsync(flag);
      if (!parseRes.success) {
        throw new AstroError(
          `❌ Invalid feature flag config for \`${mode}\` in ${configRelPathFromCwd}.`,
          `Check if the flag config is defined correctly in defineConfig() at ${configRelPathFromCwd}.\n\nZod issues: ${JSON.stringify(parseRes.error.issues, null, 2)}`,
        );
      }

      const data = parseRes.data;
      const digest = ctx.generateDigest(data);

      ctx.store.set({
        data,
        digest,
        filePath: configRelPathFromAstroRoot,
        id: mode,
      });
    }),
  );
};

const isZodObjectSchema = (
  input: unknown,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): input is z.ZodObject<any, any, any> => input instanceof z.ZodObject;
