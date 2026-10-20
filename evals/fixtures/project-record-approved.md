# Project record: Saltmarsh Ceramics

**Last updated:** 2026-10-02 · **Updated by:** agent

## Phase and scope
- **Current phase:** Production (vertical slice next)
- **Requested scope:** New marketing site with a commissions enquiry. Six pages: home, work, process, commissions, about, contact.
- **Mode for the current request:** Build

## Progress
```
- [x] A. Discovery: Site Soul Brief drafted
- [x] B. Research: matrix and recommendation (checked 2026-09-08)
- [x] C. Direction: territories and concept-to-execution map
- [x] ◆ Checkpoint 1: creative direction approved (2026-09-15, Mara Quayle, owner)
- [x] D. Design and preview (desktop and mobile boards plus a prototype of the firing-log strip)
- [x] ◆ Checkpoint 2: representative design and interactive preview approved (2026-09-30, Mara Quayle)
- [ ] E. Production: vertical slice validated, then extended
- [ ] F. Critique and QA
- [ ] ◆ Checkpoint 3: launch authorised
```

## Confirmed requirements
- Commissions enquiry is the primary action (source: kickoff call, 2026-09-03)
- Mara edits the journal and work pages herself, monthly (source: kickoff call)
- WCAG 2.2 AA (source: brief)

## Approved decisions
- D-01 Territory "Kiln log": the site reads like the studio's firing log. Each piece is dated by its firing, with cone temperature and glaze notes (approved 2026-09-15)
- D-02 Astro + Tailwind CSS v4 with content collections for work and journal entries (approved 2026-09-15)
- D-03 No WebGL. Glaze surfaces are shown with macro photography and short muted loops (approved 2026-09-15)
- D-04 Firing-log strip: CSS scroll timelines with an IntersectionObserver fallback for browsers without them. Stepped buttons under reduced motion (technical, within scope, 2026-09-22)
- D-05 Budgets: critical route ≤ 140 kB brotli, initial JS ≤ 25 kB, LCP image ≤ 180 kB AVIF, fonts ≤ 2 files and ≤ 100 kB (agreed 2026-09-30)

## Assumptions and unresolved dependencies
| Item | Type | Owner | Needed by | Status |
| --- | --- | --- | --- | --- |
| Final copy for "Firing log" section | Dependency | Mara | Slice review | Draft received 2026-10-01, awaiting approval |
| Photography: 20 macro shots | Dependency | Photographer | Extension phase | 12 of 20 delivered |
| Form endpoint (enquiries) | Dependency | Client to choose provider | Before launch | Not provisioned |
| Display face "Brume Serif" web licence | Dependency | Agency | Before launch | Quote requested |

## Selected concept
- **Thesis:** Because every Saltmarsh piece is defined by its firing, the site is the firing log: work is dated and ordered by firing, with cone, atmosphere and glaze notes, and visitors commission a piece "for the next firing".
- **Signature interaction:** The firing-log strip. A horizontal sequence of kiln entries that advances with scroll, with stepped buttons as the alternative.

## Technical budgets and target devices
- Reference devices: mid-range Android (Moto G-class), 2020 MacBook Air, iPhone 13
- Budgets: see D-05 · Status: agreed

## Evidence and next action
- **Latest preview:** prototype of the firing-log strip (2026-09-28). Chrome and Firefox desktop tested. Safari not tested.
- **Known defects:** none logged yet
- **Next action:** Build the vertical slice: home opening, the firing-log section and the commissions form (as the resolution), with real draft copy and the 12 delivered photos. Validate it in the browser before extending.
