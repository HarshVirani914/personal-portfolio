import { about } from "./about";
import { agent } from "./agent";
import { certification } from "./certification";
import { education } from "./education";
import { experience } from "./experience";
import { hero } from "./hero";
import { localizedString, localizedText } from "./localized";
import { project } from "./project";
import { research } from "./research";
import { skillGroup } from "./skill-group";
import { statement } from "./statement";
import { siteSettings } from "./site-settings";

export const schemaTypes = [
  localizedString,
  localizedText,
  siteSettings,
  hero,
  statement,
  project,
  research,
  skillGroup,
  experience,
  education,
  certification,
  about,
  agent,
];
