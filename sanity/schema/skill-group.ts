import { defineArrayMember, defineField, defineType } from "sanity";

export const skillGroup = defineType({
  name: "skillGroup",
  title: "Skill group",
  type: "document",
  fields: [
    defineField({ name: "title", type: "localizedString", description: "Agents & LLMs, Machine learning, ..." }),
    defineField({ name: "order", type: "number", description: "1 is shown first" }),
    defineField({ name: "hidden", type: "boolean", initialValue: false }),
    defineField({
      name: "skills",
      type: "array",
      description: "Drag to reorder. The first skill sits at the top of the column.",
      of: [
        defineArrayMember({
          name: "skill",
          type: "object",
          fields: [
            defineField({ name: "name", type: "string", validation: (rule) => rule.required() }),
            defineField({ name: "note", type: "localizedString", description: "One line: where I used it" }),
            defineField({
              name: "reference",
              title: "Project or research",
              type: "reference",
              to: [{ type: "project" }, { type: "research" }],
              description: "Tints the note with that item's colour. Leave empty for the muted colour.",
            }),
            defineField({ name: "hidden", type: "boolean", initialValue: false }),
          ],
          preview: {
            select: { title: "name", subtitle: "note.en", hidden: "hidden" },
            prepare: ({ title, subtitle, hidden }) => ({ title, subtitle: `${hidden ? "hidden · " : ""}${subtitle ?? ""}` }),
          },
        }),
      ],
    }),
  ],
  orderings: [{ name: "order", title: "Order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title.en", hidden: "hidden" },
    prepare: ({ title, hidden }) => ({ title, subtitle: hidden ? "hidden" : "" }),
  },
});
