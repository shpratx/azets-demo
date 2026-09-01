# Cozone-Inspired Web Design System

**Version:** 1.0  
**Purpose:** A reusable design system for building a professional services and digital-platform marketing site with the same broad visual character as the referenced Azets Cozone page, while using original assets, copy, and implementation.

> **Design intent, not a clone.** This specification draws on observable patterns from the public Cozone and related Azets pages: confident editorial hierarchy, generous whitespace, dark neutral text, a bright green action accent, modular service storytelling, prominent contact calls to action, and reassurance around security and digital simplicity. Do not copy Azets logos, photography, icons, illustrations, wording, or other proprietary assets. Confirm brand-token values with the brand owner before using them for an Azets-owned implementation.

---

## 1. Experience principles

1. **Reassuringly simple:** Explain a complex service in plain language and reveal detail progressively.
2. **Human before technical:** Lead with outcomes and confidence; use technology and security as proof.
3. **One clear next step:** Every major section supports one primary conversion, usually “Contact us” or a context-specific equivalent.
4. **Editorial confidence:** Use large, short headings, open layouts, restrained decoration, and strong rhythm.
5. **Accessible by default:** Meet WCAG 2.2 AA. Never encode meaning using colour alone.
6. **Modular and composable:** Pages are assembled from reusable bands, cards, media blocks, accordions, and CTA panels.

## 2. Brand expression

### 2.1 Personality

- Clear, calm, progressive, trustworthy, collaborative
- Expert without sounding institutional
- Modern without looking like a generic SaaS dashboard
- Warm enough for owner-managed businesses, disciplined enough for enterprise buyers

### 2.2 Visual signature

- A near-black editorial base
- White and soft neutral surfaces
- A vivid green used selectively for primary actions and emphasis
- Oversized display typography with compact line lengths
- Large-radius cards and media crops
- Alternating white, mist, green-tint, and dark content bands
- Minimal shadows; hierarchy comes primarily from space, contrast, scale, and borders

---

## 3. Design tokens

### 3.1 Colour

| Token | Value | Use |
|---|---:|---|
| `color.brand.500` | `#26CF7C` | Primary CTA, active accents, key highlights |
| `color.brand.600` | `#1CAE68` | Hover state on light surfaces |
| `color.brand.700` | `#148653` | Pressed state, accessible text accents |
| `color.brand.100` | `#DDF8EA` | Tinted panels and badges |
| `color.ink.950` | `#0F0F0F` | Primary text, dark sections |
| `color.ink.800` | `#2B2B2B` | Strong secondary text |
| `color.ink.600` | `#5D625F` | Body-muted text |
| `color.ink.400` | `#939A96` | Metadata and inactive controls |
| `color.canvas` | `#FFFFFF` | Main page background |
| `color.mist.50` | `#F7F8F7` | Subtle section background |
| `color.mist.100` | `#EEF1EF` | Card/background contrast |
| `color.border` | `#D9DEDB` | Dividers, fields, cards |
| `color.focus` | `#0067B8` | High-visibility keyboard focus ring |
| `color.info` | `#1666C5` | Informational state |
| `color.success` | `#16794D` | Success state |
| `color.warning` | `#9A6400` | Warning state |
| `color.danger` | `#B42318` | Error/destructive state |

**Usage rule:** The green is a precision accent, not a page wash. On a typical viewport, most surface area should remain white, soft neutral, or near-black.

### 3.2 Typography

Use an openly licensed geometric grotesk rather than attempting to reproduce a proprietary brand font.

- **Primary recommendation:** `Manrope`, system-ui, sans-serif
- **Fallback stack:** `Inter`, `Segoe UI`, `Helvetica Neue`, Arial, sans-serif
- **Numeric setting:** `font-variant-numeric: tabular-nums lining-nums`

| Style | Desktop | Mobile | Weight | Line-height | Max width |
|---|---:|---:|---:|---:|---:|
| Display XL | 72 px | 46 px | 600 | 1.02 | 12ch |
| Display L | 56 px | 38 px | 600 | 1.08 | 15ch |
| Heading 1 | 48 px | 36 px | 600 | 1.10 | 18ch |
| Heading 2 | 38 px | 30 px | 600 | 1.16 | 22ch |
| Heading 3 | 28 px | 24 px | 600 | 1.22 | 28ch |
| Heading 4 | 22 px | 20 px | 600 | 1.25 | 32ch |
| Lead | 21 px | 19 px | 400 | 1.55 | 52ch |
| Body L | 18 px | 18 px | 400 | 1.65 | 68ch |
| Body | 16 px | 16 px | 400 | 1.60 | 72ch |
| Small | 14 px | 14 px | 500 | 1.50 | 72ch |
| Eyebrow | 13 px | 13 px | 700 | 1.25 | n/a |

