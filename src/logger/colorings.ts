// Browser-safe colorings - NO imports at module level
const isBrowser = typeof window !== "undefined";

// Synchronous color functions with fallback
export const colorTimestamp = (value: string) => {
  if (isBrowser) return value;
  try {
    // Only require kleur when actually called in server environment
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { dim } = require("kleur/colors");
    return dim(value);
  } catch {
    return value;
  }
};

export const colorIntegration = (value: string) => {
  if (isBrowser) return value;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { bold, green } = require("kleur/colors");
    return bold(green(value));
  } catch {
    return value;
  }
};

export const colorWarn = (value: string) => {
  if (isBrowser) return value;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { yellow } = require("kleur/colors");
    return yellow(value);
  } catch {
    return value;
  }
};

export const colorError = (value: string) => {
  if (isBrowser) return value;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { red } = require("kleur/colors");
    return red(value);
  } catch {
    return value;
  }
};

export const colorWarnPrefix = (value: string) => {
  if (isBrowser) return value;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { bold, yellow } = require("kleur/colors");
    return bold(yellow(value));
  } catch {
    return value;
  }
};

export const colorErrorPrefix = (value: string) => {
  if (isBrowser) return value;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { red } = require("kleur/colors");
    return red(value);
  } catch {
    return value;
  }
};
