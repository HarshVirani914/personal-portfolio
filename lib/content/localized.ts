import type { Locale } from "@/lib/i18n";

/** A text field as stored in the CMS: one value per language. */
export type Localized = { en?: string | null | undefined; de?: string | null | undefined };

/** Picks the requested language, falling back to English when it is missing or blank. */
export function resolveText(value: Localized | null | undefined, locale: Locale): string {
  if (!value) return "";
  const picked = value[locale];
  if (picked && picked.trim() !== "") return picked;
  return value.en ?? "";
}

type Curated = { hidden?: boolean | null; order?: number | null };

/**
 * Drops hidden items and applies CMS order. Items with an `order` come first,
 * ascending; the rest keep their stored position. The sort is stable.
 */
export function visibleInOrder<T extends Curated>(items: readonly T[] | null | undefined): T[] {
  return (items ?? [])
    .map((item, position) => ({ item, position }))
    .filter(({ item }) => !item.hidden)
    .sort((a, b) => {
      const ao = a.item.order ?? Number.POSITIVE_INFINITY;
      const bo = b.item.order ?? Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao < bo ? -1 : 1;
      return a.position - b.position;
    })
    .map(({ item }) => item);
}
