import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { loadTranslation, loadAllTranslations } from "../translation-loader";
import type { IntegrationOptions } from "../types";

describe("loadTranslation", () => {
  const testDir = "./test-translations";

  beforeEach(() => {
    mkdirSync(`${testDir}/en`, { recursive: true });
    writeFileSync(
      `${testDir}/en/common.json`,
      JSON.stringify({ hello: "Hello", nested: { key: "value" } })
    );
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("should load existing translation", () => {
    const result = loadTranslation(".", testDir, "en", "common");
    expect(result).toEqual({ hello: "Hello", nested: { key: "value" } });
  });

  it("should return empty object for missing file", () => {
    const result = loadTranslation(".", testDir, "sk", "common");
    expect(result).toEqual({});
  });

  it("should handle invalid JSON gracefully", () => {
    writeFileSync(`${testDir}/en/invalid.json`, "invalid json");
    const result = loadTranslation(".", testDir, "en", "invalid");
    expect(result).toEqual({});
  });

  it("should handle non-object JSON gracefully", () => {
    writeFileSync(`${testDir}/en/array.json`, '["not", "an", "object"]');
    const result = loadTranslation(".", testDir, "en", "array");
    expect(result).toEqual({});
  });

  it("should handle null JSON gracefully", () => {
    writeFileSync(`${testDir}/en/null.json`, "null");
    const result = loadTranslation(".", testDir, "en", "null");
    expect(result).toEqual({});
  });
});

describe("loadAllTranslations", () => {
  const testDir = "./test-all-translations";
  const options: IntegrationOptions = {
    locales: ["en", "sk"],
    defaultLocale: "en",
    namespaces: ["common", "auth"],
    defaultNamespace: "common",
    translationsDir: testDir,
    translationsPattern: "{{lng}}/{{ns}}.json",
  };

  beforeEach(() => {
    mkdirSync(`${testDir}/en`, { recursive: true });
    mkdirSync(`${testDir}/sk`, { recursive: true });

    writeFileSync(
      `${testDir}/en/common.json`,
      JSON.stringify({ hello: "Hello" })
    );
    writeFileSync(
      `${testDir}/en/auth.json`,
      JSON.stringify({ login: "Login" })
    );
    writeFileSync(
      `${testDir}/sk/common.json`,
      JSON.stringify({ hello: "Ahoj" })
    );
    writeFileSync(
      `${testDir}/sk/auth.json`,
      JSON.stringify({ login: "Prihlásiť" })
    );
  });

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true });
  });

  it("should load all translations", () => {
    const result = loadAllTranslations(".", options);

    expect(result).toEqual({
      en: {
        common: { hello: "Hello" },
        auth: { login: "Login" },
      },
      sk: {
        common: { hello: "Ahoj" },
        auth: { login: "Prihlásiť" },
      },
    });
  });
});
