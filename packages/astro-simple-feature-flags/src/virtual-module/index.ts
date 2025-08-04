import { VIRTUAL_MODULE_ID } from "../constant";

type VirtualModuleDtsParams = {
  resolvedConfigPath: string;
};

export const compileVirtualModuleDts = (
  template: string,
  params: VirtualModuleDtsParams,
): string => {
  return template
    .replace("@@__RESOLVED_CONFIG_PATH__@@", params.resolvedConfigPath)
    .replace("@@__VIRTUAL_MODULE_ID__@@", VIRTUAL_MODULE_ID);
};

type VirtualModuleImplParams = {
  featureFlagsCollectionsName: string;
};

export const compileVirtualModuleImpl = (
  template: string,
  params: VirtualModuleImplParams,
): string => {
  return template.replace(
    "@@__FEATURE_FLAGS_COLLECTIONS_NAME__@@",
    params.featureFlagsCollectionsName,
  );
};

export const compileVirtualModuleInternalDts = (template: string): string => {
  return template.replace("@@__VIRTUAL_MODULE_ID__@@", VIRTUAL_MODULE_ID);
};
