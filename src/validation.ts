import { IntegrationOptions } from "./types";

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

  if (
    !options.locales ||
    !Array.isArray(options.locales) ||
    options.locales.length === 0
  ) {
    throw new I18nConfigError(
      "At least one locale must be specified",
      "locales"
    );
  }

  if (!options.defaultLocale || typeof options.defaultLocale !== "string") {
    throw new I18nConfigError(
      "Default locale is required and must be a string",
      "defaultLocale"
    );
  }

  if (!options.locales.includes(options.defaultLocale)) {
    throw new I18nConfigError(
      `Default locale "${options.defaultLocale}" must be included in locales array`,
      "defaultLocale"
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

  // Validate locale format (basic check)
  const invalidLocales = options.locales.filter(
    (locale: string) =>
      typeof locale !== "string" || !/^[a-z]{2}(-[A-Z]{2})?$/.test(locale)
  );
  if (invalidLocales.length > 0) {
    throw new I18nConfigError(
      `Invalid locale format: ${invalidLocales.join(", ")}. Use format: "en", "en-US"`,
      "locales"
    );
  }

  // Validate namespace format (no special characters that could break file paths)
  const invalidNamespaces = options.namespaces.filter(
    (ns: string) => typeof ns !== "string" || !/^[a-zA-Z0-9_-]+$/.test(ns)
  );
  if (invalidNamespaces.length > 0) {
    throw new I18nConfigError(
      `Invalid namespace format: ${invalidNamespaces.join(", ")}. Use only letters, numbers, hyphens, and underscores`,
      "namespaces"
    );
  }
}
