import { describe, it, expect } from 'vitest';
import { validateScenario } from './scenario';
import { Scenario } from '../types/domain';

const valid: Scenario = {
  id: 'test-scenario',
  badge: 'Test',
  featured: false,
  from: 'Role A',
  to: 'Role B',
  summary: 'Summary text.',
  defaultDuties: ['duty 1'],
  mappings: [
    {
      id: 'm1',
      sourceDuty: 'duty 1',
      transferableSkill: 'Skill 1',
      whyItTransfers: 'Transfers because...',
      status: 'suggested',
    },
  ],
  gaps: [
    {
      id: 'g1',
      name: 'Gap 1',
      description: 'Gap 1 desc',
      relevance: 3,
      prerequisiteFor: [],
      supportedByMappingIds: ['m1'],
      challengeId: 'c1',
      whyItMatters: 'Matters because...',
      whyThisTask: 'Why this task...',
    },
  ],
  challenges: [
    {
      id: 'c1',
      gapId: 'g1',
      title: 'Challenge 1',
      roleContext: 'Junior analyst',
      prompt: 'Do something',
      estimatedMinutes: 5,
      fields: [{ kind: 'text', id: 'text', label: 'Answer', rows: 4 }],
      variants: [
        {
          id: 'v1',
          label: 'Variant 1',
          assumptions: 'Assumptions',
          table: {
            caption: 'Table',
            columns: [{ key: 'col1', label: 'Col 1' }],
            rows: [{ col1: 'val1' }],
          },
          source: {
            kind: 'fictional',
            name: 'Demo data',
            limitations: 'None',
          },
          facts: {},
          samples: {
            baseline: { text: 'baseline', inputs: {} },
            revision: { text: 'revision', inputs: {} },
          },
        },
      ],
      criteria: [
        { id: 'crit1', title: 'C1', description: 'Desc 1', rules: [{ kind: 'minWords', min: 1 }], passFeedback: 'Pass', failFeedback: 'Fail' },
        { id: 'crit2', title: 'C2', description: 'Desc 2', rules: [{ kind: 'minWords', min: 1 }], passFeedback: 'Pass', failFeedback: 'Fail' },
        { id: 'crit3', title: 'C3', description: 'Desc 3', rules: [{ kind: 'minWords', min: 1 }], passFeedback: 'Pass', failFeedback: 'Fail' },
        { id: 'crit4', title: 'C4', description: 'Desc 4', rules: [{ kind: 'minWords', min: 1 }], passFeedback: 'Pass', failFeedback: 'Fail' },
      ],
      lessons: {
        crit1: { title: 'L1', keyRule: 'R1', instead: 'I1', tryThis: 'T1', tip: 'Tip 1', readTime: '1 min' },
        crit2: { title: 'L2', keyRule: 'R2', instead: 'I2', tryThis: 'T2', tip: 'Tip 2', readTime: '1 min' },
        crit3: { title: 'L3', keyRule: 'R3', instead: 'I3', tryThis: 'T3', tip: 'Tip 3', readTime: '1 min' },
        crit4: { title: 'L4', keyRule: 'R4', instead: 'I4', tryThis: 'T4', tip: 'Tip 4', readTime: '1 min' },
      },
    },
  ],
};

describe('validateScenario', () => {
  it('accepts a valid scenario', () => expect(validateScenario(valid)).toEqual([]));
  it('reports a missing lesson', () => {
    const s = structuredClone(valid);
    delete (s.challenges[0].lessons as Record<string, unknown>)[s.challenges[0].criteria[0].id];
    expect(validateScenario(s).join('\n')).toMatch(/lesson/);
  });
  it('reports a fact missing from a variant', () => {
    const s = structuredClone(valid);
    s.challenges[0].fields.push({ kind: 'number', id: 'n', label: 'N', unit: 'MW' });
    s.challenges[0].criteria[0].rules = [{ kind: 'numberMatchesFact', input: 'n', fact: 'nope', tolerance: 0 }];
    expect(validateScenario(s).join('\n')).toMatch(/nope/);
  });
  it('reports an invalid regex', () => {
    const s = structuredClone(valid);
    s.challenges[0].criteria[0].rules = [{ kind: 'textAll', patterns: ['('] }];
    expect(validateScenario(s).join('\n')).toMatch(/regex/i);
  });
  it('reports a gap pointing at a missing challenge', () => {
    const s = structuredClone(valid);
    s.gaps[0].challengeId = 'ghost';
    expect(validateScenario(s).join('\n')).toMatch(/ghost/);
  });
});
