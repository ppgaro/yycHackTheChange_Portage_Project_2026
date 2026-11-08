# Portage — Your experience counts.

> **"People changing careers shouldn't have to start from zero."**  
> Portage finds the skills you already have, tests them on realistic job tasks, and points to the one gap worth closing next. Built for Hack the Change 2026 in Calgary.
>
> **Live Demo:** [https://portage.wiki/](https://portage.wiki/) ([https://portage-yychack2026.vercel.app/](https://portage-yychack2026.vercel.app/))  
> **Video Walkthrough:** [https://vimeo.com/1244891652](https://vimeo.com/1244891652)  
> **Code Repository:** [https://github.com/ppgaro/yycHackTheChange_Portage_Project_2026](https://github.com/ppgaro/yycHackTheChange_Portage_Project_2026)

---

## Try It

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run unit and domain test suite (58 tests)
npx vitest run

# Typecheck and build production bundle
npm run build

# Preview production build locally
npx vite preview

# Run full end-to-end browser test suite (Playwright desktop & mobile)
npx playwright test
```

---

## How It Works

Portage connects prior frontline work to a target career through a continuous, inspectable practice loop:

1. **Experience Intake:** You enter your day-to-day duties in plain language or load an authentic transition scenario.
2. **Transferable Skills Discovery:** A deterministic lexicon translates daily tasks into target-role capabilities. You review, edit, or reject suggestions—Portage never makes assumptions on your behalf.
3. **Targeted Gap Prioritization:** Portage ranks the skill gaps between your confirmed skills and your target role using published criteria (relevance, prerequisite unlock, and confirmed foundation).
4. **Authentic Practice Task:** You complete a diagnostic job task using real tabular data (including real Alberta electricity grid telemetry).
5. **Targeted Feedback & Microlearning:** A published 4-criterion rubric evaluates your work instantly. Targeted bite-sized lessons appear *only* for criteria you have not yet met.
6. **Improvement & Comparison:** You revise your submission. Portage shows a side-by-side diff comparing your initial attempt to your revision.
7. **Portable Evidence Record:** You export an inspectable proof-of-work record in JSON or Markdown, complete with data provenance, attempt progression, and explicit limitations.

---

## One Engine, Many Careers

Portage is not a hardcoded one-off demo. A single declarative rule engine and pure state machine drives four diverse career pathways:

| Scenario | From Role | To Target Role | Data Kind | Practice Task Focus |
| :--- | :--- | :--- | :--- | :--- |
| **RigToRack (Flagship)** | Facilities / Industrial Shift Supervisor | Energy & Grid Operations Analyst | **Observed Real AESO Telemetry** | Winter 2024 cold-snap pool-price dispatch brief |
| **Hospitality → BI** | Food & Beverage Shift Lead | Junior Business Intelligence Analyst | Fictional Demonstration Data | Weekly station labor and prep-waste variance brief |
| **Retail → PM** | Retail Store Shift Manager | Associate Product Manager | Fictional Demonstration Data | E-commerce checkout funnel drop-off analysis |
| **Admin → UXR** | Administrative & Executive Assistant | Junior UX Researcher | Fictional Demonstration Data | Usability testing synthesis and observation logging |

To add another career pathway, see [docs/adding-a-scenario.md](file:///projects/yychackthechange2026/yychackthechange2026/docs/adding-a-scenario.md).

---

## RigToRack & Real Alberta Electricity Data

Portage's flagship track, **RigToRack**, helps Alberta energy, industrial, and facilities workers transition into clean energy and grid analytics. It uses real historical hourly pool-price and system telemetry published by the Alberta Electric System Operator (AESO).

- **Data Sources:**
  - `src/data/sources/aeso/raw/2024-01-pool-price.csv`: Real 744-hour snapshot including the historic January 13, 2024 cold snap (HE15–HE20), where pool prices hit the \$999.99/MWh market price cap for four consecutive hours during an Alberta grid alert.
  - `src/data/sources/aeso/raw/2024-05-pool-price.csv`: Real 744-hour snapshot from May 17, 2024 (HE10–HE15) demonstrating mild spring solar renewal, where pool prices settled down to \$0.00/MWh for two consecutive hours.
- **Provenance-Safe Parsing:** App code contains zero hand-typed AESO telemetry numbers. All statistics (peak price, peak demand hour, duration at price cap, average window price) are dynamically calculated by `src/data/sources/aeso/parse.ts` from raw CSV lines. Enforced by automated test suite assertions.
- **Data Refresh Script:** Run `bash src/data/sources/aeso/scripts/download-historical-pool-price.sh` to retrieve fresh public snapshots directly from AESO.

---

## Architecture

| Path | Purpose |
| :--- | :--- |
| [`src/types/domain.ts`](file:///projects/yychackthechange2026/yychackthechange2026/src/types/domain.ts) | Pure domain contracts: `Scenario`, `Challenge`, `Rule`, `AssessmentResult`, `EvidenceRecord` |
| [`src/engine/scenario.ts`](file:///projects/yychackthechange2026/yychackthechange2026/src/engine/scenario.ts) | Strict schema validation ensuring every scenario is structurally and mathematically sound |
| [`src/engine/assessment.ts`](file:///projects/yychackthechange2026/yychackthechange2026/src/engine/assessment.ts) | Pure deterministic 0ms evaluation engine; executes published rules without network calls |
| [`src/engine/microlearning.ts`](file:///projects/yychackthechange2026/yychackthechange2026/src/engine/microlearning.ts) | Targeted rule-to-lesson dispatch; only serves lessons for unmet criteria |
| [`src/engine/gaps.ts`](file:///projects/yychackthechange2026/yychackthechange2026/src/engine/gaps.ts) | Deterministic, explainable skill-gap ranking (`relevance × 3 + prerequisites × 2 + confirmed`) |
| [`src/engine/experience.ts`](file:///projects/yychackthechange2026/yychackthechange2026/src/engine/experience.ts) | Frontline duty lexicon mapping and human-in-the-loop editing functions |
| [`src/engine/evidence.ts`](file:///projects/yychackthechange2026/yychackthechange2026/src/engine/evidence.ts) | Generates structured evidence records and Markdown proof documents with provenance |
| [`src/state/portage.ts`](file:///projects/yychackthechange2026/yychackthechange2026/src/state/portage.ts) | Pure React reducer governing the end-to-end Portage state machine |
| [`src/data/scenarios/`](file:///projects/yychackthechange2026/yychackthechange2026/src/data/scenarios/) | Declarative scenario content files (`rigtorack.ts`, `hospitality-bi.ts`, etc.) |
| [`src/components/`](file:///projects/yychackthechange2026/yychackthechange2026/src/components/) | Accessible, theme-tokenized React UI components (Navbar, Stepper, Welcome, Intake, Practice, Evidence) |

---

## What Portage Does Not Claim

Portage is built on radical honesty and transparent standards:

> **Notice:** An inspectable record of practice and improvement, not an employer-verified credential or professional certification.

- **Assessment Limits:** Scored by fixed, published rules on one bounded practice task. Free-text checks look for required elements and phrases; they do not understand meaning the way a person does.
- **No Certification or Job Guarantees:** Portage documents what you practiced and how you improved. It never guarantees hiring outcomes, never assigns unearned certifications, and never guesses an employer's hiring decision.
- **No National Occupational Classification (NOC) Equivalence:** Portage suggestions reflect observable skill transfer, not regulatory licensing or professional trade equivalence.

---

## Built With

- **React 19** (MIT License) & **TypeScript** (Apache-2.0 License)
- **Vite** (MIT License) & **Tailwind CSS v4** (MIT License)
- **lucide-react** (ISC License)
- **Vitest** (MIT License) & **Playwright** (Apache-2.0 License)
- **Alberta Electric System Operator (AESO) Data:** Public market reports used in accordance with AESO terms of use.

---

## AI & Privacy Disclosure

- **Zero AI at Runtime:** Portage scoring, gap prioritization, and skill suggestion run 100% locally inside your web browser using pure, auditable deterministic logic. No LLMs are called during user interaction.
- **Privacy First:** No user-typed duties (`dutiesInput`), custom role titles, or written practice responses (`ChallengeFields`) ever leave your device. Anonymous, non-PII step funnel events (GA4 with Google Signals and ad personalization disabled) record high-level scenario progression only.

---

## Team

- **Renato Pires** — [www.raydev.ca](https://www.raydev.ca)
- **Priscila Garo** — [www.garo.pro](https://www.garo.pro)

*Built for Hack the Change 2026 in Calgary, Alberta.*
