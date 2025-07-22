import type { IntegrationOptions } from "./types";
import { loadTranslation } from "./translation-loader";

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
    },
    load(id: string) {
      if (id === "virtual:i18n-config") {
        return `export const i18nConfig = ${JSON.stringify(options)};`;
      }

      if (id === "virtual:i18n-loader") {
        return generateTranslationLoader(options);
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

function generateTranslationLoader(options: IntegrationOptions): string {
  const imports: string[] = [];
  const loaderMap: string[] = [];

  options.locales.forEach((locale) => {
    options.namespaces.forEach((namespace) => {
      const key = `${locale}_${namespace}`;
      imports.push(
        `import ${key} from 'virtual:i18n-translation:${locale}/${namespace}';`
      );
      loaderMap.push(`  '${locale}/${namespace}': ${key}`);
    });
  });

  return `
${imports.join("\n")}

const translations = {
${loaderMap.join(",\n")}
};

export function loadTranslation(locale, namespace) {
  const key = \`\${locale}/\${namespace}\`;
  return translations[key] || {};
}
`;
}
