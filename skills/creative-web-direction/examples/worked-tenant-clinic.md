# Worked example: where restraint wins

> **Fictional and illustrative.** "Tidewater Tenants' Clinic" is invented, and so are all its facts. The numbers are planning targets set for this brief, not measurements. Use this example to calibrate specificity and judgment, not as a layout to reuse.

## The request

> "We're a small nonprofit that helps renters facing eviction. Our site is an old template and nobody can find anything. We'd love something that feels modern and powerful — maybe like those award sites with animations? Budget is about $9,000, we want to launch in five weeks, and a volunteer keeps our WordPress running."

## What the skill inferred before asking

- Supplied analytics summary: 81% of visits are on phones, and the top entry pages are "Eviction notice" and "Repairs".
- Supplied flyers show that the clinic runs a Tuesday help desk at the county courthouse and a phone line on weekdays from 9:00 to 17:00. Services are offered in English, Spanish and Vietnamese.
- WordPress is the existing stack, with a volunteer maintainer. That is a strong signal against a bespoke JavaScript application.

## Questions asked (four, prioritised)

1. *When someone lands on the site in a panic, what's the one thing you most want them to do in the first minute: call, come to the Tuesday desk, or read their rights?* (Why it matters: this decides the opening and the conversion logic.)
2. *Which papers do people most often bring you?* (Why: the answer may become the site's whole structure.)
3. *Can a staff lawyer review the legal explanations before launch, and how often do the rules change?* (Why: the content is the product, and legal accuracy is a release dependency.)
4. *Will your volunteer edit pages, or only fix things when they break?* (Why: this decides how much custom design the site can sustain.)

Answers, summarised: call first, or come on Tuesday if the court date is close. The common papers are a pay-or-quit notice, a no-cause termination notice, a court summons and a landlord's repair refusal. A lawyer reviews twice a year. The volunteer edits text, not code.

## The skill's challenge to the request

The client asked for "award-site animations". The skill recommended against expressive motion and explained why:
> "Most of your visitors are on a phone, stressed, and possibly on a limited data plan. Every second of animation or loading stands between them and the phone number. I'd put the ambition into the structure and the voice instead. What makes you different is that you know exactly which piece of paper is in their hand. Let's build the site around that. It will feel more powerful than any effect because it will feel like it understands them."

## Site Soul Brief (abridged)

| Element | Answer |
| --- | --- |
| Core proposition | Help a renter holding a confusing notice understand what it means today, and get to the right help before the deadline |
| Concept thesis | Because people arrive holding a specific piece of paper, the site is organised around those papers: find yours, learn what it means, and know your next step and its deadline |
| Brand truth | The clinic has staffed the courthouse Tuesday desk since 2016 *(client interview)*. Its four most common papers are known *(client list)*. It operates in three languages *(flyers)*. |
| Emotional trajectory | Entry: "someone recognises my situation". Exploration: calm, with each sentence lowering the panic. Resolution: "I know what to do and by when". |
| Narrative structure | 1. "What paper do you have?" (a visual index of four papers plus "something else"). 2. Paper page: what it is, what it means for you, what to do now, and when. 3. Get help: call, Tuesday desk or form. 4. Know your rights (deeper guides). 5. About and volunteer. |
| Visual grammar | Type: a high-legibility humanist sans with full Vietnamese diacritics. Candidates are Be Vietnam Pro and Noto Sans, and coverage must be verified for the exact weights. Layout: single column on phones, with a two-column paper index on wide screens. Image: simplified, labelled line illustrations of each paper's *shape* (heading, deadline box, signature area), never photos of real notices. Colour: warm paper white, ink near-black, one signal colour for deadlines, AA contrast throughout. Space: generous, but never more than one screen before an action. |
| Motion grammar | Calm, immediate, unambiguous. State changes under ~200 ms. No scroll effects, no entrance choreography and no parallax. |
| Signature interaction | "Match your paper": the visitor picks the paper that looks like theirs (a visual index with plain-language labels). On the paper's page, a deadline explainer asks for the date printed on the notice and shows the counting rule in words, reviewed by the clinic lawyer, plus "Call us before [day]". It is a standard form with real buttons and works without JS (server-rendered result). |
| Conversion logic | The phone number and Tuesday desk appear on every paper page above the fold, plus a sticky "Call" button on phones. A "Something else?" option leads straight to the help form. |
| Constraints and exclusions | Protect: legal accuracy, the three languages and low data use. Does not belong: stock photos of sad families, countdown animations, chatbots, cookie-heavy analytics. |

## Territories considered

| | A. Paper in hand (recommended) | B. Neighbours | C. Calm map |
| --- | --- | --- | --- |
| Thesis | Organise everything around the paper the visitor is holding | Community voices: tenants who won tell you it's possible | A visual step-by-step journey of an eviction case |
| Signature interaction | Match your paper, plus the deadline explainer | Portrait and story carousel | Interactive timeline of case stages |
| Audience fit | Strongest for the panicked first visit | Strong emotionally, but slower to reach help | Good for orientation, weaker for "what do I do today" |
| Asset needs | Four simplified paper illustrations and reviewed copy | Consented portraits and stories (not available yet) | Timeline illustration and legal review |
| Feasibility | High within budget and timeline | Blocked on consent and photography | Medium |
| Principal trade-off | Less emotionally showy | Depends on assets that don't exist | Generic unless deeply localised |

## Concept-to-execution map (top rows)

| Design choice | Link to thesis | Visitor benefit | Validation method | Status |
| --- | --- | --- | --- | --- |
| Paper index as the home page's first content | The paper is the organising object | Reach the relevant guidance in one tap | Five-person hallway test: find "court summons" guidance in under 20 s on a phone | Proposed |
| Deadline explainer as a plain form | The deadline is what the paper is really about | Know "by when" without a lawyer | Lawyer review of all copy. Works with JS off. | Proposed |
| Language switch that persists per paper page | Three-language service | Same paper, own language | Spanish and Vietnamese speakers review the translations | Proposed |
| No motion beyond state feedback | Calm and immediate | Nothing delays help, and nothing triggers anxiety | Reduced motion is not even needed as a separate mode | Proposed |
| Print and "save my summary" view | The visitor brings the paper to the Tuesday desk | Bring a clear summary to the clinic | Print preview check on a phone and on desktop | Proposed |

## Engineering decision

The default React, Vite, TypeScript and Tailwind stack was **not** used. The skill recommended a WordPress block theme with three custom blocks (paper index, paper page header, deadline explainer), so the volunteer can edit text and the clinic can update legal content without a developer. This was recorded as D-02 in the decision log and approved by the director.

Budgets for this project (the audience is on phones with limited data):

| Budget | Target | Rationale |
| --- | --- | --- |
| Critical-route transfer | ≤ 250 KB compressed | Low-data plans. Text-first pages. |
| Initial JS | ≤ 30 KB compressed | Only the language switch and print helper. The explainer works server-side. |
| Fonts | 2 files, ≤ 90 KB total, subsets for three languages | Vietnamese diacritics need the extended subset |
| LCP | ≤ 2.5 s at p75 on mobile once field data exists. Lab target ≤ 2.0 s on a mid-range Android profile. | The LCP element is text, so this is achievable |

## Interchangeability test

Remove the name and logo, and the site still could not be anyone else's. It is organised around this county's four notices, the Tuesday courthouse desk, these three languages and this lawyer-reviewed counting rule. The *structure* is the brand.

## What a weak output would have done

A dark hero with a giant "Fighting for Housing Justice" headline, a particle background, scroll-reveal cards ("Advocacy", "Education", "Community") and a contact form at the bottom. It would look contemporary and fail every visitor holding a notice.

## Highest-risk item, tackled first

Not a visual effect. The risk is the **legal accuracy of the deadline explainer**. The first prototype was the explainer copy and its counting-rule wording, put in front of the clinic lawyer in week one, before any visual design.
