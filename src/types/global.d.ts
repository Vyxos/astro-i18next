declare var __i18nLoadNamespaces: (namespaces: string[]) => Promise<void>;

declare global {
  interface Window {
    __i18nLoadNamespaces?: (namespaces: string[]) => Promise<void>;
  }
}
