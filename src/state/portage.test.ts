import { describe, it, expect } from 'vitest';
import {
  createInitialState,
  portageReducer,
  getScenarioOf,
  getGapRanking,
  getActiveChallenge,
  getActiveVariant,
  getLatestAttempt,
  isPracticeComplete,
  STEPS,
} from './portage';

describe('portage state reducer', () => {
  it('RigToRack golden path: fail then pass, then the gap is demonstrated', () => {
    let s = createInitialState();
    expect(s.step).toBe('welcome');

    s = portageReducer(s, { type: 'START_SCENARIO', scenarioId: 'rigtorack' });
    expect(s.step).toBe('intake');

    s = portageReducer(s, { type: 'ANALYZE' });
    expect(s.step).toBe('skills');

    s = portageReducer(s, { type: 'ACCEPT_ALL_SUGGESTED' });
    expect(s.mappings.every((m) => m.status === 'accepted')).toBe(true);

    s = portageReducer(s, { type: 'GO_TO', step: 'practice' });
    expect(s.step).toBe('practice');

    // First attempt: baseline (fails)
    s = portageReducer(s, { type: 'LOAD_SAMPLE', which: 'baseline' });
    s = portageReducer(s, { type: 'SUBMIT_ATTEMPT', timestamp: '2026-11-07T12:00:00Z' });
    expect(s.attempts).toHaveLength(1);
    expect(s.attempts[0].result.score).toBe(0);
    expect(isPracticeComplete(s)).toBe(false);

    // Second attempt: revision (passes)
    s = portageReducer(s, { type: 'LOAD_SAMPLE', which: 'revision' });
    s = portageReducer(s, { type: 'SUBMIT_ATTEMPT', timestamp: '2026-11-07T12:05:00Z' });
    expect(s.attempts).toHaveLength(2);
    expect(s.attempts[1].result.score).toBe(4);
    expect(isPracticeComplete(s)).toBe(true);

    const ranking = getGapRanking(s);
    expect(ranking.recommended).toBeNull();
    expect(ranking.ranked[0].demonstrated).toBe(true);
  });

  it('hospitality runs on the same reducer', () => {
    let s = createInitialState();
    s = portageReducer(s, { type: 'START_SCENARIO', scenarioId: 'hospitality-bi' });
    s = portageReducer(s, { type: 'ANALYZE' });
    s = portageReducer(s, { type: 'ACCEPT_ALL_SUGGESTED' });
    s = portageReducer(s, { type: 'GO_TO', step: 'practice' });
    s = portageReducer(s, { type: 'LOAD_SAMPLE', which: 'revision' });
    s = portageReducer(s, { type: 'SUBMIT_ATTEMPT', timestamp: '2026-11-07T12:00:00Z' });
    expect(s.attempts).toHaveLength(1);
    expect(s.attempts[0].result.score).toBe(4);
    expect(isPracticeComplete(s)).toBe(true);
  });

  it('SELECT_VARIANT clears attempts and response', () => {
    let s = createInitialState();
    s = portageReducer(s, { type: 'SET_TEXT', text: 'Some response' });
    s = portageReducer(s, { type: 'SUBMIT_ATTEMPT', timestamp: '2026-11-07T12:00:00Z' });
    expect(s.attempts).toHaveLength(1);

    s = portageReducer(s, { type: 'SELECT_VARIANT', variantId: 'may-2024-spring' });
    expect(s.variantId).toBe('may-2024-spring');
    expect(s.attempts).toEqual([]);
    expect(s.response).toEqual({ text: '', inputs: {} });
  });

  it('empty submission records 0/4 without throwing', () => {
    let s = createInitialState();
    s = portageReducer(s, { type: 'SUBMIT_ATTEMPT', timestamp: '2026-11-07T12:00:00Z' });
    expect(s.attempts).toHaveLength(1);
    expect(s.attempts[0].result.score).toBe(0);
  });

  it('RESET returns exactly createInitialState()', () => {
    let s = createInitialState();
    s = portageReducer(s, { type: 'START_SCENARIO', scenarioId: 'hospitality-bi' });
    s = portageReducer(s, { type: 'RESET' });
    expect(s).toEqual(createInitialState());
  });

  it('START_SCENARIO mid-practice clears attempts', () => {
    let s = createInitialState();
    s = portageReducer(s, { type: 'SUBMIT_ATTEMPT', timestamp: '2026-11-07T12:00:00Z' });
    expect(s.attempts).toHaveLength(1);

    s = portageReducer(s, { type: 'START_SCENARIO', scenarioId: 'rigtorack' });
    expect(s.attempts).toEqual([]);
    expect(s.step).toBe('intake');
  });

  it('custom duties -> suggested mappings; empty -> []', () => {
    let s = createInitialState();
    s = portageReducer(s, { type: 'START_BLANK' });
    expect(s.dutiesInput).toBe('');
    expect(s.mappings).toEqual([]);

    s = portageReducer(s, {
      type: 'SET_FIELD',
      field: 'dutiesInput',
      value: 'Coordinated shifts and managed inventory',
    });
    s = portageReducer(s, { type: 'ANALYZE' });
    expect(s.mappings.length).toBeGreaterThan(0);
    expect(s.mappings[0].id).toContain('custom-');

    s = portageReducer(s, {
      type: 'SET_FIELD',
      field: 'dutiesInput',
      value: '',
    });
    s = portageReducer(s, { type: 'ANALYZE' });
    expect(s.mappings).toEqual([]);
  });

  it('NEXT/BACK clamp at the ends', () => {
    let s = createInitialState();
    expect(s.step).toBe('welcome');

    s = portageReducer(s, { type: 'BACK' });
    expect(s.step).toBe('welcome');

    // Step through to the end
    s = portageReducer(s, { type: 'GO_TO', step: 'evidence' });
    expect(s.step).toBe('evidence');
    s = portageReducer(s, { type: 'NEXT' });
    expect(s.step).toBe('evidence');
  });
});
