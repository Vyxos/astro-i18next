export type TranslationContent = {
  [key: string]: string | number | TranslationContent;
};

export interface TranslationMap {
  [locale: string]: {
    [namespace: string]: TranslationContent;
  };
}

export interface LocaleFileData {
  path: string;
  locale: string;
  namespace: string;
}
