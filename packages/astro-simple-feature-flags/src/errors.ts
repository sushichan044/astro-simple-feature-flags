export class FlagNotFoundError extends Error {
  key: string;
  mode: string;

  constructor(key: string, mode: string) {
    super(
      `Feature flag with key "${key}" was not found in the data for Vite mode "${mode}".`,
    );
    this.name = "FlagNotFoundError";
    this.key = key;
    this.mode = mode;
  }
}
