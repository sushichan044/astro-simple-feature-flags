# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Processing Flow Overview

### 1. Astro Build Start

```mermaid
graph LR
    A[User configures integration] --> B[astro:config:setup hook]
    B --> C[Vite plugin registered]
    C --> D[astro:config:done hook]
    D --> E[TypeScript definitions generated & injected]

    style A fill:#e1f5fe
    style E fill:#fff3e0
```

### 2. Content Layer Loading

```mermaid
graph LR
    A[Content Layer loader activated] --> B[Config file resolved & imported]
    B --> C[Zod schema validation]
    C --> D[Flag data validated per Vite mode]
    D --> E[Collection store populated]
    E --> F[Hot-reload watching enabled]

    style A fill:#fff3e0
    style F fill:#e8f5e8
```

### 3. Virtual Module Resolution (Import-triggered)

```mermaid
graph LR
    A[User imports 'virtual:astro-simple-feature-flags'] --> B[Vite plugin intercepts]
    B --> C[Returns build-time generated module implementation]

    style A fill:#f3e5f5
    style C fill:#e8f5e8
```

### 4. Runtime Flag Access

```mermaid
graph LR
    A[User calls virtual module API] --> B[Collection data accessed]
    B --> C[Type-safe flag values returned]
    C --> D[User can use flags value in application logic]

    style A fill:#f3e5f5
    style D fill:#c8e6c8
```

## Library Architecture

### Core Components Flow

1. **Integration** (`src/integration.ts`) - Main Astro Integration
   - Hooks into `astro:config:setup` to inject Vite plugin
   - Hooks into `astro:config:done` to generate TypeScript definitions
   - Uses private hook to pass config to Content Layer loader

2. **Content Layer** (`src/content-layer.ts`) - Data Loading
   - Defines collection loader for `astro-simple-feature-flags` collection
   - Resolves and validates flag config files with config resolver from `src/config/resolve.ts`
   - Supports hot-reloading during development

3. **Virtual Module System** (`src/virtual-module/`)
   - `vite-plugin-flags-virtual-mod.ts` - Vite plugin for `virtual:astro-simple-feature-flags`
   - `index.ts` - Processing virtual module templates
   - `macro.ts` - Compile-time code generation using unplugin-macros
   - `templates/` - TypeScript definition and implementation templates

4. **Config Resolution** (`src/config/`)
   - Resolves flag config files using ESM resolver
   - Supports `.{js,cjs,mjs,ts,cts,mts}` extensions
   - Validates schema using Zod

## Development Commands

expected cwd: `packages/astro-simple-feature-flags/`

- `pnpm build` - Build with tsdown
- `pnpm test` - Run Vitest tests
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking

## Development Notes

- Using build-time macros with `unplugin-macros` for code generation.
  - See `src/virtual-module/macro.ts` if detailed information needed.
- Config file resolution uses Node.js ESM resolution with jiti for TypeScript support