**Rules**

- Sentence case for headings and controls.
- Display headings may use slightly negative tracking: `-0.025em`.
- Eyebrows use `0.08em` letter spacing and optional uppercase.
- Avoid centre-aligned paragraphs longer than two lines.
- Keep body copy between 45 and 75 characters per line.

### 3.3 Spacing

Base unit: **4 px**.

`space-0: 0`, `space-1: 4`, `space-2: 8`, `space-3: 12`, `space-4: 16`, `space-5: 20`, `space-6: 24`, `space-8: 32`, `space-10: 40`, `space-12: 48`, `space-16: 64`, `space-20: 80`, `space-24: 96`, `space-32: 128`.

- Component padding: 16 to 32 px
- Section padding: 72 px mobile, 112 px tablet, 144 px desktop
- Heading-to-body: 24 to 32 px
- Body-to-actions: 32 to 40 px
- Card gaps: 20 px mobile, 24 to 32 px desktop

### 3.4 Grid and containers

- Maximum content width: `1280px`
- Editorial text width: `760px`
- Wide visual width: `1440px`
- Desktop: 12 columns, 24 px gutters
- Tablet: 8 columns, 24 px gutters
- Mobile: 4 columns, 16 px gutters
- Page margins: `clamp(20px, 5vw, 80px)`

### 3.5 Shape, border, elevation

- Small radius: 8 px
- Control radius: 999 px for pills; 10 px for fields
- Card radius: 18 px
- Feature/media radius: 24 px
- Border: 1 px solid `color.border`
- Shadow 1: `0 10px 35px rgba(15,15,15,.08)`
- Shadow 2: `0 20px 60px rgba(15,15,15,.12)`
- Prefer borders and background contrast over elevation.

### 3.6 Motion

- Fast: 120 ms, controls and icon feedback
- Standard: 200 ms, hover and disclosure
- Slow: 360 ms, section/media reveal
- Easing: `cubic-bezier(.2,.8,.2,1)`
- Transform only opacity and translate for standard UI transitions.
- Respect `prefers-reduced-motion: reduce` and remove non-essential animation.

---

## 4. Iconography and imagery

### Icons

- Rounded line icons, 1.75 to 2 px stroke
- Sizes: 20, 24, 32, 48 px
- Use simple directional arrows for text links
- Pair state icons with labels; never use icons alone for status
- Use one consistent open-source icon family, such as Lucide

### Photography

- Candid, confident business interactions; natural daylight
- Show people using technology in authentic work settings
- Mix close human moments with clean architectural or workspace shots
- Avoid forced handshakes, staged boardroom poses, and generic server imagery
- Crop with a clear subject and enough edge room for responsive resizing

### Abstract visuals

- Use rounded fields, layered panels, or clean interface fragments to suggest connection and simplification
- Avoid decorative visual noise, pseudo-3D glass effects, and ungrounded AI imagery

---

## 5. Core components

### 5.1 Utility bar

**Purpose:** Country/region, language, login, support, or other low-frequency utilities.

- Height: 36 to 40 px
- Small text, right aligned on desktop
- Collapsed into the mobile navigation drawer
- Separate from the primary header using a subtle divider

### 5.2 Site header

**Anatomy:** Brand mark, primary navigation, utility action, primary CTA, menu toggle.

- Desktop height: 88 px; mobile: 68 px
- Sticky after the user scrolls beyond the hero; solid surface with bottom border
- Header links use 15 to 16 px medium text
- Dropdown trigger has a clear chevron and `aria-expanded`
- Mobile menu is a full-height drawer, not a tiny popover
- Primary CTA uses the green filled-button treatment

### 5.3 Breadcrumbs

- Place above the hero title for service pages
- 14 px, muted ink; current page is plain text
- Collapse intermediate items on small screens
- Add `aria-label="Breadcrumb"`

### 5.4 Buttons

