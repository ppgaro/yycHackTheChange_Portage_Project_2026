import { describe, it, expect } from 'vitest';
import {
  buildEvidenceRecord,
  buildEvidenceMarkdown,
  getEvidenceLevel,
  EVIDENCE_DISCLAIMER,
  ASSESSMENT_LIMITS,
} from './evidence';
import { createInitialState, portageReducer } from '../state/portage';

describe('evidence engine', () => {
  it('before any attempt, practice is null, markdown has No practice attempt yet, no 4/4 in json', () => {
    const s = createInitialState();
    const record = buildEvidenceRecord(s, '2026-11-07T12:00:00Z');
    expect(record.practice).toBeNull();

    const json = JSON.stringify(record);
    expect(json).not.toContain('4/4');

    const md = buildEvidenceMarkdown(record);
    expect(md.startsWith('# Portage practice evidence')).toBe(true);
    expect(md).toContain('No practice attempt yet');
  });

  it('with every mapping rejected, confirmedSkills is [], markdown has None confirmed yet and disclaimer', () => {
    let s = createInitialState();
    s = portageReducer(s, { type: 'START_SCENARIO', scenarioId: 'rigtorack' });
    s = portageReducer(s, { type: 'ANALYZE' });
    for (const m of s.mappings) {
      s = portageReducer(s, { type: 'SET_MAPPING_STATUS', id: m.id, status: 'rejected' });
    }

    const record = buildEvidenceRecord(s, '2026-11-07T12:00:00Z');
    expect(record.confirmedSkills).toEqual([]);

    const md = buildEvidenceMarkdown(record);
    expect(md).toContain('None confirmed yet');
    expect(md).toContain(EVIDENCE_DISCLAIMER);
  });

  it('after RigToRack golden path, evidence record and markdown reflect authentic progress', () => {
    let s = createInitialState();
    s = portageReducer(s, { type: 'START_SCENARIO', scenarioId: 'rigtorack' });
    s = portageReducer(s, { type: 'ANALYZE' });
    s = portageReducer(s, { type: 'ACCEPT_ALL_SUGGESTED' });
    s = portageReducer(s, { type: 'GO_TO', step: 'practice' });
    s = portageReducer(s, { type: 'LOAD_SAMPLE', which: 'baseline' });
    s = portageReducer(s, { type: 'SUBMIT_ATTEMPT', timestamp: '2026-11-07T12:00:00Z' });
    s = portageReducer(s, { type: 'LOAD_SAMPLE', which: 'revision' });
    s = portageReducer(s, { type: 'SUBMIT_ATTEMPT', timestamp: '2026-11-07T12:05:00Z' });

    const record = buildEvidenceRecord(s, '2026-11-07T12:10:00Z');
    expect(record.practice).toMatchObject({
      attempts: 2,
      firstScore: '0/4',
      latestScore: '4/4',
      objectiveDemonstrated: true,
    });

    const m1 = s.mappings.find((m) => m.id === 'rig-m1')!;
    const m2 = s.mappings.find((m) => m.id === 'rig-m2')!;
    const m3 = s.mappings.find((m) => m.id === 'rig-m3')!;
    const m4 = s.mappings.find((m) => m.id === 'rig-m4')!;

    expect(getEvidenceLevel(m1, s)).toBe('confirmed');
    expect(getEvidenceLevel(m2, s)).toBe('demonstrated');
    expect(getEvidenceLevel(m3, s)).toBe('confirmed');
    expect(getEvidenceLevel(m4, s)).toBe('demonstrated');

    expect(record.source?.kind).toBe('observed');

    const md = buildEvidenceMarkdown(record);
    expect(md).toContain('**Practice objective demonstrated.**');
    expect(md).toContain('AESO');
    expect(md).toContain('HE15–HE20');
    expect(md).not.toMatch(/\b(certified|verified skill|mastery|competen)/i);
  });

  it('after hospitality golden path, source.kind is fictional', () => {
    let s = createInitialState();
    s = portageReducer(s, { type: 'START_SCENARIO', scenarioId: 'hospitality-bi' });
    s = portageReducer(s, { type: 'ANALYZE' });
    s = portageReducer(s, { type: 'ACCEPT_ALL_SUGGESTED' });
    s = portageReducer(s, { type: 'GO_TO', step: 'practice' });
    s = portageReducer(s, { type: 'LOAD_SAMPLE', which: 'revision' });
    s = portageReducer(s, { type: 'SUBMIT_ATTEMPT', timestamp: '2026-11-07T12:00:00Z' });

    const record = buildEvidenceRecord(s, '2026-11-07T12:10:00Z');
    expect(record.source?.kind).toBe('fictional');
  });
});
