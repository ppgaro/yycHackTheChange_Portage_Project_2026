import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_GA_MEASUREMENT_ID,
  getGaMeasurementId,
  sanitizeAnalyticsParams,
  trackStepView,
  trackScenarioSelected,
  trackSkillsAnalyzed,
  trackPracticeAttempt,
  trackEvidenceExport,
  trackGaEvent,
} from './ga4';

describe('GA4 privacy-safe analytics module', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.dataLayer = [];
      window.gtag = (...args: unknown[]) => {
        window.dataLayer!.push(args);
      };
    }
  });

  it('provides the verified default Measurement ID', () => {
    expect(getGaMeasurementId()).toBe(DEFAULT_GA_MEASUREMENT_ID);
    expect(DEFAULT_GA_MEASUREMENT_ID).toBe('G-L9B7ME5TWL');
  });

  it('strips all forbidden free-text user fields from analytics payloads', () => {
    const raw = {
      scenario_id: 'rigtorack',
      dutiesInput: 'My private workplace duties at facility X',
      currentRole: 'Senior Shift Supervisor at Company Y',
      targetRole: 'Energy Analyst',
      text: 'During HE15-HE20 pool price reached $999.99/MWh...',
      inputs: { peakHour: 'HE18' },
      editedSkill: 'Custom skill name',
      mapped_count: 4,
    };

    const sanitized = sanitizeAnalyticsParams(raw);
    expect(sanitized).toEqual({
      scenario_id: 'rigtorack',
      mapped_count: 4,
    });
    expect(sanitized).not.toHaveProperty('dutiesInput');
    expect(sanitized).not.toHaveProperty('currentRole');
    expect(sanitized).not.toHaveProperty('targetRole');
    expect(sanitized).not.toHaveProperty('text');
    expect(sanitized).not.toHaveProperty('inputs');
    expect(sanitized).not.toHaveProperty('editedSkill');
  });

  it('truncates unexpectedly long string parameters and removes newlines', () => {
    const longString = 'a'.repeat(120) + '\nsecond line';
    const sanitized = trackGaEvent('custom_event', {
      safe_label: longString,
    });
    expect(typeof sanitized.safe_label).toBe('string');
    expect((sanitized.safe_label as string).length).toBe(64);
    expect(sanitized.safe_label).not.toContain('\n');
  });

  it('builds structured funnel events for step views, skills, practice, and evidence export', () => {
    const stepPayload = trackStepView('practice', 'rigtorack');
    expect(stepPayload).toEqual({
      step_name: 'practice',
      step_index: 5,
      scenario_id: 'rigtorack',
      page_path: '/?scenario=rigtorack&step=practice',
    });

    const scenarioPayload = trackScenarioSelected('hospitality-bi', 'preset');
    expect(scenarioPayload).toEqual({
      scenario_id: 'hospitality-bi',
      entry_mode: 'preset',
    });

    const skillsPayload = trackSkillsAnalyzed('rigtorack', 4, 1);
    expect(skillsPayload).toEqual({
      scenario_id: 'rigtorack',
      mapped_count: 4,
      unmatched_count: 1,
    });

    const practicePayload = trackPracticeAttempt('rigtorack', 2, 4, 4);
    expect(practicePayload).toEqual({
      scenario_id: 'rigtorack',
      attempt_number: 2,
      criteria_met: 4,
      criteria_total: 4,
      objective_demonstrated: true,
    });

    const exportPayload = trackEvidenceExport('rigtorack', 'markdown', 2);
    expect(exportPayload).toEqual({
      scenario_id: 'rigtorack',
      export_format: 'markdown',
      attempts_count: 2,
    });
  });
});
