import { COUNT, poseOf, readoutOf } from "./model";
import { CARD_Z, LIFT, READER_TOP, READER_X, slotX } from "./view";

const finished = poseOf(COUNT, slotX, READER_X, LIFT, READER_TOP - CARD_Z);
const none = Array.from({ length: COUNT }, () => false);

export const FLAG_AND_FILL = {
  caption: {
    en: "a sample of eight fields, filed one by one; a raised flag waits for a person",
    de: "eine Stichprobe von acht Feldern, einzeln abgelegt; eine gehobene Fahne wartet auf eine Person",
  },
  hint: {
    en: "move across the tray · click to check a flag",
    de: "über den Kasten fahren · klicken prüft eine Fahne",
  },
  readout: {
    en: readoutOf(finished, none, "en"),
    de: readoutOf(finished, none, "de"),
  },
};
