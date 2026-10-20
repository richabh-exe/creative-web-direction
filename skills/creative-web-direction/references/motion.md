# Motion and interaction direction

## Contents
- Motion as a language
- The motion system: tokens and ownership
- Timing and easing from task and intent
- Interaction specification format
- Choosing the tool
- Techniques: decision guides
  - Typographic masks, line and word choreography, variable-font motion
  - FLIP and shared-element continuity
  - Scroll-triggered, scroll-linked and scrubbed animation; pinning
  - Parallax, depth, displacement, reveal masks, video and image sequences
  - Drag, inertia, springs, damping and object manipulation
  - Camera choreography, shader uniforms and coordinated DOM/WebGL
  - Route transitions
- Loading sequences
- Audio
- Custom cursors
- Reduced motion and user control
- Robustness checklist
- React integration patterns
- Performance: profile, don't assume
- Support snapshot

## Motion as a language

Classify every motion by **purpose** before designing it:

| Purpose | Job | Typical character |
| --- | --- | --- |
| Feedback | Confirms an input was received | Immediate, small, consistent |
| Navigation and orientation | Shows where you went and where you came from | Spatially consistent, directional |
| Explanation | Reveals how something works or relates | Paced to comprehension, controllable |
| Emphasis | Draws attention to one thing | Rare, singular per moment |
| Atmosphere | Sets mood | Subtle, pausable, never competing with content |
| Narrative transition | Moves the story between chapters | Authored, interruptible, reversible |

Grammar rules:
- **Hierarchy:** one lead motion per moment, with supporting motions subordinate in distance, duration and contrast.
- **Rhythm:** vary tempo across the journey. Uniform 600 ms fades everywhere read as a template.
- **Continuity:** keep a consistent spatial model. If detail pages come "from the right", back goes left. Shared elements keep their identity across views.
- **Causality:** motion originates from its cause, such as the tapped card, the pointer or the scroll direction.
- **Silence:** decide where nothing moves. Stillness makes the moving moments legible.

Derive the **motion grammar** from the concept. For a dance company it might be weight, suspension and release. For a legal clinic it might be calm, immediate and unambiguous. For an orrery it might be geared, damped and continuous. Write 3–5 qualities, each with one sentence on how it appears and one example.

## The motion system: tokens and ownership

Before building effects, define:
- **Tokens:** durations (for example `--dur-instant`, `--dur-quick`, `--dur-move`, `--dur-scene`), easings (named curves with their intent), distances (small, medium and large offsets), stagger steps, and spring parameters for direct manipulation. Use the same names in CSS custom properties and in a JS or TS config module.
- **Choreography rules:** entry order (container, then heading, then supporting content), exit before entry or crossfade, maximum concurrent moving elements and when stagger is allowed.
- **Property ownership:** exactly one system owns each animated property on each element at any time. Examples: GSAP owns `transform` and `opacity` on `.work-title`. CSS owns `color` and `background-color` on links. The scroll timeline owns `--progress` on `.chapter`. Two systems writing the same property cause flicker and fights that only appear under rapid input.

Record ownership in the [motion spec](../templates/motion-spec.md).

## Timing and easing from task and intent

These are starting points to tune by eye and test, not rules:

| Situation | Starting range | Reason |
| --- | --- | --- |
| Input feedback (press, toggle, hover) | Begin within one frame. Complete in about 80–150 ms. | Must feel immediate, because a delayed acknowledgement reads as lag |
| Small UI state change (menu, accordion, tooltip) | About 150–250 ms | Long enough to follow, short enough not to block |
| Layout or shared-element move, route change | About 250–500 ms, scaled by distance | Gives the eye time to track continuity |
| Expressive or narrative sequence | As long as the story needs, *if* it is interruptible and doesn't block content | Visitors must be able to scroll, skip or act at any time |
| Scrubbed (scroll-linked) timeline | No duration. Progress maps to scroll. | Duration belongs to the visitor |

Easing:
- **Entering to rest:** decelerating (ease-out family). **Leaving:** accelerating (ease-in family). **Moving between two on-screen positions:** ease-in-out.
- **Scrubbed timelines:** linear progress mapping is often correct. Custom easing makes scroll feel disconnected unless it is intentional and subtle.
- **Direct manipulation (drag, flick):** use physics, meaning springs or damping that preserve release velocity, not fixed-duration tweens.
- Custom curves are not automatically better. Name each curve by its intent (`--ease-release`, `--ease-settle`) and use few of them.

