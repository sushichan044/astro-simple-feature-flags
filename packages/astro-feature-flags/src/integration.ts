import type { AstroIntegration } from "astro";

import { writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { cwd } from "node:process";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createDtsImport } from "./codegen/dts";
import { esmResolve } from "./utils/import";
import { isNonEmptyString } from "./utils/string";

type FeatureFlagOptions = {
  /**
   * config file name to be used for feature flags.
   *
   * For example, if you set `configFileName` to `flags`, the config file will be `flags.config.{js,cjs,mjs,ts,cts,mts}`.
   *
   * @default `flags`
   */
  configFileName: string;
};

export const createIntegration = (
  options: Partial<FeatureFlagOptions> = {},
): AstroIntegration => {
  const { configFileName = "flags" } = options;
  let astroRootDir = pathToFileURL(cwd());

  // get codegen root dir in `astro:config:setup` hook,
  // then use it in `astro:config:done` hook
  // to calculate relative path to the config file without calling `injectTypes()` twice
  let codeGenRootDir = new URL(
    "./.astro/integrations/astro-feature-flags",
    astroRootDir,
  );

  return {
    hooks: {
      "astro:config:setup": async ({ createCodegenDir }) => {
        codeGenRootDir = createCodegenDir();

        const internalDtsURL = new URL("internal.d.ts", codeGenRootDir);

        await writeFile(
          internalDtsURL,
          [
            `export type GetExport<
  TMod extends Record<string, unknown>,
  TKey extends string,
> = TMod extends { [K in TKey]: infer E } ? E : never;`,
          ].join("\n\n"),
          "utf8",
        );
      },

      "astro:config:done": ({ config, injectTypes, logger }) => {
        astroRootDir = config.root;
        const configModuleId = `${configFileName}.config`;

        const configModIdOrURL = resolveModulePath(
          astroRootDir,
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
          content: [
            `type Module = typeof ${createDtsImport(configModulePathFromDts)};`,
            "",
            String.raw`type DefaultExport = import("./internal.js").GetExport<Module, "default">;`,
            String.raw`type FlagSchema = DefaultExport["schema"];`,
            `type SchemaType = import("astro/zod").infer<FlagSchema>;`,
          ].join("\n"),
          filename: "flags.d.ts",
        });
      },
    },
    name: "astro-feature-flags",
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
