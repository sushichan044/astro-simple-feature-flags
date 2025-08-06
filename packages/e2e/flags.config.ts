import { defineConfig } from "astro-simple-feature-flags/config";
import { z } from "astro/zod";

export default defineConfig({
  flag: {
    development: {
      barReleaseRate: 1,
      fooReleased: true,
      mode: "development",
    },

    test: {
      barReleaseRate: 0.5,
      fooReleased: true,
      mode: "test",
    },

    production: {
      mode: "production",
    },
  },
  schema: z.object({
    barReleaseRate: z.number().min(0).max(1).optional().default(0),
    fooReleased: z.boolean().optional().default(false),
    mode: z.enum(["development", "production", "test"]),
  }),
  viteMode: ["development", "production", "test"],
});
