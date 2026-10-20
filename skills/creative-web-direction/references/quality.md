# Quality: critique, accessibility, performance, testing and release evidence

## Contents
- Evidence rules
- Critique in four passes
- Recording findings
- The award lens, kept in its place
- Accessibility: WCAG 2.2 AA for expressive sites
- Accessibility testing protocol
- Performance: lab, field and frames
- Performance measurement protocol
- Functional testing matrix
- Visual inspection
- Automation snippets (Playwright)
- Release readiness
- Status and authorisation

## Evidence rules

- Every claim in a QA report names its **method, tool, build, browser or device and date**. "Accessible", "fast" or "works on mobile" without these is an opinion.
- **Emulation is not a physical device.** DevTools device mode tests layout and media queries, not touch feel, GPU limits or thermal behaviour. Say which one you used.
- **Lab is not field.** A new site without representative traffic cannot claim a Core Web Vitals field pass.
- **Automated is not complete.** A perfect axe or Lighthouse accessibility score does not establish WCAG conformance. Neither do ARIA attributes.
- **Not tested** carries a reason and a resolution path ("Not tested: no iOS device available. Resolve by testing on Safari iOS 18+ before launch."). It is never counted as a pass.

## Critique in four passes

Run the passes separately, so that a strong visual impression doesn't mask usability or engineering problems.

**1. Creative coherence**
- Is the concept thesis legible at the opening, in the middle sections, on inner pages and at the close?
- Do the type, layout, imagery, motion and interaction express the same idea? Check the concept-to-execution map row by row.
- Interchangeability test: what would need to change for an unrelated company? Ideally a lot.
- Is there a designed resolution, or does the site just stop?
- Do the mobile compositions show the same authorship as desktop?

**2. Content and usability**
- Is the copy specific, credible and in voice? Are there any unapproved claims or placeholders left?
- Can a visitor who knows what they want reach it within one or two actions? Is the primary action always findable?
- Do navigation, history, forms, search, filters and empty, error and success states work and look designed?
- Is the time to meaningful content reasonable for first-time and returning visitors?

**3. Engineering quality**
- Separation of content, layout, state, motion and rendering. Tokens instead of magic numbers.
- Property ownership in motion: no two systems fighting over one property.
- Cleanup and disposal: no duplicated listeners or timelines after navigation, and GPU memory stable over repeated mounts.
- Error handling and fallbacks for fonts, media, WebGL, network and script failures.
- Security: no secrets in client bundles, server-side validation, no fake success states.
- Dependencies justified, pinned and licensed.

**4. Accessibility and performance**
- WCAG 2.2 AA checks (below), with evidence of manual testing.
- Budgets met on the production build, with the measurement conditions recorded.
- Motion: reduced-motion behaviour verified, pausable media, no flashing.

## Recording findings

Use this format for every significant finding:

| ID | Pass | Finding | Evidence | Affected users | Severity | Recommended correction | Effort |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-07 | A11y | The pinned "Process" chapter traps keyboard users: Tab can't leave until the scroll completes | Keyboard pass in Firefox 133 on Windows, 2026-10-20: 14 Tab presses cycle inside the chapter | Keyboard and switch users | S1 | Remove the focus loop and add a "Skip chapter" link before the pin. Ensure the pinned content is in DOM order. | S |

Severity scale:
- **S1 Release-blocking:** prevents a core task, excludes a user group, involves legal or security risk, breaks the build, or makes a false claim.
- **S2 Major:** a core experience is significantly degraded for many users, or the concept breaks in a prominent place.
- **S3 Moderate:** a noticeable defect with a workaround, or an inconsistency in a secondary area.
- **S4 Polish:** a craft detail that would raise quality.

Avoid self-congratulatory ratings. If something is excellent, say what specifically works and why, with the same evidence standard.

## The award lens, kept in its place

