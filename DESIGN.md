---
name: Remedi Design System
description: >
  A pharmacist's reference sheet: a cool off-white page with a faint dot grid,
  one botanical green, hairline borders, Manrope for reading and IBM Plex Mono
  for every label, count and code. Light and dark share every token name.
colors:
  # Surfaces. Light value first; the `-dark` sibling is the same token under `.dark`.
  background: "#f6f7f4"
  background-dark: "#0c100d"
  foreground: "#131a15"
  foreground-dark: "#e7ebe6"
  card: "#ffffff"
  card-dark: "#121814"
  muted: "#eef0ec"
  muted-dark: "#171e19"
  muted-foreground: "#5c675f"
  muted-foreground-dark: "#97a39a"
  secondary: "#eceeea"
  secondary-dark: "#1b221d"
  accent: "#e9f1eb"
  accent-dark: "#1a241d"
  # The one accent: botanical green
  primary: "#1f6b45"
  primary-dark: "#4fc07c"
  primary-foreground: "#ffffff"
  primary-foreground-dark: "#07110a"
  # Hairlines
  border: "rgba(19, 26, 21, 0.1)"
  border-dark: "rgba(231, 235, 230, 0.09)"
  border-strong: "rgba(19, 26, 21, 0.18)"
  border-strong-dark: "rgba(231, 235, 230, 0.16)"
  input: "rgba(19, 26, 21, 0.14)"
  input-dark: "rgba(231, 235, 230, 0.14)"
  ring: "rgba(31, 107, 69, 0.45)"
  ring-dark: "rgba(79, 192, 124, 0.5)"
  # Semantic status. `success` is the green again on purpose.
  destructive: "#b3372b"
  destructive-dark: "#e0675a"
  destructive-foreground: "#ffffff"
  destructive-foreground-dark: "#140807"
  warning: "#9a6a12"
  warning-dark: "#e0b15a"
  success: "#1f6b45"
  success-dark: "#4fc07c"
  info: "#35618f"
  info-dark: "#7fa9d6"
  # The paid tier's ochre, and its tinted surface
  premium: "#8a5a14"
  premium-dark: "#e3b45f"
  premium-surface: "#fbf3e2"
  premium-surface-dark: "rgba(227, 180, 95, 0.12)"
  # Charts: green, blue, ochre, red, grey
  chart-1: "#1f6b45"
  chart-1-dark: "#4fc07c"
  chart-2: "#35618f"
  chart-2-dark: "#7fa9d6"
  chart-3: "#9a6a12"
  chart-3-dark: "#e0b15a"
  chart-4: "#b3372b"
  chart-4-dark: "#e0675a"
  chart-5: "#5c675f"
  chart-5-dark: "#97a39a"
  # The app-icon and Open Graph mark: a two-stop green, rendered by next/og
  # where CSS variables do not exist. Not for UI.
  icon-deep: "#1e6b38"
  icon-bright: "#2d8a4e"
