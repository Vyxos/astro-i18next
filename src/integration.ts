import type { AstroIntegration } from "astro";
import { applyInternalDefaults } from "./config";
import { INTEGRATION_NAME } from "./constants";
import {
  getAllFilePaths,
  loadAllTranslations,
} from "./loader/translation-loader";
import { generateClientScript } from "./scripts/client";
import { generateServerScript } from "./scripts/server";
import { generateSSGSerializationScript } from "./scripts/ssg";
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
          const internalOptions = applyInternalDefaults(options);

          const allTranslations = loadAllTranslations(
            config.srcDir.pathname,
            internalOptions,
            options.i18NextOptions
          );

          updateConfig({
            vite: {
              plugins: [
                createI18nVitePlugin(
                  config.srcDir.pathname,
                  internalOptions,
                  options.i18NextOptions
                ),
              ],
            },
          });

          injectScript(
            "page-ssr",
            generateServerScript(
              options.i18NextOptions,
              allTranslations,
              internalOptions,
              options.i18NextOptions
            )
          );

          // CRITICAL: For SSG pages, inject inline serialization script first
          injectScript(
            "head-inline",
            generateSSGSerializationScript(
              options.i18NextOptions,
              allTranslations,
              internalOptions
            )
          );

          injectScript(
            "before-hydration",
            generateClientScript(
              options.i18NextOptions,
              internalOptions,
              options.i18NextOptions
            )
          );

          generateTypescriptDefinitions(
            allTranslations,
            config.srcDir.pathname,
            internalOptions,
            options.i18NextOptions
          );

          addMiddleware({
            entrypoint: `${INTEGRATION_NAME}/middleware`,
            order: "post",
          });

          const translationsData = getAllFilePaths(
            config.srcDir.pathname,
            internalOptions,
            options.i18NextOptions
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
