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
    work: {
      kicker: "Selected work",
      headingBefore: "Things I've",
      headingEmphasis: "shipped",
      headingAfter: ".",
      openCase: "Open case",
      openCaseFor: "open case study",
      fig: "fig.",
      back: "Work",
      project: "Project",
      problem: "The problem",
      built: "What I built",
      outcome: "Outcome",
      readout: "Readout",
      role: "Role",
      client: "Client",
      stack: "Stack",
      status: "Status",
      kind: "Kind",
      year: "Year",
      figureCaption: "interactive figure in progress",
      figureLabel: "Placeholder for the interactive figure",
      visitLive: "Visit live",
      nextProject: "Next project",
    },
  },
  de: {
    skipToContent: "Zum Inhalt springen",
    nav: { work: "Arbeiten", research: "Forschung", about: "Über mich", contact: "Kontakt" },
    menu: { open: "Menü", close: "Schließen", title: "Navigation" },
    theme: { toLight: "Zum hellen Design wechseln", toDark: "Zum dunklen Design wechseln", light: "Hell", dark: "Dunkel" },
    locale: { label: "Sprache", en: "EN", de: "DE" },
    statements: "Aussagen",
    terminal: { label: "Terminal", run: "ausführen:" },
    work: {
      kicker: "Ausgewählte Arbeiten",
      headingBefore: "Was ich",
      headingEmphasis: "ausgeliefert",
      headingAfter: " habe.",
      openCase: "Fall öffnen",
      openCaseFor: "Fallstudie öffnen",
      fig: "Abb.",
      back: "Arbeiten",
      project: "Projekt",
      problem: "Das Problem",
      built: "Was ich gebaut habe",
      outcome: "Ergebnis",
      readout: "Anzeige",
      role: "Rolle",
      client: "Kunde",
      stack: "Stack",
      status: "Status",
      kind: "Art",
      year: "Jahr",
      figureCaption: "interaktive Grafik in Arbeit",
      figureLabel: "Platzhalter für die interaktive Grafik",
      visitLive: "Live ansehen",
      nextProject: "Nächstes Projekt",
    },
  },
} satisfies Record<Locale, unknown>;

export type Dictionary = (typeof dictionaries)["en"];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
