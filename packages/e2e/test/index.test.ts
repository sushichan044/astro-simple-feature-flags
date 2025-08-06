import type { PreviewServer } from "astro";
import type { FeatureFlagConfig } from "virtual:astro-simple-feature-flags";

import { build, preview } from "astro";
import { describe, expect, it, vi } from "vitest";

type AcceptableViteMode = FeatureFlagConfig["viteMode"][number];

type DisposablePreviewServer = PreviewServer & {
  /**
   * Resource management cleanup
   * https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html
   */
  [Symbol.asyncDispose](): Promise<void>;
};

type PreviewServerOptions = {
  mode: AcceptableViteMode;
};

const createPreviewServer = async (
  options: PreviewServerOptions,
): Promise<DisposablePreviewServer> => {
  vi.stubEnv("MODE", options.mode);

  await build({}, { devOutput: true, teardownCompiler: false });
  const previewServer = await preview({});

  return {
    ...previewServer,
    [Symbol.asyncDispose]: async () => {
      await previewServer.stop();
    },
  };
};

const createFetchServer =
  (server: PreviewServer) =>
  async (path: string, options: RequestInit = {}) => {
    const url = new URL(path, `http://${server.host}:${server.port}`);
    return fetch(url, options);
  };

describe("e2e", () => {
  const tc: Array<{ expected: string; mode: AcceptableViteMode }> = [
    { expected: "Current mode: development", mode: "development" },
    { expected: "Current mode: test", mode: "test" },
    { expected: "Current mode: production", mode: "production" },
  ];

  describe("pre-rendered page (SSG)", () => {
    it.each(tc)("works in $mode mode", async ({ expected, mode }) => {
      await using preview = await createPreviewServer({ mode });
      const fetchServer = createFetchServer(preview);

      const res = await fetchServer("/ssg");
      const html = await res.text();

      expect(html).toContain(expected);
    });
  });

  describe("on-demand-rendered page (SSR)", () => {
    it.each(tc)("works in $mode mode", async ({ expected, mode }) => {
      await using preview = await createPreviewServer({ mode });
      const fetchServer = createFetchServer(preview);

      const res = await fetchServer("/ssr");
      const html = await res.text();

      expect(html).toContain(expected);
    });
  });
});
