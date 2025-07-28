import type { I18nBaseConfig, IntegrationOptions } from "./types/integration";

/**
 * Creates the base i18next configuration
 */
export function createBaseConfig(options: IntegrationOptions): I18nBaseConfig {
  return {
    lng: options.defaultLocale,
    fallbackLng: options.defaultLocale,
    supportedLngs: options.locales,
    defaultNS: options.defaultNamespace,
    fallbackNS: options.defaultNamespace,
    ns: [options.defaultNamespace],
  };
}
