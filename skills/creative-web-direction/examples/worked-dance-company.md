# Worked example: where authored motion is the concept

> **Fictional and illustrative.** "Fenwright Dance Company" is invented, and so are all its facts. The budgets are planning targets for this brief, not measurements. Use this example to calibrate how motion can grow from content, not as a recipe.

## The request

> "We're a contemporary dance company with a new four-work season. Our site is static and lifeless — it's the opposite of what we do. We want people to feel the movement before they buy a ticket. Twelve weeks, mid-sized budget. Ticketing stays with our existing provider."

## What the skill inferred before asking

- The supplied materials include 4K rehearsal footage, performance stills, the season programme and scans of the artistic director's notation drawings. The AD creates each work from a hand-drawn movement "score".
- Ticketing happens through an embedded third-party flow, so conversion happens off-site after a "Book" link.
- There are two audiences: subscribers (returning, wanting dates fast) and new audiences arriving from social video.

## Questions asked (three, prioritised)

1. *What should a returning subscriber be able to do within ten seconds of arriving?* (This sets the direct-access path that protects ticket sales from the cinematic layer.)
2. *Can the notation drawings be shown publicly, and does the AD see them as part of the work or as private working documents?* (They might be the concept, or they might be off-limits.)
3. *Which devices does your social traffic use, and are your rehearsal clips cleared for web use with the dancers' consent?* (This decides the video strategy and the rights.)

Answers: subscribers want "dates and book". The AD is enthusiastic about showing the scores and considers them part of the art. Social traffic is mostly phones, and the dancers' contracts cover web use of rehearsal footage.

## Site Soul Brief (abridged)

| Element | Answer |
| --- | --- |
| Core proposition | Let audiences feel how each new work moves, and book with no friction |
| Concept thesis | Because every Fenwright work begins as a drawn movement score, the site is built from those scores: each work's page moves with its own notation, and visitors can scrub through a phrase and watch the dancers perform it |
| Brand truth | The AD's notation practice *(interview, scans supplied)*. Four works, each with a distinct movement quality *(programme notes)*. |
| Emotional trajectory | Entry: anticipation, like the moment before the lights rise. Exploration: absorbed, seeing how a phrase is made. Resolution: decided, holding a date. |
| Narrative structure | 1. Season index as a single horizontal "season score" (works on a timeline of dates). 2. Each work page: title moment, then the score strip (the signature interaction), the creators, the dates. 3. Book (off-site). 4. Company, education, archive. |
| Visual grammar | Type: a variable sans with a wide weight range, whose weight responds to each work's movement quality (heavy for grounded works, light for suspended ones). A serif for programme-note reading. Layout: a horizontal axis taken from the score, used only where the content is temporal (season, phrase). Image: high-contrast rehearsal stills, where bodies are never cropped mid-joint. Colour: the score's graphite on warm stage-black, with one accent per work taken from its lighting design. |
| Motion grammar | Weight (motion begins slowly, as if from the floor), suspension (holds before resolving), release (fast settle) and stillness (between works, nothing moves). Each work's page tunes these four qualities from its score. |
| Signature interaction | **The score strip.** On each work page, a strip of the AD's notation for one phrase. Scrubbing it (drag, scroll-linked, or arrow keys on the focused slider) advances a frame-accurate rehearsal clip in sync, and highlights the notation mark being performed. Reduced motion or keyboard users get stepped phrase "beats" with still frames and captions. |
| Conversion logic | A persistent "Dates & tickets" link in the header. Each work page shows dates in a plain list above the fold on mobile. The season index doubles as a date picker. |
| Constraints and exclusions | Protect: the dancers' dignity in crops, the AD's notation as art (no gimmicks), the ticketing path. Does not belong: kinetic type that imitates dancers, autoplay sound, a preloader. |

## Territories considered

| | A. The score (recommended) | B. Rehearsal room | C. Bodies in type |
| --- | --- | --- | --- |
| Thesis | The site is made of the company's notation | Raw, warm behind-the-scenes documentary | Typography moves like dancers |
| Signature interaction | Scrub a phrase of notation and watch it danced | Full-bleed rehearsal films with chaptered annotations | Kinetic variable-type titles |
| Audience fit | Both, because the direct-access path protects subscribers | Strong for new audiences, slower for subscribers | Social-friendly, but shallow on the work |
| Expressive potential | High and unique to this company | Medium, a common arts approach | Medium. Risk of cliché. |
| Asset needs | Score scans, synced clips, phrase captions | Long-form edits | Type design time |
| Technical risk | Frame-accurate scrubbing on mid-range phones | Video weight | Reflow cost of variable-font animation |
| Principal trade-off | Engineering effort on one interaction | Less distinctive | Says little about *these* works |