**Primary:** green fill, near-black text  
**Secondary:** near-black fill, white text  
**Tertiary:** text plus arrow  
**Inverse:** white fill on dark surface  
**Ghost:** transparent with contrasting border

- Minimum height: 48 px; compact variant: 40 px
- Padding: 14 px 24 px
- Label: 15 to 16 px, weight 650
- Hover: darken background or increase contrast, never scale the button
- Focus: 3 px outer focus ring with 2 px offset
- Disabled: 45% opacity, no shadow, correct `disabled` semantics
- Loading: preserve width and include screen-reader status text

### 5.5 Text links

- Default inline links are underlined
- Standalone links may use label plus 16 px arrow
- Hover changes underline thickness or arrow offset by up to 4 px
- Never rely on green alone to identify a link

### 5.6 Hero, split editorial

**Desktop:** 6/6 or 7/5 split. Content left, visual right.  
**Mobile:** content, actions, then visual.

Anatomy:
1. Optional breadcrumb
2. Eyebrow
3. Display title, 1 to 3 lines
4. One concise lead paragraph
5. Primary and optional secondary action
6. Rounded image or product visual

- Minimum desktop height: 620 px
- Text block vertically centred
- Keep hero copy under 65 words
- If the visual is decorative, use empty alt text

### 5.7 Value-pillar cards

Use for concise outcomes such as one place, less administration, digital operation, and real-time collaboration.

- 2x2 desktop grid, one column mobile
- Either borderless on a shared surface or individually bordered, not both
- Short H3, 40 to 80 words, optional 32 px icon
- Cards align to the same baseline and have equal padding

### 5.8 Alternating feature band

- Two-column composition, alternating media left/right
- Use for explaining individual applications or service capabilities
- Contains eyebrow, H2, description, two to four benefits, and one link
- Background alternates between canvas and mist
- Do not alternate reading order in the DOM; use CSS placement only

### 5.9 Application/service card

- Icon or image, title, 2 to 3 line summary, directional link
- Desktop: three columns; tablet: two; mobile: one
- Entire card may be clickable only if there is one destination
- Hover adds border contrast and shallow elevation

### 5.10 Benefits list

- Use check icon plus short statement
- Max six items before grouping or using an accordion
- Icons use success green but text retains neutral colour

### 5.11 Proof/reassurance strip

For security, compliance, collaboration, or accessibility claims.

- Dark or soft-neutral band
- 3 to 4 concise proof points
- Each proof point includes a label and one sentence
- Claims must link to evidence or an authoritative detail page

### 5.12 Quote/testimonial

- Large quotation text, 28 to 36 px
- Attribution includes name, role, organisation only with permission
- Do not combine a quote carousel with autoplay

### 5.13 Accordion

- Full-width rows with 56 to 72 px minimum row height
- Plus/minus or chevron indicator
- Button owns the interactive row and exposes `aria-expanded`
- One or multiple open items are acceptable, but behave consistently

### 5.14 Contact CTA panel

- High-contrast green or near-black panel
- H2, one reassuring sentence, one primary button
- Optional adviser portrait only if authentic and consented
- Use near the end of every service page, before the footer

### 5.15 Forms

- Labels always visible above fields
- Field height: 52 px; textarea minimum: 144 px
- Help and error text appear below controls
- Required fields indicated textually, not just with an asterisk
- Validate on blur and submit, not on every keystroke
- Error summary receives focus after failed submission
- Consent text is explicit and links to privacy details

### 5.16 Footer

- First band: service CTA or newsletter, if relevant
- Main footer: 3 to 5 link groups
- Final strip: legal, privacy, cookies, accessibility, country/language, copyright
- Mobile: link groups may collapse into accessible accordions

---

## 6. Page composition recipes

### 6.1 Product/service landing page

1. Utility bar and primary header
2. Breadcrumbs
3. Split editorial hero
4. Four value pillars
5. Introductory editorial statement
6. Alternating feature bands for core capabilities
7. Application/service-card grid
8. Proof/reassurance strip
9. FAQ accordion
10. Contact CTA panel
11. Footer

### 6.2 Service detail page

1. Breadcrumbs and compact hero
2. Problem/outcome narrative
3. Three benefits
4. Feature detail with media
5. “How we help” checklist
6. Security or integration reassurance
7. Related services
8. Contact CTA panel

### 6.3 Trust/security page

