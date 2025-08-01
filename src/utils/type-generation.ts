import * as fs from "fs";
import { mergeResourcesAsInterface } from "i18next-resources-for-ts";
import { join } from "node:path";
import { resolve } from "pathe";
import { INTEGRATION_NAME } from "../constants";
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

    fs.writeFileSync(INTERFACE_OUTPUT_FILE, final, {
      encoding: "utf-8",
      flag: "w",
    });

    console.log(
      `[${INTEGRATION_NAME}] Successfully created interface resources file for ${namespaces.length} namespaces: ${INTERFACE_OUTPUT_FILE}`
    );
  } catch (error) {
    console.log(
      `[${INTEGRATION_NAME}]  Failed to create interface resources file: ${error}`
    );
  }
}
