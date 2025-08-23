import { INTEGRATION_NAME } from "./constants";
import {
  discoverAvailableLanguages,
  getAllFilePaths,
  getFilePath,
  loadTranslation,
} from "./loader/translation-loader";
import type {
  IntegrationOptions,
  IntegrationOptionsInternal,
} from "./types/integration";

/**
 * Creates a Vite plugin for handling i18n virtual modules
 */
export function createI18nVitePlugin(
  srcDir: string,
  internalOptions: IntegrationOptionsInternal,
  i18nextOptions: IntegrationOptions["i18NextOptions"]
) {
  return {
    name: "i18n-virtual-modules",
    resolveId(id: string) {
      if (id === "virtual:i18n-loader") return id;

      const match = id.match(/^virtual:i18n-translation:(.+)\/(.+)$/);
      if (match) return id;

      // Use double underscore as separator to avoid conflicts with dashes in namespaces
      const virtualMatch = id.match(/^\.?\/virtual-i18n-(.+?)__(.+)\.js$/);
      if (virtualMatch) {
        // Convert back dots for nested namespaces (e.g., features.dashboard)
        const locale = virtualMatch[1];
        const namespace = virtualMatch[2];
        return `virtual:i18n-translation:${locale}/${namespace}`;
      }

      return null;
    },
    load(id: string) {
      if (id === "virtual:i18n-loader") {
        return generateDynamicTranslationLoader(
          srcDir,
          internalOptions,
          i18nextOptions
        );
      }

      const match = id.match(/^virtual:i18n-translation:(.+)\/(.+)$/);
      if (match) {
        const [, locale, namespace] = match;
        const translation = loadTranslation(
          getFilePath(
            locale,
            namespace,
            srcDir,
            internalOptions.translationsDir
          )
        );
        return `export default ${JSON.stringify(translation)};`;
      }

      return null;
    },
  };
}

function generateDynamicTranslationLoader(
  srcDir: string,
  internalOptions: IntegrationOptionsInternal,
  i18nextOptions: IntegrationOptions["i18NextOptions"]
): string {
  const importMap: string[] = [];
  const caseStatements: string[] = [];

  // Handle different supportedLngs values:
  // - false/undefined: support all found languages (would need discovery logic)
  // - []: support no languages
  // - array with items: support those specific languages
  let locales: string[] = [];
  let namespaces: string[] = [];

  if (
    i18nextOptions.supportedLngs === false ||
    i18nextOptions.supportedLngs === undefined
  ) {
    // Automatically discover languages and namespaces from translations directory
    locales = discoverAvailableLanguages(
      srcDir,
      internalOptions.translationsDir
    );

    // Discover all namespaces from the file system for automatic discovery
    const allFilePaths = getAllFilePaths(
      srcDir,
      internalOptions,
      i18nextOptions
    );

    const discoveredNamespaces = new Set<string>();

    allFilePaths.forEach(({ namespace }) =>
      discoveredNamespaces.add(namespace)
    );

    namespaces = Array.from(discoveredNamespaces);

    // If no namespaces found, fall back to configured or default
    if (namespaces.length === 0) {
      if (i18nextOptions.ns === undefined) {
        namespaces = ["translation"]; // i18next default
      } else if (typeof i18nextOptions.ns === "string") {
        namespaces = [i18nextOptions.ns];
      } else if (Array.isArray(i18nextOptions.ns)) {
        namespaces = i18nextOptions.ns;
      }
    }
  } else if (Array.isArray(i18nextOptions.supportedLngs)) {
    locales = i18nextOptions.supportedLngs;

    // For explicit locales, discover or use configured namespaces
    if (i18nextOptions.ns === undefined) {
      // Try to discover namespaces from the file system
      const allFilePaths = getAllFilePaths(
        srcDir,
        internalOptions,
        i18nextOptions
      );
      const discoveredNamespaces = new Set<string>();
      allFilePaths.forEach(({ namespace }) =>
        discoveredNamespaces.add(namespace)
      );
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
  }

  locales.forEach((locale) => {
    namespaces.forEach((namespace) => {
      // Replace dots and dashes with underscores for variable names
      const importVar = `${locale}_${namespace}`.replace(/[^a-zA-Z0-9_]/g, "_");
      // Use double underscore separator to avoid conflicts with dashes in namespaces
      importMap.push(
        `const ${importVar} = () => import('./virtual-i18n-${locale}__${namespace}.js');`
      );
      caseStatements.push(
        `    case '${locale}/${namespace}': return (await ${importVar}()).default || {};`
      );
    });
  });

  return `
${importMap.join("\n")}

export async function loadTranslation(locale, namespace) {
  try {
    const key = \`\${locale}/\${namespace}\`;
    switch (key) {
${caseStatements.join("\n")}
      default:
        console.warn(\`[${INTEGRATION_NAME}] Unknown translation: \${locale}/\${namespace}\`);
        return {};
    }
  } catch (err) {
    console.warn(\`[${INTEGRATION_NAME}] Failed to load translation \${locale}/\${namespace}:\`, err);
    return {};
  }
}

// Helper to preload specific namespaces
export async function preloadNamespaces(locale, namespaces) {
  const promises = namespaces.map(ns => loadTranslation(locale, ns));
  return Promise.all(promises);
}

// Available locales and namespaces for validation
export const availableLocales = ${JSON.stringify(locales)};
export const availableNamespaces = ${JSON.stringify(namespaces)};
`;
}
