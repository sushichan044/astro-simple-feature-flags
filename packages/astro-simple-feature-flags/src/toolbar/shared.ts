import { TOOLBAR_APP_ID } from "../constant";

export type FlagDataPayload = {
  configFile: string;
  flags: Record<string, unknown>;
  mode: string;
};

export const TOOLBAR_FLAG_DATA_EVENT = `${TOOLBAR_APP_ID}:flag-data` as const;
