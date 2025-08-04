import type { createGetEntry } from "astro/content/runtime";

import { getViteMode } from "../vite";

type GetEntryFn = ReturnType<typeof createGetEntry>;

type QueryFeatureFlagDependencies = {
  collectionName: string;
  getEntry: GetEntryFn;
};

export const createQueryFeatureFlag =
  ({ collectionName, getEntry }: QueryFeatureFlagDependencies) =>
  async (key: string): Promise<unknown> => {
    const currentMode = getViteMode();

    const flagObject = await getEntry(collectionName, currentMode);

    if (flagObject == null) {
      console.warn(
        `Feature flag data for vite mode: ${currentMode} is not found.`,
      );
      return;
    }

    return flagObject.data?.[key];
  };
