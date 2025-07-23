import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadNamespacesForRoute,
  preloadNamespaces,
  useLoadNamespaces,
} from "../router-integration";

// Mock console.warn to avoid noise in tests
const mockConsoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("router integration", () => {
  const mockLoadNamespaces = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window object
    Object.defineProperty(globalThis, "window", {
      value: {
        __i18nLoadNamespaces: mockLoadNamespaces,
      },
      writable: true,
      configurable: true,
    });
  });

  describe("loadNamespacesForRoute", () => {
    it("should call global namespace loader", async () => {
      mockLoadNamespaces.mockResolvedValue(undefined);

      await loadNamespacesForRoute(["common", "auth"]);

      expect(mockLoadNamespaces).toHaveBeenCalledWith(["common", "auth"]);
    });

    it("should handle missing global loader gracefully", async () => {
      // @ts-expect-error - Intentionally removing the property
      delete globalThis.window.__i18nLoadNamespaces;

      await expect(loadNamespacesForRoute(["common"])).resolves.toBeUndefined();
    });

    it("should handle errors gracefully", async () => {
      mockLoadNamespaces.mockRejectedValue(new Error("Load failed"));

      await expect(loadNamespacesForRoute(["common"])).resolves.toBeUndefined();
      expect(mockConsoleWarn).toHaveBeenCalled();
    });
  });

  describe("useLoadNamespaces", () => {
    it("should return promise from global loader", () => {
      const promise = Promise.resolve();
      mockLoadNamespaces.mockReturnValue(promise);

      const result = useLoadNamespaces(["common"]);

      expect(result).toBeInstanceOf(Promise);
      expect(mockLoadNamespaces).toHaveBeenCalledWith(["common"]);
    });

    it("should return resolved promise when no global loader", () => {
      // @ts-expect-error - Intentionally removing the property
      delete globalThis.window.__i18nLoadNamespaces;

      const result = useLoadNamespaces(["common"]);

      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe("preloadNamespaces", () => {
    it("should call global loader without waiting", () => {
      mockLoadNamespaces.mockResolvedValue(undefined);

      preloadNamespaces(["common", "auth"]);

      expect(mockLoadNamespaces).toHaveBeenCalledWith(["common", "auth"]);
    });

    it("should handle errors silently", async () => {
      mockLoadNamespaces.mockRejectedValue(new Error("Preload failed"));

      preloadNamespaces(["common"]);

      // Wait a bit to let the promise reject
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(mockConsoleWarn).toHaveBeenCalled();
    });
  });
});
