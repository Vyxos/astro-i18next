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
 * Complete internal configuration with defaults applied.
 * This represents the fully resolved internal configuration state.
 */
export type IntegrationOptionsInternal = Required<InternalKeys>;

/**
 * User-facing integration options as defined in astro.config.mjs.
 * Only requires translationsDir and generatedTypes, with all i18next options in i18NextOptions.
 */
export type IntegrationOptions = Partial<InternalKeys> & {
  /** i18next configuration options */
  i18NextOptions: InitOptions;
};

/**
 * Default values configuration for internal keys only.
 * i18next options are always required from the user configuration.
 */
export type DefaultIntegrationOptions = Required<InternalKeys>;
