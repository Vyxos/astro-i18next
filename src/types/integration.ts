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

  /** Language to use (overrides language detection). If set to 'cimode' the output text will be the key */
  lng?: InitOptions["lng"];

  /** Fallback language when translation is missing. Can be string, string[], or false to disable fallback */
  fallbackLng?: InitOptions["fallbackLng"];

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
export type IntegrationOptions = i18NextKeys &
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
  lng: InitOptions["lng"];

  /** Fallback language when translation is missing */
  fallbackLng: InitOptions["fallbackLng"];

  /** Default namespace for translations */
  defaultNS: InitOptions["defaultNS"];

  /** Fallback namespace when default namespace fails */
  fallbackNS: InitOptions["fallbackNS"];

  /** Array of loaded namespaces */
  ns: InitOptions["ns"];
}
