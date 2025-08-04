import type { Plugin } from "vite";

import {
  FEATURE_FLAG_COLLECTION_NAME,
  VIRTUAL_MODULE_ID,
  VITE_PLUGIN_NAME,
} from "../constant";
import { compileVirtualModuleImpl } from "./index";
import { _macroVirtualModuleImpl } from "./macro" with { type: "macro" };

const RESOLVED_VIRTUAL_MODULE_ID = `\0${VIRTUAL_MODULE_ID}`;

export const astroFeatureFlagVirtualModPlugin = (): Plugin => {
  return {
    load: (id) => {
      if (id === RESOLVED_VIRTUAL_MODULE_ID) {
        return compileVirtualModuleImpl(_macroVirtualModuleImpl, {
          featureFlagsCollectionsName: FEATURE_FLAG_COLLECTION_NAME,
        });
      }
      // Delegate to Vite's default resolver
      return null;
    },
    name: VITE_PLUGIN_NAME,
    resolveId: (id) => {
      if (id === VIRTUAL_MODULE_ID) {
        return RESOLVED_VIRTUAL_MODULE_ID;
      }
      // Delegate to Vite's default resolver
      return null;
    },
  };
};
