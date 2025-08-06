import type {
  AstroInlineConfig,
  PreviewServer as AstroPreviewServer,
} from "astro";
import type { FeatureFlagConfig } from "virtual:astro-simple-feature-flags";

import { build, preview } from "astro";
import { existsSync } from "node:fs";
import { mkdtemp, rmdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { vi } from "vitest";

export type AcceptableViteMode = FeatureFlagConfig["viteMode"][number];

export const withIndex = <T>(arr: T[]): Array<T & { idx: number }> => {
  return arr.map((item, idx) => Object.assign({}, item, { idx }));
};

export const BASE_PORTS = {
  SSG: 3000,
  SSR: 4000,
} as const;

export const createTempDir = async (): Promise<
  AsyncDisposable & { path: string }
> => {
  const path = await mkdtemp(join(tmpdir(), "astro-simple-feature-flags-e2e"));

  const close = async () => {
    if (existsSync(path)) {
      await rmdir(path, { recursive: true });
    }
  };

  return {
    path,
    [Symbol.asyncDispose]: close,
  };
};

interface PreviewServer extends AstroPreviewServer, AsyncDisposable {
  fetch: (path: string, options?: RequestInit) => Promise<Response>;
}

type PreviewServerOptions = {
  mode: AcceptableViteMode;
  port: number;
  tmpDir: string;
};

export const createPreviewServer = async (
  options: PreviewServerOptions,
): Promise<PreviewServer> => {
  vi.stubEnv("MODE", options.mode);

  const cacheDir = join(options.tmpDir, "astro-cache");
  const outDir = join(options.tmpDir, "astro-out");
  const viteCacheDir = join(options.tmpDir, "vite-cache");

  const config = {
    cacheDir,
    outDir,
    server: {
      port: options.port,
    },
    vite: {
      cacheDir: viteCacheDir,
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