1. Compact hero
2. Overview statement
3. Categorised assurance cards: communication, authentication, hosting, privacy, development
4. Detailed disclosure accordions
5. Evidence/download links
6. Contact/security reporting CTA

---

## 7. Responsive behaviour

| Breakpoint | Width | Behaviour |
|---|---:|---|
| `xs` | 0 to 479 px | One column, 16 to 20 px margin, full-width CTAs |
| `sm` | 480 to 767 px | One column, paired compact controls allowed |
| `md` | 768 to 1023 px | 8-column grid, 2-column cards, compact desktop-like header optional |
| `lg` | 1024 to 1279 px | 12-column grid, split heroes and feature bands |
| `xl` | 1280 px+ | Max-width container, large display scale, 3-column cards |

Rules:

- Break components based on content pressure, not device names.
- Stack hero actions below 480 px.
- Keep tap targets at least 44 by 44 px.
- Never hide essential content on mobile.
- Tables use horizontal scroll with visible affordance or transform into labelled rows.

---

## 8. Accessibility specification

- Target WCAG 2.2 AA.
- Text contrast: at least 4.5:1; large text: at least 3:1.
- UI component and focus contrast: at least 3:1.
- Keyboard navigation for menus, accordions, dialogs, carousels, and forms.
- Persistent, visible focus states.
- Semantic heading order with one page H1.
- Skip link is first focusable item.
- Landmarks: `header`, `nav`, `main`, `aside` when justified, `footer`.
- Alt text describes purpose, not appearance; decorative imagery uses `alt=""`.
- Error states include icon, text, and programmatic association.
- No autoplay media; captions and transcripts for meaningful video.
- Honour zoom to 200% and reflow at 400% without two-dimensional scrolling, except legitimate data tables.
- Consent and privacy choices must be equally understandable and easy to select.

---

## 9. Content design

### Voice

- Lead with customer outcome: “See everything in one place.”
- Prefer active verbs: simplify, connect, manage, share, approve, understand
- Use short paragraphs and descriptive subheadings
- Avoid inflated claims such as “revolutionary” or “world-leading” unless independently evidenced

### Recommended content pattern

- **Heading:** outcome in 4 to 9 words
- **Lead:** what it is and who it helps, under 30 words
- **Body:** problem, capability, result
- **Proof:** security, integration, access, compliance, or adviser support
- **Action:** specific next step

### CTA labels

Prefer: `Contact us`, `Explore the platform`, `See how it works`, `Talk to an adviser`, `View security details`  
Avoid: `Click here`, `Submit`, `Learn more` when a more specific label is possible.

---

## 10. Implementation tokens

The companion files contain production-ready starters:

- `cozone-inspired.tokens.json`: technology-neutral token source
- `cozone-inspired.css`: CSS custom properties, responsive type, buttons, cards, container, section, focus and reduced-motion foundations

Use the JSON file as the source of truth and generate framework variables from it. Do not hand-edit values independently in multiple codebases.

---

## 11. Governance

### Component states required

Every interactive component documents: default, hover, focus-visible, active, disabled, loading, error, success, empty, and high-contrast behaviour where applicable.

### Contribution workflow

1. Show the user need and evidence.
2. Check whether an existing pattern can be extended.
3. Define anatomy, states, responsive behaviour, accessibility, and content rules.
4. Design and code collaboratively.
5. Add automated accessibility and visual-regression tests.
6. Review with design, engineering, content, and accessibility owners.
7. Release with changelog and migration guidance.

### Versioning

- Patch: token correction or non-breaking documentation fix
- Minor: additive component or backwards-compatible variant
- Major: removal, renamed token, changed API, or visual incompatibility

---

## 12. Acceptance criteria

1. A service landing page can be assembled using only documented components and tokens.
2. Desktop, tablet, and mobile layouts follow the defined grid and responsive rules.
3. All interactive elements expose hover, focus, active, disabled, and relevant validation states.
4. Text, controls, and focus indicators meet WCAG 2.2 AA contrast requirements.
5. Header, navigation, accordions, forms, and footer are fully keyboard operable.
6. The page has one H1, logical heading order, a skip link, and semantic landmarks.
7. Green is used as an accent and never as the sole signifier of state or action.
8. All imagery and copy are original, licensed, or supplied by the implementing organisation.
9. Each marketing claim has an owner and, where required, evidence.
10. Tokens are consumed from a single source of truth and not duplicated as arbitrary values.

