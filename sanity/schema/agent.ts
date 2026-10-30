import { defineArrayMember, defineField, defineType } from "sanity";

export const agent = defineType({
  name: "agent",
  title: "Agent",
  type: "document",
  fields: [
    defineField({
      name: "suggestions",
      title: "Suggested questions",
      description: "Three or four read best. Shown in the order here.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "suggestion",
          fields: [
            defineField({ name: "question", type: "localizedString" }),
            defineField({
              name: "label",
              title: "Short label",
              type: "localizedString",
              description: "Shown on phones. Falls back to the question.",
            }),
            defineField({
              name: "hidden",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: { title: "question.en", hidden: "hidden" },
            prepare: ({ title, hidden }) => ({
              title,
              subtitle: hidden ? "Hidden" : "",
            }),
          },
        }),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Agent" }) },
});
