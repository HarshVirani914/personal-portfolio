---
name: Harsh Virani
description: Portfolio of an AI engineer who builds agents that work in the real world.
colors:
  agent: "#2b4cc8"
  agent-dark: "#7c98ff"
  paper: "#f2f2f0"
  surface: "#e9e9e6"
  hairline: "#d6d6d2"
  muted-ink: "#5e5e5b"
  ink-2: "#3e3e3b"
  ink: "#141414"
  night: "#0e0e0f"
  night-surface: "#1a1a1c"
  night-hairline: "#2a2a2a"
  night-muted-ink: "#8e8c86"
  night-ink-2: "#c9c7c0"
  night-ink: "#eceae4"
  accent-grid: "#1f7a6a"
  accent-flag: "#a33a6b"
  accent-pocket: "#8a6100"
  accent-support: "#5b46c9"
  accent-ssri: "#a3471f"
  accent-grid-dark: "#4fb39c"
  accent-flag-dark: "#e07aa8"
  accent-pocket-dark: "#d4a63a"
  accent-support-dark: "#9a88f0"
  accent-ssri-dark: "#d9805a"
typography:
  display-xl:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(6.5rem, 4.2714rem + 9.1429vw, 12.5rem)"
    fontWeight: 400
    lineHeight: 0.9
  display-l:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(3.25rem, 1.3929rem + 7.619vw, 8.25rem)"
    fontWeight: 400
    lineHeight: 0.92
  statement:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(2.75rem, 2.1rem + 2.6667vw, 4.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(3rem, 2.6286rem + 1.5238vw, 4rem)"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Instrument Serif, serif"
    fontSize: "clamp(1.75rem, 1.5643rem + 0.7619vw, 2.25rem)"
    fontWeight: 400
    lineHeight: 1.1
  lead:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(1.125rem, 1.0321rem + 0.381vw, 1.375rem)"
    lineHeight: 1.55
  body:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(1.0625rem, 1.0161rem + 0.1905vw, 1.1875rem)"
    lineHeight: 1.7
  ui:
    fontFamily: "Geist, sans-serif"
    fontSize: "clamp(0.9375rem, 0.9143rem + 0.0952vw, 1rem)"
    lineHeight: 1.5
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "clamp(0.6875rem, 0.6643rem + 0.0952vw, 0.75rem)"
    lineHeight: 1.6
rounded:
  media: "4px"
  card: "8px"
  pill: "9999px"
spacing:
  gutter-mobile: "20px"
  gutter-tablet: "40px"
  gutter-desktop: "64px"
  touch-target: "44px"
components:
  chip:
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.pill}"
    typography: "{typography.label}"
    height: "44px"
    padding: "0 12px"
  chip-active:
    textColor: "{colors.agent}"
    rounded: "{rounded.pill}"
  skill-chip:
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    height: "44px"
    padding: "0 14px"
  tag:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    typography: "{typography.label}"
    padding: "6px 14px"
  ask-bar:
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
  project-card:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.card}"
    padding: "16px 18px"
    width: "380px"
---

# Design System: Harsh Virani

## Overview

**Creative North Star: "The Quiet Instrument"**

The site behaves like a precise tool at rest. Paper or night, one ink, hairlines, and very large serif type do the talking. Nothing competes with the name in the first viewport, and nothing moves without a reason. The agent is the single live signal on the page: its blue is the only color that belongs to the site as a whole.

Density is low and the pace is editorial. Large type carries claims, and small mono carries evidence such as dates, coordinates, kinds and counts. Components are quiet until touched: flat rows and pills at rest, with movement and color arriving only on hover, focus or use.

Motion is measured. Type rises through a mask once on arrival, rows shift a few pixels, and statements ink in word by word. Reduced motion and script-free visits get the same content as plain, static text.

**Key Characteristics:**

- One serif voice for claims, one mono voice for evidence, one sans for reading.
- Near-neutral paper and night, with a single agent blue.
- Hairlines for structure, with almost no shadow.
- Project color appears only inside that project's row and page.
- Light and dark are equal themes, and both are built from the same tokens.

## Colors

Warm-neutral paper and night with one working blue, plus a muted accent per project.

### Primary

- **Agent Blue:** the agent's voice. The prompt line, the active chip, focus outlines, links that reach the agent, and text selection. A brighter value takes over in dark mode so it holds contrast on night.

### Secondary

