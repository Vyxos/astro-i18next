// Browser-safe colorings using kleur (same as Astro core)
import { bold, dim, green, red, yellow } from "kleur/colors";

const isBrowser = typeof window !== "undefined";

// Use colors only in server environments (same pattern as Astro core)
export const colorTimestamp = (value: string) =>
  isBrowser ? value : dim(value);

export const colorIntegration = (value: string) =>
  isBrowser ? value : bold(green(value));

export const colorWarn = (value: string) => (isBrowser ? value : yellow(value));

export const colorError = (value: string) => (isBrowser ? value : red(value));

export const colorWarnPrefix = (value: string) =>
  isBrowser ? value : bold(yellow(value));

export const colorErrorPrefix = (value: string) =>
  isBrowser ? value : red(value);
