import { describe, expect, it } from "vitest";

import { createKeyedTaskQueue } from "./keyed-task-queue";

describe("createKeyedTaskQueue", () => {
  it("runs tasks for the same key sequentially", async () => {
    const queue = createKeyedTaskQueue();
    const order: string[] = [];
    let releaseFirst: (() => void) | undefined;

    const first = queue.run("flags.ts", async () => {
      order.push("first:start");
      await new Promise<void>((resolve) => {
        releaseFirst = resolve;
      });
      order.push("first:end");
    });

    const second = queue.run("flags.ts", async () => {
      order.push("second:start");
      order.push("second:end");
      return Promise.resolve();
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(order).toEqual(["first:start"]);

    releaseFirst?.();
    await Promise.all([first, second]);

    expect(order).toEqual([
      "first:start",
      "first:end",
      "second:start",
      "second:end",
    ]);
  });

  it("allows tasks for different keys to proceed independently", async () => {
    const queue = createKeyedTaskQueue();
    const order: string[] = [];

    await Promise.all([
      queue.run("a.ts", async () => {
        order.push("a:start");
        await Promise.resolve();
        order.push("a:end");
      }),
      queue.run("b.ts", async () => {
        order.push("b:start");
        await Promise.resolve();
        order.push("b:end");
      }),
    ]);

    expect(order.slice(0, 2).sort()).toEqual(["a:start", "b:start"]);
    expect(order).toContain("a:end");
    expect(order).toContain("b:end");
  });
});
