import {
  defineArrayMember,
  defineField,
  defineType,
  type StringRule,
} from "sanity";

const hex = (rule: StringRule) =>
  rule
    .required()
    .regex(/^#[0-9a-fA-F]{6}$/, { name: "hex colour like #a33a6b" });

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "list", title: "Home list", default: true },
    { name: "page", title: "Project page" },
    { name: "look", title: "Look" },
  ],
  fields: [
    defineField({ name: "title", type: "localizedString", group: "list" }),
    defineField({
      name: "slug",
      type: "slug",
      group: "list",
      options: { source: "title.en" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "kind",
      type: "localizedString",
      group: "list",
      description: "Agent, Product, ...",
    }),
    defineField({ name: "year", type: "string", group: "list" }),
    defineField({
      name: "oneLiner",
      type: "localizedString",
      group: "list",
      description: "The line on the home list row",
    }),
    defineField({
      name: "summary",
      type: "localizedText",
      group: "list",
      description: "Shown on the hover card",
    }),
    defineField({
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      group: "list",
      options: { layout: "tags" },
    }),
    defineField({
      name: "status",
      type: "localizedString",
      group: "list",
      description: "Short: live, delivered, public demo",
    }),
    defineField({
      name: "order",
      type: "number",
      group: "list",
      description: "1 is shown first (newest first)",
    }),
    defineField({
      name: "hidden",
      type: "boolean",
      group: "list",
      initialValue: false,
    }),

    defineField({
      name: "headline",
      type: "localizedString",
      group: "page",
      description: "Big heading, before the italic part",
    }),
    defineField({
      name: "headlineEmphasis",
      type: "localizedString",
      group: "page",
      description: "The italic part. A full stop follows it.",
    }),
    defineField({ name: "role", type: "localizedString", group: "page" }),
    defineField({ name: "client", type: "localizedString", group: "page" }),
    defineField({ name: "stack", type: "localizedString", group: "page" }),
    defineField({
      name: "statusDetail",
      type: "localizedString",
      group: "page",
      description: "Longer status for the meta row",
    }),
    defineField({ name: "problem", type: "localizedText", group: "page" }),
    defineField({
      name: "built",
      title: "What I built",
      type: "localizedText",
      group: "page",
    }),
    defineField({
      name: "stats",
      title: "Outcome stats",
      type: "array",
      group: "page",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "value", type: "localizedString" }),
            defineField({ name: "label", type: "localizedString" }),
            defineField({
              name: "accent",
              type: "boolean",
              initialValue: false,
              description: "Show the value in the project colour",
            }),
          ],
          preview: { select: { title: "value.en", subtitle: "label.en" } },
        }),
      ],
    }),
    defineField({
      name: "liveUrl",
      title: "Visit live URL",
      type: "url",
      group: "page",
    }),
    defineField({
      name: "figure",
      type: "string",
      group: "page",
      description:
        "Key of the interactive figure. Empty shows the placeholder.",
    }),

    defineField({
      name: "accentLight",
      type: "string",
      group: "look",
      description: "Hex for the light theme",
      validation: hex,
    }),
    defineField({
      name: "accentDark",
      type: "string",
      group: "look",
      description: "Hex for the dark theme",
      validation: hex,
    }),
  ],
  orderings: [
    {
      name: "order",
      title: "Order",
      by: [{ field: "order", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "title.en", subtitle: "slug.current", hidden: "hidden" },
    prepare: ({ title, subtitle, hidden }) => ({
      title,
      subtitle: `${subtitle ?? ""}${hidden ? " · hidden" : ""}`,
    }),
  },
});
