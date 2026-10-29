import { defineField, defineType } from "sanity";

export const certification = defineType({
  name: "certification",
  title: "Certification",
  type: "document",
  fields: [
    defineField({ name: "name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "issuer", type: "string", validation: (rule) => rule.required() }),
    defineField({
      name: "credentialUrl",
      title: "Credential link",
      type: "url",
      description: "Where a visitor can verify it. Certifications without a link are not shown.",
      validation: (rule) => rule.required().uri({ scheme: ["https"] }),
    }),
    defineField({ name: "order", type: "number", description: "1 is shown first" }),
    defineField({ name: "hidden", type: "boolean", initialValue: false }),
  ],
  orderings: [{ name: "order", title: "Order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "issuer", hidden: "hidden" },
    prepare: ({ title, subtitle, hidden }) => ({ title, subtitle: `${hidden ? "hidden · " : ""}${subtitle ?? ""}` }),
  },
});
