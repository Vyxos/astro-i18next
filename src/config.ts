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
  options: IntegrationOptionsInternal,
  i18NextOptions?: IntegrationOptions["i18NextOptions"]
): Partial<I18nBaseConfig> {
  const baseConfig = {
    lng: options.defaultLocale,
    fallbackLng: options.defaultLocale,
    supportedLngs: options.supportedLngs,
    defaultNS: options.defaultNamespace,
    fallbackNS: options.defaultNamespace,
    ns: [options.defaultNamespace],
  };

  return {
    ...i18NextOptions,
    ...baseConfig,
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
