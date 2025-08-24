// Browser-safe colorings using kleur (same as Astro core)
import { bold, dim, green, red, yellow } from "kleur/colors";

const isBrowser = typeof window !== "undefined";
const noOp = (value: string) => value;

// Color functions that work in both server and browser environments
const colorFunctions = isBrowser
  ? {
      // Browser fallback - no colors
      bold: noOp,
      dim: noOp,
      green: noOp,
      red: noOp,
      yellow: noOp,
    }
  : {
      // Server: use kleur/colors (same as Astro core)
      bold: bold || noOp,
      dim: dim || noOp,
      green: green || noOp,
      red: red || noOp,
      yellow: yellow || noOp,
    };

export const colorTimestamp = (value: string) => colorFunctions.dim(value);

export const colorIntegration = (value: string) =>
  colorFunctions.bold(colorFunctions.green(value));

export const colorWarn = (value: string) => colorFunctions.yellow(value);

export const colorError = (value: string) => colorFunctions.red(value);

export const colorWarnPrefix = (value: string) =>
  colorFunctions.bold(colorFunctions.yellow(value));

export const colorErrorPrefix = (value: string) => colorFunctions.red(value);
