import i18next from "i18next";
import { IntegrationOptions } from "../client";
import { INTEGRATION_NAME } from "../constants";

/**
 * Retrieves the current locale configuration for the astro-i18next integration.
 *
 * This function provides access to the locale configuration in both SSG (Static Site Generation)
 * and SPA (Single Page Application) modes. The configuration is automatically injected during
 * the build process and stored globally for runtime access.
 *
 * @returns {LocaleConfig} The locale configuration object containing:
 *   - `locales`: Array of all supported locale codes (e.g., ['en', 'fr', 'es'])
 *   - `defaultLocale`: The default locale code (e.g., 'en')
 *   - `prefixDefaultLocale`: Whether to include the default locale in URLs
 *
 * @throws {Error} Throws an error if the configuration is not available, which typically
 *   indicates that the astro-i18next integration is not properly configured.
 *
 * @since 0.1.5
 */
export function getLocaleConfig(): IntegrationOptions {
  if (!i18next.options.integrationOptions) {
    throw new Error(`[${INTEGRATION_NAME}] Configuration object empty.`);
  }

  return JSON.parse(
    JSON.stringify(i18next.options.integrationOptions)
  ) as typeof i18next.options.integrationOptions;
}
