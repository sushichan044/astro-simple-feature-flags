import type {
  AstroInlineConfig,
  PreviewServer as AstroPreviewServer,
} from "astro";
import type { FeatureFlagConfig } from "virtual:astro-simple-feature-flags";

import { build, preview } from "astro";
import { vi } from "vitest";

export type AcceptableViteMode = FeatureFlagConfig["viteMode"][number];

export const withIndex = <T>(arr: T[]): Array<T & { idx: number }> => {
  return arr.map((item, idx) => Object.assign({}, item, { idx }));
};

export const BASE_PORTS = {
  SSG: 3000,
  SSR: 4000,
} as const;

interface PreviewServer extends AstroPreviewServer, AsyncDisposable {
  fetch: (path: string, options?: RequestInit) => Promise<Response>;
}

type PreviewServerOptions = {
  mode: AcceptableViteMode;
  port: number;
};

export const createPreviewServer = async (
  options: PreviewServerOptions,
): Promise<PreviewServer> => {
  vi.stubEnv("MODE", options.mode);

  const config = {
    cacheDir: `./node_modules/.cache/astro/${options.port}`,
    outDir: `./dist/${options.port}`,
    server: {
      port: options.port,
    },
  } satisfies AstroInlineConfig;

  await build(config, { devOutput: true, teardownCompiler: false });
  const previewServer = await preview(config);

  return {
    ...previewServer,
    fetch: createFetch(previewServer),
    [Symbol.asyncDispose]: async () => {
      await previewServer.stop();
    },
  };
};

const createFetch =
  (server: AstroPreviewServer) =>
  async (path: string, options: RequestInit = {}) => {
    const url = new URL(path, `http://${server.host}:${server.port}`);
    return fetch(url, options);
  };
