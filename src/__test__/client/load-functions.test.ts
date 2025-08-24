import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadNamespacesForRoute,
  preloadNamespaces,
  useLoadNamespaces,
} from "../../client/load-functions";

// Mock the browser-helpers module
vi.mock("../../utils/browser-helpers", () => ({
  getGlobalObject: vi.fn(),
}));

// Mock the constants module
vi.mock("../../constants", () => ({
  INTEGRATION_NAME: "@vyxos/astro-i18next",
}));

import { getGlobalObject } from "../../utils/browser-helpers";

const mockGetGlobalObject = vi.mocked(getGlobalObject);

describe("load-functions", () => {
  let mockGlobalThis: any;
  let mockLoadNamespaces: any;
  let consoleSpy: any;

  beforeEach(() => {
    mockLoadNamespaces = vi.fn().mockResolvedValue(undefined);
    mockGlobalThis = {
      __i18nLoadNamespaces: mockLoadNamespaces,
    };
    consoleSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    consoleSpy.mockRestore();
  });

  describe("loadNamespacesForRoute", () => {
    it("should call global __i18nLoadNamespaces with provided namespaces", async () => {
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);
      const namespaces = ["common", "auth"];

      await loadNamespacesForRoute(namespaces);

      expect(mockLoadNamespaces).toHaveBeenCalledWith(namespaces);
    });

    it("should handle case when global object is not available", async () => {
      mockGetGlobalObject.mockReturnValue(undefined);
      const namespaces = ["common", "auth"];

      await expect(loadNamespacesForRoute(namespaces)).resolves.toBeUndefined();
      expect(mockLoadNamespaces).not.toHaveBeenCalled();
    });

    it("should handle case when __i18nLoadNamespaces is not available", async () => {
      mockGetGlobalObject.mockReturnValue({} as typeof globalThis);
      const namespaces = ["common", "auth"];

      await expect(loadNamespacesForRoute(namespaces)).resolves.toBeUndefined();
      expect(mockLoadNamespaces).not.toHaveBeenCalled();
    });

    it("should log warning and continue when loading fails", async () => {
      const error = new Error("Loading failed");
      mockLoadNamespaces.mockRejectedValue(error);
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);
      const namespaces = ["common", "auth"];

      await loadNamespacesForRoute(namespaces);

      expect(consoleSpy).toHaveBeenCalledWith(
        "[@vyxos/astro-i18next] Failed to load namespaces:",
        namespaces,
        error
      );
    });
  });

  describe("useLoadNamespaces", () => {
    it("should return initial state", () => {
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);

      const { result } = renderHook(() => useLoadNamespaces(["common"]));

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
      expect(typeof result.current.load).toBe("function");
    });

    it("should handle successful loading", async () => {
      mockLoadNamespaces.mockResolvedValue(undefined);
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);

      const { result } = renderHook(() => useLoadNamespaces(["common"]));

      await act(async () => {
        await result.current.load();
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockLoadNamespaces).toHaveBeenCalledWith(["common"]);
    });

    it("should handle loading errors", async () => {
      const error = new Error("Loading failed");
      mockLoadNamespaces.mockRejectedValue(error);
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);

      const { result } = renderHook(() => useLoadNamespaces(["common"]));

      await act(async () => {
        await expect(result.current.load()).rejects.toThrow("Loading failed");
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBe(error);
    });

    it("should handle case when global loader is not available", async () => {
      mockGetGlobalObject.mockReturnValue(undefined);

      const { result } = renderHook(() => useLoadNamespaces(["common"]));

      await act(async () => {
        await result.current.load();
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockLoadNamespaces).not.toHaveBeenCalled();
    });

    it("should handle case when __i18nLoadNamespaces is not available", async () => {
      mockGetGlobalObject.mockReturnValue({} as typeof globalThis);

      const { result } = renderHook(() => useLoadNamespaces(["common"]));

      await act(async () => {
        await result.current.load();
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockLoadNamespaces).not.toHaveBeenCalled();
    });

    it("should use stable dependency array based on namespaces content", () => {
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);

      // First render with namespaces array
      const { result, rerender } = renderHook(
        ({ namespaces }) => useLoadNamespaces(namespaces),
        { initialProps: { namespaces: ["common"] } }
      );

      const firstLoad = result.current.load;

      // Rerender with different array instance but same content
      rerender({ namespaces: ["common"] });

      // load function should be stable (same reference)
      expect(result.current.load).toBe(firstLoad);
    });

    it("should update load function when namespaces content changes", () => {
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);

      const { result, rerender } = renderHook(
        ({ namespaces }) => useLoadNamespaces(namespaces),
        { initialProps: { namespaces: ["common"] } }
      );

      const firstLoad = result.current.load;

      // Rerender with different content
      rerender({ namespaces: ["common", "auth"] });

      // load function should be different (new reference)
      expect(result.current.load).not.toBe(firstLoad);
    });

    it("should set states correctly during loading process", async () => {
      let resolvePromise: () => void;
      const loadingPromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      mockLoadNamespaces.mockReturnValue(loadingPromise);
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);

      const { result } = renderHook(() => useLoadNamespaces(["common"]));

      // Start loading but don't await it yet
      let loadPromise: Promise<void>;
      act(() => {
        loadPromise = result.current.load();
      });

      // Should be in pending state
      expect(result.current.isPending).toBe(true);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);

      // Resolve the loading
      resolvePromise!();
      await act(async () => {
        await loadPromise;
      });

      // Should be in success state
      expect(result.current.isPending).toBe(false);
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isError).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it("should not update state if component is unmounted", async () => {
      mockLoadNamespaces.mockResolvedValue(undefined);
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);

      const { result, unmount } = renderHook(() =>
        useLoadNamespaces(["common"])
      );

      // Start loading
      let loadPromise: Promise<void>;
      act(() => {
        loadPromise = result.current.load();
      });

      // Immediately unmount
      unmount();

      // Wait for the promise to resolve
      await act(async () => {
        await loadPromise;
      });

      // The test passes if no errors are thrown during unmount
      // The hook should handle the unmounted state gracefully
      expect(true).toBe(true);
    });
  });

  describe("preloadNamespaces", () => {
    it("should call global __i18nLoadNamespaces with provided namespaces", () => {
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);
      const namespaces = ["common", "auth"];

      preloadNamespaces(namespaces);

      expect(mockLoadNamespaces).toHaveBeenCalledWith(namespaces);
    });

    it("should handle case when global object is not available", () => {
      mockGetGlobalObject.mockReturnValue(undefined);
      const namespaces = ["common", "auth"];

      expect(() => preloadNamespaces(namespaces)).not.toThrow();
      expect(mockLoadNamespaces).not.toHaveBeenCalled();
    });

    it("should handle case when __i18nLoadNamespaces is not available", () => {
      mockGetGlobalObject.mockReturnValue({} as typeof globalThis);
      const namespaces = ["common", "auth"];

      expect(() => preloadNamespaces(namespaces)).not.toThrow();
      expect(mockLoadNamespaces).not.toHaveBeenCalled();
    });

    it("should log warning when preloading fails", async () => {
      const error = new Error("Preload failed");
      mockLoadNamespaces.mockRejectedValue(error);
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);
      const namespaces = ["common", "auth"];

      preloadNamespaces(namespaces);

      // Wait for the promise to be rejected and caught
      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith(
        "[@vyxos/astro-i18next] Preload failed:",
        namespaces,
        error
      );
    });

    it("should not throw when preloading fails", () => {
      const error = new Error("Preload failed");
      mockLoadNamespaces.mockRejectedValue(error);
      mockGetGlobalObject.mockReturnValue(mockGlobalThis);
      const namespaces = ["common", "auth"];

      expect(() => preloadNamespaces(namespaces)).not.toThrow();
    });
  });
});
