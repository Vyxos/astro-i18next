import { INTEGRATION_NAME } from "../constants";
import {
  colorError,
  colorErrorPrefix,
  colorIntegration,
  colorTimestamp,
  colorWarn,
  colorWarnPrefix,
} from "./colorings";

/**
 * Logs a message with Astro-like formatting.
 * @param message The message to log.
 * @param label The label for the message, defaults to integration name
 * @example
 * ```ts
 * log("Server started");
 * log("Custom message", "my-plugin");
 * ```
 */
export function log(message: string, label = INTEGRATION_NAME): void {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  console.log(
    `${colorTimestamp(timestamp)} ${colorIntegration(`[${label}]`)} ${message}`
  );
}

/**
 * Logs an error message with Astro-like formatting and standard error output.
 * @param error The error message to log.
 * @param label The label for the message, defaults to integration name
 * @example
 * ```ts
 * logError("Failed to load config");
 * logError("Database connection failed", "db-plugin");
 * ```
 */
export function logError(error: string, label = INTEGRATION_NAME): void {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  console.error(
    `${colorTimestamp(timestamp)} ${colorIntegration(`[${label}]`)} ${colorErrorPrefix(`[ERROR]`)} ${colorError(error)}`
  );
}

/**
 * Logs a warning message with Astro-like formatting.
 * @param message The warning message to log.
 * @param label The label for the message, defaults to integration name
 * @example
 * ```ts
 * logWarn("Deprecated feature used");
 * logWarn("Missing translation file", "i18n-loader");
 * ```
 */
export function logWarn(message: string, label = INTEGRATION_NAME): void {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  console.warn(
    `${colorTimestamp(timestamp)} ${colorIntegration(`[${label}]`)} ${colorWarnPrefix(`[WARN]`)} ${colorWarn(message)}`
  );
}
