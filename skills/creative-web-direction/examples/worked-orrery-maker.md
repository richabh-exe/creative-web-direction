# Worked example: where real-time 3D earns its place

> **Fictional and illustrative.** "Vane Orrery Works" is invented, and so are all its facts, ratios and numbers. Budgets are planning targets for this brief, not measurements. Use this example to calibrate when real-time 3D is justified and how to scope it, not as a scene to copy.

## The request

> "We're a two-person workshop that builds brass orreries by hand — commissions only, six-month lead time. People don't understand why they cost what they do until they see one move in person. We have CAD files of the gear train and some macro photography. Can the website do what the object does?"

## What the skill inferred before asking

- The goal is **qualified commission enquiries**, not e-commerce.
- Assets: a STEP export of a recent orrery's gear train (supplied), about 60 macro photographs (supplied) and a two-minute workshop film (supplied).
- The truth claim is that the gear ratios keep the planets' relative periods accurate for decades. This needs the maker's numbers before it can be published.

## Questions asked (four, prioritised)

1. *When a collector finishes on the site, what should they understand that they don't today?* (This defines what the 3D must prove.)
2. *Can you share the actual ratios and how close they are to true orbital periods?* (Publishing accuracy claims needs real numbers.)
3. *Who will convert the CAD into a lightweight web model? Do you have a 3D artist, or should we budget for one?* (This is the critical asset dependency.)
4. *What does a good enquiry look like: budget range, occasion, timeline?* (This designs the form.)

Answers: collectors should understand "it's a mechanism, not a sculpture". Ratios and accuracy figures were supplied (to be verified by the maker before publication). No 3D artist, so budget a commission. A good enquiry includes the occasion, the desired planets and a budget range.

## Why real-time 3D, compared with the alternatives

| Alternative | Why it falls short here |
| --- | --- |
| Film | Shows the mechanism moving, but the visitor can't choose a date, a viewpoint or a gear train to inspect. Agency is the point. |
| Image sequence | One axis (rotation) is feasible, but date × viewpoint × exploded view multiplies frames beyond reason |
| Prerendered stills | Used on the commission and process pages. They don't prove motion. |

Real-time 3D earns its place through **interaction** (turn time yourself), **viewpoint** (look inside the gear train), **material response** (brass under moving light) and **narrative continuity** (one object across the whole page). The cost is a CAD conversion commission, engineering, a tiered performance strategy and fallback design. All of these are included in the plan.

## Site Soul Brief (abridged)

| Element | Answer |
| --- | --- |
| Core proposition | Help collectors understand that a Vane orrery is a precise hand-made mechanism worth six months, and start a commission conversation |
| Concept thesis | **Time you can turn.** Because the orrery's value is its gearing, the visitor drives it: turning the crank, or entering a date, advances the mechanism, and the page's chapters are moments in its turning |
| Brand truth | Hand-calculated gear trains *(maker interview)*. Every wheel cut and filed in the workshop *(film)*. Accuracy figures *(supplied, pending verification)*. |
| Emotional trajectory | Entry: quiet curiosity, an object in low light. Exploration: absorbed, like leaning over a workbench. Resolution: assured and ready to talk. |
| Narrative structure | 1. The object at rest, then a single prompt to "Turn it" or "Enter a date". 2. Inside: the camera moves into the Mars train, and the HTML text explains the ratio. 3. One tooth: a macro photograph handoff from 3D to the real filed edge. 4. The bench: process film stills and lead time. 5. Commission: the form. |
| Visual grammar | Type: a restrained engraved-feeling serif for headings, chosen for its relationship to instrument engraving, and a precise sans for data (tabular figures for dates and ratios). Layout: an asymmetric hierarchical grid with the object dominant and text in a narrow column. Image: macro photography lit to match the 3D scene's key light. Colour: brass, graphite, paper. P3 brass where supported. |
| Motion grammar | Geared (motion is caused, never ambient), damped (inertia that settles), continuous (one object, no cuts) and still at rest (nothing moves until the visitor turns it). |
| Signature interaction | **Turn to a date.** Drag the crank, or use buttons, arrow keys or a date input. The mechanism rotates to the chosen date, and an HTML readout shows the planets' positions and the modelled-versus-true period for the selected planet. |
| Conversion logic | "Commission an orrery" stays in the header. The resolution chapter leads into a form asking for occasion, planets, timeline and budget range. Success is shown only after the real endpoint confirms. |
| Constraints and exclusions | Protect: accuracy (publish only verified numbers) and the craft story. Does not belong: starfields, space-tech styling, ambient particles. They would misrepresent a brass instrument as science fiction. |

## Territories considered

