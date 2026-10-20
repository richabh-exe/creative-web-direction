# Engineering architecture and implementation

## Contents
- Honour the existing project
- Choosing a stack for a new project
- Selecting dependencies by responsibility
- Project structure and separation of concerns
- Design tokens and motion parameters
- Semantic structure, metadata and structured data
- Routes, loading and error handling
- Forms, integrations and security
- Progressive enhancement layers
- Delivering assets with priority
- Setting and enforcing budgets
- Code conventions for expressive frontends
- Test and measurement tooling
- Handoff and maintenance documentation

## Honour the existing project

Before writing code, read `package.json` and the lockfile, the framework and router, the styling approach, lint and format configs, the test setup, CI, deployment config and project instructions (CLAUDE.md, AGENTS.md, CONTRIBUTING). Follow the conventions already there, including naming, file layout, state management and CSS methodology. If the creative direction needs an architectural change, such as a new renderer, a router migration or a CMS, explain the benefit, cost and risk, and get approval before committing the client to it.

## Choosing a stack for a new project

For an unconstrained new frontend, **React + Vite + TypeScript + Tailwind CSS** is a practical default: a fast dev loop, a broad ecosystem (GSAP, Motion, R3F), typed code and token-driven styling. Verify current versions and setup steps in the official docs at the time of use.

Deviate when the project needs it:

| Need | Consider | Why |
| --- | --- | --- |
| Content-heavy and SEO-critical, mostly static | Astro, or Next.js with static generation | HTML-first output, islands for interactive parts, less client JS |
| Server rendering, auth, dynamic data | Next.js, Remix or React Router framework mode, SvelteKit, Nuxt | Rendering and data-loading model |
| Editors updating content weekly | A framework plus a headless CMS, or a mature CMS theme (for example a WordPress block theme) | The editing workflow matters more than the rendering stack |
| Commerce | The platform's supported storefront stack | Checkout, inventory and compliance belong to the platform |
| Tiny campaign microsite | Vite with vanilla TypeScript, or Astro | Fewest moving parts |
| Volunteer or non-developer maintainers | Whatever they can actually maintain | A beautiful site nobody can update decays quickly |

Tailwind is optional. If the design system is highly bespoke, plain CSS with custom properties and cascade layers may be clearer. Pick what keeps tokens explicit and readable.

## Selecting dependencies by responsibility

One dependency per responsibility, chosen deliberately:

| Responsibility | Default | Alternatives |
| --- | --- | --- |
| Rendering and UI | React (or the existing framework) | Svelte, Vue, vanilla |
| DOM animation | CSS and the Web Animations API | GSAP (complex timelines, scroll orchestration), Motion (React layout and gesture animation) |
| Scroll orchestration | Native scroll, IntersectionObserver, CSS scroll timelines | GSAP ScrollTrigger |
| Smooth scrolling | None | Lenis, only with an explicit justification and testing |
| 3D | three.js | React Three Fiber plus drei in React projects |
| Routing | The framework's router | — |

For each candidate, verify the **current version**, **licence**, **maintenance** (recent releases, issue activity), **bundle cost** (measure it in your build, not from a blog), **SSR compatibility**, **TypeScript support** and **accessibility features**. Record the choice and its reason in the [decision log](../templates/decision-log.md). Pin versions in the lockfile.

Combining libraries only because award sites use them is not a reason. If two libraries could own the same responsibility, such as GSAP ScrollTrigger and CSS scroll timelines on the same elements, pick one per element.

## Project structure and separation of concerns

Keep content, layout, interface state, motion orchestration and rendering separate, so that each can change without breaking the others:

```
src/
  content/            # copy, case studies, structured data (JSON, MDX or CMS adapters)
  components/         # presentational components; no animation timelines inside
  sections/           # page sections composed from components and content
  motion/
    tokens.ts         # durations, easings, distances, springs (mirrors CSS vars)
    timelines/        # named timelines per section; own their targets explicitly
    useReducedMotion.ts
  scene/              # WebGL: renderer setup, scene modules, loaders, tiers, dispose
  routes/             # route components and metadata
  styles/             # tokens.css, base, layers
public/
  models/ textures/ fonts/ media/   # optimised assets listed in the asset manifest
docs/creative/        # project record, brief, storyboard, motion spec, QA report
```

