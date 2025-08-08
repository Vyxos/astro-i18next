import type {
  DefaultIntegrationOptions,
  I18nBaseConfig,
  IntegrationOptions,
  IntegrationOptionsInternal,
} from "./types/integration";

/**
 * Creates the base i18next configuration
 */
export function createI18nextConfig(
  options: IntegrationOptionsInternal
): Partial<I18nBaseConfig> {
  return {
    lng: options.defaultLocale,
    fallbackLng: options.defaultLocale,
    supportedLngs: options.locales,
    defaultNS: options.defaultNamespace,
    fallbackNS: options.defaultNamespace,
    ns: [options.defaultNamespace],
  };
}

export function mergeOptionsWithDefaults(
  options: IntegrationOptions
): IntegrationOptionsInternal {
  return {
    ...options,
    translationsDir: options.translationsDir ?? defaultOptions.translationsDir,
    generatedTypes: {
      dirPath:
        options?.generatedTypes?.dirPath ??
        defaultOptions.generatedTypes.dirPath,
      fileName:
        options?.generatedTypes?.fileName ??
        defaultOptions.generatedTypes.fileName,
    },
  };
}

export const defaultOptions: DefaultIntegrationOptions = {
  generatedTypes: {
    dirPath: "types",
    fileName: "i18next-resources",
  },
  translationsDir: "i18n",
};
