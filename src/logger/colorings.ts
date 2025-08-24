// Browser-safe colorings - createRequire for ESM compatibility
import { createRequire } from "module";

const isBrowser = typeof window !== "undefined";
const nodeRequire = isBrowser ? null : createRequire(import.meta.url);

// Synchronous color functions with fallback
export const colorTimestamp = (value: string) => {
  if (isBrowser || !nodeRequire) return value;
  try {
    const { dim } = nodeRequire("kleur/colors");
    return dim(value);
  } catch {
    return value;
  }
};

export const colorIntegration = (value: string) => {
  if (isBrowser || !nodeRequire) return value;
  try {
    const { bold, green } = nodeRequire("kleur/colors");
    return bold(green(value));
  } catch {
    return value;
  }
};

export const colorWarn = (value: string) => {
  if (isBrowser || !nodeRequire) return value;
  try {
    const { yellow } = nodeRequire("kleur/colors");
    return yellow(value);
  } catch {
    return value;
  }
};

export const colorError = (value: string) => {
  if (isBrowser || !nodeRequire) return value;
  try {
    const { red } = nodeRequire("kleur/colors");
    return red(value);
  } catch {
    return value;
  }
};

export const colorWarnPrefix = (value: string) => {
  if (isBrowser || !nodeRequire) return value;
  try {
    const { bold, yellow } = nodeRequire("kleur/colors");
    return bold(yellow(value));
  } catch {
    return value;
  }
};

export const colorErrorPrefix = (value: string) => {
  if (isBrowser || !nodeRequire) return value;
  try {
    const { red } = nodeRequire("kleur/colors");
    return red(value);
  } catch {
    return value;
  }
};
