import type { AstroInlineConfig, PreviewServer } from "astro";
import type { FeatureFlagConfig } from "virtual:astro-simple-feature-flags";

import node from "@astrojs/node";
import { build, preview } from "astro";
import { describe, expect, it } from "vitest";

type AcceptableViteMode = FeatureFlagConfig["viteMode"][number];

// https://github.com/vitest-dev/vitest/discussions/1606
// without this function, feature flag always query for `test` mode
// since Vitest set `import.meta.env.MODE` to `test` by default
const overrideViteMode = (mode: AcceptableViteMode) => {
  const currentMode = import.meta.env.MODE;
  import.meta.env.MODE = mode;

  return () => {
    import.meta.env.MODE = currentMode;
  };
};

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
  const config = {
    adapter: node({ mode: "standalone" }),
    mode: options.mode,
    output: "server",
    vite: {
      mode: options.mode,
    },
  } satisfies AstroInlineConfig;
  const restoreViteMode = overrideViteMode(options.mode);

  await build(config, { devOutput: true, teardownCompiler: false });
  const previewServer = await preview(config);

  return {
    ...previewServer,
    [Symbol.asyncDispose]: async () => {
      await previewServer.stop();
      restoreViteMode();
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

  it.each(tc)("works in %s mode", async ({ expected, mode }) => {
    await using preview = await createPreviewServer({ mode });
    const fetchServer = createFetchServer(preview);

    const res = await fetchServer("/");
    const html = await res.text();

    expect(html).toContain(expected);
  });
});