typography:
  display:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  heading-1:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.035em"
  heading-2:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  heading-3:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  body-lg:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "0"
  body:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  nav:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "-0.01em"
  body-sm:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "0"
  caption:
    fontFamily: "Manrope, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  eyebrow:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.14em"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.45
    letterSpacing: "0.02em"
  data:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0"
  # The full size ramp the utilities draw from (Tailwind's default steps plus
  # the two custom steps above: 11px mono labels and 15px nav/link text).
  scale:
    label: "0.6875rem"
    xs: "0.75rem"
    sm: "0.875rem"
    nav: "0.9375rem"
    base: "1rem"
    lg: "1.125rem"
    xl: "1.25rem"
    2xl: "1.5rem"
    3xl: "1.875rem"
    4xl: "2.25rem"
    5xl: "3rem"
    6xl: "3.75rem"
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  3xl: "20px"
  4xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
  4xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-primary-hover:
    backgroundColor: "rgba(31, 107, 69, 0.9)"
    textColor: "{colors.primary-foreground}"
  button-outline:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-outline-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  button-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-secondary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.foreground}"
  button-tonal:
    backgroundColor: "rgba(31, 107, 69, 0.05)"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-tonal-hover:
    backgroundColor: "rgba(31, 107, 69, 0.1)"
    textColor: "{colors.primary}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-ghost-hover:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.foreground}"
  button-destructive:
    backgroundColor: "{colors.destructive}"
    textColor: "{colors.destructive-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
  button-lg:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "0 24px"
    height: "44px"
  button-sm:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "32px"
  input:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
    height: "40px"
  input-search:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.nav}"
    rounded: "{rounded.md}"
    padding: "8px 112px 8px 40px"
    height: "48px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.lg}"
    padding: "20px"
  badge:
    backgroundColor: "rgba(31, 107, 69, 0.1)"
    textColor: "{colors.primary}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  badge-secondary:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  badge-destructive:
    backgroundColor: "rgba(179, 55, 43, 0.1)"
    textColor: "{colors.destructive}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  badge-outline:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  alert:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  alert-warning:
    backgroundColor: "rgba(154, 106, 18, 0.05)"
    textColor: "{colors.foreground}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  alert-destructive:
    backgroundColor: "rgba(179, 55, 43, 0.05)"
    textColor: "{colors.destructive}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  eyebrow:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    typography: "{typography.eyebrow}"
  eyebrow-muted:
    backgroundColor: "transparent"
    textColor: "{colors.muted-foreground}"
    typography: "{typography.eyebrow}"
  premium-chip:
    backgroundColor: "{colors.premium-surface}"
    textColor: "{colors.premium}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "2px 6px"
  header:
    backgroundColor: "rgba(246, 247, 244, 0.85)"
    textColor: "{colors.foreground}"
    typography: "{typography.nav}"
    height: "56px"
---

# Design System: Remedi

## Overview

**Creative North Star: "The Pharmacist's Reference Sheet"**

Remedi answers one anxious question: what can I safely take beside this? The
page is built to be trusted the way a printed reference is trusted. The sheet is
a cool off-white (`background`) with a barely-there 28px dot grid printed
through it; the ink is a near-black with a green cast (`foreground`); the
structure is a 1px hairline (`border`); the labels, counts, prices and reference
numbers are set in IBM Plex Mono, the way a monograph sets its codes; and one
botanical green (`primary`) is the only hue on a normal page. It is spent on the
action, the eyebrow, the leaf mark and the "this is fine" signal, and nowhere
else.

The tone is calm and slightly clinical rather than wellness-warm. There is no
gradient wash, no glassmorphism and almost no shadow; depth is a hairline that
firms up on hover. Two secondary hues exist because the product needs them to
mean something: an ochre (`premium`) for the paid tier, and the status set
(`warning`, `destructive`, `info`) for the safety language the catalogue is
built around. Nothing else is coloured.

Density is compact. Body copy is 14px in most of the app and 16px in the hero
and search, card padding is 20px, control height is 36px, and section rhythm
runs 48 to 64px. Weight is nearly binary: 600 for headings and the wordmark, 500
for controls and mono labels, 400 for everything else.

**Key Characteristics:**

- Cool off-white sheet with a 7%-alpha dot grid; near-black ink with a green cast
- One botanical green, and it is also the success colour
- Hairline borders everywhere; shadows only where a surface actually floats
- Manrope for reading, IBM Plex Mono for every label, count and code
- Tight negative tracking on headings, wide positive tracking on the mono eyebrow
- Light and dark share every token name; components never branch on theme

## Colors

Achromatic greens carry the page and one saturated green is the only accent.
Every colour is a CSS custom property on `:root` and `.dark`, mapped into
Tailwind 4 through `@theme inline` as `--color-*`, so utilities such as
`bg-background`, `text-muted-foreground` and `border-border` re-skin without
edits. The frontmatter is normative; this section names the roles.

### Primary

- **Botanical Green** (`primary`, `#1f6b45`; `#4fc07c` in dark): the action colour.
  The primary button fill, the leaf mark, the eyebrow, the focus outline, the
  selection highlight, the tonal button's ink and the hero glow. It doubles as
  `success` because in this product "safe" and "go" are the same message. It is
  lightened in dark mode so it still clears AA on the near-black sheet.
- **Ink** (`foreground`, `#131a15`; `#e7ebe6` in dark): headings, body, the
  wordmark and, at low alpha, every hairline (`border` is ink at 10%).

### Secondary

- **Premium Ochre** (`premium`, `#8a5a14`; `#e3b45f` in dark) with its tinted
  surface (`premium-surface`, `#fbf3e2`): the paid tier and nothing else.
  Plan cards, trial banners, the "Premium" chip and the `accent-fade-surface`
  wash all key off it. It is the only warm colour in the system.

