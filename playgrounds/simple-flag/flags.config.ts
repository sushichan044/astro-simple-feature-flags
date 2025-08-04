import { defineConfig } from "astro-simple-feature-flags/config";
import { z } from "astro/zod";

export default defineConfig({
  flag: {
    development: {
      fooReleased: false,
      simpleFlag: "true",
    },
    production: {
      fooReleased: false,
      simpleFlag: "false",
    },
  },
  schema: z.object({
    fooReleased: z.boolean().default(false),
    simpleFlag: z.string(),
  }),
  viteMode: ["development", "production"],
});
