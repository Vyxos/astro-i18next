import type {
  DefaultIntegrationOptions,
  IntegrationOptions,
} from "./types/integration";
import type { InitOptions } from "i18next";

/**
 * Creates the base i18next configuration
 */
export function createI18nextConfig(
  i18NextOptions: IntegrationOptions["i18NextOptions"]
): Partial<InitOptions> {
  return i18NextOptions;
}

export function applyInternalDefaults(options: IntegrationOptions) {
  return {
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
