import { existsSync, readFileSync, readdirSync, statSync } from "fs";
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

  if (options.supportedLngs === false || options.supportedLngs === undefined) {
    const translationDirPath = resolve(srcDir, options.translationsDir);

    if (!existsSync(translationDirPath)) {
      return filePaths;
    }

    try {
      const localeEntries = readdirSync(translationDirPath);

      for (const localeEntry of localeEntries) {
        const localeDir = resolve(translationDirPath, localeEntry);

        if (statSync(localeDir).isDirectory()) {
          const locale = localeEntry;

          const translationFiles = readdirSync(localeDir);

          for (const file of translationFiles) {
            if (file.endsWith(".json")) {
              const namespace = file.replace(".json", "");
              const filePath = resolve(localeDir, file);
              filePaths.push({ path: filePath, locale, namespace });
            }
          }
        }
      }
    } catch (_error) {
      logError(`Failed to scan translation directory: ${translationDirPath}`);
      return filePaths;
    }

    return filePaths;
  }

  // Handle array supportedLngs (including empty arrays)
  if (Array.isArray(options.supportedLngs)) {
    for (const locale of options.supportedLngs) {
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

/**
 * Discovers all available languages in the translations directory
 */
export function discoverAvailableLanguages(
  srcDir: string,
  translationsDir: string
): string[] {
  const translationDirPath = resolve(srcDir, translationsDir);

  if (!existsSync(translationDirPath)) {
    logWarn(`Translation directory not found: ${translationDirPath}`);
    return [];
  }

  try {
    const localeEntries = readdirSync(translationDirPath);
    const availableLocales: string[] = [];

    for (const localeEntry of localeEntries) {
      const localeDir = resolve(translationDirPath, localeEntry);

      if (statSync(localeDir).isDirectory()) {
        // Verify this locale directory contains at least one .json file
        const translationFiles = readdirSync(localeDir);
        const hasJsonFiles = translationFiles.some((file) =>
          file.endsWith(".json")
        );

        if (hasJsonFiles) {
          availableLocales.push(localeEntry);
        }
      }
    }

    return availableLocales;
  } catch (_error) {
    logError(`Failed to scan translation directory: ${translationDirPath}`);
    return [];
  }
}