## 13. Definition of done

- [ ] Token package is published and versioned
- [ ] Components are documented with anatomy, variants, states, and usage
- [ ] Storybook or equivalent examples cover all required states
- [ ] Automated axe checks pass with no serious or critical issues
- [ ] Keyboard and screen-reader smoke tests pass
- [ ] Layouts are tested at 320, 768, 1024, 1280, and 1440 px
- [ ] 200% zoom and 400% reflow checks pass
- [ ] Reduced-motion behaviour is verified
- [ ] Original/licensed image and icon provenance is recorded
- [ ] Legal, privacy, cookie, and claims review is complete
- [ ] Visual regression baselines are approved
- [ ] Content review confirms plain language and specific CTA labels

---

## 14. Source and validation note

This system was informed by the publicly accessible Azets Cozone product page, related Azets digital-solutions and trust-centre pages, and a public listing of the 2024 Azets brand book. The public pages explicitly position Cozone as a secure, cloud-based service hub with integrated business applications and a strong “everything in one place” story. The trust-centre page lists areas such as encrypted communications, authentication, hosting, privacy, and secure development. Exact visual measurements and proprietary brand-font details were not exposed in the retrieved page text, so the measurements and open-font recommendation above are an original implementation specification rather than claims about Azets’ internal design system.


---

# Appendix A - CSS Foundation

```css
:root {
  --ds-brand-100: #ddf8ea;
  --ds-brand-500: #26cf7c;
  --ds-brand-600: #1cae68;
  --ds-brand-700: #148653;
  --ds-ink-950: #0f0f0f;
  --ds-ink-800: #2b2b2b;
  --ds-ink-600: #5d625f;
  --ds-ink-400: #939a96;
  --ds-canvas: #ffffff;
  --ds-mist-50: #f7f8f7;
  --ds-mist-100: #eef1ef;
  --ds-border: #d9dedb;
  --ds-focus: #0067b8;
  --ds-danger: #b42318;
  --ds-font: Manrope, Inter, "Segoe UI", "Helvetica Neue", Arial, sans-serif;
  --ds-radius-control: 10px;
  --ds-radius-card: 18px;
  --ds-radius-feature: 24px;
  --ds-radius-pill: 999px;
  --ds-shadow-1: 0 10px 35px rgba(15,15,15,.08);
  --ds-shadow-2: 0 20px 60px rgba(15,15,15,.12);
  --ds-container: 1280px;
  --ds-page-margin: clamp(20px, 5vw, 80px);
  --ds-section-y: clamp(72px, 10vw, 144px);
  --ds-ease: cubic-bezier(.2,.8,.2,1);
}

*, *::before, *::after { box-sizing: border-box; }
html { color: var(--ds-ink-950); background: var(--ds-canvas); font-family: var(--ds-font); }
body { margin: 0; font-size: 1rem; line-height: 1.6; }
img { max-width: 100%; height: auto; border-radius: var(--ds-radius-feature); }
a { color: inherit; text-underline-offset: .18em; }
:focus-visible { outline: 3px solid var(--ds-focus); outline-offset: 3px; }

.ds-container { width: min(calc(100% - 2 * var(--ds-page-margin)), var(--ds-container)); margin-inline: auto; }
.ds-section { padding-block: var(--ds-section-y); }
.ds-section--mist { background: var(--ds-mist-50); }
.ds-section--dark { color: white; background: var(--ds-ink-950); }
.ds-grid { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: clamp(20px, 2.2vw, 32px); }

.ds-display { max-width: 15ch; margin: 0; font-size: clamp(2.875rem, 6vw, 4.5rem); font-weight: 600; line-height: 1.02; letter-spacing: -.025em; }
.ds-h2 { max-width: 22ch; margin: 0; font-size: clamp(1.875rem, 4vw, 2.375rem); line-height: 1.16; }
.ds-lead { max-width: 52ch; color: var(--ds-ink-600); font-size: clamp(1.1875rem, 1.8vw, 1.3125rem); line-height: 1.55; }

.ds-button { display: inline-flex; min-height: 48px; align-items: center; justify-content: center; gap: .5rem; padding: .875rem 1.5rem; border: 1px solid transparent; border-radius: var(--ds-radius-pill); font: 650 1rem/1 var(--ds-font); text-decoration: none; cursor: pointer; transition: background-color 200ms var(--ds-ease), color 200ms var(--ds-ease), border-color 200ms var(--ds-ease); }
.ds-button--primary { color: var(--ds-ink-950); background: var(--ds-brand-500); }
.ds-button--primary:hover { background: var(--ds-brand-600); }
.ds-button--secondary { color: white; background: var(--ds-ink-950); }
.ds-button--ghost { color: var(--ds-ink-950); background: transparent; border-color: var(--ds-ink-950); }
.ds-button:disabled, .ds-button[aria-disabled="true"] { opacity: .45; cursor: not-allowed; }

.ds-card { height: 100%; padding: clamp(24px, 3vw, 36px); border: 1px solid var(--ds-border); border-radius: var(--ds-radius-card); background: var(--ds-canvas); }
.ds-card--interactive { transition: border-color 200ms var(--ds-ease), box-shadow 200ms var(--ds-ease); }
.ds-card--interactive:hover { border-color: var(--ds-ink-400); box-shadow: var(--ds-shadow-1); }

.ds-hero { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); align-items: center; gap: clamp(32px, 6vw, 80px); min-height: 620px; padding-block: clamp(56px, 8vw, 112px); }
.ds-hero__content { grid-column: 1 / span 6; }
.ds-hero__media { grid-column: 7 / -1; }
.ds-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 32px; }

.ds-skip-link { position: fixed; inset: 8px auto auto 8px; z-index: 9999; padding: 12px 16px; color: white; background: var(--ds-ink-950); transform: translateY(-150%); }
.ds-skip-link:focus { transform: translateY(0); }

@media (max-width: 767px) {
  .ds-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .ds-hero { grid-template-columns: repeat(4, minmax(0, 1fr)); min-height: auto; }
  .ds-hero__content, .ds-hero__media { grid-column: 1 / -1; }
  .ds-actions { flex-direction: column; }
  .ds-actions .ds-button { width: 100%; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
}

```

