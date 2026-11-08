import {
  DutyMapping,
  MappingStatus,
  LearnerResponse,
  Attempt,
  Scenario,
  Challenge,
  ChallengeVariant,
} from '../types/domain';
import { SCENARIOS, getScenario, rigtorack } from '../data/scenarios';
import { suggestMappingsFromDuties, setMappingStatus } from '../engine/experience';
import { prioritizeGaps, RankedGap } from '../engine/gaps';
import { assess } from '../engine/assessment';

export type Step = 'welcome' | 'intake' | 'skills' | 'next' | 'practice' | 'evidence';
export const STEPS: Step[] = ['welcome', 'intake', 'skills', 'next', 'practice', 'evidence'];
export const STEP_LABELS: Record<Step, string> = {
  welcome: 'Welcome',
  intake: 'Your experience',
  skills: 'Your skills',
  next: 'Next skill',
  practice: 'Practice',
  evidence: 'Evidence',
};

export interface PortageState {
  step: Step;
  scenarioId: string;
  currentRole: string;
  targetRole: string;
  dutiesInput: string;
  mappings: DutyMapping[];
  variantId: string;
  response: LearnerResponse;
  attempts: Attempt[];
}

export type PortageAction =
  | { type: 'START_SCENARIO'; scenarioId: string }
  | { type: 'START_BLANK' }
  | { type: 'SET_FIELD'; field: 'currentRole' | 'targetRole' | 'dutiesInput'; value: string }
  | { type: 'ANALYZE' }
  | { type: 'SET_MAPPING_STATUS'; id: string; status: MappingStatus; editedSkill?: string }
  | { type: 'ACCEPT_ALL_SUGGESTED' }
  | { type: 'GO_TO'; step: Step }
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'SELECT_VARIANT'; variantId: string }
  | { type: 'SET_TEXT'; text: string }
  | { type: 'SET_INPUT'; id: string; value: string }
  | { type: 'LOAD_SAMPLE'; which: 'baseline' | 'revision' }
  | { type: 'SUBMIT_ATTEMPT'; timestamp: string }
  | { type: 'RESET' };

export function createInitialState(): PortageState {
  return {
    step: 'welcome',
    scenarioId: rigtorack.id,
    currentRole: rigtorack.from,
    targetRole: rigtorack.to,
    dutiesInput: rigtorack.defaultDuties.join('\n'),
    mappings: structuredClone(rigtorack.mappings),
    variantId: rigtorack.challenges[0].variants[0].id,
    response: { text: '', inputs: {} },
    attempts: [],
  };
}

export function getScenarioOf(s: PortageState): Scenario {
  return getScenario(s.scenarioId) ?? rigtorack;
}

export function getGapRanking(s: PortageState): {
  ranked: RankedGap[];
  recommended: RankedGap | null;
} {
  const sc = getScenarioOf(s);
  const demonstratedGapIds: string[] = [];

  for (const gap of sc.gaps) {
    if (gap.challengeId) {
      const ch = sc.challenges.find((c) => c.id === gap.challengeId);
      if (ch) {
        const hasPassed = s.attempts.some(
          (att) => att.result.passed && ch.variants.some((v) => v.id === att.variantId)
        );
        if (hasPassed) {
          demonstratedGapIds.push(gap.id);
        }
      }
    }
  }

  return prioritizeGaps(sc, s.mappings, demonstratedGapIds);
}

export function getActiveChallenge(s: PortageState): Challenge {
  const ranking = getGapRanking(s);
  const sc = getScenarioOf(s);

  if (ranking.recommended && ranking.recommended.gap.challengeId) {
    const ch = sc.challenges.find((c) => c.id === ranking.recommended!.gap.challengeId);
    if (ch) return ch;
  }

  const firstWithChallenge = sc.gaps.find((g) => g.challengeId);
  if (firstWithChallenge && firstWithChallenge.challengeId) {
    const ch = sc.challenges.find((c) => c.id === firstWithChallenge.challengeId);
    if (ch) return ch;
  }

  return sc.challenges[0];
}

export function getActiveVariant(s: PortageState): ChallengeVariant {
  const ch = getActiveChallenge(s);
  const v = ch.variants.find((item) => item.id === s.variantId);
  return v ?? ch.variants[0];
}

export function getLatestAttempt(s: PortageState): Attempt | null {
  return s.attempts.length > 0 ? s.attempts[s.attempts.length - 1] : null;
}

