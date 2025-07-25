import { IntegrationOptions } from "../types";

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
export function getConfigOptions(): IntegrationOptions {
  // Try browser environment first
  if (typeof window !== "undefined" && window.__astroI18nConfig) {
    return window.__astroI18nConfig;
  }

  // Try Node.js global environment
  if (typeof globalThis !== "undefined" && globalThis.__astroI18nConfig) {
    return globalThis.__astroI18nConfig;
  }

  // Fallback - this should not happen in a properly configured setup
  throw new Error(
    "[astro-i18next] Configuration not available. Make sure the integration is properly configured."
  );
}
