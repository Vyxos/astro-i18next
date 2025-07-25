import { loadTranslation } from "./translation-loader";
import type { IntegrationOptions } from "./types";

/**
 * Creates a Vite plugin for handling i18n virtual modules
 */
export function createI18nVitePlugin(
  options: IntegrationOptions,
  srcDir: string
) {
  return {
    name: "i18n-virtual-modules",
    resolveId(id: string) {
      if (id === "virtual:i18n-config") return id;
      if (id === "virtual:i18n-loader") return id;

      const match = id.match(/^virtual:i18n-translation:(.+)\/(.+)$/);
      if (match) return id;

      // Handle generated virtual modules
      const virtualMatch = id.match(/^\.?\/virtual-i18n-(.+)-(.+)\.js$/);
      if (virtualMatch)
        return `virtual:i18n-translation:${virtualMatch[1]}/${virtualMatch[2]}`;
    },
    load(id: string) {
      if (id === "virtual:i18n-config") {
        return `export const i18nConfig = ${JSON.stringify(options)};`;
      }

      if (id === "virtual:i18n-loader") {
        return generateDynamicTranslationLoader(options);
      }

      const match = id.match(/^virtual:i18n-translation:(.+)\/(.+)$/);
      if (match) {
        const [, locale, namespace] = match;
        const translation = loadTranslation(
          srcDir,
          options.translationsDir,
          locale,
          namespace
        );
        return `export default ${JSON.stringify(translation)};`;
      }
    },
  };
}

function generateDynamicTranslationLoader(options: IntegrationOptions): string {
  // Generate import mapping for all locale/namespace combinations
  const importMap: string[] = [];
  const caseStatements: string[] = [];

  options.locales.forEach((locale) => {
    options.namespaces.forEach((namespace) => {
      const importVar = `${locale}_${namespace}`.replace(/[^a-zA-Z0-9_]/g, "_");
      importMap.push(
        `const ${importVar} = () => import('./virtual-i18n-${locale}-${namespace}.js');`
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
        console.warn(\`[i18next] Unknown translation: \${locale}/\${namespace}\`);
        return {};
    }
  } catch (err) {
    console.warn(\`[i18next] Failed to load translation \${locale}/\${namespace}:\`, err);
    return {};
  }
}

// Helper to preload specific namespaces
export async function preloadNamespaces(locale, namespaces) {
  const promises = namespaces.map(ns => loadTranslation(locale, ns));
  return Promise.all(promises);
}

// Available locales and namespaces for validation
export const availableLocales = ${JSON.stringify(options.locales)};
export const availableNamespaces = ${JSON.stringify(options.namespaces)};
`;
}