### Tertiary

- **Status**: `warning` (`#9a6a12`), `destructive` (`#b3372b`), `info`
  (`#35618f`), each with a dark sibling. They appear as 5% tints behind an alert
  and as 10% tints behind a badge, with the full colour on the icon or text. They
  are safety signals, never decoration.
- **Charts** (`chart-1..5`): green, blue, ochre, red, grey. Data only.
- **Icon mark** (`icon-deep` `#1e6b38`, `icon-bright` `#2d8a4e`): the two-stop
  gradient behind the leaf on the favicon, the Apple touch icon and the Open
  Graph card. These are rendered by `next/og` where no CSS variable exists, so
  they are literal. They are not for UI.

### Neutral

- **Sheet** (`background`, `#f6f7f4`): the page, with the dot grid over it.
- **Card** (`card`, `#ffffff`; `#121814` in dark): every bordered surface,
  every input.
- **Well** (`muted`, `#eef0ec`) and **hover wash** (`accent`, `#e9f1eb`): the
  secondary button fill, the ghost hover, the tab list and skeleton bases.
  `accent` carries a hint of green; `muted` does not.
- **Body grey** (`muted-foreground`, `#5c675f`; `#97a39a` in dark): the lead
  paragraph, descriptions, footer links, the second line of the hero headline.
  The lowest grey a reader is asked to read (5.3:1 on the sheet).
- **Hairlines** (`border` 10% ink, `border-strong` 18%, `input` 14%): the
  structural line. Hover firms `border` up to `border-strong`.

### Named Rules

**The One Green Rule.** `primary` is the only accent and it is also `success`.
Do not introduce a second brand hue; if something needs to stand out, it gets
the green, a heavier weight, or a hairline, in that order.

**The Alpha Hairline Rule.** Borders are ink at 10% alpha, not a solid grey, so
they sit correctly on the sheet, on a card and on a tinted surface without a
per-surface variant. Hover raises them to 18% (`border-strong`); it never
changes their hue.

**The Ochre Is Money Rule.** `premium` and `premium-surface` mean "the paid
plan". They never decorate a free surface and are never used as a warning.

## Typography

**Display and body font:** Manrope (variable, self-hosted from `app/fonts`)
**Label / data font:** IBM Plex Mono 400 and 500 (self-hosted)

**Character:** one humanist sans at two weights carries every sentence; a mono
face carries every fact. Both are self-hosted (`next/font/local`), exposed as
`--font-manrope` and `--font-plex-mono`, and mapped to `font-sans` and
`font-mono`. Headings are tracked tight (`-0.02em`, `-0.035em` on `h1`) and
balanced; paragraphs are `text-wrap: pretty`.

### Hierarchy

- **Display** (600, `2.25rem` → `3.75rem` across `sm`/`md`, 1.08, `-0.035em`):
  the home hero only. Its second line is `muted-foreground`.
- **Heading 1** (600, `1.875rem`/`2.25rem`, `-0.035em`): page titles via
  `PageHeader`.
- **Heading 2** (600, `1.5rem`/`1.875rem`, `-0.02em`): section headings.
- **Heading 3** (600, `1rem`, 1.25): card titles and list-item titles.
- **Body LG** (400, `1.125rem`, 1.625): the hero lead.
- **Body** (400, `1rem`, 1.5): the search input and hero copy.
- **Nav** (600, `0.9375rem`, `-0.01em`): the wordmark, primary nav links,
  sidebar links, FAQ questions and search-result titles.
- **Body SM** (400, `0.875rem`, 1.625): the working size of the app: card
  copy, definition lists, footer links, alerts, buttons.
- **Caption** (400, `0.75rem`): metadata, disclaimers, the footer's legal line.
- **Eyebrow** (IBM Plex Mono 500, `0.6875rem`, uppercase, `+0.14em`, `primary`):
  the section label, set with `.eyebrow`; `.eyebrow-muted` for footer column
  heads.
- **Label** (IBM Plex Mono 500, `0.6875rem`, `+0.02em`): badges, plan chips,
  sidebar section labels, counts.
- **Data** (IBM Plex Mono 400, `0.75rem`, tabular): numbers that must line up
  (`.tabular`): stats, prices, step numbers.

