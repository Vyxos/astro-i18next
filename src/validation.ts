import { IntegrationOptions } from "./types/integration";

export class I18nConfigError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = "I18nConfigError";
  }
}

export function validateOptions(options: IntegrationOptions): void {
  if (!options) {
    throw new I18nConfigError("Integration options are required");
  }

  const isAutoDetect =
    options.supportedLngs === false || options.supportedLngs === undefined;
  const isExplicitArray = Array.isArray(options.supportedLngs);
  const isValidFormat = isAutoDetect || isExplicitArray;

  if (!isValidFormat) {
    throw new I18nConfigError(
      "supportedLngs must be an array, false, or undefined",
      "supportedLngs"
    );
  }

  if (options.lng !== undefined && typeof options.lng !== "string") {
    throw new I18nConfigError(
      "Language (lng) must be a string if provided",
      "lng"
    );
  }

  if (
    !options.namespaces ||
    !Array.isArray(options.namespaces) ||
    options.namespaces.length === 0
  ) {
    throw new I18nConfigError(
      "At least one namespace must be specified",
      "namespaces"
    );
  }

  if (
    !options.defaultNamespace ||
    typeof options.defaultNamespace !== "string"
  ) {
    throw new I18nConfigError(
      "Default namespace is required and must be a string",
      "defaultNamespace"
    );
  }

  if (!options.namespaces.includes(options.defaultNamespace)) {
    throw new I18nConfigError(
      `Default namespace "${options.defaultNamespace}" must be included in namespaces array`,
      "defaultNamespace"
    );
  }

  if (!options.translationsDir || typeof options.translationsDir !== "string") {
    throw new I18nConfigError(
      "Translations directory is required and must be a string",
      "translationsDir"
    );
  }
}
