/**
 * Client-side exports for browser usage
 * This file contains only browser-safe code without Node.js dependencies
 */

export {
  loadNamespacesForRoute,
  useLoadNamespaces,
  preloadNamespaces,
} from "./router-integration";

export type { IntegrationOptions } from "./types";