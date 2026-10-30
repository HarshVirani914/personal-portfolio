import { REPORTED, poseOf, readoutOf } from "./model";

export const SSRI = {
  caption: {
    en: "a sample couple: every answer is scored as it lands, then each partner gets a report",
    de: "ein Beispielpaar: Jede Antwort wird sofort gewertet, dann bekommt jede Person einen Bericht",
  },
  hint: { en: "move across to answer", de: "darüberfahren zum Antworten" },
  readout: {
    en: readoutOf(poseOf(REPORTED), "en"),
    de: readoutOf(poseOf(REPORTED), "de"),
  },
};
