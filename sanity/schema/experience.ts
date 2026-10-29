import { defineArrayMember, defineField, defineType } from "sanity";

export const experience = defineType({
  name: "experience",
  title: "Experience",
  type: "document",
  fields: [
    defineField({ name: "company", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "role", type: "localizedString", description: "Job title" }),
    defineField({ name: "years", type: "localizedString", description: "For example 2024 — 2025, or 2025 — now" }),
    defineField({
      name: "bullets",
      type: "array",
      description: "Shown when the row is expanded. Drag to reorder.",
      of: [defineArrayMember({ type: "localizedString" })],
    }),
    defineField({ name: "order", type: "number", description: "1 is shown first" }),
    defineField({ name: "hidden", type: "boolean", initialValue: false }),
  ],
  orderings: [{ name: "order", title: "Order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "company", subtitle: "role.en", hidden: "hidden" },
    prepare: ({ title, subtitle, hidden }) => ({ title, subtitle: `${hidden ? "hidden · " : ""}${subtitle ?? ""}` }),
  },
});