Awwwards publishes per-site scorecards. The scorecard checked on 2026-10-20 ([example](https://www.awwwards.com/sites/self-aware)) weights **Design 40%, Usability 30%, Creativity 20%, Content 10%**, with a separate Developer Award scoring Semantics/SEO, Animations/Transitions, Accessibility, WPO (web performance optimisation), Responsive Design and Markup/Meta-data. Re-verify the current categories and weights before citing them.

Rules:
- The award rubric is **one external lens**. It is distinct from developer evaluation, and distinct from this skill's acceptance criteria (the client's goals, accessibility, performance and evidence).
- You may use the categories to structure a critique ("on the jury's Usability dimension, the main risk is…").
- **Never** present an internal score as a prediction of a jury result, and never imply that an award is likely.

## Accessibility: WCAG 2.2 AA for expressive sites

Target WCAG 2.2 AA unless the project specifies otherwise ([spec](https://www.w3.org/TR/WCAG22/)). The criteria most often at risk on creative sites:

| SC | Requirement | Where creative sites fail it |
| --- | --- | --- |
| 1.1.1 Non-text content | Text alternatives | Canvas or 3D content with no description. Decorative images not hidden. |
| 1.3.1 Info and relationships | Structure in markup | Headings drawn as images or canvas. Div soup instead of lists and landmarks. |
| 1.3.2 Meaningful sequence | DOM order matches reading order | Visually reordered grids. Absolutely positioned story steps. |
| 1.4.1 Use of colour | Not colour alone | Active state shown only by tint |
| 1.4.2 Audio control | Pause or stop audio that plays more than 3 s | Autoplay soundtracks |
| 1.4.3 Contrast (minimum) | 4.5:1 text, 3:1 large text | Text over video or imagery, light grey captions, hover-only contrast |
| 1.4.4 Resize text | 200% without loss | `vw`-only type, fixed-height containers |
| 1.4.10 Reflow | No 2D scrolling at 320 CSS px | Horizontal scroll sections, fixed-width canvases |
| 1.4.11 Non-text contrast | 3:1 for UI and focus indicators | Hairline buttons, low-contrast focus rings |
| 1.4.12 Text spacing | Survives increased spacing | Clipped split-text masks, fixed-height boxes |
| 1.4.13 Content on hover or focus | Dismissible, hoverable, persistent | Hover cards that vanish, cursor-follow tooltips |
| 2.1.1 Keyboard | All functionality operable by keyboard | Drag-only carousels, canvas-only controls |
| 2.1.2 No keyboard trap | Focus can always leave | Pinned sequences, modals, embedded canvases |
| 2.2.2 Pause, stop, hide | Moving content longer than 5 s is controllable | Marquees, autoplay video, ambient 3D |
| 2.3.1 Three flashes | No more than 3 flashes per second | Strobing transitions, glitch effects |
| 2.4.1 Bypass blocks | Skip mechanisms | Long intros with no skip |
| 2.4.3 Focus order | Logical order | Visual order diverging from DOM order |
| 2.4.7 Focus visible | Focus indicator visible | `outline: none` with no replacement |
| 2.4.11 Focus not obscured (minimum) | Focused item not fully hidden | Sticky headers and footers, cookie bars, fixed canvases |
| 2.5.1 Pointer gestures | Single-pointer alternative for path or multipoint gestures | Pinch-only zoom on a canvas |
| 2.5.2 Pointer cancellation | Actions complete on up-event or are reversible | Actions fired on pointer-down |
| 2.5.3 Label in name | Visible label is part of the accessible name | Icon buttons with mismatched labels |
| 2.5.7 Dragging movements | Non-drag alternative | Drag-to-explore, sliders without buttons |
| 2.5.8 Target size (minimum) | At least 24×24 CSS px, or with spacing | Tiny dot navigation, close buttons |
| 3.1.1 / 3.1.2 Language | `lang` on the page and on its parts | Multilingual sites missing attributes |
| 3.2.1 / 3.2.2 On focus, on input | No unexpected context change | Auto-navigating selects, focus-triggered scroll jumps |
| 3.3.1 / 3.3.3 Errors | Identified and with suggestions | Toast-only errors, colour-only errors |
| 3.3.8 Accessible authentication (minimum) | No cognitive-test-only login | Puzzle CAPTCHAs |
| 4.1.2 Name, role, value | Correct semantics for controls | Div buttons, custom toggles without state |

Design inputs beyond AA: reduced motion (related to 2.3.3, Animation from Interactions, at AAA), forced-colours support and a readable measure.

**Animated and split text:** each piece of text has exactly one accessible representation. Verify with a screen reader that headings are announced once and in full.

## Accessibility testing protocol

Automated checks first, then manual checks. Record each in the QA report with the route, browser, assistive technology and date:
1. **Automated:** run axe-core on every route template and on key states (menu open, modal open, form error), plus Lighthouse accessibility as a secondary check.
2. **Keyboard:** Tab and Shift+Tab through every route, operate every control, check that focus is visible and never obscured, exit every pinned sequence and modal, and use the skip links.
3. **Screen reader:** at least one pairing that matches the audience, such as NVDA with Firefox or Chrome on Windows, VoiceOver with Safari on macOS or iOS, or TalkBack with Chrome on Android. Check the heading outline, landmarks, link purpose, announcements on route change, form errors and split text.
4. **Zoom and reflow:** 200% text zoom, then 400% browser zoom at a 1280 px window (equivalent to 320 px). No loss of content or function.
5. **Reduced motion:** emulate `prefers-reduced-motion: reduce`, reload and walk the journey. Meaning must be preserved and no large movement should remain.
6. **Contrast:** check text over imagery and video at its worst frame. Check focus indicators and UI boundaries at 3:1.
7. **Forced colours:** Windows contrast theme or `forced-colors` emulation, so that boundaries and focus remain visible.
8. **Touch:** on a physical phone, check target sizes, no hover dependency, and drag alternatives.

## Performance: lab, field and frames

**Core Web Vitals** (re-verify at [web.dev/articles/vitals](https://web.dev/articles/vitals) when applying them). "Good" means LCP ≤ 2.5 s, INP ≤ 200 ms and CLS ≤ 0.1, evaluated at the **75th percentile** of page loads, **segmented by mobile and desktop**. "Poor" is above 4 s, 500 ms and 0.25 respectively.

- **Field** data comes from real users, through CrUX (PageSpeed Insights, Search Console) or your own RUM with the `web-vitals` library. A new site without representative traffic **cannot** claim a field pass. Report "field data not yet available".
- **Lab** data comes from Lighthouse or DevTools on a defined device and network profile. Lighthouse's standard navigation audit **does not measure INP**, because there are no user interactions. Its Total Blocking Time is a diagnostic proxy, not an equivalent. Measure INP in the lab by recording real interactions in the DevTools Performance panel, or with a Lighthouse timespan or user-flow run.
- **Frames:** 60 fps on a 60 Hz display is a useful target for sustained motion, not a promise across devices. The ~16.7 ms frame interval includes all work: script, style, layout, paint, compositing and GPU. High-refresh displays shorten it further. Inspect frame-time variability (p95, long frames), input latency during animation, and repeated interactions. Reduce visual cost when targets are missed.

## Performance measurement protocol

1. Build for production and serve it the way it will be deployed, with compression, caching headers and HTTP/2 or HTTP/3 where possible. Never measure the dev server.
2. Record the conditions: tool and version, device or emulation profile, CPU throttling, network profile, cache state (cold or warm), URL and build hash.
3. Run each lab measurement several times (for example 5) and report the median, plus the spread if it is large.
4. Check the **LCP element** is the intended one and is not delayed by JS reveals, lazy-loading or late font swaps.
5. **CLS:** scroll the full page, open menus and wait for fonts and late assets. Shifts from late-loading media or font swaps count.
6. **INP:** record the key interactions (menu, filter, signature interaction, form submit) with 4× CPU throttling, and inspect the long tasks that cause them.
7. **Motion and 3D:** record the heaviest sequence. Report p50 and p95 frame time on the reference devices, plus `renderer.info` counts per tier.
8. **Static budgets:** run `node <skill-dir>/scripts/check-budgets.mjs <build-dir> --budgets budgets.json` on the build output (see [engineering.md](engineering.md#setting-and-enforcing-budgets)).
9. If a physical device isn't available, say so and label the results "emulated".

## Functional testing matrix

| Area | Check |
| --- | --- |
| Journeys | Each core task from the entry points visitors actually use (home, deep link, social share) to completion |
| Navigation and history | Back and forward after every transition type, refresh on every route, deep links with anchors, the 404 page, scroll restoration |
| Forms | Required fields, validation messages, server errors, success *from the real endpoint*, double-submit protection, autofill |
| Responsive | About 320, 375–390, 768, 1024, 1280–1440 and 1920+ widths, short landscape phones, 200% and 400% zoom |
| Input methods | Mouse, trackpad (including inertial scrolling), touch, keyboard, plus pen if relevant |
| Motion states | Reduced motion on and off. Toggled mid-session. Rapid scroll, reversal and interruption. |
| Failure modes | Fonts blocked, images blocked, video blocked, GLB or KTX2 blocked, WebGL disabled, forced context loss, slow 3G-class network, JS disabled where applicable |
| Lifecycle | Background tab and return, bfcache back navigation, repeated route entry (10 times) with memory stable |
| Content stress | Longest and shortest real content, missing optional images, translated strings |

## Visual inspection

- Compare the build against the approved design at the same viewports. List intentional deviations with their reasons, and fix accidental ones.
- Inspect **meaningful animation states**: start, middle, end, reversed and interrupted. Capture them as screenshots at set progress values, or as a screen recording. The first screen alone proves little.
- Check type details (wrapping, orphans, optical alignment), image quality (compression artefacts, crops per breakpoint), focus states and dark or forced-colour modes.
- Automated screenshots catch regressions in static states. They cannot replace interaction review.

## Automation snippets (Playwright)

Adapt these to the project and verify the APIs against current Playwright docs. They are illustrative, not a full suite.

```ts
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("home: no detectable WCAG A/AA violations", async ({ page }) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]); // still requires manual review
});

test("reduced motion: content visible without animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("3D asset failure shows the designed fallback", async ({ page }) => {
  await page.route("**/*.{glb,ktx2}", (route) => route.abort());
  await page.goto("/");
  await expect(page.getByTestId("scene-fallback")).toBeVisible();
});

test("keyboard can leave the pinned chapter", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /skip chapter/i }).focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#after-chapter")).toBeInViewport();
});
```

To test without WebGL in Chromium, launch with a flag such as `--disable-webgl` or `--disable-3d-apis` (verify against your browser version), and assert that the fallback appears.

## Release readiness

Before calling work ready, confirm each item with evidence or mark it **not tested**:
- [ ] The concept stays legible throughout the experience, including inner pages and the close
- [ ] Content and assets are credible, approved and appropriately licensed (asset manifest complete)
- [ ] Core user journeys work, and important states (loading, empty, error, success, 404, fallbacks) are designed
- [ ] Desktop and mobile compositions have received equivalent attention
- [ ] Motion supports understanding, is controllable, and reduced motion preserves meaning
- [ ] Performance and accessibility claims match the evidence, with lab and field kept apart
- [ ] No known release-blocking (S1) defects remain undisclosed
- [ ] Setup, editing, deployment and maintenance instructions are usable by the people who will maintain the site

## Status and authorisation

Finish every QA cycle with exactly one status:
- **Ready for client review:** the scope is complete for review, with known issues listed and nothing presented as tested that wasn't.
- **Ready for authorised deployment:** release checks done, no undisclosed S1s, and the client has the evidence to approve a launch.
- **Blocked by [named dependencies]:** for example missing approved copy, an untested iOS Safari, or a form endpoint not provisioned.

Never publish, deploy to production, purchase, submit for awards or change production infrastructure without explicit authorisation from the client. Prepare the build, the report and the deployment steps so that approval concerns a concrete result. Use the [QA report template](../templates/qa-report.md).
