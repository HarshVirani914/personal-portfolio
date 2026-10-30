import { REST, poseOf, readoutOf } from "./model";
import { DROP_FROM, RAIL_TOP, coinZ } from "./view";

const rest = poseOf(REST, coinZ, DROP_FROM, RAIL_TOP);

export const POCKETPULSE = {
  caption: {
    en: "every expense lands on the phone first, so a lost connection stops nothing",
    de: "jede Ausgabe landet zuerst auf dem Handy, eine fehlende Verbindung hält also nichts auf",
  },
  hint: {
    en: "move across · Space lowers the bridge",
    de: "darüberfahren · Leertaste senkt die Brücke",
  },
  readout: { en: readoutOf(rest, "en"), de: readoutOf(rest, "de") },
};
