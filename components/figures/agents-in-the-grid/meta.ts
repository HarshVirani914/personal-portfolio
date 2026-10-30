import { LAST, poseOf, readoutOf } from "./model";

export const AGENTS_IN_THE_GRID = {
  caption: {
    en: "the agent's loop on a sheet: look, read a range, reason, act, check",
    de: "die Schleife des Agenten auf einem Blatt: ansehen, Bereich lesen, abwägen, handeln, prüfen",
  },
  hint: {
    en: "drag the carriage along its rail",
    de: "den Wagen entlang der Schiene ziehen",
  },
  readout: {
    en: readoutOf(poseOf(LAST), "en"),
    de: readoutOf(poseOf(LAST), "de"),
  },
};
