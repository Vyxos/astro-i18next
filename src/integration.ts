import type { AstroIntegration } from "astro";
import { createI18nextConfig, mergeOptionsWithDefaults } from "./config";
import { INTEGRATION_NAME } from "./constants";
import { generateClientScript } from "./scripts/client";
import { generateServerScript } from "./scripts/server";
import { loadAllTranslations } from "./translation-loader";
import type { IntegrationOptions } from "./types/integration";
import { validateOptions } from "./validation";
import { createI18nVitePlugin } from "./vite-plugin";

/**
 * Creates an Astro integration for i18next internationalization
 */
export function i18nIntegration(options: IntegrationOptions): AstroIntegration {
  return {
    name: INTEGRATION_NAME,
    hooks: {
      "astro:config:setup": async ({ config, injectScript, updateConfig }) => {
        try {
          validateOptions(options);
          const safeOptions = mergeOptionsWithDefaults(options);

          const baseConfig = createI18nextConfig(safeOptions);
          const allTranslations = loadAllTranslations(
            config.srcDir.pathname,
            safeOptions
          );

          updateConfig({
            vite: {
              plugins: [
                createI18nVitePlugin(safeOptions, config.srcDir.pathname),
              ],
            },
          });

          injectScript(
            "page-ssr",
            generateServerScript(baseConfig, allTranslations, safeOptions)
          );
          injectScript(
            "before-hydration",
            generateClientScript(baseConfig, safeOptions)
          );
        } catch (error) {
          if (error instanceof Error) {
            throw new Error(
              `[${INTEGRATION_NAME}] Configuration error: ${error.message}`
            );
          }
          throw error;
        }
      },
    },
  };
}
