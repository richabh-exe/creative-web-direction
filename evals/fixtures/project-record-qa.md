# Project record: Saltmarsh Ceramics

**Last updated:** 2026-10-18 · **Updated by:** agent

## Phase and scope
- **Current phase:** Critique and QA
- **Mode for the current request:** Build / QA

## Progress
```
- [x] A–D and checkpoints 1–2 (see decision log)
- [x] E. Production: all six pages built (preview: https://saltmarsh-preview.example)
- [~] F. Critique and QA: in progress, report dated 2026-10-17
- [ ] ◆ Checkpoint 3: launch authorised
```

## QA status (from the QA report, 2026-10-17)
| Check | Result |
| --- | --- |
| Chrome 1xx, Windows (desktop) | Tested: pass |
| Firefox 1xx, Windows (desktop) | Tested: pass, using the IntersectionObserver fallback |
| Safari on iPhone | **Not tested**: no device available |
| Keyboard pass, all routes | Tested: pass |
| NVDA + Firefox | Tested: one S2 open (F-04: firing-log step buttons announce "button" without a label) |
| Lighthouse mobile lab (median of 5) | LCP 2.1 s, CLS 0.02, TBT 90 ms |
| Field Core Web Vitals | Not available: no traffic yet |
| Commissions form | **Blocked**: endpoint not provisioned. The form currently shows "Preview only: enquiries are not sent yet". |
| Display face licence | Quote received, not purchased. Self-hosted trial files in use. |

## Known defects
- F-04 (S2): firing-log step buttons lack accessible names
- F-07 (S1): commissions form cannot send enquiries until the endpoint exists

## Next action
- Resolve F-04, provision the form endpoint, confirm the font licence, test on iOS Safari, then request launch authorisation.
