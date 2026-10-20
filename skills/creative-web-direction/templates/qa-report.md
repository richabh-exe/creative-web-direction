# QA report: [Project name], [build or commit], [YYYY-MM-DD]

> Every result names its method, tool, browser or device and date. "Not tested" includes a reason and a resolution. An unavailable check is never a pass. See `references/quality.md`.

## Status
**[Ready for client review | Ready for authorised deployment | Blocked by: named dependencies]**

One-paragraph summary: what was reviewed, the most important findings and what remains unverified.

## Scope and conditions
- Build: [production build? hash] · Served by: [static server, preview deploy URL]
- Routes reviewed: [list]
- Browsers and devices: [e.g. Chrome 1xx on Windows 11 (desktop), Safari on iPhone [model] (physical), Chrome on Android [model] (physical or emulated)]
- Assistive technology: [e.g. NVDA [version] with Firefox, VoiceOver on iOS]
- Tools: [axe-core version, Lighthouse version, Playwright version]

## Critique passes
| Pass | Summary | Key findings |
| --- | --- | --- |
| Creative coherence | | F-… |
| Content and usability | | |
| Engineering quality | | |
| Accessibility and performance | | |

## Findings
| ID | Pass | Finding | Evidence | Affected users | Severity (S1–S4) | Recommended correction | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| F-01 | | | | | | | Open / Fixed (verified how) |

## Accessibility evidence
| Check | Method | Result | Notes |
| --- | --- | --- | --- |
| Automated scan | axe-core [version] on [routes and states] | [n violations] | Automated checks are not conformance |
| Keyboard | Manual, [browser] | | Pinned sections exited? Focus visible and unobscured? |
| Screen reader | [AT + browser] | | Headings once, route announcements, form errors |
| Zoom and reflow | 200% text, 400% zoom | | |
| Reduced motion | Emulated / OS setting | | Meaning preserved? |
| Contrast over media | [tool] at worst frame | | |
| Forced colours | | | |
| Touch and targets | Physical device [model] | | |

## Performance evidence
| Metric | Value | Tool and conditions | Lab or field | Budget | Pass/fail |
| --- | --- | --- | --- | --- | --- |
| LCP | | [Lighthouse x, mobile profile, median of 5] | Lab | ≤ 2.5 s | |
| INP | | [DevTools trace of interactions X, Y, 4× CPU] | Lab | ≤ 200 ms | |
| CLS | | [full scroll, fonts loaded] | Lab | ≤ 0.1 | |
| Field CWV | [Not yet available: no representative traffic] | | Field | | Not tested |
| Static budgets | [link to check-budgets output] | check-budgets.mjs | Static | [budgets.json] | |
| Frame time (signature interaction) | p50 [ ] ms / p95 [ ] ms | [device, tier, duration] | Lab | | |
| 3D resources | calls [ ] · triangles [ ] · textures [ ] | renderer.info, [tier] | Lab | | |

## Functional checks
| Area | Result | Method | Notes |
| --- | --- | --- | --- |
| Core journeys | | | |
| Navigation, history, refresh, deep links, 404 | | | |
| Forms (real endpoint) | | | |
| Responsive matrix | | | |
| Failure modes (fonts, media, 3D asset, no WebGL, context loss, slow network) | | | |
| Lifecycle (background tab, bfcache, repeated entry) | | | |

## Not tested
| Check | Reason | What would resolve it | Risk if launched untested |
| --- | --- | --- | --- |
| | | | |

## Release readiness
- [ ] Concept legible throughout, including inner pages and the close
- [ ] Content and assets credible, approved and licensed
- [ ] Core journeys work. Important states designed.
- [ ] Desktop and mobile given equivalent attention
- [ ] Motion supports understanding and is controllable
- [ ] Performance and accessibility claims match the evidence
- [ ] No undisclosed release-blocking defects
- [ ] Setup, editing, deployment and maintenance docs usable

## Next actions
1. [ ]
