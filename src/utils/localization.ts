/// <reference lib="dom" />
import i18next from "i18next";
import { logError } from "../logger";
import { getLocaleConfig } from "../utils";

/**
 * Generates a localized URL pathname based on a given path and target locale.
 *
 * This function ensures that the generated pathname correctly reflects the desired locale
 * according to the rules defined in the configuration. It first strips any existing locale
 * from the input pathname to get a base path. Then, it prepends the target locale to the
 * base path, but only if the target locale is not the default locale.
 *
 * @param {string} [pathname] - The original pathname to be localized. This can be a path
 * that already contains a locale prefix (e.g., "/en/about") or a path without one
 * (e.g., "/about"). Defaults to an empty string.
 *
 * @param {string} [locale] - The target locale code for the new pathname (e.g., "fr").
 * If this locale is the default locale, it will not be added to the path.
 * If not provided, uses the current locale from i18next.
 *
 * @returns {string} The fully resolved, localized pathname. For example:
 * - `getLocalizedPathname("/fr/about", "de")` returns `"/de/about"`
 * - `getLocalizedPathname("/about", "fr")` returns `"/fr/about"`
 * - `getLocalizedPathname("/fr/about", "en")` returns `"/about"` (if "en" is default)
 *
 * @since 0.1.5
 */
export function getLocalizedPathname(pathname: string, locale?: string) {
  const { defaultLocale, supportedLngs } = getLocaleConfig();
  const targetLocale = locale || i18next.language || "";
  const localeFromPathname = pathname.split("/")[1];
  let localizedPathname = pathname;

  // 1. Strip any existing locale from the pathname to get a clean, unlocalized path.
  if (
    Array.isArray(supportedLngs) &&
    supportedLngs.includes(localeFromPathname)
  ) {
    localizedPathname =
      localizedPathname.replace("/" + localeFromPathname, "") || "/";
  }

  // 2. Add the target locale as a prefix, but only if it's a valid,
  // non-default locale.
  if (
    Array.isArray(supportedLngs) &&
    supportedLngs.includes(targetLocale) &&
    targetLocale !== defaultLocale
  ) {
    localizedPathname =
      "/" + targetLocale + localizedPathname.replace(/^\/$/, "");
  }

  return localizedPathname;
}

/**
 * Changes the current locale of the application and updates the URL accordingly.
 *
 * This function first checks if the `nextLocale` is supported by the application.
 * If it is, it updates the `i18next` instance to the new locale and then
 * constructs a new URL pathname using `getLocalizedPathname`.
 *
 * The URL is updated using `history.replaceState` for a shallow update (no page reload)
 * or `window.location.replace` for a full page reload, depending on the `shallow` parameter.
 *
 * @param {string} [nextLocale=""] - The target locale code to switch to (e.g., "fr").
 * If an unsupported locale is provided, the function will do nothing.
 * @param {boolean} [shallow=true] - If `true`, uses `history.replaceState` to update the URL
 * without a full page reload. If `false`, uses `window.location.replace` which causes a full page reload.
 *
 * @example
 * ```typescript
 * // Change locale to French without a full page reload
 * changeLocale("fr");
 *
 * // Change locale to German with a full page reload
 * changeLocale("de", false);
 * ```
 *
 * @see {@link getLocalizedPathname}
 * @since 0.2.0
 */
export function changeLocale(nextLocale: string = "", shallow: boolean = true) {
  const { supportedLngs } = getLocaleConfig();

  // Handle different supportedLngs values
  if (Array.isArray(supportedLngs)) {
    if (!supportedLngs.includes(nextLocale)) {
      return;
    }
  }

  i18next.changeLanguage(nextLocale);

  if (typeof window === "undefined") {
    logError(`Trying to access client-only function in server environment.`);

    return;
  }

  const { hash, pathname, search } = window.location;
  const nextPathname = getLocalizedPathname(pathname, nextLocale);

  if (nextPathname !== pathname) {
    const nextUrl = nextPathname + search + hash;

    if (shallow) {
      window.history.replaceState(null, "", nextUrl);
    } else {
      window.location.replace(nextUrl);
    }
  }
}
