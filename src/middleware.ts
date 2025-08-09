import type { APIContext, MiddlewareNext } from "astro";
import i18n from "i18next";
import { getConfig } from "./utils";

const ASTRO_RESERVED_ROUTES = ["/_astro", "/_actions", "/_server-islands"];

/**
 * Astro middleware to handle internationalization (i18n) on every request.
 *
 * This middleware intercepts incoming requests to determine the appropriate locale
 * from the URL pathname. It then sets the i18next language for the current
 * request context, ensuring that subsequent rendering and API calls use the
 * correct translations.
 *
 * @param {APIContext} context - The Astro API context, providing access to the request URL.
 * @param {MiddlewareNext} next - A function to call to pass control to the next middleware in the sequence.
 * @returns {Promise<Response>} A promise that resolves to the response from the next middleware.
 *
 * @since 0.2.0
 */
export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const { supportedLngs: lngs, lng } = getConfig();

  if (
    [...ASTRO_RESERVED_ROUTES].some(
      (route) =>
        context.url.pathname === route ||
        context.url.pathname.startsWith(route + "/")
    )
  ) {
    return next();
  }

  const localeFromPathname = context.url.pathname.split("/")[1];

  // TODO: Ensure this is correct
  const potentialLocales = [localeFromPathname];
  if (lng) {
    potentialLocales.push(lng);
  }

  // If lng is 'cimode', bypass normal locale detection and use cimode directly
  if (lng === "cimode") {
    await i18n.changeLanguage("cimode");
    return next();
  }

  const nextLocale = potentialLocales.find((locale) => {
    const containsLocale = Array.isArray(lngs) && lngs.includes(locale);
    const supportsAnyLanguage = lngs === false;

    return locale && (containsLocale || supportsAnyLanguage);
  });

  if (nextLocale) {
    await i18n.changeLanguage(nextLocale);
  }

  return next();
}
