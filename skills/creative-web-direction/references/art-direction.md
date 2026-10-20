# Art direction: content, typography, composition, colour and imagery

## Contents
- Content and design develop together
- Copy that earns trust
- Typography
- Composition and grid
- Colour
- Imagery across media
- Space and pacing
- Detail craft checklist
- Responsive authorship
- Common devices that need justification
- Visual critique protocol
- Asset sourcing plans

## Content and design develop together

- Use **real content early**: real headlines, real case-study lengths, real product names and real languages. Placeholder text hides layout problems, especially long names, translated strings and empty states.
- Start a section from its **information** (what the visitor must learn or do), then its **emotional role**, then its **composition**. Effects come last.
- Keep a **missing facts list** for claims, numbers, names and dates the client must supply or confirm.
- Label copy status in drafts: `CONCEPT COPY` (direction and voice, not approved), `DRAFT` (client to review) and `APPROVED`.

## Copy that earns trust

- Write in the brand's voice, derived from how the client actually speaks, writes and works. Collect phrases from interviews, emails and old materials.
- Prefer specifics over slogans. "Each orrery takes six months; the Mars train alone has 14 hand-cut wheels" beats "Timeless craftsmanship".
- Never invent testimonials, clients, results, credentials, statistics or awards. Use clearly marked placeholder slots and give the client a collection plan instead.
- Make interface copy (buttons, errors, empty states, the 404 page) part of the voice. It is often where a concept proves itself.
- Write headings that work out of context. Screen-reader users navigate by headings and links.
- Avoid interchangeable lines such as "Crafting digital experiences", "Where innovation meets design" or "Your journey starts here". Run the interchangeability test on copy too.

## Typography

**Choose typefaces for their relationship to the concept.** Possible relationships:
- *Historical*: the period, region or tradition of the subject.
- *Structural*: the construction echoes the subject, such as monoline geometry for an engineering firm or broad-nib contrast for a calligraphy archive.
- *Material*: the face feels like the subject's surfaces, such as stencil, inscribed or machined.
- *Voice*: the tone of address, which might be warm, clinical, wry, urgent or ceremonial.

Do not default to a house pairing. If you notice the same grotesk-plus-serif combination emerging across projects, treat it as a warning sign.

**Evaluate every candidate face for:**
- language and script coverage, including diacritics (Vietnamese, Polish, Turkish), punctuation, figures (tabular, oldstyle) and the currency symbols the content needs
- available weights, axes (`wght`, `wdth`, `opsz`, `slnt`) and optical sizes
- rendering at small sizes on low-DPI Windows screens, not just on a Retina display
- licensing: web licence, pageview tiers, self-hosting and subsetting rights
- file size: variable versus static, subset by language and WOFF2 delivery.

**Build the hierarchy with intent:**
- Size the scale by role (display, heading levels, lead, body, caption, UI), not by a default ratio. Large display sizes usually need tighter tracking and leading.
- For fluid type, use `clamp()` with a rem component so that text still responds to user zoom, for example `clamp(2.5rem, 1.8rem + 3vw, 5.5rem)`. Pure `vw` sizing can break 200% text resize (WCAG 1.4.4).
- Body text: start around 1–1.25rem for long reading, with a measure of roughly 45–75 characters (`max-width: 65ch` as a starting point) and line-height around 1.4–1.6. Tune these by eye for the actual face.
- Use `text-wrap: balance` on short headings and `text-wrap: pretty` on paragraphs as progressive enhancements.
- Set `lang` on the document and on any foreign-language passages. This improves hyphenation (`hyphens: auto`), quotation marks and screen-reader pronunciation.
- For multilingual sites, allow 30–40% text expansion from English (German and Finnish often run longer). Handle CJK line breaking (`word-break`, `line-break`), and use logical properties (`margin-inline-start`) if RTL is possible.
- Use tabular figures (`font-variant-numeric: tabular-nums`) for prices, dates in tables and counters.
- Kinetic or variable-font effects must keep text readable at rest and in reduced-motion mode.

## Composition and grid

- Choose the grid for the content: a manuscript grid for long reading, a columnar grid for editorial mixing, a modular grid for collections, a hierarchical grid for a single dominant object, or a baseline rhythm for type-led work.
- Create **tension deliberately**: asymmetric weight, one dominant axis, an off-grid element anchored to an aligned edge. Breaking a rule works when the rest of the order stays perceptible: consistent margins, shared alignment lines and a predictable rhythm.
- Define **relationships between content units**: what aligns with what, what groups together and what is separated. Proximity carries meaning.
- Vary **density** on purpose. Dense evidence after an open moment reads as substance. Uniform density everywhere reads as a template.
- CSS tools: `grid` with named lines, `subgrid` for aligned card internals, container queries (`@container`) for components that recompose by available space, and `aspect-ratio` for media slots.

