# Accessibility & Privacy Ledger — Portage

Portage was engineered from day one to be inclusive, accessible, and radically respectful of user privacy.

---

## 1. Accessibility Features & Standards Compliance

### WCAG 2.1 AA Standards Adherence
- **Color Contrast & Theme Tokens:** All text, badges, and interface borders meet or exceed WCAG 2.1 AA 4.5:1 contrast ratios:
  - Background: Off-white canvas `#FAFAF7` (`--color-paper`)
  - Primary Typography: Deep navy `#062943` (`--color-navy`)
  - Subdued Typography: Slate ink `#526574` (`--color-slate-ink`)
  - Interactive Accents: River ink `#12708C` (`--color-river-ink`)
  - Attention Accents: Ember ink `#C2571A` (`--color-ember-ink`)
- **Semantic Structure & Landmarks:**
  - Standard landmarks used throughout: `<header>`, `<nav>`, `<main id="main">`, `<section>`, `<footer>`.
  - Step progress indicators use `<nav aria-label="Progress"><ol role="list">` with `aria-current="step"`.
  - Accessible tables use `<caption text-left>`, `<th scope="col">`, and tabular numerical data.
- **Form Controls & Labels:**
  - Every form input has an explicitly associated `<label htmlFor="...">`.
  - Radio button groups are organized under semantic `<fieldset><legend>` structures.
  - Icon-only and action buttons have descriptive `aria-label` tags referencing the specific item (e.g., `aria-label="Edit Resource allocation & scheduling"`).
- **Dynamic Content & Assistive Technology:**
  - Diagnostic test results render inside `<section aria-live="polite">` so screen readers announce score updates upon submission.
  - State machine step transitions move focus directly to `<main h1>` (`tabIndex={-1}`) so assistive tech immediately announces new screens.
  - Top-level keyboard skip link (`<a href="#main">Skip to content</a>`) allows instant jump past navigation headers.
- **Reduced Motion Support:**
  - Global CSS automatically disables all animations, transitions, and smooth scrolling when the operating system requests reduced motion:
    ```css
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after {
        animation: none !important;
        transition: none !important;
        scroll-behavior: auto !important;
      }
    }
    ```
- **Automated End-to-End Verification:**
  - Validated by Playwright e2e tests (`e2e/portage.spec.ts`) asserting full keyboard navigation, skip-link focus, and mobile responsiveness at 375px without horizontal overflow.

---

## 2. Privacy & Data Sovereignty

- **100% In-Browser Scoring & Input Processing:** Portage executes all skill mapping, gap ranking, and practice evaluation entirely within client-side memory. No user-typed duties (`dutiesInput`), custom role titles (`currentRole`), or written practice answers (`ChallengeFields`) ever leave the browser.
- **Privacy-Safe Funnel Telemetry:** High-level anonymous step transitions (`step_view`, `scenario_selected`, `skills_mapped` count, `practice_submitted` score, `evidence_exported` format) are reported via `src/analytics/ga4.ts` with Google Signals, ad storage, and ad personalization explicitly disabled (`ad_storage: 'denied'`, `allow_google_signals: false`). An automated unit and e2e test guard (`src/analytics/ga4.test.ts`) enforces that free-text user fields are stripped before any event is emitted.
- **No Persistent Local Storage of User Work:** Portage does not store user duties or practice briefs in `localStorage` or `IndexedDB`. All session state exists in memory within the React reducer.
- **Instant Session Wiping:** Clicking `Reset demo` or `Clear session` immediately wipes state and returns the application to its initial welcome view. Refreshing the browser tab accomplishes the exact same reset.
- **Safe Practice Space:** Frontline workers exploring career transitions can test skills with complete psychological safety, knowing their employers or external parties cannot view their written inputs.

