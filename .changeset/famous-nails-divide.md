---
"astro-simple-feature-flags": minor
---

pr: #39

feat: add devToolBar app to inspect and edit flags in dev mode

The Astro Dev Toolbar now includes an interactive **Flag Console** that lets you view and live-edit feature flag values during development without restarting the dev server or manually editing your config file.

### What's new

- **View all flags** – The Flag Console shows every flag key, its current value, type, and the active Vite mode (e.g. `development`).
- **Inline editing** – Primitive flag values (`boolean`, `number`, `string`, `null`) are editable directly in the toolbar and written back to `flags.config.*`.
- **HMR on save** – Clicking **Update** rewrites the config file and triggers HMR, so updated flag values are reflected immediately without a manual restart.

### Limitations

- Only static `defineConfig({ flag: { … } })` object literals are editable. Flags defined via variables, spread operators, computed expressions, arrays, or nested objects are shown as read-only.
- Complex flag values (objects, arrays) are displayed as read-only JSON strings and cannot be edited inline.
