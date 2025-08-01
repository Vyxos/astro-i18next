import { useCallback, useEffect, useRef, useState } from "react";
import { INTEGRATION_NAME } from "../constants";
import { getGlobalObject } from "../utils/helpers";

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
  const globalThis = getGlobalObject();
  if (globalThis?.__i18nLoadNamespaces) {
    try {
      await globalThis.__i18nLoadNamespaces(namespaces);
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
 * @typedef {object} UseLoadNamespacesResult
 * @property {boolean} isPending - True if the namespaces are currently being loaded.
 * @property {boolean} isSuccess - True if the namespaces have been successfully loaded.
 * @property {boolean} isError - True if an error occurred while loading the namespaces.
 * @property {unknown | null} error - The error object if an error occurred.
 * @property {() => Promise<void>} load - A function to manually trigger loading the namespaces.
 */

/**
 * React hook for loading i18next namespaces in components.
 * This provides a declarative way to ensure translations are loaded for a component.
 * It returns status indicators and a `load` function to trigger the loading manually.
 *
 * @param {string[]} namespaces - An array of namespace strings to load.
 * @returns {UseLoadNamespacesResult} An object with loading status and a load function.
 *
 * @example
 * ```jsx
 * function MyComponent() {
 *   const { isPending, isSuccess, load } = useLoadNamespaces(['my-namespace']);
 *
 *   // Example of loading on button click
 *   const handleLoadClick = () => {
 *     load().catch(err => console.error("Failed to load", err));
 *   };
 *
 *   if (isPending) {
 *     return <div>Loading translations...</div>;
 *   }
 *
 *   if (isSuccess) {
 *     return <p>{t('my-key')}</p>;
 *   }
 *
 *   return <button onClick={handleLoadClick}>Load Translations</button>;
 * }
 * ```
 */
export function useLoadNamespaces(namespaces: string[]): {
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  error: unknown | null;
  load: () => Promise<void>;
} {
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<unknown | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Use a stable key for the dependency array to avoid re-running the effect
  // on every render if the parent component passes a new array instance.
  const namespacesKey = JSON.stringify(namespaces);

  const load = useCallback(async () => {
    setIsPending(true);
    setIsSuccess(false);
    setIsError(false);
    setError(null);

    const globalThis = getGlobalObject();

    // If the global loader function doesn't exist, we can consider it an
    // immediate success, as there's nothing to load. This might happen in
    // environments where the client-side script hasn't initialized.
    if (!globalThis?.__i18nLoadNamespaces) {
      if (isMounted.current) {
        setIsPending(false);
        setIsSuccess(true);
      }
      return;
    }

    try {
      await globalThis.__i18nLoadNamespaces(namespaces);
      if (isMounted.current) {
        setIsPending(false);
        setIsSuccess(true);
      }
    } catch (err: unknown) {
      if (isMounted.current) {
        setIsPending(false);
        setIsError(true);
        setError(err);
      }

      throw err;
    }
  }, [namespacesKey]);

  return { isPending, isSuccess, isError, error, load };
}

/**
 * Preload namespaces without waiting (fire-and-forget)
 */
export function preloadNamespaces(namespaces: string[]): void {
  const globalThis = getGlobalObject();
  if (globalThis?.__i18nLoadNamespaces) {
    globalThis
      .__i18nLoadNamespaces(namespaces)
      .catch((error: unknown) =>
        console.warn(`[${INTEGRATION_NAME}] Preload failed:`, namespaces, error)
      );
  }
}
