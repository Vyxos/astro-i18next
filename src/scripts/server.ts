import { INTEGRATION_NAME } from "../constants";
import type {
  IntegrationOptionsInternal,
  IntegrationOptions,
} from "../types/integration";
import type { TranslationMap } from "../types/translations";
import type { InitOptions } from "i18next";

/**
 * Generates the server-side initialization script
 */
export function generateServerScript(
  baseConfig: Partial<InitOptions>,
  allTranslations: TranslationMap,
  internalOptions: IntegrationOptionsInternal,
  i18nextOptions: IntegrationOptions["i18NextOptions"]
): string {
  return `
    import i18next from "i18next";
    
    const resources = ${JSON.stringify(allTranslations)};
    
    i18next.init({
      ...${JSON.stringify(baseConfig)},
      resources,
      initImmediate: true,
      integrationOptions: ${JSON.stringify({ ...internalOptions, ...i18nextOptions })}
    }).catch(err => console.error('[${INTEGRATION_NAME}] Server initialization failed:', err));
  `;
}
