# Discovery and creative direction

## Contents
- Intake: read first, then ask
- The question bank, ordered by consequence
- Explaining choices to non-technical clients
- When to stop asking
- Extracting brand truth
- The Site Soul Brief
- Developing a concept
- Creative territories
- The concept-to-execution map
- Narrative structure and the middle of the site
- Trade-off conversations and challenging requests
- Checkpoint 1 package

## Intake: read first, then ask

Before asking anything, read what exists: the brief, decks, the current site, analytics summaries the client shares, brand guidelines, copy, photography and code. List what each source already answers. Ask only about what remains consequential, meaning an answer that would change the concept, the structure, the cost or the technology.

Start with **3–5 prioritised questions**. Put the one most likely to change the recommendation first. Give each a one-line reason. Adapt to the answers. A second round is fine, but each round should be shorter than the last.

**Good first message shape:**
> Here's what I can already infer from your materials: [3–4 bullets]. Before I propose a direction, these answers would change my recommendation most:
> 1. [Question] *(why: …)*
> 2. …
> If you'd rather I proceed now, I'll assume [explicit defaults] and mark the direction provisional.

## The question bank, ordered by consequence

Pick from these. Never send the whole list.

| Area | Question | How the answer changes the work |
| --- | --- | --- |
| Audience | Who must this work for first? What are they doing just before they arrive? | Sets entry pacing. A visitor coming from a social ad needs a different opening from a returning subscriber. |
| Desired action | What single action matters most, and what counts as success six months after launch? | Defines conversion logic, the primary call to action and the measurement plan. |
| Brand truth | What can you prove about yourselves that a competitor can't say? | This is the raw material of the concept. Without it, the site will be generic. |
| Proof | What evidence exists: work samples, numbers you can publish, named clients who agreed, press, process? | Decides what the evidence sections can claim. Missing proof becomes a dependency. |
| Emotional intent | How should someone feel on arrival, while exploring, and when they leave? Name a place, object or film that has that feeling. | Sets the emotional trajectory and the motion grammar. Concrete anchors beat adjectives. |
| Content readiness | What copy, photos, video, models and case studies exist today, and who will write what's missing? | Decides the schedule, the asset plan and whether the concept depends on things nobody owns. |
| Constraints | What are the budget range, the launch date, the must-keep elements, the legal or brand rules and the existing stack? | Caps ambition, sets technical routes and reveals what is non-negotiable. |
| Devices | Which devices and networks dominate your audience? Do you have analytics? | Sets budgets and decides whether 3D or heavy video is viable at all. |
| Accessibility | Are there legal or procurement requirements (for example WCAG 2.2 AA, EN 301 549, ADA)? Are there known needs among your audience? | Sets the conformance target and the testing scope. |
| Maintenance | Who updates the site after launch, how often, and with what tools? | Decides on a CMS, the component flexibility and how much bespoke motion is sustainable. |
| Languages | Which languages and scripts are needed, at launch and later? | Affects typeface choice, layout tolerance for longer text and routing. |

Infer instead of asking where possible. If the client has said "most of our traffic is Instagram", you already know the devices.

## Explaining choices to non-technical clients

Describe consequences, not technologies:

| Instead of | Ask |
| --- | --- |
| "Do you want WebGL?" | "Should visitors be able to turn the product themselves and look inside it, or is a beautifully lit film of it enough? Turning it costs more, needs a 3D model and takes longer to load. The film is cheaper, but visitors only see what we choose to show." |
| "Smooth scrolling or native?" | "Some sites make the scroll feel weighted and cinematic. It can also feel laggy on some trackpads and break things like jumping to a section. I'd keep the normal scroll and make the content itself move beautifully." |
| "Headless CMS?" | "Will your team edit pages themselves every week, or is the content mostly fixed after launch? Weekly editing justifies an editing system. Fixed content doesn't." |
| "What about Core Web Vitals?" | "Google measures how quickly the main content appears, how fast the page reacts to taps, and whether things jump around. We'll set targets for those and test against them." |

## When to stop asking

Stop when the remaining uncertainty would not change the recommendation, or when the client asks you to proceed. Then state the assumptions explicitly in the brief, marked `Assumption:`, and carry on. Never block on a question that has a sensible default. Do not hold three rounds of questions before producing anything. A concrete draft usually draws out better answers than more questions.

