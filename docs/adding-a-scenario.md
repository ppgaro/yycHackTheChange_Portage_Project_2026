# Adding a Scenario to Portage

Portage is built on a shared, domain-driven scenario engine. Every transition track—whether energy analytics, hospitality business intelligence, product management, or user research—runs on the exact same contracts and state machine.

Follow this guide to author and register a new career-transition pathway.

---

## 1. File Structure

All scenarios live in [`src/data/scenarios/`](file:///projects/yychackthechange2026/yychackthechange2026/src/data/scenarios/):

```
src/data/scenarios/
├── rigtorack.ts         # Flagship track (observed real AESO telemetry)
├── hospitality-bi.ts    # Service/hospitality to business intelligence
├── retail-pm.ts         # Retail shift management to product management
├── admin-uxr.ts         # Administrative assistant to UX research
├── index.ts             # Exported registry of all active scenarios
└── scenarios.test.ts    # Automated contract test suite
```

---

## 2. Step-by-Step Implementation

### Step 1: Duplicate a Reference Scenario
To get started quickly, duplicate an existing preset like `hospitality-bi.ts`:
```bash
cp src/data/scenarios/hospitality-bi.ts src/data/scenarios/my-scenario.ts
```

### Step 2: Define Scenario Metadata & Initial Mappings
Provide the origin role, target role, summary, and default frontline duties:
```typescript
import { Scenario } from '../../types/domain';

export const MY_SCENARIO: Scenario = {
  id: 'my-scenario-id',
  name: 'My Scenario Name',
  badge: 'Track Badge',
  from: 'Origin Job Title',
  to: 'Target Job Title',
  summary: 'A clear, honest summary of what this transition covers.',
  defaultDuties: [
    'First concrete day-to-day task...',
    'Second concrete day-to-day task...',
  ],
  mappings: [
    {
      id: 'map-1',
      sourceDuty: 'First concrete day-to-day task...',
      transferableSkill: 'Identified Transferable Skill',
      whyItTransfers: 'Clear explanation of why this skill applies in the new field.',
      status: 'suggested',
    },
  ],
  // ...
};
```

### Step 3: Define Ranked Skill Gaps
Define the skills required by the target role:
- `relevance`: `1 | 2 | 3` (relevance weighting for the target role)
- `prerequisiteFor`: IDs of other gaps unlocked by this skill
- `supportedByMappingIds`: IDs of incoming frontline mappings that provide foundation
- `challengeId`: ID of the practical challenge that tests this gap
- `whyItMatters` & `whyThisTask`: Explainable rationale presented to the user

```typescript
gaps: [
  {
    id: 'gap-1',
    name: 'Operational Data Interpretation',
    description: 'Reading tabular operational reports and communicating findings.',
    relevance: 3,
    prerequisiteFor: ['gap-2'],
    supportedByMappingIds: ['map-1'],
    challengeId: 'challenge-1',
    whyItMatters: 'Target employers require immediate literacy with shift logs and metrics.',
    whyThisTask: 'Tests your ability to quote precise data points and maintain an objective tone.',
  },
]
```

### Step 4: Author the Practice Challenge & Criteria
A challenge must have:
- Exactly 4 criteria (`Criterion`)
- Form fields (`Field[]`) using generic types: `'number'`, `'choice'`, `'classify'`, or `'text'`
- At least one variant (`ChallengeVariant`) with a `table`, `source`, and authored `samples` (baseline & revision)
- Exactly 4 targeted micro-lessons (`MicroLesson`) keyed by criterion ID

```typescript
challenges: [
  {
    id: 'challenge-1',
    gapId: 'gap-1',
    title: 'Operational Analysis Brief',
    roleContext: 'Operational Analyst · Shift Diagnostic',
    prompt: 'Analyze the variance report below and prepare a 3-bullet briefing.',
    estimatedMinutes: 15,
    fields: [
      { kind: 'number', id: 'totalVariance', label: 'Total Variance', unit: 'units' },
      { kind: 'text', id: 'text', label: 'Briefing Note', rows: 6 },
    ],
    variants: [ ... ],
    criteria: [ ... ], // Exactly 4 criteria
    lessons: { ... },  // Exactly 4 lessons matching criteria IDs
  },
]
```

---

## 3. Register the Scenario

Add the new scenario to [`src/data/scenarios/index.ts`](file:///projects/yychackthechange2026/yychackthechange2026/src/data/scenarios/index.ts):

```typescript
import { MY_SCENARIO } from './my-scenario';

export const SCENARIOS: readonly Scenario[] = [
  RIGTORACK_SCENARIO,
  HOSPITALITY_BI_SCENARIO,
  RETAIL_PM_SCENARIO,
  ADMIN_UXR_SCENARIO,
  MY_SCENARIO,
];
```

---

## 4. Automatic Validation & Testing

Every registered scenario is automatically tested by [`src/data/scenarios/scenarios.test.ts`](file:///projects/yychackthechange2026/yychackthechange2026/src/data/scenarios/scenarios.test.ts):

```bash
npx vitest run src/data/scenarios/scenarios.test.ts
```

The test runner automatically verifies:
1. Structural integrity against the `Scenario` domain specification (via `validateScenario`).
2. That every variant's baseline sample scores strictly less than 4/4.
3. That every variant's revision sample scores 4/4 and passes.
4. That micro-lessons exist for all 4 criteria.

---

## 5. Adding Real Telemetry Data (Optional)

If your scenario uses real-world data (like RigToRack uses AESO data):
1. Place raw, immutable source files in `src/data/sources/<source-name>/raw/`.
2. Write a dedicated CSV or JSON parser in `src/data/sources/<source-name>/parse.ts`.
3. Never hand-code numeric figures into scenario files—derive all numbers dynamically from parsed tables.
4. Set `source.kind: 'observed'` and supply complete provenance metadata (`publisher`, `url`, `period`, `timeBasis`, `units`, `retrievedAt`, `limitations`).
