import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    setupFiles: ["vitest-setup.ts"],
    unstubEnvs: true, // https://vitest.dev/guide/mocking.html#mock-import-meta-env
  },
});
