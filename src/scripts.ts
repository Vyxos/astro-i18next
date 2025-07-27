import { INTEGRATION_NAME } from "./constants";
import type {
  I18nBaseConfig,
  IntegrationOptions,
  TranslationMap,
} from "./types";

/**
 * Generates the server-side initialization script
 */
export function generateServerScript(
  baseConfig: I18nBaseConfig,
  allTranslations: TranslationMap,
  options: IntegrationOptions
): string {
  return `
    import i18next from "i18next";
    
    const resources = ${JSON.stringify(allTranslations)};
    globalThis.__astroI18nConfig = ${JSON.stringify(options)};
    
    i18next.init({
      ...${JSON.stringify(baseConfig)},
      resources,
      initImmediate: false
    }).catch(err => console.error('[${INTEGRATION_NAME}] Server initialization failed:', err));
  `;
}

/**
 * Generates the client-side initialization script with on-demand loading
 */
export function generateClientScript(
  baseConfig: I18nBaseConfig,
  options: IntegrationOptions
): string {
  return `
    import i18next from "i18next";
    import LanguageDetector from "i18next-browser-languagedetector";
    window.__astroI18nConfig = ${JSON.stringify(options)};
    
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
    
    // Global namespace loader for route-based loading
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
        initImmediate: false,
        detection: {
          order: ["htmlTag", "path"],
          lookupFromPathIndex: 0,
          caches: []
        },
        load: 'currentOnly',
        partialBundledLanguages: true,
        ns: [], // Start with empty namespaces
        defaultNS: false // Disable default namespace preloading
      })
      .catch(err => console.error('[${INTEGRATION_NAME}] Client initialization failed:', err));
  `;
}
