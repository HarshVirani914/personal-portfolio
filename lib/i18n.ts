export const locales = ["en", "de"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export function isLocale(value: string | undefined): value is Locale {
  return locales.includes(value as Locale);
}

/** Splits a pathname into its locale and the path without the locale prefix. */
export function parseLocalePath(pathname: string): {
  locale: Locale;
  path: string;
} {
  const [, first, ...rest] = pathname.split("/");
  if (isLocale(first) && first !== defaultLocale) {
    return { locale: first, path: `/${rest.join("/")}` };
  }
  if (first === defaultLocale) {
    return { locale: defaultLocale, path: `/${rest.join("/")}` };
  }
  return { locale: defaultLocale, path: pathname || "/" };
}

/** Builds the public URL path for a locale. English stays unprefixed. */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

/** Same page in another language. */
export function switchLocale(pathname: string, target: Locale): string {
  return localizedPath(parseLocalePath(pathname).path, target);
}
