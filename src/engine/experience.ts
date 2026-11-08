import { DutyMapping, MappingStatus } from '../types/domain';

export const NO_MATCH_SKILL = 'Needs your input';

interface LexiconEntry {
  pattern: RegExp;
  skill: string;
  why: string;
}

const LEXICON: LexiconEntry[] = [
  {
    pattern: /schedul|roster|shift/i,
    skill: 'Resource allocation & scheduling',
    why: 'Scheduling people against demand is resource allocation.',
  },
  {
    pattern: /inventor|stock|waste|supplies/i,
    skill: 'Inventory & variance tracking',
    why: 'Tracking stock and waste is variance analysis.',
  },
  {
    pattern: /report|kpi|metric|sales|numbers|readings/i,
    skill: 'Operational reporting & KPI monitoring',
    why: 'Preparing performance numbers is KPI reporting.',
  },
  {
    pattern: /train|onboard|mentor|coach|teach/i,
    skill: 'Training & knowledge transfer',
    why: 'Teaching a process is knowledge transfer.',
  },
  {
    pattern: /customer|guest|client|complain|patient|student/i,
    skill: 'Stakeholder communication',
    why: "Handling people's issues is stakeholder communication.",
  },
  {
    pattern: /budget|cost|cash|payroll|invoice/i,
    skill: 'Budget awareness & cost control',
    why: 'Managing money flows is cost control.',
  },
  {
    pattern: /coordinat|vendor|supplier|deliver|logistic|maintenance/i,
    skill: 'Process & vendor coordination',
    why: 'Coordinating work and suppliers is process coordination.',
  },
  {
    pattern: /safety|complian|audit|inspect|quality|incident/i,
    skill: 'Compliance & incident documentation',
    why: 'Checking against a standard and recording events is quality assurance.',
  },
];

export function suggestMappingsFromDuties(
  duties: string[],
  targetRole: string
): DutyMapping[] {
  const cleanDuties = duties.map((d) => d.trim()).filter(Boolean);
  const mappings: DutyMapping[] = [];

  cleanDuties.forEach((duty, dIdx) => {
    const dNum = dIdx + 1;
    let matchCount = 0;

    for (const entry of LEXICON) {
      if (entry.pattern.test(duty)) {
        matchCount++;
        mappings.push({
          id: `custom-${dNum}-${matchCount}`,
          sourceDuty: duty,
          transferableSkill: entry.skill,
          whyItTransfers: `${entry.why} This is a suggestion for ${targetRole || 'your target role'}. Confirm or edit it.`,
          status: 'suggested',
        });
        if (matchCount >= 3) {
          break;
        }
      }
    }

    if (matchCount === 0) {
      mappings.push({
        id: `custom-${dNum}-none`,
        sourceDuty: duty,
        transferableSkill: NO_MATCH_SKILL,
        whyItTransfers:
          'Portage found no confident match for this duty. Describe the skill in your own words.',
        status: 'suggested',
      });
    }
  });

  return mappings;
}

export function setMappingStatus(
  mappings: DutyMapping[],
  id: string,
  status: MappingStatus,
  editedSkill?: string
): DutyMapping[] {
  return mappings.map((m) => {
    if (m.id !== id) return m;
    if (status === 'edited') {
      return {
        ...m,
        status,
        userEditedSkill: editedSkill,
      };
    }
    return {
      ...m,
      status,
      userEditedSkill: undefined,
    };
  });
}

export function displaySkill(m: DutyMapping): string {
  return m.status === 'edited' && m.userEditedSkill
    ? m.userEditedSkill
    : m.transferableSkill;
}
