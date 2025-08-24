import i18next from "i18next";
import { INTEGRATION_NAME } from "../constants";
import {
  IntegrationOptions,
  IntegrationOptionsInternal,
} from "../types/integration";

/**
 * Retrieves the current configuration for the astro-i18next integration.
 *
 * This function provides access to the merged configuration (internal + i18next options)
 * in both SSG (Static Site Generation) and SPA (Single Page Application) modes.
 * The configuration is automatically injected during the build process and stored globally for runtime access.
 *
 * @returns The merged configuration object containing both internal options and i18next options
 *
 * @throws {Error} Throws an error if the configuration is not available, which typically
 *   indicates that the astro-i18next integration is not properly configured.
 *
 * @since 0.1.5
 */
export function getConfig(): IntegrationOptionsInternal &
  IntegrationOptions["i18NextOptions"] {
  if (!i18next.options.integrationOptions) {
    throw new Error(`[${INTEGRATION_NAME}] Configuration object empty.`);
  }

  return JSON.parse(
    JSON.stringify(i18next.options.integrationOptions)
  ) as typeof i18next.options.integrationOptions;
}

export { getGlobalObject } from "./browser-helpers";
