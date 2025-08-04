import { bold, gray, greenBright, red, yellow } from "colorette";

export const colorTimestamp = (value: string) => gray(value);

export const colorIntegration = (value: string) => bold(greenBright(value));

export const colorWarn = (value: string) => yellow(value);

export const colorError = (value: string) => red(value);

export const colorWarnPrefix = (value: string) => bold(yellow(value));

export const colorErrorPrefix = (value: string) => red(value);
