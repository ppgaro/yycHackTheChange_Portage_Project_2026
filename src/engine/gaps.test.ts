import { describe, it, expect } from 'vitest';
import { prioritizeGaps } from './gaps';
import { rigtorack } from '../data/scenarios/rigtorack';

describe('gaps prioritization', () => {
  it('recommends the energy-data skill for RigToRack with confirmed support', () => {
    const m = rigtorack.mappings.map((x) => ({ ...x, status: 'accepted' as const }));
    const { recommended, ranked } = prioritizeGaps(rigtorack, m, []);
    expect(recommended?.gap.id).toBe('rig-g1');
    expect(recommended?.score).toBe(15); // 3*3 + 2*2 + 2 = 15
    expect(recommended?.reasons).toEqual([
      'Relevance to Energy & Grid Operations Analyst: 3/3',
      'Unlocks 2 later skill(s)',
      'Builds on 2 skill(s) you confirmed',
      'Has a practice task ready',
    ]);
    expect(ranked.map((r) => r.gap.id)).toEqual(['rig-g1', 'rig-g2', 'rig-g3']);
  });

  it('support only counts confirmed mappings', () => {
    expect(prioritizeGaps(rigtorack, rigtorack.mappings, []).recommended?.score).toBe(13);
  });

  it('returns null once the only practice task is demonstrated', () => {
    expect(prioritizeGaps(rigtorack, rigtorack.mappings, ['rig-g1']).recommended).toBeNull();
  });
});
