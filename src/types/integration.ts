import type { InitOptions } from "i18next";
import { GeneratedTypes } from "./internal-options";

/**
 * Internal configuration keys used exclusively within the integration logic.
 * These are not exposed to i18next and handle file system operations and type generation.
 */
export interface InternalKeys {
  /** Directory path where translation files are stored */
  translationsDir: string;

  /** Configuration for generated TypeScript type files */
  generatedTypes: GeneratedTypes;
}

/**
 * Configuration keys that are transformed and passed to i18next.
 * These define the core internationalization behavior and are used in client.ts/server.ts scripts.
 */
export interface i18NextKeys {
  /** Array of supported locale codes (e.g., ['en', 'fr', 'de']) */
  supportedLngs: InitOptions["supportedLngs"];

  /** Default locale to use when no specific locale is detected */
  defaultLocale: string;

  /** Default namespace to use for translations */
  defaultNamespace: string;

  /** Array of all available translation namespaces */
  namespaces: string[];
}

/**
 * Complete internal configuration combining both i18next and internal keys.
 * This represents the fully resolved configuration state used internally.
 */
export interface IntegrationOptionsInternal extends i18NextKeys, InternalKeys {}

/**
 * User-facing integration options as defined in astro.config.mjs.
 * Requires all i18next keys while making internal keys optional with defaults.
 */
export type IntegrationOptions = Required<i18NextKeys> &
  Partial<InternalKeys> & {
    /** Additional i18next configuration options */
    i18NextOptions?: InitOptions;
  };

/**
 * Default values configuration for internal keys only.
 * i18NextKeys are always required from the user configuration.
 */
export type DefaultIntegrationOptions = Required<InternalKeys>;

/**
 * Configuration object passed directly to i18next initialization.
 * Extends InitOptions with required properties for the integration to function.
 */
export interface I18nBaseConfig extends InitOptions {
  /** Current language code */
  lng: string;

  /** Fallback language when translation is missing */
  fallbackLng: string;

  /** Default namespace for translations */
  defaultNS: string;

  /** Fallback namespace when default namespace fails */
  fallbackNS: string;

  /** Array of loaded namespaces */
  ns: string[];
}