| | A. Time you can turn (recommended) | B. Workshop ledger | C. Celestial atmosphere |
| --- | --- | --- | --- |
| Thesis | The visitor drives the mechanism | The maker's notebook: an editorial site of process | The orrery as a portal to space |
| Signature interaction | Turn to a date (3D) | Annotated macro photo essays | A starfield camera flight |
| Audience fit | Collectors who need to *understand* the mechanism | Craft enthusiasts, at lower cost | Generic. Weak for collectors. |
| Principal trade-off | Commission and engineering cost | Undersells the mechanism | Fails the interchangeability test, since any space brand could use it |

The skill recommended A, with B's editorial pages as the process section, and **rejected C**. A starfield says "space" and the subject is a *machine*.

## Scene brief (abridged)

| Field | Decision |
| --- | --- |
| Subject | Full orrery (sun, six planet arms, base, crank) plus a detailed Mars gear train. Other trains are simplified. |
| Composition | The object occupies about 60% of the viewport height on desktop. In portrait it is reframed by computing distance from the bounding sphere and aspect, never cropped. |
| Materials | Brass (metalness 1, roughness map from macro reference), blued steel arbors, an ivory-toned sun |
| Lighting | Studio HDRI through PMREM, one warm key light matching the macro photography, baked AO on the base, contact shadow plane on the high tier only |
| Camera | 28° FOV. Moves happen only on chapter change triggered by the visitor (scroll or chapter buttons), never autoplayed. |
| Interaction | Crank drag (pointer capture, damping), ± day, month and year buttons, arrow keys on the focused crank slider, and a date input |
| Page relationship | One fixed canvas behind the narrative column. HTML chapters drive camera targets through a shared progress value. |
| Pipeline | STEP → commissioned retopology in Blender → normal and AO bakes → GLB → gltf-transform (dedup, weld, Meshopt, KTX2 ETC1S albedo, UASTC normals) |
| Equivalent fallback | The HTML date tool computes the same positions and draws them in an SVG top-down diagram, plus a 24-frame prerendered rotation sequence |

## Tiers and budgets

| Knob | High | Medium | Low | Fallback |
| --- | --- | --- | --- | --- |
| DPR cap | 2 | 1.5 | 1 | — |
| Textures | 2K KTX2 | 1K KTX2 | 1K KTX2, baked light only | Prerendered stills |
| Shadows | Contact shadow | Baked | Baked | In images |
| Post FX | None (tone mapping only) | None | None | — |
| Visible triangles | ≤ 350k | ≤ 180k | ≤ 80k | — |
| Draw calls | ≤ 120 | ≤ 90 | ≤ 60 | — |
| Texture GPU memory (est.) | ≤ 160 MiB | ≤ 64 MiB | ≤ 40 MiB | — |

| Static budget | Target | Rationale |
| --- | --- | --- |
| Initial JS without the 3D chunk | ≤ 90 KB compressed | Narrative and form readable before 3D arrives |
| 3D chunk (three.js and scene code) | ≤ 200 KB compressed, loaded after LCP | Dynamic import on first idle or on intent |
| GLB plus textures (medium tier) | ≤ 4 MB transfer | Collectors on broadband, and a phone path that stays usable |
| Frame time while turning | p95 ≤ 16.7 ms on the reference laptop, high tier. p95 ≤ 33 ms on the reference mid-range Android, medium tier. | To be measured in the prototype, with tier adaptation if missed |

A minimal working version of the lifecycle, tiering and fallback logic is in [technical/webgl-scene.html](technical/webgl-scene.html). It is procedural geometry, not the commissioned model.

## Concept-to-execution map (top rows)

| Design choice | Link to thesis | Visitor benefit | Validation method | Status |
| --- | --- | --- | --- | --- |
| Visitor-driven time (crank, keys, date) | Time you can turn | Understands that the object is a mechanism | Five collectors asked to explain "what makes it accurate" after use | Proposed |
| No ambient motion at rest | Geared, caused motion | Calm. No battery drain. Every movement means something. | Idle trace: zero frames rendered after settling | Prototyped |
| 3D tooth → macro photo handoff | Continuity from mechanism to hand | Connects precision to craft | Visual review at three breakpoints | Proposed |
| SVG date diagram fallback | The concept survives without WebGL | Same understanding on any device | WebGL-disabled test plus screen-reader pass | Proposed |
| Modelled-vs-true period readout | Accuracy is the brand truth | Proof, not adjectives | Maker verifies the numbers before publication | Blocked (awaiting numbers) |

## Interchangeability test

Remove the name and logo, and the site is still unmistakably about *this* mechanism and its ratios, driven by the visitor. Territory C would have failed this test.

## Highest-risk item, tackled first

CAD-to-web conversion of the Mars train: a two-week commission spike delivering one optimised GLB, measured on the reference Android at the medium tier for triangles, draw calls, transfer size and frame time. It came before the rest of the page design. If it had failed the budget, the fallback plan was baked normal-map detail on simplified gears, or Territory B with a scrubbed image sequence.
