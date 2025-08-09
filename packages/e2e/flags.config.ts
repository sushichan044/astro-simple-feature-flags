import { defineConfig } from "astro-simple-feature-flags/config";
import { z } from "astro/zod";

export default defineConfig({
  flag: {
    development: {
      barReleaseRate: 1,
      fooReleasedWithDefault: true,
      mode: "development",
    },

    test: {
      barReleaseRate: 0.5,
      fooReleasedWithDefault: true,
      mode: "test",
    },

    production: {
      mode: "production",
    },
  },
  schema: z.object({
    barReleaseRate: z.number().min(0).max(1).optional().default(0),
    fooReleasedWithDefault: z.boolean().optional().default(false),
    mode: z.enum(["development", "production", "test"]),
  }),
  viteMode: ["development", "production", "test"],
});
