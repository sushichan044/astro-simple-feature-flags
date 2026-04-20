import { describe, expect, it, vi } from "vitest";

import { requestFlagData, subscribeToServerEvent } from "./server-events";
import { TOOLBAR_FLAG_DATA_EVENT, TOOLBAR_FLAG_REQUEST_EVENT } from "./shared";

describe("subscribeToServerEvent", () => {
  it("returns a cleanup function that unregisters the same listener", () => {
    const on = vi.fn();
    const off = vi.fn();
    const listener = vi.fn();

    const cleanup = subscribeToServerEvent(
      { on, send: vi.fn() },
      TOOLBAR_FLAG_DATA_EVENT,
      listener,
      { off },
    );

    expect(on).toHaveBeenCalledWith(TOOLBAR_FLAG_DATA_EVENT, listener);

    cleanup();

    expect(off).toHaveBeenCalledWith(TOOLBAR_FLAG_DATA_EVENT, listener);
  });
});

describe("requestFlagData", () => {
  it("subscribes before requesting data and returns the cleanup function", () => {
    const calls: string[] = [];
    const on = vi.fn(() => {
      calls.push("on");
    });
    const send = vi.fn(() => {
      calls.push("send");
    });
    const off = vi.fn();
    const listener = vi.fn();

    const cleanup = requestFlagData({ on, send }, listener, { off });

    expect(on).toHaveBeenCalledWith(TOOLBAR_FLAG_DATA_EVENT, listener);
    expect(send).toHaveBeenCalledWith(TOOLBAR_FLAG_REQUEST_EVENT, undefined);
    expect(calls).toEqual(["on", "send"]);

    cleanup();

    expect(off).toHaveBeenCalledWith(TOOLBAR_FLAG_DATA_EVENT, listener);
  });
});
