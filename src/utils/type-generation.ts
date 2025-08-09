import * as fs from "fs";
import { mergeResourcesAsInterface } from "i18next-resources-for-ts";
import { join } from "node:path";
import { relative, resolve } from "pathe";
import { log } from "../logger";
import {
  IntegrationOptionsInternal,
  IntegrationOptions,
} from "../types/integration";
import { TranslationMap } from "../types/translations";

function toNamespaceArray(translationMap: TranslationMap, lng?: string) {
  // Determine which locale to use for type generation
  // If lng is 'cimode' or undefined, use the first available language
  const localeForTypes =
    !lng || lng === "cimode" ? Object.keys(translationMap)[0] : lng;

  return Object.entries(translationMap[localeForTypes]).map(
    ([namespaceKey, resources]) => ({
      name: namespaceKey,
      resources,
    })
  );
}

export function generateTypescriptDefinitions(
  namespaces: TranslationMap,
  outputDirPath: string,
  internalOptions: IntegrationOptionsInternal,
  i18nextOptions: IntegrationOptions["i18NextOptions"]
) {
  try {
    const INTERFACE_OUTPUT_FILE = join(
      resolve(outputDirPath, internalOptions.generatedTypes.dirPath),
      `${internalOptions.generatedTypes.fileName}.d.ts`
    );

    const typeDefinitionFile = mergeResourcesAsInterface(
      toNamespaceArray(namespaces, i18nextOptions.lng)
    );

    const final = `
import "i18next";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "${i18nextOptions.defaultNS === false ? "false" : i18nextOptions.defaultNS || "translation"}";
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
