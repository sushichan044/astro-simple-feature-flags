/**
 * @module astro-simple-feature-flags/internal
 *
 * This module provides internal utilities for the `virtual:astro-simple-feature-flags` module.
 */

import type { ViteModeType } from "../vite";

/**
 * Get current Vite Mode.
 *
 * @see {@link https://vite.dev/guide/env-and-mode#modes}
 */
export const getViteMode = (): ViteModeType =>
  import.meta.env.MODE as ViteModeType;
