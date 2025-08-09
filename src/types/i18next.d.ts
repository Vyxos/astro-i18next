import { IntegrationOptions } from "../types";

type MergedIntegrationOptions = {
  [key in keyof IntegrationOptions]-?: IntegrationOptions[key];
};

declare module "i18next" {
  interface InitOptions {
    integrationOptions: Pick<
      MergedIntegrationOptions,
      | "lng"
      | "fallbackLng"
      | "supportedLngs"
      | "defaultNS"
      | "ns"
      | "translationsDir"
      | "generatedTypes"
    >;
  }
}
