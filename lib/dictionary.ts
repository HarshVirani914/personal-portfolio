import type { Locale } from "@/lib/i18n";

/**
 * Interface chrome only (navigation, controls, labels). Everything a visitor
 * reads as content comes from the CMS.
 */
const dictionaries = {
  en: {
    skipToContent: "Skip to content",
    nav: { work: "Work", research: "Research", about: "About", contact: "Contact" },
    menu: { open: "Menu", close: "Close", title: "Navigation" },
    theme: { toLight: "Switch to light theme", toDark: "Switch to dark theme", light: "Light", dark: "Dark" },
    locale: { label: "Language", en: "EN", de: "DE" },
    statements: "Statements",
    terminal: { label: "Terminal", run: "run:" },
  },
  de: {
    skipToContent: "Zum Inhalt springen",
    nav: { work: "Arbeiten", research: "Forschung", about: "Über mich", contact: "Kontakt" },
    menu: { open: "Menü", close: "Schließen", title: "Navigation" },
    theme: { toLight: "Zum hellen Design wechseln", toDark: "Zum dunklen Design wechseln", light: "Hell", dark: "Dunkel" },
    locale: { label: "Sprache", en: "EN", de: "DE" },
    statements: "Aussagen",
    terminal: { label: "Terminal", run: "ausführen:" },
  },
} satisfies Record<Locale, unknown>;

export type Dictionary = (typeof dictionaries)["en"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