## Concept-to-execution map (top rows)

| Design choice | Link to thesis | Visitor benefit | Validation method | Status |
| --- | --- | --- | --- | --- |
| Score strip synced to rehearsal clip | The notation is the origin of each work | See how a phrase is made, which is unique to this company | Prototype on a mid-range Android: p95 frame time during scrubbing, and sync drift under 1 frame at 24 fps | Prototyped |
| Season index as a horizontal score of dates | The season is a composition in time | Scan all four works and dates at once | Find "Saturday 14th, Work 3" in under 30 s on a phone | Proposed |
| Work-title weight tuned per work | Movement quality expressed in type | Recognise each work's character instantly | Readable at rest. No reflow jank on long titles (trace). | Proposed |
| Stillness between works | Silence is a motion quality | Gives each work its own moment | Critique pass: no ambient motion in index gaps | Proposed |
| Stepped "beats" mode | The score has discrete marks | The full experience without drag or motion | Keyboard and screen-reader pass. Reduced-motion emulation. | Proposed |

## Motion specification: the score strip (abridged)

| Field | Value |
| --- | --- |
| Purpose | Explanation: the relationship between a notation mark and the movement |
| Trigger | Drag on the strip, scroll through the sticky phrase section, or arrow keys on the focused `role="slider"` (with `aria-valuetext` like "Mark 4 of 9: release to floor") |
| Properties | Video frame (image sequence frame index), notation highlight (SVG stroke opacity), caption text |
| Scroll range | 3 screen-heights for 9 marks, with a "Skip phrase" link before the section |
| Easing | Linear progress mapping, with direct control. Highlight transitions in about 120 ms. |
| Interruption | Any input takes over immediately. Release keeps the current frame (no auto-play). |
| Reduced motion | No scroll-linked scrubbing. Nine buttons ("beats") show the still frame and caption for each mark. |
| Failure | If frames fail to load, the notation and captions remain, and a link points to the full film page |
| Budget | ≤ 3 MB of frames per phrase (WebP 640×360 strip, decoded on demand in a sliding window of 12 frames). p95 frame time ≤ 16.7 ms on the reference laptop and ≤ 33 ms on the reference Android, to be measured. |
| Acceptance | All four inputs (drag, scroll, keys, beat buttons) reach every mark. The screen reader announces mark and caption. No focus trap. Measured frame times recorded in the QA report. |

## Technology choices

- **GSAP ScrollTrigger** for the sticky phrase section, because CSS scroll timelines were not available in stable Firefox at the check date and the section needs consistent scrubbing everywhere (D-03). SplitText is used for work titles, with its accessibility output verified by screen reader.
- **Image-sequence frames, not video `currentTime` scrubbing.** In this scenario, the week-one prototype compared both on the reference Android. Seeking long-GOP video stalled visibly, and the frame sequence did not. That result is recorded in the decision log with the device, the encoding settings and the date. A real project must run its own comparison.
- **View Transitions** for season index → work page title continuity, with an instant navigation fallback.
- **No smooth-scroll library.** Weighted feel comes from the content's choreography, not from altering scroll.

| Budget | Target | Rationale |
| --- | --- | --- |
| Initial JS (season index) | ≤ 110 KB compressed, including GSAP core and ScrollTrigger | The index needs scrubbing. Work pages lazy-load their frame logic. |
| LCP image | ≤ 180 KB AVIF at 1440 w | A rehearsal still with clear subject at the hero crop |
| Phrase frames | ≤ 3 MB per work, loaded on approach | Loaded only when the visitor nears the score strip |

## Interchangeability test

The score strip uses this company's notation, this season's phrases and these dancers. Replace the company and the core interaction has nothing to show. That is the intended result.

## Highest-risk item, tackled first

Frame-accurate scrubbing on a mid-range phone, prototyped in week one in two variants (video seek versus image sequence) and measured before any page design was finalised.
