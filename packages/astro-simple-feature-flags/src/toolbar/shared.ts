import { TOOLBAR_APP_ID } from "../constant";

export type FlagDataSuccess = {
  configFile: string;
  flags: Record<string, unknown>;
  mode: string;
};

export type FlagDataError = {
  error: string;
};

/**
 * @package
 */
export type FlagDataPayload = FlagDataError | FlagDataSuccess;

export const TOOLBAR_FLAG_DATA_EVENT = `${TOOLBAR_APP_ID}:flag-data` as const;
