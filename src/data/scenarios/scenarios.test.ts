import { describe, it, expect } from 'vitest';
import { SCENARIOS, getScenario } from './index';
import { validateScenario } from '../../engine/scenario';
import { assess } from '../../engine/assessment';

describe('SCENARIOS suite', () => {
  it('lists RigToRack first and featured', () => {
    expect(SCENARIOS.map((s) => s.id)).toEqual([
      'rigtorack',
      'hospitality-bi',
      'retail-pm',
      'admin-uxr',
    ]);
    expect(SCENARIOS.filter((s) => s.featured).map((s) => s.id)).toEqual([
      'rigtorack',
    ]);
  });

  it.each(SCENARIOS.map((s) => [s.id, s] as const))(
    '%s is valid',
    (_id, s) => {
      expect(validateScenario(s)).toEqual([]);
    }
  );

  it.each(SCENARIOS.map((s) => [s.id, s] as const))(
    '%s: every variant baseline fails, revision passes',
    (_id, s) => {
      for (const c of s.challenges) {
        for (const v of c.variants) {
          const baseline = assess(c, v, v.samples.baseline);
          expect(baseline.score).toBe(0);
          expect(baseline.passed).toBe(false);

          const revision = assess(c, v, v.samples.revision);
          expect(revision.score).toBe(4);
          expect(revision.passed).toBe(true);
        }
      }
    }
  );

  it('hospitality crit-1 needs a change word', () => {
    const hosp = getScenario('hospitality-bi')!;
    const challenge = hosp.challenges[0];
    const variant = challenge.variants[0];

    const withoutChangeWord = assess(challenge, variant, {
      text: 'Waste was 14% this weekend.',
      inputs: {},
    });
    const crit1Without = withoutChangeWord.criteria.find((c) => c.criterionId === 'crit-1')!;
    expect(crit1Without.passed).toBe(false);

    const withChangeWord = assess(challenge, variant, {
      text: 'Waste increased by 14% this weekend.',
      inputs: {},
    });
    const crit1With = withChangeWord.criteria.find((c) => c.criterionId === 'crit-1')!;
    expect(crit1With.passed).toBe(true);
  });

  it('no overclaiming words in any scenario', () => {
    expect(JSON.stringify(SCENARIOS)).not.toMatch(
      /\b(Mastered|Verified|Certified|certification|zero synthetic)\b/
    );
  });
});