## Colour

Define colour by **role** before choosing values: surface layers, text levels, accent, interactive states (hover, active, visited where relevant, disabled), focus indicator, status (error, success, warning) and data, if any.

- Contrast: 4.5:1 for normal text, 3:1 for large text (WCAG 1.4.3), and 3:1 for UI component boundaries, focus indicators and meaningful graphics (WCAG 1.4.11). Check text over images and video at its worst frame, not its best.
- Never use colour as the only carrier of meaning (WCAG 1.4.1). Pair it with text, an icon or a pattern.
- Restraint is an option, not a rule. A single saturated accent, a full-colour editorial palette or a material-derived palette can each be right.
- Dark themes: avoid pure black behind light, thin type at small sizes. It causes halation for some readers. Test real content.
- Wide gamut: `color(display-p3 …)` behind `@media (color-gamut: p3)` can carry material colours such as brass, saturated pigments and neon, with an sRGB fallback.
- Support `forced-colors: active` (Windows contrast themes). Don't remove borders or outlines that become the only visible boundary in that mode.

## Imagery across media

Write an image art-direction brief covering:

| Attribute | Decide |
| --- | --- |
| Subject | What is shown, and what never is |
| Lighting | Hard or soft, direction, colour temperature, time of day |
| Lens and perspective | Wide and environmental, or telephoto and compressed. Eye level, top-down or macro. |
| Crop | Tight and intimate, or generous and contextual. Where the focal points sit for each breakpoint. |
| Treatment | Grade, grain, duotone, cut-out or none. Consistency rules across photographers. |
| Materiality | How surfaces read: brass, paper, skin, fabric, concrete |
| Motion media | Video framing, loop length, whether there is sound, captions |
| 3D and illustration | How rendered or drawn work matches the photography's light and palette |

- Art-direct crops per breakpoint with `<picture>` and `media`, and use `object-position` for focal points. A landscape hero cropped to a portrait phone often loses its subject.
- **AI-generated imagery:** don't use it to depict real people, places, products or events as if documentary. Disclose it where its nature matters. Check the tool's terms. Inspect for artefacts such as hands, text and impossible geometry. It is often fine for concept boards. For production, it needs the client's informed approval.
- **Placeholders** are labelled as placeholders in every deliverable. Never ship stock photography presented as the client's team, customers or work.

## Space and pacing

- Give every section a reason for its height. Count screen-heights per section against the information it carries. Long empty scroll passages that exist only to prolong an effect fail the visitor.
- Pauses are compositional tools: a single line of type in open space after a dense passage. Use them, but deliberately and rarely.
- Measure **time to meaningful content**: how many seconds and how many scrolls before a first-time visitor learns what this is and what they can do.
- Vary proportions across the journey. Identical section heights and spacing feel templated.

## Detail craft checklist

- [ ] Optical alignment: icons, punctuation and display type visually aligned, not just aligned by bounding box (`hanging-punctuation` works in Safari only)
- [ ] One system each for radii, borders, shadows and stroke weights, used consistently
- [ ] Icons share a style, stroke and grid, and every one has a text label or an accessible name
- [ ] Image edges: consistent treatment (bleed, inset, rounded or framed), with no stray hairlines from subpixel rounding
- [ ] Text wrapping: no single-word orphans in headings, no awkward breaks in key lines, no overflow with long words or URLs (`overflow-wrap: anywhere` where appropriate)
- [ ] Links: a deliberate underline treatment (`text-underline-offset`, `text-decoration-thickness`), distinguishable from body text by more than colour
- [ ] Hover and focus are distinct and designed. `:focus-visible` has strong contrast and is never removed.
- [ ] Transition continuity: elements leave and enter in a way that preserves spatial logic
- [ ] Cursor states, text selection colour and scrollbar treatment are considered, not left at defaults by accident
- [ ] The favicon, social share image, 404 page, empty states, form errors and success, loading and offline states are all designed
- [ ] Print styles where visitors will print, such as guides, tickets or legal information

## Responsive authorship

