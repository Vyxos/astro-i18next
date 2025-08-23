import {
  IntegrationOptionsInternal,
  IntegrationOptions,
} from "../types/integration";
import type { InitOptions } from "i18next";

/**
 * Generates the client-side initialization script with SSR hydration support
 */
export function generateClientScript(
  baseConfig: Partial<InitOptions>,
  internalOptions: IntegrationOptionsInternal,
  i18nextOptions: IntegrationOptions["i18NextOptions"]
): string {
  return `
    import i18next from "i18next";
    import LanguageDetector from "i18next-browser-languagedetector";
    
    // CRITICAL: Read server state synchronously (react-i18next SSR pattern)
    const initialI18nStore = typeof window !== 'undefined' ? window.__initialI18nStore__ : null;
    const initialLanguage = typeof window !== 'undefined' ? window.__initialLanguage__ : null;
    
    if (initialI18nStore && initialLanguage) {
      // SYNCHRONOUS initialization with exact server resources
      i18next.init({
        ...${JSON.stringify(baseConfig)},
        lng: initialLanguage,
        resources: initialI18nStore,
        initImmediate: false,  // CRITICAL: Synchronous initialization
        fallbackLng: false,
        integrationOptions: ${JSON.stringify({ ...internalOptions, ...i18nextOptions })}
      }).then(() => {
        setupTranslationWrapper();
        setupDynamicLoading();
      }).catch(err => console.error('[ASTRO-I18N] SSR hydration initialization failed:', err));
      
    } else {
      // Fallback: Dynamic loading for non-SSR or missing server data
      const dynamicBackend = {
        type: 'backend',
        init: function() {},
        read: async function(language, namespace, callback) {
          try {
            const { loadTranslation } = await import('virtual:i18n-loader');
            const data = await loadTranslation(language, namespace);
            callback(null, data);
          } catch (err) {
            console.warn(\`Failed to load \${language}/\${namespace}:\`, err);
            callback(null, {});
          }
        }
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
          integrationOptions: ${JSON.stringify({ ...internalOptions, ...i18nextOptions })}
        }).then(() => {
          setupTranslationWrapper();
          setupDynamicLoading();
        }).catch(err => console.error('Dynamic initialization failed:', err));
    }
    
    // Setup translation wrapper with dev warnings
    function setupTranslationWrapper() {
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

        if (import.meta.env.DEV && namespace) {
          const currentLanguage = i18next.language;
          if (!i18next.hasResourceBundle(currentLanguage, namespace)) {
            console.warn(
              \`Warning: Translation key "\${String(key)}" is being accessed \` +
              \`for namespace "\${namespace}" in locale "\${currentLanguage}", \` +
              \`but this namespace is not currently loaded. Ensure '\${namespace}' is loaded \` +
              \`using 'loadNamespacesForRoute' or 'useLoadNamespaces'.\`
            );
          }
        }

        return originalT.apply(this, args);
      };
    }
    
    // Setup dynamic loading functions for SPA navigation
    function setupDynamicLoading() {
      window.__i18nLoadNamespaces = async function(namespaces) {
        const currentLang = i18next.language${baseConfig.lng ? ` || '${baseConfig.lng}'` : ""};
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
    }
  `;
}
