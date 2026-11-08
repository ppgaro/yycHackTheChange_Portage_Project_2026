import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { rigtorack } from './rigtorack';
import { validateScenario } from '../../engine/scenario';
import { assess } from '../../engine/assessment';

describe('RigToRack scenario', () => {
  it('is a valid scenario', () => {
    expect(validateScenario(rigtorack)).toEqual([]);
  });

  it('takes facts from the real CSV', () => {
    const [jan, may] = rigtorack.challenges[0].variants;
    expect(jan.facts).toMatchObject({ peakPrice: 999.99, peakDemandMw: 11802, peakDemandHE: 18, hoursAtCap: 4 });
    expect(may.facts).toMatchObject({ peakPrice: 13.41, peakDemandMw: 9855, peakDemandHE: 14, hoursAtZero: 2 });
    expect(jan.table.rows).toHaveLength(6);
    expect(jan.source.kind).toBe('observed');
  });

  it.each(['jan-2024-cold', 'may-2024-spring'])('%s: baseline 0/4, revision 4/4', (id) => {
    const challenge = rigtorack.challenges[0];
    const variant = challenge.variants.find((v) => v.id === id)!;
    expect(variant).toBeDefined();

    const baselineResult = assess(challenge, variant, variant.samples.baseline);
    expect(baselineResult.score).toBe(0);
    expect(baselineResult.passed).toBe(false);

    const revisionResult = assess(challenge, variant, variant.samples.revision);
    expect(revisionResult.score).toBe(4);
    expect(revisionResult.passed).toBe(true);
  });

  it('a January-correct answer fails against May', () => {
    const challenge = rigtorack.challenges[0];
    const janVariant = challenge.variants.find((v) => v.id === 'jan-2024-cold')!;
    const mayVariant = challenge.variants.find((v) => v.id === 'may-2024-spring')!;

    const resultAgainstMay = assess(challenge, mayVariant, janVariant.samples.revision);
    const crit1 = resultAgainstMay.criteria.find((c) => c.criterionId === 'crit-r1')!;
    const crit4 = resultAgainstMay.criteria.find((c) => c.criterionId === 'crit-r4')!;
    expect(crit1.passed).toBe(false);
    expect(crit4.passed).toBe(false);
  });

  it('statement text matches the derived facts', () => {
    expect(rigtorack.challenges[0].variants[0].statements![1].text).toContain('11,802 MW in HE18');
  });

  it('contains no hand-typed AESO values', () => {
    const src = readFileSync(join(__dirname, 'rigtorack.ts'), 'utf8');
    expect(src).not.toMatch(/11802|11,802|999\.99|13\.41|9855|9,855/);
  });
});
