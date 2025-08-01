import type { InitOptions } from "i18next";
import { DPick, OptionalKeys } from "../utils/types";

export interface GeneratedTypes {
  fileName: string;
  dirPath: string;
}

export interface IntegrationOptionsInternal {
  locales: string[];
  defaultLocale: string;
  defaultNamespace: string;
  namespaces: string[];
  translationsDir: string;
  generatedTypes: GeneratedTypes;
}

export type IntegrationOptions = {} & Required<
  DPick<
    IntegrationOptionsInternal,
    "defaultLocale" | "defaultNamespace" | "locales" | "namespaces"
  >
> &
  Partial<IntegrationOptionsInternal>;

export type DefaultIntegrationOptions = Required<
  Pick<IntegrationOptions, OptionalKeys<IntegrationOptions>>
>;

export interface I18nBaseConfig extends InitOptions {
  lng: string;
  fallbackLng: string;
  supportedLngs: string[];
  defaultNS: string;
  fallbackNS: string;
  ns: string[];
}
