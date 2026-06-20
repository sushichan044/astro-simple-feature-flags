// Without this hack, building Astro application will fail when running tests from repository root.

process.chdir(import.meta.dirname);
