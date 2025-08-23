import type { IntegrationOptionsInternal } from "../types/integration";
import type { TranslationMap } from "../types/translations";
import type { InitOptions } from "i18next";

/**
 * Generates an inline script for SSG pages that serializes all possible translations
 * This runs immediately when the HTML loads, before React hydration
 */
export function generateSSGSerializationScript(
  baseConfig: Partial<InitOptions>,
  allTranslations: TranslationMap,
  _internalOptions: IntegrationOptionsInternal
): string {
  // For SSG, we need to be more aggressive and serialize more data upfront
  // since we can't track usage during runtime

  const supportedLanguages =
    baseConfig.supportedLngs || Object.keys(allTranslations);
  const defaultNamespace = baseConfig.defaultNS || "translation";
  const namespaces = baseConfig.ns || [defaultNamespace];

  return `
    // CRITICAL: Detect language from current URL/HTML for SSG pages
    (function() {
      const detectSSGLanguage = function() {
        // Try path-based detection first  
        const pathMatch = window.location.pathname.match(/^\\/([a-z]{2}(?:-[A-Z]{2})?)/);
        if (pathMatch) {
          const detectedLang = pathMatch[1];
          const supportedLangs = ${JSON.stringify(supportedLanguages)};
          if (supportedLangs.includes(detectedLang)) {
            return detectedLang;
          }
        }

        // Try HTML lang attribute
        const htmlLang = document.documentElement.lang;
        if (htmlLang) {
          const supportedLangs = ${JSON.stringify(supportedLanguages)};
          if (supportedLangs.includes(htmlLang)) {
            return htmlLang;
          }
        }

        // Fallback to default
        return "${baseConfig.lng || supportedLanguages[0]}";
      };

      const currentLanguage = detectSSGLanguage();
      const allTranslations = ${JSON.stringify(allTranslations)};
      const expectedNamespaces = ${JSON.stringify(namespaces)};

      // Extract resources for the detected language and expected namespaces
      const ssgResources = {};
      if (allTranslations[currentLanguage]) {
        ssgResources[currentLanguage] = {};
        expectedNamespaces.forEach(function(ns) {
          if (allTranslations[currentLanguage][ns]) {
            ssgResources[currentLanguage][ns] = allTranslations[currentLanguage][ns];
          }
        });
      }

      // Serialize for synchronous client access
      window.__initialI18nStore__ = ssgResources;
      window.__initialLanguage__ = currentLanguage;
    })();
  `;
}
