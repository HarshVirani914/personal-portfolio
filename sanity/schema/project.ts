import { defineField, defineType } from "sanity";

/** Minimal for now; the rest of the project fields arrive with the project pages. */
export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({ name: "title", type: "localizedString" }),
    defineField({ name: "slug", type: "slug", options: { source: "title.en" }, validation: (rule) => rule.required() }),
    defineField({ name: "oneLiner", type: "localizedString" }),
    defineField({ name: "order", type: "number" }),
    defineField({ name: "hidden", type: "boolean", initialValue: false }),
  ],
  preview: { select: { title: "title.en", subtitle: "slug.current" } },
});
