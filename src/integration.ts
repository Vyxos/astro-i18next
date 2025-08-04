import type { AstroIntegration } from "astro";
import { createI18nextConfig, mergeOptionsWithDefaults } from "./config";
import { INTEGRATION_NAME } from "./constants";
import { generateClientScript } from "./scripts/client";
import { generateServerScript } from "./scripts/server";
import { getAllFilePaths, loadAllTranslations } from "./translation-loader";
import type { IntegrationOptions } from "./types/integration";
import { generateTypescriptDefinitions } from "./utils/type-generation";
import { validateOptions } from "./validation";
import { createI18nVitePlugin } from "./vite-plugin";

/**
 * Creates an Astro integration for i18next internationalization
 */
export function i18nIntegration(options: IntegrationOptions): AstroIntegration {
  return {
    name: INTEGRATION_NAME,
    hooks: {
      "astro:config:setup": async ({
        config,
        injectScript,
        addWatchFile,
        updateConfig,
        addMiddleware,
      }) => {
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
                createI18nVitePlugin(config.srcDir.pathname, safeOptions),
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

          generateTypescriptDefinitions(
            allTranslations,
            config.srcDir.pathname,
            safeOptions
          );

          addMiddleware({
            entrypoint: `${INTEGRATION_NAME}/middleware`,
            order: "post",
          });

          const translationsData = getAllFilePaths(
            config.srcDir.pathname,
            safeOptions
          );

          translationsData.forEach(({ path }) => addWatchFile(path));
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
