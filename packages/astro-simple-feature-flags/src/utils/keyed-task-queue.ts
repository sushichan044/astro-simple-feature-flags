type AsyncTask<T> = () => Promise<T>;

export function createKeyedTaskQueue() {
  const pendingByKey = new Map<string, Promise<void>>();

  return {
    async run<T>(key: string, task: AsyncTask<T>): Promise<T> {
      const previous = pendingByKey.get(key) ?? Promise.resolve();
      const currentTask = previous.catch(() => undefined).then(task);
      const settledTask = currentTask.then(
        () => undefined,
        () => undefined,
      );

      pendingByKey.set(key, settledTask);

      try {
        return await currentTask;
      } finally {
        if (pendingByKey.get(key) === settledTask) {
          pendingByKey.delete(key);
        }
      }
    },
  };
}
