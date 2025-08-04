/**
 * Vite Mode type. accepts default mode or user-defined mode.
 */
export type ViteModeType = (string & {}) | DefaultViteModeType;

/**
 * Vite Mode type defined in Vite by default
 * @see {@link https://vite.dev/guide/env-and-mode#modes}
 */
type DefaultViteModeType = "development" | "production";
