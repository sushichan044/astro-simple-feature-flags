import { defineConfig } from "astro-simple-feature-flags/config";
import { z } from "astro/zod";

export default defineConfig({
  flag: {
    development: {
      barReleaseRate: 1,
      fooReleased: true,
    },

    staging: {
      barReleaseRate: 0.5,
      fooReleased: true,
    },

    production: {},
  },
  schema: z.object({
    barReleaseRate: z.number().min(0).max(1).optional().default(0),
    fooReleased: z.boolean().optional().default(false),
  }),
  viteMode: ["development", "production", "staging"],
});
