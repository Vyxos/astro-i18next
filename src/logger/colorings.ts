// Browser-safe colorings that don't use TTY
const isBrowser = typeof window !== "undefined";

// No-op function for browser environments
const noOp = (value: string) => value;

// Color functions that work conditionally
export const colorTimestamp = (value: string) => {
  if (isBrowser) return noOp(value);
  try {
    // Dynamic import only in Node.js environment
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { gray } = require("colorette");
    return gray(value);
  } catch {
    return noOp(value);
  }
};

export const colorIntegration = (value: string) => {
  if (isBrowser) return noOp(value);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { bold, greenBright } = require("colorette");
    return bold(greenBright(value));
  } catch {
    return noOp(value);
  }
};

export const colorWarn = (value: string) => {
  if (isBrowser) return noOp(value);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { yellow } = require("colorette");
    return yellow(value);
  } catch {
    return noOp(value);
  }
};

export const colorError = (value: string) => {
  if (isBrowser) return noOp(value);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { red } = require("colorette");
    return red(value);
  } catch {
    return noOp(value);
  }
};

export const colorWarnPrefix = (value: string) => {
  if (isBrowser) return noOp(value);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { bold, yellow } = require("colorette");
    return bold(yellow(value));
  } catch {
    return noOp(value);
  }
};

export const colorErrorPrefix = (value: string) => {
  if (isBrowser) return noOp(value);
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { red } = require("colorette");
    return red(value);
  } catch {
    return noOp(value);
  }
};
