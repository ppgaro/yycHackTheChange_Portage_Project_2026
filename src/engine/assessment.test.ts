import { describe, it, expect } from 'vitest';
import { Challenge, ChallengeVariant } from '../types/domain';
import { assess, parseNumberInput, compareAttempts } from './assessment';
import { selectLessons } from './microlearning';

const fixtureChallenge: Challenge = {
  id: 'test-challenge',
  gapId: 'gap-1',
  title: 'Test Challenge',
  roleContext: 'Junior analyst',
  prompt: 'Provide briefing',
  estimatedMinutes: 5,
  fields: [
    { kind: 'number', id: 'peak', label: 'Peak demand', unit: 'MW' },
    { kind: 'choice', id: 'step', label: 'Next step', options: [{ id: 'a', label: 'Option A' }, { id: 'b', label: 'Option B' }] },
    { kind: 'classify', id: 'statements', label: 'Statements' },
    { kind: 'text', id: 'text', label: 'Your briefing', rows: 4 },
  ],
  variants: [
    {
      id: 'v1',
      label: 'Variant 1',
      assumptions: 'Assumptions text',
      table: {
        caption: 'Table',
        columns: [{ key: 'c', label: 'Col' }],
        rows: [],
      },
      source: { kind: 'observed', name: 'AESO', limitations: 'None' },
      facts: { peak: 11802, date: '(January 13,? 2024|2024-01-13)' },
      statements: [
        { id: 's1', text: 'Statement 1', shownByData: true },
        { id: 's2', text: 'Statement 2', shownByData: false },
      ],
      samples: {
        baseline: { text: '', inputs: {} },
        revision: { text: '', inputs: {} },
      },
    },
  ],
  criteria: [
    {
      id: 'c1',
      title: 'Peak demand measurement',
      description: 'Records peak demand and unit',
      rules: [
        { kind: 'numberMatchesFact', input: 'peak', fact: 'peak', tolerance: 0.5 },
        { kind: 'textAll', patterns: ['\\bMW\\b'] },
      ],
      passFeedback: 'C1 passed',
      failFeedback: 'C1 failed',
    },
    {
      id: 'c2',
      title: 'Analytical rigor',
      description: 'Sorts statements and avoids unsupported causes',
      rules: [
        { kind: 'statementsClassified' },
        { kind: 'textNone', patterns: ['\\bbecause of\\b'] },
      ],
      passFeedback: 'C2 passed',
      failFeedback: 'C2 failed',
    },
    {
      id: 'c3',
      title: 'Actionable next step',
      description: 'Selects the right step and writes enough words',
      rules: [
        { kind: 'choiceEquals', input: 'step', expected: 'a' },
        { kind: 'minWords', min: 5 },
      ],
      passFeedback: 'C3 passed',
      failFeedback: 'C3 failed',
    },
    {
      id: 'c4',
      title: 'Source transparency',
      description: 'Cites AESO and date',
      rules: [
        { kind: 'textAll', patterns: ['\\bAESO\\b'] },
        { kind: 'textMatchesFact', fact: 'date' },
      ],
      passFeedback: 'C4 passed',
      failFeedback: 'C4 failed',
    },
  ],
  lessons: {
    c1: { title: 'Lesson 1', keyRule: 'R1', instead: 'I1', tryThis: 'T1', tip: 'Tip 1', readTime: '45 sec' },
    c2: { title: 'Lesson 2', keyRule: 'R2', instead: 'I2', tryThis: 'T2', tip: 'Tip 2', readTime: '45 sec' },
    c3: { title: 'Lesson 3', keyRule: 'R3', instead: 'I3', tryThis: 'T3', tip: 'Tip 3', readTime: '45 sec' },
    c4: { title: 'Lesson 4', keyRule: 'R4', instead: 'I4', tryThis: 'T4', tip: 'Tip 4', readTime: '45 sec' },
  },
};

const v1: ChallengeVariant = fixtureChallenge.variants[0];

