import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    isolate: false,
    pool: "forks", // Must use forks since calling `process.chdir` in the test setup
    setupFiles: ["vitest-setup.ts"],
    unstubEnvs: true, // https://vitest.dev/guide/mocking.html#mock-import-meta-env
  },
});