Adapt this to the framework's conventions. The principle matters more than the folder names.

## Design tokens and motion parameters

- Name every value that carries a design decision: colour roles, type scale, spacing, radii, shadows, z-index layers, breakpoints, durations, easings, distances and spring parameters.
- With Tailwind v4, define tokens in CSS through `@theme` (for example `--color-ink`, `--font-display`, `--ease-release`) so that they exist as CSS variables and as utilities. Without Tailwind, use `:root` custom properties in a `tokens.css`.
- Mirror the motion tokens in a TypeScript module for JS-driven animation, and keep the two in sync, from one source if practical.
- Expose the parameters you tune often (stagger, scrub smoothing, camera distances, tier thresholds) in a config object, not scattered literals.
- Comment any non-obvious constant with *why* it has that value, for example `// 0.08 s stagger: 4 lines finish within the 1 s attention window`.

## Semantic structure, metadata and structured data

- Landmarks (`header`, `nav`, `main`, `footer`), one `h1` per view, a logical heading order, and `lang` on `<html>`.
- Each route has a unique `<title>` and meta description, Open Graph and social images, a canonical URL and sensible robots directives. Provide a sitemap for multi-page sites.
- **Structured data only when accurate.** For example, `Organization`, `Product` (with real offers), `Event` (with real dates and locations) or `Article`. Never mark up reviews, ratings or prices that don't exist.
- Provide a favicon set and a web app manifest only if needed.

## Routes, loading and error handling

