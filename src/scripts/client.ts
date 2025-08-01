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
        fallbackLng: false,
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
      }).then(() => {
        const originalT = i18next.t;

        i18next.t = function (...args) {
          const key = args[0];
          const lastArg = args[args.length - 1];
          const options = typeof lastArg === 'object' && lastArg !== null ? lastArg : undefined;
          let namespace;

          if (typeof key === 'string' && key.includes(':')) {
            namespace = key.split(':')[0];
          } else if (options && 'ns' in options && typeof options.ns === 'string') {
            namespace = options.ns;
          }

          if (namespace) {
            const currentLanguage = i18next.language;
            if (!i18next.hasResourceBundle(currentLanguage, namespace)) {
              console.warn(
                \`[${INTEGRATION_NAME}] Warning: Translation key "\${String(key)}" is being accessed \` +
                \`for namespace "\${namespace}" in locale "\${currentLanguage}", \` +
                \`but this namespace is not currently loaded. Ensure '\${namespace}' is loaded \` +
                \`using 'loadNamespacesForRoute' or 'useLoadNamespaces'.\`
              );
            }
          }

          return originalT.apply(this, args);
        };
      })
      .catch(err => console.error('[${INTEGRATION_NAME}] Client initialization failed:', err));
  `;
}