## Extracting brand truth

A brand truth is a **specific, checkable fact or practice** that the site can express. Adjectives like "innovative", "premium" or "human" are not truths.

Techniques:
- **Proof objects:** physical or documentary things the client actually has, such as a process, a material, a place, a tool, an archive, a ledger or a signature practice.
- **Unfair particulars:** what is true here and nowhere else, such as "every tooth is filed by hand" or "we've staffed the Tuesday eviction calendar since 2016".
- **Contradictions:** tensions that make the subject interesting, such as industrial precision made by two people, or a radical company inside a 19th-century theatre.
- **The visitor's object:** what the visitor is holding, wondering or fearing at arrival, such as a notice, a gift deadline, or curiosity about one work.

Write 2–3 truth statements, each with its source ("client interview, 12 Oct", "process video", "unverified, needs confirmation"). If none survive, the concept will be generic. Say so, and propose how to find one: a workshop visit, an archive review or customer interviews.

## The Site Soul Brief

Complete [templates/site-soul-brief.md](../templates/site-soul-brief.md). Quality bar for each element:

| Element | Weak answer | Strong answer |
| --- | --- | --- |
| Core proposition | "Showcase our brand" | "Help collectors understand why a hand-geared orrery takes six months, and start a commission conversation" |
| Concept thesis | "Bold, modern, immersive" | "Time you can turn: the visitor drives the mechanism, and every chapter is a moment in the orrery's turning" |
| Brand truth | "We value craftsmanship" | "Gear ratios are hand-calculated to keep planetary periods accurate for decades. Source: maker interview." |
| Emotional trajectory | "Wow, then trust" | "Arrival: quiet curiosity at an object in low light. Exploration: absorbed, like leaning over a workbench. Resolution: assured, ready to talk." |
| Narrative structure | "Hero, features, testimonials, contact" | An ordered list of revelations with a reason for each position |
| Visual grammar | "Dark and elegant" | Type, grid, image, colour, material and space, each tied to the thesis |
| Motion grammar | "Smooth animations" | Qualities such as weight, latency, inertia, continuity and silence, each tied to meaning |
| Signature interaction | "3D hero" | One behaviour, with what the visitor does, what it proves and how it works without a pointer or WebGL |
| Conversion logic | "CTA buttons" | How each section moves the visitor closer to the action, plus the direct path for those already convinced |
| Constraints and exclusions | (none) | Protected elements, and devices or ideas that explicitly don't belong |

## Developing a concept

Generate candidates from the subject's own world. Four reliable generators:

1. **Metaphor from the subject:** a mechanism, material, ritual or tool. For example, a dance company's notation becomes the motion grammar.
2. **Structural idea:** the site is organised like something native to the subject, such as an index, a score, a ledger, a procession, a field guide or a court calendar.
3. **Interaction thesis:** the visitor does X, which proves Y. For example, turning the crank proves the ratios are real.
4. **Constraint as concept:** the limitation becomes the voice. For example, a mobile-only, low-data audience leads to a site built like a pocket guide.

Write the thesis as: *Because [brand truth], the site [structural or interaction idea], so visitors [understand, feel or do].*

Test each candidate:
- **Decision test:** does it tell you what to do with the navigation, a case-study page, the form, the 404 page and the footer? If it only tells you what the hero looks like, it is a hero idea, not a concept.
- **Interchangeability test:** remove the logo and name. Could the same idea plausibly represent an unrelated business without substantial change? If yes, increase the specificity.
- **Cliché audit:** list the devices it relies on. Each common device needs a reason grounded in this brief.
- **Feasibility glance:** what assets, skills, time and devices does it assume?
- **Usability check:** can a visitor who already knows what they want reach it within one or two actions?

## Creative territories

Offer **2–3 territories only when the brief is genuinely open**. If the client has selected a direction or supplied an approved design, develop it.

The territories must differ in **concept, narrative and interaction**. A palette swap or a font change is not a different territory. For each, give:

| Field | Content |
| --- | --- |
| Name and thesis | One sentence |
| How it feels | A short paragraph describing the entry, the middle and the resolution from the visitor's view |
| Signature interaction | What the visitor does, and why it belongs to this subject |
| Audience fit | Who it serves best, and who it may lose |
| Expressive potential | What it can make memorable |
| Asset requirements | What must exist or be made, and who owns it |
| Technical feasibility | The approach, the main risk and what to prototype |
| Principal trade-off | The single biggest cost of choosing it |

