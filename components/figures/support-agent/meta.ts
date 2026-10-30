import { REST, poseOf, readoutOf } from "./model";

export const SUPPORT_AGENT = {
  caption: {
    en: "an answer gets through only if every claim fits its source; if not it searches again, up to twice, then points to a person",
    de: "eine Antwort kommt nur durch, wenn jede Aussage zu ihrer Quelle passt; sonst sucht sie neu, höchstens zweimal, und verweist dann an eine Person",
  },
  hint: {
    en: "click for the next question",
    de: "klicken für die nächste Frage",
  },
  readout: {
    en: readoutOf(poseOf(REST), "en"),
    de: readoutOf(poseOf(REST), "de"),
  },
};
