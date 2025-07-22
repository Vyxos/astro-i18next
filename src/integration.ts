import type { AstroIntegration } from "astro";
import type { IntegrationOptions } from "./types";
import { loadAllTranslations } from "./translation-loader";
import { createBaseConfig } from "./config";
import { createI18nVitePlugin } from "./vite-plugin";
import { generateServerScript, generateClientScript } from "./scripts";

/**
 * Creates an Astro integration for i18next internationalization
 */
export function i18nIntegration(options: IntegrationOptions): AstroIntegration {
  return {
    name: "astro-i18next",
    hooks: {
      "astro:config:setup": async ({ config, injectScript, updateConfig }) => {
        const baseConfig = createBaseConfig(options);
        const allTranslations = loadAllTranslations(
          config.srcDir.pathname,
          options
        );

        updateConfig({
          vite: {
            plugins: [createI18nVitePlugin(options, config.srcDir.pathname)],
          },
        });

        injectScript(
          "page-ssr",
          generateServerScript(baseConfig, allTranslations)
        );
        injectScript("before-hydration", generateClientScript(baseConfig));
      },
    },
  };
}
