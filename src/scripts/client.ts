import { INTEGRATION_NAME } from "../constants";
import {
  I18nBaseConfig,
  IntegrationOptionsInternal,
} from "../types/integration";

/**
 * Generates the client-side initialization script with on-demand loading
 */
export function generateClientScript(
  baseConfig: Partial<I18nBaseConfig>,
  options: IntegrationOptionsInternal
): string {
  return `
    import i18next from "i18next";
    import LanguageDetector from "i18next-browser-languagedetector";
    
    const dynamicBackend = {
      type: 'backend',
      init: function() {},
      read: async function(language, namespace, callback) {
        try {
          const { loadTranslation } = await import('virtual:i18n-loader');
          const data = await loadTranslation(language, namespace);
          callback(null, data);
        } catch (err) {
          console.warn(\`[${INTEGRATION_NAME}] Failed to load \${language}/\${namespace}:\`, err);
          callback(null, {});
        }
      }
    };
    
    window.__i18nLoadNamespaces = async function(namespaces) {
      const currentLang = i18next.language || '${baseConfig.lng}';
      const promises = namespaces.map(ns => 
        new Promise((resolve) => {
          if (i18next.hasResourceBundle(currentLang, ns)) {
            resolve(null);
          } else {
            i18next.loadNamespaces(ns, resolve);
          }
        })
      );
      await Promise.all(promises);
    };
    
    i18next
      .use(LanguageDetector)
      .use(dynamicBackend)
      .init({
        ...${JSON.stringify(baseConfig)},
        initImmediate: true,
        detection: {
          order: ["htmlTag", "path"],
          lookupFromPathIndex: 0,
          caches: []
        },
        load: 'currentOnly',
        partialBundledLanguages: true,
        ns: [], 
        defaultNS: false,
        integrationOptions: ${JSON.stringify(options)}
      })
      .catch(err => console.error('[${INTEGRATION_NAME}] Client initialization failed:', err));
  `;
}
