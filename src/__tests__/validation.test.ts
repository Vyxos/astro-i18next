import { describe, expect, it } from "vitest";
import type { IntegrationOptions } from "../types";
import { I18nConfigError, validateOptions } from "../validation";

describe("validateOptions", () => {
  const validOptions: IntegrationOptions = {
    locales: ["en", "sk"],
    defaultLocale: "en",
    namespaces: ["common", "auth"],
    defaultNamespace: "common",
    translationsDir: "src/translations",
    translationsPattern: "{{lng}}/{{ns}}.json",
  };

  it("should pass with valid options", () => {
    expect(() => validateOptions(validOptions)).not.toThrow();
  });

  it("should throw when no options provided", () => {
    expect(() => validateOptions(null as any as IntegrationOptions)).toThrow(
      I18nConfigError
    );
    expect(() =>
      validateOptions(undefined as any as IntegrationOptions)
    ).toThrow(I18nConfigError);
  });

  it("should throw when no locales provided", () => {
    const options = { ...validOptions, locales: [] };
    expect(() => validateOptions(options)).toThrow(I18nConfigError);
  });

  it("should throw when locales is not an array", () => {
    const options = { ...validOptions, locales: "en" as any };
    expect(() => validateOptions(options)).toThrow(I18nConfigError);
  });

  it("should throw when default locale not in locales", () => {
    const options = { ...validOptions, defaultLocale: "de" };
    expect(() => validateOptions(options)).toThrow(
      'Default locale "de" must be included in locales array'
    );
  });

  it("should throw when default namespace not in namespaces", () => {
    const options = { ...validOptions, defaultNamespace: "missing" };
    expect(() => validateOptions(options)).toThrow(
      'Default namespace "missing" must be included in namespaces array'
    );
  });

  it("should throw for invalid locale format", () => {
    const options = { ...validOptions, locales: ["en", "invalid_locale"] };
    expect(() => validateOptions(options)).toThrow(
      "Invalid locale format: invalid_locale"
    );
  });

  it("should throw for invalid namespace format", () => {
    const options = {
      ...validOptions,
      namespaces: ["common", "invalid@namespace"],
    };
    expect(() => validateOptions(options)).toThrow(
      "Invalid namespace format: invalid@namespace"
    );
  });

  it("should accept valid locale formats", () => {
    const options = { ...validOptions, locales: ["en", "en-US", "sk-SK"] };
    expect(() => validateOptions(options)).not.toThrow();
  });

  it("should accept valid namespace formats", () => {
    const options = {
      ...validOptions,
      namespaces: ["common", "auth-forms", "user_profile"],
    };
    expect(() => validateOptions(options)).not.toThrow();
  });
});
