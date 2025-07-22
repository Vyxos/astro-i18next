import type { I18nBaseConfig, TranslationMap } from "./types";

/**
 * Generates the server-side initialization script
 */
export function generateServerScript(
  baseConfig: I18nBaseConfig,
  allTranslations: TranslationMap
): string {
  return `
    import i18next from "i18next";
    
    const resources = ${JSON.stringify(allTranslations)};
    
    i18next.init({
      ...${JSON.stringify(baseConfig)},
      resources,
      initImmediate: false
    }).catch(err => console.error('[i18next] Server initialization failed:', err));
  `;
}

/**
 * Generates the client-side initialization script
 */
export function generateClientScript(baseConfig: I18nBaseConfig): string {
  return `
    import i18next from "i18next";
    import LanguageDetector from "i18next-browser-languagedetector";
    import { loadTranslation } from "virtual:i18n-loader";
    
    const customBackend = {
      type: 'backend',
      init: function() {},
      read: function(language, namespace, callback) {
        try {
          const data = loadTranslation(language, namespace);
          callback(null, data);
        } catch (err) {
          callback(err, null);
        }
      }
    };
    
    i18next
      .use(LanguageDetector)
      .use(customBackend)
      .init({
        ...${JSON.stringify(baseConfig)},
        initImmediate: false,
        detection: {
          order: ["htmlTag", "path"],
          lookupFromPathIndex: 0,
          caches: []
        },
        load: 'currentOnly',
        partialBundledLanguages: true
      })
      .catch(err => console.error('[i18next] Client initialization failed:', err));
  `;
}
