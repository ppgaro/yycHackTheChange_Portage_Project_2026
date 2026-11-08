import { describe, it, expect } from 'vitest';
import {
  suggestMappingsFromDuties,
  setMappingStatus,
  displaySkill,
  NO_MATCH_SKILL,
} from './experience';
import { DutyMapping } from '../types/domain';

describe('experience mapping', () => {
  it('maps multiple duties according to lexicon order', () => {
    const duties = [
      'Coordinated shift schedules, monitored inventory, and prepared daily performance reports.',
    ];
    const mappings = suggestMappingsFromDuties(duties, 'Target Role');
    expect(mappings.map((m) => m.transferableSkill)).toEqual([
      'Resource allocation & scheduling',
      'Inventory & variance tracking',
      'Operational reporting & KPI monitoring',
    ]);
  });

  it('handles empty duties or whitespace-only duties', () => {
    expect(suggestMappingsFromDuties([], 'Target Role')).toEqual([]);
    expect(suggestMappingsFromDuties(['', '   '], 'Target Role')).toEqual([]);
  });

  it('emits NO_MATCH_SKILL for unmatched duty', () => {
    const mappings = suggestMappingsFromDuties(['Played chess quietly in the corner.'], 'Target Role');
    expect(mappings).toHaveLength(1);
    expect(mappings[0].transferableSkill).toBe(NO_MATCH_SKILL);
    expect(mappings[0].whyItTransfers).toContain('Portage found no confident match');
  });

  it('caps matches at 3 per duty', () => {
    // Contains triggers for schedule, inventory, report, train, customer, budget
    const complexDuty =
      'Scheduled shifts, counted inventory, generated reports, trained new staff, helped customers, and managed budget.';
    const mappings = suggestMappingsFromDuties([complexDuty], 'Target Role');
    expect(mappings).toHaveLength(3);
  });

  it('is deterministic', () => {
    const duty = ['Tracked safety compliance logs and coordinated vendor deliveries.'];
    const run1 = suggestMappingsFromDuties(duty, 'Role A');
    const run2 = suggestMappingsFromDuties(duty, 'Role A');
    expect(run1).toEqual(run2);
  });

  it('updates mapping status, sets userEditedSkill, and clears it on accept', () => {
    const initial: DutyMapping[] = [
      {
        id: 'm1',
        sourceDuty: 'Managed shifts',
        transferableSkill: 'Scheduling',
        whyItTransfers: 'Why',
        status: 'suggested',
      },
    ];

    const edited = setMappingStatus(initial, 'm1', 'edited', 'Custom Schedule Master');
    expect(edited[0].status).toBe('edited');
    expect(edited[0].userEditedSkill).toBe('Custom Schedule Master');
    expect(displaySkill(edited[0])).toBe('Custom Schedule Master');

    const accepted = setMappingStatus(edited, 'm1', 'accepted');
    expect(accepted[0].status).toBe('accepted');
    expect(accepted[0].userEditedSkill).toBeUndefined();
    expect(displaySkill(accepted[0])).toBe('Scheduling');
  });
});
