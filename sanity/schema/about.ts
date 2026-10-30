import { defineArrayMember, defineField, defineType } from "sanity";

/** A name with a short note beside it: a language and its level, an interest and a line about it. */
const row = (name: string, title: string, detail: string) =>
  defineArrayMember({
    type: "object",
    name,
    title,
    fields: [
      defineField({ name: "name", type: "localizedString" }),
      defineField({
        name: "detail",
        type: "localizedString",
        description: detail,
      }),
      defineField({ name: "hidden", type: "boolean", initialValue: false }),
    ],
    preview: {
      select: { title: "name.en", subtitle: "detail.en", hidden: "hidden" },
      prepare: ({ title, subtitle, hidden }) => ({
        title,
        subtitle: hidden ? `${subtitle ?? ""} (hidden)` : (subtitle ?? ""),
      }),
    },
  });

export const about = defineType({
  name: "about",
  title: "About",
  type: "document",
  fields: [
    defineField({
      name: "headline",
      type: "localizedString",
      description:
        "The statement at the top. Wrap one word in *asterisks* to set it in italic.",
    }),
    defineField({
      name: "portrait",
      type: "image",
      options: { hotspot: true },
      description: "Shown in grayscale and revealed with a wipe",
      fields: [
        defineField({
          name: "alt",
          title: "Alt text",
          type: "localizedString",
          description: "Read out by screen readers",
          validation: (rule) =>
            rule.custom((value?: { en?: string }) =>
              value?.en?.trim() ? true : "Describe the portrait in English"
            ),
        }),
        defineField({
          name: "caption",
          type: "localizedString",
          description:
            "Small line under the portrait, e.g. Hof, Germany · 2026",
        }),
      ],
    }),
    defineField({
      name: "story",
      description: "One entry per paragraph, in reading order",
      type: "array",
      of: [defineArrayMember({ type: "localizedText" })],
    }),
    defineField({
      name: "languages",
      type: "array",
      of: [row("language", "Language", "Level, e.g. native, learning daily")],
    }),
    defineField({
      name: "interests",
      title: "Outside work",
      type: "array",
      of: [row("interest", "Interest", "A short line, e.g. long campaigns")],
    }),
    defineField({
      name: "now",
      title: "Now",
      description: "What you are focused on today, in the order shown",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "nowItem",
          title: "Now item",
          fields: [
            defineField({
              name: "label",
              type: "localizedString",
              description: "Researching, Building, Learning, Looking for, …",
            }),
            defineField({ name: "text", type: "localizedString" }),
            defineField({
              name: "highlight",
              type: "boolean",
              description: "Sets the label in the agent blue",
              initialValue: false,
            }),
            defineField({
              name: "hidden",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: "label.en",
              subtitle: "text.en",
              hidden: "hidden",
            },
            prepare: ({ title, subtitle, hidden }) => ({
              title,
              subtitle: hidden
                ? `${subtitle ?? ""} (hidden)`
                : (subtitle ?? ""),
            }),
          },
        }),
      ],
    }),
    defineField({
      name: "nowUpdated",
      title: "Now updated",
      type: "date",
      description:
        "Shown beside the Now block. Change it whenever you edit Now.",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: { prepare: () => ({ title: "About" }) },
});
