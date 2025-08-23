import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { resolve } from "pathe";
import { logError, logWarn } from "../logger";
import {
  IntegrationOptions,
  IntegrationOptionsInternal,
} from "../types/integration";
import type {
  LocaleFileData,
  TranslationContent,
  TranslationMap,
} from "../types/translations";

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
  internalOptions: IntegrationOptionsInternal,
  i18nextOptions: IntegrationOptions["i18NextOptions"]
): TranslationMap {
  const allTranslations: TranslationMap = {};
  const localeFilesData = getAllFilePaths(
    srcDir,
    internalOptions,
    i18nextOptions
  );

  for (const data of localeFilesData) {
    if (allTranslations[data.locale] === undefined) {
      allTranslations[data.locale] = {};
    }

    allTranslations[data.locale][data.namespace] = loadTranslation(data.path);
  }

  return allTranslations;
}

/**
 * Recursively scans a directory for JSON translation files
 */
function scanDirectoryRecursively(
  currentPath: string,
  localeBasePath: string,
  locale: string,
  filePaths: LocaleFileData[]
): void {
  try {
    const entries = readdirSync(currentPath);

    for (const entry of entries) {
      const entryPath = resolve(currentPath, entry);
      const stats = statSync(entryPath);

      if (stats.isDirectory()) {
        // Recursively scan subdirectories
        scanDirectoryRecursively(entryPath, localeBasePath, locale, filePaths);
      } else if (entry.endsWith(".json")) {
        // Calculate the namespace from the relative path
        // e.g., if file is at locale/features/dashboard.json
        // the namespace should be "features.dashboard"
        const relativePath = entryPath.substring(localeBasePath.length + 1);
        const pathParts = relativePath.split(/[/\\]/);

        // Remove .json extension from the last part
        pathParts[pathParts.length - 1] = pathParts[
          pathParts.length - 1
        ].replace(".json", "");

        // Join with dots to create the namespace
        const namespace = pathParts.join(".");

        filePaths.push({ path: entryPath, locale, namespace });
      }
    }
  } catch (_error) {
    logWarn(`Failed to scan directory: ${currentPath}`);
  }
}

export function getAllFilePaths(
  srcDir: string,
  internalOptions: IntegrationOptionsInternal,
  i18nextOptions: IntegrationOptions["i18NextOptions"]
) {
  const filePaths: LocaleFileData[] = [];

  if (
    i18nextOptions.supportedLngs === false ||
    i18nextOptions.supportedLngs === undefined
  ) {
    const translationDirPath = resolve(srcDir, internalOptions.translationsDir);

    if (!existsSync(translationDirPath)) {
      return filePaths;
    }

    try {
      const localeEntries = readdirSync(translationDirPath);

      for (const localeEntry of localeEntries) {
        const localeDir = resolve(translationDirPath, localeEntry);

        if (statSync(localeDir).isDirectory()) {
          const locale = localeEntry;

          // Recursively scan for JSON files with support for nested directories
          scanDirectoryRecursively(localeDir, localeDir, locale, filePaths);
        }
      }
    } catch (_error) {
      logError(`Failed to scan translation directory: ${translationDirPath}`);
      return filePaths;
    }

    return filePaths;
  }

  // Handle array supportedLngs (including empty arrays)
  if (Array.isArray(i18nextOptions.supportedLngs)) {
    // If namespaces are not explicitly configured, discover them from the file system
    let namespaces: string[] = [];

    if (i18nextOptions.ns === undefined) {
      // Try to discover namespaces from the file system for each locale
      const translationDirPath = resolve(
        srcDir,
        internalOptions.translationsDir
      );
      const discoveredNamespaces = new Set<string>();

      for (const locale of i18nextOptions.supportedLngs) {
        const localeDir = resolve(translationDirPath, locale);
        if (existsSync(localeDir) && statSync(localeDir).isDirectory()) {
          const tempFilePaths: LocaleFileData[] = [];
          scanDirectoryRecursively(localeDir, localeDir, locale, tempFilePaths);
          tempFilePaths.forEach(({ namespace }) =>
            discoveredNamespaces.add(namespace)
          );
        }
      }

      namespaces = Array.from(discoveredNamespaces);

      // If no namespaces discovered, use default
      if (namespaces.length === 0) {
        namespaces = ["translation"]; // i18next default
      }
    } else if (typeof i18nextOptions.ns === "string") {
      namespaces = [i18nextOptions.ns];
    } else if (Array.isArray(i18nextOptions.ns)) {
      namespaces = i18nextOptions.ns;
    }

    for (const locale of i18nextOptions.supportedLngs) {
      for (const namespace of namespaces) {
        const filePath = getFilePath(
          locale,
          namespace,
          srcDir,
          internalOptions.translationsDir
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
  // Handle nested namespaces with dot notation
  // e.g., "features.dashboard" becomes "features/dashboard.json"
  const namespacePath = namespace.replace(/\./g, "/");

  return resolve(
    srcDir,
    translationDirectoryPath,
    `${locale}/${namespacePath}.json`
  );
}

/**
 * Checks if a directory contains JSON files (recursively)
 */
function hasJsonFilesRecursively(dirPath: string): boolean {
  try {
    const entries = readdirSync(dirPath);

    for (const entry of entries) {
      const entryPath = resolve(dirPath, entry);
      const stats = statSync(entryPath);

      if (stats.isDirectory()) {
        // Recursively check subdirectories
        if (hasJsonFilesRecursively(entryPath)) {
          return true;
        }
      } else if (entry.endsWith(".json")) {
        return true;
      }
    }

    return false;
  } catch {
    return false;
  }
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
        // Verify this locale directory contains at least one .json file (checking recursively)
        if (hasJsonFilesRecursively(localeDir)) {
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
