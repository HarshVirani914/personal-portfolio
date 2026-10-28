import { defineField, defineType } from "sanity";

export const statement = defineType({
  name: "statement",
  title: "Statement",
  type: "document",
  fields: [
    defineField({ name: "text", type: "localizedString", description: "One pinned sentence on the home page" }),
    defineField({ name: "order", type: "number", description: "1 is shown first" }),
    defineField({ name: "hidden", type: "boolean", initialValue: false }),
  ],
  orderings: [{ name: "order", title: "Order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "text.en", order: "order", hidden: "hidden" },
    prepare: ({ title, order, hidden }) => ({ title, subtitle: `${order ?? "–"}${hidden ? " · hidden" : ""}` }),
  },
});