## Interaction specification format

Write every significant interaction in this format (see the [motion spec template](../templates/motion-spec.md)):

`Purpose | Trigger | States | Properties or uniforms | Duration or scroll range | Easing or physical model | Interruption and reversal | Desktop input | Touch input | Keyboard path | Reduced-motion behaviour | Loading/failure fallback | Performance budget | Acceptance test`

Worked row for a work-title line reveal:

| Field | Value |
| --- | --- |
| Purpose | Emphasis: each new work title "releases" into view, echoing the choreographic release |
| Trigger | Title's top edge enters 85% of the viewport height, once per page view |
| States | Hidden (lines translated 105% inside masks) → revealing → shown. Final state is also the no-JS state. |
| Properties | `transform: translateY` on line inner spans only. Mask container is static. |
| Duration | 700 ms per line, 80 ms stagger, at most 4 lines |
| Easing | `cubic-bezier(.2,.7,.1,1)` ("release") |
| Interruption | Re-splitting during the animation (resize, font load) cancels it and renders the shown state. Scrolling away does not reverse it. |
| Desktop / touch | Same trigger. No pointer dependency. |
| Keyboard | No interaction. Content stays in reading order and focusable links inside are unaffected. |
| Reduced motion | No translation. Lines appear immediately, or with a 150 ms opacity fade if the motion spec allows it. |
| Failure | No JS, or a split error, leaves the plain heading visible |
| Budget | Under 2 ms scripting per split on a mid-range phone. No layout work during the animation. |
| Acceptance | One accessible name per heading (screen reader reads it once). Correct line breaks after a web font swap. Passes at 200% zoom. Shown state reached after a fast scroll past it. |

## Choosing the tool

Pick the least complicated tool that delivers the experience, and verify current APIs and support before committing.

| Tool | Use for | Avoid when | Notes |
| --- | --- | --- | --- |
| CSS transitions and keyframes | State changes, hover and focus, simple loops | You need sequencing across many elements or scrubbing control | Zero JS. Pair with `@media (prefers-reduced-motion: reduce)`. |
| CSS scroll-driven animations (`animation-timeline: scroll()` / `view()`) | Scroll-linked progress and reveals that are decorative or enhancing | The effect is essential in browsers without support, or needs complex logic | Not Baseline at the last check. Always gate with `@supports (animation-timeline: view())` and provide a fallback. |
| Web Animations API (`element.animate`) | JS-controlled animations without a dependency: FLIP, play/pause/reverse, `finished` promises | Very complex timelines across many targets | Native and cancellable. Good for focused components. |
| View Transitions API | Route and state changes with shared elements | You need fine per-frame control mid-transition | Same-document transitions became Baseline Newly available in Oct 2025. Check cross-document support. Always keep a non-transition path. |
| GSAP (core, plus ScrollTrigger, SplitText, Flip, Draggable or Inertia as needed) | Complex sequencing, scrubbed timelines with pinning, robust cross-browser scroll orchestration, text splitting | A few hover effects that CSS handles | Free under its own licence, which is not MIT, so read the terms. Register only the plugins you use. Measure the bundle cost. |
| Motion (motion.dev, formerly Framer Motion) | React layout animations (`layout`, `AnimatePresence`), springs, gestures. Vanilla `animate`, `scroll` and `inView`. | Long scrubbed and pinned narratives, where GSAP is usually simpler | Check the current package name and imports (`motion`, `motion/react`). |
| Smooth-scroll libraries (for example Lenis) | Rarely: when weighted scroll is integral to the concept *and* tested | By default | Adds input latency risk and breaks expectations on some trackpads. Must disable for reduced motion, keep native scrollbar and anchors working, and sync with any scroll-trigger system. |
| Render-loop animation (three.js, R3F) | Anything inside a WebGL scene | DOM content | Delta-time based. One master clock. See [webgl-3d.md](webgl-3d.md). |

Don't stack libraries because award sites have. Each addition needs a responsibility no existing tool covers.

## Techniques: decision guides

### Typographic masks, line and word choreography, variable-font motion

