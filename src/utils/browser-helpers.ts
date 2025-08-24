function isBrowser(): boolean {
  return typeof globalThis !== "undefined" && "window" in globalThis;
}

export function getGlobalObject() {
  return isBrowser() ? globalThis : undefined;
}
