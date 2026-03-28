import type { FlagEditorSchema } from "./schema";
import type { EditableFlagValue } from "./value";

import { TOOLBAR_APP_ID } from "../constant";

export type FlagDataSuccess = {
  configFile: string;
  editors: Record<string, FlagEditorSchema>;
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

export type FlagUpdateRequest = {
  key: string;
  mode: string;
  value: EditableFlagValue;
};

export const TOOLBAR_FLAG_DATA_EVENT = `${TOOLBAR_APP_ID}:flag-data` as const;
export const TOOLBAR_FLAG_UPDATE_EVENT =
  `${TOOLBAR_APP_ID}:flag-update` as const;
