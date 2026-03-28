export class FlagNotFoundError extends Error {
  key: string;
  mode: string;

  constructor(key: string, mode: string) {
    super(
      `Feature flag with key: ${key} is not found in the data for vite mode: ${mode}.`,
    );
    this.name = "FlagNotFoundError";
    this.key = key;
    this.mode = mode;
  }
}
