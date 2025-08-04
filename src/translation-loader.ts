import { existsSync, readFileSync } from "fs";
import { resolve } from "pathe";
import { logError, logWarn } from "./logger";
import { IntegrationOptionsInternal } from "./types/integration";
import type {
  LocaleFileData,
  TranslationContent,
  TranslationMap,
} from "./types/translations";

/**
 * Loads a translation file for a specific locale and namespace
 */
export function loadTranslation(filePath: string): TranslationContent {
  if (!existsSync(filePath)) {
    logWarn(`Translation file not found: ${filePath}`);
    return {};
  }

  try {
    const content = readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(content) as string;

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      logError(
        `Invalid translation file format: ${filePath}\n` +
          `Expected JSON object, got ${typeof parsed}`
      );
      return {};
    }

    return parsed;
  } catch (error) {
    logError(
      `Failed to parse translation file: ${filePath}. Original error: ${error instanceof Error ? error.message : String(error)}`
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
  const localeFilesData = getAllFilePaths(srcDir, options);

  for (const data of localeFilesData) {
    if (allTranslations[data.locale] === undefined) {
      allTranslations[data.locale] = {};
    }

    allTranslations[data.locale][data.namespace] = loadTranslation(data.path);
  }

  return allTranslations;
}

export function getAllFilePaths(
  srcDir: string,
  options: IntegrationOptionsInternal
) {
  const filePaths: LocaleFileData[] = [];

  for (const locale of options.locales) {
    for (const namespace of options.namespaces) {
      const filePath = getFilePath(
        locale,
        namespace,
        srcDir,
        options.translationsDir
      );

      filePaths.push({ path: filePath, locale, namespace });
    }
  }

  return filePaths;
}

export function getFilePath(
  locale: string,
  namespace: string,
  srcDir: string,
  translationDirectoryPath: string
) {
  return resolve(
    srcDir,
    translationDirectoryPath,
    `${locale}/${namespace}.json`
  );
}