- **Use when** text arrival carries meaning, such as emphasis, voice or rhythm. Reserve it for moments, not every heading.
- **Split after fonts load** (`document.fonts.ready`), and **re-split on width change**, because line breaks depend on font metrics and container width. Debounce re-splits, and render the final state if one happens mid-animation.
- **Keep one accessible representation.** Either keep a visually hidden copy of the full text and set `aria-hidden="true"` on the split visual copy, or use a splitting library's accessibility option and verify its output with a screen reader. `aria-label` on paragraphs and generic elements is unreliable in assistive technology.
- **Masking:** wrap each line in a container with `overflow: clip` (or `hidden`), and animate an inner span with `transform`. Add a little bottom padding to the mask so descenders don't clip, offset by a matching negative margin.
- **Variable-font motion:** animating `font-variation-settings` or `font-weight` reflows text on every frame, which is expensive on long passages. Limit it to short display text, and test frame times.
- GSAP SplitText (3.13 and later) offers line masking, automatic re-splitting and accessibility options. Check the current docs for option names.
- Working example: [examples/technical/line-reveal.html](../examples/technical/line-reveal.html).

### FLIP and shared-element continuity

- **Use when** an element persists between two states or views, such as a card becoming a detail hero, a thumbnail becoming a lightbox, or a filter reordering a grid.
- **Prefer the View Transitions API** where supported. Name the shared element (`view-transition-name`) and update the DOM inside `document.startViewTransition()`.
- **FLIP fallback:** measure *First* (`getBoundingClientRect`), apply the change, measure *Last*, compute the *Invert* transform, then *Play* to identity with `element.animate`. Correct aspect-ratio distortion by animating a clipping wrapper or counter-scaling children. Animate `border-radius` changes with the scale correction in mind.
- In React, Motion's `layout` and `layoutId` and GSAP's Flip plugin wrap the same idea.
- Make the **non-animated path work first**: real links, real URLs and focus management. The transition is a layer on top.
- Working example: [examples/technical/shared-element.html](../examples/technical/shared-element.html).

### Scroll-triggered, scroll-linked and scrubbed animation; pinning

Distinguish:
- **Scroll-triggered:** crossing a threshold starts a timed animation (IntersectionObserver or ScrollTrigger `toggleActions`).
- **Scroll-linked:** a value follows scroll position continuously (CSS scroll timelines or a ScrollTrigger `scrub`).
- **Scrubbed:** a full authored timeline maps to a scroll range, so the visitor controls the playhead.

Rules:
- **Native scroll is the baseline.** Enhancement must preserve anchors, keyboard scrolling (Space, Page Down, arrows), find-in-page, browser history and scroll restoration.
- **Pinning:** prefer `position: sticky` inside a tall container. It is native, cheap and accessible. Use ScrollTrigger `pin` when you need pin spacing or nested timelines. Every pinned sequence needs an **escape**: a skip link past the chapter, and a scroll length proportional to its content (avoid six screens of scroll for three sentences).
- **Horizontal storytelling** only when the content is genuinely lateral or sequential. Provide keyboard operation and visible progress. Don't trap focus.
- Keep the **content readable in normal flow**. Text that only exists mid-animation is invisible to screen readers and to visitors who skip.
- Respect **rapid scrolling and reversal**. Scrubbed timelines must look correct at every progress value, not just when played forward slowly.
- Working example: [examples/technical/scroll-chapter.html](../examples/technical/scroll-chapter.html).

### Parallax, depth, displacement, reveal masks, video and image sequences

- **Layered parallax:** small magnitudes (a few percent of viewport), on `transform` only. Disable or reduce it with reduced motion. Large-scale parallax, zoom and spinning are common vestibular triggers.
- **Image displacement and distortion:** in WebGL (a fragment shader sampling an image texture) or with SVG filters (expensive on large areas). Use it only when the distortion means something, such as water, heat or memory.
- **Reveal masks:** `clip-path` animations (inset, circle, polygon) can trigger paint on every frame depending on the browser, so profile them. A masked inner `transform` is often cheaper.
- **Video:** use a poster frame, `muted playsinline` for any autoplay, a pause control for autoplay longer than 5 s (WCAG 2.2.2), captions for speech, and `preload="metadata"` or `"none"` below the fold.
- **Scrubbing video by `currentTime`** is smooth only with frequent keyframes. Encode short, all-intra or short-GOP clips for scrubbing, or use **image sequences**. Sequences cost memory: 120 frames × 1280×720 × 4 bytes is about 442 MB decoded if all are kept in memory. Use small frames, atlases, on-demand decoding (`createImageBitmap`) and a sliding window. Prototype on a mid-range phone before committing.

