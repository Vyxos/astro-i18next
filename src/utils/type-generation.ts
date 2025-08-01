import * as fs from "fs";
import { mergeResourcesAsInterface } from "i18next-resources-for-ts";
import { join } from "node:path";
import { relative, resolve } from "pathe";
import { log } from "../logger";
import { IntegrationOptionsInternal } from "../types/integration";
import { TranslationMap } from "../types/translations";

function toNamespaceArray(
  translationMap: TranslationMap,
  defaultLocale: string
) {
  return Object.entries(translationMap[defaultLocale]).map(
    ([namespaceKey, resources]) => ({
      name: namespaceKey,
      resources,
    })
  );
}

export function generateTypescriptDefinitions(
  namespaces: TranslationMap,
  outputDirPath: string,
  options: IntegrationOptionsInternal
) {
  try {
    const INTERFACE_OUTPUT_FILE = join(
      resolve(outputDirPath, options.generatedTypes.dirPath),
      `${options.generatedTypes.fileName}.d.ts`
    );

    const typeDefinitionFile = mergeResourcesAsInterface(
      toNamespaceArray(namespaces, options.defaultLocale)
    );

    const final = `
import "i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "${options.defaultNamespace}";
    resources: Resources;
  }
}

${typeDefinitionFile}
`;

    const namespacesLength = Object.keys(Object.values(namespaces)[0]).length;
    const RELATIVE_OUTPUT_PATH = relative(process.cwd(), INTERFACE_OUTPUT_FILE);
    fs.writeFileSync(INTERFACE_OUTPUT_FILE, final, {
      encoding: "utf-8",
      flag: "w",
    });

    log(
      `Created interface file for ${namespacesLength !== undefined ? namespacesLength : 0} namespaces: ${RELATIVE_OUTPUT_PATH}`
    );
  } catch (error) {
    log(` Failed to create interface resources file: ${error}`);
  }
}
