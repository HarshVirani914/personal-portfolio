import { defineField, defineType } from "sanity";

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "firstName", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "lastName", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "coordinates",
      type: "string",
      description: "Shown in the header, for example 50.32° N, 11.92° E",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "city",
      type: "localizedString",
      description: "Revealed on hover (tap on mobile) next to the coordinates",
    }),
    defineField({ name: "description", title: "SEO description", type: "localizedString" }),
  ],
});
