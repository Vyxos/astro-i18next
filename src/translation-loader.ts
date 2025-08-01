import { existsSync, readFileSync } from "fs";
import { resolve } from "pathe";
import { IntegrationOptionsInternal } from "./types/integration";
import type { TranslationContent, TranslationMap } from "./types/translations";

/**
 * Loads a translation file for a specific locale and namespace
 */
export function loadTranslation(
  srcDir: string,
  translationsDir: string,
  locale: string,
  namespace: string
): TranslationContent {
  const filePath = resolve(
    srcDir,
    translationsDir,
    `${locale}/${namespace}.json`
  );

  if (!existsSync(filePath)) {
    console.warn(
      `[astro-i18next] Translation file not found: ${filePath}\n` +
        `Expected structure: ${translationsDir}/${locale}/${namespace}.json`
    );
    return {};
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content) as string;

    // Validate that the parsed content is an object
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      console.error(
        `[astro-i18next] Invalid translation file format: ${filePath}\n` +
          `Expected JSON object, got ${typeof parsed}`
      );
      return {};
    }

    return parsed;
  } catch (error) {
    console.error(
      `[astro-i18next] Failed to parse translation file: ${filePath}`,
      error instanceof Error ? error.message : String(error)
    );
    return {};
  }
}

/**
 * Pre-loads all translations for server-side rendering
 */
export function loadAllTranslations(
  srcDir: string,
  options: IntegrationOptionsInternal
): TranslationMap {
  const allTranslations: TranslationMap = {};

  for (const locale of options.locales) {
    allTranslations[locale] = {};
    for (const namespace of options.namespaces) {
      allTranslations[locale][namespace] = loadTranslation(
        srcDir,
        options.translationsDir,
        locale,
        namespace
      );
    }
  }

  return allTranslations;
}
