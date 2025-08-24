// Browser-safe colorings that prevent TTY module access
const isBrowser = typeof window !== "undefined";
const noOp = (value: string) => value;

// Safely load colorette only in server environments
let colorFunctions: {
  bold: (text: string) => string;
  gray: (text: string) => string;
  greenBright: (text: string) => string;
  red: (text: string) => string;
  yellow: (text: string) => string;
};

try {
  if (isBrowser) {
    throw new Error("Browser environment detected");
  }

  // Server: dynamically require colorette to avoid bundling issues
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const colorette = require("colorette");
  colorFunctions = {
    bold: colorette.bold || noOp,
    gray: colorette.gray || noOp,
    greenBright: colorette.greenBright || noOp,
    red: colorette.red || noOp,
    yellow: colorette.yellow || noOp,
  };
} catch {
  // Fallback for browser environments or when colorette fails to load
  colorFunctions = {
    bold: noOp,
    gray: noOp,
    greenBright: noOp,
    red: noOp,
    yellow: noOp,
  };
}

export const colorTimestamp = (value: string) => colorFunctions.gray(value);

export const colorIntegration = (value: string) =>
  colorFunctions.bold(colorFunctions.greenBright(value));

export const colorWarn = (value: string) => colorFunctions.yellow(value);

export const colorError = (value: string) => colorFunctions.red(value);

export const colorWarnPrefix = (value: string) =>
  colorFunctions.bold(colorFunctions.yellow(value));

export const colorErrorPrefix = (value: string) => colorFunctions.red(value);
