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
    const usedNamespaces = new Set();
    
    i18next.init({
      ...${JSON.stringify(baseConfig)},
      resources,
      initImmediate: true,
      integrationOptions: ${JSON.stringify({ ...internalOptions, ...i18nextOptions })}
    }).then(() => {
      // Track namespace usage during SSR
      const originalT = i18next.t;
      i18next.t = function(...args) {
        const key = args[0];
        const lastArg = args[args.length - 1];
        const options = typeof lastArg === 'object' && lastArg !== null ? lastArg : undefined;
        
        let namespace;
        if (typeof key === 'string' && key.includes(':')) {
          namespace = key.split(':')[0];
        } else if (options && 'ns' in options && typeof options.ns === 'string') {
          namespace = options.ns;
        } else {
          namespace = '${baseConfig.defaultNS || "translation"}';
        }
        
        if (namespace) {
          usedNamespaces.add(namespace);
        }
        
        return originalT.apply(this, args);
      };
      
      // CRITICAL: Serialize exact server state for client hydration
      if (typeof window !== 'undefined') {
        const currentLang = i18next.language;
        
        // Extract ONLY the resources that were actually used during SSR
        const usedResources = {};
        usedNamespaces.forEach(ns => {
          if (resources[currentLang] && resources[currentLang][ns]) {
            if (!usedResources[currentLang]) usedResources[currentLang] = {};
            usedResources[currentLang][ns] = resources[currentLang][ns];
          }
        });
        
        // Serialize for synchronous client initialization (react-i18next SSR pattern)
        window.__initialI18nStore__ = usedResources;
        window.__initialLanguage__ = currentLang;
      }
    }).catch(err => console.error('[${INTEGRATION_NAME}] Server initialization failed:', err));
  `;
}
