// see: https://docs.astro.build/en/reference/integrations-reference/#custom-hooks
declare global {
  namespace Astro {
    export interface IntegrationHooks {
      "astro-simple-feature-flags:private:storage": {
        configFileName: string;
      };
    }
  }
}

export {};
