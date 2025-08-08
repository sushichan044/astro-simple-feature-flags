import { transformModuleIdForDts } from "../codegen/dts";
import { VIRTUAL_MODULE_ID } from "../constant";

type VirtualModuleDtsParams = {
  configModuleId: string;
};

export const compileVirtualModuleDts = (
  template: string,
  params: VirtualModuleDtsParams,
): string => {
  return template
    .replace(
      "@@__CONFIG_MODULE_ID__@@",
      transformModuleIdForDts(params.configModuleId),
    )
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
