import { getConfigOptions } from "./config";

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
 * @param {string} [locale=""] - The target locale code for the new pathname (e.g., "fr").
 * If this locale is the default locale, it will not be added to the path.
 * Defaults to an empty string.
 *
 * @returns {string} The fully resolved, localized pathname. For example:
 * - `getLocalizedPathname("/fr/about", "de")` returns `"/de/about"`
 * - `getLocalizedPathname("/about", "fr")` returns `"/fr/about"`
 * - `getLocalizedPathname("/fr/about", "en")` returns `"/about"` (if "en" is default)
 *
 * @since 0.1.5
 */
export function getLocalizedPathname(pathname: string, locale: string = "") {
  const { defaultLocale, locales } = getConfigOptions();
  const localeFromPathname = pathname.split("/")[1];
  let localizedPathname = pathname;

  // 1. Strip any existing locale from the pathname to get a clean, unlocalized path.
  if (locales.includes(localeFromPathname)) {
    localizedPathname =
      localizedPathname.replace("/" + localeFromPathname, "") || "/";
  }

  // 2. Add the target locale as a prefix, but only if it's a valid,
  // non-default locale.
  if (locales.includes(locale) && locale !== defaultLocale) {
    localizedPathname = "/" + locale + localizedPathname.replace(/^\/$/, "");
  }

  return localizedPathname;
}
