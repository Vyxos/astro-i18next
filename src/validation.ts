import { IntegrationOptions } from "./types/integration";

export class I18nConfigError extends Error {
  constructor(
    message: string,
    public field?: string
  ) {
    super(message);
    this.name = "I18nConfigError";
  }
}

export function validateOptions(options: IntegrationOptions): void {
  if (!options) {
    throw new I18nConfigError("Integration options are required");
  }
}
