import { defineConfig } from "astro-simple-feature-flags/config";
import { z } from "astro/zod";

export default defineConfig({
  flag: {
    development: {
      barReleaseRate: 0.3,
      fooReleased: false,
    },
    production: {
      barReleaseRate: 0,
      fooReleased: false,
    },
  },
  schema: z.object({
    barReleaseRate: z.number().positive().min(0).max(1),
    fooReleased: z.boolean().default(false),
  }),
  viteMode: ["development", "production"],
});
