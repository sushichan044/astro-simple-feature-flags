import { defineConfig } from "astro-simple-feature-flags/config";
import { z } from "astro/zod";

export default defineConfig({
  flag: {
    development: {
      barReleaseRate: 0.3,
      fooReleased: true,
    },
    production: {
      barReleaseRate: 0,
      fooReleased: true,
    },
    staging: {
      barReleaseRate: 1,
      fooReleased: false,
    },
  },
  schema: z.object({
    barReleaseRate: z.number().min(0).max(1),
    fooReleased: z.boolean(),
  }),
  viteMode: ["development", "production", "staging"],
});
