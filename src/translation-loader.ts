import { readFileSync, existsSync } from "fs";
import { resolve } from "pathe";
import type {
  IntegrationOptions,
  TranslationContent,
  TranslationMap,
} from "./types";

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

  try {
    if (existsSync(filePath)) {
      return JSON.parse(readFileSync(filePath, "utf-8"));
    }
  } catch {
    return {};
  }

  return {};
}

/**
 * Pre-loads all translations for server-side rendering
 */
export function loadAllTranslations(
  srcDir: string,
  options: IntegrationOptions
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
