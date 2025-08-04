# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A simple feature flags integration library for Astro. A dynamic feature flag management system powered by Astro's Content Layer.

## Workspace Structure

```bash
$ tree --gitignore -d -L 2
.
├── packages
│   └── astro-simple-feature-flags
└── playgrounds
    └── simple-flag

5 directories
```

- `packages/astro-simple-feature-flags/` - The main library package
  - Includes Astro Integration, Content Layer loader, and Vite virtual modules
  - [README](packages/astro-simple-feature-flags/README.md) for details

- `playgrounds/simple-flag/` - Example playground to test the library
  - Contains an Astro project using the library
  - [README](playgrounds/simple-flag/README.md) for details

## Development Commands

### Root Directory (Workspace)

- `pnpm lint` - Run lint for all packages
- `pnpm test` - Run Vitest tests
- `pnpm format` - Apply Biome formatting
- `pnpm typecheck` - Run type checking for all packages

### Package Directory (`packages/astro-simple-feature-flags/`)

expected cwd: repository root

- `pnpm --filter astro-simple-feature-flags build` - Build with tsdown
- `pnpm --filter astro-simple-feature-flags test` - Run Vitest tests
- `pnpm --filter astro-simple-feature-flags lint` - Run ESLint
- `pnpm --filter astro-simple-feature-flags typecheck` - Run TypeScript type checking

### Playground (`playgrounds/simple-flag/`)

expected cwd: repository root

- `pnpm --filter @repo/playgrounds-simple-flag dev` - Start development server (localhost:4321)
- `pnpm --filter @repo/playgrounds-simple-flag build` - Production build
- `pnpm --filter @repo/playgrounds-simple-flag preview` - Preview build

## Package Management

- **pnpm workspace** configuration
- **catalog** feature for unified dependency version management
- **tsdown** for building
- **Biome** + **ESLint** for code quality management

## Development Notes

- Type definition regeneration is required after integration config changes
- Virtual modules are dynamically generated, so pay attention to dependencies during type checking
- Content Layer loader function receives config from Integration via private hooks
- Macro functionality used for compile-time type definition generation