- **Project Accents (Grid Teal, Flag Rose, Pocket Ochre, Support Violet, SSRI Rust):** one muted hue per project, each with a light and dark value. A project sets them inline and they resolve inside its accent scope.

### Neutral

- **Paper / Night:** page background in light and dark.
- **Surface / Night Surface:** raised panels such as the abstract block and code cards.
- **Hairline / Night Hairline:** every divider, row border and resting chip border.
- **Ink / Night Ink:** primary text and the display name.
- **Ink 2:** secondary reading text, such as one-liners and bullets.
- **Muted Ink:** mono labels and metadata.

### Named Rules

**The One Signal Rule.** Agent blue means the agent or the keyboard focus. Never use it for decoration.

**The Contained Accent Rule.** A project's accent stays inside that project's row and page. It exists nowhere else.

## Typography

**Display Font:** Instrument Serif (regular and italic)
**Body Font:** Geist
**Label/Mono Font:** Geist Mono

**Character:** A condensed, high-contrast serif gives claims their weight. Geist stays out of the way, and Geist Mono reads like an instrument's readout.

### Hierarchy

- **Display XL** (400): the name in the hero, the one moment of full scale.
- **Display L and M** (400): page titles such as case study headlines.
- **Statement** (400): pinned one-line statements on the home page.
- **Headline and Title** (400): section headings and row titles, with one italic word for emphasis.
- **Lead and Body** (400): summaries and long reading.
- **UI** (400): controls, menu and one-liners.
- **Label** (400): every mono detail, such as dates, kinds, counters and chips.

### Named Rules

**The Italic Turn Rule.** A heading gets one italic phrase at most, and it carries the point of the sentence.

**The Readout Rule.** Facts that could be measured or dated are set in mono. Claims are set in serif.

## Layout

A twelve-column grid from 1024px up, with page gutters of 20px, 40px and 64px at mobile, tablet and desktop. Rows align to shared columns: a mono column for dates or numbers, then a wide serif column, then supporting text. Below 1024px, rows stack and the desktop link rows become tap-to-expand cards.

Sections are separated by generous space and a single hairline. Statements pin for one viewport each. Fixed elements are limited to the header, which gains a blurred background only after scrolling, and the Ask bar.

## Elevation & Depth

Depth comes from tone and hairlines. Surfaces are flat at rest, with a blurred header as the only glass.

### Shadow Vocabulary

- **Hover card** (`0 30px 60px -20px rgba(20,20,20,.45), 0 2px 6px rgba(20,20,20,.12)`): the project card that follows the cursor. It is the only shadow in the site's own components.

### Named Rules

**The Flat At Rest Rule.** A shadow appears only on something that has been summoned.

## Shapes

Mostly square edges and hairlines, with three radii: 4px for media, 8px for cards and code, and full pills for chips, tags and the Ask bar.

## Components

### Chips

- **Style:** hairline pill with mono text, 44px tall on touch. Terminal chips lose their pill from 1024px and read as plain mono commands.
- **State:** the active chip turns agent blue with a matching border.

### Tags

- **Style:** hairline pill in mono ink. Linked tags darken their border on hover and show an arrow.

### Rows

- **Style:** full-width hairline rows for work, experience and certifications. The title shifts a few pixels on hover or focus.
- **Project rows:** a line in the project's accent draws under the row, and an arrow turns to point up and right.

### Project Card

- **Corner Style:** 8px, on dark card ink in both themes.
- **Behavior:** follows the cursor inside a desktop row. It is decorative, and the row itself remains the link.

### Navigation

- **Style:** coordinates on the left, Menu or text links on the right. A dark sheet holds navigation on mobile.

### Ask Bar

The site's signature entry point. A pill with an ink border and a single agent-blue dot, opening the agent overlay.

### Project Figure

Isometric hairline drawings in the project's accent, set on a tinted band below the case study header.

## Do's and Don'ts

### Do:

- **Do** keep every interactive target at least 44px tall on touch, except inline references.
- **Do** give every animation a static version under reduced motion and without scripts.
- **Do** set dates, numbers, kinds and coordinates in Geist Mono.
- **Do** use the token that resolves per theme, so light and dark stay in step.
- **Do** keep hover movement to a few pixels.

### Don't:

- **Don't** make this look like a generic developer template.
- **Don't** use agent blue as decoration.
- **Don't** let a project's accent leave its row or page.
- **Don't** add shadows to surfaces at rest.
- **Don't** add a second heavy idea to the first viewport.
