import { describe, expect, it } from "vitest";

import type { AcceptableViteMode } from "./utils";

import {
  BASE_PORTS,
  createPreviewServer,
  createTempDir,
  withIndex,
} from "./utils";

describe("SSG", () => {
  const tc: Array<{ mode: AcceptableViteMode; shouldContain: string[] }> = [
    {
      mode: "development",
      shouldContain: [
        "Current mode: development",
        "fooReleasedWithDefault: true",
      ],
    },
    {
      mode: "test",
      shouldContain: ["Current mode: test", "fooReleasedWithDefault: true"],
    },
    {
      mode: "production",
      shouldContain: [
        "Current mode: production",
        "fooReleasedWithDefault: false",
      ],
    },
  ];

  it.each(withIndex(tc))("works in $mode mode", async (t) => {
    await using tmpDir = await createTempDir();
    await using server = await createPreviewServer({
      mode: t.mode,
      port: BASE_PORTS.SSG + t.idx,
      tmpDir: tmpDir.path,
    });

    const res = await server.fetch("/ssg");
    const html = await res.text();

    for (const expected of t.shouldContain) {
      expect(html).toContain(expected);
    }
  });
});