export function isPracticeComplete(s: PortageState): boolean {
  const latest = getLatestAttempt(s);
  return latest !== null && latest.result.passed;
}

export function portageReducer(s: PortageState, a: PortageAction): PortageState {
  switch (a.type) {
    case 'START_SCENARIO': {
      const sc = getScenario(a.scenarioId);
      if (!sc) return s;
      return {
        ...s,
        scenarioId: sc.id,
        step: 'intake',
        currentRole: sc.from,
        targetRole: sc.to,
        dutiesInput: sc.defaultDuties.join('\n'),
        mappings: structuredClone(sc.mappings),
        variantId: sc.challenges[0]?.variants[0]?.id ?? '',
        response: { text: '', inputs: {} },
        attempts: [],
      };
    }

    case 'START_BLANK': {
      const sc = getScenarioOf(s);
      return {
        ...s,
        step: 'intake',
        currentRole: '',
        targetRole: '',
        dutiesInput: '',
        mappings: [],
        variantId: sc.challenges[0]?.variants[0]?.id ?? '',
        response: { text: '', inputs: {} },
        attempts: [],
      };
    }

    case 'SET_FIELD': {
      return {
        ...s,
        [a.field]: a.value,
      };
    }

    case 'ANALYZE': {
      const sc = getScenarioOf(s);
      const isDefault =
        s.dutiesInput.trim() === sc.defaultDuties.join('\n').trim();
      const mappings = isDefault
        ? structuredClone(sc.mappings)
        : suggestMappingsFromDuties(s.dutiesInput.split('\n'), s.targetRole);

      return {
        ...s,
        step: 'skills',
        mappings,
      };
    }

    case 'SET_MAPPING_STATUS': {
      return {
        ...s,
        mappings: setMappingStatus(s.mappings, a.id, a.status, a.editedSkill),
      };
    }

    case 'ACCEPT_ALL_SUGGESTED': {
      return {
        ...s,
        mappings: s.mappings.map((m) =>
          m.status === 'suggested' ? { ...m, status: 'accepted' } : m
        ),
      };
    }

    case 'GO_TO': {
      if (STEPS.includes(a.step)) {
        return { ...s, step: a.step };
      }
      return s;
    }

    case 'NEXT': {
      if (s.step === 'intake') {
        return portageReducer(s, { type: 'ANALYZE' });
      }
      const currIdx = STEPS.indexOf(s.step);
      const nextIdx = Math.min(STEPS.length - 1, currIdx + 1);
      return { ...s, step: STEPS[nextIdx] };
    }

    case 'BACK': {
      const currIdx = STEPS.indexOf(s.step);
      const prevIdx = Math.max(0, currIdx - 1);
      return { ...s, step: STEPS[prevIdx] };
    }

    case 'SELECT_VARIANT': {
      const sc = getScenarioOf(s);
      const exists = sc.challenges.some((c) =>
        c.variants.some((v) => v.id === a.variantId)
      );
      if (!exists) return s;
      return {
        ...s,
        variantId: a.variantId,
        response: { text: '', inputs: {} },
        attempts: [],
      };
    }

    case 'SET_TEXT': {
      return {
        ...s,
        response: {
          ...s.response,
          text: a.text,
        },
      };
    }

    case 'SET_INPUT': {
      return {
        ...s,
        response: {
          ...s.response,
          inputs: {
            ...s.response.inputs,
            [a.id]: a.value,
          },
        },
      };
    }

    case 'LOAD_SAMPLE': {
      const variant = getActiveVariant(s);
      const sample = variant.samples[a.which];
      return {
        ...s,
        response: structuredClone(sample),
      };
    }

    case 'SUBMIT_ATTEMPT': {
      const challenge = getActiveChallenge(s);
      const variant = getActiveVariant(s);
      const result = assess(challenge, variant, s.response);
      const attemptNumber = s.attempts.length + 1;
      const attempt: Attempt = {
        attemptNumber,
        variantId: s.variantId,
        response: structuredClone(s.response),
        result,
        timestamp: a.timestamp,
      };
      return {
        ...s,
        attempts: [...s.attempts, attempt],
      };
    }

    case 'RESET': {
      return createInitialState();
    }

    default: {
      const _exhaustive: never = a;
      return s;
    }
  }
}