- Give every meaningful view a real URL, so that deep links, refresh and sharing work. Design the 404 page as part of the concept.
- Scroll restoration and focus management on navigation are covered in [motion.md](motion.md#route-transitions).
- Render core content without waiting for nonessential assets. Load heavy features (3D, video, large libraries) with dynamic `import()`, triggered by visibility or intent.
- Wrap risky subsystems (canvas, video, third-party embeds) in error boundaries or try/catch, with designed fallbacks. Log errors in development, and report them in production only with an authorised tool.
- Use timeouts for network-dependent features, so that a stalled request leads to a fallback rather than an endless spinner.

## Forms, integrations and security

- Validate on the client for convenience and on the server for truth. Errors are announced, associated with their fields (`aria-describedby`) and explained in plain language (WCAG 3.3.1 and 3.3.3).
- **Never fake success.** If the endpoint doesn't exist yet, show a clearly labelled preview state or disable submission, and record the dependency.
- Protect public endpoints proportionately: server-side validation, rate limiting, a honeypot field and abuse monitoring. Add a CAPTCHA only if needed, prefer privacy-respecting options, and remember accessible authentication (WCAG 3.3.8).
- **Secrets never ship to the client.** In Vite, any variable prefixed `VITE_` is embedded in the bundle. Keep API keys on a server or in a serverless function.
- Don't introduce a CMS, backend, analytics or tracking, a paid service or a third-party embed without a demonstrated need and the client's authorisation. Tracking also needs a consent and privacy review for the jurisdiction.

## Progressive enhancement layers

Build in layers, each of which works if the next one fails:

| Layer | Contains | If the next layer fails |
| --- | --- | --- |
| L0 HTML | All essential content, links, forms and headings, in reading order | — |
| L1 CSS | Layout, typography, colour, responsive composition, focus styles | Readable, unstyled content |
| L2 JS interaction | Menus, filters, routing enhancement, form helpers | Styled, fully navigable pages |
| L3 Motion | Choreography, scroll-linked effects, transitions | Interactive pages without animation |
| L4 Rich media | WebGL, video, audio, large imagery | The motion-enhanced page plus a designed fallback |

Feature-detect each capability (`'IntersectionObserver' in window`, `CSS.supports('animation-timeline: view()')`, `document.startViewTransition`, a WebGL2 context check) rather than sniffing user agents. Where the product permits, test with JavaScript disabled. At minimum, content and navigation should remain.

## Delivering assets with priority

- **Hero or LCP image:** use `<img>` (or `<picture>`) with `width` and `height` attributes, `fetchpriority="high"`, and **no** `loading="lazy"`. Don't hide it behind a JS-driven reveal that delays rendering.
- **Responsive images:** use `srcset` and `sizes` for resolution, `<picture>` with `media` for art direction, AVIF or WebP with a fallback, and `loading="lazy"` plus `decoding="async"` below the fold.
- **Fonts:** WOFF2, subset to the needed languages, and `font-display: swap` (or `optional` for non-critical faces). Preload only the one or two files needed above the fold. Reduce layout shift on swap with fallback metric overrides (`size-adjust`, `ascent-override`, `descent-override`).
- **Video:** use a poster image, `preload="metadata"` or `"none"`, and sources in modern codecs with fallbacks. Captions are required for speech.
- **3D:** compressed GLB plus KTX2, loaded after the main content, with decoders self-hosted.
- **Code splitting:** split by route, and by feature for heavy dependencies such as three.js, video players and large animation timelines.
- **Caching:** hashed filenames with long-lived immutable caching for assets, revalidated HTML, and brotli or gzip on text assets.
- **Preload sparingly.** Preloading everything competes with the critical path. Preload only what the first view needs and the browser can't discover early.

## Setting and enforcing budgets

Set budgets before expensive effects become commitments. Derive them from this project:
1. **Target devices and networks:** name a reference mid-range phone and a typical connection for the audience, and a reference laptop.
2. **Critical route:** what must load for first meaningful content (HTML, critical CSS, initial JS, the LCP image, critical fonts).
3. **Deferred work:** 3D assets, video, secondary routes.
4. **Runtime:** interaction latency (INP target of 200 ms or less at p75), and frame-time goals for sustained motion on the reference devices.

Example budget categories, with values chosen per project and recorded with their rationale: critical-route transfer, initial JS (compressed), CSS, fonts (count and bytes), LCP image bytes, 3D transfer, texture GPU memory, draw calls and triangles per tier, and p95 frame time during the signature interaction.

Enforce static size budgets with the bundled script on the production build. Run it from the project root, where `<skill-dir>` is the folder containing this skill's SKILL.md. Start the budgets file from `scripts/budgets.example.json` and replace every value with this project's own.

```bash
node <skill-dir>/scripts/check-budgets.mjs dist --budgets budgets.json
node <skill-dir>/scripts/check-budgets.mjs dist --budgets budgets.json --markdown docs/creative/budget-report.md
```

It exits non-zero when a budget is exceeded, so it can run in CI. It checks only bytes on disk. Runtime metrics need the measurements in [quality.md](quality.md).

## Code conventions for expressive frontends

- TypeScript in strict mode. Type shader uniforms, timeline configs and content schemas.
- Keep components small and presentational. Animation timelines live in `motion/` and receive refs. They don't reach into arbitrary DOM.
- **No per-frame React state.** Use refs, mutable objects and the render loop.
- Every effect that adds listeners, observers, timelines or GPU resources returns cleanup. It must survive StrictMode double invocation.
- Guard debug overlays and controls behind `import.meta.env.DEV` (or the framework's equivalent).
- Feature-flag heavy or experimental features, so that they can be disabled without a deploy if they misbehave.
- Explain shader maths, easing choices and magic numbers in comments.

## Test and measurement tooling

Choose by project risk. Verify current versions and APIs:

| Purpose | Tool |
| --- | --- |
| Types and lint | `tsc --noEmit` (or the framework's check), ESLint, Prettier or the project's formatter |
| Functional and journey tests | Playwright (`@playwright/test`), across Chromium, Firefox and WebKit |
| Accessibility automation | axe-core through `@axe-core/playwright` or `@axe-core/cli`, plus manual review |
| Visual regression | Playwright `toHaveScreenshot()` with deterministic states |
| Lab performance | Lighthouse (CLI or CI) on the production build, plus the DevTools Performance panel for interactions and frames |
| Field performance | The `web-vitals` library reporting to an authorised endpoint, or CrUX once there is enough traffic |
| Static size | `scripts/check-budgets.mjs` |
| 3D assets | `gltf-transform inspect`, the glTF-Validator |

## Handoff and maintenance documentation

Before calling the work ready, the repository README covers:
- setup, development, build and preview commands, with the Node version
- how to edit content: where copy lives and how to add a project or case study
- how to change tokens (colours, type, motion) safely
- how assets are optimised (commands) and where the asset manifest lives
- environment variables (names and purpose, never values) and deployment steps. Note that deployment requires the client's authorisation.
- known limitations and the QA report location.
