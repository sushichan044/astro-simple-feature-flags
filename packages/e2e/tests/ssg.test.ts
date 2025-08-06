import { describe, expect, it } from "vitest";

import type { AcceptableViteMode } from "./utils";

import { BASE_PORTS, createPreviewServer } from "./utils";

describe("SSG", () => {
  const tc: Array<{ expected: string; mode: AcceptableViteMode }> = [
    { expected: "Current mode: development", mode: "development" },
    { expected: "Current mode: test", mode: "test" },
    { expected: "Current mode: production", mode: "production" },
  ];

  it.each(tc.map((c, idx) => ({ ...c, idx })))(
    "works in $mode mode",
    async (t) => {
      await using server = await createPreviewServer({
        mode: t.mode,
        port: BASE_PORTS.SSG + t.idx,
      });

      const res = await server.fetch("/ssg");
      const html = await res.text();

      expect(html).toContain(t.expected);
    },
  );
});
