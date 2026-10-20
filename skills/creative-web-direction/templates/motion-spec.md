# Motion specification: [Project name]

> Define the system before the effects. Every significant interaction gets a full row. See `references/motion.md`.

## Motion grammar
| Quality | How it appears | Example |
| --- | --- | --- |
| [e.g. Release] | [Slow suspension, then fast settle] | [Work titles] |

## Tokens
| Token | Value | Intent |
| --- | --- | --- |
| `--dur-quick` | [e.g. 180ms] | Small state changes |
| `--dur-move` | [ ] | Layout and shared-element moves |
| `--ease-[name]` | [cubic-bezier(…)] | [ ] |
| Spring `[name]` | stiffness [ ], damping [ ], mass [ ] | Direct manipulation |
| Stagger step | [ ] | [ ] |

## Property ownership
| Element or selector | Property | Owner (CSS, WAAPI, GSAP, Motion, scroll timeline, render loop) |
| --- | --- | --- |
| | | |

## Interaction specifications

### [Interaction name]
| Field | Value |
| --- | --- |
| Purpose | [feedback, navigation, explanation, emphasis, atmosphere or narrative transition, plus why] |
| Trigger | |
| States | |
| Properties or uniforms | |
| Duration or scroll range | |
| Easing or physical model | |
| Interruption and reversal | |
| Desktop input | |
| Touch input | |
| Keyboard path | |
| Reduced-motion behaviour | |
| Loading/failure fallback | |
| Performance budget | [e.g. no layout during the animation; p95 frame time ≤ 16.7 ms on the reference laptop] |
| Acceptance test | [Observable steps a reviewer can perform] |
| Status | [Proposed, prototyped, built, tested (how), or measured (how)] |

## Global behaviour
- Reduced motion strategy: [ ]
- In-site motion toggle: [yes/no, plus where the choice persists]
- Pause controls for motion longer than 5 s: [where]
- Audio policy: [opt-in control location, default off]
