import type { AstroIntegration } from "astro";
import { createBaseConfig } from "./config";
import { generateClientScript, generateServerScript } from "./scripts";
import { loadAllTranslations } from "./translation-loader";
import type { IntegrationOptions } from "./types";
import { validateOptions } from "./validation";
import { createI18nVitePlugin } from "./vite-plugin";

/**
 * Creates an Astro integration for i18next internationalization
 */
export function i18nIntegration(options: IntegrationOptions): AstroIntegration {
  return {
    name: "astro-i18next",
    hooks: {
      "astro:config:setup": async ({ config, injectScript, updateConfig }) => {
        try {
          validateOptions(options);

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
            generateServerScript(baseConfig, allTranslations, options)
          );
          injectScript(
            "before-hydration",
            generateClientScript(baseConfig, options)
          );
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(
              `[astro-i18next] Configuration error: ${error.message}`
            );
          }
          throw error;
        }
      },
    },
  };
}
