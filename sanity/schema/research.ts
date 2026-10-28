import { defineArrayMember, defineField, defineType, type StringRule } from "sanity";

const hex = (rule: StringRule) => rule.required().regex(/^#[0-9a-fA-F]{6}$/, { name: "hex colour like #1f7a6a" });

const block = defineArrayMember({
  name: "block",
  title: "Block",
  type: "object",
  fields: [
    defineField({
      name: "kind",
      type: "string",
      initialValue: "paragraph",
      options: {
        list: [
          { title: "Paragraph", value: "paragraph" },
          { title: "Code", value: "code" },
          { title: "Figure", value: "figure" },
          { title: "Pull quote", value: "quote" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "text",
      type: "localizedText",
      description: "Paragraph or pull quote. In a paragraph, [1] cites the first reference.",
      hidden: ({ parent }) => parent?.kind !== "paragraph" && parent?.kind !== "quote",
    }),
    defineField({
      name: "note",
      type: "localizedText",
      description: "Optional side note: in the margin on desktop, tap-to-open on mobile.",
      hidden: ({ parent }) => parent?.kind !== "paragraph",
    }),
    defineField({
      name: "code",
      type: "text",
      rows: 8,
      hidden: ({ parent }) => parent?.kind !== "code",
    }),
    defineField({
      name: "figure",
      type: "string",
      description: "Key of the interactive figure. Empty shows the placeholder.",
      hidden: ({ parent }) => parent?.kind !== "figure",
    }),
    defineField({
      name: "caption",
      type: "localizedString",
      hidden: ({ parent }) => parent?.kind !== "figure" && parent?.kind !== "code",
    }),
  ],
  preview: {
    select: { kind: "kind", text: "text.en", caption: "caption.en", code: "code" },
    prepare: ({ kind, text, caption, code }) => ({
      title: (text ?? caption ?? code ?? "").slice(0, 80),
      subtitle: kind,
    }),
  },
});

export const research = defineType({
  name: "research",
  title: "Research",
  type: "document",
  groups: [
    { name: "list", title: "Home list", default: true },
    { name: "page", title: "Article" },
    { name: "look", title: "Look" },
  ],
  fields: [
    defineField({
      name: "type",
      type: "string",
      group: "list",
      initialValue: "paper",
      options: {
        list: [
          { title: "Thesis", value: "thesis" },
          { title: "Paper", value: "paper" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "title", type: "localizedString", group: "list" }),
    defineField({
      name: "titleEmphasis",
      type: "localizedString",
      group: "list",
      description: "The italic tail of the title, for example Grid in Agents in the Grid. Usually empty for a paper.",
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "list",
      options: { source: "title.en" },
      validation: (rule) => rule.required(),
    }),
    defineField({ name: "status", type: "localizedString", group: "list", description: "ongoing, published, ..." }),
    defineField({ name: "period", type: "string", group: "list", description: "2026 — 27 for a thesis, 2025 for a paper" }),
    defineField({ name: "summary", type: "localizedText", group: "list", description: "The line on the home list" }),
    defineField({ name: "pdf", title: "PDF", type: "file", group: "list", options: { accept: "application/pdf" } }),
    defineField({ name: "order", type: "number", group: "list", description: "1 is shown first" }),
    defineField({ name: "hidden", type: "boolean", group: "list", initialValue: false }),

    defineField({ name: "kicker", type: "localizedString", group: "page", description: "Master's thesis · ongoing · Hof University" }),
    defineField({ name: "standfirst", type: "localizedText", group: "page", description: "The large line under the title" }),
    defineField({ name: "supervisor", type: "localizedString", group: "page" }),
    defineField({ name: "updated", type: "date", group: "page" }),
    defineField({ name: "abstract", type: "localizedText", group: "page" }),
    defineField({
      name: "sections",
      type: "array",
      group: "page",
      of: [
        defineArrayMember({
          type: "object",
          name: "section",
          fields: [
            defineField({ name: "heading", type: "localizedString" }),
            defineField({ name: "blocks", type: "array", of: [block] }),
          ],
          preview: { select: { title: "heading.en" } },
        }),
      ],
    }),
    defineField({
      name: "references",
      type: "array",
      group: "page",
      of: [{ type: "localizedString" }],
      description: "Numbered in this order. [1] in a paragraph points to the first.",
    }),
    defineField({ name: "cite", type: "localizedText", group: "page", description: "Text copied by the Cite button" }),

    defineField({ name: "accentLight", type: "string", group: "look", description: "Hex for the light theme", validation: hex }),
    defineField({ name: "accentDark", type: "string", group: "look", description: "Hex for the dark theme", validation: hex }),
  ],
  orderings: [{ name: "order", title: "Order", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "title.en", type: "type", hidden: "hidden" },
    prepare: ({ title, type, hidden }) => ({ title, subtitle: `${type ?? ""}${hidden ? " · hidden" : ""}` }),
  },
});