End with a **recommendation**: which territory, why it suits this client, what you would prototype first and what decision you need. A good set often includes one restrained territory, because restraint is sometimes the strongest answer.

## The concept-to-execution map

Every major design choice gets a row:

| Design choice | Link to thesis | Visitor benefit | Validation method | Status |
| --- | --- | --- | --- | --- |
| Season index as a horizontal score | The company's notation practice | Scan all four works and their dates at once | Usability check: find Saturday tickets in under 30 s on a phone | Proposed |
| Line-mask reveal on work titles | The "release" quality in the AD's notation | Draws attention to each new work as it arrives | Reduced-motion and screen-reader checks. Frame trace on a mid-range Android | Prototyped |

Rules:
- If a prominent effect has no defensible link to the thesis, revise or remove it.
- Every row needs a validation method a person could actually perform.
- Update the status as the work progresses (proposed → prototyped → built → tested).

## Narrative structure and the middle of the site

Choose a structure that fits the audience situation:

| Structure | Use when | Watch out for |
| --- | --- | --- |
| Task-first index | Visitors arrive with an urgent, specific need | Losing the brand voice. Express it through language and order rather than effects. |
| Procession | A single story told in sequence works best, as for a launch or a manifesto | Visitors who want to skip. Provide direct navigation and anchors. |
| Index plus deep pages | Portfolios, seasons, collections | A generic grid. The index itself should express the concept. |
| Chapters | Complex products, exhibitions | Chapter fatigue. Vary the density and rhythm. |
| Hub and tools | Configurators, calculators, finders | The tool works but the story is missing. Wrap the tool in context. |

**Protect the middle.** A striking opening followed by generic feature cards, vague claims and an unrelated footer fails the brief. For every section after the opening, write its purpose, the specific information it carries, its emotional role and how it advances the concept. If a section could be dropped into any company's site, rewrite it.

**Resolution.** Design the ending: the last interaction, the call to action, the footer and what visitors carry away. The close should resolve the emotional trajectory, not just stop.

**Direct access.** Give visitors who already know what they need a path in one or two actions: persistent navigation, a skip link past cinematic sections and deep links to each section.

## Trade-off conversations and challenging requests

Present options in this format: **option → what you get → what it costs → what it risks → recommendation.**

When a request undermines the client's own goals, respond with the cost and a **stronger alternative**, then respect the decision:

| Request | Cost to the client's goals | Stronger alternative |
| --- | --- | --- |
| "Add a 6-second intro loader" | Delays content for everyone, and returning visitors suffer most | A real-readiness loader only while the 3D scene loads, with the content readable during the wait. Or a first-visit-only title moment that can be skipped. |
| "Make it scroll-jacked like that award site" | Breaks keyboard, anchors and trackpad expectations, and raises motion sickness risk | Native scroll with scroll-linked choreography and a sticky chapter that has an escape link |
| "Copy [famous site]" | Legal and reputational risk. Visitors who know the reference read it as derivative. | Extract the principle that attracted them and express it through their own truth |
| "Autoplay music" | Startles visitors, gets muted at once, and fails WCAG 1.4.2 if it plays more than 3 s without a control | An opt-in sound layer with a clear toggle, for a moment where sound adds meaning |
| "Particles and a 3D globe everywhere" | Budget, battery, load time, and loss of focus | One signature interaction done properly, with the rest of the site quiet so that it lands |
| "Fake some testimonials for now" | Fabrication. It is legal risk and destroys trust. | Clearly labelled placeholder slots, plus a plan to collect real, consented quotes |

## Checkpoint 1 package

Present:
1. The concept thesis and brand-truth evidence
2. The selected territory, with a one-line note on why the others were not chosen
3. The narrative outline from opening to resolution
4. The signature interaction described, plus what will be prototyped first and why
5. The concept-to-execution map (top 6–10 rows)
6. Key risks, asset dependencies and a rough budget or schedule effect
7. The **decisions needed**: usually 2–4 crisp questions

Ask for approval of the direction, not of details that belong to later checkpoints.
