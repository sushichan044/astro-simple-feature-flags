import type { ToolbarServerHelpers } from "astro";

import type { FlagDataPayload } from "./shared";

import { TOOLBAR_FLAG_DATA_EVENT, TOOLBAR_FLAG_REQUEST_EVENT } from "./shared";

type HotEventClient = {
  off?: (event: string, callback: (payload: unknown) => void) => void;
};

type ToolbarServerEventHelpers = Pick<ToolbarServerHelpers, "on" | "send">;

export function subscribeToServerEvent<T>(
  server: ToolbarServerEventHelpers,
  event: string,
  listener: (payload: T) => void,
  hot: HotEventClient | undefined = import.meta.hot,
): () => void {
  server.on<T>(event, listener);

  return () => {
    hot?.off?.(event, listener as (payload: unknown) => void);
  };
}

export function requestFlagData(
  server: ToolbarServerEventHelpers,
  listener: (payload: FlagDataPayload) => void,
  hot: HotEventClient | undefined = import.meta.hot,
): () => void {
  const cleanup = subscribeToServerEvent(
    server,
    TOOLBAR_FLAG_DATA_EVENT,
    listener,
    hot,
  );

  server.send<undefined>(TOOLBAR_FLAG_REQUEST_EVENT, undefined);

  return cleanup;
}