### Drag, inertia, springs, damping and object manipulation

- Use Pointer Events with pointer capture (`setPointerCapture`). Set `touch-action` deliberately: `pan-y` on a horizontal carousel lets vertical page scroll continue.
- Track velocity over the last ~50–100 ms of movement and carry it into inertia on release.
- **Frame-rate-independent damping:** `x += (target - x) * (1 - Math.exp(-lambda * dt))`, with `dt` in seconds. It behaves the same at 60, 120 and 144 Hz. Fixed `x += (target - x) * 0.1` per frame runs faster on high-refresh screens.
- Springs: specify stiffness, damping and mass, or duration and bounce. Clamp to avoid overshoot for UI that must settle precisely.
- **Accessibility:** every drag needs a single-pointer, non-drag alternative (WCAG 2.5.7), such as buttons, a slider input or arrow keys. Provide keyboard operation with visible focus. Let a pointer-up outside the target cancel the action where that is safer (WCAG 2.5.2).
- Spatial navigation (pan and zoom canvases) needs a reset control, bounds and a way to reach every item without precise manipulation.

### Camera choreography, shader uniforms and coordinated DOM/WebGL

- Drive DOM and WebGL from **one clock and one progress source**. For example, a ScrollTrigger timeline tweens both DOM properties and `material.uniforms.uProgress.value`, and the render loop reads the values. Avoid two independent `requestAnimationFrame` loops. Use `gsap.ticker`, `renderer.setAnimationLoop` or the R3F frame loop as the master.
- Camera moves: ease the target and the position separately, keep the subject framed at every aspect ratio, and never move the camera without user initiation in reduced-motion mode.
- Material transitions: tween uniforms such as dissolve progress, roughness or tint. Avoid recompiling shaders mid-transition by keeping material variants warm (see warm-up in [webgl-3d.md](webgl-3d.md)).

### Route transitions

A route transition must preserve:
- **Navigation:** real URLs, working back and forward buttons, refresh on any route, and deep links.
- **Focus:** after navigation, move focus to the new view's main heading or `<main>` (with `tabindex="-1"`), and update `document.title`. On back, return focus to the originating link where practical.
- **Scroll restoration:** forward navigation starts at the top, unless deep-linked to an anchor. Back restores the previous position. Coordinate with `history.scrollRestoration`.
- **Interruption:** a second navigation mid-transition must finish or skip the current one cleanly (`transition.skipTransition()`).
- Framework integrations (React Router, Next.js, Astro, SvelteKit and others) change quickly. Verify the current API in the official docs before use.

## Loading sequences

- Show real content as soon as it is usable. Never gate the whole site behind a loader for assets only one section needs.
- Progress must reflect **actual readiness**: count known assets (three.js `LoadingManager`, fetch with known sizes). If progress cannot be measured honestly, show an indeterminate state.
- Add no artificial delay. A loader that holds a ready page for effect fails returning visitors.
- Provide a **bypass** (for example "Skip intro" or "View without 3D") and a **failure path** with useful content and a retry.
- Remember the visit: skip first-visit sequences on return (`sessionStorage`, wrapped in try/catch).

## Audio

- Opt-in only, with a visible, labelled toggle. Remember the choice.
- Keep independent control: mute and volume, separate from any video.
- Content must make sense without sound. Provide captions or transcripts for speech.
- Respect autoplay policies. Create or resume the `AudioContext` only after a user gesture.

## Custom cursors

- Treat them as a supplement to the system cursor, never the only affordance. Primary actions must be obvious without them.
- Show them only where `(hover: hover) and (pointer: fine)` matches. Hide them for touch.
- The cursor must track without perceptible lag. Never ease the primary pointer position. Eased followers are decoration.
- Reduce or disable them in reduced-motion mode. Never hide the native cursor over text fields.

## Reduced motion and user control

