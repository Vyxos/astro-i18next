import type { InitOptions } from "i18next";

/**
 * Defines the configuration options for the astro-i18next integration.
 * These options are passed to the `i18nIntegration` function in `astro.config.mjs`.
 */
export interface IntegrationOptions {
  /**
   * An array of supported language codes for the application.
   * Each locale should be a string following the `ll` or `ll-CC` format (e.g., "en", "en-US").
   * This list is used to validate incoming locale paths, load corresponding
   * translation files, and generate localized URLs. At least one locale must be provided.
   *
   * @example ['en', 'fr', 'es-MX']
   */
  locales: string[];

  /**
   * The default language for the application. This locale will be used as a fallback
   * when a specific locale cannot be determined from the URL. It must be one of the
   * locales present in the `locales` array. URLs for the default locale typically
   * do not include the locale prefix.
   *
   * @example 'en'
   */
  defaultLocale: string;

  /**
   * An array of translation namespaces to be used in the application. Namespaces help
   * organize translations into logical groups (e.g., "common", "auth", "profile").
   * Each namespace corresponds to a separate JSON file within a locale's translation
   * directory. At least one namespace must be provided.
   *
   * @example ['common', 'home', 'errors']
   */
  namespaces: string[];

  /**
   * The default namespace to be loaded and used by i18next. If a translation key is
   * used without specifying a namespace, i18next will look for it in this default
   * namespace. It must be one of the namespaces present in the `namespaces` array.
   *
   * @example 'common'
   */
  defaultNamespace: string;

  /**
   * The path to the directory where translation files are stored, relative to the
   * `src` directory of the Astro project. The integration expects a structure of
   * `[translationsDir]/[locale]/[namespace].json`.
   *
   * @example 'locales'
   */
  translationsDir: string;
}

export interface I18nBaseConfig extends InitOptions {
  lng: string;
  fallbackLng: string;
  supportedLngs: string[];
  defaultNS: string;
  fallbackNS: string;
  ns: string[];
}
