import type { InitOptions } from "i18next";

export interface IntegrationOptions {
  locales: string[];
  defaultLocale: string;
  namespaces: string[];
  defaultNamespace: string;
  translationsDir: string;
  translationsPattern: string;
}

export interface TranslationMap {
  [locale: string]: {
    [namespace: string]: any;
  };
}

export interface I18nBaseConfig extends InitOptions {
  lng: string;
  fallbackLng: string;
  supportedLngs: string[];
  defaultNS: string;
  fallbackNS: string;
  ns: string[];
}
