import { defineArrayMember, defineField, defineType } from "sanity";

export const education = defineType({
  name: "education",
  title: "Education",
  type: "document",
  fields: [
    defineField({ name: "degree", type: "localizedString" }),
    defineField({ name: "institution", type: "localizedString" }),
    defineField({ name: "years", type: "localizedString", description: "For example 2021 — 2024, or 2025 — now" }),
    defineField({
      name: "tags",
      type: "array",
      description: "Short badges such as Dean's List 2025 or MYSY Scholarship. Add a proof link to make a badge clickable.",
      of: [
        defineArrayMember({
          name: "tag",
          type: "object",
          fields: [
            defineField({ name: "label", type: "localizedString" }),
            defineField({
              name: "url",
              title: "Proof link",
              type: "url",
              description: "Optional. Links the badge to a certificate or announcement.",
              validation: (rule) => rule.uri({ scheme: ["https"] }),
            }),
          ],
          preview: { select: { title: "label.en", subtitle: "url" } },
        }),
      ],
    }),
    defineField({ name: "order", type: "number", description: "1 is shown first" }),
    defineField({ name: "hidden", type: "boolean", initialValue: false }),
  ],
  orderings: [{ name: "order", title: "Order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "degree.en", subtitle: "institution.en", hidden: "hidden" },
    prepare: ({ title, subtitle, hidden }) => ({ title, subtitle: `${hidden ? "hidden · " : ""}${subtitle ?? ""}` }),
  },
});
