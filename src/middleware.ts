import type { APIContext, MiddlewareNext } from "astro";
import i18n from "i18next";
import { getLocaleConfig } from "./utils";

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
  const { locales, defaultLocale } = getLocaleConfig();

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
  const nextLocale = [localeFromPathname, defaultLocale].find(
    (locale) => locale && locales.includes(locale)
  );

  await i18n.changeLanguage(nextLocale);

  return next();
}
