import { describe, expect, it } from "vitest";

import { BASE_PORTS, createPreviewServer, createTempDir } from "./utils";

describe("SSG", () => {
  it("should throw error when querying non-existent flag", async () => {
    await using tmpDir = await createTempDir();
    await using server = await createPreviewServer({
      mode: "development",
      port: BASE_PORTS.BEHAVIOR,
      tmpDir: tmpDir.path,
    });

    const res = await server.fetch("/non-existent");
    const err = res.headers.get("x-error");
    expect(err).toBe("FlagNotFoundError");
  });
});