### Named Rules

**The Mono Means Fact Rule.** IBM Plex Mono is for labels, counts, prices,
codes and reference numbers. A sentence a person would say is set in Manrope.

**The Tracking Rule.** Headings are negative (`-0.02em`; `-0.035em` at h1),
body is neutral, and the mono eyebrow is wide (`+0.14em`) because uppercase
mono at 11px closes up without it. Nothing else is letter-spaced.

**The Two-Size Body Rule.** The hero and the search field speak at 16px; the
rest of the product works at 14px. A new surface picks one of those two, not a
value between them.

## Layout

The page is a centred column on a full-width sheet. Public pages cap at
`max-w-5xl` (64rem) or `max-w-6xl` (72rem) with 16px side padding and 32px
from `md`; the search card and reading columns cap at `max-w-2xl` (42rem). The
header is fixed at 56px (`h-14`) and every page begins with `pt-14` to clear it.
Dashboard and admin routes add a sidebar and keep the same column.

Spacing is Tailwind's 4px scale. Card interiors are 20px (`p-5`), 24px on the
search card at `md`; control height is 36px (`h-9`), inputs 40px, the search
field 48px; section rhythm runs 48 to 64px (`py-12` / `py-16`), the hero 80 to
112px above.

Lists are hairline-ruled rather than boxed: `divide-y divide-border` with
`border-y` on the parent, and a two-column `grid-cols-[10rem_1fr]` definition
list for label/value pairs. Breakpoints are Tailwind's defaults.

## Elevation & Depth

Depth is a hairline first. The base surface is the sheet with its dot grid;
cards sit on it as white rectangles with a 10%-ink border and no shadow.

### Shadow Vocabulary

- **Level 0, Flat** (1px `border`, no shadow): cards, inputs, the header, the
  footer. The default.
- **Level 1, Lift** (`.surface-hover`): on hover a card firms its border
  toward `primary`, rises 1px and casts `0 10px 30px -18px` of 35% ink.
  Transition 200ms ease.
- **Level 2, Floating** (Tailwind `shadow-md` / `shadow-lg`): popovers,
  sheets, the sticky comparison bar, modals.

Tailwind's `shadow-sm` through `shadow-2xl` are present in the code today on
about forty call sites; new surfaces should use level 0 by default and reach
for level 2 only when something genuinely floats.

### The one flourish

The hero carries a 44rem radial glow (`.hero-glow`) of `primary` at 12%
alpha, fading to transparent at 70%. It sits behind the home hero and nowhere
else. The `premium-gradient-band` and `premium-gradient-panel` are solid
green-to-deeper-green bands reserved for plan highlights and trial notices;
they are the only gradients in the system.

### Named Rules

**The Hairline-First Rule.** A new card is a 1px `border` on `card`. Add
`.surface-hover` if it is a link. Do not add a resting shadow.

## Shapes

Softly squared. The scale is Tailwind 4's, driven by `--radius: 0.5rem`.

| Token  | Value         | Use                                         |
| ------ | ------------- | ------------------------------------------- |
| `sm`   | `4px`         | Badges, chips, the search clear button      |
| `md`   | `6px`         | Buttons, inputs, alerts, the leaf-mark tile |
| `lg`   | `8px`         | Cards, the search card                      |
| `xl`   | `12px`        | Large panels, modals                        |
| `2xl`+ | `16px`–`24px` | Rare; hero surfaces                         |
| `full` | `9999px`      | Avatar, suggestion chips, skeleton pills    |

Borders are always 1px. There are no 2px strokes and no accent borders on a
card edge.

## Components

Controls are quiet, hairlined and instant: every state change is a colour
transition, nothing scales or glows. Focus is a 2px `primary` outline offset
2px (global `*:focus-visible`), or a 2px `ring` at 45% green on buttons.

### Buttons

- **Shape:** 6px square, 36px tall, 16px horizontal padding, 14px weight 500;
  `sm` 32px / 12px text; `lg` 44px / 24px padding; `icon` 36px square.
- **Primary:** `primary` fill, white text; hover 90%. One per view.
- **Outline:** `card` fill, `border` hairline; hover firms to `border-strong`
  and takes the `muted` wash.
- **Secondary:** `muted` fill; hover to `accent`.
- **Tonal:** 5% green fill, 25% green border, green text; hover 10% / 45%. The
  "soft primary" for secondary actions that still belong to the product.
