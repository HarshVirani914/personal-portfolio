import { defineArrayMember, defineField, defineType } from "sanity";

export const hero = defineType({
  name: "hero",
  title: "Hero",
  type: "document",
  fields: [
    defineField({
      name: "annotations",
      description: "Marked [01], [02], … in the order shown here",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "annotation",
          fields: [
            defineField({ name: "text", type: "localizedString" }),
            defineField({ name: "hidden", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "text.en", hidden: "hidden" }, prepare: ({ title, hidden }) => ({ title, subtitle: hidden ? "Hidden" : "" }) },
        }),
      ],
    }),
    defineField({
      name: "terminalScripts",
      description: "Commands the hero terminal types and runs, in order",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "terminalScript",
          fields: [
            defineField({ name: "label", type: "localizedString", description: "Button text" }),
            defineField({ name: "command", type: "localizedString", description: "Typed after the prompt" }),
            defineField({ name: "output", type: "array", of: [defineArrayMember({ type: "localizedString" })], description: "Printed lines" }),
            defineField({ name: "hidden", type: "boolean", initialValue: false }),
          ],
          preview: { select: { title: "label.en", subtitle: "command.en", hidden: "hidden" }, prepare: ({ title, subtitle, hidden }) => ({ title, subtitle: hidden ? `${subtitle} (hidden)` : subtitle ?? "" }) },
        }),
      ],
    }),
  ],
});
