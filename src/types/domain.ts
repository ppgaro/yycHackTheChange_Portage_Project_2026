export type MappingStatus = 'suggested' | 'accepted' | 'edited' | 'rejected';

export interface DutyMapping {
  id: string;
  sourceDuty: string;           // what the user said they did
  transferableSkill: string;    // inferred skill
  whyItTransfers: string;       // explanation
  reference?: { label: string; url: string };  // only with a real source URL
  status: MappingStatus;
  userEditedSkill?: string;     // set when status === 'edited'
}

export interface SkillGap {
  id: string;
  name: string;
  description: string;
  relevance: 1 | 2 | 3;               // authored relevance to the target role
  prerequisiteFor: string[];          // gap ids this unlocks
  supportedByMappingIds: string[];    // mappings that make it reachable
  challengeId?: string;               // a practice task exists
  whyItMatters: string;
  whyThisTask?: string;               // required when challengeId is set
}

export type DataKind = 'observed' | 'fictional';

export interface DataSource {
  kind: DataKind;
  name: string;
  publisher?: string;
  url?: string;
  retrievedAt?: string;
  period?: string;
  timeBasis?: string;
  units?: string[];
  limitations: string;
}

export interface DataTable {
  caption: string;
  columns: { key: string; label: string; unit?: string }[];
  rows: Record<string, string | number>[];
}

export interface Statement {
  id: string;
  text: string;
  shownByData: boolean;
}

export type Field =
  | { kind: 'text'; id: 'text'; label: string; rows: number }
  | { kind: 'number'; id: string; label: string; unit: string }
  | { kind: 'choice'; id: string; label: string; options: { id: string; label: string }[] }
  | { kind: 'classify'; id: 'statements'; label: string };

export interface LearnerResponse {
  text: string;
  inputs: Record<string, string>;
}

export type Rule =
  | { kind: 'textAll'; patterns: string[] }     // every regex source must match (case-insensitive)
  | { kind: 'textAny'; patterns: string[] }     // at least one
  | { kind: 'textNone'; patterns: string[] }    // none may match
  | { kind: 'minWords'; min: number }
  | { kind: 'numberMatchesFact'; input: string; fact: string; tolerance: number }
  | { kind: 'choiceEquals'; input: string; expected: string }
  | { kind: 'statementsClassified' }
  | { kind: 'textMatchesFact'; fact: string };  // the fact value is a regex source string

export interface Criterion {
  id: string;
  title: string;
  description: string;
  rules: Rule[];
  passFeedback: string;
  failFeedback: string;
}

export interface MicroLesson {
  title: string;
  keyRule: string;
  instead: string;
  tryThis: string;
  tip: string;
  readTime: string;
}

export interface ChallengeVariant {
  id: string;
  label: string;                       // e.g. "Cold snap · 13 Jan 2024, HE15–HE20"
  assumptions: string;                 // "Scenario assumptions" text
  table: DataTable;
  source: DataSource;
  facts: Record<string, number | string>;
  statements?: Statement[];
  samples: { baseline: LearnerResponse; revision: LearnerResponse };
}

export interface Challenge {
  id: string;
  gapId: string;
  title: string;
  roleContext: string;
  prompt: string;
  estimatedMinutes: number;
  fields: Field[];
  variants: ChallengeVariant[];        // >= 1
  criteria: Criterion[];               // exactly 4
  lessons: Record<string, MicroLesson>; // keyed by criterion id
}

export interface Scenario {
  id: string;
  badge: string;
  featured: boolean;
  from: string;
  to: string;
  summary: string;                     // one sentence for the landing card
  defaultDuties: string[];
  mappings: DutyMapping[];             // all status 'suggested'
  gaps: SkillGap[];
  challenges: Challenge[];
  nextSteps?: { title: string; items: string[] }[];  // optional "keep going" content
}

export interface CriterionResult {
  criterionId: string;
  passed: boolean;
  feedback: string;
  notes: string[];
  evidence?: string;
}

export interface AssessmentResult {
  passed: boolean;
  score: number;
  maxScore: number;
  criteria: CriterionResult[];
}

export interface Attempt {
  attemptNumber: number;
  variantId: string;
  response: LearnerResponse;
  result: AssessmentResult;
  timestamp: string;
}

export type CriterionChange = 'gained' | 'kept' | 'lost' | 'still-missing';