- **Ghost:** transparent, `muted-foreground` text; hover `muted` wash and
  `foreground` text.
- **Destructive:** `destructive` fill, white text; hover 90%.
- **Link:** `primary` text, underline on hover at a 4px offset.
- **Disabled:** 50% opacity, pointer events off.

### Inputs / Fields

- **Style:** 6px square, `input` hairline (14% ink), `card` fill, 40px tall,
  16px text on mobile and 14px from `md`, 12px horizontal padding. Placeholder
  is `muted-foreground` at 70%.
- **Hover / Focus:** hover firms the border to `border-strong`; focus sets the
  border to 60% `primary` and a 2px ring at 15% `primary`.
- **Search field** (signature): 48px tall, 15px text, a 16px search icon at
  left, the submit button inset 6px at right, and a row of suggestion chips
  under an `eyebrow-muted` "Try" label.

### Cards / Containers

- **Corner Style:** 8px (`rounded-lg`).
- **Background:** `card`, 1px `border`, no shadow. Header, content and footer
  each pad 20px; the title is 16px weight 600, leading none, tight.
- **Hover:** `.surface-hover` on cards that are links.
- **Print:** the `.evidence-badge` and `.disclaimer` keep a `currentColor`
  border and lose their fill.

### Badges

- **Style:** 4px corners, IBM Plex Mono 11px weight 500, 2px by 6px padding.
  Default is 10% green with a 20% green border and green text; `secondary`
  is the `muted` well with grey text; `destructive` is a 10% red tint;
  `outline` is a hairline with `foreground` text. The premium chip uses
  `premium-surface` and `premium` text.

### Alerts

- **Style:** 6px corners, 12px by 16px padding, 14px text, a 16px icon at
  top-left. Default is a `card` panel with a green icon; `warning` is a 5%
  ochre tint with a 30% ochre border; `destructive` is a 5% red tint with red
  text. Alerts are how the product says "we could not check", so they are
  never hidden behind a toast.

### Header

- **Style:** fixed, 56px, `background` at 85% with `backdrop-blur-md`, a
  bottom hairline. The wordmark is 15px weight 600 beside a 28px bordered tile
  holding the green leaf. Nav links are ghost-style; the compare link carries a
  count badge. Mobile collapses into a right-hand `Sheet`.

### Page header (signature)

An optional back link, an `.eyebrow`, the page title at 30px/36px weight 600,
and a one-line `muted-foreground` description, closed by a bottom hairline
with 32px below. Every public page uses it, so the rhythm is identical across
routes.

### Eyebrow (signature)

The uppercase IBM Plex Mono stamp: 11px, weight 500, `+0.14em`, `primary`.
Set with `.eyebrow` on a `<p>` or `<span>`. `.eyebrow-muted` is the same
stamp in `muted-foreground` for footer column heads and the search field's
"Try" label.

### Motion

One authored moment: above-the-fold content slides up 12px over 600ms on
`cubic-bezier(0.21, 1, 0.23, 1)` (`.reveal-up`, staggered 80ms by
`.reveal-delay-1/2/3`). It animates transform only, never opacity, so the
hero stays a Largest Contentful Paint candidate. Hover transitions are 200ms
ease. `prefers-reduced-motion` collapses everything to 0.01ms.

## Do's and Don'ts

### Do:

- **Do** set every label, count, price and code in IBM Plex Mono, and every
  sentence in Manrope.
- **Do** build a new surface as `card` with a 1px `border` and no shadow.
- **Do** spend `primary` on the one action, the eyebrow and the focus ring.
- **Do** keep light and dark on the same token names; never branch a component
  on theme.
- **Do** make an empty state say why it is empty (an `Alert`, not silence).
- **Do** keep body at 14px in the app and 16px in the hero and search.

### Don't:

- **Don't** introduce a second brand hue, or use `premium` ochre outside the paid tier.
- **Don't** add a resting shadow to a card; `.surface-hover` is the lift.
- **Don't** use Tailwind's grey palette (`gray-*`, `slate-*`, `blue-*`) or a
  literal hex in UI; every colour is a token.
- **Don't** set an accent border on a card's left edge.
- **Don't** animate opacity on above-the-fold content.
- **Don't** put a heading in the mono face or a label in Manrope.