Recompose for each context; don't just shrink:
- Storyboard **key sections at both desktop and narrow widths**. The mobile version gets equivalent design attention. It is not a fallback.
- Design for **input**, not only width: `(hover: hover) and (pointer: fine)` for hover-dependent flourishes, and bigger targets with no hover-only content for `(pointer: coarse)`. Keep thumb reach in mind.
- Test **long content**: the longest real name, translated strings and CMS entries with no image.
- Test **unusual viewports**: short landscape phones, tablets in portrait, ultrawide monitors, 200% and 400% zoom (reflow at 320 CSS px, WCAG 1.4.10) and foldables where relevant.
- Viewport units: `svh`, `lvh` and `dvh` avoid mobile toolbar jumps. Prefer `svh` for layouts that must not resize mid-scroll. Respect safe areas with `env(safe-area-inset-*)`.

## Common devices that need justification

These are not banned. Automatic use without meaning is what fails.

| Device | Justified when | Usually unjustified when |
| --- | --- | --- |
| Gradient spheres and blobs | The form genuinely represents the subject, such as a lens, a cell or a sound field | Used as generic "tech" atmosphere |
| Glass and frosted surfaces | Layering and depth explain the information hierarchy | Applied to every card. It costs contrast and GPU. |
| Oversized headline | The words themselves are the message and are specific | Generic phrases at 200 px |
| Bento grids | Content units truly vary in size and importance | Filling space with equal-weight claims |
| Marquees | Continuous flow is the subject: a ticker, a programme, a live feed | Logos or adjectives scrolling for decoration. They must be pausable if they move for more than 5 s. |
| Ambient particles | They represent something real: data, material, weather | Atmosphere with no meaning. They cost battery. |
| Magnetic buttons and cursor followers | Physicality is part of the brand's interaction language | Everywhere. They reduce precision and help no keyboard or touch user. |
| Custom cursor | It adds information, such as a drag state or a media scrubber | It replaces the system cursor for decoration and lags behind the pointer |
| Split-text reveal on every heading | One moment of emphasis that the concept motivates | Applied to every line until nothing is emphasised |
| Horizontal scroll sections | The content is genuinely sequential or lateral: a timeline, a storyboard, a score | Used for novelty. It breaks scanning and keyboard flow. |
| Grain and noise overlays | Material or analogue truth of the subject | A default "premium" filter |
| Preloader counters | They reflect real asset loading for a heavy experience | Artificial delays |

## Visual critique protocol

Run these tests on key views and record what you find:
1. **Interchangeability test:** remove the name and logo. What would need to change to make this an unrelated company's site? If little would, identify the concept, content or interaction decisions that need more specificity.
2. **Squint test:** blur the view. Is the hierarchy still clear? Does exactly one thing lead?
3. **Grayscale test:** does the hierarchy survive without colour?
4. **Content-swap test:** use the longest and shortest real content. Does the layout hold?
5. **Remove-the-effect test:** take away the signature effect. Is there still a designed page underneath? Did the effect carry meaning that is now missing? It should have done.
6. **Parity test:** put desktop and mobile side by side. Do they look equally authored?
7. **Middle test:** screenshot sections 3–6. Do they still belong to the concept?
8. **Detail pass:** zoom to 200% on type, edges, icons and focus states.

## Asset sourcing plans

When critical imagery or models are missing, propose a concrete plan with its effect on quality, schedule and cost:

| Route | Quality | Schedule effect | Cost driver | Risks |
| --- | --- | --- | --- | --- |
| Commissioned photo or video shoot | Highest specificity | Planning, shoot and edit time | Crew, location, retouching | Weather, access, model releases |
| Client-shot with a shot list | Variable, but authentic | Short | Client time | Inconsistent quality. Provide a lighting and framing guide. |
| Illustration commission | High, and fully ownable | Sketch and revision rounds | Illustrator rates, usage terms | Style drift. Agree a style sheet. |
| 3D commission or CAD conversion | High if done properly | Modelling, texturing, optimisation | Modelling hours | Topology and UV issues. See the WebGL and 3D guide. |
| Licensed stock | Generic unless curated | Fast | Licence tier | Interchangeability. Check exclusivity and the terms for people. |
| AI generation | Variable. Good for concepts. | Fast | Tool terms | Rights, artefacts, misrepresentation. Requires client approval. |
| Typographic or abstract approach | Can be excellent | Fast | Type licence | Needs strong copy and typography to carry it |

Record every asset in the [asset manifest](../templates/asset-manifest.md) with its source, ownership or licence status, intended use, dimensions, delivery format, fallback and production status.
