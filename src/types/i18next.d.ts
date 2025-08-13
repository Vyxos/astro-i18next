import { IntegrationOptionsInternal, IntegrationOptions } from "../types";

declare module "i18next" {
  interface InitOptions {
    integrationOptions: IntegrationOptionsInternal &
      IntegrationOptions["i18NextOptions"];
  }
}
