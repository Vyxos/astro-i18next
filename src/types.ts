import type { InitOptions } from "i18next";

export interface IntegrationOptions {
  locales: string[];
  defaultLocale: string;
  namespaces: string[];
  defaultNamespace: string;
  translationsDir: string;
  translationsPattern: string;
}

export type TranslationContent = {
  [key: string]: string | number | TranslationContent;
};

export interface TranslationMap {
  [locale: string]: {
    [namespace: string]: TranslationContent;
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

// Global type declarations
declare global {
  interface Window {
    __i18nLoadNamespaces?: (namespaces: string[]) => Promise<void>;
  }

  const window: Window | undefined;
}
