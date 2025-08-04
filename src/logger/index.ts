import { bold, gray, greenBright, magenta, red } from "colorette";
import { INTEGRATION_NAME } from "../constants";

/**
 * Logs a message with Astro-like formatting.
 * @param label The label for the message, e.g., 'my-library'
 * @param message The message to log.
 */
export function log(message: string, label = INTEGRATION_NAME): void {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const prefix = `[${label}]`;

  const output = `${gray(timestamp)} ${bold(greenBright(prefix))} ${message}`;

  console.log(output);
}

/**
 * Logs an error message with Astro-like formatting and standard error output.
 * @param label The label for the message, e.g., 'my-library'
 * @param message The error message to log.
 * @param error Optional Error object to log the stack trace.
 */
export function logError(error: string, label = INTEGRATION_NAME): void {
  const timestamp = new Date().toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const prefix = `[${label}]`;

  const errorPrefix = bold(red(`[ERROR]`));

  const output = `${gray(timestamp)} ${magenta(prefix)} ${errorPrefix} ${red(
    error
  )}`;

  console.error(output);
}
