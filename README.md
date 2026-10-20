# creative-web-direction

An Agent Skill that helps Claude lead ambitious website projects the way a strong studio would, from client discovery and live reference research through concept, art direction, motion and WebGL prototyping, to production frontend work, critique and release QA.

The skill is built around one question: **does this help turn a specific client's truth into a distinctive, coherent, usable and technically convincing web experience, and can it show the evidence?**

It aims for work that could stand alongside exceptional award-winning sites. It treats awards, commercial results and popularity as aspirations, never guarantees.

> **Status (2026-10-20):** structurally validated, with working technical examples tested in one headless Chromium-based browser. **No behavioural evaluation runs have been recorded yet.** See [What has been tested](#what-has-been-tested) and [evals/README.md](evals/README.md).

## Contents
- What it does
- What's in the repository
- Requirements
- Install
- First use
- Examples
- Helpers and maintainer tools
- What has been tested
- Limitations
- Contributing
- License

## What it does

- **Chooses the narrowest mode** for the request: discovery, direction, visual exploration, prototype, build, critique or a narrow refinement. A stuttering underline gets a fix, not a rebrand.
- **Leads like a creative director.** It asks a few prioritised questions, extracts a brand truth, proposes distinct creative territories when the brief is open, and challenges requests that undermine the client's own goals.
- **Connects every effect to the concept** through a Site Soul Brief and a concept-to-execution map, and applies an interchangeability test to catch generic work.
- **Treats accessibility, performance and failure states as design inputs.** That means WCAG 2.2 AA by default, numeric budgets before expensive effects, native scroll, an HTML-first structure, and fallbacks for reduced motion, missing WebGL and failed assets.
- **Keeps continuity** through a small project record, so resumed sessions don't re-ask settled questions, and holds three checkpoints for full projects: direction, representative design and preview, and launch authorisation.
- **Keeps evidence honest** with fixed labels (proposed, prototyped, built, tested, measured, not tested). It never fabricates references, metrics or test results, and never publishes or deploys without authorisation.

## What's in the repository

```
creative-web-direction/                 repository root
├── README.md                           this file
├── skills/creative-web-direction/      ← the installable skill
│   ├── SKILL.md                        entry point: modes, workflow, checkpoints, routing (178 lines)
│   ├── references/                     loaded only when relevant
│   │   ├── research.md                 live references, evidence, freshness, originality
│   │   ├── discovery-direction.md      intake, brand truth, concepts, territories, trade-offs
│   │   ├── art-direction.md            typography, layout, colour, imagery, copy, critique
│   │   ├── motion.md                   motion language, specs, tool choice, scroll, FLIP, routes
│   │   ├── webgl-3d.md                 when 3D earns its place, scenes, shaders, assets, R3F, lifecycle
│   │   ├── engineering.md              stack, structure, tokens, forms, enhancement, delivery
│   │   └── quality.md                  critique passes, WCAG 2.2, performance, testing, release
│   ├── templates/                      project record, Site Soul Brief, research matrix, storyboard,
│   │                                   motion spec, asset manifest, decision log, QA report
│   ├── examples/
│   │   ├── worked-tenant-clinic.md     restraint wins (fictional)
│   │   ├── worked-dance-company.md     authored motion is the concept (fictional)
│   │   ├── worked-orrery-maker.md      real-time 3D earns its place (fictional)
│   │   └── technical/                  four working HTML examples with fallbacks
│   └── scripts/
│       ├── check-budgets.mjs           static size budgets for a production build
│       └── budgets.example.json
├── evals/                              behavioural evaluation suite (not installed with the skill)
│   ├── README.md                       protocol, rubric, anchors, results log
│   ├── evals.json                      13 cases
│   ├── trigger-evals.json              21 activation queries
│   └── fixtures/                       deliberately flawed inputs for the cases
└── tools/                              maintainer tools (not installed with the skill)
    ├── validate-package.mjs            structural validation
    ├── test-examples.mjs               browser checks for the technical examples
    └── package.json
```

Only `skills/creative-web-direction/` is installed. Evaluations and tools stay in the repository.

## Requirements

- **To use the skill:** a Claude environment that supports Agent Skills (Claude Code, claude.ai with code execution enabled, or the Claude API with the code execution tool). It works best with filesystem, terminal, web search and browser inspection, and it degrades openly when any of these are missing.
- **For the bundled script:** Node.js 18 or newer. No npm dependencies.
- **For the maintainer tools:** Node.js 18+. `test-examples.mjs` also needs `npm install` in `tools/` (playwright-core only, no bundled browser) and an installed Microsoft Edge or Google Chrome.

## Install

The skill folder name must stay `creative-web-direction`, matching the `name` field in SKILL.md.

### Claude Code (CLI, desktop app Code tab, IDE extensions)

Install it for yourself (all projects on this machine):

```bash
mkdir -p ~/.claude/skills && cp -R skills/creative-web-direction ~/.claude/skills/
```

On Windows (PowerShell):

```powershell
New-Item -ItemType Directory -Force "$HOME\.claude\skills" | Out-Null
Copy-Item -Recurse skills\creative-web-direction "$HOME\.claude\skills\"
```

Or install it for one project, so that it is committed and shared with the team: copy the folder to `.claude/skills/creative-web-direction/` in that repository.

Then check it loaded: type `/` and look for `creative-web-direction`, or run `/skills`. According to the Claude Code docs, changes under an existing `~/.claude/skills/` or project `.claude/skills/` are picked up during a session. If you create a *new* top-level skills directory mid-session, run `/reload-skills`. Cloud sessions don't read your local `~/.claude/skills/`. They use skills enabled on your claude.ai account, plus project skills committed to the repository.

### claude.ai

1. Make sure code execution is on: **Settings → Capabilities → "Code execution and file creation"**. On Team and Enterprise plans, an owner may need to enable skills first.
2. Create a ZIP that contains the `creative-web-direction` folder (not just its contents). Use a tool that writes standard forward-slash paths:
   ```bash
   tar -a -c -f creative-web-direction.zip -C skills creative-web-direction
   ```
   `tar` is built into Windows 10+ and macOS. On Linux, use `cd skills && zip -r ../creative-web-direction.zip creative-web-direction`. Avoid Windows PowerShell 5.1's `Compress-Archive`, which writes backslash paths into the archive.
3. Go to **Customize → Skills**, click **+**, then **+ Create skill → Upload a skill**, and choose the ZIP.

Menu labels are from the Claude Help Center as checked on 2026-10-20. They change over time.

### Claude API

Upload the folder with `POST /v1/skills` (multipart, headers `x-api-key` and `anthropic-version: 2023-06-01`), or with the Python SDK:

```python
import anthropic
from anthropic.lib import files_from_dir

client = anthropic.Anthropic()
skill = client.skills.create(files=files_from_dir("skills/creative-web-direction"))
print(skill.id)
```

Then reference it in a Messages request under `container.skills` (`{"type": "custom", "skill_id": "<id>", "version": "latest"}`) with the code execution tool enabled. See the [Skills API guide](https://platform.claude.com/docs/en/build-with-claude/skills-guide). By default the API's code execution container has **no network access**, so research runs in its "provisional" mode unless you supply web tools, and browser inspection isn't available.

## First use

The skill loads automatically when a request matches its description. In Claude Code you can also invoke it directly with `/creative-web-direction`. Some starting prompts:

| Mode | Try |
| --- | --- |
| Discovery | "We're a 6-person architecture practice that converts old warehouses. Our site is a 2018 template. Where do we start?" |
| Direction | "Here's our brief (brief.md). Give me 2–3 creative territories and a recommendation." |
| Prototype | "Prototype the signature interaction for the orrery site: turning the mechanism to a date, with keyboard and no-WebGL fallbacks." |
| Critique | "Critique our site in ./site. People love the hero, but the rest feels generic." |
| Refine | "The line reveal on our titles reads word by word in VoiceOver. Fix it without changing the look." |
| QA | "Check this build for reduced motion, keyboard use and failed 3D assets before client review." |

Expect a recommendation first, then the reasoning and trade-offs, then a short list of decisions it needs from you. On a substantial project it creates a `docs/creative/` folder with a project record and the other artefacts it needs.

## Examples

**Worked examples** (`skills/creative-web-direction/examples/worked-*.md`) are fictional briefs that lead to deliberately different directions: a tenant legal clinic (restraint), a dance company (authored motion) and an orrery workshop (real-time 3D). They calibrate specificity and judgment. They are not templates.

**Technical examples** (`skills/creative-web-direction/examples/technical/`) are dependency-light HTML files. Open them over HTTP, because module scripts and history APIs behave differently on `file://`:

```bash
python -m http.server 8765 --directory skills/creative-web-direction
```

Then visit, for example, `http://localhost:8765/examples/technical/webgl-scene.html`.

| File | Demonstrates | Test hooks |
| --- | --- | --- |
| `line-reveal.html` | Layout-aware line masks, one accessible text copy, re-split after font load and resize, reduced motion, fast-scroll safety | `?reduced=1` |
| `scroll-chapter.html` | CSS scroll timelines with an IntersectionObserver fallback, sticky pinning, a skip link, focus not obscured | `?fallback=1`, `?reduced=1` |
| `shared-element.html` | View Transitions with a FLIP fallback, history, deep links, scroll restoration, focus return | `?flip=1`, `?reduced=1` |
| `webgl-scene.html` | HTML-first three.js, lazy loading, on-demand rendering, tiers, pause offscreen, context loss and restore, disposal by ownership | `?fail=1`, `?nowebgl=1`, `?reduced=1` |

The examples load optional resources from public CDNs: the Fraunces font from Google Fonts in `line-reveal.html`, and three.js 0.186.1 from jsDelivr in `webgl-scene.html`. Self-host them in production.

## Helpers and maintainer tools

**Budget check** (part of the skill):

```bash
node skills/creative-web-direction/scripts/check-budgets.mjs dist --budgets budgets.json --markdown budget-report.md
```

It reports raw, gzip and brotli sizes by category, the entry route's initial JS, CSS and preloads (following static imports), and pattern budgets for lazy chunks. It exits with 1 when a budget fails, so it can gate CI. It measures bytes only. It does not measure LCP, INP, CLS, decode time or GPU memory.

**Validate the package** (run this before every commit):

```bash
node tools/validate-package.mjs
```

**Browser checks for the technical examples:**

```bash
cd tools && npm install && node test-examples.mjs
```

It uses Microsoft Edge by default. Pass `--channel chrome` or `--executable <path>` to use another browser, and `--headed` to watch.

## What has been tested

Tested on 2026-10-20 on Windows 11 with Node 24.13.1:

| What | How | Result |
| --- | --- | --- |
| SKILL.md frontmatter and structure | `tools/validate-package.mjs`, plus Anthropic's skill-creator `quick_validate.py` | Pass, 0 errors. Description 982/1024 characters. Body 178 lines. |
| Internal links and anchors | `validate-package.mjs` over all Markdown files | Pass |
| Eval files | Schema checks in `validate-package.mjs`. Fixtures exist. | Pass, 13 cases and 21 trigger queries |
| `check-budgets.mjs` | Synthetic Vite-style build: pass and fail budgets, JSON and Markdown output, missing directory, bad option, missing entry, malformed budgets file, Windows paths, PowerShell | Behaves as documented (exit codes 0, 1 and 2) |
| Technical examples | `tools/test-examples.mjs`: 42 checks in headless Microsoft Edge 155 with SwiftShader WebGL. Covers no-JS, reduced motion, fallbacks, history, focus, context loss and restore, disposal, failure paths. | 42/42 pass. A mutation test confirmed the restore-lighting check catches a regression. |
| Visual sanity of the examples | Screenshots at 1280×800 and 390×844 | Reviewed by eye |
| ZIP packaging | `tar` and Python `shutil` archives inspected for forward-slash paths | Correct. (Windows PowerShell 5.1 `Compress-Archive` produced backslash paths.) |

**Not tested:**
- **Behavioural evaluations.** No with-skill and without-skill runs have been made. The suite and protocol are in `evals/`.
- **Installation and activation** in Claude Code, claude.ai and the API. The instructions above follow the official docs as read on 2026-10-20, but have not been run end to end.
- **The examples in Firefox and Safari**, on physical phones, or with screen readers. The automated checks used one Chromium-based browser with software rendering, so they say nothing about smoothness on real hardware.
- **The skill with different models**, such as Haiku, Sonnet and Opus. The authoring guidance recommends doing this.

## Limitations

- The skill guides judgment. It cannot guarantee taste, originality or award outcomes, and no keyword check can certify them.
- Browser-support and library notes carry a check date (2026-10-20) and will age. The skill tells the agent to re-verify, and contributors should refresh the snapshots.
- Real-time 3D asset production (CAD conversion, retopology, texturing) needs real tools and people. Without them, the skill produces a handoff specification, not a production asset.
- Field performance claims need real-user traffic. A new site can only report lab results.
- Other installed design skills may compete for the same requests. If two skills with overlapping descriptions are installed, check which one loads by using the trigger queries in `evals/trigger-evals.json`.

## Contributing

1. Open an issue describing the behaviour you observed: the prompt, the environment and the model. Include what the skill did and what it should have done.
2. Keep `SKILL.md` lean. Put specialist depth in the relevant `references/` file, and link any new file directly from SKILL.md.
3. When you change guidance, add or update an eval case in `evals/evals.json` that would catch the regression. If you run evaluations, record them in the results log, with the model, the number of runs and the grader.
4. Refresh dated facts (browser support, library versions and licences, platform menu paths) with the date you checked and the source.
5. Run `node tools/validate-package.mjs`, and `node tools/test-examples.mjs` if you touched the technical examples, before opening a pull request.
6. Never add fabricated testimonials, metrics, award claims, compatibility badges or usage numbers, in the skill, its examples or this README.

## License

Licensed under the [Apache License 2.0](LICENSE). The licence covers the skill, its documentation, templates, examples, evaluations and tools.

Third-party material is not covered by this repository's licence. That includes three.js (MIT), loaded from a CDN, and the Fraunces typeface (SIL Open Font License), loaded from Google Fonts in one example. All clients, names and figures in the examples and fixtures are fictional.
