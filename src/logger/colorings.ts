// Browser-safe colorings using kleur (same as Astro core)
const isBrowser = typeof window !== "undefined";
const noOp = (value: string) => value;

// Lazy load kleur to avoid bundling in browser/unused contexts
let colorFunctions: {
  bold: (text: string) => string;
  dim: (text: string) => string;
  green: (text: string) => string;
  red: (text: string) => string;
  yellow: (text: string) => string;
} | null = null;

function getColorFunctions() {
  if (colorFunctions) return colorFunctions;

  if (isBrowser) {
    // Browser fallback - no colors
    colorFunctions = {
      bold: noOp,
      dim: noOp,
      green: noOp,
      red: noOp,
      yellow: noOp,
    };
  } else {
    try {
      // Server: dynamically import kleur/colors to avoid bundling issues
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const kleur = require("kleur/colors");
      colorFunctions = {
        bold: kleur.bold || noOp,
        dim: kleur.dim || noOp,
        green: kleur.green || noOp,
        red: kleur.red || noOp,
        yellow: kleur.yellow || noOp,
      };
    } catch {
      // Fallback if kleur fails to load
      colorFunctions = {
        bold: noOp,
        dim: noOp,
        green: noOp,
        red: noOp,
        yellow: noOp,
      };
    }
  }

  return colorFunctions;
}

export const colorTimestamp = (value: string) => getColorFunctions().dim(value);

export const colorIntegration = (value: string) => {
  const colors = getColorFunctions();
  return colors.bold(colors.green(value));
};

export const colorWarn = (value: string) => getColorFunctions().yellow(value);

export const colorError = (value: string) => getColorFunctions().red(value);

export const colorWarnPrefix = (value: string) => {
  const colors = getColorFunctions();
  return colors.bold(colors.yellow(value));
};

export const colorErrorPrefix = (value: string) =>
  getColorFunctions().red(value);
