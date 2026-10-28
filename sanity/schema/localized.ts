import { defineField, defineType } from "sanity";

/** A string with one value per language. German falls back to English when empty. */
export const localizedString = defineType({
  name: "localizedString",
  title: "Text",
  type: "object",
  fields: [
    defineField({ name: "en", title: "English", type: "string" }),
    defineField({ name: "de", title: "Deutsch", type: "string" }),
  ],
  options: { columns: 2 },
});