---

# Appendix B - Machine Readable Design Tokens

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "brand": {
      "100": {
        "$value": "#DDF8EA",
        "$type": "color"
      },
      "500": {
        "$value": "#26CF7C",
        "$type": "color"
      },
      "600": {
        "$value": "#1CAE68",
        "$type": "color"
      },
      "700": {
        "$value": "#148653",
        "$type": "color"
      }
    },
    "ink": {
      "950": {
        "$value": "#0F0F0F",
        "$type": "color"
      },
      "800": {
        "$value": "#2B2B2B",
        "$type": "color"
      },
      "600": {
        "$value": "#5D625F",
        "$type": "color"
      },
      "400": {
        "$value": "#939A96",
        "$type": "color"
      }
    },
    "canvas": {
      "$value": "#FFFFFF",
      "$type": "color"
    },
    "mist": {
      "50": {
        "$value": "#F7F8F7",
        "$type": "color"
      },
      "100": {
        "$value": "#EEF1EF",
        "$type": "color"
      }
    },
    "border": {
      "$value": "#D9DEDB",
      "$type": "color"
    },
    "focus": {
      "$value": "#0067B8",
      "$type": "color"
    },
    "danger": {
      "$value": "#B42318",
      "$type": "color"
    }
  },
  "radius": {
    "control": {
      "$value": "10px",
      "$type": "dimension"
    },
    "card": {
      "$value": "18px",
      "$type": "dimension"
    },
    "feature": {
      "$value": "24px",
      "$type": "dimension"
    },
    "pill": {
      "$value": "999px",
      "$type": "dimension"
    }
  },
  "size": {
    "container": {
      "$value": "1280px",
      "$type": "dimension"
    },
    "tapTarget": {
      "$value": "44px",
      "$type": "dimension"
    }
  },
  "font": {
    "family": {
      "$value": [
        "Manrope",
        "Inter",
        "Segoe UI",
        "Helvetica Neue",
        "Arial",
        "sans-serif"
      ],
      "$type": "fontFamily"
    }
  },
  "motion": {
    "fast": {
      "$value": "120ms",
      "$type": "duration"
    },
    "standard": {
      "$value": "200ms",
      "$type": "duration"
    },
    "slow": {
      "$value": "360ms",
      "$type": "duration"
    }
  }
}
```
