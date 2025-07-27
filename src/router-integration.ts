import { INTEGRATION_NAME } from "./constants";

// Browser environment check
function isBrowser(): boolean {
  return typeof globalThis !== "undefined" && "window" in globalThis;
}

function getGlobalWindow(): Window | undefined {
  return isBrowser() ? window : undefined;
}

/**
 * Helper function to load namespaces for a route in TanStack Router beforeLoad
 * Usage in your route config:
 *
 * beforeLoad: async () => {
 *   await loadNamespacesForRoute(['common', 'auth', 'dashboard']);
 * }
 */
export async function loadNamespacesForRoute(
  namespaces: string[]
): Promise<void> {
  const win = getGlobalWindow();
  if (win?.__i18nLoadNamespaces) {
    try {
      await win.__i18nLoadNamespaces(namespaces);
    } catch (error: unknown) {
      console.warn(
        `[${INTEGRATION_NAME}] Failed to load namespaces:`,
        namespaces,
        error
      );
    }
  }
}

/**
 * React hook for loading namespaces in components (optional usage)
 */
export async function useLoadNamespaces(namespaces: string[]): Promise<void> {
  const win = getGlobalWindow();
  if (win?.__i18nLoadNamespaces) {
    return win.__i18nLoadNamespaces(namespaces);
  }
  return Promise.resolve();
}

/**
 * Preload namespaces without waiting (fire-and-forget)
 */
export function preloadNamespaces(namespaces: string[]): void {
  const win = getGlobalWindow();
  if (win?.__i18nLoadNamespaces) {
    win
      .__i18nLoadNamespaces(namespaces)
      .catch((error: unknown) =>
        console.warn(`[${INTEGRATION_NAME}] Preload failed:`, namespaces, error)
      );
  }
}