- `prefers-reduced-motion: reduce` means **reduce**, not "remove meaning". Replace spatial movement (translation, zoom, rotation, parallax, camera flights) with instant changes or short opacity fades. Keep feedback and state changes perceivable.
- Stop autoplaying atmospheric motion. Make narrative sequences step-based (buttons, or discrete scroll states) instead of scrubbed.
- Where expressive motion is central to the concept, also provide an **in-site motion toggle** that persists. Some visitors don't know about the OS setting.
- Any auto-moving, blinking or scrolling content that lasts more than 5 s needs pause, stop or hide (WCAG 2.2.2). Nothing flashes more than three times per second (WCAG 2.3.1).
- Implement in both CSS (`@media (prefers-reduced-motion: reduce)`) and JS (`matchMedia('(prefers-reduced-motion: reduce)')`, listening for changes).

## Robustness checklist

Test every significant interaction for:
- [ ] Rapid scrolling and immediate reversal: no stuck intermediate states
- [ ] Resize and orientation change: re-measure, re-split, re-pin
- [ ] Late font loading: re-measure text and layout after `document.fonts.ready`
- [ ] Route changes: timelines, observers and listeners cleaned up, with no duplicates on re-entry
- [ ] Background tabs: rAF pauses, but timers don't, so pause timers, audio and video on `visibilitychange`
- [ ] Repeated entry: init is idempotent, and the second visit behaves like the first or is intentionally different
- [ ] Back/forward cache: on `pageshow` with `event.persisted`, restore or reset animation state
- [ ] React StrictMode double effects: no duplicated timelines or listeners
- [ ] Reduced motion toggled while the page is open
- [ ] Interruption by user input during any sequence

## React integration patterns

GSAP with `@gsap/react` (verify against the [official guide](https://gsap.com/resources/React/)):

```tsx
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function Chapter({ reduced }: { reduced: boolean }) {
  const root = useRef<HTMLElement>(null);

  // Animations and ScrollTriggers created here are reverted on unmount.
  const { contextSafe } = useGSAP(
    () => {
      if (reduced) return; // reduced motion: content is already in its final state
      gsap.from(".chapter-line", {
        yPercent: 105,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%", once: true },
      });
    },
    { scope: root, dependencies: [reduced], revertOnUpdate: true },
  );

  // Animations created later, in event handlers, must be wrapped to be cleaned up.
  const onEnter = contextSafe(() => gsap.to(".chapter-mark", { scale: 1.06, duration: 0.2 }));

  return <section ref={root} onPointerEnter={onEnter}>{/* … */}</section>;
}
```

Rules: never store per-frame values in React state. Use refs and mutate them. Scope selectors to a ref. Return cleanup for manual listeners. Read reduced motion through a small hook that listens to `matchMedia` changes.

## Performance: profile, don't assume

- `transform` and `opacity` usually avoid layout and paint, and can run on the compositor. That is a starting point, not a guarantee. Large layers cost memory, many layers cost compositing time, and `filter`, `backdrop-filter`, big `box-shadow`s and `clip-path` can still be expensive. See the [web.dev animations guide](https://web.dev/articles/animations-guide).
- Use `will-change` sparingly, only on elements about to animate, and remove it afterwards.
- Batch DOM reads before writes. Never read layout (`getBoundingClientRect`, `offsetTop`) in the same loop that writes styles.
- At 60 Hz the frame interval is about 16.7 ms, and that budget covers *all* work: script, style, layout, paint, composite and GPU. Leave headroom by keeping per-frame script well under it on target devices.
- Measure with the DevTools Performance panel (CPU throttling, frame track, Long Animation Frames), on a production build, and on at least one real mid-range phone when motion is central. Record the conditions with every number.

## Support snapshot

Checked 2026-10-20. **Re-verify** on MDN, caniuse or web-features before relying on it:

| Feature | Status at the check | Implication |
| --- | --- | --- |
| CSS scroll-driven animations | Chromium since 115 and Safari 26. Firefox stable behind a flag. Not Baseline. | Always `@supports`-gate, and keep a functional fallback |
| Same-document View Transitions | Baseline Newly available (Firefox 144, Oct 2025) | Use with a non-transition path for older browsers |
| Cross-document View Transitions (`@view-transition`) | Chromium and Safari. Firefox not confirmed. | Treat as progressive enhancement |
| `prefers-reduced-motion` | Widely supported | Implement in CSS and JS |
| WebGPU | Shipped in Chromium, Safari 26 and Firefox on some platforms, with platform gaps | Optional and feature-detected. See [webgl-3d.md](webgl-3d.md). |
