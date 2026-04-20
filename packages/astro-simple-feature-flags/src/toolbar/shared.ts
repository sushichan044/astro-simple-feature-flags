import type { FlagEditorSchema } from "./schema";

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
  flags: Record<string, unknown>;
  mode: string;
  requestId: string;
};

export type FlagFieldErrors = Record<string, string>;

export type FlagUpdateResult =
  | {
      fieldErrors: FlagFieldErrors;
      ok: false;
      requestId: string;
    }
  | {
      formError: string;
      ok: false;
      requestId: string;
    }
  | {
      ok: true;
      requestId: string;
    };

export const TOOLBAR_FLAG_REQUEST_EVENT =
  `${TOOLBAR_APP_ID}:flag-request` as const;
export const TOOLBAR_FLAG_DATA_EVENT = `${TOOLBAR_APP_ID}:flag-data` as const;
export const TOOLBAR_FLAG_UPDATE_EVENT =
  `${TOOLBAR_APP_ID}:flag-update` as const;
export const TOOLBAR_FLAG_UPDATE_RESULT_EVENT =
  `${TOOLBAR_APP_ID}:flag-update-result` as const;