describe('assessment engine', () => {
  it('passes a fully correct response 4/4', () => {
    const result = assess(fixtureChallenge, v1, {
      text: 'AESO data for January 13, 2024 shows 11802 MW peak.',
      inputs: {
        peak: '11,802',
        step: 'a',
        'statements:s1': 'shown',
        'statements:s2': 'not-shown',
      },
    });
    expect(result.score).toBe(4);
    expect(result.maxScore).toBe(4);
    expect(result.passed).toBe(true);
    expect(result.criteria.every((c) => c.passed)).toBe(true);
  });

  it('treats blank inputs as not answered, no throw', () => {
    const result = assess(fixtureChallenge, v1, {
      text: '',
      inputs: {},
    });
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
    const c1 = result.criteria.find((c) => c.criterionId === 'c1');
    expect(c1?.notes.some((n) => n.includes('not answered'))).toBe(true);
  });

  it('accepts formatted numbers', () => {
    expect(parseNumberInput(' $1,234.5 ')).toBe(1234.5);
    expect(parseNumberInput('')).toBeNull();
    expect(parseNumberInput('abc')).toBeNull();
  });

  it('does not reveal the correct number in notes', () => {
    const result = assess(fixtureChallenge, v1, {
      text: '',
      inputs: { peak: '100' },
    });
    const c1 = result.criteria.find((c) => c.criterionId === 'c1');
    const combinedNotes = c1?.notes.join(' ') || '';
    expect(combinedNotes).not.toContain('11802');
  });

  it('fails C2 when text asserts a cause even if statements are right', () => {
    const result = assess(fixtureChallenge, v1, {
      text: 'Peak happened because of high demand.',
      inputs: {
        'statements:s1': 'shown',
        'statements:s2': 'not-shown',
      },
    });
    const c2 = result.criteria.find((c) => c.criterionId === 'c2');
    expect(c2?.passed).toBe(false);
    expect(c2?.notes.some((n) => n.includes('because of'))).toBe(true);
  });

  it('scores a partial answer', () => {
    const result = assess(fixtureChallenge, v1, {
      text: 'We saw 100 MW of power during this shift right now.',
      inputs: {
        peak: '11802',
        step: 'a',
      },
    });
    expect(result.score).toBe(2); // C1 and C3 pass
    expect(result.criteria.find((c) => c.criterionId === 'c1')?.passed).toBe(true);
    expect(result.criteria.find((c) => c.criterionId === 'c2')?.passed).toBe(false);
    expect(result.criteria.find((c) => c.criterionId === 'c3')?.passed).toBe(true);
    expect(result.criteria.find((c) => c.criterionId === 'c4')?.passed).toBe(false);
  });

  it('selectLessons returns failed criteria only and [] when all pass', () => {
    const partial = assess(fixtureChallenge, v1, {
      text: 'We saw 100 MW of power during this shift right now.',
      inputs: { peak: '11802', step: 'a' },
    });
    const lessons = selectLessons(fixtureChallenge, partial);
    expect(lessons.map((l) => l.criterionId)).toEqual(['c2', 'c4']);

    const full = assess(fixtureChallenge, v1, {
      text: 'AESO data for January 13, 2024 shows 11802 MW peak.',
      inputs: {
        peak: '11,802',
        step: 'a',
        'statements:s1': 'shown',
        'statements:s2': 'not-shown',
      },
    });
    expect(selectLessons(fixtureChallenge, full)).toEqual([]);
  });

  it('compareAttempts labels gained/kept/still-missing', () => {
    const first = assess(fixtureChallenge, v1, {
      text: '',
      inputs: {},
    }); // 0/4
    const latest = assess(fixtureChallenge, v1, {
      text: 'We saw 100 MW of power during this shift right now.',
      inputs: { peak: '11802', step: 'a' },
    }); // C1 and C3 pass
    const changes = compareAttempts(first, latest);
    expect(changes).toEqual([
      { criterionId: 'c1', change: 'gained' },
      { criterionId: 'c2', change: 'still-missing' },
      { criterionId: 'c3', change: 'gained' },
      { criterionId: 'c4', change: 'still-missing' },
    ]);
  });
});
