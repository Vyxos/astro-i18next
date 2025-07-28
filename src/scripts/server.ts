import { INTEGRATION_NAME } from "../constants";
import type { I18nBaseConfig, IntegrationOptions } from "../types/integration";
import type { TranslationMap } from "../types/translations";

/**
 * Generates the server-side initialization script
 */
export function generateServerScript(
  baseConfig: Partial<I18nBaseConfig>,
  allTranslations: TranslationMap,
  options: IntegrationOptions
): string {
  return `
    import i18next from "i18next";
    
    const resources = ${JSON.stringify(allTranslations)};
    
    i18next.init({
      ...${JSON.stringify(baseConfig)},
      resources,
      initImmediate: true,
      integrationOptions: ${JSON.stringify(options)}
    }).catch(err => console.error('[${INTEGRATION_NAME}] Server initialization failed:', err));
  `;
}
