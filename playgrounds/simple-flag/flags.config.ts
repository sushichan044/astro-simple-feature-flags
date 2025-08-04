import { defineConfig } from "astro-feature-flags/config";
import { z } from "astro/zod";

export default defineConfig({
  flag: {
    development: {
      simpleFlag: true,
    },
    production: {
      simpleFlag: false,
    },
  },
  schema: z.object({
    simpleFlag: z.boolean().default(false),
  }),
  viteMode: ["development", "production"],
});
