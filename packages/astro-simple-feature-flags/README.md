# astro-simple-feature-flags

[![npm version](https://badge.fury.io/js/astro-simple-feature-flags.svg)](https://badge.fury.io/js/astro-simple-feature-flags)
[![Node.js Version](https://img.shields.io/node/v/astro-simple-feature-flags.svg)](https://nodejs.org/)
[![Astro](https://img.shields.io/badge/astro-5.0+-orange.svg)](https://astro.build/)
[![TypeScript](https://img.shields.io/badge/typescript-ready-blue.svg)](https://www.typescriptlang.org/)
[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](https://opensource.org/licenses/MIT)

> A simple, type-safe feature flag integration for Astro, powered by the Content Layer API.

## ✨ Features

- 🌍 **Environment-aware** - Use different flag values for each Vite mode.
- 🔒 **Type-safe** - Full TypeScript support with auto-generated types.
- 🔄 **Hot-reload** - Flag changes trigger HMR in the dev server.
- 📦 **Content Layer Powered** - Built on Astro 5's Content Layer API.
  - Works in both SSG and SSR modes.
- 🎯 **Simple API** - Query any flag with a single function call.

## 🚀 Getting Started

Get up and running in under 5 minutes:

### 1. Install

```bash
npx astro add astro-simple-feature-flags
```

### 2. Add Integration

```js
// astro.config.mjs
import simpleFeatureFlags from 'astro-simple-feature-flags';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [simpleFeatureFlags()],
});
```

### 3. Create a Feature Flag Configuration

Write your flags definition.

```ts
// flags.config.ts
import { defineConfig } from 'astro-simple-feature-flags/config';
import { z } from 'astro/zod';

export default defineConfig({
  schema: z.object({
    isFooEnabled: z.boolean().optional().default(false),
    barEnabledRate: z.number().min(0).max(1).optional().default(0),
  }),
  flag: {
    development: {
      isFooEnabled: true,
      barEnabledRate: 1.0,
    },
    production: {
      barEnabledRate: 0.1,
    },
  },
  // Define the Vite modes for your environments.
  // You can add more modes as needed (e.g., 'staging', 'testing').
  //
  // See [https://vite.dev/guide/env-and-mode.html#modes](https://vite.dev/guide/env-and-mode.html#modes) for detailed information about Vite modes.
  viteMode: ['development', 'production'],
});
```

Then run:

```bash
npx astro sync
```

### 4. Define Content Collection via API

> [!WARNING]
> If you already defined a collection named `astro-simple-feature-flags`, this integration will not work.

```ts
// src/content/config.ts
import { defineFeatureFlagCollection } from "astro-simple-feature-flags/content-layer";
import { defineCollection } from "astro:content";

export const collections = {
  // Your existing collections...
  ...defineFeatureFlagCollection(defineCollection),
};
```

### 5. Use Flags in Your Astro Components

```astro
---
// src/pages/index.astro
import { queryFeatureFlag } from 'virtual:astro-simple-feature-flags';

// Query feature flags! Params and return types are fully typed.
const isFooEnabled = await queryFeatureFlag('isFooEnabled');
const barEnabledRate = await queryFeatureFlag('barEnabledRate');
---

<html>
  <body>
    {isFooEnabled && (
      <div class="new-feature">
        🎉 New feature is live!
      </div>
    )}

    {barEnabledRate > 0 && (
      <p>Bar enabled rate: {Math.round(barEnabledRate * 100)}% of users</p>
    )}
  </body>
</html>
```

That's it! Your feature flags are now working with full type safety and environment awareness.

## 📦 Installation & Setup

### Requirements

See `engines.node` and `peerDependencies` in [package.json](./package.json) for supported Node.js and Astro versions.

### Step-by-Step Installation

1. **Install the package:**

   ```bash
   npx astro add astro-simple-feature-flags
   ```

2. **Create your flags configuration file:**

    - By default, the configuration file is named `flags.config.{ts,js,mjs,cjs,cts,mts}`.
    - To use a different path, for example `.config/flags.config.ts`, pass `.config/flags` to the configFileName option in your integration settings.

## 🌐 Environment Management

`astro-simple-feature-flags` supports environment-aware feature flags using Vite modes.

See [Vite Modes Docs](https://vite.dev/guide/env-and-mode.html#modes) for more details.

### Environment Configuration

The `viteMode` array in your configuration maps Vite's build modes to your defined environments:

```ts
export default defineConfig({
  // Your environments
  flag: {
    development: { /* dev flags */ },
    staging: { /* staging flags */ },
    production: { /* prod flags */ },
    testing: { /* test flags */ },
  },

  // Map Vite modes to environments
  viteMode: ['development', 'staging', 'production', 'testing'],

  // When Vite runs in 'development' mode, it uses the 'development' flags.
  // When Vite runs in 'staging' mode, it uses the 'staging' flags.
  // And so on.
});
```

### Custom Build Modes

Set custom Vite modes for different deployment targets:

```json
// package.json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "build:staging": "astro build --mode staging",
    "build:testing": "astro build --mode testing",
    "preview": "astro preview"
  }
}
```

## 🔷 TypeScript Support

Params and return types for `queryFeatureFlag` are fully typed automatically.

> [!WARNING]
> You must run `astro sync` after you changed the value of `configFileName` in your integration config.

## 🤝 Contributing & Resources

### Community

- **GitHub Repository**: [sushichan044/astro-simple-feature-flags](https://github.com/sushichan044/astro-simple-feature-flags)
- **Issues & Bug Reports & Feature Requests**: [GitHub Issues](https://github.com/sushichan044/astro-simple-feature-flags/issues)

### Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Clone your fork**: `git clone https://github.com/yourusername/astro-simple-feature-flags.git`
3. **Install dependencies**: `pnpm install`
4. **Make your changes**
5. **Format your code**: `pnpm format`
6. **Test thoroughly**: `pnpm typecheck && pnpm lint`
7. **Submit a pull request**

### Development Setup

```bash
# Clone the repo
git clone https://github.com/sushichan044/astro-simple-feature-flags.git
cd astro-simple-feature-flags

# Install dependencies
pnpm install

# Build the package
pnpm --filter astro-simple-feature-flags build

# Test in playground
pnpm --filter @repo/playgrounds-simple-flag dev
```

### Useful Resources

- **Astro Documentation**: <https://docs.astro.build>
- **Astro Integration API**: <https://docs.astro.build/en/reference/integrations-reference/>
- **Astro AContent Loader API**: <https://docs.astro.build/en/reference/content-loader-reference/>

### Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history and release notes.

---

## License

MIT © [sushichan044](https://github.com/sushichan044)

---

<div align="center">
  <strong>Happy feature flagging! 🚀</strong>
  <br>
  <sub>Built with ❤️ for the Astro community</sub>
</div>
